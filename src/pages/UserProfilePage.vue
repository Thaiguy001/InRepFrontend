<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="card-header">
        <div class="header-icon">
          <i class="pi pi-user"></i>
        </div>
        <div>
          <h2 class="card-title">My Profile</h2>
          <p class="card-subtitle">Manage your personal information</p>
        </div>
      </div>

      <div v-if="state.loading" class="loading-state">
        <ProgressSpinner strokeWidth="3" />
      </div>

      <Message v-else-if="state.error" severity="error" :closable="false">
        {{ state.error }}
      </Message>

      <form v-else @submit.prevent="saveProfile" class="profile-form">
        <div class="form-section">
          <h3 class="section-label">Account</h3>
          <div class="field">
            <label for="email" class="field-label">Email</label>
            <div class="input-wrapper disabled">
              <i class="pi pi-envelope input-icon"></i>
              <InputText id="email" v-model="form.email" disabled class="w-full styled-input" />
            </div>
            <small class="field-hint">Email cannot be changed</small>
          </div>

          <div class="field">
            <label for="username" class="field-label">Username</label>
            <div class="input-wrapper">
              <i class="pi pi-at input-icon"></i>
              <InputText id="username" v-model="form.username" class="w-full styled-input" placeholder="Enter a username" />
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="form-section">
          <h3 class="section-label">Personal Details</h3>
          <div class="field-row">
            <div class="field">
              <label for="first_name" class="field-label">First Name</label>
              <InputText id="first_name" v-model="form.first_name" class="w-full styled-input" placeholder="First name" />
            </div>
            <div class="field">
              <label for="last_name" class="field-label">Last Name</label>
              <InputText id="last_name" v-model="form.last_name" class="w-full styled-input" placeholder="Last name" />
            </div>
          </div>

          <div class="field">
            <label for="phone_number" class="field-label">Phone Number</label>
            <div class="input-wrapper">
              <i class="pi pi-phone input-icon"></i>
              <InputText id="phone_number" v-model="form.phone_number" class="w-full styled-input" placeholder="Phone number" />
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="form-section">
          <h3 class="section-label">Access</h3>
          <div class="field">
            <label for="role" class="field-label">Role</label>
            <div class="input-wrapper disabled">
              <i class="pi pi-shield input-icon"></i>
              <InputText id="role" v-model="form.role" disabled class="w-full styled-input" />
            </div>
            <small class="field-hint">Contact an administrator to change your role</small>
          </div>
        </div>

        <div class="form-actions">
          <Button
            type="button"
            label="Cancel"
            icon="pi pi-times"
            severity="secondary"
            :disabled="!hasChanges"
            @click="resetForm"
            class="btn-cancel"
          />
          <Button
            type="submit"
            label="Save Changes"
            icon="pi pi-check"
            :loading="state.saving"
            :disabled="!hasChanges"
            class="btn-save"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import { UserService } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useToastHelperService } from '@/services/toastHelperService'
import { type User } from '@/api/generated/models/User'

const authStore = useAuthStore()
const { showSuccess, showError } = useToastHelperService()

const state = reactive({
  loading: false,
  saving: false,
  error: null as string | null,
})

const form = reactive({
  email: '',
  username: '',
  first_name: '',
  last_name: '',
  phone_number: '',
  role: '',
})

const originalForm = ref({
  username: '',
  first_name: '',
  last_name: '',
  phone_number: '',
})

const hasChanges = computed(() => {
  return (
    form.username !== originalForm.value.username ||
    form.first_name !== originalForm.value.first_name ||
    form.last_name !== originalForm.value.last_name ||
    form.phone_number !== originalForm.value.phone_number
  )
})

onMounted(() => {
  loadFromStore()
})

function loadFromStore() {
  const user = authStore.appUser
  if (!user) {
    state.error = 'User not found'
    return
  }
  form.email = user.email || ''
  form.username = user.username || ''
  form.first_name = user.first_name || ''
  form.last_name = user.last_name || ''
  form.phone_number = user.phone_number || ''
  form.role = user.role || ''
  originalForm.value = {
    username: form.username,
    first_name: form.first_name,
    last_name: form.last_name,
    phone_number: form.phone_number,
  }
}

async function saveProfile() {
  state.saving = true
  try {
    const updatedUser = await UserService.putApiV1UsersMe({
      username: form.username || null,
      first_name: form.first_name || null,
      last_name: form.last_name || null,
      phone_number: form.phone_number || null,
    })
    originalForm.value = {
      username: form.username,
      first_name: form.first_name,
      last_name: form.last_name,
      phone_number: form.phone_number,
    }
    authStore.appUser = updatedUser as User
    showSuccess('Profile updated successfully')
  } catch (error: any) {
    console.error('Error saving profile:', error)
    showError(error?.message || 'Failed to save profile')
  } finally {
    state.saving = false
  }
}

function resetForm() {
  form.username = originalForm.value.username
  form.first_name = originalForm.value.first_name
  form.last_name = originalForm.value.last_name
  form.phone_number = originalForm.value.phone_number
}
</script>

<style scoped>
/* ── Light mode tokens ── */
.profile-container {
  --bg-page:        #f0f2f9;
  --bg-card:        #ffffff;
  --bg-input:       #ffffff;
  --bg-input-dis:   #f6f7fb;
  --border:         #e5e8f0;
  --border-input:   #dde1ee;
  --accent:         #6366f1;
  --accent-hover:   #4f46e5;
  --accent-subtle:  #eef2ff;
  --text-primary:   #111827;
  --text-secondary: #6b7280;
  --text-disabled:  #9ca3af;
  --shadow-card:    0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(99,102,241,0.07);
  --shadow-input:   0 1px 2px rgba(0,0,0,0.04);
  --radius-card:    16px;
  --radius-input:   8px;

  min-height: 100vh;
  background: var(--bg-page);
  padding: 2.5rem 1.5rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

/* ── Dark mode tokens ── */
@media (prefers-color-scheme: dark) {
  .profile-container {
    --bg-page:        #0f1117;
    --bg-card:        #1a1d27;
    --bg-input:       #22263a;
    --bg-input-dis:   #1e2130;
    --border:         #2a2f45;
    --border-input:   #2e3450;
    --accent:         #818cf8;
    --accent-hover:   #a5b4fc;
    --accent-subtle:  #1e2038;
    --text-primary:   #f1f5f9;
    --text-secondary: #8b92a9;
    --text-disabled:  #4b5472;
    --shadow-card:    0 1px 3px rgba(0,0,0,0.4), 0 4px 24px rgba(0,0,0,0.3);
    --shadow-input:   0 1px 2px rgba(0,0,0,0.2);
  }
}

/* ── Card ── */
.profile-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  width: 100%;
  max-width: 580px;
  overflow: hidden;
}

/* ── Header ── */
.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.75rem 2rem 1.5rem;
  border-bottom: 1px solid var(--border);
}

.header-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--accent-subtle);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

.card-subtitle {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-top: 0.125rem;
}

/* ── Loading ── */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 3rem;
}

/* ── Form ── */
.profile-form {
  padding: 0;
}

.form-section {
  padding: 1.5rem 2rem;
}

.section-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin: 0 0 1.25rem;
}

.divider {
  height: 1px;
  background: var(--border);
  margin: 0;
}

/* ── Fields ── */
.field {
  margin-bottom: 1.125rem;
}

.field:last-child {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.4rem;
}

.field-hint {
  display: block;
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 0.35rem;
}

.field-row {
  display: flex;
  gap: 1rem;
}

.field-row .field {
  flex: 1;
}

/* ── Input wrapper (for icon) ── */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper .input-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
  pointer-events: none;
  z-index: 1;
}

.input-wrapper .styled-input {
  padding-left: 2.25rem !important;
}

/* ── PrimeVue InputText overrides ── */
:deep(.styled-input.p-inputtext) {
  background: var(--bg-input);
  border: 1px solid var(--border-input);
  border-radius: var(--radius-input);
  color: var(--text-primary);
  font-size: 0.875rem;
  padding: 0.5625rem 0.75rem;
  box-shadow: var(--shadow-input);
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
}

:deep(.styled-input.p-inputtext:focus) {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
  outline: none;
}

:deep(.styled-input.p-inputtext:disabled) {
  background: var(--bg-input-dis);
  color: var(--text-disabled);
  cursor: not-allowed;
  opacity: 1;
}

/* ── Actions ── */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 2rem;
  border-top: 1px solid var(--border);
  background: var(--bg-page);
}

/* ── Button overrides ── */
:deep(.btn-save.p-button) {
  background: var(--accent);
  border-color: var(--accent);
  border-radius: var(--radius-input);
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5625rem 1.25rem;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}

:deep(.btn-save.p-button:not(:disabled):hover) {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
}

:deep(.btn-save.p-button:disabled) {
  opacity: 0.45;
}

:deep(.btn-cancel.p-button) {
  background: transparent;
  border: 1px solid var(--border-input);
  color: var(--text-secondary);
  border-radius: var(--radius-input);
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5625rem 1.25rem;
  transition: background 0.15s, border-color 0.15s;
}

:deep(.btn-cancel.p-button:not(:disabled):hover) {
  background: var(--accent-subtle);
  border-color: var(--accent);
  color: var(--accent);
}

:deep(.btn-cancel.p-button:disabled) {
  opacity: 0.4;
}
</style>
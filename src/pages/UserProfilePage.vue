<template>
  <div class="profile-container">
    <div class="profile-card">

      <div class="card-header">
        <h2 class="card-title">My Profile</h2>
        <p class="card-subtitle">Manage your personal information</p>
      </div>

      <div v-if="state.loading" class="state-center">
        <ProgressSpinner strokeWidth="3" style="width: 32px; height: 32px" />
      </div>

      <Message v-else-if="state.error" severity="error" :closable="false">
        {{ state.error }}
      </Message>

      <form v-else @submit.prevent="saveProfile" class="profile-form">

        <div class="form-section">
          <p class="section-label">Account</p>
          <div class="field">
            <label for="email" class="field-label">Email</label>
            <div class="input-wrapper">
              <i class="pi pi-envelope input-icon"></i>
              <InputText id="email" v-model="form.email" disabled class="field-input padded" />
            </div>
            <small class="field-hint">Email cannot be changed</small>
          </div>
          <div class="field">
            <label for="username" class="field-label">Username</label>
            <div class="input-wrapper">
              <i class="pi pi-at input-icon"></i>
              <InputText id="username" v-model="form.username" class="field-input padded"
                placeholder="Enter a username" />
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="form-section">
          <p class="section-label">Personal Details</p>
          <div class="field-row">
            <div class="field">
              <label for="first_name" class="field-label">First Name</label>
              <InputText id="first_name" v-model="form.first_name" class="field-input" placeholder="First name" />
            </div>
            <div class="field">
              <label for="last_name" class="field-label">Last Name</label>
              <InputText id="last_name" v-model="form.last_name" class="field-input" placeholder="Last name" />
            </div>
          </div>
          <div class="field">
            <label for="phone_number" class="field-label">Phone Number</label>
            <div class="input-wrapper">
              <i class="pi pi-phone input-icon"></i>
              <InputText id="phone_number" v-model="form.phone_number" class="field-input padded"
                placeholder="Phone number" />
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="form-section">
          <p class="section-label">Access</p>
          <div class="field">
            <label for="role" class="field-label">Role</label>
            <div class="input-wrapper">
              <i class="pi pi-shield input-icon"></i>
              <InputText id="role" v-model="form.role" disabled class="field-input padded" />
            </div>
            <small class="field-hint">Contact an administrator to change your role</small>
          </div>
        </div>

        <div class="form-actions">
          <Button type="button" label="Cancel" icon="pi pi-times" :disabled="!hasChanges" @click="resetForm"
            class="btn-ghost" />
          <Button type="submit" label="Save Changes" icon="pi pi-check" :loading="state.saving" :disabled="!hasChanges"
            class="btn-primary" />
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

const hasChanges = computed(() =>
  form.username !== originalForm.value.username ||
  form.first_name !== originalForm.value.first_name ||
  form.last_name !== originalForm.value.last_name ||
  form.phone_number !== originalForm.value.phone_number
)

onMounted(loadFromStore)

function loadFromStore() {
  const user = authStore.appUser
  if (!user) { state.error = 'User not found'; return }
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
/* ── Tokens — matches UserTable gray palette ── */
.profile-container {
  --c-bg: #ffffff;
  --c-surface: #f9fafb;
  --c-border: #e5e7eb;
  --c-text: #111827;
  --c-muted: #6b7280;
  --c-faint: #d1d5db;
  --radius: 12px;

  background: #f3f4f6;
  min-height: 100vh;
  padding: 2.5rem 1.5rem;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

@media (prefers-color-scheme: dark) {
  .profile-container {
    --c-bg: #1c1c1e;
    --c-surface: #2c2c2e;
    --c-border: #3a3a3c;
    --c-text: #f5f5f7;
    --c-muted: #8e8e93;
    --c-faint: #48484a;

    background: #111111;
  }
}

/* ── Card ── */
.profile-card {
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 560px;
  overflow: hidden;
}

/* ── Header ── */
.card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--c-border);
}

.card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--c-text);
}

.card-subtitle {
  margin: 0.125rem 0 0;
  font-size: 0.8125rem;
  color: var(--c-muted);
}

/* ── Loading ── */
.state-center {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

/* ── Form sections ── */
.profile-form {
  padding: 0;
}

.form-section {
  padding: 1.25rem 1.5rem;
}

.section-label {
  margin: 0 0 1rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-muted);
}

.divider {
  height: 1px;
  background: var(--c-border);
}

/* ── Fields ── */
.field {
  margin-bottom: 1rem;
}

.field:last-child {
  margin-bottom: 0;
}

.field-label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--c-text);
  margin-bottom: 0.375rem;
}

.field-hint {
  display: block;
  font-size: 0.75rem;
  color: var(--c-muted);
  margin-top: 0.3rem;
}

.field-row {
  display: flex;
  gap: 1rem;
}

.field-row .field {
  flex: 1;
}

/* ── Input wrapper ── */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  color: var(--c-muted);
  font-size: 0.875rem;
  pointer-events: none;
  z-index: 1;
}

/* ── Inputs ── */
:deep(.field-input.p-inputtext) {
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: 6px;
  color: var(--c-text);
  font-size: 0.875rem;
  padding: 0.4375rem 0.75rem;
  width: 100%;
  transition: border-color 0.12s;
  box-shadow: none;
}

:deep(.field-input.padded.p-inputtext) {
  padding-left: 2.25rem;
}

:deep(.field-input.p-inputtext:focus) {
  border-color: var(--c-faint);
  box-shadow: none;
  outline: none;
}

:deep(.field-input.p-inputtext:disabled) {
  background: var(--c-surface);
  color: var(--c-muted);
  cursor: not-allowed;
  opacity: 1;
}

/* ── Actions ── */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--c-border);
  background: var(--c-surface);
}

/* ── Buttons — matches UserTable btn-ghost ── */
:deep(.btn-ghost.p-button) {
  background: transparent !important;
  border: 1px solid var(--c-border) !important;
  color: var(--c-muted) !important;
  border-radius: 6px !important;
  font-size: 0.8125rem !important;
  padding: 0.4375rem 0.875rem !important;
  transition: all 0.12s !important;
}

:deep(.btn-ghost.p-button:not(:disabled):hover) {
  background: var(--c-surface) !important;
  color: var(--c-text) !important;
  border-color: var(--c-faint) !important;
}

:deep(.btn-ghost.p-button:disabled) {
  opacity: 0.4 !important;
}

:deep(.btn-primary.p-button) {
  background: var(--c-text) !important;
  border: 1px solid var(--c-text) !important;
  color: var(--c-bg) !important;
  border-radius: 6px !important;
  font-size: 0.8125rem !important;
  font-weight: 500 !important;
  padding: 0.4375rem 0.875rem !important;
  transition: opacity 0.12s !important;
}

:deep(.btn-primary.p-button:not(:disabled):hover) {
  opacity: 0.85 !important;
}

:deep(.btn-primary.p-button:disabled) {
  opacity: 0.35 !important;
}
</style>
<template>
  <div class="eud-wrapper">
  <Dialog
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    modal
    :style="{ width: '440px' }"
    :pt="dialogPt"
    class="edit-user-dialog"
  >
    <template #header>
      <div class="modal-header">
        <div class="header-left">
          <div class="header-icon">
            <i class="pi pi-user-edit"></i>
          </div>
          <div>
            <h2 class="modal-title">Edit User</h2>
            <p class="modal-subtitle">{{ user?.username }}</p>
          </div>
        </div>
      </div>
    </template>

    <div class="modal-body">

      <div class="info-row">
        <div class="user-avatar">{{ initials }}</div>
        <div class="info-text">
          <span class="info-name">{{ user?.first_name }} {{ user?.last_name }}</span>
          <span class="info-email">{{ user?.email }}</span>
        </div>
      </div>

      <div class="section-divider"></div>

      <div class="field">
        <label class="field-label" for="role-select">Role</label>
        <Select
          inputId="role-select"
          v-model="form.role"
          :options="ROLES"
          optionLabel="label"
          optionValue="value"
          placeholder="Select a role"
          class="role-select"
        />
        <small class="field-hint">Controls what this user can access across the platform.</small>
      </div>

      <!--
        TODO: Add team dropdown here once the Teams API is implemented.
      -->

    </div>

    <template #footer>
      <div class="modal-footer">
        <Button
          label="Cancel"
          class="btn-secondary"
          @click="emit('update:visible', false)"
          :disabled="saving"
        />
        <Button
          label="Save Changes"
          icon="pi pi-check"
          class="btn-primary"
          :loading="saving"
          :disabled="!hasChanges"
          @click="handleSave"
        />
      </div>
    </template>
  </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import { type User } from '@/api/generated/models/User'

const props = defineProps<{
  visible: boolean
  user: User | null
  saving: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: [payload: { role: string }]
}>()

const ROLES = [
  { label: 'Administrator', value: 'Administrator' },
  { label: 'Responder',     value: 'Responder' },
  { label: 'Unassigned',    value: 'Unassigned' },
]

const form = ref({ role: '' })

watch(() => props.user, (user) => {
  if (user) form.value.role = user.role ?? ''
}, { immediate: true })

const hasChanges = computed(() => form.value.role !== props.user?.role)

const initials = computed(() => {
  const f = props.user?.first_name?.[0] ?? ''
  const l = props.user?.last_name?.[0] ?? ''
  return (f + l).toUpperCase() || props.user?.username?.[0]?.toUpperCase() || '?'
})

function handleSave() {
  emit('save', { role: form.value.role })
}

const dialogPt = {
  root:    { class: 'eud-root' },
  header:  { class: 'eud-header' },
  content: { class: 'eud-content' },
  footer:  { class: 'eud-footer' },
}
</script>

<style scoped>
/* ── Tokens ── */
.eud-wrapper {
  --bg-card:       #ffffff;
  --bg-input:      #ffffff;
  --border:        #e5e8f0;
  --border-input:  #dde1ee;
  --accent:        #6366f1;
  --accent-hover:  #4f46e5;
  --accent-subtle: #eef2ff;
  --text-primary:  #111827;
  --text-secondary:#6b7280;
  --radius-card:   16px;
  --radius-input:  8px;
  --shadow-card:   0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(99,102,241,0.07);
}

@media (prefers-color-scheme: dark) {
  .eud-wrapper {
    --bg-card:       #1a1d27;
    --bg-input:      #22263a;
    --border:        #2a2f45;
    --border-input:  #2e3450;
    --accent:        #818cf8;
    --accent-hover:  #a5b4fc;
    --accent-subtle: #1e2038;
    --text-primary:  #f1f5f9;
    --text-secondary:#8b92a9;
    --shadow-card:   0 1px 3px rgba(0,0,0,0.4), 0 4px 24px rgba(0,0,0,0.3);
  }
}

/* ── Dialog shell ── */
:deep(.eud-root) {
  border-radius: var(--radius-card) !important;
  border: none !important;
  box-shadow: var(--shadow-card) !important;
  overflow: hidden;
}

:deep(.eud-header) {
  background: var(--bg-card) !important;
  border-bottom: 1px solid var(--border) !important;
  padding: 1.5rem 1.75rem !important;
}

:deep(.eud-content) {
  background: var(--bg-card) !important;
  padding: 1.25rem 1.75rem !important;
}

:deep(.eud-footer) {
  background: var(--bg-card) !important;
  border-top: 1px solid var(--border) !important;
  padding: 1rem 1.75rem !important;
}

:deep(.p-dialog-close-button) {
  display: none !important;
}

/* ── Header ── */
.modal-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--accent-subtle);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.modal-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-subtitle {
  margin: 0;
  font-size: 0.78125rem;
  color: var(--text-secondary);
}

/* ── Info row ── */
.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-subtle);
  color: var(--accent);
  font-size: 0.8125rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.info-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.info-email {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* ── Divider ── */
.section-divider {
  height: 1px;
  background: var(--border);
  margin: 0.25rem 0;
}

/* ── Form field ── */
.field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-top: 1rem;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.role-select {
  width: 100%;
}

:deep(.role-select.p-select) {
  border-radius: var(--radius-input) !important;
  border: 1px solid var(--border-input) !important;
  background: var(--bg-input) !important;
  color: var(--text-primary) !important;
  width: 100% !important;
}

:deep(.role-select.p-select:focus),
:deep(.role-select.p-select.p-focus) {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent) !important;
}

:deep(.role-select .p-select-label) {
  color: var(--text-primary) !important;
  background: transparent !important;
}

.field-hint {
  font-size: 0.78125rem;
  color: var(--text-secondary);
}

/* ── Footer buttons ── */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

:deep(.btn-secondary.p-button) {
  background: transparent !important;
  border: 1px solid var(--border) !important;
  color: var(--text-primary) !important;
  border-radius: var(--radius-input) !important;
  transition: all 0.15s !important;
}

:deep(.btn-secondary.p-button:hover) {
  background: var(--accent-subtle) !important;
  border-color: var(--accent) !important;
  color: var(--accent) !important;
}

:deep(.btn-primary.p-button) {
  background: var(--accent) !important;
  border-color: var(--accent) !important;
  color: #ffffff !important;
  border-radius: var(--radius-input) !important;
  transition: all 0.15s !important;
}

:deep(.btn-primary.p-button:hover:not(:disabled)) {
  background: var(--accent-hover) !important;
  border-color: var(--accent-hover) !important;
}

:deep(.btn-primary.p-button:disabled) {
  opacity: 0.5 !important;
}
</style>
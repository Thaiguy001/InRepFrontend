<template>
  <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" modal :style="{ width: '440px' }"
    :pt="dialogPt" class="edit-user-dialog">
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

      <!-- Read-only user info -->
      <div class="info-row">
        <div class="user-avatar">{{ initials }}</div>
        <div class="info-text">
          <span class="info-name">{{ user?.first_name }} {{ user?.last_name }}</span>
          <span class="info-email">{{ user?.email }}</span>
        </div>
      </div>

      <div class="section-divider"></div>

      <!-- Role field -->
      <div class="field">
        <label class="field-label" for="role-select">Role</label>
        <Select inputId="role-select" v-model="form.role" :options="ROLES" optionLabel="label" optionValue="value"
          placeholder="Select a role" class="field-select" />
        <small class="field-hint">Controls what this user can access across the platform.</small>
      </div>

      <!-- Team field -->
      <div class="field">
        <label class="field-label" for="team-select">Team</label>
        <Select inputId="team-select" v-model="form.team_id" :options="teams" optionLabel="name" optionValue="id"
          placeholder="Select a team" :loading="teamsLoading" showClear class="field-select" />
        <small class="field-hint">Assign this user to a team. Leave blank to unassign.</small>
      </div>

    </div>

    <template #footer>
      <div class="modal-footer">
        <Button label="Cancel" class="btn-secondary" @click="emit('update:visible', false)" :disabled="saving" />
        <Button label="Save Changes" icon="pi pi-check" class="btn-primary" :loading="saving" :disabled="!hasChanges"
          @click="handleSave" />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import { type User } from '@/api/generated/models/User'
import { TeamsService } from '@/api'

const props = defineProps<{
  visible: boolean
  user: User | null
  saving: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: [payload: { role: string; team_id: number | null }]
}>()

const ROLES = [
  { label: 'Administrator', value: 'Administrator' },
  { label: 'Responder', value: 'Responder' },
  { label: 'Unassigned', value: 'Unassigned' },
]

const teams = ref<{ id: number; name: string; description: string }[]>([])
const teamsLoading = ref(false)

const form = ref<{ role: string; team_id: number | null }>({
  role: '',
  team_id: null,
})

onMounted(fetchTeams)

async function fetchTeams() {
  teamsLoading.value = true
  try {
    teams.value = await TeamsService.getApiV1Teams() as { id: number; name: string; description: string }[]
  } catch (error) {
    console.error('Failed to load teams:', error)
  } finally {
    teamsLoading.value = false
  }
}

// Reset form whenever the dialog opens with a new user
watch(() => props.user, (user) => {
  if (user) {
    form.value.role = user.role ?? ''
    form.value.team_id = user.team_id ?? null
  }
}, { immediate: true })

const hasChanges = computed(() =>
  form.value.role !== props.user?.role ||
  form.value.team_id !== (props.user?.team_id ?? null)
)

const initials = computed(() => {
  const f = props.user?.first_name?.[0] ?? ''
  const l = props.user?.last_name?.[0] ?? ''
  return (f + l).toUpperCase() || props.user?.username?.[0]?.toUpperCase() || '?'
})

function handleSave() {
  emit('save', {
    role: form.value.role,
    team_id: form.value.team_id,
  })
}

const dialogPt = {
  root: { class: 'eud-root' },
  header: { class: 'eud-header' },
  content: { class: 'eud-content' },
  footer: { class: 'eud-footer' },
}
</script>

<style scoped>
.edit-user-dialog {
  --bg-card: #ffffff;
  --bg-input: #ffffff;
  --bg-row-hover: #f5f6fd;
  --border: #e5e8f0;
  --border-input: #dde1ee;
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --accent-subtle: #eef2ff;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --radius-card: 16px;
  --radius-input: 8px;
  --shadow-card: 0 1px 3px rgba(0, 0, 0, 0.07), 0 4px 16px rgba(99, 102, 241, 0.07);
}

@media (prefers-color-scheme: dark) {
  .edit-user-dialog {
    --bg-card: #1a1d27;
    --bg-input: #22263a;
    --bg-row-hover: #1e2235;
    --border: #2a2f45;
    --border-input: #2e3450;
    --accent: #818cf8;
    --accent-hover: #a5b4fc;
    --accent-subtle: #1e2038;
    --text-primary: #f1f5f9;
    --text-secondary: #8b92a9;
  }
}

:deep(.eud-root) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-card) !important;
  box-shadow: var(--shadow-card) !important;
  overflow: hidden !important;
}

:deep(.eud-header) {
  padding: 0 !important;
  border-bottom: none !important;
  background: var(--bg-card) !important;
}

:deep(.eud-content) {
  padding: 0 !important;
  background: var(--bg-card) !important;
}

:deep(.eud-footer) {
  padding: 0 !important;
  background: var(--bg-card) !important;
  border-top: 1px solid var(--border) !important;
}

.modal-header {
  display: flex;
  align-items: center;
  padding: 1.5rem 1.75rem;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.875rem;
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
  margin: 0.1rem 0 0;
  font-size: 0.78125rem;
  color: var(--text-secondary);
}

.modal-body {
  padding: 1.5rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--bg-row-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-subtle);
  color: var(--accent);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.info-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-email {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-divider {
  height: 1px;
  background: var(--border);
  margin: 0 -1.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
}

.field-hint {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Shared select styles — covers both role and team dropdowns */
:deep(.field-select.p-select) {
  background: var(--bg-input) !important;
  border: 1px solid var(--border-input) !important;
  border-radius: var(--radius-input) !important;
  color: var(--text-primary) !important;
  font-size: 0.875rem !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04) !important;
  transition: border-color 0.15s, box-shadow 0.15s !important;
  width: 100% !important;
}

:deep(.field-select.p-select:not(.p-disabled):hover),
:deep(.field-select.p-select.p-focus) {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent) !important;
}

:deep(.p-select-label) {
  color: var(--text-primary) !important;
  font-size: 0.875rem !important;
  padding: 0.5rem 0.75rem !important;
}

:deep(.p-select-overlay) {
  background: var(--bg-card) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-input) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}

:deep(.p-select-option) {
  color: var(--text-primary) !important;
  font-size: 0.875rem !important;
  padding: 0.5625rem 0.875rem !important;
}

:deep(.p-select-option.p-focus),
:deep(.p-select-option:hover) {
  background: var(--accent-subtle) !important;
  color: var(--accent) !important;
}

:deep(.p-select-option.p-selected) {
  background: var(--accent-subtle) !important;
  color: var(--accent) !important;
  font-weight: 600 !important;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.625rem;
  padding: 1rem 1.75rem;
}

:deep(.btn-primary.p-button) {
  background: var(--accent) !important;
  border: 1px solid var(--accent) !important;
  border-radius: var(--radius-input) !important;
  color: #ffffff !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  padding: 0.5625rem 1.25rem !important;
  transition: background 0.15s, border-color 0.15s !important;
}

:deep(.btn-primary.p-button:not(:disabled):hover) {
  background: var(--accent-hover) !important;
  border-color: var(--accent-hover) !important;
}

:deep(.btn-primary.p-button:disabled) {
  opacity: 0.45 !important;
}

:deep(.btn-secondary.p-button) {
  background: transparent !important;
  border: 1px solid var(--border-input) !important;
  color: var(--text-secondary) !important;
  border-radius: var(--radius-input) !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  padding: 0.5625rem 1.25rem !important;
  transition: background 0.15s, border-color 0.15s, color 0.15s !important;
}

:deep(.btn-secondary.p-button:not(:disabled):hover) {
  background: var(--accent-subtle) !important;
  border-color: var(--accent) !important;
  color: var(--accent) !important;
}

:deep(.btn-secondary.p-button:disabled) {
  opacity: 0.4 !important;
}
</style>
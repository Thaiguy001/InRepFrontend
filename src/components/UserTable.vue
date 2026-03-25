<template>
  <div class="table-wrapper">
    <DataTable
      v-model:filters="filters"
      :value="users"
      paginator
      :rows="10"
      :rows-per-page-options="[10, 25, 50]"
      dataKey="id"
      filterDisplay="menu"
      :loading="loading"
      :globalFilterFields="['username', 'first_name', 'last_name', 'email', 'role']"
      class="users-table"
      :pt="tablePt"
    >
      <template #header>
        <div class="table-header">
          <div class="table-header-left">
            <div class="header-icon">
              <i class="pi pi-users"></i>
            </div>
            <div>
              <h2 class="table-title">Users</h2>
              <p class="table-subtitle">{{ users.length }} total members</p>
            </div>
          </div>
          <div class="table-header-right">
            <Button
              type="button"
              icon="pi pi-filter-slash"
              label="Clear"
              class="btn-clear"
              @click="clearFilter"
            />
            <IconField>
              <InputIcon>
                <i class="pi pi-search" />
              </InputIcon>
              <InputText
                v-model="filters['global'].value"
                placeholder="Search users…"
                class="search-input"
              />
            </IconField>
            <Button
              type="button"
              icon="pi pi-refresh"
              class="btn-refresh"
              @click="emit('refresh')"
              v-tooltip.top="'Refresh'"
            />
          </div>
        </div>
      </template>

      <template #empty>
        <div class="empty-state">
          <i class="pi pi-inbox empty-icon"></i>
          <p>No users found</p>
        </div>
      </template>

      <template #loading>
        <div class="loading-state">
          <ProgressSpinner strokeWidth="3" style="width: 32px; height: 32px" />
          <p>Loading users…</p>
        </div>
      </template>

      <Column field="username" header="Username" sortable style="min-width: 11rem">
        <template #body="{ data }">
          <div class="user-cell">
            <div class="user-avatar">{{ initials(data) }}</div>
            <span class="username-text">{{ data.username }}</span>
          </div>
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search username" />
        </template>
      </Column>

      <Column header="Name" filterField="first_name" sortable style="min-width: 11rem">
        <template #body="{ data }">
          {{ data.first_name }} {{ data.last_name }}
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search name" />
        </template>
      </Column>

      <Column field="email" header="Email" sortable style="min-width: 14rem">
        <template #body="{ data }">
          <span class="email-text">{{ data.email }}</span>
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search email" />
        </template>
      </Column>

      <Column field="role" header="Role" sortable style="min-width: 9rem">
        <template #body="{ data }">
          <span :class="['role-badge', `role-${data.role?.toLowerCase()}`]">
            {{ data.role }}
          </span>
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search role" />
        </template>
      </Column>

      <Column field="team_id" header="Team" dataType="numeric" sortable style="min-width: 8rem">
        <template #body="{ data }">
          <span v-if="data.team_id" class="team-badge">Team {{ data.team_id }}</span>
          <span v-else class="unassigned">—</span>
        </template>
        <template #filter="{ filterModel }">
          <InputNumber v-model="filterModel.value" placeholder="Team ID" />
        </template>
      </Column>

      <Column header="Actions" style="min-width: 7rem; text-align: center">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button
              icon="pi pi-pencil"
              class="btn-action btn-edit"
              @click="emit('edit', data)"
              v-tooltip.top="'Edit user'"
              text
              rounded
            />
            <Button
              icon="pi pi-trash"
              class="btn-action btn-delete"
              @click="emit('delete', data)"
              v-tooltip.top="'Delete user'"
              text
              rounded
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import InputIcon from 'primevue/inputicon'
import IconField from 'primevue/iconfield'
import ProgressSpinner from 'primevue/progressspinner'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { type User } from '@/api/generated/models/User'

defineProps<{
  users: User[]
  loading: boolean
}>()

const emit = defineEmits<{
  edit: [user: User]
  delete: [user: User]
  refresh: []
}>()

const filters = ref(buildFilters())

function buildFilters() {
  return {
    global:   { value: null, matchMode: FilterMatchMode.CONTAINS },
    username: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    first_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    email:    { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    role:     { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    team_id:  { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
  }
}

function clearFilter() {
  filters.value = buildFilters()
}

function initials(user: User) {
  const f = user.first_name?.[0] ?? ''
  const l = user.last_name?.[0] ?? ''
  return (f + l).toUpperCase() || user.username?.[0]?.toUpperCase() || '?'
}

const tablePt = {
  root: { class: 'pt-root' },
  header: { class: 'pt-header' },
  thead: { class: 'pt-thead' },
}
</script>


<style scoped>
/* Styling Generated by Claude
/* ── Tokens ── */
.table-wrapper {
  --bg-page:       #f0f2f9;
  --bg-card:       #ffffff;
  --bg-input:      #ffffff;
  --bg-row-hover:  #f5f6fd;
  --border:        #e5e8f0;
  --border-input:  #dde1ee;
  --accent:        #6366f1;
  --accent-hover:  #4f46e5;
  --accent-subtle: #eef2ff;
  --text-primary:  #111827;
  --text-secondary:#6b7280;
  --text-disabled: #9ca3af;
  --radius-card:   16px;
  --radius-input:  8px;
  --radius-badge:  6px;
  --shadow-card:   0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(99,102,241,0.07);

  background: var(--bg-page);
  padding: 2rem 1.5rem;
  min-height: 100vh;
}

@media (prefers-color-scheme: dark) {
  .table-wrapper {
    --bg-page:       #0f1117;
    --bg-card:       #1a1d27;
    --bg-input:      #22263a;
    --bg-row-hover:  #1e2235;
    --border:        #2a2f45;
    --border-input:  #2e3450;
    --accent:        #818cf8;
    --accent-hover:  #a5b4fc;
    --accent-subtle: #1e2038;
    --text-primary:  #f1f5f9;
    --text-secondary:#8b92a9;
    --text-disabled: #4b5472;
    --shadow-card:   0 1px 3px rgba(0,0,0,0.4), 0 4px 24px rgba(0,0,0,0.3);
  }
}

/* ── Card shell ── */
:deep(.users-table) {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

/* ── Header ── */
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1.5rem 1.75rem;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border);
}

.table-header-left {
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

.table-title {
  margin: 0;
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--text-primary);
}

.table-subtitle {
  margin: 0;
  font-size: 0.78125rem;
  color: var(--text-secondary);
  margin-top: 0.1rem;
}

.table-header-right {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

/* ── PrimeVue header/footer areas ── */
:deep(.p-datatable-header) {
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
}

:deep(.p-datatable-thead > tr > th) {
  background: var(--bg-card) !important;
  color: var(--text-secondary) !important;
  font-size: 0.6875rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.07em !important;
  text-transform: uppercase !important;
  border-bottom: 1px solid var(--border) !important;
  border-top: none !important;
  padding: 0.75rem 1rem !important;
}

:deep(.p-datatable-tbody > tr) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  transition: background 0.12s;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: var(--bg-row-hover) !important;
}

:deep(.p-datatable-tbody > tr > td) {
  border-bottom: 1px solid var(--border) !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.875rem !important;
  color: var(--text-primary) !important;
}

:deep(.p-paginator) {
  background: var(--bg-card) !important;
  border-top: 1px solid var(--border) !important;
  border-bottom: none !important;
  padding: 0.75rem 1rem !important;
  color: var(--text-secondary) !important;
}

:deep(.p-paginator-page.p-highlight) {
  background: var(--accent-subtle) !important;
  color: var(--accent) !important;
  border-radius: 6px !important;
}

/* ── User cell ── */
.user-cell {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent-subtle);
  color: var(--accent);
  font-size: 0.6875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.username-text {
  font-weight: 500;
}

.email-text {
  color: var(--text-secondary);
  font-size: 0.8125rem;
}

/* ── Badges ── */
.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.625rem;
  border-radius: var(--radius-badge);
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--accent-subtle);
  color: var(--accent);
}

.role-administrator {
  background: #fef3c7;
  color: #92400e;
}

.role-responder {
  background: #dcfce7;
  color: #166534;
}

.role-viewer {
  background: var(--accent-subtle);
  color: var(--accent);
}

@media (prefers-color-scheme: dark) {
  .role-administrator { background: #2d1f00; color: #fbbf24; }
  .role-responder     { background: #052e16; color: #4ade80; }
  .role-viewer        { background: var(--accent-subtle); color: var(--accent); }
}

.team-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.625rem;
  border-radius: var(--radius-badge);
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--border);
  color: var(--text-secondary);
}

.unassigned {
  color: var(--text-disabled);
}

/* ── Action buttons ── */
.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
}

:deep(.btn-edit.p-button) {
  color: var(--accent) !important;
  width: 2rem !important;
  height: 2rem !important;
}

:deep(.btn-edit.p-button:hover) {
  background: var(--accent-subtle) !important;
}

:deep(.btn-delete.p-button) {
  color: #ef4444 !important;
  width: 2rem !important;
  height: 2rem !important;
}

:deep(.btn-delete.p-button:hover) {
  background: #fef2f2 !important;
}

@media (prefers-color-scheme: dark) {
  :deep(.btn-delete.p-button:hover) {
    background: #2d0a0a !important;
  }
}

/* ── Header buttons ── */
:deep(.btn-clear.p-button),
:deep(.btn-refresh.p-button) {
  background: transparent !important;
  border: 1px solid var(--border-input) !important;
  color: var(--text-secondary) !important;
  border-radius: var(--radius-input) !important;
  font-size: 0.8125rem !important;
  padding: 0.5rem 0.875rem !important;
  transition: all 0.15s !important;
}

:deep(.btn-clear.p-button:hover),
:deep(.btn-refresh.p-button:hover) {
  background: var(--accent-subtle) !important;
  border-color: var(--accent) !important;
  color: var(--accent) !important;
}

:deep(.btn-refresh.p-button) {
  padding: 0.5rem !important;
}

/* ── Search input ── */
:deep(.search-input.p-inputtext) {
  background: var(--bg-input) !important;
  border: 1px solid var(--border-input) !important;
  border-radius: var(--radius-input) !important;
  color: var(--text-primary) !important;
  font-size: 0.875rem !important;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem !important;
  transition: border-color 0.15s, box-shadow 0.15s !important;
  width: 220px !important;
}

:deep(.search-input.p-inputtext:focus) {
  border-color: var(--accent) !important;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent) !important;
}

/* ── Empty / Loading states ── */
.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.empty-icon {
  font-size: 2rem;
  color: var(--text-disabled);
}
</style>
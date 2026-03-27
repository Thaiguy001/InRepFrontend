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
    >
      <template #header>
        <div class="table-header">
          <div class="header-left">
            <h2 class="table-title">Users</h2>
            <span class="table-subtitle">{{ users.length }} members</span>
          </div>
          <div class="header-right">
            <Button type="button" icon="pi pi-filter-slash" label="Clear" class="btn-ghost" @click="clearFilter" />
            <IconField>
              <InputIcon><i class="pi pi-search" /></InputIcon>
              <InputText v-model="filters['global'].value" placeholder="Search…" class="search-input" />
            </IconField>
            <Button type="button" icon="pi pi-refresh" class="btn-ghost icon-only" @click="emit('refresh')" v-tooltip.top="'Refresh'" />
          </div>
        </div>
      </template>

      <template #empty>
        <div class="state-center">
          <i class="pi pi-inbox" style="font-size: 1.5rem; opacity: 0.3"></i>
          <p>No users found</p>
        </div>
      </template>

      <template #loading>
        <div class="state-center">
          <ProgressSpinner strokeWidth="3" style="width: 28px; height: 28px" />
          <p>Loading…</p>
        </div>
      </template>

      <Column field="username" header="Username" sortable style="min-width: 11rem">
        <template #body="{ data }">
          <div class="user-cell">
            <div class="avatar">{{ initials(data) }}</div>
            <span class="fw-medium">{{ data.username }}</span>
          </div>
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search username" />
        </template>
      </Column>

      <Column header="Name" filterField="first_name" sortable style="min-width: 11rem">
        <template #body="{ data }">{{ data.first_name }} {{ data.last_name }}</template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search name" />
        </template>
      </Column>

      <Column field="email" header="Email" sortable style="min-width: 14rem">
        <template #body="{ data }"><span class="text-muted">{{ data.email }}</span></template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search email" />
        </template>
      </Column>

      <Column field="role" header="Role" sortable style="min-width: 9rem">
        <template #body="{ data }">
          <span :class="['badge', `badge-${data.role?.toLowerCase()}`]">{{ data.role }}</span>
        </template>
        <template #filter="{ filterModel }">
          <InputText v-model="filterModel.value" placeholder="Search role" />
        </template>
      </Column>

      <Column field="team_id" header="Team" dataType="numeric" sortable style="min-width: 8rem">
        <template #body="{ data }">
          <span v-if="data.team_id" class="badge badge-neutral">Team {{ data.team_id }}</span>
          <span v-else class="text-muted">—</span>
        </template>
        <template #filter="{ filterModel }">
          <InputNumber v-model="filterModel.value" placeholder="Team ID" />
        </template>
      </Column>

      <Column header="Actions" style="min-width: 7rem; text-align: center">
        <template #body="{ data }">
          <div class="action-buttons">
            <Button icon="pi pi-pencil" class="btn-icon" @click="emit('edit', data)" v-tooltip.top="'Edit'" text rounded />
            <Button icon="pi pi-trash" class="btn-icon btn-danger" @click="emit('delete', data)" v-tooltip.top="'Delete'" text rounded />
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

defineProps<{ users: User[]; loading: boolean }>()

const emit = defineEmits<{
  edit: [user: User]
  delete: [user: User]
  refresh: []
}>()

const filters = ref(buildFilters())

function buildFilters() {
  return {
    global:     { value: null, matchMode: FilterMatchMode.CONTAINS },
    username:   { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    first_name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    email:      { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    role:       { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
    team_id:    { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
  }
}

function clearFilter() { filters.value = buildFilters() }

function initials(user: User) {
  const f = user.first_name?.[0] ?? ''
  const l = user.last_name?.[0] ?? ''
  return (f + l).toUpperCase() || user.username?.[0]?.toUpperCase() || '?'
}
</script>

<style scoped>
/* ── Tokens ── */
.table-wrapper {
  --c-bg:       #ffffff;
  --c-surface:  #f9fafb;
  --c-border:   #e5e7eb;
  --c-text:     #111827;
  --c-muted:    #6b7280;
  --c-faint:    #d1d5db;
  --c-accent:   #374151;
  --radius:     12px;

  background: #f3f4f6;
  padding: 2rem 1.5rem;
  min-height: 100vh;
}

@media (prefers-color-scheme: dark) {
  .table-wrapper {
    --c-bg:      #1c1c1e;
    --c-surface: #2c2c2e;
    --c-border:  #3a3a3c;
    --c-text:    #f5f5f7;
    --c-muted:   #8e8e93;
    --c-faint:   #48484a;
    --c-accent:  #ebebf0;

    background: #111111;
  }
}

/* ── Table card ── */
:deep(.users-table) {
  background: var(--c-bg);
  border: 1px solid var(--c-border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

/* ── Header ── */
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: var(--c-bg);
  border-bottom: 1px solid var(--c-border);
}

.header-left { display: flex; align-items: baseline; gap: 0.625rem; }

.table-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--c-text);
}

.table-subtitle {
  font-size: 0.8125rem;
  color: var(--c-muted);
}

.header-right { display: flex; align-items: center; gap: 0.5rem; }

/* ── PrimeVue overrides ── */
:deep(.p-datatable-header) { padding: 0 !important; border: none !important; background: transparent !important; }

:deep(.p-datatable-thead > tr > th) {
  background: var(--c-surface) !important;
  color: var(--c-muted) !important;
  font-size: 0.6875rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.06em !important;
  text-transform: uppercase !important;
  border-bottom: 1px solid var(--c-border) !important;
  border-top: none !important;
  padding: 0.625rem 1rem !important;
}

:deep(.p-datatable-tbody > tr) { background: var(--c-bg) !important; transition: background 0.1s; }
:deep(.p-datatable-tbody > tr:hover) { background: var(--c-surface) !important; }
:deep(.p-datatable-tbody > tr > td) {
  border-bottom: 1px solid var(--c-border) !important;
  padding: 0.75rem 1rem !important;
  font-size: 0.875rem !important;
  color: var(--c-text) !important;
}

:deep(.p-paginator) {
  background: var(--c-bg) !important;
  border-top: 1px solid var(--c-border) !important;
  padding: 0.625rem 1rem !important;
  color: var(--c-muted) !important;
}

:deep(.p-paginator-page.p-highlight) {
  background: var(--c-surface) !important;
  color: var(--c-text) !important;
  border-radius: 6px !important;
}

/* ── Cells ── */
.user-cell { display: flex; align-items: center; gap: 0.5rem; }

.avatar {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  color: var(--c-muted);
  font-size: 0.625rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.fw-medium { font-weight: 500; }
.text-muted { color: var(--c-muted); font-size: 0.8125rem; }

/* ── Badges ── */
.badge {
  display: inline-flex;
  padding: 0.175rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--c-surface);
  color: var(--c-muted);
  border: 1px solid var(--c-border);
}

.badge-administrator { background: #fef9c3; color: #854d0e; border-color: #fde68a; }
.badge-responder     { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
.badge-unassigned    { background: var(--c-surface); color: var(--c-muted); }
.badge-neutral       { background: var(--c-surface); color: var(--c-muted); }

@media (prefers-color-scheme: dark) {
  .badge-administrator { background: #2d1f00; color: #fbbf24; border-color: #451a00; }
  .badge-responder     { background: #052e16; color: #4ade80; border-color: #14532d; }
}

/* ── Buttons ── */
:deep(.btn-ghost.p-button) {
  background: transparent !important;
  border: 1px solid var(--c-border) !important;
  color: var(--c-muted) !important;
  border-radius: 6px !important;
  font-size: 0.8125rem !important;
  padding: 0.4375rem 0.75rem !important;
  transition: all 0.12s !important;
}

:deep(.btn-ghost.p-button:hover) {
  background: var(--c-surface) !important;
  color: var(--c-text) !important;
  border-color: var(--c-faint) !important;
}

:deep(.icon-only.p-button) { padding: 0.4375rem !important; }

:deep(.search-input.p-inputtext) {
  background: var(--c-bg) !important;
  border: 1px solid var(--c-border) !important;
  border-radius: 6px !important;
  color: var(--c-text) !important;
  font-size: 0.875rem !important;
  padding: 0.4375rem 0.75rem 0.4375rem 2.25rem !important;
  width: 200px !important;
  transition: border-color 0.12s !important;
}

:deep(.search-input.p-inputtext:focus) {
  border-color: var(--c-faint) !important;
  box-shadow: none !important;
}

.action-buttons { display: flex; gap: 0.25rem; justify-content: center; }

:deep(.btn-icon.p-button) { color: var(--c-muted) !important; width: 1.875rem !important; height: 1.875rem !important; }
:deep(.btn-icon.p-button:hover) { background: var(--c-surface) !important; color: var(--c-text) !important; }
:deep(.btn-danger.p-button) { color: #ef4444 !important; }
:deep(.btn-danger.p-button:hover) { background: #fef2f2 !important; }

@media (prefers-color-scheme: dark) {
  :deep(.btn-danger.p-button:hover) { background: #2d0a0a !important; }
}

/* ── States ── */
.state-center {
  display: flex; flex-direction: column; align-items: center;
  gap: 0.5rem; padding: 2.5rem;
  color: var(--c-muted); font-size: 0.875rem;
}
</style>
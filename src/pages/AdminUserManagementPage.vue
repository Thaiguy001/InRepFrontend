<template>
    <!-- <div class="user-management-header">
        <h1>User Management</h1>
        <p>Manage users and their permissions.</p>
    </div>
    <div v-if="!state.loading" class="user-list">
        <Card v-for="user in state.users" :key="user.id" class="mb-3">
            <template #title>{{ user.id }}: {{ user.username }}</template>
            <template #subtitle>{{ user.email }}</template>
            <template #content>
                <p>Name: {{ user.first_name }} {{ user.last_name }}</p>
                <p>Role: {{ user.role }}</p>
                <p>Phone: {{ user.phone_number }}</p>
                <p>Team: {{ user.team_id || 'Not assigned' }}</p>
            </template>
            <template #footer>
                <Button label="Edit" class="pi pi-pencil" @click="() => showEditUser(user)" />
                <Button label="Delete" class="pi pi-trash" @click="() => handleDelete(user)" />
            </template>
        </Card>
    </div> -->
    <div v-if="!state.loading" class="user-list">
            <DataTable v-model:filters="filters" :value="state.users" paginator showGridlines :rows="10" dataKey="id"
                filterDisplay="menu" :loading="state.loading" :globalFilterFields="['username', 'first_name', 'last_name', 'email', 'role', 'team_id']" class="p-datatable-sm">
            <template #header>
                <div class="flex justify-between">
                    <Button type="button" icon="pi pi-filter-slash" label="Clear" variant="outlined" @click="clearFilter()" />
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    </IconField>
                </div>
            </template>
            <template #empty> No users found. </template>
            <template #loading> Loading users data. Please wait. </template>
            <Column field="username" header="Username" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.username }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by username" />
                </template>
            </Column>
            <Column header="Name" filterField="first_name" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.first_name }} {{ data.last_name }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by name" />
                </template>
            </Column>
            <Column header="Email" filterField="email" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ data.email }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by email" />
                </template>
            </Column>
            <Column header="Role" filterField="role" style="min-width: 10rem">
                <template #body="{ data }">
                    {{ data.role }}
                </template>
                <template #filter="{ filterModel }">
                    <InputText v-model="filterModel.value" type="text" placeholder="Search by role" />
                </template>
            </Column>
            <Column header="Team" filterField="team_id" dataType="numeric" style="min-width: 10rem">
                <template #body="{ data }">
                    {{ data.team_id || 'Not assigned' }}
                </template>
                <template #filter="{ filterModel }">
                    <InputNumber v-model="filterModel.value" placeholder="Search by team ID" />
                </template>
            </Column>
            <Column header="Actions" style="min-width: 8rem">
                <template #body="{ data }">
                    <Button label="Edit" class="pi pi-pencil" @click="() => showEditUser(data)" />
                    <Button label="Delete" class="pi pi-trash" @click="() => handleDelete(data)" />
                </template>
            </Column>
        </DataTable>
    </div>
    <div v-else-if="state.error">{{ state.error }}</div>
    <div v-else>
        <p>Loading...</p>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import 'primeicons/primeicons.css';
import { UserService } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useToastHelperService } from '@/services/toastHelperService'
import { type User } from '@/api/generated/models/User'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';

const authStore = useAuthStore()
const { showSuccess, showError } = useToastHelperService()

const filters = ref();

const state = reactive({
    users: [] as User[],
    loading: false,
    error: null as string | null,
})

onMounted(() => {
    fetchUsers()
    initFilters()
})

const initFilters = () => {
    filters.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        email: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        role: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        team_id: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.EQUALS }] },
    };
};

const clearFilter = () => {
    initFilters();
};

async function fetchUsers() {
    state.loading = true
    state.error = null
    try {
        state.users = await UserService.getApiV1Users() as User[]
        showSuccess('Users fetched successfully')
    } catch (error: any) {
        state.error = error?.message || 'An error occurred';
        showError(error.message || 'Failed to fetch users');
    } finally {
        state.loading = false
    }
}

function showEditUser(user: User) {
    alert(`Edit user ${user.username} (ID: ${user.id}) - Functionality not implemented yet.`)
}

async function handleDelete(user: User) {
  if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    await UserService.deleteApiV1Users(user.id as number)
    showSuccess('User deleted successfully')
  }
}

</script>

<style scoped></style>
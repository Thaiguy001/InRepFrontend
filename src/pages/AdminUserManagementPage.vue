<template>
  <div class="user-list-view">
    <UserTable
      :users="state.users"
      :loading="state.loading"
      @edit="showEditUser"
      @delete="confirmDelete"
      @refresh="fetchUsers"
    />

    <EditUserModal
      v-model:visible="editDialog.visible"
      :user="editDialog.user"
      :saving="editDialog.saving"
      @save="handleEditSave"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import ConfirmDialog from 'primevue/confirmdialog'
import UserTable from '@/components/UserTable.vue'
import EditUserModal from '@/components/AdminEditUserModal.vue'
import { UserService } from '@/api'
import { useToastHelperService } from '@/services/toastHelperService'
import { type User } from '@/api/generated/models/User'

const confirm = useConfirm()
const { showSuccess, showError } = useToastHelperService()

const state = reactive({
  users: [] as User[],
  loading: false,
  error: null as string | null,
})

const editDialog = reactive({
  visible: false,
  saving: false,
  user: null as User | null,
})

fetchUsers()

async function fetchUsers() {
  state.loading = true
  state.error = null
  try {
    state.users = await UserService.getApiV1Users() as User[]
  } catch (error: any) {
    state.error = error?.message || 'Failed to load users'
    showError(state.error)
  } finally {
    state.loading = false
  }
}

function showEditUser(user: User) {
  editDialog.user = user
  editDialog.visible = true
}

async function handleEditSave(payload: { role: string }) {
  if (!editDialog.user?.id) return
  editDialog.saving = true
  try {
    const updated = await UserService.putApiV1Users(editDialog.user.id, {
      role: payload.role,
      // TODO: Add team_id here once Teams API is implemented
    }) as User

    const idx = state.users.findIndex(u => u.id === updated.id)
    if (idx !== -1) state.users[idx] = updated

    editDialog.visible = false
    showSuccess(`${editDialog.user.username ?? 'User'} updated successfully`)
  } catch (error: any) {
    showError(error?.message || 'Failed to update user')
  } finally {
    editDialog.saving = false
  }
}

function confirmDelete(user: User) {
  confirm.require({
    message: `Are you sure you want to delete ${user.username ?? 'this user'}? This cannot be undone.`,
    header: 'Delete User',
    icon: 'pi pi-exclamation-triangle',
    rejectLabel: 'Cancel',
    acceptLabel: 'Delete',
    acceptClass: 'p-button-danger',
    accept: () => deleteUser(user),
  })
}

async function deleteUser(user: User) {
  try {
    await UserService.deleteApiV1Users(user.id as number)
    state.users = state.users.filter(u => u.id !== user.id)
    showSuccess(`${user.username ?? 'User'} deleted successfully`)
  } catch (error: any) {
    showError(error?.message || 'Failed to delete user')
  }
}
</script>

<style scoped>
.user-list-view {
  min-height: 100vh;
}
</style>
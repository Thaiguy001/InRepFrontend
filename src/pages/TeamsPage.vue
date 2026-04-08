<template>
  <div class="teams-page">
    <div class="container">
      <div class="page-header">
        <div class="header-content">
          <h1 class="page-title">Teams Management</h1>
          <p class="page-subtitle">Manage your teams and their configurations</p>
        </div>
        <Button icon="pi pi-plus" label="Add Team" @click="openCreateDialog" class="add-button" />
      </div>
      <div class="content-card">
        <DataTable :value="teams" 
          paginator 
          :rows="pageSize" 
          :totalRecords="total" 
          :first="first" 
          @page="onPageChange"
          responsiveLayout="scroll" 
          class="teams-table" stripedRows showGridlines 
          :loading="loading"
          :lazy="true">
          <Column field="name" sortable class="name-column">
            <template #header>
              <div class="column-header">
                <span class="column-title">Name</span>
                <InputText v-model="filters.name" placeholder="Filter by name..." class="column-filter"
                  @input="applyFilters" />
              </div>
            </template>
          </Column>
          <Column field="description" class="description-column">
            <template #header>
              <div class="column-header">
                <span class="column-title">Description</span>
                <InputText v-model="filters.description" placeholder="Filter by description..." class="column-filter"
                  @input="applyFilters" />
              </div>
            </template>
          </Column>
          <Column header="Actions" class="actions-column">
            <template #body="slotProps">
              <div class="action-buttons">
                <Button icon="pi pi-pencil" @click="openEditDialog(slotProps.data)" class="action-button edit-button"
                  v-tooltip.top="'Edit team'" />
                <Button icon="pi pi-trash" @click="confirmDelete(slotProps.data)" class="action-button delete-button"
                  v-tooltip.top="'Delete team'" />
              </div>
            </template>
          </Column>
          <template #empty>
            <div class="empty-state">
              <div class="empty-icon">
                <i class="pi pi-users"></i>
              </div>
              <h3 class="empty-title">No teams found</h3>
              <p class="empty-message">Get started by creating your first team.</p>
            </div>
          </template>
        </DataTable>
      </div>
      <!-- Modern Team Modal -->
      <Modal v-model:visible="dialogVisible" :title="isEditMode ? 'Edit Team' : 'Create New Team'"
        :subtitle="isEditMode ? 'Update team details' : 'Add a new team to your workspace'"
        :icon="isEditMode ? 'pi pi-pencil' : 'pi pi-plus-circle'"
        :confirm-text="isEditMode ? 'Update Team' : 'Create Team'"
        :confirm-icon="submitting ? 'pi pi-spin pi-spinner' : (isEditMode ? 'pi pi-check' : 'pi pi-plus')"
        :loading="submitting" @close="dialogVisible = false" @confirm="submitForm">
        <form @submit.prevent="submitForm" class="team-form-modern">
          <!-- Team Name Field -->
          <FormInput id="name" label="Team Name" icon="pi pi-tag" v-model="formData.name"
            placeholder="Enter team name..." :error="errors.name" :required="true" />
          <!-- Description Field -->
          <FormTextarea id="description" label="Description" icon="pi pi-align-left" v-model="formData.description"
            placeholder="Describe your team's purpose and goals..." :error="errors.description" :rows="3" />
        </form>
      </Modal>
      <ConfirmDialog group="delete" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConfirm } from 'primevue/useconfirm'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Modal from '@/components/common/Modal.vue'
import FormInput from '@/components/common/FormInput.vue'
import FormTextarea from '@/components/common/FormTextarea.vue'
import ConfirmDialog from 'primevue/confirmdialog'
import type { Team, Query } from '@/api'
import { useTeamsData, useTeamsForm } from '@/composables/useTeams'

// Composables
const { teams, total, loading, createTeam, updateTeam, deleteTeam, queryTeams } = useTeamsData()
const { formData, errors, resetForm, setFormData, validate, getFormValues } = useTeamsForm()

// Services
const confirm = useConfirm()

// State
const dialogVisible = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const first = ref(0)
const pageSize = ref(10)
const filters = ref({
  name: '',
  description: '',
})

// Core fetch — always uses current first/pageSize/filters state
async function fetchData() {
  const query: Query = {
    first: first.value,
    rows: pageSize.value,
    filters: {},
  }

  if (filters.value.name) {
    query.filters!['name'] = {
      value: filters.value.name,
      matchMode: 'contains',
    }
  }

  if (filters.value.description) {
    query.filters!['description'] = {
      value: filters.value.description,
      matchMode: 'contains',
    }
  }

  await queryTeams(query)
}

// Resets to page 1 then fetches — used when filters change
async function applyFilters() {
  first.value = 0
  await fetchData()
}

// Updates pagination state then fetches — does NOT reset first
async function onPageChange(event: { first: number; rows: number }) {
  first.value = event.first
  pageSize.value = event.rows
  await fetchData()
}

// Methods
function openCreateDialog() {
  isEditMode.value = false
  resetForm()
  dialogVisible.value = true
}

function openEditDialog(team: Team) {
  isEditMode.value = true
  setFormData(team)
  dialogVisible.value = true
}

async function submitForm() {
  if (!validate()) {
    return
  }
  submitting.value = true
  try {
    const values = getFormValues()
    if (isEditMode.value && values.id) {
      const { id, ...teamData } = values
      await updateTeam(id, teamData)
    } else {
      await createTeam(values)
    }
    dialogVisible.value = false
    resetForm()
    // Stay on the current page after create/update
    await fetchData()
  } finally {
    submitting.value = false
  }
}

function confirmDelete(team: Team) {
  confirm.require({
    group: 'delete',
    message: `Are you sure you want to delete the team "${team.name}"?`,
    header: 'Confirm Deletion',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      await deleteTeam(team.id!)
      // Stay on the current page after delete
      await fetchData()
    },
  })
}

// Lifecycle
onMounted(() => {
  applyFilters()
})
</script>

<style scoped lang="scss">
.teams-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--surface-50) 0%, var(--surface-100) 100%);
  padding: 2rem 1rem;

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    padding: 2rem;
    background: var(--surface-0);
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid var(--surface-200);

    .header-content {
      .page-title {
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-color);
        margin: 0 0 0.5rem 0;
        letter-spacing: -0.025em;
      }

      .page-subtitle {
        font-size: 1rem;
        color: var(--text-muted-color);
        margin: 0;
        font-weight: 400;
      }
    }

    .add-button {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      border-radius: 0.75rem;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      color: white;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.3);

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px 0 rgba(16, 185, 129, 0.4);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }

  .content-card {
    background: var(--surface-0);
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid var(--surface-200);
    overflow: hidden;

    .teams-table {
      :deep(.p-datatable-header) {
        display: none;
      }

      :deep(.p-datatable-thead > tr > th) {
        background: var(--surface-50);
        border-bottom: 2px solid var(--surface-200);
        font-weight: 600;
        color: var(--text-color);
        font-size: 0.875rem;
        padding: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      :deep(.p-datatable-tbody > tr) {
        transition: background-color 0.2s ease;

        &:hover {
          background: var(--surface-50);
        }

        >td {
          padding: 1rem;
          border-bottom: 1px solid var(--surface-100);
          color: var(--text-color);
        }
      }

      .column-header {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .column-title {
          font-weight: 600;
          color: var(--text-color);
          font-size: 0.875rem;
        }

        .column-filter {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid var(--surface-300);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;

          &:focus {
            outline: none;
            border-color: var(--primary-500);
            box-shadow: 0 0 0 3px rgba(var(--primary-500-rgb), 0.1);
          }
        }
      }

      .name-column {
        width: 30%;
      }

      .description-column {
        width: 55%;
      }

      .actions-column {
        width: 15%;
        text-align: center;

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          justify-content: center;

          .action-button {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 0.5rem;
            border: none;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;

            &.edit-button {
              background: var(--surface-100);
              color: var(--text-color);

              &:hover {
                background: var(--primary-50);
                color: var(--primary-700);
                transform: translateY(-1px);
              }
            }

            &.delete-button {
              background: var(--red-50);
              color: var(--red-500);

              &:hover {
                background: var(--red-100);
                transform: translateY(-1px);
              }
            }
          }
        }
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem 2rem;
        text-align: center;

        .empty-icon {
          width: 4rem;
          height: 4rem;
          background: linear-gradient(135deg, var(--surface-200) 0%, var(--surface-300) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;

          i {
            font-size: 2rem;
            color: var(--text-muted-color);
          }
        }

        .empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-color);
          margin: 0 0 0.5rem 0;
        }

        .empty-message {
          font-size: 1rem;
          color: var(--text-muted-color);
          margin: 0;
        }
      }
    }
  }

  // Responsive design
  @media (max-width: 768px) {
    .teams-page {
      padding: 1rem 0.5rem;

      .page-header {
        flex-direction: column;
        gap: 1.5rem;
        padding: 1.5rem;
        text-align: center;

        .page-title {
          font-size: 1.5rem;
        }

        .add-button {
          width: 100%;
          justify-content: center;
        }
      }

      .content-card {
        .teams-table {

          :deep(.p-datatable-thead > tr > th),
          :deep(.p-datatable-tbody > tr > td) {
            padding: 0.75rem 0.5rem;
            font-size: 0.875rem;
          }

          .name-column {
            width: 40%;
          }

          .description-column {
            width: 45%;
          }

          .actions-column {
            width: 15%;

            .action-buttons {
              flex-direction: column;
              gap: 0.25rem;

              .action-button {
                width: 2rem;
                height: 2rem;

                i {
                  font-size: 0.875rem;
                }
              }
            }
          }
        }
      }

      .modal-container {
        max-width: 95%;
        margin: 1rem;

        .modal-header {
          padding: 1.5rem 1.5rem 1rem 1.5rem;

          .header-content {
            gap: 0.75rem;

            .header-icon {
              width: 2.5rem;
              height: 2.5rem;

              i {
                font-size: 1rem;
              }
            }

            .header-text {
              .modal-title {
                font-size: 1.25rem;
              }

              .modal-subtitle {
                font-size: 0.8rem;
              }
            }
          }

          .close-button {
            top: 1rem;
            right: 1rem;
            width: 2rem;
            height: 2rem;

            i {
              font-size: 0.875rem;
            }
          }
        }

        .modal-body {
          padding: 1.5rem;

          .team-form-modern {
            .form-group-modern {
              margin-bottom: 1.5rem;

              .input-wrapper {
                .input-label {
                  font-size: 0.8rem;
                  margin-bottom: 0.5rem;

                  i {
                    font-size: 0.75rem;
                  }
                }

                .input-container {
                  .modern-input {
                    padding: 0.875rem 1rem;
                    font-size: 0.9rem;

                    &.textarea-input {
                      min-height: 70px;
                    }
                  }
                }
              }
            }
          }
        }

        .modal-footer {
          padding: 1.5rem;

          .footer-actions {
            gap: 0.75rem;
            flex-wrap: wrap;

            .btn-secondary,
            .btn-primary {
              min-width: auto;
              width: calc(50% - 0.375rem);
              padding: 0.75rem 1rem;
              font-size: 0.85rem;

              i {
                font-size: 0.75rem;
              }
            }
          }
        }
      }
    }
  }

  @media (max-width: 480px) {
    .teams-page {
      .page-header {
        padding: 1rem;

        .page-title {
          font-size: 1.25rem;
        }
      }

      .content-card {
        .teams-table {
          .empty-state {
            padding: 2rem 1rem;

            .empty-icon {
              width: 3rem;
              height: 3rem;

              i {
                font-size: 1.5rem;
              }
            }

            .empty-title {
              font-size: 1rem;
            }

            .empty-message {
              font-size: 0.875rem;
            }
          }
        }
      }
    }
  }
}
</style>
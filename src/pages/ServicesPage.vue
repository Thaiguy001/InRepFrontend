<template>
    <div class="container">
        <div class="header-row">
            <div>
                <h1>Services</h1>
                <p class="subtitle">Manage and configure organization services</p>
            </div>

            <Button icon="pi pi-plus" class="create-button" rounded @click="openCreate" />
        </div>

        <div v-if="!state.loading" class="service-list">
            <Card v-for="service in services" :key="service.id" class="service-card compact-card"
                @click="openServicePage(service.id)">
                <template #title>
                    <div class="card-header">
                        <span class="service-title">
                            <span class="service-name">{{ service.name }}</span>
                            <span class="service-description">{{ service.description }}</span>
                        </span>

                        <Button icon="pi pi-ellipsis-v" text rounded severity="secondary" aria-label="Edit service"
                            @click.stop="openEdit(service)" />
                    </div>
                </template>
            </Card>
        </div>

        <div v-else class="loading">
            <ProgressSpinner />
        </div>

        <Message v-if="state.error" severity="error" class="error-message">
            {{ state.error }}
        </Message>
    </div>

    <Dialog v-model:visible="dialogVisible" modal :header="editing ? 'Edit Service' : 'Create Service'"
        style="width: 440px">
        <div class="dialog-form">
            <label for="service-name">Name</label>
            <InputText id="service-name" v-model="form.name" placeholder="Enter service name" />

            <label for="service-description">Description</label>
            <InputText id="service-description" v-model="form.description" placeholder="Enter service description" />
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" severity="secondary" @click="dialogVisible = false" />
            <Button v-if="editing" label="Delete" icon="pi pi-trash" severity="danger" @click="deleteService" />
            <Button label="Save" icon="pi pi-check" @click="saveService" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue"

import Card from "primevue/card"
import Button from "primevue/button"
import Dialog from "primevue/dialog"
import InputText from "primevue/inputtext"
import Message from "primevue/message"
import ProgressSpinner from "primevue/progressspinner"
import 'primeicons/primeicons.css'
import { useRouter } from "vue-router"
import { ServiceService } from "@/api"
import { useToastHelperService } from "@/services/toastHelperService"

interface Service {
    id: number
    name: string
    description: string
}

const toast = useToastHelperService()
const router = useRouter()

const services = ref<Service[]>([])

const state = reactive({
    loading: false,
    error: null as string | null
})

const dialogVisible = ref(false)
const editing = ref(false)

type ServiceForm = {
    name: string
    description: string
}

const form = reactive<ServiceForm>({
    name: "",
    description: ""
})

let editingId: number | null = null

onMounted(() => {
    fetchServices()
})

async function fetchServices() {
    state.loading = true
    state.error = null

    try {
        const response = await ServiceService.getApiV1Service()

        if (Array.isArray(response)) {
            if (response.length === 0) {
                state.error = "No services found"
            } else {
                services.value = response.filter(s => s.id !== undefined) as Service[]
            }
        } else if ("message" in response) {
            state.error = response.message ?? "Failed to load services"
        }
    } catch (err: any) {
        toast.showError("Failed to load services", err?.message)
    } finally {
        state.loading = false
    }
}

function openServicePage(serviceId: number) {
    router.push(`/service/${serviceId}`)
}

function openCreate() {
    editing.value = false
    editingId = null

    form.name = ""
    form.description = ""

    dialogVisible.value = true
}

function openEdit(service: Service) {
    editing.value = true
    editingId = service.id ?? null

    form.name = service.name
    form.description = service.description

    dialogVisible.value = true
}

async function saveService() {
    try {
        if (editing.value && editingId) {
            await ServiceService.putApiV1ServiceUpdate(editingId, form)
            toast.showSuccess("Service updated")
        } else {
            await ServiceService.postApiV1ServiceCreate(form)
            toast.showSuccess("Service created")
        }

        dialogVisible.value = false
        fetchServices()
    } catch (err: any) {
        toast.showError("Save failed", err?.message)
    }
}

async function deleteService() {
    if (!editingId) return

    if (!confirm("Delete this service?")) return

    try {
        await ServiceService.deleteApiV1ServiceDelete(editingId)
        toast.showSuccess("Service deleted")
        dialogVisible.value = false
        fetchServices()
    } catch (err: any) {
        toast.showError("Delete failed", err?.message)
    }
}
</script>

<style scoped>
.container {
    max-width: 900px;
    margin: auto;
    padding: 8px 0 24px;
}

/* HEADER */

.header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
}

h1 {
    color: #f9fafb;
    margin: 0;
    font-size: 2rem;
    font-weight: 700;
}

.subtitle {
    margin: 4px 0 0;
    color: #b0b8c4;
    font-size: 0.95rem;
}

.create-button {
    width: 44px;
    height: 44px;
    font-size: 1.3rem;
    flex-shrink: 0;
}

/* SERVICE LIST */

.service-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.service-card {
    border: 1px solid #2f3745;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.15s ease;
    background: #1b1f27;
    color: #f3f4f6;
}

.service-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
    border-color: #4b5563;
}

/* Compact card spacing */

.compact-card :deep(.p-card-body) {
    padding: 0.55rem 0.9rem;
}

.compact-card :deep(.p-card-content) {
    padding: 0;
}

.compact-card :deep(.p-card-title) {
    margin: 0;
    color: inherit;
}

/* Card row */

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 34px;
}

/* Service text */

.service-title {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;
    overflow-wrap: anywhere;
    flex: 1;
}

.service-name {
    font-size: 1rem;
    font-weight: 700;
    color: #f9fafb;
    line-height: 1.2;
    white-space: nowrap;
    flex-shrink: 0;
}

.service-description {
    color: #cbd5e1;
    font-size: 0.92rem;
    line-height: 1.3;
    overflow-wrap: anywhere;
    opacity: 0.95;
}

/* Dialog */

.dialog-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-top: 4px;
}

.dialog-form label {
    font-weight: 600;
    color: #e5e7eb;
    margin-top: 4px;
}

/* Loading + errors */

.loading {
    display: flex;
    justify-content: center;
    padding: 40px;
}

.error-message {
    margin-top: 16px;
}
</style>
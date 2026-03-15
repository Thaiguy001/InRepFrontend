<template>

    <div class="container">

        <div class="header-row">

            <h1>Services</h1>

            <Button icon="pi pi-plus" class="create-button" rounded @click="openCreate" />

        </div>


        <div v-if="!state.loading" class="service-list">

            <Card v-for="service in services" :key="service.id" class="service-card" @click="openEdit(service)">

                <template #title>
                    {{ service.name }}
                </template>

                <template #content>
                    <p>{{ service.description }}</p>
                </template>

            </Card>

        </div>

        <div v-else class="loading">
            <ProgressSpinner />
        </div>

        <Message v-if="state.error" severity="error">
            {{ state.error }}
        </Message>

    </div>


    <!-- SERVICE EDIT / CREATE -->

    <Dialog v-model:visible="dialogVisible" modal :header="editing ? 'Edit Service' : 'Create Service'"
        style="width:420px">

        <div class="dialog-form">

            <label>Name</label>
            <InputText v-model="form.name" />

            <label>Description</label>
            <InputText v-model="form.description" />

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

import { ServiceService } from "@/api"
import { useToastHelperService } from "@/services/toastHelperService"

interface Service {
    id?: number
    name: string
    description: string
}

const toast = useToastHelperService()

const services = ref<Service[]>([])

const state = reactive({
    loading: false,
    error: null as string | null
})

const dialogVisible = ref(false)
const editing = ref(false)

const form = reactive<Service>({
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
            services.value = response
        } else if ("message" in response) {
            state.error = response.message ?? "Failed to load services"
        }

    } catch (err: any) {

        toast.showError("Failed to load services", err?.message)

    } finally {

        state.loading = false

    }
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

.container{
    max-width:900px;
    margin:auto;
}

/* HEADER */

.header-row{
    display:flex;
    align-items:center;
    justify-content:space-between;
    margin-bottom:20px;
}

/* Large circular create button */

.create-button{
    width:44px;
    height:44px;
    font-size:1.3rem;
}

/* SERVICE LIST */

.service-list{
    display:flex;
    flex-direction:column;
    gap:14px;
}

.service-card{
    border:1px solid #e5e7eb;
    border-radius:10px;
    cursor:pointer;
    transition:all .15s ease;
}

.service-card:hover{
    transform:translateY(-2px);
    box-shadow:0 6px 14px rgba(0,0,0,.08);
}

/* DIALOG */

.dialog-form{
    display:flex;
    flex-direction:column;
    gap:8px;
}

/* loading alignment */

.loading{
    display:flex;
    justify-content:center;
    padding:40px;
}

</style>


<template>
    <div class="testPage">
        <div>
            <h1>Test Page</h1>
            <p>Test page</p>
            <div class="mb-3">
                <label for="serviceId" class="block mb-1">Service ID:</label>
                <input id="serviceId" type="number" v-model.number="state.requestId" class="border rounded p-1" />
                <button class="p-button p-button-primary ml-2" @click="fetchTest()" :disabled="state.loading">
                    Fetch
                </button>
            </div>
        </div>
        <div v-if="!state.loading && state.service">
            <Card class="mb-3">
                <template #title>id: [{{ state.service?.id }}]</template>
                <template #content>
                    <p>Name: {{ state.service?.name }}</p>
                    <p>Description: {{ state.service?.description }}</p>
                </template>
                
            </Card>
        </div>
        <div v-else-if="state.error">{{ state.error }}</div>
        <div v-else-if="state.loading">
            <p>Loading...</p>
        </div>
    </div>
    <hr />
    <h3>Toast test</h3>
    <div class="grid">
        <Button class="col-1" label="Success" severity="success" @click="showSuccess" />
        <Button class="col-1" label="Info" severity="info" @click="showInfo" />
        <Button class="col-1" label="Warn" severity="warn" @click="showWarn" />
        <Button class="col-1" label="Error" severity="danger" @click="showError" />
        <Button class="col-1" label="Secondary" severity="secondary" @click="showSecondary" />
        <Button class="col-1" label="Contrast" severity="contrast" @click="showContrast" />
    </div>

</template>

<script setup lang="ts">
import Card from 'primevue/card'
import { reactive } from 'vue'
import { type Service } from '@/api/generated/models/Service'
import { ServiceService } from '@/api'
import { useToast } from "primevue/usetoast";
import Button from 'primevue/button'

const toast = useToast();

const state = reactive({
	service: null as Service | null,
    loading: false,
    error: null as string | null,
    requestId: 0,
})

async function fetchTest() {
    state.loading = true
    state.error = null
    state.service = null
    try {
        const result = await ServiceService.getApiV1ServiceId(state.requestId);

        // the generated client returns Service | Error
        if (result) {
            state.service = result as Service;
            console.log(state.service)
        } else if (result && 'message' in result) {
            // service returned an Error object from API
            state.error = (result as Error).message || 'Service request failed';
        } else {
            state.error = 'Service not found'
        }
    } catch (error: any) {
        state.error = error?.message || 'An error occurred'
    } finally {
        state.loading = false
    }
}

// Toast tests
const showSuccess = () => {
    toast.add({ severity: 'success', summary: 'Success Message', detail: 'Message Content', life: 3000 });
};

const showInfo = () => {
    toast.add({ severity: 'info', summary: 'Info Message', detail: 'Message Content', life: 3000 });
};

const showWarn = () => {
    toast.add({ severity: 'warn', summary: 'Warn Message', detail: 'Message Content', life: 3000 });
};

const showError = () => {
    toast.add({ severity: 'error', summary: 'Error Message', detail: 'Message Content', life: 3000 });
};

const showSecondary = () => {
    toast.add({ severity: 'secondary', summary: 'Secondary Message', detail: 'Message Content', life: 3000 });
};

const showContrast = () => {
    toast.add({ severity: 'contrast', summary: 'Contrast Message', detail: 'Message Content', life: 3000 });
};

</script>

<style scoped>
.testPage {
    width: 85vw;
    margin-left: 15vw;
    padding: 3%;
}

</style>

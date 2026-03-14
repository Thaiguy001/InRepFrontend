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
        <Button class="col-1" label="Success" severity="success" @click="() => showSuccess()" />
        <Button class="col-1" label="Info" severity="info" @click="() => showInfo()" />
        <Button class="col-1" label="Warn" severity="warn" @click="() => showWarn()" />
        <Button class="col-1" label="Error" severity="danger" @click="() => showError()" />
        <Button class="col-1" label="Secondary" severity="secondary" @click="() => showSecondary()" />
        <Button class="col-1" label="Contrast" severity="contrast" @click="() => showContrast()" />
    </div>

</template>

<script setup lang="ts">
import Card from 'primevue/card'
import { reactive } from 'vue'
import { type Service } from '@/api/generated/models/Service'
import { ServiceService } from '@/api'
import Button from 'primevue/button'
import { useToastHelperService } from '@/services/toastHelperService'

const { showSuccess, showInfo, showWarn, showError, showSecondary, showContrast } = useToastHelperService()

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
            showSuccess('Service fetched successfully');
            state.service = result as Service;
            console.log(state.service)
        } else if (result && 'message' in result) {
            // service returned an Error object from API
            state.error = (result as Error).message || 'Service request failed';
            showError('Failed to fetch service', state.error);
        } else {
            state.error = 'Service not found'
            showWarn('Service not found', state.error);
        }
    } catch (error: any) {
        state.error = error?.message || 'An error occurred'
        showError('An error occurred while fetching the service', state.error || 'Unknown error');
    } finally {
        state.loading = false
    }
}

// Toast tests



</script>

<style scoped>
.testPage {
    width: 85vw;
    margin-left: 15vw;
    padding: 3%;
}

</style>

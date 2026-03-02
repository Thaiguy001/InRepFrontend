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

</template>

<script setup lang="ts">
import Card from 'primevue/card'
import { reactive } from 'vue'
import { type Service } from '@/api/generated/models/Service'
import { ServiceService } from '@/api'

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

</script>

<style scoped>
.testPage {
    width: 85vw;
    margin-left: 15vw;
    padding: 3%;
}
</style>

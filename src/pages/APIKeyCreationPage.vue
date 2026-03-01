<template>
    <h1>
        API Key Creation Simulator
    </h1>
    <div v-if="!state.loading">
        <form @submit.prevent="serviceFetch">
            <div>Select a service for for the API key: </div>

            <select v-model="selected">
            <option disabled value="">Select a service:</option>
            <option v-for="service in services" :key="service.id" :value="service.id">{{ service.name }}</option>
            </select>
            <br><br>
            <Button @click="createAPIKey" type="submit" label="Create API Key" class="p-mt-2" />
        </form>
    </div>
    <div v-else-if="state.error">{{ state.error }}</div>
    <div v-else>
        <p>Loading...</p>
    </div>
    <div v-if="state.key">
        Copy the API Key: {{ state.key }}
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { ServiceService, ApiKeyService } from '@/api/generated'

const selected = ref('')

onMounted(() => {
    console.log('AboutView mounted')
    serviceFetch()
})

const state = reactive({
    loading: false,
    key: null as string | null | undefined,
    error: null as string | null,
})

interface Service {
    id: number
    name: string
    description: string
}
const services = ref<Service[]>([])

async function serviceFetch() {
    state.loading = true
    state.error = null
    // Gets the list of sercives from the backend to populate the dropdown menu
    // if (!selected.value) return
    try {
        const response = await ServiceService.getApiV1Service()
        console.log('Services fetched successfully:', response)
        const validServices = []
        for (const service of response as Service[]) {
            const validResponse = await ApiKeyService.getApiV1ApiKeyService(service.id)
            console.log('Service:', service)
            console.log('API key response for service:', validResponse)
            if (Array.isArray(validResponse) && validResponse.length > 0) {
                continue
            } else {
                console.log('Service is valid for API key creation:', service)
                validServices.push(service)
            }
        }
        services.value = validServices
    } catch (error: any) {
        console.error('Error fetching services:', error)
        state.error = error?.message || 'An error occurred while fetching services.'
        alert('Failed to fetch services. Please try again.')
    } finally {
        state.loading = false
    }
}

async function createAPIKey() {
    if (!selected.value) {
        alert('Please select a service to create an API key for.')
        return
    }
    try {
        const serviceId = parseInt(selected.value)
        const response = await ApiKeyService.postApiV1ApiKeyServiceGenerate(serviceId)
        if ('key' in response) {
            state.key = response.key
        } else if ('message' in response) {
            state.error = response.message ?? 'Failed to create API key.'
            alert(state.error)
            return
        }
    } catch (error) {
        console.error('Error creating API key:', error)
        alert('Failed to create API key. Please try again.')
    }
}
</script>
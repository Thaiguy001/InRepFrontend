<template>
    <h1>
        API Key Creation Simulator
    </h1>
    <div v-if="!state.loading && !state.key && !state.error">
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
    <div v-else v-if="!state.key">
        <p>Loading...</p>
    </div>
    <div v-if="state.key">
        Please copy and store your API key securely. It will not be shown again after this page is reloaded or navigated away from.
        <pre>{{ revealed ? state.key : '**************************************************' }}<button v-if="revealed" @click="copyKey" class="copy-button">Copy</button></pre>
        <button class="key-block" @click="toggle">{{ revealed ? 'Hide Key' : 'Reveal Key' }}</button>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { ServiceService, ApiKeyService } from '@/api'

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


const revealed = ref(false)
function toggle() {
    revealed.value = !revealed.value
}
function copyKey() {
    if (state.key) {
        navigator.clipboard.writeText(state.key)
        alert('API Key copied to clipboard!')
    }
}

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
        if (validServices.length === 0) {
            state.error = 'All Services already have API keys. Please delete an existing API key before creating a new one.'
            state.key = undefined
            alert(state.error)
            return
        } else {
            services.value = validServices
        }
        
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

<style scoped>  
.key-block {
    user-select: text;
    background: #111;
    padding: 8px;
    border-radius: 4px;
}
.copy-button {
    margin-left: 10px;
    padding: 4px 8px;
    font-size: 0.9em;
    cursor: pointer;
}
</style>
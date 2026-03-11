<template>
<Card style="max-width:600px; margin:auto">
<template #title>
API Key Creation Simulator
</template>

<template #content>

<div v-if="!state.loading && !state.key && !state.error">

<form @submit.prevent="createAPIKey">

<div class="field">
<label>Select a service: </label>

<Select
    v-model="selected"
    :options="services"
    optionLabel="name"
    optionValue="id"
    placeholder="Select a service"
/>
</div>

<Button v-if="selected"
    type="submit"
    label="Create API Key"
    icon="pi pi-key"
    class="p-mt-3"
/>

</form>

</div>

<Message v-else-if="state.error" severity="error">
{{ state.error }}
</Message>

<div v-else-if="state.loading">
<ProgressSpinner />
</div>

<div v-if="state.key" class="key-section">

<p>
Please copy and store your API key securely. It will not be shown again
after leaving this page.
</p>

<InputGroup>

<Password
    :modelValue="state.key"
    :feedback="false"
    toggleMask
    readonly
    :inputProps="{ readonly: true }"
    class="w-full"
/>

<Button
    icon="pi pi-copy"
    label="Copy"
    @click="copyKey"
/>

</InputGroup>
<div class="p-mt-3">

<Button
    label="Create Another Key"
    icon="pi pi-refresh"
    severity="secondary"
    @click="refreshPage"
/>
</div>
</div>

</template>
</Card>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Select from 'primevue/select'
import Password from 'primevue/password'
import InputGroup from 'primevue/inputgroup'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
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
    if (state.key) {
        state.loading = false
        console.log('API key already generated, skipping service fetch.')
        return
    }
    // Gets the list of sercives from the backend to populate the dropdown menu
    // if (!selected.value) return
    try {
        const response = await ServiceService.getApiV1Service()
        console.log('Services fetched successfully:', response)
        const validServices = []

        for (const service of response as Service[]) {
            console.log('Service is valid for API key creation:', service)
            validServices.push(service)
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

function refreshPage() {
    window.location.reload()
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
.field {
    margin-bottom: 1.5rem;
}

.key-section {
    margin-top: 1rem;
}
</style>
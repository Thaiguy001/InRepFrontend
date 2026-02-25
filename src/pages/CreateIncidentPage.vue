<template> 
    <h1>Incident Creation Simulator</h1>
    <form @submit.prevent="fetchTest">
        <div class="p-field">
            <label for="name">Incident Name:</label>
            <InputText id="name" v-model="state.testMessage" required />
        </div>
        <div class="p-field">
            <label for="name">API Key (optional):</label>
            <InputText id="name" v-model="state.testApiKey" required />
        </div>
        <div class="p-field">
            <p for="description">Incident Description:</p>
            <textarea id="description" v-model="state.testDescription" required />
        </div>
        <div class="p-field">
            <p for="severity">Incident Severity:</p>
            <input type="radio" id="low" value="low" v-model="state.testSeverity" required />
            <label for="low">Low</label>
            <input type="radio" id="medium" value="medium" v-model="state.testSeverity" required />
            <label for="medium">Medium</label>
            <input type="radio" id="high" value="high" v-model="state.testSeverity" required />
            <label for="high">High</label>
            <input type="radio" id="critical" value="critical" v-model="state.testSeverity" required />
            <label for="critical">Critical</label>
        </div>
        <p></p>
        <Button type="submit" label="Create Incident" class="p-mt-2" />
    </form>
</template>

<script setup lang="ts">    
import { reactive } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

const state = reactive({
    testMessage: null as string | null,
    testDescription: null as string | null,
    testSeverity: null as string | null,
    testApiKey: null as string | null,
})
async function fetchTest() {
    if (!state.testMessage) return

    try {
        // Simulate API call to create an incident
        console.log('Creating incident with name:', state.testMessage)
        console.log('Description:', state.testDescription)
        console.log('Severity:', state.testSeverity)
        console.log('API Key:', state.testApiKey)
        // Here you would typically call your API to create the incident
        // For example: await IncidentService.createIncident({ name: state.testMessage })
        alert(`Incident "${state.testMessage}" created successfully!`)
        state.testMessage = null // Clear the input after creation
    } catch (error) {
        console.error('Error creating incident:', error)
        alert('Failed to create incident. Please try again.')
    }
}
</script>
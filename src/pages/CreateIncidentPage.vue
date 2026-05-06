<template>
    <div class="content-body">
        <PageHeader
            title="Incident Creation Simulator"
            subtitle="Manually trigger test incidents using an API key"
        />

        <form @submit.prevent="fetchTest" class="form-card">
            <div class="form-grid">

                <div class="form-field">
                    <label for="name">Incident Name</label>
                    <InputText id="name" v-model="state.testMessage" required />
                </div>

                <div class="form-field">
                    <label for="apiKey">API Key</label>
                    <InputText id="apiKey" v-model="state.testApiKey" required />
                </div>

                <div class="form-field">
                    <label>Incident Severity</label>
                    <div class="radio-group">
                        <input type="radio" name="severity" id="low" value="low" v-model="state.testSeverity" required />
                      <label for="low">Low</label>

                        <input type="radio" name="severity" id="medium" value="medium" v-model="state.testSeverity" required />
                        <label for="medium">Medium</label>

                        <input type="radio" name="severity" id="high" value="high" v-model="state.testSeverity" required />
                        <label for="high">High</label>

                        <input type="radio" name="severity" id="critical" value="critical" v-model="state.testSeverity" required />
                        <label for="critical">Critical</label>
                    </div>
                </div>

                <Button type="submit" label="Create Incident" />
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { IncidentService } from '@/api'
import { type IncidentCreate } from "@/api/generated/models/IncidentCreate";
import { useToastHelperService } from "@/services/toastHelperService"

const toast = useToastHelperService()
import PageHeader from '@/components/common/PageHeader.vue'
import '@/assets/style.css'

const state = reactive({
    testMessage: null as string | null,
    testDescription: null as string | null,
    testSeverity: null as string | null,
    testApiKey: '' as string,
})

async function fetchTest() {
    if (!state.testMessage) return

    try {
        const incidentCreate = {
            summary: state.testMessage,
            severity: state.testSeverity || 'low',
        }

        const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/api/v1/incidents', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'X-API-Key': state.testApiKey,
            },
            body: JSON.stringify(incidentCreate),
        })
        if (!response.ok) {
            if (response.status === 401) {
                toast.showError('Unauthorized. Invalid API key.')
                return
            }

            toast.showError('Failed to create incident.')
            return
        }
        toast.showSuccess('Incident created successfully!')
        state.testMessage = null
        state.testSeverity = null
    } catch (error) {
        toast.showError('Failed to create incident. Please try again.')
    }
}
</script>
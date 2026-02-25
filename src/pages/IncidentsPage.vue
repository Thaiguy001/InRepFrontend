<template>
    <h1>Incidents</h1>
    <table>
        <tbody>
            <tr>
                <td><input type="checkbox" name="Unresolved" id="unresolved" v-model="showUnResolved"></td>
                <td><p>Unresolved</p> </td>
                <td><input type="checkbox" name="Resolved" id="resolved" v-model="showResolved"></td>
                <td><p>Resolved</p></td>
            </tr>
        </tbody>
    </table>
  <div class="testPage">
        <div class="incident-list" v-if="!state.loading">
            <div v-for="(incident, index) in incidents">
                <Card class="mb-3 issue-card" 
                    v-if="(incident.status === 'open' && showUnResolved) || (incident.status === 'closed' && showResolved)"    
                    :key="index" 
                    @click="openIncident(incident.id)">
                
                    <template #title>
                        <div class="row">
                            <span class="icon">
                                <i v-if="incident.status === 'closed'" class="pi pi-check-circle green"></i>
                                <i v-if="incident.status === 'open'" class="pi pi-minus-circle red"></i> 
                            </span>
                            <span>{{ incident.name }}: {{ incident.description }} </span>
                            <span class="right" :class="severityClass(incident.severity)">{{ incident.severity }}</span>
                        </div>
                    </template>

                    <template #content> 
                        <div class="incident-meta">
                            <span class="issue-number">#{{ incident.id }}</span>
                            <span v-if="incident.status === 'open'">
                            reported at {{ formatTimestamp(incident.created_at) }} by {{ incident.author }}
                            </span>
                            <span v-if="incident.status === 'closed'">
                            resolved at {{ formatTimestamp(incident.resolved_at!) }}
                            </span>
                        </div>
                    </template>
                </Card>
            </div>
            
        </div>
        <div v-else-if="state.error">{{ state.error }}</div>
        <div v-else>
            <p>Loading...</p>
        </div>
    </div>
</template>


<script setup lang="ts">
import Card from 'primevue/card'
import { onMounted, ref, reactive } from 'vue'
import { IncidentService } from '@/api/generated'
import { definePreset } from '@primevue/themes'
import 'primeicons/primeicons.css'

const showResolved = ref(false)
const showUnResolved = ref(true)

const state = reactive({
    testMessage: null as string | null,
    loading: false,
    error: null as string | null,
})

onMounted(() => {
    console.log('AboutView mounted')
    fetchTest()
})

interface IncidentsResponse {
    incidents: Incident[]
}
interface Incident {
    name: string
    id: number
    description: string
    status: string
    severity: string
    author: string
    created_at: number
    resolved_at: number | null
}
const incidents = ref<Incident[]>([])

async function fetchTest() {
    state.loading = true
    state.error = null

    try {
        const response = await IncidentService.getApiV1Incidents()

        if ('incidents' in response && Array.isArray(response.incidents)) {
            incidents.value = response.incidents
        } else if ('message' in response) {
            state.error = response.message ?? 'There are no incidents'
        }
    } catch (error: any) {
        state.error = error?.message || 'An error occurred'
    } finally {
        state.loading = false
    }
}

function openIncident(incident_id: number) {
    window.open(`/incident/${incident_id}`, '_blank')?.focus()
}

function formatTimestamp(ts: number): string {
    return new Date(ts * 1000).toLocaleString()
}

function severityClass(severity: string) {
    switch (severity?.toLowerCase()) {
        case 'low':
            return 'severity-low'
        case 'medium':
            return 'severity-medium'
        case 'high':
            return 'severity-high'
        case 'critical':
            return 'severity-critical'
        default:
            return ''
        }
}
</script>

<style scoped>
.green {
    color: green;
}
.red {
    color: red;
}
.right {
    float: right;
    margin-left: auto;
}
.row {
    display: flex;
    justify-content: space-between;
}
.icon {
    margin-right: 10px;
}
.incident-meta {
    display: flex;
    justify-content: space-between;
    font-size: 0.9em;
    color: #555;
}
.severity-critical {
    color: #ff0000;
    font-weight: bold;
}
.severity-high {
    color: #e8670b;
    font-weight: bold;
}
.severity-medium {
    color: rgb(201, 211, 17);
    font-weight: bold;
}
.severity-low {
    color: rgb(48, 222, 249);
    font-weight: bold;
}
</style>
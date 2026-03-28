<template>
    <div class="container">
        <div class="header-section">
            <h1>Incidents</h1>

            <div class="filter-panel">
                <div class="checkbox-group">
                    <div class="checkbox-item">
                        <Checkbox v-model="showUnResolved" binary inputId="unresolved" />
                        <label for="unresolved">Unresolved</label>
                    </div>

                    <div class="checkbox-item">
                        <Checkbox v-model="showResolved" binary inputId="resolved" />
                        <label for="resolved">Resolved</label>
                    </div>

                    <div class="checkbox-item">
                        <Checkbox v-model="showAcknowledged" binary inputId="acknowledged" />
                        <label for="acknowledged">Acknowledged</label>
                    </div>
                </div>

                <div class="search-sort">
                    <InputText
                        v-model="searchTerm"
                        placeholder="Search incidents..."
                        class="control-input"
                    />

                    <Select
                        v-model="sortSeverity"
                        :options="severitySortOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Sort by severity"
                        class="control-input"
                    />
                </div>
            </div>
        </div>

        <div v-if="state.loading" class="loading">
            <ProgressSpinner />
        </div>

        <Message v-else-if="state.error" severity="error">
            {{ state.error }}
        </Message>

        <div v-else-if="filteredIncidents.length === 0" class="empty-state">
            No incidents match the current filters.
        </div>

        <div v-else class="incident-list">
            <Card
                v-for="incident in filteredIncidents"
                :key="incident.id"
                class="issue-card compact-card"
                @click="openIncident(incident.id)"
            >
                <template #title>
                    <div class="card-header">
                        <div class="incident-main">
                            <span class="icon">
                                <i v-if="incident.status === 'resolved'" class="pi pi-check-circle icon-resolved"></i>
                                <i v-else-if="incident.status === 'triggered'" class="pi pi-minus-circle icon-triggered"></i>
                                <i v-else-if="incident.status === 'acknowledged'" class="pi pi-clock icon-acknowledged"></i>
                            </span>

                            <div class="incident-text">
                            <span class="incident-summary">{{ incident.summary }}</span>
                            <div class="incident-meta">
                                <span class="issue-number">#{{ incident.id }}</span>
                                <span class="status-pill" :class="statusClass(incident.status)">
                                {{ incident.status }}
                                </span>
                                <span v-if="incident.status === 'triggered'">
                                Reported {{ formatDate(incident.created_at) }}
                                </span>
                                <span v-if="incident.status === 'resolved'">
                                Resolved {{ formatDate(incident.resolved_at!) }}
                                </span>
                                <span v-if="incident.status === 'acknowledged'">
                                Acknowledged
                                </span>
                            </div>
                            </div>
                        </div>

                        <span class="severity-pill" :class="severityClass(incident.severity)">
                            {{ incident.severity }}
                        </span>
                        </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import { onMounted, ref, reactive, computed } from 'vue'
import { IncidentService } from '@/api'
import { useRouter } from "vue-router"
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import 'primeicons/primeicons.css'

const router = useRouter()

onMounted(() => {
    fetchIncidents()
})

const state = reactive({
    testMessage: null as string | null,
    loading: false,
    error: null as string | null,
})

/* Filtering / Sorting */

const showResolved = ref(false)
const showUnResolved = ref(true)
const showAcknowledged = ref(true)
const searchTerm = ref('')
const sortSeverity = ref('none')

const severitySortOptions = [
    { label: 'No Sorting', value: 'none' },
    { label: 'Severity (High → Low)', value: 'desc' },
    { label: 'Severity (Low → High)', value: 'asc' }
]

const severityRank: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
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

function statusClass(status: string) {
    switch (status?.toLowerCase()) {
        case 'resolved':
            return 'status-resolved'
        case 'triggered':
            return 'status-triggered'
        case 'acknowledged':
            return 'status-acknowledged'
        default:
            return ''
    }
}

const filteredIncidents = computed(() => {
    let result = incidents.value.filter((incident) => {
        const statusMatch =
            (incident.status === 'triggered' && showUnResolved.value) ||
            (incident.status === 'resolved' && showResolved.value) ||
            (incident.status === 'acknowledged' && showAcknowledged.value)

        const searchMatch =
            !searchTerm.value ||
            incident.summary.toLowerCase().includes(searchTerm.value.toLowerCase())

        return statusMatch && searchMatch
    })

    if (sortSeverity.value !== 'none') {
        result = [...result].sort((a, b) => {
            const aRank = severityRank[a.severity.toLowerCase()] ?? 0
            const bRank = severityRank[b.severity.toLowerCase()] ?? 0
            const diff = aRank - bRank
            return sortSeverity.value === 'asc' ? diff : -diff
        })
    }

    return result
})

/* Incidents */

const incidents = ref<Incident[]>([])

interface Incident {
    id: number
    summary: string
    severity: string
    status: string
    created_at: number
    service_id: number
    acknowledged_at: number | null
    resolved_at: number | null
    resolution_notes: string | null
    assigned_to: number | null
    acknowledged_by: number | null
    resolved_by: number | null
}

function openIncident(incident_id: number) {
    router.push(`/incident/${incident_id}`)
}

async function fetchIncidents() {
    state.loading = true
    state.error = null

    try {
        const response = await IncidentService.getApiV1Incidents()

        if (Array.isArray(response) && response.length > 0) {
            incidents.value = response as unknown as Incident[]
        } else if (Array.isArray(response) && response.length === 0) {
            incidents.value = []
        } else if ('message' in response) {
            state.error = response.message ?? 'There are no incidents'
        }
    } catch (error: any) {
        state.error = error?.message || 'An error occurred'
    } finally {
        state.loading = false
    }
}

/* Date Formatting */

const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
})

function formatDate(ts: any) {
    return formatter.format(new Date(ts))
}
</script>

<style scoped>
.container {
    max-width: 900px;
    margin: auto;
    padding: 0 0 24px;
}

/*  HEADER / FILTERS  */

.header-section {
    margin-bottom: 18px;
}

.header-section h1 {
    margin-bottom: 14px;
    color: var(--p-text-color);
}

.filter-panel {
    border: 1px solid var(--p-content-border-color);
    background: var(--p-content-background);
    border-radius: 10px;
    padding: 14px 16px;
}

.checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    margin-bottom: 14px;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--p-text-color);
    font-size: 0.95rem;
}

.search-sort {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.control-input {
    width: 220px;
}

.control-input :deep(.p-inputtext),
.control-input :deep(.p-select) {
    width: 100%;
}

/*  STATES  */

.loading {
    display: flex;
    justify-content: center;
    padding: 40px;
}

.empty-state {
    color: var(--p-text-muted-color);
    padding: 24px 0;
    text-align: center;
}

/*  INCIDENT LIST  */

.incident-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.issue-card {
    border: 1px solid #2f3745;
    border-radius: 12px;
    cursor: pointer;
    background: #1b1f27;
    color: #f3f4f6;
    transition: all 0.15s ease;
}

.issue-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

.compact-card :deep(.p-card-body) {
    padding: 0.55rem 0.9rem;
}

.compact-card :deep(.p-card-content) {
    padding: 0;
}

.compact-card :deep(.p-card-title) {
    margin: 0;
}

/*  CARD CONTENT  */

.card-header {
    display: flex;
    align-items: center; /* keeps left + right vertically centered */
    justify-content: space-between;
    gap: 12px;
    min-height: 32px;
}

.incident-main {
    display: flex;
    align-items: center; /* centers icon against whole text block */
    gap: 12px;
    min-width: 0;
    flex: 1;
}

.icon {
    display: flex;
    align-items: center;
    justify-content: center;
    align-self: center;
    flex: 0 0 20px;
    width: 20px;
    min-width: 20px;
    height: 100%;
    font-size: 1.05rem;
}

.icon i {
    line-height: 1;
    display: block;
}

.status-icon {
    flex: 0 0 auto;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
    font-size: 1rem;
}

.icon-resolved {
    color: #22c55e;
}

.icon-triggered {
    color: #ef4444;
}

.icon-acknowledged {
    color: #f59e0b;
}

.incident-text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    flex: 1;
}

.incident-topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
}

.incident-summary {
    font-size: 1rem;
    font-weight: 600;
    color: var(--p-text-color);
    line-height: 1.25;
    overflow-wrap: anywhere;
}

.incident-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 5px;
    font-size: 0.88rem;
    color: var(--p-text-muted-color);
}

.issue-number {
    font-weight: 600;
    color: var(--p-text-color);
}

/*  PILLS  */

.severity-pill,
.status-pill {
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    padding: 0.18rem 0.6rem;
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
}

.severity-critical {
    background: rgba(239, 68, 68, 0.14);
    color: #ef4444;
}

.severity-high {
    background: rgba(249, 115, 22, 0.14);
    color: #f97316;
}

.severity-medium {
    background: rgba(234, 179, 8, 0.14);
    color: #eab308;
}

.severity-low {
    background: rgba(56, 189, 248, 0.14);
    color: #38bdf8;
}

.status-resolved {
    background: rgba(34, 197, 94, 0.14);
    color: #22c55e;
}

.status-triggered {
    background: rgba(239, 68, 68, 0.14);
    color: #ef4444;
}

.status-acknowledged {
    background: rgba(245, 158, 11, 0.14);
    color: #f59e0b;
}

/*  RESPONSIVE  */

@media (max-width: 640px) {
    .search-sort {
        flex-direction: column;
    }

    .control-input {
        width: 100%;
    }

    .incident-topline {
        flex-direction: column;
        align-items: flex-start;
    }

    .incident-meta {
        flex-direction: column;
        gap: 6px;
    }
}
</style>
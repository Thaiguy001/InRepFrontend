<template>
    <div class="container">
        <div class="header-section">
            <div>
                <h1>Incidents</h1>
            </div>
        </div>

        <Card class="filter-card compact-card">
            <template #title>
                <div class="filter-header">
                    <span>Filters & Sorting</span>
                </div>
            </template>

            <template #content>
                <div class="filter-top-row">
                    <InputText
                        v-model="searchTerm"
                        placeholder="Search incidents..."
                        class="control-input search-input"
                    />

                    <Select
                        v-model="sortMode"
                        :options="sortOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Sort incidents"
                        class="control-input"
                    />
                    <br>
                    <Button
                        label="Clear"
                        icon="pi pi-filter-slash"
                        severity="secondary"
                        outlined
                        class="sort-button control-input-item"
                        @click="resetFilters"
                    />
                    <Button
                        :label="showAdvancedFilters ? 'Hide Advanced' : 'Advanced Filters'"
                        :icon="showAdvancedFilters ? 'pi pi-chevron-up' : 'pi pi-sliders-h'"
                        text
                        severity="secondary"
                        class="sort-button control-input-item"
                        @click="showAdvancedFilters = !showAdvancedFilters"
                    />
                </div>

                <div v-if="showAdvancedFilters" class="advanced-panel">
                    <div class="advanced-group">
                        <span class="group-title">Severity</span>
                        <div class="checkbox-group">
                            <div class="checkbox-item">
                                <Checkbox v-model="severityFilters.critical" binary inputId="sev-critical" />
                                <label for="sev-critical">Critical</label>
                            </div>
                            <div class="checkbox-item">
                                <Checkbox v-model="severityFilters.high" binary inputId="sev-high" />
                                <label for="sev-high">High</label>
                            </div>
                            <div class="checkbox-item">
                                <Checkbox v-model="severityFilters.medium" binary inputId="sev-medium" />
                                <label for="sev-medium">Medium</label>
                            </div>
                            <div class="checkbox-item">
                                <Checkbox v-model="severityFilters.low" binary inputId="sev-low" />
                                <label for="sev-low">Low</label>
                            </div>
                        </div>
                    </div>

                    <div class="advanced-group">
                        <span class="group-title">Status</span>
                        <div class="checkbox-group">
                            <div class="checkbox-item">
                                <Checkbox v-model="statusFilters.triggered" binary inputId="status-triggered" />
                                <label for="status-triggered">Triggered</label>
                            </div>
                            <div class="checkbox-item">
                                <Checkbox v-model="statusFilters.acknowledged" binary inputId="status-ack" />
                                <label for="status-ack">Acknowledged</label>
                            </div>
                            <div class="checkbox-item">
                                <Checkbox v-model="statusFilters.resolved" binary inputId="status-resolved" />
                                <label for="status-resolved">Resolved</label>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </Card>

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
                                <i v-if="incident.status === 'resolved'" class="pi pi-check-circle status-resolved"></i>
                                <i v-else-if="incident.status === 'triggered'" class="pi pi-minus-circle status-triggered"></i>
                                <i v-else-if="incident.status === 'acknowledged'" class="pi pi-clock status-acknowledged"></i>
                            </span>

                            <div class="incident-text">
                                <div class="incident-topline">
                                    <span class="incident-summary">{{ incident.summary }}</span>
                                </div>

                                <div class="incident-meta">
                                    <span class="issue-number">#{{ incident.id }}</span>

                                    <span class="status-pill" :class="statusClass(incident.status)">
                                        {{ incident.status }}
                                    </span>

                                    <span>
                                        Triggered {{ formatDate(incident.created_at) }}
                                    </span>

                                    <span v-if="getLastActionDate(incident)">
                                        Last action {{ formatDate(getLastActionDate(incident)) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="incident-right">
                            <span class="severity-pill" :class="severityClass(incident.severity)">
                                {{ incident.severity }}
                            </span>
                            <span class="incident-meta">
                                <Button
                                    v-if="incident.service_id && serviceMap[incident.service_id]"
                                    text
                                    rounded
                                    severity="secondary"
                                    class="service-link-button"
                                    :label="serviceMap[incident.service_id]?.name"
                                    @click.stop="openServiceFromIncident(incident.service_id)"
                                />
                            </span>
                            
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import { onMounted, ref, reactive, computed } from 'vue'
import { IncidentService, ServiceService } from '@/api'
import { useRouter } from "vue-router"
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Button from 'primevue/button'
import 'primeicons/primeicons.css'

const router = useRouter()

onMounted(() => {
    fetchIncidents()
    fetchServices()
})

const state = reactive({
    loading: false,
    error: null as string | null,
})

/* Sorting values */

const searchTerm = ref('')
const showAdvancedFilters = ref(false)

const severityFilters = reactive({
    critical: true,
    high: true,
    medium: true,
    low: true
})

const statusFilters = reactive({
    triggered: true,
    acknowledged: true,
    resolved: true
})

const sortMode = ref('triggered_desc')

const sortOptions = [
    { label: 'Newest Triggered First', value: 'triggered_desc' },
    { label: 'Oldest Triggered First', value: 'triggered_asc' },
    { label: 'Last Action (Newest First)', value: 'last_action_desc' },
    { label: 'Last Action (Oldest First)', value: 'last_action_asc' },
    { label: 'Severity (High → Low)', value: 'severity_desc' },
    { label: 'Severity (Low → High)', value: 'severity_asc' }
]

const severityRank: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
}

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

/* Services */

interface Service {
    id: number
    name: string
    description: string
}

const services = ref<Service[]>([])

const serviceMap = computed<Record<number, Service>>(() => {
    return services.value.reduce((acc, service) => {
        acc[service.id] = service
        return acc
    }, {} as Record<number, Service>)
})

async function fetchServices() {
    try {
        const response = await ServiceService.getApiV1Service()

        if (Array.isArray(response)) {
            services.value = response.filter((s) => s.id !== undefined) as Service[]
        } else {
            services.value = []
        }
    } catch (error) {
        console.error('Failed to load services:', error)
        services.value = []
    }
}

function getServiceName(serviceId: number) {
    const service = services.value.find(s => s.id === serviceId)
    return service?.name ?? 'Unknown Service'
}

/* Filtering + Sorting */

const filteredIncidents = computed(() => {
    let result = incidents.value.filter((incident) => {
        const sev = incident.severity.toLowerCase()
        const status = incident.status.toLowerCase()

        const severityMatch =
            (sev === 'critical' && severityFilters.critical) ||
            (sev === 'high' && severityFilters.high) ||
            (sev === 'medium' && severityFilters.medium) ||
            (sev === 'low' && severityFilters.low)

        const statusMatch =
            (status === 'triggered' && statusFilters.triggered) ||
            (status === 'acknowledged' && statusFilters.acknowledged) ||
            (status === 'resolved' && statusFilters.resolved)

        const searchMatch =
            !searchTerm.value ||
            incident.summary.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
            getServiceName(incident.service_id).toLowerCase().includes(searchTerm.value.toLowerCase())

        return severityMatch && statusMatch && searchMatch
    })

    result = [...result].sort((a, b) => {
        switch (sortMode.value) {
            case 'severity_asc':
                return (severityRank[a.severity.toLowerCase()] ?? 0) - (severityRank[b.severity.toLowerCase()] ?? 0)

            case 'severity_desc':
                return (severityRank[b.severity.toLowerCase()] ?? 0) - (severityRank[a.severity.toLowerCase()] ?? 0)

            case 'triggered_asc':
                return a.created_at - b.created_at

            case 'triggered_desc':
                return b.created_at - a.created_at

            case 'last_action_asc':
                return getSortableLastAction(a) - getSortableLastAction(b)

            case 'last_action_desc':
                return getSortableLastAction(b) - getSortableLastAction(a)

            default:
                return 0
        }
    })

    return result
})

function getLastActionDate(incident: Incident) {
    return incident.resolved_at ?? incident.acknowledged_at ?? incident.created_at
}

function getSortableLastAction(incident: Incident) {
    return Number(getLastActionDate(incident) ?? 0)
}

function resetFilters() {
    searchTerm.value = ''
    showAdvancedFilters.value = false

    severityFilters.critical = true
    severityFilters.high = true
    severityFilters.medium = true
    severityFilters.low = true

    statusFilters.triggered = true
    statusFilters.acknowledged = true
    statusFilters.resolved = true

    sortMode.value = 'triggered_desc'
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

/* Navigation */

function openIncident(incident_id: number) {
    router.push(`/incident/${incident_id}`)
}

function openServiceFromIncident(serviceId: number) {
    router.push(`/service/${serviceId}`)
}

/* Fetching Incidents */

async function fetchIncidents() {
    state.loading = true
    state.error = null

    try {
        const response = await IncidentService.getApiV1Incidents()

        if (Array.isArray(response)) {
            incidents.value = response as unknown as Incident[]
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

/*  Header / Filters  */

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

.filter-card {
    margin-bottom: 10px;
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

.control-input-item {
    align-items: center;
    gap: 8px;
}

/* States */

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

/* Incident List */

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

/*  Card Content  */

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

.card-header {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 12px;
    min-height: 44px;
}

.incident-main {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
}

.incident-text {
    min-width: 0;
    flex: 1;
}

.incident-topline {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
    margin-bottom: 6px;
}

.incident-summary {
    font-size: 1rem;
    font-weight: 600;
    color: var(--p-text-color);
    overflow-wrap: anywhere;
}

.incident-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 6px;
    flex: 0 0 auto;
    min-width: 0;
}

.severity-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.28rem 0.65rem;
    border-radius: 999px;
    font-size: 0.82rem;
    font-weight: 700;
    text-transform: capitalize;
    border: 1px solid currentColor;
    white-space: nowrap;
}

.service-link-button {
    padding: 0.15rem 0.35rem;
    font-size: 0.85rem;
    max-width: 220px;
}

.service-link-button :deep(.p-button-label) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/*  Pills  */

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

.incident-service {
    font-size: 0.9rem;
    color: var(--p-text-muted-color);
    margin-top: 2px;
    font-style: italic;
}

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
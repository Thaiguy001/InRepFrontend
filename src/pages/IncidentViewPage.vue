<template>
    <div class="container">
        <div v-if="state.loading" class="loading">
            <ProgressSpinner />
        </div>

        <Message v-else-if="state.error" severity="error">
            {{ state.error }}
        </Message>

        <div v-else-if="incident" class="incident-details">
            <div class="header-row">
                <div>
                    <h1>{{ incident.summary }}</h1>
                    <p class="subtitle">Incident Details</p>
                </div>

                <Button
                    label="Back"
                    icon="pi pi-arrow-left"
                    severity="secondary"
                    @click="goBack"
                />
            </div>

            <!-- OVERVIEW -->
            <Card class="details-card">
                <template #title>
                    Overview
                </template>

                <template #content>
                    <div class="detail-row">
                        <span class="detail-label">Incident ID</span>
                        <span class="detail-value">#{{ incident.id }}</span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Summary</span>
                        <span class="detail-value">{{ incident.summary }}</span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Severity</span>
                        <span class="detail-value">
                            <span class="severity-pill" :class="severityClass(incident.severity || '')">
                                    {{ incident.severity }}
                                </span>
                        </span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Status</span>
                        <span class="detail-value">
                            <span class="status-pill" :class="statusClass(incident.status || '')">
                                {{ incident.status }}
                            </span>
                        </span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Created</span>
                        <span class="detail-value">{{ formatDate(incident.created_at) }}</span>
                    </div>

                    <div class="detail-row" v-if="incident.acknowledged_at">
                        <span class="detail-label">Acknowledged by {{ state.ack_username }}</span>
                        <span class="detail-value">{{ formatDate(incident.acknowledged_at) }}</span>
                    </div>

                    <div class="detail-row" v-if="incident.resolved_at">
                        <span class="detail-label">Resolved by {{ state.res_username }}</span>
                        <span class="detail-value">{{ formatDate(incident.resolved_at) }}</span>
                    </div>

                    <div class="detail-row" v-if="incident.service_id && service">
                        <span class="detail-label">Service</span>
                        <span class="detail-value">
                            <Button
                                :label="service.name"
                                icon="pi pi-external-link"
                                text
                                severity="secondary"
                                class="service-link-button"
                                @click="service.id && openService(service.id)"
                            />
                        </span>
                    </div>
                </template>
            </Card>

            <!-- ACTIONS -->
            <Card class="details-card">
                <template #title>
                    Incident Actions
                </template>

                <template #content>
                    <div class="actions-panel">
                        <div class="action-copy">
                            <div class="action-title">Update Incident Status</div>
                            <div class="action-subtitle">
                                Mark this incident as acknowledged or resolved.
                            </div>
                        </div>

                        <div class="action-buttons" >
                            <Button
                                :disabled="incident.status != 'triggered'"
                                label="Acknowledge"
                                icon="pi pi-clock"
                                severity="secondary"
                                outlined
                                @click="acknowledgeIncident"
                            />

                            <Button
                                label="Resolve Incident"
                                icon="pi pi-check"
                                :disabled="incident.status === 'resolved'"
                                @click="openResolveDialog"
                            />
                        </div>
                    </div>
                </template>
            </Card>

            <!-- RESOLUTION NOTES -->
            <Card
                v-if="incident.status === 'resolved' && incident.resolution_notes"
                class="details-card"
            >
                <template #title>
                    Resolution Notes
                </template>

                <template #content>
                    <div class="notes-content">
                        {{ incident.resolution_notes }}
                    </div>
                </template>
            </Card>
        </div>
    </div>

    <!-- RESOLVE INCIDENT DIALOG -->
    <Dialog
        v-model:visible="resolveDialogVisible"
        modal
        header="Resolve Incident"
        style="width: 500px"
    >
        <div class="dialog-form">
            <label for="resolutionNotes">Resolution Notes</label>
            <Textarea
                id="resolutionNotes"
                v-model="resolutionNotes"
                rows="6"
                autoResize
                placeholder="Describe how the incident was resolved..."
            />
        </div>

        <template #footer>
            <Button
                label="Cancel"
                icon="pi pi-times"
                severity="secondary"
                @click="resolveDialogVisible = false"
            />

            <Button
                label="Resolve"
                icon="pi pi-check"
                @click="resolveIncident"
            />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { IncidentService, ServiceService, UserService } from '@/api'
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import Textarea from 'primevue/textarea'
import 'primeicons/primeicons.css'

import { useToastHelperService } from '@/services/toastHelperService'
import { useAuthStore } from '@/stores/auth'
import { type User } from '@/api/generated/models/User'

import { type Incident } from '@/api/generated/models/Incident'
import { type Service } from '@/api/generated/models/Service'


const route = useRoute()
const router = useRouter()
const toast = useToastHelperService()

const incident = ref<Incident | null>(null)
const service = ref<Service | null>(null)

const resolveDialogVisible = ref(false)
const resolutionNotes = ref('')

const auth = useAuthStore()

const state = reactive({
    loading: false,
    error: null as string | null,
    res_username: null as string | null,
    ack_username: null as string | null
})

onMounted(() => {
    fetchIncident()
})

async function fetchIncident() {
    state.loading = true
    state.error = null

    try {
        const incidentId = Number(route.params.id)

        if (Number.isNaN(incidentId)) {
            state.error = 'Invalid incident id.'
            return
        }

        const response = await IncidentService.getApiV1Incidents1(incidentId)

        if (response && 'id' in response) {
            incident.value = response as unknown as Incident
            resolutionNotes.value = incident.value.resolution_notes ?? ''

            if (incident.value.service_id) {
                await fetchService(incident.value.service_id)
            }

            // Fetch user details for acknowledged_by and resolved_by if present
            if (incident.value.acknowledged_by || incident.value.resolved_by) {
                // If both resolution and acknowledgment were done by the same user, make only a single user api get request
                if (incident.value.acknowledged_by && incident.value.resolved_by && (incident.value.acknowledged_by === incident.value.resolved_by)) {
                    const userResponse = await UserService.getApiV1Users1(incident.value.acknowledged_by)
                    if (userResponse && 'id' in userResponse) {
                        const user = userResponse as User
                        const displayName = user.username ?? user.email ?? `User #${user.id}`
                        state.ack_username = displayName
                        state.res_username = displayName
                    }
                
                } else if (incident.value.acknowledged_by) {
                    console.log('Fetching user for acknowledged_by:', incident.value.acknowledged_by)
                    const ackUserResponse = await UserService.getApiV1Users1(incident.value.acknowledged_by)
                    if (ackUserResponse && 'id' in ackUserResponse) {
                        const ackUser = ackUserResponse as User
                        state.ack_username = ackUser.username ?? ackUser.email ?? `User #${ackUser.id}`
                    }
                } else if (incident.value.resolved_by) {
                    console.log('Fetching user for resolved_by:', incident.value.resolved_by)
                    const resUserResponse = await UserService.getApiV1Users1(incident.value.resolved_by)
                    if (resUserResponse && 'id' in resUserResponse) {
                        const resUser = resUserResponse as User
                        state.res_username = resUser.username ?? resUser.email ?? `User #${resUser.id}`
                    }
                }
            }
        } else if (response && 'message' in response) {
            state.error = response.message ?? 'Failed to load incident.'
        } else {
            state.error = 'Incident not found.'
        }
    } catch (error: any) {
        state.error = error?.message || 'An error occurred while loading the incident.'
    } finally {
        state.loading = false
    }
}

async function fetchService(serviceId: number) {
    try {
        const response = await ServiceService.getApiV1ServiceId(serviceId)

        if (response && 'id' in response) {
            service.value = response as Service
        }
    } catch (error) {
        console.error('Failed to load service:', error)
    }
}

function openResolveDialog() {
    if (!incident.value || incident.value.status === 'resolved') return
    resolveDialogVisible.value = true
}

async function resolveIncident() {
    if (!incident.value || !incident.value.id) return

    try {
        await IncidentService.postApiV1IncidentsResolve(incident.value.id, {
            resolution_notes: resolutionNotes.value
        })

        toast.showSuccess('Incident resolved')
        resolveDialogVisible.value = false
        await fetchIncident()
    } catch (error: any) {
        toast.showError('Failed to resolve incident', error?.message)
    }
}

function acknowledgeIncident() {
    if (!incident.value || !incident.value.id) return
    if (!auth.user) {
        toast.showError('Unauthorized', 'You must be logged in to acknowledge incidents.')
        return
    }
    IncidentService.postApiV1IncidentsAcknowledge(incident.value.id)
        .then(() => {
            toast.showSuccess('Incident acknowledged')
            fetchIncident()
        })
        .catch((error: any) => {
            toast.showError('Failed to acknowledge incident', error?.message)
        })
}

async function getUserName(userId: number | null) {
    if (!userId) return 'Unknown User'
    const response = await UserService.getApiV1Users1(userId)
    if (response && 'id' in response) {
        const user = response as User
        return user.username || `User #${userId}`
    } else {
        return `User #${userId}`
    }
}

function openService(serviceId: number) {
    router.push(`/service/${serviceId}`)
}

function goBack() {
    router.back()
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

const formatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
})

function formatDate(ts: any) {
    if (!ts) return ''
    return formatter.format(new Date(ts))
}
</script>

<style scoped>
.container {
    max-width: 900px;
    margin: auto;
    padding: 8px 0 24px;
}

.loading {
    display: flex;
    justify-content: center;
    padding: 40px;
}

.incident-details {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
}

.subtitle {
    margin: 4px 0 0;
    color: var(--p-text-muted-color);
}

.details-card {
    border: 1px solid var(--p-content-border-color);
    border-radius: 12px;
    background: var(--p-content-background);
    color: var(--p-text-color);
    box-shadow: var(--p-card-shadow);
}

.details-card :deep(.p-card) {
    background: var(--p-content-background);
    color: var(--p-text-color);
    border-radius: 12px;
    box-shadow: none;
}

.details-card :deep(.p-card-title) {
    color: var(--p-text-color);
}

.details-card :deep(.p-card-content) {
    color: var(--p-text-color);
}

.detail-row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 14px 0;
    border-bottom: 1px solid var(--p-content-border-color);
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-label {
    min-width: 140px;
    font-weight: 600;
    color: var(--p-text-muted-color);
}

.detail-value {
    flex: 1;
    text-align: right;
    color: var(--p-text-color);
    overflow-wrap: anywhere;
}

.actions-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
}

.action-copy {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.action-title {
    font-weight: 600;
    color: var(--p-text-color);
}

.action-subtitle {
    color: var(--p-text-muted-color);
    font-size: 0.95rem;
}

.action-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.notes-content {
    white-space: pre-wrap;
    line-height: 1.6;
    color: var(--p-text-color);
}

.dialog-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.dialog-form label {
    font-weight: 600;
    color: var(--p-text-color);
}

.service-link-button {
    padding: 0;
}

/* pills */
.severity-pill,
.status-pill {
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

.severity-critical {
    color: var(--p-red-500, #ef4444);
}

.severity-high {
    color: var(--p-orange-500, #f97316);
}

.severity-medium {
    color: var(--p-yellow-500, #eab308);
}

.severity-low {
    color: var(--p-blue-400, #38bdf8);
}

.status-resolved {
    color: var(--p-green-500, #22c55e);
}

.status-triggered {
    color: var(--p-red-500, #ef4444);
}

.status-acknowledged {
    color: var(--p-orange-500, #f97316);
}

@media (max-width: 640px) {
    .header-row {
        flex-direction: column;
        align-items: stretch;
    }

    .detail-row {
        flex-direction: column;
        gap: 8px;
    }

    .detail-value {
        text-align: left;
    }

    .actions-panel {
        flex-direction: column;
        align-items: stretch;
    }

    .action-buttons {
        width: 100%;
    }
}
</style>
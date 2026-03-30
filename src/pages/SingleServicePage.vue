<template>
    <div class="container">
        <div v-if="pageState.loading" class="loading">
            <ProgressSpinner />
        </div>

        <Message v-else-if="pageState.error" severity="error">
            {{ pageState.error }}
        </Message>

        <div v-else-if="service" class="service-details">
            <div class="header-row">
                <div>
                    <h1>{{ service.name }}</h1>
                    <p class="subtitle">Service Details</p>
                </div>

                <Button
                    label="Back"
                    icon="pi pi-arrow-left"
                    severity="secondary"
                    @click="goBack"
                />
            </div>

            <Card class="details-card">
                <template #title>Overview</template>

                <template #content>
                    <div class="detail-row">
                        <span class="detail-label">ID</span>
                        <span class="detail-value">#{{ service.id }}</span>
                    </div>

                    <div class="detail-row">
                        <span class="detail-label">Name</span>
                        <span class="detail-value">{{ service.name }}</span>
                    </div>

                    <div class="detail-row description-row">
                        <span class="detail-label">Description</span>
                        <span class="detail-value">{{ service.description }}</span>
                    </div>
                </template>
            </Card>

            <Card class="details-card api-card">
                <template #title>
                    <div class="api-header">
                        <span>API Keys</span>

                        <Button
                            icon="pi pi-plus"
                            class="create-key-button"
                            rounded
                            aria-label="Create API key"
                            @click="openCreate"
                        />
                    </div>
                </template>

                <template #content>
                    <div class="api-toolbar">
                        <div class="revoked-toggle">
                            <Checkbox v-model="showRevoked" binary inputId="showRevoked" />
                            <label for="showRevoked">Show revoked keys</label>
                        </div>
                    </div>

                    <div v-if="apiKeysLoading" class="keys-loading">
                        <ProgressSpinner style="width: 36px; height: 36px" />
                    </div>

                    <div v-else-if="filteredApiKeys.length === 0" class="empty-state">
                        No API keys found for this service.
                    </div>

                    <div v-else class="api-key-list">
                        <div
                            v-for="apiKey in filteredApiKeys"
                            :key="apiKey.id"
                            class="api-key-row"
                        >
                            <div class="api-key-main">
                                <div class="api-key-topline">
                                    <Tag
                                        :value="isRevoked(apiKey) ? 'Revoked' : 'Active'"
                                        :severity="isRevoked(apiKey) ? 'danger' : 'success'"
                                    />
                                    
                                </div>

                                <div class="key-value">
                                    {{ maskKey(apiKey.key) }}
                                </div>

                                <div class="api-key-meta">
                                    <span>ID #{{ apiKey.id }}</span>
                                    <span v-if="apiKey.created_at">
                                        Created {{ formatDate(apiKey.created_at) }}
                                    </span>
                                </div>
                            </div>

                            <div class="api-key-actions">
                                <Button
                                    icon="pi pi-ellipsis-v"
                                    text
                                    rounded
                                    severity="secondary"
                                    aria-label="API key actions"
                                    @click.stop="toggleKeyMenu($event, apiKey.id)"
                                />

                                <Menu
                                    :ref="(el) => setKeyMenuRef(apiKey.id, el)"
                                    :model="getKeyMenuItems(apiKey)"
                                    popup
                                />
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>

    <!-- CREATE API KEY DIALOG -->
    <Dialog
        v-model:visible="dialogVisible"
        modal
        header="Create API Key"
        style="width: 520px"
    >
        <div v-if="!dialogState.loading && !dialogState.key && !dialogState.error">
            <form @submit.prevent="createApiKey">
                <p class="dialog-text">
                    Press the button below to create an API key for this service.
                </p>

                <Button
                    type="submit"
                    label="Create API Key"
                    icon="pi pi-key"
                    class="w-full"
                />
            </form>
        </div>

        <div v-else-if="dialogState.error">
            <Message severity="error">{{ dialogState.error }}</Message>
        </div>

        <div v-else-if="dialogState.loading" class="dialog-loading">
            <ProgressSpinner />
        </div>

        <div v-else-if="dialogState.key">
            <p class="dialog-text">
                Please copy and store your API key securely. It will not be shown again
                after this page is reloaded or navigated away from.
            </p>

            <div class="key-box">
                <div class="key-row">
                    <InputText
                        :modelValue="revealed ? dialogState.key : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'"
                        readonly
                        :feedback="false"
                        toggleMask
                        :inputProps="{ readonly: true }"
                        class="key-input"
                    />

                    <Button
                        icon="pi pi-copy"
                        severity="secondary"
                        text
                        rounded
                        aria-label="Copy key"
                        @click="copyKey"
                        class="copy-button"
                    />
                </div>
            </div>

            <div class="dialog-actions">
                <Button
                    :label="revealed ? 'Hide Key' : 'Reveal Key'"
                    :icon="revealed ? 'pi pi-eye-slash' : 'pi pi-eye'"
                    severity="secondary"
                    @click="toggle"
                />

                <Button
                    label="Done"
                    icon="pi pi-check"
                    @click="closeDialog"
                />
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ServiceService, ApiKeyService } from '@/api'
import { onMounted, reactive, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Card from 'primevue/card'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Checkbox from 'primevue/checkbox'
import Menu from 'primevue/menu'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import 'primeicons/primeicons.css'

import { useToastHelperService } from '@/services/toastHelperService'

interface Service {
    id: number
    name: string
    description: string
}

interface ApiKey {
    id: number
    key: string
    service_id: number
    revoked?: boolean | number | null
    revoked_at?: number | string | null
    created_at?: number | string | null
}

const route = useRoute()
const router = useRouter()
const toast = useToastHelperService()

const service = ref<Service | null>(null)
const apiKeys = ref<ApiKey[]>([])
const apiKeysLoading = ref(false)
const showRevoked = ref(false)
const keyMenuRefs = ref<Record<number, any>>({})

const dialogVisible = ref(false)
const revealed = ref(false)

const pageState = reactive({
    loading: false,
    error: null as string | null,
})

const dialogState = reactive({
    loading: false,
    error: null as string | null,
    key: null as string | null,
})

onMounted(() => {
    fetchPageData()
})

const filteredApiKeys = computed(() => {
    return apiKeys.value.filter((k) => {
        if (showRevoked.value) return true
        return !isRevoked(k)
    })
})

function isRevoked(apiKey: ApiKey) {
    return Boolean(apiKey.revoked) || Boolean(apiKey.revoked_at)
}

async function fetchPageData() {
    await fetchService()
    if (service.value) {
        await fetchApiKeys()
    }
}

async function fetchService() {
    pageState.loading = true
    pageState.error = null

    try {
        const serviceId = Number(route.params.id)

        if (Number.isNaN(serviceId)) {
            pageState.error = 'Invalid service id.'
            return
        }

        const response = await ServiceService.getApiV1ServiceId(serviceId)

        if (response && 'id' in response) {
            service.value = response as Service
        } else if (response && 'message' in response) {
            pageState.error = response.message ?? 'Failed to load service.'
        } else {
            pageState.error = 'Service not found.'
        }
    } catch (error: any) {
        pageState.error = error?.message || 'An error occurred while loading the service.'
    } finally {
        pageState.loading = false
    }
}

async function fetchApiKeys() {
    if (!service.value) return

    apiKeysLoading.value = true

    try {
        const response = await ApiKeyService.getApiV1ApiKeyService(service.value.id)

        if (Array.isArray(response)) {
            apiKeys.value = response as unknown as ApiKey[]
        } else if (response && 'message' in response) {
            toast.showError('Failed to load API keys', response.message ?? '')
            apiKeys.value = []
        } else {
            apiKeys.value = []
        }
    } catch (error: any) {
        toast.showError('Failed to load API keys', error?.message)
        apiKeys.value = []
    } finally {
        apiKeysLoading.value = false
    }
}

function openCreate() {
    dialogVisible.value = true
    revealed.value = false

    dialogState.loading = false
    dialogState.error = null
    dialogState.key = null
}

function closeDialog() {
    dialogVisible.value = false
    revealed.value = false
}

async function createApiKey() {
    if (!service.value) return

    dialogState.loading = true
    dialogState.error = null
    dialogState.key = null
    revealed.value = false

    try {
        const response = await ApiKeyService.postApiV1ApiKeyServiceGenerate(service.value.id)

        if (response && 'key' in response) {
            dialogState.key = response.key ?? null
            toast.showSuccess('API key created')
            await fetchApiKeys()
        } else if (response && 'message' in response) {
            dialogState.error = response.message ?? 'Failed to create API key.'
            toast.showError('Failed to create API key', dialogState.error)
        } else {
            dialogState.error = 'Failed to create API key.'
            toast.showError('Failed to create API key')
        }
    } catch (error: any) {
        dialogState.error = error?.message || 'Failed to create API key.'
        toast.showError('Failed to create API key', dialogState.error || '')
    } finally {
        dialogState.loading = false
    }
}

async function revokeApiKey(apiKey: ApiKey) {
    try {
        await ApiKeyService.postApiV1ApiKeyRevoke(apiKey.id)
        toast.showSuccess('API key revoked')
        await fetchApiKeys()
    } catch (error: any) {
        toast.showError('Failed to revoke API key', error?.message)
    }
}

async function deleteApiKey(apiKey: ApiKey) {
    if (!confirm('Delete this API key?')) return

    try {
        await ApiKeyService.deleteApiV1ApiKeyDelete(apiKey.id)
        toast.showSuccess('API key deleted')
        await fetchApiKeys()
    } catch (error: any) {
        toast.showError('Failed to delete API key', error?.message)
    }
}

function setKeyMenuRef(keyId: number, el: any) {
    if (el) {
        keyMenuRefs.value[keyId] = el
    }
}

function toggleKeyMenu(event: Event, keyId: number) {
    const menu = keyMenuRefs.value[keyId]
    if (menu) {
        menu.toggle(event)
    }
}

function getKeyMenuItems(apiKey: ApiKey) {
    const items: any[] = []

    if (!isRevoked(apiKey)) {
        items.push({
            label: 'Revoke',
            icon: 'pi pi-ban',
            command: () => revokeApiKey(apiKey)
        })
    }

    items.push({
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => deleteApiKey(apiKey)
    })

    return items
}

function maskKey(key: string) {
    if (!key) return ''
    if (key.length <= 10) return key
    return `${key.slice(0, 6)}••••••••${key.slice(-4)}`
}

function formatDate(ts: any) {
    if (!ts) return ''

    const date = new Date(ts)
    if (Number.isNaN(date.getTime())) return ''

    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date)
}

function toggle() {
    revealed.value = !revealed.value
}

function copyKey() {
    if (dialogState.key) {
        navigator.clipboard.writeText(dialogState.key)
        toast.showSuccess('Copied', 'API key copied to clipboard')
    }
}

function goBack() {
    router.back()
}
</script>

<style scoped>
.container {
    max-width: 900px;
    margin: auto;
    padding: 8px 0 24px;
}

/* LOADING */

.loading {
    display: flex;
    justify-content: center;
    padding: 40px;
}

/* PAGE LAYOUT */

.service-details {
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
    color: #b0b8c4;
    font-size: 0.95rem;
}

/* CARDS */

.details-card {
    border: 1px solid #2f3745;
    border-radius: 12px;
    background: #1b1f27;
    color: #f3f4f6;
}

/* Make PrimeVue card content spacing look cleaner */
.details-card :deep(.p-card-title) {
    color: #f9fafb;
    font-weight: 700;
    font-size: 1.15rem;
}

.details-card :deep(.p-card-content) {
    color: #e5e7eb;
}

/* SERVICE OVERVIEW ROWS */

.detail-row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 14px 0;
    border-bottom: 1px solid #2f3745;
}

.detail-row:last-child {
    border-bottom: none;
}

.description-row {
    align-items: flex-start;
}

.detail-label {
    min-width: 120px;
    font-weight: 700;
    color: #f9fafb;
    letter-spacing: 0.01em;
}

.detail-value {
    flex: 1;
    text-align: right;
    color: #d1d5db;
    overflow-wrap: anywhere;
    line-height: 1.55;
}

/* API CARD */

.api-card :deep(.p-card-body) {
    gap: 0.75rem;
}

.api-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.api-header-left {
    color: #f9fafb;
    font-weight: 700;
    font-size: 1.05rem;
}

.create-key-button {
    width: 42px;
    height: 42px;
    font-size: 1.2rem;
}

/* TOOLBAR */

.api-toolbar {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 14px;
}

.revoked-toggle {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #e5e7eb;
    font-weight: 500;
}

/* STATES */

.keys-loading {
    display: flex;
    justify-content: center;
    padding: 20px 0;
}

.empty-state {
    color: #cbd5e1;
    padding: 8px 0;
    font-size: 0.95rem;
}

/* API KEY LIST */

.api-key-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.api-key-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    border: 1px solid #313949;
    border-radius: 10px;
    padding: 14px 16px;
    background: #232834;
    transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
}

.api-key-row:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
    border-color: #4b5563;
    transform: translateY(-1px);
}

.api-key-main {
    min-width: 0;
    flex: 1;
}

.api-key-topline {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 8px;
}

.key-label {
    font-size: 0.92rem;
    font-weight: 700;
    color: #f3f4f6;
}

.key-value {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 0.97rem;
    color: #e5e7eb;
    overflow-wrap: anywhere;
    margin-bottom: 8px;
    line-height: 1.5;
}

.api-key-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    font-size: 0.88rem;
    color: #b8c0cc;
}

.api-key-actions {
    flex: 0 0 auto;
    display: flex;
    align-items: flex-start;
}

/* DIALOG KEY DISPLAY */

.key-block {
    user-select: text;
    background: #111827;
    color: #f9fafb;
    border: 1px solid #374151;
    padding: 10px 14px;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 10px;
}

.key-box {
    width: 100%;
}

.key-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
}

.key-input {
    flex: 1;
    min-width: 0;
}

.key-input :deep(input) {
    width: 100%;
}

.copy-button {
    flex-shrink: 0;
}

.copy-button {
    margin-left: 10px;
    padding: 4px 8px;
    font-size: 0.9em;
    cursor: pointer;
}

/* Make pre look better for revealed key */
pre {
    background: #111827;
    color: #f9fafb;
    border: 1px solid #374151;
    border-radius: 8px;
    padding: 12px 14px;
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
}
</style>
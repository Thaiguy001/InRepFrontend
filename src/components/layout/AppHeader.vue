<template>
    <Menubar :model="items" class="app-header">
        <template #start>
            <h2 class="logo">Incident Response Platform</h2>
        </template>
    </Menubar>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Menubar from 'primevue/menubar'
import { useRouter } from 'vue-router'

const router = useRouter()

// Define your navigation items
const items = ref([
    {
        label: 'Home',
        icon: 'pi pi-home',
        command: () => router.push('/'),
    },
    {
        label: 'Incidents',
        icon: 'pi pi-info-circle',
        command: () => router.push('/incidents'),
    },
    {
        label: 'Test',
        icon: 'pi pi-info-circle',
        command: () => router.push('/test'),
    },
])
</script>

<style scoped>
.app-header {
    padding: 0.5rem 1rem;
    border-radius: 0;
}

.logo {
    margin: 0;
    font-size: 1.25rem;
    font-weight: bold;
}
</style>
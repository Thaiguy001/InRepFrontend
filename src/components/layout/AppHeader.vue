<template>
    <Menubar :model="items" class="app-header">
        <template #start>
            <h2 class="logo">Incident Response Platform</h2>
        </template>
        <template #end>
            <button v-if="!auth.isLoggedIn" class="btn-primary navButton" @click="auth.login()">
                <i class="pi pi-sign-in"></i><label> Login</label>
            </button>
            <button v-else class="btn-primary navButton" @click="auth.logout()">
                <i class="pi pi-sign-out"></i><label> Logout</label>
            </button>
        </template>
    </Menubar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Menubar from 'primevue/menubar'
import { useRouter } from 'vue-router'
import 'primeicons/primeicons.css';
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

// Define your navigation items
const items = computed(() => {
    const nav = [
        {
            label: 'Home',
            icon: 'pi pi-home',
            command: () => router.push('/'),
        },
        {
            label: 'Test',
            icon: 'pi pi-info-circle',
            command: () => router.push('/test'),
        },
        {
            label: 'Create API Key',
            icon: 'pi pi-key',
            command: () => router.push('/create-api-key'),
        }
    ]
    
    if (auth.userRole === 'Administrator') {
        nav.push({
            label: 'User Management',
            icon: 'pi pi-users',
            command: () => router.push('/admin/user-management'),
        })
    }
    return nav
})
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
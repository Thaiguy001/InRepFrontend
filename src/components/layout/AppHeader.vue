<template>
    <Menubar v-if="!router.currentRoute.value.meta.hideNav" :model="items" class="app-header">
        <template #start>
            <h2 class="logo">Incident Response Platform</h2>
        </template>
        <template #end>
            <Button
                v-if="!auth.isLoggedIn"
                icon="pi pi-sign-in"
                label="Login"
                @click="auth.login()"
                class="login-btn"
            />
            <div v-else class="user-menu-wrapper">
                <Button class="user-menu-btn" @click="menuRef.toggle($event)" aria-haspopup="true"
                    aria-controls="user-menu">
                    <div class="user-avatar">{{ initials }}</div>
                    <span class="user-name">{{ auth.userName }}</span>
                    <i class="pi pi-chevron-down chevron"></i>
                </Button>
                <Menu id="user-menu" ref="menuRef" :model="userMenuItems" popup />
            </div>
        </template>
    </Menubar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Menubar from 'primevue/menubar'
import Menu from 'primevue/menu'
import Button from 'primevue/button'
import { useRouter } from 'vue-router'
import 'primeicons/primeicons.css';
import { useAuthStore } from '@/stores/auth'
import 'primeicons/primeicons.css'

const router = useRouter()
const auth = useAuthStore()
const menuRef = ref()

const initials = computed(() => {
    const name = auth.userName ?? ''
    return name.slice(0, 2).toUpperCase()
})

const items = computed(() => {
    const nav = [
        {
            label: 'Dashboard',
            icon: 'pi pi-home',
            command: () => router.push('/dashboard')
        },
        {
            label: 'Test',
            icon: 'pi pi-info-circle',
            command: () => router.push('/test')
        },
        {
            label: 'Services',
            icon: 'pi pi-info-circle',
            command: () => router.push('/services-page')
        },
        {
        label: 'Teams',
        icon: 'pi pi-users',
        command: () => router.push('/teams'),
    },
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

const userMenuItems = computed(() => [
    {
        label: auth.userName ?? 'Account',
        items: [
            { label: 'My Profile', icon: 'pi pi-user', command: () => router.push('/profile') },
            { separator: true },
            { label: 'Log out', icon: 'pi pi-sign-out', command: () => auth.logout() },
        ],
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

.user-menu-wrapper {
    position: relative;
}

.user-menu-btn {
    display: flex !important;
    align-items: center;
    gap: 0.5rem;
    background: transparent !important;
    border: 1px solid var(--p-menubar-border-color, #e5e7eb) !important;
    border-radius: 8px !important;
    padding: 0.375rem 0.625rem 0.375rem 0.375rem !important;
    color: inherit !important;
    cursor: pointer;
}

.user-menu-btn:hover {
    background: var(--p-menubar-item-focus-background, #f3f4f6) !important;
}

.user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #e5e7eb;
    color: #374151;
    font-size: 0.6875rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.user-name {
    font-size: 0.875rem;
    font-weight: 500;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.chevron {
    font-size: 0.625rem;
    opacity: 0.6;
}

.login-btn {
  background: transparent !important;
  border: 1px solid #e5e7eb !important;
  color: #ffffff !important;
  border-radius: 6px !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  padding: 0.4375rem 0.875rem !important;
  transition: all 0.12s !important;
}

.login-btn:hover {
  background: #000000 !important;
  border-color: #868686 !important;
}
</style>
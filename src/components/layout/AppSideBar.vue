<template>
  <aside :class="['sidebar', { collapsed }]">

    <!-- Header -->
    <div class="sidebar-header">
      <span class="sidebar-logo" v-if="!collapsed">IRP</span>
      <button class="toggle-btn" @click="collapsed = !collapsed" :title="collapsed ? 'Expand' : 'Collapse'">
        <i :class="collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"></i>
      </button>
    </div>

    <!-- Nav items -->
    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item.to) }"
        v-tooltip.right="collapsed ? item.label : null"
      >
        <i :class="['nav-icon', item.icon]"></i>
        <span class="nav-label" v-if="!collapsed">{{ item.label }}</span>
      </RouterLink>
    </nav>

    <!-- Bottom: user menu -->
    <div class="sidebar-footer">
      <div class="divider"></div>

      <button class="nav-item user-btn" @click="menuRef.toggle($event)">
        <div class="user-avatar">{{ initials }}</div>
        <div class="user-info" v-if="!collapsed">
          <span class="user-name">{{ auth.userName }}</span>
          <span class="user-role">{{ auth.userRole }}</span>
        </div>
        <i class="pi pi-ellipsis-v user-chevron" v-if="!collapsed"></i>
      </button>

      <Menu ref="menuRef" :model="userMenuItems" popup />
    </div>

  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import Menu from 'primevue/menu'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const menuRef = ref()
const collapsed = ref(false)

const initials = computed(() => {
  const name = auth.userName ?? ''
  return name.slice(0, 2).toUpperCase()
})

const navItems = computed(() => {
  const items = [
    { to: '/dashboard',   label: 'Dashboard',       icon: 'pi pi-home'       },
    { to: '/services-page', label: 'Services',       icon: 'pi pi-server'     },
    { to: '/teams',       label: 'Teams',             icon: 'pi pi-sitemap'    },
    { to: '/profile',     label: 'My Profile',        icon: 'pi pi-user'       },
  ]
  if (auth.userRole === 'Administrator') {
    items.splice(3, 0, {
      to: '/admin/user-management',
      label: 'User Management',
      icon: 'pi pi-users',
    })
  }
  return items
})

const userMenuItems = computed(() => [
  {
    label: auth.userName ?? 'Account',
    items: [
      { label: 'My Profile', icon: 'pi pi-user',     command: () => router.push('/profile') },
      { separator: true },
      { label: 'Log out',    icon: 'pi pi-sign-out', command: () => auth.logout() },
    ],
  },
])

function isActive(to: string): boolean {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<style scoped>
/* ── Tokens ── */
.sidebar {
  --c-bg:       #ffffff;
  --c-border:   #e5e7eb;
  --c-text:     #111827;
  --c-muted:    #6b7280;
  --c-hover:    #f3f4f6;
  --c-active-bg:#f3f4f6;
  --c-active:   #111827;
  --c-avatar:   #e5e7eb;
  --c-avatar-text: #374151;

  --sidebar-width:           220px;
  --sidebar-width-collapsed: 56px;
  --transition:              0.2s ease;

  width: var(--sidebar-width);
  height: 100vh;
  position: sticky;
  top: 0;
  background: var(--c-bg);
  border-right: 1px solid var(--c-border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width var(--transition);
  overflow: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-width-collapsed);
}

@media (prefers-color-scheme: dark) {
  .sidebar {
    --c-bg:          #1b1f27;
    --c-border:      #2f3745;
    --c-text:        #f3f4f6;
    --c-muted:       #8b92a9;
    --c-hover:       #22283a;
    --c-active-bg:   #22283a;
    --c-active:      #f3f4f6;
    --c-avatar:      #2f3745;
    --c-avatar-text: #94a3b8;
  }
}

/* ── Header ── */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem;
  height: 56px;
  border-bottom: 1px solid var(--c-border);
  flex-shrink: 0;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
}

.sidebar-logo {
  font-size: 0.9375rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--c-text);
  white-space: nowrap;
}

.toggle-btn {
  width: 28px; height: 28px;
  border-radius: 6px;
  border: 1px solid var(--c-border);
  background: transparent;
  color: var(--c-muted);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  flex-shrink: 0;
  transition: background 0.12s, color 0.12s;
}

.toggle-btn:hover {
  background: var(--c-hover);
  color: var(--c-text);
}

/* ── Nav ── */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.75rem 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: 8px;
  color: var(--c-muted);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.12s, color 0.12s;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.nav-item:hover {
  background: var(--c-hover);
  color: var(--c-text);
}

.nav-item.active {
  background: var(--c-active-bg);
  color: var(--c-active);
  font-weight: 600;
}

.nav-icon {
  font-size: 0.9375rem;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}

.nav-label {
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity var(--transition), width var(--transition);
}

/* ── Footer / user ── */
.sidebar-footer {
  padding: 0.5rem;
  flex-shrink: 0;
}

.divider {
  height: 1px;
  background: var(--c-border);
  margin-bottom: 0.5rem;
}

.user-btn {
  gap: 0.625rem;
}

.user-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--c-avatar);
  color: var(--c-avatar-text);
  font-size: 0.6875rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.user-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--c-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.6875rem;
  color: var(--c-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-chevron {
  font-size: 0.75rem;
  color: var(--c-muted);
  margin-left: auto;
  flex-shrink: 0;
}
</style>
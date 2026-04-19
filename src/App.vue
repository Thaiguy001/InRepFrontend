<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSideBar.vue'
import { Toast } from 'primevue'
import ConfirmDialog from 'primevue/confirmdialog'

const route = useRoute()

const showNav = computed(() => !route.meta.hideNav)
</script>

<template>
  <div class="app-layout">
    <AppSidebar v-if="showNav" />
    <div class="app-main">
      <RouterView />
    </div>
  </div>
  <Toast />
  <ConfirmDialog />
</template>

<style>

html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>

.app-layout {
  display: flex;
  height: 100vh;        /* was min-height */
  overflow: hidden;     /* add this — prevents the layout itself from scrolling */
}

.app-main {
  flex: 1;
  min-width: 0;
  overflow-y: auto;     /* only the content area scrolls, not the whole page */
}
</style>
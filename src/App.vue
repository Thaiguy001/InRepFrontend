<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/layout/AppHeader.vue'
import { Toast } from 'primevue'
</script>

<template>
  <Toast />
  <AppHeader />
  <RouterView />
  <ConfirmDialog />
</template>
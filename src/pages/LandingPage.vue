<template>
  <div class="landing">
    <header class="nav">
      <span class="nav-logo">IRP</span>
    </header>

    <main class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Incident Response<br />Platform.</h1>
        <p class="hero-sub">Detect, route, and resolve incidents.</p>
        <div class="hero-actions">
          <Button label="Sign in" icon="pi pi-sign-in" iconPos="right" class="btn-signin" @click="auth.login()" />
        </div>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
</script>

<style scoped>
.landing {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: #0d0f14;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Nav ── */
.nav {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  padding: 1.5rem 2.5rem;
}

.nav-logo {
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #f3f4f6;
}

/* ── Hero ── */
.hero {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 2.5rem 4rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.hero-content {
  max-width: 560px;
}

.hero-title {
  margin: 0 0 1rem;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  color: #f9fafb;
  line-height: 1.1;
  letter-spacing: -0.03em;
}

.hero-sub {
  margin: 0 0 2.5rem;
  font-size: 1.0625rem;
  color: #6b7280;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
}

/* ── Sign in button ── */
:deep(.btn-signin.p-button) {
  background: #f9fafb !important;
  border: 1px solid #f9fafb !important;
  color: #0d0f14 !important;
  border-radius: 999px !important;
  font-size: 0.9375rem !important;
  font-weight: 600 !important;
  padding: 0.625rem 1.75rem !important;
  transition: opacity 0.12s !important;
  letter-spacing: 0.01em !important;
}

:deep(.btn-signin.p-button:hover) {
  opacity: 0.88 !important;
}
</style>
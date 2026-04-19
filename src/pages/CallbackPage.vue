<template>
  <div class="callback">
    <ProgressSpinner strokeWidth="2" style="width: 36px; height: 36px" />
    <p class="callback-text">Signing you in…</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ProgressSpinner from 'primevue/progressspinner'

export default defineComponent({
  components: { ProgressSpinner },
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    onMounted(async () => {
      try {
        await authStore.handleCallback()
        router.replace('/dashboard')
      } catch (err) {
        console.error('Error handling login callback:', err)
        router.replace('/')
      }
    })
  },
})
</script>

<style scoped>
.callback {
  --c-bg:   #0d0f14;
  --c-muted: #6b7280;

  width: 100vw;
  height: 100vh;
  background: var(--c-bg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

@media (prefers-color-scheme: light) {
  .callback {
    --c-bg:   #f9fafb;
    --c-muted: #6b7280;
  }
}

.callback-text {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--c-muted);
}
</style>
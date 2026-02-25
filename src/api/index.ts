import { OpenAPI } from './generated'
import { useAuthStore } from '@/stores/auth'

OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

OpenAPI.TOKEN = async () => {
    const authStore = useAuthStore()
    return authStore.accessToken || ''
}

// Re-export everything from generated
export * from './generated'
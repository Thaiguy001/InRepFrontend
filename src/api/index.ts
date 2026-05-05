import { OpenAPI } from './generated'
import { useAuthStore } from '@/stores/auth'

OpenAPI.BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

OpenAPI.TOKEN = async () => {
    const authStore = useAuthStore()
    return authStore.accessToken || ''
}

const originalFetch = window.fetch
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const response = await originalFetch(input, init)
    
    if (response.status === 401) {
        const authStore = useAuthStore()
        await authStore.handleSessionExpired()
    }
    
    return response
}

// Re-export everything from generated
export * from './generated'
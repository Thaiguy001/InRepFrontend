import { defineStore } from 'pinia'
import { UserManager, User as OidcUser } from 'oidc-client-ts'
import { type User } from '@/api/generated/models/User'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as OidcUser | null,
    appUser: null as User | null,
    userManager: null as UserManager | null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    accessToken: (state) => state.user?.access_token,
    userId: (state) => state.appUser?.id,
    userRole: (state) => state.appUser?.role,
    userName: (state) => state.appUser?.username || state.appUser?.email,
  },
  actions: {
    init() {
      this.userManager = new UserManager({
        authority: import.meta.env.VITE_COGNITO_USER_POOL_URL,
        client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
        redirect_uri: window.location.origin + '/callback',
        response_type: 'code',
        scope: 'openid profile email',
        post_logout_redirect_uri: window.location.origin,
        metadata: {
          issuer: import.meta.env.VITE_COGNITO_USER_POOL_URL,
          authorization_endpoint: import.meta.env.VITE_COGNITO_DOMAIN + '/oauth2/authorize',
          end_session_endpoint: import.meta.env.VITE_COGNITO_DOMAIN + '/logout',
          token_endpoint: import.meta.env.VITE_COGNITO_DOMAIN + '/oauth2/token',
          userinfo_endpoint: import.meta.env.VITE_COGNITO_DOMAIN + '/oauth2/userInfo',
          jwks_uri: `${import.meta.env.VITE_COGNITO_USER_POOL_URL}/.well-known/jwks.json`,
        },
      })

      // Subscribe to events
      this.userManager.events.addUserLoaded((user) => {
        this.user = user
      })

      this.userManager.events.addUserUnloaded(() => {
        this.user = null
        this.appUser = null
      })

      this.userManager.events.addAccessTokenExpired(() => {
        this.user = null
        this.appUser = null
      })

      // Try to load user from storage
      this.userManager.getUser().then((user) => {
        this.user = user
      })
    },

    login() {
      console.log('Initiating login...')
      if (!this.userManager) return
      this.userManager.signinRedirect()
    },

    async handleCallback() {
      if (!this.userManager) return
      this.user = await this.userManager.signinRedirectCallback()
      await this.syncUser(); //TODO add error handling and loading state for this call
    },

    async syncUser() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.user?.access_token}`,
            'Content-Type': 'application/json',
            'X-ID-Token': this.user?.id_token || '',
          }
        })

        if (response.ok) {
          this.appUser = await response.json()
        } else {
          console.error('Failed to sync user')
        }
      } catch (error) {
        console.error('Error syncing user:', error)
      }
    },
    async logout() {
      if (!this.userManager) return

      // clear local session
      this.user = null
      this.appUser = null

      // clear oidc-client-ts cached user
      await this.userManager.removeUser() // removes user from storage
      await this.userManager.clearStaleState() // cleans any pending state

      // redirect to Cognito logout
      const domain = import.meta.env.VITE_COGNITO_DOMAIN
      const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID
      const logoutUri = encodeURIComponent(window.location.origin)

      window.location.href = `${domain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`
    },
  },
   persist: {
    pick: ['appUser'],
  },
})

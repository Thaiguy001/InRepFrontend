import { ref } from 'vue'
import { TeamsService } from '@/api'
import type { Team } from '@/api/generated/models/Team'
import type { Query } from '@/api/generated/models/Query'
import { useToastHelperService } from '@/services/toastHelperService'

// Module-level state, shared across all calls
const teams = ref<Team[]>([])
const total = ref(0)
const loading = ref(false)

export function useTeamsData() {
    const { showSuccess, showError } = useToastHelperService()

    async function fetchTeams() {
        loading.value = true
        try {
            const result = await TeamsService.getApiV1Teams()
            if (result) {
                teams.value = [...(result as Team[])]
                total.value = teams.value.length
            } else {
                showError('Failed to load teams', 'Invalid response format')
            }
        } catch (error) {
            showError('Failed to load teams', String(error))
        } finally {
            loading.value = false
        }
    }

    async function createTeam(team: Omit<Team, 'id'>) {
        try {
            const result = await TeamsService.postApiV1TeamsCreate(team as Team)
            if (result && 'id' in result) {
                teams.value.push(result as Team)
                showSuccess('Team created successfully')
                return result as Team
            } else {
                showError('Failed to create team', String(result))
                throw new Error(String(result))
            }
        } catch (error) {
            showError('Failed to create team', String(error))
            throw error
        }
    }

    async function updateTeam(id: number, team: Omit<Team, 'id'>) {
        try {
            const result = await TeamsService.putApiV1TeamsUpdate(id, team as Team)
            if (result && 'id' in result) {
                const index = teams.value.findIndex((t) => t.id === id)
                if (index !== -1) {
                    teams.value[index] = result as Team
                }
                showSuccess('Team updated successfully')
                return result as Team
            } else {
                showError('Failed to update team', String(result))
                throw new Error(String(result))
            }
        } catch (error) {
            showError('Failed to update team', String(error))
            throw error
        }
    }

    async function deleteTeam(id: number) {
        try {
            await TeamsService.deleteApiV1TeamsDelete(id)
            teams.value = teams.value.filter((t) => t.id !== id)
            showSuccess('Team deleted successfully')
        } catch (error) {
            showError('Failed to delete team', String(error))
            throw error
        }
    }

    async function queryTeams(query: Query) {
        loading.value = true
        try {
            const result = await TeamsService.postApiV1TeamsQuery(query)
            if (result && typeof result === 'object' && 'data' in result) {
                teams.value = Array.isArray(result.data) ? [...result.data] : []

                const apiTotal = typeof result.total === 'number' ? result.total : undefined
                const minimumTotal = teams.value.length
                if (apiTotal === undefined) {
                    total.value = minimumTotal
                } else {
                    // Keep the reported total when valid, but avoid ending with 0 when rows are returned.
                    total.value = apiTotal > minimumTotal ? apiTotal : minimumTotal
                }
            } else if (Array.isArray(result)) {
                // fallback for older behavior if API returns an array accidentally
                teams.value = [...(result as Team[])]
                total.value = teams.value.length
            } else {
                showError('Failed to query teams', 'Invalid response format')
                teams.value = []
                total.value = 0
            }
        } catch (error) {
            showError('Failed to query teams', String(error))
            teams.value = []
            total.value = 0
        } finally {
            loading.value = false
        }
    }

    return {
        teams,
        total,
        loading,
        fetchTeams,
        createTeam,
        updateTeam,
        deleteTeam,
        queryTeams,
    }
}

export function useTeamsForm() {
    const formData = ref<Partial<Team>>({
        name: '',
        description: '',
    })

    const errors = ref<Record<string, string>>({})

    function resetForm() {
        formData.value = {
            name: '',
            description: '',
        }
        errors.value = {}
    }

    function setFormData(team: Team) {
        formData.value = { ...team }
    }

    function validate(): boolean {
        errors.value = {}

        if (!formData.value.name?.trim()) {
            errors.value.name = 'Name is required'
        }

        if (!formData.value.description?.trim()) {
            errors.value.description = 'Description is required'
        }

        return Object.keys(errors.value).length === 0
    }

    function getFormValues(): Team {
        return formData.value as Team
    }

    return {
        formData,
        errors,
        resetForm,
        setFormData,
        validate,
        getFormValues,
    }
}
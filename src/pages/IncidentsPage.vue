<template>
  <h1>Incidents</h1>
</template>


<script setup lang="ts">
import Card from 'primevue/card'
import { onMounted, reactive } from 'vue'
// import { TestingService } from '@/api/generated'

const state = reactive({
    testMessage: null as string | null,
    loading: false,
    error: null as string | null,
})

onMounted(() => {
    console.log('AboutView mounted')
    fetchTest()
})

async function fetchTest() {
    state.loading = true
    state.error = null
    try {
        // const response = await TestingService.getApiV1Test()
        const response = { data: 'Test message from IncidentsPage' }
        if ('data' in response) {
            state.testMessage = response.data
        } else {
            //state.error = response.message || 'An error occurred'
        }
    } catch (error: any) {
        state.error = error?.message || 'An error occurred'
    } finally {
        state.loading = false
    }
}
</script>

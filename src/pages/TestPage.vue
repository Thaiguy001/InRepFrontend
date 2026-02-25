<template>
    <div class="testPage">
        <div>
            <h1>Test Page</h1>
            <p>Test page</p>
        </div>
        <div v-if="!state.loading">
            <Card class="mb-3">
                <template #title>{{ state.testMessage }}</template>

            </Card>
        </div>
        <div v-else-if="state.error">{{ state.error }}</div>
        <div v-else>
            <p>Loading...</p>
        </div>
    </div>

</template>

<script setup lang="ts">
import Card from 'primevue/card'
import { onMounted, reactive } from 'vue'
import { TestService } from '@/api'

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
        const response = await TestService.getApiV1Test()

        if ('data' in response) {
            state.testMessage = response.data
        } else {
            state.error = response.message || 'An error occurred'
        }
    } catch (error: any) {
        state.error = error?.message || 'An error occurred'
    } finally {
        state.loading = false
    }
}

</script>

<style scoped>
.testPage {
    width: 85vw;
    margin-left: 15vw;
    padding: 3%;
}
</style>

<template>
    <div class="header-row">
        <div>
            <h1>{{ title }}</h1>
            <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
        </div>

        <div v-if="$slots.actions" class="header-actions">
            <slot name="actions" />
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    title: string
    subtitle?: string
}>()
</script>
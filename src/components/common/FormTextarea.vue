<template>
  <div class="form-group-modern">
    <div class="input-wrapper">
      <label :for="id" class="input-label" v-if="label">
        <i :class="icon" v-if="icon"></i>
        {{ label }}
        <span class="required-indicator" v-if="required">*</span>
      </label>
      <div class="input-container" :class="{ 'has-error': hasError }">
        <textarea
          :id="id"
          :value="modelValue"
          @input="onInput"
          class="modern-input textarea-input"
          :placeholder="placeholder"
          :rows="rows"
          :disabled="disabled"
          :readonly="readonly"
        ></textarea>
        <div class="input-accent"></div>
      </div>
      <div v-if="error" class="error-feedback">
        <i class="pi pi-exclamation-circle"></i>
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  id?: string
  label?: string
  icon?: string
  placeholder?: string
  modelValue?: string
  error?: string
  required?: boolean
  rows?: number
  disabled?: boolean
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  id: '',
  label: '',
  icon: '',
  placeholder: '',
  modelValue: '',
  error: '',
  required: false,
  rows: 3,
  disabled: false,
  readonly: false
})

const hasError = computed(() => !!props.error)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement | null
  if (target) {
    emit('update:modelValue', target.value)
  }
}
</script>

<style scoped>
.form-group-modern {
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }

  .input-wrapper {
    .input-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #e5e7eb;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;

      i {
        color: #10b981;
        font-size: 0.875rem;
      }

      .required-indicator {
        color: #ef4444;
        font-size: 0.75rem;
      }
    }

    .input-container {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      background: #374151;
      border: 2px solid #4b5563;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

      &:hover {
        border-color: #6b7280;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      }

      &:focus-within {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
      }

      &.has-error {
        border-color: #ef4444;
        background: #451a1a;

        .input-accent {
          background: linear-gradient(90deg, #ef4444 0%, #f87171 100%);
        }
      }

      .modern-input {
        width: 100%;
        border: none;
        outline: none;
        background: transparent;
        padding: 1rem 1.25rem;
        font-size: 0.95rem;
        color: #f9fafb;
        font-family: inherit;
        resize: vertical;

        &::placeholder {
          color: #9ca3af;
          opacity: 1;
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        &:readonly {
          opacity: 0.8;
          cursor: default;
        }

        &.textarea-input {
          min-height: 80px;
        }
      }

      .input-accent {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        transform: scaleX(0);
        transition: transform 0.3s ease;
        transform-origin: left;
      }

      &:focus-within .input-accent {
        transform: scaleX(1);
      }
    }

    .error-feedback {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      color: #ef4444;
      font-size: 0.8rem;
      font-weight: 500;

      i {
        font-size: 0.75rem;
      }
    }
  }
}
</style>
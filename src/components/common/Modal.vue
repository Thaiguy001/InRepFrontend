<template>
  <!-- Modern Reusable Modal -->
  <Teleport to="body">
    <Transition name="modal" appear>
      <div v-if="visible" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" :class="sizeClass" @click.stop>
          <!-- Modal Header -->
          <div class="modal-header" v-if="showHeader">
            <div class="header-content">
              <div class="header-icon" v-if="icon">
                <i :class="icon"></i>
              </div>
              <div class="header-text">
                <h2 class="modal-title">{{ title }}</h2>
                <p class="modal-subtitle" v-if="subtitle">{{ subtitle }}</p>
              </div>
            </div>
            <button class="close-button" @click="handleClose" v-if="closable">
              <i class="pi pi-times"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <slot></slot>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer" v-if="showFooter">
            <div class="footer-actions">
              <button type="button" class="btn-secondary" @click="handleClose" v-if="showCancelButton">
                <i class="pi pi-times"></i>
                {{ cancelText }}
              </button>
              <button type="button" class="btn-primary" @click="handleConfirm" :disabled="loading"
                v-if="showConfirmButton">
                <i :class="loading ? 'pi pi-spin pi-spinner' : confirmIcon"></i>
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible: boolean
  title?: string
  subtitle?: string
  icon?: string
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  closable?: boolean
  showHeader?: boolean
  showFooter?: boolean
  showCancelButton?: boolean
  showConfirmButton?: boolean
  cancelText?: string
  confirmText?: string
  confirmIcon?: string
  loading?: boolean
  closeOnOverlayClick?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  icon: '',
  size: 'medium',
  closable: true,
  showHeader: true,
  showFooter: true,
  showCancelButton: true,
  showConfirmButton: true,
  cancelText: 'Cancel',
  confirmText: 'Confirm',
  confirmIcon: 'pi pi-check',
  loading: false,
  closeOnOverlayClick: true
})

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const sizeClass = computed(() => {
  const sizeMap = {
    small: 'modal-small',
    medium: 'modal-medium',
    large: 'modal-large',
    xlarge: 'modal-xlarge'
  }
  return sizeMap[props.size]
})

const handleClose = () => {
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}

const handleOverlayClick = () => {
  if (props.closeOnOverlayClick) {
    handleClose()
  }
}
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: linear-gradient(145deg, #1f2937 0%, #111827 100%);
  border-radius: 24px;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.5),
    0 15px 35px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Size variants */
.modal-small {
  max-width: 400px;
}

.modal-medium {
  max-width: 480px;
}

.modal-large {
  max-width: 600px;
}

.modal-xlarge {
  max-width: 800px;
}

.modal-header {
  padding: 2rem 2rem 1.5rem 2rem;
  border-bottom: 1px solid #374151;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="10" cy="50" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="90" cy="30" r="0.5" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="80" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
    z-index: 1;

    .header-icon {
      width: 3rem;
      height: 3rem;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);

      i {
        font-size: 1.25rem;
        color: white;
      }
    }

    .header-text {
      .modal-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0 0 0.25rem 0;
        color: white;
        letter-spacing: -0.025em;
      }

      .modal-subtitle {
        font-size: 0.875rem;
        margin: 0;
        opacity: 0.9;
        font-weight: 400;
      }
    }
  }

  .close-button {
    position: absolute;
    top: 1.5rem;
    right: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    backdrop-filter: blur(10px);
    z-index: 1;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }

    i {
      font-size: 1rem;
    }
  }
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  padding: 1.5rem 2rem 2rem 2rem;
  border-top: 1px solid #374151;
  background: #1f2937;

  .footer-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;

    .btn-secondary {
      background: #374151;
      border: 2px solid #4b5563;
      color: #d1d5db;
      border-radius: 12px;
      padding: 0.875rem 1.5rem;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 120px;
      justify-content: center;

      &:hover {
        background: #4b5563;
        border-color: #6b7280;
        color: #f9fafb;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      i {
        font-size: 0.875rem;
      }
    }

    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      color: white;
      border-radius: 12px;
      padding: 0.875rem 1.5rem;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 140px;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
      }

      &:active {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      i {
        font-size: 0.875rem;
      }
    }
  }
}

/* Modal transition animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

/* Responsive design */
@media (max-width: 768px) {
  .modal-container {
    max-width: 95%;
    margin: 1rem;

    .modal-header {
      padding: 1.5rem 1.5rem 1rem 1.5rem;

      .header-content {
        gap: 0.75rem;

        .header-icon {
          width: 2.5rem;
          height: 2.5rem;

          i {
            font-size: 1rem;
          }
        }

        .header-text {
          .modal-title {
            font-size: 1.25rem;
          }

          .modal-subtitle {
            font-size: 0.8rem;
          }
        }
      }

      .close-button {
        top: 1rem;
        right: 1rem;
        width: 2rem;
        height: 2rem;

        i {
          font-size: 0.875rem;
        }
      }
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      padding: 1.5rem;

      .footer-actions {
        gap: 0.75rem;
        flex-wrap: wrap;

        .btn-secondary,
        .btn-primary {
          min-width: auto;
          width: calc(50% - 0.375rem);
          padding: 0.75rem 1rem;
          font-size: 0.85rem;

          i {
            font-size: 0.75rem;
          }
        }
      }
    }
  }
}
</style>
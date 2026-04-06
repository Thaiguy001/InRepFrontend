# Reusable Modal Components

This directory contains reusable modal and form components that can be used throughout the application.

## Components

### Modal.vue
A fully customizable modal component with dark theme and green accents.

#### Props
- `visible` (boolean): Controls modal visibility
- `title` (string): Modal title
- `subtitle` (string): Optional subtitle
- `icon` (string): Icon class for the header
- `size` ('small' | 'medium' | 'large' | 'xlarge'): Modal size
- `closable` (boolean): Show close button (default: true)
- `showHeader` (boolean): Show header section (default: true)
- `showFooter` (boolean): Show footer section (default: true)
- `showCancelButton` (boolean): Show cancel button (default: true)
- `showConfirmButton` (boolean): Show confirm button (default: true)
- `cancelText` (string): Cancel button text (default: 'Cancel')
- `confirmText` (string): Confirm button text (default: 'Confirm')
- `confirmIcon` (string): Confirm button icon (default: 'pi pi-check')
- `loading` (boolean): Show loading state on confirm button
- `closeOnOverlayClick` (boolean): Close modal when clicking overlay (default: true)

#### Events
- `close`: Emitted when modal should close
- `confirm`: Emitted when confirm button is clicked

#### Usage
```vue
<template>
  <Modal
    v-model:visible="showModal"
    title="Create New Item"
    subtitle="Add a new item to your collection"
    icon="pi pi-plus"
    :loading="submitting"
    @close="showModal = false"
    @confirm="handleSubmit"
  >
    <!-- Your content here -->
    <FormInput
      label="Name"
      icon="pi pi-tag"
      v-model="formData.name"
      :error="errors.name"
      required
    />
  </Modal>
</template>

<script setup>
import { Modal, FormInput } from '@/components/common'
</script>
```

### FormInput.vue
A styled input component with validation support.

#### Props
- `id` (string): Input ID
- `label` (string): Input label
- `icon` (string): Icon class for the label
- `type` (string): Input type (default: 'text')
- `placeholder` (string): Placeholder text
- `modelValue` (string): v-model value
- `error` (string): Error message
- `required` (boolean): Show required indicator
- `disabled` (boolean): Disable input
- `readonly` (boolean): Make input readonly

#### Events
- `update:modelValue`: Emitted when input value changes

### FormTextarea.vue
A styled textarea component with validation support.

#### Props
- Same as FormInput plus:
- `rows` (number): Number of rows (default: 3)

## Features

- **Dark Theme**: Modern dark background with green accents
- **Glassmorphism**: Backdrop blur effects
- **Responsive**: Mobile-optimized layouts
- **Animations**: Smooth slide-in animations
- **Accessibility**: Proper focus management and keyboard navigation
- **Validation**: Built-in error state styling
- **Loading States**: Loading indicators for async operations

## Styling

All components use scoped styles and follow the application's design system:
- Dark backgrounds with subtle gradients
- Green accent colors for primary actions
- Consistent spacing and typography
- Hover and focus states
- Mobile-responsive breakpoints
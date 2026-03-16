import { useToast } from "primevue/usetoast";

export function useToastHelperService() {
    const toast = useToast();

    const showSuccess = (summary = 'Success Message', detail = '') => {
        toast.add({ severity: 'success', summary, detail, life: 3000 });
    };

    const showInfo = (summary = 'Info Message', detail = '') => {
        toast.add({ severity: 'info', summary, detail, life: 3000 });
    };

    const showWarn = (summary = 'Warn Message', detail = '') => {
        toast.add({ severity: 'warn', summary, detail, life: 3000 });
    };

    const showError = (summary = 'Error Message', detail = '') => {
        toast.add({ severity: 'error', summary, detail, life: 3000 });
    };

    const showSecondary = (summary = 'Secondary Message', detail = '') => {
        toast.add({ severity: 'secondary', summary, detail, life: 3000 });
    };

    const showContrast = (summary = 'Contrast Message', detail = '') => {
        toast.add({ severity: 'contrast', summary, detail, life: 3000 });
    };

    return {
        showSuccess,
        showInfo,
        showWarn,
        showError,
        showSecondary,
        showContrast
    }
}
<template>
  <div class="dashboard">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Welcome back, {{ auth.userName }} — here's what's happening.</p>
      </div>
      <Button icon="pi pi-refresh" class="btn-refresh" :loading="state.loading" @click="fetchAll" v-tooltip.left="'Refresh'" />
    </div>

    <div v-if="state.error" class="error-banner">
      <i class="pi pi-exclamation-circle"></i>
      {{ state.error }}
    </div>

    <!-- Stat cards -->
    <div class="stat-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.iconBg, color: stat.iconColor }">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-body">
          <p class="stat-label">{{ stat.label }}</p>
          <p class="stat-value">{{ state.loading ? '—' : stat.value }}</p>
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="charts-grid">

      <div class="chart-card wide">
        <div class="chart-header">
          <h2 class="chart-title">Incidents Over Time</h2>
          <p class="chart-subtitle">Last 14 days</p>
        </div>
        <div class="chart-body">
          <Chart v-if="!state.loading" type="line" :data="lineChartData" :options="lineChartOptions" class="chart" />
          <div v-else class="chart-loading"><ProgressSpinner strokeWidth="3" style="width:28px;height:28px" /></div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h2 class="chart-title">By Status</h2>
          <p class="chart-subtitle">Current breakdown</p>
        </div>
        <div class="chart-body chart-body-center">
          <Chart v-if="!state.loading" type="doughnut" :data="statusChartData" :options="doughnutOptions" class="chart-doughnut" />
          <div v-else class="chart-loading"><ProgressSpinner strokeWidth="3" style="width:28px;height:28px" /></div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h2 class="chart-title">By Severity</h2>
          <p class="chart-subtitle">Current breakdown</p>
        </div>
        <div class="chart-body chart-body-center">
          <Chart v-if="!state.loading" type="doughnut" :data="severityChartData" :options="doughnutOptions" class="chart-doughnut" />
          <div v-else class="chart-loading"><ProgressSpinner strokeWidth="3" style="width:28px;height:28px" /></div>
        </div>
      </div>

    </div>

    <!-- Incidents per service -->
    <div class="chart-card full">
      <div class="chart-header">
        <h2 class="chart-title">Incidents per Service</h2>
        <p class="chart-subtitle">All time total</p>
      </div>
      <div class="chart-body">
        <Chart v-if="!state.loading" type="bar" :data="barChartData" :options="barChartOptions" class="chart" />
        <div v-else class="chart-loading"><ProgressSpinner strokeWidth="3" style="width:28px;height:28px" /></div>
      </div>
    </div>

    <!-- Unresolved incidents -->
    <div class="chart-card full">
      <div class="chart-header">
        <h2 class="chart-title">Unresolved Incidents</h2>
        <p class="chart-subtitle">Requires attention</p>
      </div>
      <div v-if="state.loading" class="chart-loading" style="padding: 2rem">
        <ProgressSpinner strokeWidth="3" style="width:28px;height:28px" />
      </div>
      <div v-else-if="unresolvedIncidents.length === 0" class="empty-state">
        <i class="pi pi-check-circle" style="font-size:1.5rem;opacity:0.3"></i>
        <p>No unresolved incidents</p>
      </div>
      <div v-else class="incident-list">
        <div v-for="incident in unresolvedIncidents" :key="incident.id" class="incident-row">
          <div class="incident-left">
            <span :class="['severity-badge', `sev-${incident.severity?.toLowerCase()}`]">{{ incident.severity }}</span>
            <span :class="['status-badge', `status-${incident.status?.toLowerCase()}`]">{{ incident.status }}</span>
            <span class="incident-summary">{{ incident.summary }}</span>
          </div>
          <div class="incident-right">
            <span class="incident-service">{{ serviceName(incident.service_id || null) }}</span>
            <span class="incident-time">{{ formatDate(incident.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import Chart from 'primevue/chart'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import { IncidentService, ServiceService } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useToastHelperService } from '@/services/toastHelperService'
import type { Incident } from '@/api/generated/models/Incident'
import type { Service } from '@/api/generated/models/Service'

const auth = useAuthStore()
const { showError } = useToastHelperService()

const state = reactive({
  incidents: [] as Incident[],
  services: [] as Service[],
  loading: false,
  error: null as string | null,
})

fetchAll()

async function fetchAll() {
  state.loading = true
  state.error = null
  try {
    state.incidents = await IncidentService.getApiV1Incidents() as Incident[]
    state.services = await ServiceService.getApiV1Service() as Service[]
  } catch (error: any) {
    state.error = error?.message || 'Failed to load dashboard data'
    showError('Error loading dashboard: ' + state.error)
  } finally {
    state.loading = false
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function serviceName(service_id: number | null): string {
  return state.services.find(s => s.id === service_id)?.name ?? `Service #${service_id}`
}

function formatDate(ts: any): string {
  if (!ts) return ''
  const d = new Date(ts)
  return isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}

// ── Derived data ───────────────────────────────────────────────────────────────

const unresolvedIncidents = computed(() =>
  state.incidents
    .filter(i => i.status !== 'resolved')
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 10)
)

// Stat icon colours are intentionally kept as fixed values since they serve as
// semantic colour indicators (red = bad, green = good) that should stay consistent
// regardless of light/dark mode — same approach as the severity/status badges.
const stats = computed(() => {
  const triggered = state.incidents.filter(i => i.status === 'triggered').length
  const acknowledged = state.incidents.filter(i => i.status === 'acknowledged').length
  const resolved = state.incidents.filter(i => i.status === 'resolved').length
  return [
    { label: 'Total Incidents', value: state.incidents.length, icon: 'pi pi-bolt',                iconBg: 'rgba(148,163,184,0.12)', iconColor: '#94a3b8' },
    { label: 'Triggered',       value: triggered,              icon: 'pi pi-exclamation-triangle', iconBg: 'rgba(248,113,113,0.12)', iconColor: '#f87171' },
    { label: 'Acknowledged',    value: acknowledged,           icon: 'pi pi-eye',                  iconBg: 'rgba(96,165,250,0.12)',  iconColor: '#60a5fa' },
    { label: 'Resolved',        value: resolved,               icon: 'pi pi-check-circle',         iconBg: 'rgba(74,222,128,0.12)', iconColor: '#4ade80' },
    { label: 'Services',        value: state.services.length,  icon: 'pi pi-server',               iconBg: 'rgba(167,139,250,0.12)', iconColor: '#a78bfa' },
  ]
})

// ── Chart colours — use rgba so they work on both light and dark backgrounds ───

const CHART_BLUE   = '#60a5fa'
const CHART_RED    = '#f87171'
const CHART_GREEN  = '#4ade80'
const CHART_BORDER = 'rgba(148,163,184,0.08)'

// Chart options are reactive to honour dark/light mode.
// We read a CSS variable at runtime to get the correct tick/grid colours.
function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

const isDark = computed(() =>
  window.matchMedia('(prefers-color-scheme: dark)').matches
)

const tickColor  = computed(() => isDark.value ? '#6b7280' : '#9ca3af')
const gridColor  = computed(() => isDark.value ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)')
const tooltipBg  = computed(() => isDark.value ? '#1e293b' : '#ffffff')
const tooltipBorder = computed(() => isDark.value ? '#334155' : '#e5e7eb')
const tooltipTitle  = computed(() => isDark.value ? '#f1f5f9' : '#111827')
const tooltipBody   = computed(() => isDark.value ? '#94a3b8' : '#6b7280')
const legendColor   = computed(() => isDark.value ? '#94a3b8' : '#6b7280')
const doughnutBorder = computed(() => isDark.value ? '#1a1d27' : '#ffffff')

// ── Charts ─────────────────────────────────────────────────────────────────────

const lineChartData = computed(() => {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (13 - i))
    return d
  })
  return {
    labels: days.map(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [{
      label: 'Incidents',
      data: days.map(day => {
        const start = new Date(day); start.setHours(0, 0, 0, 0)
        const end   = new Date(day); end.setHours(23, 59, 59, 999)
        return state.incidents.filter(i => {
          const t = new Date(i.created_at || 0).getTime()
          return t >= start.getTime() && t <= end.getTime()
        }).length
      }),
      fill: true,
      borderColor: CHART_BLUE,
      backgroundColor: 'rgba(96,165,250,0.08)',
      tension: 0.4,
      pointBackgroundColor: CHART_BLUE,
      pointRadius: 3,
      pointHoverRadius: 5,
    }]
  }
})

const statusChartData = computed(() => ({
  labels: ['Triggered', 'Acknowledged', 'Resolved'],
  datasets: [{
    data: [
      state.incidents.filter(i => i.status === 'triggered').length,
      state.incidents.filter(i => i.status === 'acknowledged').length,
      state.incidents.filter(i => i.status === 'resolved').length,
    ],
    backgroundColor: [CHART_RED, CHART_BLUE, CHART_GREEN],
    borderColor: doughnutBorder.value,
    borderWidth: 3,
  }]
}))

const severityChartData = computed(() => {
  const counts: Record<string, number> = {}
  state.incidents.forEach(i => {
    const s = i.severity ?? 'unknown'
    counts[s] = (counts[s] ?? 0) + 1
  })
  const severityColors: Record<string, string> = {
    critical: CHART_RED, high: '#fb923c', medium: '#facc15', low: CHART_GREEN, unknown: '#6b7280',
  }
  const labels = Object.keys(counts)
  return {
    labels,
    datasets: [{
      data: Object.values(counts),
      backgroundColor: labels.map(l => severityColors[l.toLowerCase()] ?? '#6b7280'),
      borderColor: doughnutBorder.value,
      borderWidth: 3,
    }]
  }
})

const barChartData = computed(() => {
  const counts: Record<number, number> = {}
  state.incidents.forEach(i => {
    const serviceId = i.service_id ?? 0
    counts[serviceId] = (counts[serviceId] ?? 0) + 1
  })
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12)
  return {
    labels: sorted.map(([id]) => serviceName(Number(id))),
    datasets: [{
      label: 'Incidents',
      data: sorted.map(([, count]) => count),
      backgroundColor: 'rgba(96,165,250,0.7)',
      borderColor: CHART_BLUE,
      borderWidth: 1,
      borderRadius: 4,
    }]
  }
})

const lineChartOptions = computed(() => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: tooltipBg.value, titleColor: tooltipTitle.value, bodyColor: tooltipBody.value, borderColor: tooltipBorder.value, borderWidth: 1 },
  },
  scales: {
    x: { grid: { color: gridColor.value }, ticks: { color: tickColor.value, font: { size: 11 } }, border: { display: false } },
    y: { grid: { color: gridColor.value }, ticks: { color: tickColor.value, font: { size: 11 }, stepSize: 1 }, border: { display: false }, beginAtZero: true },
  }
}))

const barChartOptions = computed(() => ({
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: tooltipBg.value, titleColor: tooltipTitle.value, bodyColor: tooltipBody.value, borderColor: tooltipBorder.value, borderWidth: 1 },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: tickColor.value, font: { size: 11 } }, border: { display: false } },
    y: { grid: { color: gridColor.value }, ticks: { color: tickColor.value, font: { size: 11 }, stepSize: 1 }, border: { display: false }, beginAtZero: true },
  }
}))

const doughnutOptions = computed(() => ({
  responsive: true, maintainAspectRatio: false, cutout: '72%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: legendColor.value, font: { size: 12 }, padding: 16, usePointStyle: true, pointStyleWidth: 8 },
    },
    tooltip: { backgroundColor: tooltipBg.value, titleColor: tooltipTitle.value, bodyColor: tooltipBody.value, borderColor: tooltipBorder.value, borderWidth: 1 },
  }
}))
</script>

<style scoped>
/* ── Light mode tokens ── */
.dashboard {
  --c-bg:          #f3f4f6;
  --c-card:        #ffffff;
  --c-border:      #e5e7eb;
  --c-text:        #111827;
  --c-muted:       #6b7280;
  --c-faint:       #d1d5db;
  --c-error-bg:    #fef2f2;
  --c-error-border:#fecaca;
  --c-error-text:  #dc2626;

  background: var(--c-bg);
  min-height: 100vh;
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Dark mode tokens ── */
@media (prefers-color-scheme: dark) {
  .dashboard {
    --c-bg:          #111318;
    --c-card:        #1b1f27;
    --c-border:      #2f3745;
    --c-text:        #f3f4f6;
    --c-muted:       #8b92a9;
    --c-faint:       #374151;
    --c-error-bg:    #2d1515;
    --c-error-border:#4b1e1e;
    --c-error-text:  #f87171;
  }
}

.page-header { display: flex; align-items: flex-start; justify-content: space-between; }
.page-title  { margin: 0; font-size: 2rem; font-weight: 700; color: var(--c-text); }
.page-subtitle { margin: 0.25rem 0 0; font-size: 0.9375rem; color: var(--c-muted); }

:deep(.btn-refresh.p-button) {
  background: var(--c-card) !important; border: 1px solid var(--c-border) !important;
  color: var(--c-muted) !important; border-radius: 8px !important;
  width: 38px !important; height: 38px !important; transition: all 0.12s !important;
}
:deep(.btn-refresh.p-button:hover) { border-color: var(--c-faint) !important; color: var(--c-text) !important; }

.error-banner {
  display: flex; align-items: center; gap: 0.5rem;
  background: var(--c-error-bg); border: 1px solid var(--c-error-border);
  border-radius: 8px; padding: 0.75rem 1rem;
  font-size: 0.875rem; color: var(--c-error-text);
}

/* ── Stat grid ── */
.stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; }
@media (max-width: 1100px) { .stat-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 700px)  { .stat-grid { grid-template-columns: repeat(2, 1fr); } }

.stat-card {
  background: var(--c-card); border: 1px solid var(--c-border); border-radius: 12px;
  padding: 1.125rem 1.25rem; display: flex; align-items: center; gap: 1rem;
  transition: border-color 0.12s;
}
.stat-card:hover { border-color: var(--c-faint); }
.stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
.stat-label { margin: 0; font-size: 0.75rem; color: var(--c-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value { margin: 0.2rem 0 0; font-size: 1.75rem; font-weight: 700; color: var(--c-text); line-height: 1; }

/* ── Charts grid ── */
.charts-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; }
@media (max-width: 1100px) { .charts-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 700px)  { .charts-grid { grid-template-columns: 1fr; } }

/* ── Chart card ── */
.chart-card { background: var(--c-card); border: 1px solid var(--c-border); border-radius: 12px; overflow: hidden; }
.chart-card.full { width: 100%; }
.chart-header { padding: 1.25rem 1.5rem 0.75rem; border-bottom: 1px solid var(--c-border); }
.chart-title { margin: 0; font-size: 1rem; font-weight: 700; color: var(--c-text); }
.chart-subtitle { margin: 0.125rem 0 0; font-size: 0.8125rem; color: var(--c-muted); }
.chart-body { padding: 1.25rem 1.5rem; height: 240px; }
.chart-body-center { display: flex; align-items: center; justify-content: center; }
.chart { width: 100% !important; height: 100% !important; }
.chart-doughnut { max-height: 210px; }
.chart-loading { height: 100%; display: flex; align-items: center; justify-content: center; }

/* ── Unresolved incidents ── */
.incident-list { display: flex; flex-direction: column; }
.incident-row {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding: 0.875rem 1.5rem; border-bottom: 1px solid var(--c-border); transition: background 0.1s;
}
.incident-row:last-child { border-bottom: none; }
.incident-row:hover { background: rgba(0,0,0,0.02); }

@media (prefers-color-scheme: dark) {
  .incident-row:hover { background: rgba(255,255,255,0.02); }
}

.incident-left  { display: flex; align-items: center; gap: 0.625rem; min-width: 0; flex: 1; }
.incident-right { display: flex; align-items: center; gap: 1rem; flex-shrink: 0; }
.incident-summary { font-size: 0.875rem; color: var(--c-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.incident-service { font-size: 0.8125rem; color: var(--c-muted); }
.incident-time    { font-size: 0.8125rem; color: var(--c-muted); white-space: nowrap; }

/* ── Badges — semantic colours stay consistent across modes ── */
.severity-badge, .status-badge {
  display: inline-flex; padding: 0.175rem 0.5rem; border-radius: 4px;
  font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; flex-shrink: 0;
}

.sev-critical  { background: rgba(248,113,113,0.15); color: #dc2626; }
.sev-high      { background: rgba(251,146,60,0.15);  color: #ea580c; }
.sev-medium    { background: rgba(250,204,21,0.15);  color: #ca8a04; }
.sev-low       { background: rgba(74,222,128,0.15);  color: #16a34a; }

.status-triggered    { background: rgba(248,113,113,0.15); color: #dc2626; }
.status-acknowledged { background: rgba(96,165,250,0.15);  color: #2563eb; }
.status-resolved     { background: rgba(74,222,128,0.15);  color: #16a34a; }

@media (prefers-color-scheme: dark) {
  .sev-critical  { background: rgba(248,113,113,0.12); color: #f87171; }
  .sev-high      { background: rgba(251,146,60,0.12);  color: #fb923c; }
  .sev-medium    { background: rgba(250,204,21,0.12);  color: #facc15; }
  .sev-low       { background: rgba(74,222,128,0.12);  color: #4ade80; }

  .status-triggered    { background: rgba(248,113,113,0.12); color: #f87171; }
  .status-acknowledged { background: rgba(96,165,250,0.12);  color: #60a5fa; }
  .status-resolved     { background: rgba(74,222,128,0.12);  color: #4ade80; }
}

.empty-state { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2.5rem; color: var(--c-muted); font-size: 0.875rem; }
</style>
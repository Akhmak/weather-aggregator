<template>
  <section v-if="hourly.length" class="card charts-card">
    <div class="chart-box">
      <h3>📉 Давление (мм рт. ст.)</h3>
      <div class="canvas-wrap">
        <Line :data="pressureData" :options="chartOptions" />
      </div>
    </div>

    <div class="chart-box">
      <h3>🌬 Скорость ветра (м/с)</h3>
      <div class="canvas-wrap">
        <Line :data="windData" :options="chartOptions" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Legend, Filler
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const props = defineProps({ hourly: { type: Array, default: () => [] } })

const labels = computed(() => props.hourly.map((h) => h.time))

const pressureData = computed(() => ({
  labels: labels.value,
  datasets: [{
    label: 'Давление, мм рт. ст.',
    data: props.hourly.map((h) => h.pressure),
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.14)',
    pointBackgroundColor: '#6366f1',
    pointRadius: 3,
    fill: true,
    tension: 0.4
  }]
}))

const windData = computed(() => ({
  labels: labels.value,
  datasets: [{
    label: 'Ветер, м/с',
    data: props.hourly.map((h) => h.windSpeed),
    borderColor: '#0ea5e9',
    backgroundColor: 'rgba(14, 165, 233, 0.14)',
    pointBackgroundColor: '#0ea5e9',
    pointRadius: 3,
    fill: true,
    tension: 0.4
  }]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 11 } } },
    y: { grid: { color: 'rgba(148, 163, 184, 0.15)' }, ticks: { color: '#64748b', font: { size: 11 } } }
  }
}
</script>

<style scoped>
.charts-card {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px; background: rgba(255, 255, 255, 0.92);
  border-radius: 18px; padding: 20px; border: 1px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}
h3 { margin: 0 0 12px; font-size: 15px; font-weight: 700; color: #1e293b; }
.canvas-wrap { position: relative; height: 210px; }
</style>
<template>
  <section v-if="hourly?.length || daily?.length" class="card">
    <div class="panel-header">
      <h3>Прогноз погоды</h3>
      <div class="tabs">
        <button :class="{ active: tab === 'hourly' }" @click="tab = 'hourly'">Почасовой</button>
        <button :class="{ active: tab === 'daily' }" @click="tab = 'daily'">По дням</button>
      </div>
    </div>

    <div v-if="tab === 'hourly'" class="hourly-list">
      <div v-for="h in hourly" :key="h.dt" class="hour-item">
        <span class="time">{{ h.time }}</span>
        <img :src="`https://openweathermap.org/img/wn/${h.icon}.png`" alt="" />
        <strong>{{ h.temp }}°</strong>
        <span class="wind">{{ h.windSpeed }} м/с</span>
      </div>
    </div>

    <div v-else class="daily-list">
      <div v-for="d in daily" :key="d.dateKey" class="day-item">
        <span class="day-name">{{ d.label }}</span>
        <div class="day-cond">
          <img :src="`https://openweathermap.org/img/wn/${d.icon}.png`" alt="" />
          <span>{{ d.description }}</span>
        </div>
        <span class="temp-badge">{{ d.minTemp }}° … {{ d.maxTemp }}°</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
defineProps({ hourly: Array, daily: Array })
const tab = ref('hourly')
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px; padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}
.panel-header {
  display: flex; justify-content: space-between; align-items: center;
  gap: 10px; margin-bottom: 16px;
}
h3 { margin: 0; font-size: 16px; font-weight: 700; }

.tabs {
  display: inline-flex; padding: 3px; background: #f1f5f9; border-radius: 10px;
}
.tabs button {
  padding: 6px 12px; border-radius: 8px; border: none;
  background: transparent; cursor: pointer; font-weight: 600; font-size: 13px; color: #64748b;
}
.tabs button.active {
  background: #ffffff; color: #0f172a; box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
}

.hourly-list { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; }
.hour-item {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  min-width: 72px; padding: 10px 8px; background: #f8fafc;
  border: 1px solid #e2e8f0; border-radius: 12px; transition: 0.15s;
}
.hour-item:hover { border-color: #93c5fd; background: #eff6ff; }
.time { font-size: 12px; color: #64748b; font-weight: 500; }
.hour-item img { width: 38px; height: 38px; }
.wind { font-size: 11px; color: #94a3b8; }

.daily-list { display: flex; flex-direction: column; gap: 6px; }
.day-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px; border-radius: 10px; font-size: 14px;
}
.day-item:hover { background: #f8fafc; }
.day-name { width: 105px; text-transform: capitalize; font-weight: 600; }
.day-cond { display: flex; align-items: center; gap: 6px; flex: 1; color: #64748b; font-size: 13px; }
.day-cond img { width: 32px; height: 32px; }
.temp-badge {
  background: #eff6ff; color: #1d4ed8; font-weight: 700;
  padding: 4px 10px; border-radius: 999px; font-size: 13px;
}
</style>
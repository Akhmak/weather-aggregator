<template>
  <section v-if="weather" class="current-card">
    <div class="header">
      <div>
        <h2>{{ cityName }}</h2>
        <p class="desc">{{ weather.weather[0].description }}</p>
      </div>
      <button class="fav-btn" :class="{ saved: isFavorite }" @click="$emit('toggle-favorite')">
        {{ isFavorite ? '★ В избранном' : '☆ В избранное' }}
      </button>
    </div>

    <div class="main-stats">
      <img :src="`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`" alt="" />
      <div>
        <div class="temp">{{ Math.round(weather.main.temp) }}°C</div>
        <div class="feels">Ощущается как {{ Math.round(weather.main.feels_like) }}°C</div>
      </div>
    </div>

    <div class="details-grid">
      <div class="stat-pill">
        <span>💧 Влажность</span>
        <strong>{{ weather.main.humidity }}%</strong>
      </div>
      <div class="stat-pill">
        <span>💨 Ветер</span>
        <strong>{{ weather.wind.speed }} м/с</strong>
      </div>
      <div class="stat-pill">
        <span>🌡 Давление</span>
        <strong>{{ Math.round(weather.main.pressure * 0.750062) }} мм</strong>
      </div>
      <div class="stat-pill">
        <span>👁 Видимость</span>
        <strong>{{ (weather.visibility / 1000).toFixed(1) }} км</strong>
      </div>
    </div>
  </section>

  <section v-else class="empty-card">
    <p>Введите город в поиске или выберите точку на карте, чтобы увидеть текущую погоду.</p>
  </section>
</template>

<script setup>
defineProps({
  weather: Object,
  cityName: String,
  isFavorite: Boolean
})
defineEmits(['toggle-favorite'])
</script>

<style scoped>
.current-card {
  background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
  color: #ffffff;
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.25);
}
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
h2 { margin: 0; font-size: 24px; font-weight: 700; }
.desc { margin: 4px 0 0; opacity: 0.9; text-transform: capitalize; font-size: 14px; }

.fav-btn {
  padding: 7px 12px; border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff; font-weight: 600; font-size: 13px;
  cursor: pointer; backdrop-filter: blur(6px); transition: 0.15s;
}
.fav-btn:hover { background: rgba(255, 255, 255, 0.28); }
.fav-btn.saved { background: #fef3c7; color: #92400e; border-color: #fde68a; }

.main-stats { display: flex; align-items: center; gap: 8px; margin: 14px 0 18px; }
.main-stats img { width: 88px; height: 88px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.2)); }
.temp { font-size: 46px; font-weight: 800; line-height: 1; }
.feels { font-size: 13px; opacity: 0.85; margin-top: 6px; }

.details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.stat-pill {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px; border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(6px); font-size: 13px;
}
.stat-pill span { opacity: 0.9; }

.empty-card {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 18px; padding: 28px 20px; text-align: center;
  color: #64748b; border: 1px dashed #cbd5e1; font-size: 14px;
}
</style>
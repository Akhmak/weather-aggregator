<template>
  <div class="app-wrapper">
    <header class="top-bar">
      <div class="brand">
        <span class="logo">⛅</span>
        <div>
          <h1>Погодный агрегатор</h1>
          <p class="subtitle">Прогноз, изотермы и аналитика ветра</p>
        </div>
      </div>

      <SearchBar
          @select="onSelectLocation"
          @geolocate="store.detectGeolocation"
          @error="(msg) => (store.error = msg)"
      />
    </header>

    <transition name="fade">
      <div v-if="store.error" class="error-banner">
        <span>⚠️ {{ store.error }}</span>
        <button @click="store.error = null">✕</button>
      </div>
    </transition>

    <FavoritesWidgets
        :items="store.favoritesWeather"
        @select="onSelectLocation"
        @remove="(item) => store.removeFavorite(item.lat, item.lon)"
    />

    <div v-if="store.isLoading" class="loading-bar">
      <span class="spinner"></span> Загрузка актуальных метеоданных...
    </div>

    <main class="dashboard">
      <div class="left-col">
        <CurrentWeather
            :weather="store.current"
            :city-name="store.cityName"
            :is-favorite="store.isCurrentFavorite"
            @toggle-favorite="store.toggleFavorite"
        />
        <ForecastPanel
            :hourly="store.hourly"
            :daily="store.daily"
        />
      </div>

      <div class="right-col">
        <WeatherMap
            :coords="store.coords"
            :markers="store.mapMarkers"
            @pick-location="onSelectLocation"
            @remove-marker="(m) => store.removeMapMarker(m.lat, m.lon)"
        />
        <WeatherCharts :hourly="store.hourly" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useWeatherStore } from './stores/weatherStore'
import SearchBar from './components/SearchBar.vue'
import FavoritesWidgets from './components/FavoritesWidgets.vue'
import CurrentWeather from './components/CurrentWeather.vue'
import ForecastPanel from './components/ForecastPanel.vue'
import WeatherMap from './components/WeatherMap.vue'
import WeatherCharts from './components/WeatherCharts.vue'

const store = useWeatherStore()

function onSelectLocation({ lat, lon, name }) {
  store.loadWeatherByCoords(lat, lon, name || null)
}

onMounted(async () => {
  await store.detectGeolocation()
  store.loadInitialMapMarkers()
  store.refreshFavoritesWeather()
})
</script>

<style>
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #e0f2fe 0%, #f8fafc 45%, #eef2ff 100%);
  min-height: 100vh;
  color: #0f172a;
}
</style>

<style scoped>
.app-wrapper {
  max-width: 1320px;
  margin: 0 auto;
  padding: 24px 20px 40px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.brand { display: flex; align-items: center; gap: 12px; }
.logo {
  font-size: 30px;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.08);
}
h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
.subtitle { margin: 2px 0 0; font-size: 13px; color: #64748b; }
.top-bar :deep(.search-bar) { max-width: 520px; }

.error-banner {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 16px; background: #fef2f2; color: #991b1b;
  border: 1px solid #fecaca; border-radius: 12px;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.08);
  font-size: 14px;
}
.error-banner button {
  background: none; border: none; font-size: 16px; cursor: pointer; color: #991b1b;
}

.loading-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  color: #0369a1; border-radius: 12px; font-size: 14px; font-weight: 500;
  border: 1px solid #bae6fd;
}
.spinner {
  width: 16px; height: 16px;
  border: 2px solid #bae6fd; border-top-color: #0284c7;
  border-radius: 50%; animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.dashboard { display: grid; grid-template-columns: 390px 1fr; gap: 20px; align-items: start; }
.left-col, .right-col { display: flex; flex-direction: column; gap: 20px; min-width: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 980px) {
  .dashboard { grid-template-columns: 1fr; }
}
</style>
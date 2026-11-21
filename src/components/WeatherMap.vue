<template>
  <section class="card map-card">
    <div class="map-toolbar">
      <div>
        <h3>🗺 Живая карта погоды</h3>
        <p class="hint">Кликните по карте, чтобы добавить точку, или выберите из списка ниже</p>
      </div>
      <select id="weather-layer" name="weather-layer" v-model="activeLayer" @change="updateWeatherLayer">
        <option value="temp_new">Карта температур (изотермы)</option>
        <option value="wind_new">Слой ветра</option>
        <option value="pressure_new">Слой давления</option>
        <option value="precipitation_new">Осадки</option>
      </select>
    </div>

    <div v-if="markers.length" class="markers-bar">
      <div
          v-for="m in markers"
          :key="`${m.lat}-${m.lon}`"
          class="marker-chip"
          :class="{ active: isActive(m) }"
          @click="focusMarker(m)"
      >
        <span class="chip-name">{{ m.name }}</span>
        <span class="chip-temp">{{ m.temp > 0 ? '+' : '' }}{{ m.temp }}°</span>
        <button
            class="chip-del"
            title="Удалить точку"
            @click.stop="emit('remove-marker', m)"
        >
          ✕
        </button>
      </div>
    </div>

    <div ref="mapContainer" class="map-container"></div>

    <div class="legend">
      <span class="legend-title">{{ currentLegend.title }}:</span>
      <span>{{ currentLegend.min }}</span>
      <div class="legend-bar" :style="{ background: currentLegend.gradient }"></div>
      <span>{{ currentLegend.max }}</span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const props = defineProps({
  coords: Object,
  markers: { type: Array, default: () => [] }
})
const emit = defineEmits(['pick-location', 'remove-marker'])

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const mapContainer = ref(null)
const activeLayer = ref('temp_new')

const LEGENDS = {
  temp_new: {
    title: 'Температура',
    min: '-30°C',
    max: '+35°C',
    gradient: 'linear-gradient(90deg, #6366f1 0%, #38bdf8 30%, #fde047 65%, #ef4444 100%)'
  },
  wind_new: {
    title: 'Ветер',
    min: '0 м/с',
    max: '25+ м/с',
    gradient: 'linear-gradient(90deg, #e2e8f0 0%, #38bdf8 35%, #a855f7 70%, #e11d48 100%)'
  },
  pressure_new: {
    title: 'Давление',
    min: '960 гПа',
    max: '1040 гПа',
    gradient: 'linear-gradient(90deg, #3b82f6 0%, #22c55e 45%, #facc15 75%, #ef4444 100%)'
  },
  precipitation_new: {
    title: 'Осадки',
    min: 'Нет',
    max: 'Ливень',
    gradient: 'linear-gradient(90deg, #e0f2fe 0%, #38bdf8 40%, #2563eb 75%, #7c3aed 100%)'
  }
}

const currentLegend = computed(() => LEGENDS[activeLayer.value])

let map = null
let weatherLayer = null
let markersLayer = null

function isActive(m) {
  if (!props.coords) return false
  return Math.abs(m.lat - props.coords.lat) < 0.05 && Math.abs(m.lon - props.coords.lon) < 0.05
}

function focusMarker(m) {
  if (map) {
    map.setView([m.lat, m.lon], Math.max(map.getZoom(), 7), { animate: true })
  }
  emit('pick-location', { lat: m.lat, lon: m.lon, name: m.name })
}

function updateWeatherLayer() {
  if (!map) return
  if (weatherLayer) map.removeLayer(weatherLayer)
  weatherLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/${activeLayer.value}/{z}/{x}/{y}.png?appid=${API_KEY}`,
      {
        opacity: 0.65,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 0,
        attribution: '&copy; OpenWeatherMap'
      }
  ).addTo(map)
}

function renderMarkers() {
  if (!markersLayer) return
  markersLayer.clearLayers()

  props.markers.forEach((m) => {
    const activeClass = isActive(m) ? 'is-active' : ''
    const icon = L.divIcon({
      className: 'temp-marker-wrapper',
      html: `<div class="temp-marker ${activeClass}">${m.temp > 0 ? '+' : ''}${m.temp}°</div>`,
      iconSize: [48, 26],
      iconAnchor: [24, 13]
    })

    const leafletMarker = L.marker([m.lat, m.lon], { icon })
    leafletMarker.bindTooltip(`${m.name}: ${m.temp}°C`)
    leafletMarker.on('click', () => {
      focusMarker(m)
    })
    leafletMarker.addTo(markersLayer)
  })
}

onMounted(() => {
  map = L.map(mapContainer.value).setView([props.coords.lat, props.coords.lon], 6)
  map.attributionControl.setPrefix(false)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    updateWhenIdle: true,
    updateWhenZooming: false,
    keepBuffer: 0,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)
  updateWeatherLayer()
  renderMarkers()

  map.on('click', (e) => {
    emit('pick-location', { lat: e.latlng.lat, lon: e.latlng.lng })
  })
})

watch(() => props.coords, (newCoords) => {
  if (map && newCoords) {
    const center = map.getCenter()
    const moved =
        Math.abs(center.lat - newCoords.lat) > 0.01 ||
        Math.abs(center.lng - newCoords.lon) > 0.01
    if (moved) {
      map.panTo([newCoords.lat, newCoords.lon], { animate: true })
    }
  }
  renderMarkers()
}, { deep: true })

watch(() => props.markers, renderMarkers, { deep: true })

onBeforeUnmount(() => {
  if (map) map.remove()
})
</script>

<style scoped>
.map-card {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 18px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}
.map-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
h3 { margin: 0; font-size: 16px; font-weight: 700; }
.hint { margin: 3px 0 0; font-size: 13px; color: #64748b; }
select {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
}

.markers-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.marker-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px 5px 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  transition: 0.15s;
}
.marker-chip:hover { background: #e0f2fe; border-color: #7dd3fc; }
.marker-chip.active { background: #2563eb; border-color: #2563eb; color: #ffffff; }
.chip-name { font-weight: 600; }
.chip-temp { font-weight: 700; opacity: 0.9; }
.chip-del {
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border: none;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.12);
  color: inherit;
  font-size: 10px;
  cursor: pointer;
  padding: 0;
}
.chip-del:hover { background: #ef4444; color: #ffffff; }

.map-container {
  width: 100%;
  height: 420px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
.legend {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}
.legend-title { color: #1e293b; }
.legend-bar {
  flex: 1;
  height: 8px;
  border-radius: 999px;
}
</style>

<style>
.leaflet-attribution-flag {
  display: none !important;
}
.temp-marker {
  background: #1e293b;
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 999px;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  text-align: center;
  white-space: nowrap;
  transition: transform 0.15s;
}
.temp-marker.is-active {
  background: #2563eb;
  transform: scale(1.15);
}
</style>
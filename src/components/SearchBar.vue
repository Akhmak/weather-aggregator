<template>
  <div class="search-bar">
    <div class="input-group">
      <input
          v-model="query"
          type="text"
          placeholder="Поиск города (например, Казань)..."
          @input="onInput"
      />
      <button class="geo-btn" title="Моё местоположение" @click="$emit('geolocate')">
        📍 Моя геопозиция
      </button>
    </div>

    <ul v-if="suggestions.length" class="suggestions">
      <li v-for="(city, i) in suggestions" :key="i" @click="selectCity(city)">
        <strong>{{ city.local_names?.ru || city.name }}</strong>
        <span>{{ city.state ? `${city.state}, ` : '' }}{{ city.country }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { weatherService } from '../api/weatherService'

const emit = defineEmits(['select', 'geolocate', 'error'])

const query = ref('')
const suggestions = ref([])
let timer = null

function onInput() {
  clearTimeout(timer)
  if (query.value.trim().length < 2) {
    suggestions.value = []
    return
  }
  timer = setTimeout(async () => {
    try {
      suggestions.value = await weatherService.searchCities(query.value)
    } catch (e) {
      emit('error', e.message)
    }
  }, 400)
}

function selectCity(city) {
  const name = city.local_names?.ru || city.name
  emit('select', { lat: city.lat, lon: city.lon, name })
  query.value = ''
  suggestions.value = []
}
</script>

<style scoped>
.search-bar { position: relative; width: 100%; }
.input-group { display: flex; gap: 8px; }
input {
  flex: 1; padding: 10px 14px; border-radius: 8px;
  border: 1px solid #cbd5e1; font-size: 15px; outline: none;
}
input:focus { border-color: #3b82f6; }
.geo-btn {
  padding: 10px 14px; border: none; border-radius: 8px;
  background: #eff6ff; color: #1d4ed8; font-weight: 600; cursor: pointer;
}
.geo-btn:hover { background: #dbeafe; }
.suggestions {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 1000;
  margin: 4px 0 0; padding: 0; list-style: none;
  background: #fff; border: 1px solid #cbd5e1; border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}
.suggestions li {
  display: flex; justify-content: space-between; padding: 10px 14px; cursor: pointer;
}
.suggestions li:hover { background: #f1f5f9; }
.suggestions span { color: #64748b; font-size: 13px; }
</style>
<input
    id="city-search"
    name="city-search"
    v-model="query"
    type="text"
    placeholder="Поиск города (например, Казань)..."
    @input="onInput"
/>
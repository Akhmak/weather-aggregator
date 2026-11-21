import { defineStore } from 'pinia'
import { weatherService } from '../api/weatherService'

const FAVORITES_KEY = 'weather_favorites_v1'
const MAP_MARKERS_KEY = 'weather_map_markers_v1'

const DEFAULT_MAP_CITIES = [
    { name: 'Москва', lat: 55.7558, lon: 37.6173 },
    { name: 'Санкт-Петербург', lat: 59.9343, lon: 30.3351 },
    { name: 'Казань', lat: 55.7961, lon: 49.1064 },
    { name: 'Сочи', lat: 43.5855, lon: 39.7231 },
    { name: 'Екатеринбург', lat: 56.8389, lon: 60.6057 }
]

function saveMarkersToStorage(markers) {
    const minimal = markers.map(({ name, lat, lon }) => ({ name, lat, lon }))
    localStorage.setItem(MAP_MARKERS_KEY, JSON.stringify(minimal))
}

export const useWeatherStore = defineStore('weather', {
    state: () => ({
        current: null,
        hourly: [],
        daily: [],
        coords: { lat: 55.7558, lon: 37.6173 },
        cityName: 'Москва',
        favorites: JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'),
        favoritesWeather: [],
        mapMarkers: [],
        markersInitialized: false,
        isLoading: false,
        error: null
    }),

    getters: {
        isCurrentFavorite(state) {
            return state.favorites.some(
                (f) => Math.abs(f.lat - state.coords.lat) < 0.05 && Math.abs(f.lon - state.coords.lon) < 0.05
            )
        }
    },

    actions: {
        async loadWeatherByCoords(lat, lon, customName = null) {
            this.isLoading = true
            this.error = null
            try {
                const [currentData, forecastData] = await Promise.all([
                    weatherService.getCurrentWeather(lat, lon),
                    weatherService.getForecast(lat, lon)
                ])

                this.current = currentData
                this.hourly = forecastData.hourly
                this.daily = forecastData.daily
                this.coords = { lat, lon }
                this.cityName = customName || currentData.name || 'Выбранная точка'

                this.upsertMapMarker({
                    name: this.cityName,
                    lat,
                    lon,
                    temp: Math.round(currentData.main.temp),
                    icon: currentData.weather[0].icon
                })
            } catch (err) {
                this.error = err.message
            } finally {
                this.isLoading = false
            }
        },

        detectGeolocation() {
            return new Promise((resolve) => {
                if (!navigator.geolocation) {
                    this.error = 'Геолокация не поддерживается вашим браузером. Показан город по умолчанию.'
                    this.loadWeatherByCoords(this.coords.lat, this.coords.lon, this.cityName).finally(resolve)
                    return
                }

                this.isLoading = true
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        await this.loadWeatherByCoords(pos.coords.latitude, pos.coords.longitude)
                        resolve()
                    },
                    async () => {
                        this.error = 'Доступ к геолокации отклонён. Загружен город по умолчанию.'
                        await this.loadWeatherByCoords(this.coords.lat, this.coords.lon, this.cityName)
                        resolve()
                    },
                    { timeout: 7000 }
                )
            })
        },

        async loadInitialMapMarkers() {
            const savedRaw = localStorage.getItem(MAP_MARKERS_KEY)
            const targets = savedRaw !== null ? JSON.parse(savedRaw) : DEFAULT_MAP_CITIES

            if (targets.length) {
                const results = await Promise.allSettled(
                    targets.map((c) => weatherService.getCurrentWeather(c.lat, c.lon))
                )

                results.forEach((res, idx) => {
                    if (res.status === 'fulfilled') {
                        const data = res.value
                        this.upsertMapMarker({
                            name: targets[idx].name || data.name,
                            lat: targets[idx].lat,
                            lon: targets[idx].lon,
                            temp: Math.round(data.main.temp),
                            icon: data.weather[0].icon
                        }, false)
                    }
                })
            }

            // Только после загрузки всех сохранённых точек разрешаем перезаписывать localStorage
            this.markersInitialized = true
            saveMarkersToStorage(this.mapMarkers)
        },

        upsertMapMarker(marker, shouldSave = true) {
            const idx = this.mapMarkers.findIndex(
                (m) => Math.abs(m.lat - marker.lat) < 0.05 && Math.abs(m.lon - marker.lon) < 0.05
            )
            if (idx >= 0) {
                this.mapMarkers[idx] = marker
            } else {
                this.mapMarkers.push(marker)
            }
            if (shouldSave && this.markersInitialized) {
                saveMarkersToStorage(this.mapMarkers)
            }
        },

        removeMapMarker(lat, lon) {
            this.mapMarkers = this.mapMarkers.filter(
                (m) => !(Math.abs(m.lat - lat) < 0.05 && Math.abs(m.lon - lon) < 0.05)
            )
            saveMarkersToStorage(this.mapMarkers)
        },

        async toggleFavorite() {
            if (this.isCurrentFavorite) {
                this.favorites = this.favorites.filter(
                    (f) => !(Math.abs(f.lat - this.coords.lat) < 0.05 && Math.abs(f.lon - this.coords.lon) < 0.05)
                )
            } else {
                this.favorites.push({
                    name: this.cityName,
                    lat: this.coords.lat,
                    lon: this.coords.lon
                })
            }
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(this.favorites))
            await this.refreshFavoritesWeather()
        },

        async removeFavorite(lat, lon) {
            this.favorites = this.favorites.filter(
                (f) => !(Math.abs(f.lat - lat) < 0.05 && Math.abs(f.lon - lon) < 0.05)
            )
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(this.favorites))
            await this.refreshFavoritesWeather()
        },

        async refreshFavoritesWeather() {
            if (!this.favorites.length) {
                this.favoritesWeather = []
                return
            }
            const results = await Promise.allSettled(
                this.favorites.map((f) => weatherService.getCurrentWeather(f.lat, f.lon))
            )
            this.favoritesWeather = results
                .map((res, i) => {
                    if (res.status !== 'fulfilled') return null
                    return {
                        ...this.favorites[i],
                        temp: Math.round(res.value.main.temp),
                        icon: res.value.weather[0].icon,
                        wind: res.value.wind.speed
                    }
                })
                .filter(Boolean)
        }
    }
})
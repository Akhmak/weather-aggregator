import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

const apiClient = axios.create({
    baseURL: 'https://api.openweathermap.org',
    timeout: 20000,
    params: {
        appid: API_KEY,
        units: 'metric',
        lang: 'ru'
    }
})

// Кэш и дедупликация одновременных запросов текущей погоды (на 60 сек)
const currentCache = new Map()
const CACHE_TTL = 60 * 1000

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!API_KEY) {
            return Promise.reject(new Error('Не задан VITE_OPENWEATHER_API_KEY в файле .env'))
        }
        if (error.code === 'ECONNABORTED' || !error.response) {
            return Promise.reject(new Error('Ошибка сети или превышено время ожидания ответа от сервера.'))
        }

        const status = error.response.status
        const messages = {
            400: 'Некорректные параметры запроса.',
            401: 'Неверный или ещё не активированный API-ключ OpenWeather.',
            404: 'Город или данные по этим координатам не найдены.',
            429: 'Превышен лимит запросов к API. Попробуйте через минуту.'
        }

        return Promise.reject(new Error(messages[status] || `Ошибка сервера (${status}).`))
    }
)

export const weatherService = {
    async searchCities(query) {
        if (!query?.trim()) return []
        const { data } = await apiClient.get('/geo/1.0/direct', {
            params: { q: query.trim(), limit: 5, units: undefined, lang: undefined }
        })
        return data
    },

    async getCurrentWeather(lat, lon) {
        const key = `${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`
        const cached = currentCache.get(key)
        if (cached && Date.now() - cached.ts < CACHE_TTL) {
            return cached.promise
        }

        const promise = apiClient
            .get('/data/2.5/weather', { params: { lat, lon } })
            .then((res) => res.data)
            .catch((err) => {
                currentCache.delete(key)
                throw err
            })

        currentCache.set(key, { ts: Date.now(), promise })
        return promise
    },

    async getForecast(lat, lon) {
        const { data } = await apiClient.get('/data/2.5/forecast', {
            params: { lat, lon }
        })

        const hourly = data.list.slice(0, 12).map((item) => ({
            dt: item.dt,
            time: new Date(item.dt * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            temp: Math.round(item.main.temp),
            pressure: Math.round(item.main.pressure * 0.750062),
            windSpeed: Number(item.wind.speed.toFixed(1)),
            windDeg: item.wind.deg,
            icon: item.weather[0].icon,
            description: item.weather[0].description
        }))

        const daysMap = new Map()
        for (const item of data.list) {
            const dateObj = new Date(item.dt * 1000)
            const dateKey = dateObj.toISOString().split('T')[0]
            if (!daysMap.has(dateKey)) {
                daysMap.set(dateKey, {
                    dateKey,
                    label: dateObj.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' }),
                    temps: [],
                    icons: [],
                    descriptions: []
                })
            }
            const day = daysMap.get(dateKey)
            day.temps.push(item.main.temp)
            day.icons.push(item.weather[0].icon)
            day.descriptions.push(item.weather[0].description)
        }

        const daily = Array.from(daysMap.values()).map((d) => ({
            dateKey: d.dateKey,
            label: d.label,
            minTemp: Math.round(Math.min(...d.temps)),
            maxTemp: Math.round(Math.max(...d.temps)),
            icon: d.icons[Math.floor(d.icons.length / 2)],
            description: d.descriptions[Math.floor(d.descriptions.length / 2)]
        }))

        return { hourly, daily, city: data.city }
    }
}
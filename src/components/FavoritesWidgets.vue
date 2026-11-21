<template>
  <div v-if="items.length" class="favorites-strip">
    <div
        v-for="item in items"
        :key="item.name"
        class="fav-widget"
        @click="$emit('select', { lat: item.lat, lon: item.lon, name: item.name })"
    >
      <div class="fav-info">
        <span class="fav-name">{{ item.name }}</span>
        <span class="fav-wind">💨 {{ item.wind }} м/с</span>
      </div>
      <div class="fav-right">
        <div class="fav-temp">
          <img :src="`https://openweathermap.org/img/wn/${item.icon}.png`" alt="" />
          <strong>{{ item.temp }}°</strong>
        </div>
        <button
            class="fav-del"
            title="Убрать из избранного"
            @click.stop="$emit('remove', item)"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ items: { type: Array, default: () => [] } })
defineEmits(['select', 'remove'])
</script>

<style scoped>
.favorites-strip { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; }
.fav-widget {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  min-width: 195px; padding: 10px 12px; background: rgba(255, 255, 255, 0.92);
  border-radius: 14px; border: 1px solid #e2e8f0; cursor: pointer;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
  transition: transform 0.15s, border-color 0.15s;
}
.fav-widget:hover { transform: translateY(-2px); border-color: #3b82f6; }
.fav-info { display: flex; flex-direction: column; }
.fav-name { font-weight: 700; font-size: 14px; }
.fav-wind { font-size: 12px; color: #64748b; }
.fav-right { display: flex; align-items: center; gap: 6px; }
.fav-temp { display: flex; align-items: center; font-size: 18px; }
.fav-temp img { width: 34px; height: 34px; }
.fav-del {
  width: 20px; height: 20px; border: none; border-radius: 50%;
  background: #f1f5f9; color: #64748b; font-size: 11px; cursor: pointer;
}
.fav-del:hover { background: #fee2e2; color: #dc2626; }
</style>
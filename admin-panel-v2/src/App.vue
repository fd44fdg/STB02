<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NConfigProvider, NMessageProvider } from 'naive-ui'
import { useSystemSettingsStore } from './stores/systemSettings'

const sys = useSystemSettingsStore()

const themeOverrides = computed(()=>{
  const primary = sys.primaryColor || '#0F5EC7'
  const lighten = primary
  const darken = primary
  return {
    common: {
      primaryColor: primary,
      primaryColorHover: lighten,
      primaryColorPressed: darken,
      primaryColorSuppl: lighten,
      infoColor: '#53B6FF',
      successColor: '#4BBF73',
      warningColor: '#F5A623',
      errorColor: '#FF4D4F',
      borderRadius: '10px'
    },
    Card: {
      color: 'rgba(255,255,255,0.10)',
      colorModal: 'rgba(255,255,255,0.08)',
      colorTarget: 'rgba(255,255,255,0.12)',
      borderColor: 'rgba(255,255,255,0.25)',
      titleTextColor: '#E6F1FF'
    },
    Button: { borderRadius: '8px' },
    DataTable: { borderRadius: '12px', thColorHover: 'rgba(255,255,255,0.08)', tdColorHover: 'rgba(255,255,255,0.05)' }
  }
})
</script>

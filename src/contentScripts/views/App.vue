<script setup lang="ts">
import { Platform, storageTabList } from '~/logic/storage'
import { onMessage } from 'webext-bridge/content-script'
import { throttleFilter, watchWithFilter } from '@vueuse/core'

const appType = ref<Platform>("")
const tabId = ref<number>(0)
watchWithFilter(storageTabList, () => {
  const url = window.location.href
  if (url.includes("https://www.youtube.com/watch?")) {
    appType.value = "youtube"
  } else if (url.includes("https://twitter.com/")) {
    appType.value = "twitter"
  }
}, { eventFilter: throttleFilter(1000), immediate: true })


onMessage<{ tabId: number }>('tab-update', ({ data }) => {
  tabId.value = data.tabId
})
</script>

<template>
  <YoutubeApp v-if="appType === 'youtube'" :tab-id="tabId" />
  <TwitterApp v-if="appType === 'twitter'" />
</template>

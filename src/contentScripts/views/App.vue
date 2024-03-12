<script setup lang="ts">
import { Platform } from '~/logic/storage'

const appType = ref<Platform>("")

setInterval(() => {
  const url = window.location.href
  if (url.includes("https://www.youtube.com/watch?")) {
    appType.value = "youtube"
  } else if (url.includes("https://twitter.com/")) {
    appType.value = "twitter"
  }
}, 1000)
</script>

<template>
  <YoutubeApp v-if="appType === 'youtube'" />
  <TwitterApp v-if="appType === 'twitter'" />
</template>

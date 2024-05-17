<script setup lang="ts">
import { sendMessage } from 'webext-bridge/content-script'
import { AppType } from '~/logic/type';

const appType = ref<AppType>("")

setInterval(() => {
  const url = window.location.href
  let tempAppType: AppType = ""
  if (url.includes("https://www.youtube.com/watch?")) {
    tempAppType = "youtube"
  } else if (url.includes("https://twitter.com/") || url.includes("https://x.com/")) {
    tempAppType = "twitter"
  }

  if (appType.value !== tempAppType) {
    appType.value = tempAppType

    if (tempAppType !== "youtube") {
      setTimeout(() => {
        sendMessage<AppType>("move-page", appType.value)
      }, 2000)
    }
  }
}, 1000)
</script>

<template>
  <YoutubeApp v-if="appType === 'youtube'" />
  <TwitterApp v-if="appType === 'twitter'" />
</template>

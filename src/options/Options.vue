<script setup lang="ts">
import { tabs } from 'webextension-polyfill';
import { onMessage, sendMessage } from 'webext-bridge/options'

import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import FloatLabel from 'primevue/floatlabel';
import InputSwitch from "primevue/inputswitch";
import BlockUI from 'primevue/blockui';
import ProgressSpinner from 'primevue/progressspinner';
import Toast from 'primevue/toast';
import { useToast } from "primevue/usetoast";
import { Result, TabInfo } from '~/logic/type';
import { storageStreamerList } from '~/logic/storage'
import { differenceInMinutes } from "date-fns";
import { Streamer } from '~/logic/vishce-types';

const toast = useToast();
const text = ref<string>("")
const textConut = ref<number>(0)
const maxTextConut = ref<number>(280)
const buttonRef = ref<HTMLDivElement>()
const loading = ref(false)
const validation = ref(false)
const textAreaInvalid = ref(false)
const selectedTabInvalid = ref(false)
const twitterSend = ref(true)
const selectedTags = ref<string[]>([])
const selectedTabs = ref<TabInfo[]>([])
const shareTweetMode = ref(false)

let thisTabId: number
const setTabInfo = async () => {
  const tab = await tabs.getCurrent()
  if (tab.id) thisTabId = tab.id
}

onMounted(() => {
  setTabInfo()
  if (storageStreamerList.value.streamerList.length === 0) {
    getStreamerList()
  } else {
    const diff = differenceInMinutes(storageStreamerList.value.date, new Date())
    if (diff < -60) {
      getStreamerList()
    }
  }
})

onMessage<string>('twitter-send-result', ({ data }) => {
  if (data === "OK") {
    validation.value = false
    text.value = ""
  } else {
    console.error("Twitter投稿エラー")
    toast.add({ severity: 'error', summary: '投稿失敗', detail: 'テキストの投稿に失敗しました。', group: 'br', life: 3000 });
  }
  return
})

watch(text, (val) => {
  textConut.value = countText(val)
})
watch(selectedTags, (val) => {
  if (val.length > 0) {
    maxTextConut.value = (280 - countText(val.join(" ")))
  } else {
    maxTextConut.value = 280
  }
}, { deep: true })

const countText = (text: string) => {
  let count: number = 0
  for (let i = 0, len = text.length; i < len; i++) {
    let c = text.charCodeAt(i)
    if (!text[i].match(/\r?\n/g)) {
      if (c >= 0x0 && c <= 0x7f) {
        count += 1
      } else {
        count += 2
      }
    } else {
      count += 2
    }
  }
  return count
}

const getStreamerList = async () => {
  const url = "https://vische-server.onrender.com/api/streamer"
  const res = await fetch(url)
  const data: Streamer[] = await res.json()
  storageStreamerList.value.streamerList = []
  storageStreamerList.value.streamerList.push(...data)
  storageStreamerList.value.date = new Date()
}

const handleKeydownEnter = (e: KeyboardEvent) => {
  if (!e.ctrlKey && !e.metaKey) return;

  const button = buttonRef.value?.children.item(0) as HTMLButtonElement
  window.blur()
  button?.dispatchEvent(new MouseEvent('focus', { bubbles: true }))
  setTimeout(() => {
    button?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }, 250)
};

const setShareMode = () => {
  shareTweetMode.value = true
  twitterSend.value = true
  text.value = `${selectedTabs.value[0].title}
  ${selectedTabs.value[0].url} @YouTubeより`
}

const unsetShareMode = () => {
  shareTweetMode.value = false
  text.value = ""
}

const validate = () => {
  validation.value = true
  if (text.value === "") {
    textAreaInvalid.value = true
  } else {
    textAreaInvalid.value = false
  }

  if (!twitterSend.value && selectedTabs.value.length === 0) {
    selectedTabInvalid.value = true
  } else {
    selectedTabInvalid.value = false
  }

  if (selectedTabInvalid.value || textAreaInvalid.value) {
    return false
  } else {
    return true
  }
}

const send = () => {
  if (!validate()) {
    return
  }
  loading.value = true

  if (twitterSend.value) {
    sendTweet()
  }
  if (!shareTweetMode.value && selectedTabs.value.length > 0) {
    sendYoutube()
  } else {
    shareTweetMode.value = false
    validation.value = false
    text.value = ""
    loading.value = false
  }
}

const sendTweet = () => {
  let twitterText = text.value
  if (selectedTags.value.length > 0) {
    twitterText = twitterText + " " + selectedTags.value.join(" ")
  }
  twitterText = encodeURIComponent(twitterText)
  const url = `https://twitter.com/intent/post?text=${twitterText}&sfh=${thisTabId}`
  window.open(url, '_blank', 'width=400, height=380, top=0')
}

const sendYoutube = () => {
  new Promise<void>((resolve, reject) => {
    selectedTabs.value.forEach(tab => {
      sendMessage<Result>("text-send", text.value, { context: 'content-script', tabId: tab.tabId }).then(
        res => {
          if (res === "OK") {
            resolve()
          } else {
            reject()
          }
        }
      )
    })
  }).catch(() =>
    toast.add({ severity: 'error', summary: '投稿失敗', detail: 'テキストの投稿に失敗しました。', group: 'br', life: 3000 })
  ).finally(() => {
    validation.value = false
    text.value = ""
    loading.value = false
  })
}

const refresh = () => {
  loading.value = false
  validation.value = false
  text.value = ""
  twitterSend.value = true
  selectedTabs.value = []
}
</script>

<template>
  <main class="text-center text-gray-700 dark:text-gray-200" @keydown.enter="handleKeydownEnter">
    <div class="fixed top-3 right-2 z-10">
      <Button icon="pi pi-refresh" text rounded aria-label="refresh" @click="refresh" :label="'フォームを初期化'" />
    </div>
    <div v-if="loading" class="w-full fixed top-18 z-10">
      <ProgressSpinner />
    </div>
    <Toast position="bottom-center" group="br" />
    <BlockUI :blocked="loading">
      <div class="flex flex-col divide-y divide-dashed h-[100vh]">
        <div class="mr-auto mt-2 mb-4 flex flex-row">
          <Logo />
          <div class="mt-auto mb-auto">同時投稿フォーム</div>
        </div>
        <FloatLabel class="m-1">
          <Textarea class="w-full border-solid border-2 "
            :class="textAreaInvalid ? ' border-red-500' : ' border-slate-400'" v-model="text" rows="6" cols="30"
            :invalid="textAreaInvalid" />
          <label>テキストを入力</label>
          <div class="flex flex-row">
            <div v-if="selectedTabs.length === 1">
              <Button v-if="shareTweetMode" class="bg-white" icon="pi pi-twitter" label="共有をキャンセル" severity="info" text
                aria-label="share canncel" @click="unsetShareMode" />
              <Button v-if="!shareTweetMode" class="bg-white" icon="pi pi-twitter" label="選択した枠を共有" severity="info" text
                aria-label="share" @click="setShareMode" />
            </div>
            <p class="ml-auto">{{ textConut }} / {{ maxTextConut }}</p>
          </div>
        </FloatLabel>
        <div class="flex flex-row w-[100vw]">
          <div class="basis-1/2">
            <BlockUI :blocked="shareTweetMode === true" class="z-10">
              <TabSelector @select-tabs="(value) => selectedTabs = value" @share="() => shareTweetMode = true"
                :selected-tab-invalid="selectedTabInvalid" />
            </BlockUI>
          </div>
          <div class="basis-1/2">
            <TagSelector @select-tags="(value) => selectedTags = value" />
          </div>
        </div>

      </div>
      <div class="fixed bottom-2 right-2 flex flex-row z-20">
        <i class="mt-auto mb-auto p-0 pi pi-twitter"></i>
        <p class="mt-auto mb-auto text-xs mr-2" :class="selectedTabInvalid ? 'text-red-400' : 'text-gray-500'">
          Twitter同時投稿を有効化</p>
        <InputSwitch class="mr-5" v-model="twitterSend" :disabled="shareTweetMode" />
        <div ref="buttonRef">
          <Button
            class="p-1 border-solid border-2 border-slate-300 rounded-lg delay-150 duration-300 hover:scale-110 bg-white"
            icon="pi pi-send" label="送信" severity="info" text aria-label="Send" @click="send" />
        </div>
      </div>
    </BlockUI>
  </main>
</template>
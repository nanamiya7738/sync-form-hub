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
import Listbox from 'primevue/listbox';
import { useToast } from "primevue/usetoast";
import { Result, TabInfo } from '~/logic/type';
import { storageStreamerList } from '~/logic/storage'
import { differenceInMinutes } from "date-fns";
import { Streamer } from '~/logic/vishce-types';

const toast = useToast();

const text = ref<string>("")
const buttonRef = ref<HTMLDivElement>()
const textAreaInvalid = ref(false)
const loading = ref(false)
const validation = ref(false)
const selectedTabInvalid = ref(false)
const twitterSend = ref(true)
const selectedTags = ref<string[]>([])
const tabInfoList = ref<TabInfo[]>([])
const selectedTabInfoList = ref<TabInfo[]>([])
const tags = ref<string[]>([])

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

onMessage<string[]>('update-tag-list', ({ data }) => {
  data.forEach(tag => {
    const index = tags.value.findIndex(val => val === tag)
    if (index === -1) {
      if (tags.value.length > 11) {
        tags.value.shift()
      }
      tags.value.unshift(tag)
    }
  })
})

onMessage<TabInfo>('send-tabinfo', ({ data }) => {
  if (!data) return "NG"
  const i = tabInfoList.value.findIndex(item => item.tabId === data.tabId)
  if (i > -1) {
    tabInfoList.value[i] = data
  } else {
    tabInfoList.value.push(data)
  }
  return "OK"
})

onMessage<number>('delete-tab', ({ data }) => {
  if (data === undefined) return "NG"
  tabInfoList.value = tabInfoList.value.filter(item => item.tabId !== data)
  return "OK"
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

watch(validation, (val) => {
  if (val === true) {
    textAreaInvalid.value = text.value === ""
    selectedTabInvalid.value = selectedTabInfoList.value.length === 0
  } else {
    textAreaInvalid.value = false
    selectedTabInvalid.value = false
  }
})

watch(text, (val) => {
  if (!validation.value) {
    textAreaInvalid.value = false
    return
  }

  if (val === "") {
    textAreaInvalid.value = true
  } else {
    textAreaInvalid.value = false
  }
})

watch(tabInfoList, (val) => {
  selectedTabInfoList.value =
    selectedTabInfoList.value.filter(tabInfo => val.map(item => item.tabId).includes(tabInfo.tabId))
})

watch(selectedTabInfoList, (val) => {
  if (!validation.value) {
    selectedTabInvalid.value = false
    return
  }

  if (val.length === 0) {
    selectedTabInvalid.value = true
  } else {
    selectedTabInvalid.value = false
  }
})

watch(twitterSend, (val) => {
  selectedTabInvalid.value = false
})

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

const send = () => {
  validation.value = true
  if (!twitterSend.value && (text.value === "" || selectedTabInfoList.value.length === 0)) {
    return
  }
  loading.value = true

  if (twitterSend.value) {
    sendTweet()
  }
  if (selectedTabInfoList.value.length > 0) {
    sendYoutube()
  } else {
    validation.value = false
    text.value = ""
    loading.value = false
  }
}

const sendTweet = () => {
  let twitterText = text.value
  if (selectedTags.value.length > 0) {
    // twitterText = twitterText + "%20" + selectedTags.value.join("%20")
    twitterText = twitterText + " " + selectedTags.value.join(" ")
  }
  // twitterText = twitterText.replaceAll("#", "%23").replace(/(\n|\r)+/g, "%0A")
  twitterText = encodeURIComponent(twitterText)
  const url = `https://twitter.com/intent/post?text=${twitterText}&sfh=${thisTabId}`
  window.open(url, '_blank', 'width=400, height=380, top=0')
}

const sendYoutube = () => {
  new Promise<void>((resolve, reject) => {
    selectedTabInfoList.value.forEach(tab => {
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
  selectedTabInfoList.value = []
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
        </FloatLabel>

        <div class="flex flex-row w-[100vw]">
          <div class="basis-1/2">
            <div class="pl-1 pb-1 flex flex-row">
              <p class="mr-2">送信先:</p>
              <p v-if="selectedTabInfoList.length === 0" :class="selectedTabInvalid ? 'text-red-400' : 'text-gray-500'">
                送信先を選択してください</p>
            </div>
            <Listbox v-model="selectedTabInfoList" :options="tabInfoList" multiple optionLabel="title"
              emptyMessage="Youtubeのタブが検出されていません"
              :pt="{ button: { class: `p-1 m-auto border-solid border-2 ${selectedTabInvalid ? 'border-red-400' : 'border-slate-300'}` } }">
              <template #option="slotProps">
                <div class="flex flex-row">
                  <i class="p-0 pi pi-youtube"></i>
                  <p class="p-0 ml-1 text-xs line-clamp-1 ">{{ slotProps.option.title }}
                  </p>
                </div>
              </template>
            </Listbox>
          </div>
          <div class="basis-1/2">
            <TagSelector :selected-tags="selectedTags" :tags="tags" />
          </div>
        </div>

      </div>
      <div class="fixed bottom-2 right-2 flex flex-row z-20">
        <i class="mt-auto mb-auto p-0 pi pi-twitter"></i>
        <p class="mt-auto mb-auto text-xs mr-2" :class="selectedTabInvalid ? 'text-red-400' : 'text-gray-500'">
          Twitter同時投稿を有効化</p>
        <InputSwitch class="mr-5" v-model="twitterSend" />
        <div ref="buttonRef">
          <Button
            class="p-1 border-solid border-2 border-slate-300 rounded-lg delay-150 duration-300 hover:scale-110 bg-white"
            icon="pi pi-send" label="送信" severity="info" text aria-label="Send" @click="send"
            :disabled="selectedTabInvalid || textAreaInvalid" />
        </div>
      </div>
    </BlockUI>
  </main>
</template>
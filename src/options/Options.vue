<script setup lang="ts">
import axios, { Axios } from 'axios';
import { Streamer } from '~/logic/vishce-types';
import { differenceInMinutes } from "date-fns";
import { onMessage, sendMessage } from 'webext-bridge/content-script'
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';
import FloatLabel from 'primevue/floatlabel';
import SelectButton from 'primevue/selectbutton';
import BlockUI from 'primevue/blockui';
import ProgressSpinner from 'primevue/progressspinner';
import Toast from 'primevue/toast';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import OverlayPanel from 'primevue/overlaypanel';
import InputGroup from 'primevue/inputgroup';
import { useToast } from "primevue/usetoast";
import { storageTagList, storageStreamerList } from '~/logic/storage'
import { Result, TabList } from '~/logic/type';

let thisTabInfo: TabList
const text = ref<string>("")

const op = ref();
const toast = useToast();
const buttonRef = ref<HTMLDivElement>()
const textAreaInvalid = ref(false)
const loading = ref(false)
const validation = ref(false)
const tabList = ref<TabList[]>([])
const selectedTab = ref<TabList[]>([])
const selectedTabInvalid = ref(false)
const tagList = ref<string[]>([])
const selectedTags = ref<string[]>([])
const selectedTagsText = ref<string>("")
const addTag = ref<string>()


watch(validation, (val) => {
  if (val === true) {
    textAreaInvalid.value = text.value === ""
    selectedTabInvalid.value = selectedTab.value.length === 0
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

watch(selectedTab, (val) => {
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

watch(selectedTags, (val) => {
  if (val.length > 0) {
    selectedTagsText.value = val.join(", ")
  } else {
    selectedTagsText.value = ""
  }
})

watch(tagList, (val) => {
  tagCheck()
})
watch(storageTagList, (val) => {
  tagCheck()
})


onMounted(() => {
  if (storageStreamerList.value.streamerList.length === 0) {
    getVishceStreamerList()
  } else {
    const diff = differenceInMinutes(storageStreamerList.value.date, new Date())
    if (diff < -60) {
      getVishceStreamerList()
    }
  }
})

onMessage<TabList>('tab-update', ({ data }) => {
  if (!data) return "NG"
  thisTabInfo = data
  return "OK"
})

onMessage<TabList[]>('get-all-tab', ({ data }) => {
  if (!data) return "NG"
  tabList.value = data
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

setInterval(() => {
  const tags: string[] = []
  tabList.value?.forEach(tab => {
    tags.push(...getTargetChannelTags(tab.channel_href))
    tags.push(...tab?.tags)
  })
  tagList.value = Array.from(new Set([...tags]))
}, 1000)

const getTargetChannelTags = (channel_href?: string) => {
  const tags: string[] = []

  const herf = channel_href?.replace("https://www.youtube.com/", "")
  storageStreamerList.value.streamerList.forEach(streamer => {
    let flg = false
    streamer.external_info?.youtube?.forEach(youtube => {
      const temp = "@" + youtube.handle_id?.toLowerCase()
      if (temp === herf?.toLowerCase() || youtube.channel_id === herf) {
        flg = true
      }
    })

    if (flg) {
      streamer.external_info?.twitter?.forEach(twitter => {
        if (twitter.hash_tags) {
          tags.push(...twitter.hash_tags?.map(tag => "#" + tag.name))
        }
      })
    }
  })
  return tags
}

const tagCheck = () => {
  selectedTags.value = selectedTags.value.filter(tag => [...tagList.value, ...storageTagList.value].includes(tag))
}

const getVishceStreamerList = () => {
  const axiosClient: Axios = axios.create()
  axiosClient.get<Streamer[]>("https://vische-server.onrender.com/api/streamer").then(res => {
    storageStreamerList.value.streamerList = []
    storageStreamerList.value.streamerList.push(...res.data)
    storageStreamerList.value.date = new Date()
  })
}

const toggle = (event: Event) => {
  op.value.toggle(event);
}

const selectTag = (tag: string) => {
  const index = selectedTags.value.findIndex(val => val === tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

const addTagData = () => {
  if (!addTag.value || addTag.value === "") return

  const list: string[] = []
  if (addTag.value.match("#")) {
    const textList = addTag.value.split("#")
    textList.forEach(text => {
      if (text === "") return
      list.push("#" + text.trim())
    })
  } else {
    list.push("#" + addTag.value)
  }

  if (list.length > 0) {
    storageTagList.value = Array.from(new Set([...storageTagList.value, ...list]))
  }
  addTag.value = ""
}

const deleteTag = (tag: string) => {
  const index = storageTagList.value.findIndex(val => val === tag)
  if (index > -1) {
    storageTagList.value.splice(index, 1)
  }

  const selectedIndex = selectedTags.value.findIndex(val => val === tag)
  if (selectedIndex > -1) {
    selectedTags.value.splice(index, 1)
  }
}

const checkSelectedList = () => {
  const filteredTab = selectedTab.value.filter(tab => {
    const index = tabList.value.findIndex(item => item.tabId == tab.tabId)
    return index > -1
  })

  if (selectedTab.value.length !== filteredTab.length) {
    selectedTab.value = filteredTab
  }
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
  checkSelectedList()

  validation.value = true
  if (text.value === "" || selectedTab.value.length === 0) {
    return
  }

  loading.value = true
  const sendTargetTabs = selectedTab.value?.map(item => item.tabId)

  if (sendTargetTabs.includes(1)) {
    sendTweet()
  }

  if (sendTargetTabs.filter(tabId => tabId !== 1).length > 0) {
    new Promise<void>((resolve, reject) => {
      sendTargetTabs.forEach(tabId => {
        sendMessage<Result>("text-send", text.value, { context: 'content-script', tabId: tabId }).then(
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
      loading.value = false
      validation.value = false
      text.value = ""
    })
    loading.value = false
  } else {
    loading.value = false
    validation.value = false
    text.value = ""
  }
}

const sendTweet = () => {
  let twitterText = text.value
  if (selectedTags.value.length > 0) {
    twitterText = twitterText + "%20" + selectedTags.value.join("%20")
  }
  twitterText = twitterText.replaceAll("#", "%23").replace(/(\n|\r)+/g, "%0A")
  const url = `https://twitter.com/intent/post?text=${twitterText}&sfh=${thisTabInfo?.tabId}`
  window.open(url, '_blank', 'width=400, height=380, top=0')
}

const refresh = () => {
  validation.value = false
  text.value = ""
  selectedTab.value = []
  selectedTagsText.value = ""
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
        <div class="mr-auto mb-4 flex flex-row">
          <Logo />
          <div class="mt-auto mb-auto">同時投稿フォーム</div>
        </div>
        <FloatLabel class="m-1">
          <Textarea class="w-full border-solid border-2 "
            :class="textAreaInvalid ? ' border-red-500' : ' border-slate-400'" v-model="text" rows="6" cols="30"
            :invalid="textAreaInvalid" />
          <label>テキストを入力</label>
        </FloatLabel>

        <div class="flex flex-col ">
          <div class="mr-auto pl-1 pb-1 flex flex-row w-[100vw]">
            <p class="mr-2">送信先:</p>
            <p v-if="selectedTab.length === 0" :class="selectedTabInvalid ? 'text-red-400' : 'text-gray-500'">
              送信先を選択してください</p>
          </div>

          <div class="mr-auto flex flex-row">
            <SelectButton v-model="selectedTab" :options="tabList" class="ml-2 mr-2" optionLabel="title" multiple
              :pt="{ button: { class: `p-1 m-auto border-solid border-2 ${selectedTabInvalid ? 'border-red-400' : 'border-slate-300'}` } }">
              <template #option="slotProps">
                <div class="flex flex-row h-[13px]">
                  <i class="mt-auto mb-auto p-0"
                    :class="slotProps.option.type === 'youtube' ? 'pi pi-youtube' : 'pi pi-twitter'"></i>
                  <p class="p-0 mt-auto mb-auto text-xs line-clamp-1  max-w-[160px]">{{ slotProps.option.title }}
                  </p>
                </div>
              </template>
            </SelectButton>
          </div>
        </div>

        <div class="mt-3 mr-auto flex flex-row">
          <div class="flex flex-col">
            <div class="mr-auto pl-1 pb-1 flex flex-row w-[100vw]">
              <p class="mr-2 mt-auto mb-auto">タグ選択:</p>
              <i class="mt-auto mb-auto p-0 pi pi-plus-circle" @click="toggle"></i>
            </div>
            <OverlayPanel ref="op">
              <p>手動でタグを追加します</p>
              <div class="flex flex-column gap-3 w-25rem">
                <InputGroup class="border-solid border-2  border-slate-400 rounded-lg">
                  <InputText id="tag" class="h-[20px]  mt-auto mb-auto" type="text" v-model="addTag"
                    placeholder="追加したいタグを入力" />
                  <Button class="mt-auto mb-auto" label="登録" severity="success" text rounded aria-label="add tag"
                    @click="addTagData" />
                </InputGroup>
              </div>
            </OverlayPanel>
            <div>
              <div class="mt-1 mr-auto flex flex-row">
                <div class="flex flex-wrap">
                  <Tag v-for="tag in storageTagList" class="m-1 delay-150 duration-300 hover:scale-105 cursor-pointer"
                    rounded :severity="selectedTags.includes(tag) ? 'success' : 'secondary'">
                    <div class="flex align-items-center gap-2 px-1 relative">
                      <p class="pr-3 " @click="selectTag(tag)">{{ tag }}</p>
                      <Button icon="pi pi-times" class="h-[10px] w-[10px] absolute right-0 top-1 mt-auto mb-auto z-20"
                        text rounded aria-label="refresh" @click="deleteTag(tag)" />
                    </div>
                  </Tag>
                </div>
              </div>
            </div>
            <div class="flex flex-wrap">
              <Tag v-for="tag in tagList" class="m-1 delay-150 duration-300 hover:scale-105 cursor-pointer" :value="tag"
                rounded @click="selectTag(tag)" :severity="selectedTags.includes(tag) ? 'success' : 'secondary'">
              </Tag>
            </div>

            <p v-if="selectedTags.length > 0" class="mr-auto ml-2 mt-auto mb-auto">※選択したタグはTwitter投稿内容にのみ付与されます</p>
          </div>
        </div>
      </div>
      <div class="fixed bottom-2 right-2 flex flex-row">
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
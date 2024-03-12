import { onMessage, sendMessage } from 'webext-bridge/background'
import type { Tabs } from 'webextension-polyfill'
import { Platform, TabList, storageTabList, storageSendResult, storageTabIds, MessageTabSync, SendResult } from '~/logic/storage'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

let previousTabInfo: TabList | undefined = undefined

browser.runtime.onInstalled.addListener((): void => {
  console.log('Extension installed')
})

browser.tabs.onUpdated.addListener((tabId) => {
  if (tabId === undefined) return
  storageTabIds.value = Array.from(new Set([...storageTabIds.value, tabId]))
})
browser.tabs.onCreated.addListener((tab) => {
  if (tab.id === undefined) return
  storageTabIds.value = Array.from(new Set([...storageTabIds.value, tab.id]))
})


browser.alarms.create({ when: Date.now() + 1000, periodInMinutes: 0.5 });
browser.alarms.onAlarm.addListener(timerStart);

function timerStart() {
  let timer: NodeJS.Timer
  let counter = 0

  timer = setInterval(() => {
    if (counter >= 30) {
      clearInterval(timer)
    }
    storageTabIds.value.forEach(tabId => {
      sendMessage<MessageTabSync | null>('tab-update', { tabId: tabId }, { context: 'content-script', tabId: tabId }).then(val => {
        if (!val) return
        syncTabInfo(val)
      }).catch(e => { })
    })
    counter++
  }, 1000)
}



browser.tabs.onRemoved.addListener(async (tabId: number, removeInfo: Tabs.OnRemovedRemoveInfoType) => {
  const index = storageTabList.value.findIndex(item => item.tabId === tabId)
  if (index > -1) {
    storageTabList.value.splice(index, 1)
    delete storageSendResult.value[tabId]
  }

  const tabIndex = storageTabIds.value.findIndex(tab => tab === tabId)
  if (tabIndex > -1) {
    storageTabIds.value.splice(index, 1)
  }
})

function getPlatformType(url: string): Platform {
  if (url.includes("https://www.youtube.com/watch?")) {
    return "youtube"
  } else if (url.includes("https://twitter.com/home")) {
    return "twitter"
  } else {
    return ""
  }
}

async function syncTabInfo(message: MessageTabSync) {
  let tab: Tabs.Tab
  try {
    tab = await browser.tabs.get(message.tabId)
  } catch (error) {
    return
  }
  if (tab.id === undefined || tab.title === undefined || tab.url === undefined) {
    return
  }
  const type = getPlatformType(tab.url)
  if (type !== "youtube") {
    return
  }
  if (tab.title.includes("youtube.com/watch?")) {
    return
  }
  if (tab.title.match(/^YouTube$/)) {
    return
  }
  if (tab.title.match(/^([0-9]+) YouTube$/)) {
    return
  }

  previousTabInfo = {
    tabId: tab.id,
    title: tab.title,
    url: tab.url,
    type: type,
    tag: message.tags,
    channel_href: message.channel_href
  }

  const index = storageTabList.value.findIndex(item => item.tabId === tab.id)
  if (index === -1) {
    storageTabList.value.push(previousTabInfo)
  } else {
    storageTabList.value[index] = previousTabInfo
  }
  storageSendResult.value[tab.id] = ""
}


onMessage<SendResult>('send-result', async (message) => {
  Object.keys(message.data).forEach(key => {
    const result = message.data[key]
    if (result === "") return
    storageSendResult.value[key] = result
  })
  return
})

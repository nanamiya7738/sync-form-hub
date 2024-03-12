import { onMessage, sendMessage } from 'webext-bridge/background'

import type { Tabs } from 'webextension-polyfill'
import { Platform, TabList, storageTabList, storageSendResult } from '~/logic/storage'

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

browser.tabs.onUpdated.addListener(async (tabId) => {
  let tab: Tabs.Tab

  if (tabId === undefined) return
  try {
    tab = await browser.tabs.get(tabId)
  } catch {
    return
  }
  syncTabInfo(tab)
  try {
    if (tabId === 1) return
    sendMessage<{ tabId: number }>('tab-update', { tabId: tabId }, { context: 'content-script', tabId })
  } catch (error) {
  }
})

browser.tabs.onRemoved.addListener(async (tabId: number, removeInfo: Tabs.OnRemovedRemoveInfoType) => {
  const index = storageTabList.value.findIndex(item => item.tabId === tabId)
  if (index > -1) {
    const url = storageTabList.value[index].url
    storageTabList.value.splice(index, 1)
    delete storageSendResult.value[url]
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

function syncTabInfo(tab: Tabs.Tab) {
  if (tab.id === undefined || tab.title === undefined || tab.url === undefined) {
    return
  }
  if (tab.id === previousTabInfo?.tabId) {
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
    tag: []
  }
  const index = storageTabList.value.findIndex(item => item.tabId === tab.id)
  if (index === -1) {
    storageTabList.value.push(previousTabInfo)
  } else {
    previousTabInfo.tag = storageTabList.value[index].tag
    storageTabList.value[index] = previousTabInfo
  }
  storageSendResult.value[tab.id] = ""
}

onMessage<{ tabId?: number }>('sync-tab', async (message) => {
  let nowTab: Tabs.Tab
  storageTabList.value.forEach(async tab => {
    if (tab.type !== "youtube") return
    try {
      nowTab = await browser.tabs.get(tab.tabId)
    } catch {
      return
    }
    syncTabInfo(nowTab)
  })
  return
})

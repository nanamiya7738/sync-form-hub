import { onMessage, sendMessage } from 'webext-bridge/background'
import type { Tabs } from 'webextension-polyfill'
import { storageStreamerList, storageTagList, storageAutoDescriptiionExpand } from '~/logic/storage'
import { Platform, TabList } from '~/logic/type';


// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

let tabList: number[] = [1]
let tabInfoList: TabList[] = [{
  tabId: 1,
  title: "Twitter",
  url: "https://twitter.com/home",
  type: "twitter",
  tags: []
}]

browser.runtime.onInstalled.addListener((): void => {
  console.log('Extension installed')
})

browser.tabs.onCreated.addListener((tab) => {
  if (tab.id === undefined) return
  tabList = Array.from(new Set([...tabList, tab.id]))
})
browser.tabs.onUpdated.addListener((tabId) => {
  if (tabId === undefined) return
  tabList = Array.from(new Set([...tabList, tabId]))
})
browser.tabs.onRemoved.addListener(async (tabId: number, removeInfo: Tabs.OnRemovedRemoveInfoType) => {
  const tabIndex = tabList.findIndex(tab => tab === tabId)
  if (tabIndex > -1) {
    tabList.splice(tabIndex, 1)
  }
})

browser.alarms.create({ when: Date.now() + 1000, periodInMinutes: 0.5 });
browser.alarms.onAlarm.addListener(timerStart);

onMessage("clear-storage", () => {
  storageStreamerList.value = { date: new Date, streamerList: [] }
  storageTagList.value = []
  storageAutoDescriptiionExpand.value = true

  tabInfoList = [{
    tabId: 1,
    title: "Twitter",
    url: "https://twitter.com/home",
    type: "twitter",
    tags: []
  }]
  tabList = [1]
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

function timerStart() {
  let timer: NodeJS.Timer
  let counter = 0

  timer = setInterval(() => {
    if (counter >= 30) {
      clearInterval(timer)
    }

    tabInfoList.forEach(tab => {
      const index = tabList.findIndex(tabId => tabId === tab.tabId)
      if (index === -1) {
        tabInfoList.splice(index, 1)
      }
    })

    tabList.forEach(tabId => {
      syncTabInfo(tabId)
      sendMessage<TabList[]>('get-all-tab', tabInfoList, { context: 'content-script', tabId: tabId }).then().catch().finally(() => { })
    })

    counter++
  }, 1000)
}

async function syncTabInfo(tabId: number) {
  let tab: Tabs.Tab
  try {
    tab = await browser.tabs.get(tabId)
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

  const tabInfo: TabList = {
    tabId: tab.id,
    title: tab.title,
    url: tab.url,
    type: type,
    tags: [],
    channel_href: ""
  }

  sendMessage<TabList>('tab-update', { tabInfo }, { context: 'content-script', tabId: tabId }).then(message => {
    if (!message) return
    tabInfo.channel_href = message.channel_href
    tabInfo.tags = message.tags

    const index = tabInfoList.findIndex(item => item.tabId === tab.id)
    if (index === -1) {
      tabInfoList.push(tabInfo)
    } else {
      tabInfoList[index] = tabInfo
    }
  }).catch(e => { })
}
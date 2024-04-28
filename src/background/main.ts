
import { onMessage, sendMessage } from 'webext-bridge/background'
import { storageStreamerList, storageTagList, storageAutoDescriptiionExpand } from '~/logic/storage'
import { TabInfo } from '~/logic/type';

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

browser.tabs.onRemoved.addListener((tabId: number) => {
  try {
    sendMessage<number>("delete-tab", tabId, "options")
  } catch (error) {
    console.log(error)
  }
})

onMessage("clear-storage", async (message) => {
  storageStreamerList.value = { date: new Date, streamerList: [] }
  storageTagList.value = []
  storageAutoDescriptiionExpand.value = true
})

onMessage<TabInfo>("send-page-data", async (message) => {
  const { data, sender } = message;
  data.tabId = sender.tabId
  try {
    sendMessage<TabInfo>("send-tabinfo", data, "options")
  } catch (error) {
    console.log(error)
  }
})

onMessage<string[]>("send-tag-data", async (message) => {
  const { data } = message;
  try {
    sendMessage<TabInfo[]>("update-tag-list", data, "options")
  } catch (error) {
    console.log(error)
  }
})

import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'
import { Streamer } from './vishce-types'

export type Platform = "youtube" | "twitter" | ""
export interface SendResult {
    [id: string]: "OK" | "NG" | ""
}
export interface TabList {
    tabId: number
    title: string
    type: Platform
    url: string
    tag: string[]
    channel_href?: string
}

interface StoredStreamer {
    date: Date
    streamerList: Streamer[]
}

export const storageText = useWebExtensionStorage<string>('sfh-text', '')
export const storageSendTarget = useWebExtensionStorage<number[]>('sfh-send-target', [])
export const storageSendResult = useWebExtensionStorage<SendResult>('sfh-send-result', {})
export const storageTabList = useWebExtensionStorage<TabList[]>('sfh-tab-list', [{
    tabId: 1,
    title: "Twitter",
    url: "https://twitter.com/home",
    type: "twitter",
    tag: []
}])
export const storageStreamerList = useWebExtensionStorage<StoredStreamer>('sfh-streamer-list', { date: new Date, streamerList: [] })
export const storageTagList = useWebExtensionStorage<string[]>('sfh-tag-list', [])
export const storageAutoDescriptiionExpand = useWebExtensionStorage<boolean>('sfh-auto-descriptiion-expand', true)
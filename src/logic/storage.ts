import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'
import { Streamer } from './vishce-types'

export type Platform = "youtube" | "twitter" | ""
export type TabList = {
    tabId: number
    title: string
    type: Platform
    url: string
    tags: Array<string>,
    channel_href?: string
}
export type Result = "OK" | "NG"
interface StoredStreamer {
    date: Date
    streamerList: Streamer[]
}

export const storageStreamerList = useWebExtensionStorage<StoredStreamer>('sfh-streamer-list', { date: new Date, streamerList: [] })
export const storageTagList = useWebExtensionStorage<string[]>('sfh-tag-list', [])
export const storageAutoDescriptiionExpand = useWebExtensionStorage<boolean>('sfh-auto-descriptiion-expand', true)

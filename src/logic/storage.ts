import { useWebExtensionStorage } from '~/composables/useWebExtensionStorage'
import { Streamer } from './vishce-types'

interface StoredStreamer {
    date: Date
    streamerList: Streamer[]
}

export const storageStreamerList = useWebExtensionStorage<StoredStreamer>('sfh-streamer-list', { date: new Date, streamerList: [] })
export const storageTagList = useWebExtensionStorage<string[]>('sfh-tag-list', [])
export const storageAutoDescriptiionExpand = useWebExtensionStorage<boolean>('sfh-auto-descriptiion-expand', true)

<script setup lang="ts">
import { storageAutoDescriptiionExpand } from '~/logic/storage'
import { Result, TabInfo } from '~/logic/type';
import { onMessage, sendMessage } from 'webext-bridge/content-script'
import { storageStreamerList } from '~/logic/storage'

let prevText = ""
let channelHref = ""
let prevTagList: string[] = []
let prevPageData: TabInfo = {
    tabId: 0,
    title: "",
    url: "",
    isLive: false
}

setInterval(() => {
    const infoText = document.querySelector<HTMLDivElement>("ytd-watch-metadata")
    if (infoText === null) return null

    sendPageData(infoText)
    sendTagData(infoText)
}, 1000)

onMessage<string>('text-send', async ({ data }) => {
    return await sendComment(data)
})

const sendPageData = (infoText: HTMLDivElement) => {
    const url = window.location.href
    const pageData: TabInfo = {
        tabId: 0,
        title: "",
        url: url,
        isLive: false
    }
    setTitle(infoText, pageData)
    setIsLibe(pageData)

    if (JSON.stringify(prevPageData) !== JSON.stringify(pageData)) {
        sendMessage<TabInfo>("send-page-data", pageData)
        prevPageData = pageData
    }
}

const sendTagData = (infoText: HTMLDivElement) => {
    let tagList: string[] = []

    setChannelTag(infoText, tagList)
    setTag(infoText, tagList)
    if (storageAutoDescriptiionExpand.value) {
        setTagFromDescription(infoText, tagList)
    }
    tagList = Array.from(new Set([...tagList]))

    if (JSON.stringify(prevTagList) !== JSON.stringify(tagList)) {
        sendMessage<string[]>("send-tag-data", tagList)
        prevTagList = tagList
    }
}

const setTitle = (infoText: HTMLDivElement, pageData: TabInfo) => {
    const title = infoText.querySelector<HTMLDivElement>("yt-formatted-string")
    if (!title || !title?.textContent) return
    if (pageData.title !== title?.textContent) {
        pageData.title = title?.textContent
    }
}
const setIsLibe = (pageData: TabInfo) => {
    const liveChatFrame = document.querySelector<HTMLIFrameElement>('iframe.style-scope.ytd-live-chat-frame')
    if (!liveChatFrame?.contentDocument) return
    const chatInputBox = liveChatFrame.contentDocument.querySelector<HTMLDivElement>('#input.yt-live-chat-text-input-field-renderer')
    pageData.isLive = chatInputBox !== null
}

const setChannelTag = (infoText: HTMLDivElement, tagList: string[]) => {
    const channel = infoText.querySelector<HTMLAreaElement>("a.yt-simple-endpoint")
    if (channel === null) return
    if (channelHref !== channel.href) {
        const herf = channelHref?.replace("https://www.youtube.com/", "")
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
                        tagList.push(...twitter.hash_tags?.map(tag => "#" + tag.name))
                    }
                })
            }
        })
        channelHref = channel.href
    }
}

const setTag = (infoText: HTMLDivElement, tagList: string[]) => {
    const tagInfo = infoText.querySelector<HTMLDivElement>("ytd-watch-info-text yt-formatted-string#info")
    if (tagInfo === null) return
    tagInfo.querySelectorAll("a").forEach(tag => {
        if (tag.textContent) {
            tagList.push(tag?.textContent)
        }
    })

    const title = infoText.querySelector<HTMLDivElement>("yt-formatted-string")
    if (title) {
        const linkedTags = title.querySelectorAll<HTMLAreaElement>("a")
        linkedTags.forEach(area => {
            if (area?.textContent) {
                tagList.push(area?.textContent)
            }
        })
    }
}

const setTagFromDescription = (infoText: HTMLDivElement, tagList: string[]) => {
    const descriptiion = infoText.querySelector<HTMLDivElement>("div#description")
    if (descriptiion) {
        const expand = descriptiion.querySelector<HTMLDivElement>("tp-yt-paper-button#expand")
        const collepse = descriptiion.querySelector<HTMLDivElement>("tp-yt-paper-button#collapse")
        const textList = descriptiion.querySelectorAll<HTMLAreaElement>("yt-attributed-string.ytd-text-inline-expander > span > a")
        if (collepse && collepse.hidden && expand) {
            expand.dispatchEvent(new Event('click', { bubbles: true }))
        }
        textList.forEach(element => {
            if (element.outerText?.match(/^[#＃].*$/)) {
                tagList.push(element.outerText)
            }
        });
    }
}

const sendComment = (message: string) => {
    return new Promise<Result>((resolve, reject) => {
        try {
            const liveChatFrame = document.querySelector<HTMLIFrameElement>('iframe.style-scope.ytd-live-chat-frame')
            if (!liveChatFrame?.contentDocument) throw "セレクタ検索エラー"
            const chatInputBox = liveChatFrame.contentDocument.querySelector<HTMLDivElement>('#input.yt-live-chat-text-input-field-renderer')
            if (!chatInputBox) throw "セレクタ検索エラー"
            if (prevText === message) throw "連投制限エラー"

            chatInputBox.focus()
            chatInputBox.innerText = message
            prevText = message
            chatInputBox.dispatchEvent(new Event('input', { bubbles: true }))

            setTimeout(() => {
                if (!liveChatFrame?.contentDocument) throw "セレクタ検索エラー"
                const sendButton = liveChatFrame.contentDocument.querySelector('div.yt-live-chat-message-input-renderer button.yt-spec-button-shape-next.yt-spec-button-shape-next--text.yt-spec-button-shape-next--icon-button[aria-label="送信"]')
                if (sendButton) {
                    sendButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
                    resolve("OK")
                } else {
                    throw "送信ボタン検索エラー"
                }
            }, 500)
        } catch (error) {
            console.error(error)
            reject("NG")
        }
    })
}
</script>
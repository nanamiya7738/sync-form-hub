<script setup lang="ts">
import { storageText, storageSendTarget, storageAutoDescriptiionExpand, MessageTabSync, SendResult } from '~/logic/storage'
import { onMessage, sendMessage } from 'webext-bridge/content-script'


let prevText = ""
const tabId = ref<number>(0)

onMessage<MessageTabSync | null>('tab-update', ({ data }) => {
    if (!data) return null

    if (tabId.value !== data.tabId) {
        tabId.value = data.tabId
    }
    const infoText = document.querySelector<HTMLDivElement>("ytd-watch-metadata")
    if (infoText === null) return null

    let target: MessageTabSync = {
        tabId: data.tabId,
        title: "",
        channel_href: "",
        tags: []
    }

    setTitle(infoText, target)
    setChannel(infoText, target)
    setTag(infoText, target)

    return {
        tabId: tabId.value,
        title: target.title,
        channel_href: target.channel_href,
        tags: target.tags,
    }
})

const setTitle = (infoText: HTMLDivElement, target: MessageTabSync) => {
    const title = infoText.querySelector<HTMLDivElement>("yt-formatted-string")
    if (!title || !title?.textContent) return
    if (target.title !== title?.textContent) {
        target.title = title?.textContent
    }
}
const setChannel = (infoText: HTMLDivElement, target: MessageTabSync) => {
    const channel = infoText.querySelector<HTMLAreaElement>("a.yt-simple-endpoint")
    if (channel === null) return
    if (target.channel_href !== channel.href) {
        target.channel_href = channel.href
    }
}
const setTag = (infoText: HTMLDivElement, target: MessageTabSync) => {
    const tagInfo = infoText.querySelector<HTMLDivElement>("ytd-watch-info-text yt-formatted-string#info")
    if (tagInfo === null) return
    const tagList: string[] = []
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

    if (storageAutoDescriptiionExpand.value) {
        const descriptiion = infoText.querySelector<HTMLDivElement>("div#description")
        if (descriptiion) {
            const expand = descriptiion.querySelector<HTMLDivElement>("tp-yt-paper-button#expand")
            if (expand) {
                expand.dispatchEvent(new Event('click', { bubbles: true }))
            }
            const textList = descriptiion.querySelectorAll<HTMLAreaElement>("yt-attributed-string.ytd-text-inline-expander > span > a")
            textList.forEach(element => {
                if (element.textContent?.includes("#")) {
                    tagList.push(element.textContent)
                }
            });
        }
    }

    if (tagList.length > 0) {
        if (JSON.stringify(target.tags) !== JSON.stringify(tagList)) {
            target.tags = tagList
        }
    }
}

watch(storageSendTarget, (val) => {
    if (val.includes(tabId.value)) {
        if (storageText.value !== "") {
            sendComment(storageText.value)
        }
    }
})

const sendComment = (message: string) => {
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
                sendMessage<SendResult>("send-result", { [tabId.value]: "OK" })
            } else {
                throw "送信ボタン検索エラー"
            }
        }, 500)
    } catch (error) {
        sendMessage<SendResult>("send-result", { [tabId.value]: "NG" })
        console.error(error)
    }
}
</script>
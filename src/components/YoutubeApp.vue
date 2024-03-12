<script setup lang="ts">
import { storageText, storageSendResult, storageTabList, storageSendTarget, TabList, storageAutoDescriptiionExpand } from '~/logic/storage'


const props = defineProps({
    tabId: {
        type: Number,
        required: true
    }
})
let prevText = ""

setInterval(() => {
    parseInfo()
}, 2000)

const parseInfo = () => {
    const infoText = document.querySelector<HTMLDivElement>("ytd-watch-metadata")
    if (infoText === null) return

    const index = storageTabList.value.findIndex(item => item.tabId === props.tabId)
    let target: TabList | null = null
    if (index > 0) {
        target = storageTabList.value[index]
    }
    if (!target) return

    setTitle(infoText, target)
    setChannel(infoText, target)
    setTag(infoText, target)
}

const setTitle = (infoText: HTMLDivElement, target: TabList) => {
    const title = infoText.querySelector<HTMLDivElement>("yt-formatted-string")
    if (!title || !title?.textContent) return
    if (target.title !== title?.textContent) {
        target.title = title?.textContent
    }
}
const setChannel = (infoText: HTMLDivElement, target: TabList) => {
    const channel = infoText.querySelector<HTMLAreaElement>("a.yt-simple-endpoint")
    if (channel === null) return
    if (target.channel_href !== channel.href) {
        target.channel_href = channel.href
    }
}
const setTag = (infoText: HTMLDivElement, target: TabList) => {
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
        if (JSON.stringify(target.tag) !== JSON.stringify(tagList)) {
            target.tag = tagList
        }
    }
}

watch(storageSendTarget, (val) => {
    if (val.includes(props.tabId)) {
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
                storageSendResult.value[props.tabId] = "OK"
            } else {
                throw "送信ボタン検索エラー"
            }
        }, 500)
    } catch (error) {
        storageSendResult.value[props.tabId] = "NG"
        console.error(error)
    }
}
</script>
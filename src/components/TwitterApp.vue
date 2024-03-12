<script setup lang="ts">
import { storageSendResult } from '~/logic/storage'


let count = 0
let interval: NodeJS.Timer | undefined

onMounted(() => {
    const quary = getUrlQueries()

    if (quary["sfhpost"] = "true") {
        interval = setInterval(() => {
            postTweet()
        }, 2000)

    }
})

const postTweet = () => {
    try {
        if (count > 10) {
            throw "試行回数エラー"
        }
        const url = window.location.href
        if (url.includes("https://twitter.com/intent/post")) {

            const sendButton = document.querySelector<HTMLDivElement>("div[data-testid='tweetButton']")
            if (!sendButton) {
                throw "セレクタ検索エラー"
            }

            sendButton.dispatchEvent(new KeyboardEvent("Escape", { bubbles: true }))
            sendButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
            storageSendResult.value[1] = "OK"
        } else {
            clearInterval(interval)
            window.close()
        }
        count++
    } catch (error) {
        storageSendResult.value[1] = "NG"
        clearInterval(interval)
        console.error(error)
    }
}

const getUrlQueries = () => {
    const queryStr = window.location.search.slice(1);
    const queries: { [key: string]: string } = {};

    // クエリがない場合は空のオブジェクトを返す
    if (!queryStr) {
        return queries;
    }

    // クエリ文字列を & で分割して処理
    queryStr.split('&').forEach(function (queryStr) {
        // = で分割してkey,valueをオブジェクトに格納
        var queryArr = queryStr.split('=');
        queries[queryArr[0]] = queryArr[1];
    });

    return queries;
}
console.log(getUrlQueries())

</script>
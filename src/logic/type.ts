export type Result = "OK" | "NG"
export type Platform = "youtube" | "twitter" | ""
export type TabList = {
    tabId: number
    title: string
    type: Platform
    url: string
    tags: Array<string>,
    channel_href?: string
}
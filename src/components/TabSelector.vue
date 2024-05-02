<script setup lang="ts">
import { onMessage, sendMessage } from 'webext-bridge/options'
import Avatar from 'primevue/avatar';
import Listbox from 'primevue/listbox';
import { TabInfo } from '~/logic/type';

const props = defineProps({
    selectedTabInvalid: {
        type: Boolean,
        required: true
    }
})

const tabs = ref<TabInfo[]>([])
const selectedTabs = ref<TabInfo[]>([])

const emit = defineEmits<{
    (e: 'selectTabs', value: TabInfo[]): void
}>()

onMessage<TabInfo>('send-tabinfo', ({ data }) => {
    if (!data) return "NG"
    const i = tabs.value.findIndex(item => item.tabId === data.tabId)
    if (i > -1) {
        tabs.value[i] = data
    } else {
        tabs.value.push(data)
    }
    return "OK"
})

onMessage<number>('delete-tab', ({ data }) => {
    if (data === undefined) return "NG"
    tabs.value = tabs.value.filter(item => item.tabId !== data)
    return "OK"
})

const disableRow = (rowData: TabInfo) => {
    return !rowData.isLive
}

watch(tabs, (val) => {
    selectedTabs.value =
        selectedTabs.value.filter(tabInfo => val.map(item => item.tabId).includes(tabInfo.tabId))
})

let prevSelectedTabs: TabInfo[] = []
watch(selectedTabs, (val) => {
    emit("selectTabs", val)

    const deleteList = prevSelectedTabs.filter(item => !val.map(item => item.tabId).includes(item.tabId))
    deleteList.forEach(item => {
        sendMessage("change-page-selection", "deselected", { context: "content-script", tabId: item.tabId })
    })
    const addList = val.filter(item => !prevSelectedTabs.map(item => item.tabId).includes(item.tabId))
    addList.forEach(item => {
        sendMessage("change-page-selection", "selected", { context: "content-script", tabId: item.tabId })
    })
    prevSelectedTabs = [...val]
}, { deep: true })
</script>

<template>
    <div class="flex flex-col w-full">
        <div class="pl-1 pb-1 flex flex-row items-center">
            <i class="mr-1 pi pi-youtube"></i>
            <p class="mr-2">コメント送信先:</p>
        </div>
        <Listbox v-model="selectedTabs" :options="tabs" multiple optionLabel="title" emptyMessage="Youtubeのタブが検出されていません"
            :pt="{
            button: { class: `p-1 m-auto border-solid border-2 ${props.selectedTabInvalid ? 'border-red-400' : 'border-slate-300'}` },
            emptyMessage: {
                class: 'flex'
            }
        }" :optionDisabled="disableRow">
            <template #option="slotProps">
                <div class="flex flex-row items-center" v-tooltip.bottom="slotProps.option.title">
                    <Avatar :image="slotProps.option.channelIcon" shape="circle" />
                    <p class="p-0 ml-1 text-xs line-clamp-1">{{ slotProps.option.title }}
                    </p>
                </div>
            </template>
        </Listbox>
    </div>
</template>
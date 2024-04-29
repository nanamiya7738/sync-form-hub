<script setup lang="ts">
import { onMessage } from 'webext-bridge/options'

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

watch(selectedTabs, (val) => {
    emit("selectTabs", val)
})
</script>

<template>
    <div class="pl-1 pb-1 flex flex-row">
        <p class="mr-2">送信先:</p>
        <p v-if="selectedTabs.length === 0" :class="props.selectedTabInvalid ? 'text-red-400' : 'text-gray-500'">
            送信先を選択してください</p>
    </div>
    <Listbox v-model="selectedTabs" :options="tabs" multiple optionLabel="title" emptyMessage="Youtubeのタブが検出されていません"
        :pt="{ button: { class: `p-1 m-auto border-solid border-2 ${props.selectedTabInvalid ? 'border-red-400' : 'border-slate-300'}` } }"
        :optionDisabled="disableRow">
        <template #option="slotProps">
            <div class="flex flex-row" v-tooltip.bottom="slotProps.option.title">
                <i class="p-0 pi pi-youtube"></i>
                <p class="p-0 ml-1 text-xs line-clamp-1 ">{{ slotProps.option.title }}
                </p>
            </div>
        </template>
    </Listbox>
</template>
<script setup lang="ts">
import { onMessage } from 'webext-bridge/options'

import Button from 'primevue/button';
import MultiSelect from 'primevue/multiselect';
import ContextMenu, { ContextMenuProps } from 'primevue/contextmenu';
import InputText from 'primevue/inputtext';
import OverlayPanel from 'primevue/overlaypanel';
import InputGroup from 'primevue/inputgroup';
import { storageTagList } from '~/logic/storage'
import { watchWithFilter } from '@vueuse/core';

type TagListType = "detected" | "fiexed" | "none"
interface TagValue {
    label: string;
    type: TagListType;
    value: string;
}
interface TagGroup {
    label: string;
    type: TagListType;
    items: TagValue[];
}

const tagGroups = ref<TagGroup[]>([
    {
        label: "（タグなしで送信する場合は選択）",
        type: "none",
        items: [{
            label: "タグなし",
            type: "none",
            value: "##"
        }]
    },
    {
        label: "固定中",
        type: "fiexed",
        items: []
    },
    {
        label: "検出されたタグ",
        type: "detected",
        items: []
    }
])
const selectedTags = ref<TagValue[]>([])
const op = ref();
const addTag = ref<string>()
const rightClickedTag = ref<string>("");
const detectedMenu = ref();
const fixedMenu = ref();
const detectedItems = ref<ContextMenuProps["model"]>([
    {
        label: 'タグを固定', icon: 'pi pi-thumbtack', command: () => {
            const storagedIndex = storageTagList.value.findIndex(item => item === rightClickedTag.value)
            if (storagedIndex < 0) {
                storageTagList.value.push(rightClickedTag.value)
            }
        }
    },
]);
const fixedItems = ref<ContextMenuProps["model"]>([
    {
        label: 'タグ固定を解除', icon: 'pi pi-thumbtack', command: () => {
            const selectedIndex = selectedTags.value.findIndex(item => item.value === rightClickedTag.value)
            if (selectedIndex > -1) {
                selectedTags.value.splice(selectedIndex, 1)
            }
            const storagedIndex = storageTagList.value.findIndex(item => item === rightClickedTag.value)
            if (storagedIndex > -1) {
                storageTagList.value.splice(storagedIndex, 1)
            }
            rightClickedTag.value = ""
        }
    },
]);

const emit = defineEmits<{
    (e: 'selectTags', value: string[]): void
}>()

onMessage<string[]>('update-tag-list', ({ data }) => {
    data.forEach(tag => {
        const index = tagGroups.value[2].items.findIndex(val => val.value === tag)
        if (index === -1) {
            if (tagGroups.value[2].items.length > 11) {
                tagGroups.value[2].items.pop()
            }
            tagGroups.value[2].items.unshift({
                label: tag,
                type: "detected",
                value: tag
            })
        }
    })
})

watch(selectedTags, (val) => {
    emit("selectTags", val.map(item => item.value))
}, { deep: true })

watchWithFilter(storageTagList, (val) => {
    tagGroups.value[1].items = val.map(tag => {
        return {
            label: tag,
            type: "fiexed",
            value: tag
        }
    })
}, { deep: true })

const initTagGroups = () => {
    tagGroups.value[1].items = storageTagList.value.map(tag => {
        return {
            label: tag,
            type: "fiexed",
            value: tag
        }
    })
}

const toggle = (event: Event) => {
    op.value.toggle(event);
}

const addTagData = () => {
    if (!addTag.value || addTag.value === "") return

    const list: string[] = []
    if (addTag.value.match("#")) {
        const textList = addTag.value.split("#")
        textList.forEach(text => {
            if (text === "") return
            list.push("#" + text.trim())
        })
    } else if (addTag.value.match("＃")) {
        const textList = addTag.value.split("＃")
        textList.forEach(text => {
            if (text === "") return
            list.push("#" + text.trim())
        })
    } {
        list.push("#" + addTag.value)
    }

    if (list.length > 0) {
        storageTagList.value = Array.from(new Set([...list, ...storageTagList.value]))
    }
    addTag.value = ""
}

const onRightClick = (event: any, type: "detected" | "fiexed", tag: string) => {
    rightClickedTag.value = tag;
    if (type === "detected") {
        detectedMenu.value.show(event);
    } else if (type === "fiexed") {
        fixedMenu.value.show(event);
    }
};

const optionDisabled = (value: TagValue) => {
    const isTagNone = value.value === "##"
    if (selectedTags.value.length === 0) {
        return false
    }
    if (selectedTags.value.map(item => item.value).includes("##")) {
        return !isTagNone
    } else {
        return isTagNone
    }
}

initTagGroups()
</script>

<template>
    <div class="flex flex-col w-full">
        <div class="pl-1 pb-1 flex flex-row items-center">
            <i class="mr-1 p-0 pi pi-twitter"></i>
            <p class="mr-2"> タグ選択:</p>
            <i class="ml-auto p-0 pi pi-plus-circle cursor-pointer" @click="toggle"></i>
            <p class="mr-2 ml-1 cursor-pointer" @click="toggle">タグ追加</p>
            <OverlayPanel ref="op">
                <p>手動でタグを追加します</p>
                <div class="flex flex-column gap-3 w-25rem">
                    <InputGroup class="border-solid border-2  border-slate-400 rounded-lg">
                        <InputText id="tag" class="h-[20px]  mt-auto mb-auto" type="text" v-model="addTag"
                            placeholder="追加したいタグを入力" />
                        <Button class="mt-auto mb-auto" label="登録" severity="success" text rounded aria-label="add tag"
                            @click="addTagData" />
                    </InputGroup>
                </div>
            </OverlayPanel>
        </div>
        <MultiSelect v-model="selectedTags" :options="tagGroups" optionLabel="label" optionGroupLabel="label"
            optionGroupChildren="items" display="chip" placeholder="ハッシュタグを選択" class="w-[98%]"
            :optionDisabled="optionDisabled" :pt="{
                item: {
                    class: 'flex align-items-center py-0'
                }, label: {
                    class: 'flex flex-start'
                }
            }">
            <template #option="slotProps">
                <div class="flex w-full py-3"
                    @contextmenu="onRightClick($event, slotProps.option.type, slotProps.option.value)">
                    {{ slotProps.option.label }}
                </div>
            </template>
            <template #footer>
                <div class="py-2 px-3 text-xs flex flex-col">
                    <p>いずれかを選択することで<i class="text-xs pi pi-twitter"></i>に送信されます。</p>
                    <p>右クリックでタグ固定・解除ができます。</p>
                </div>
            </template>
        </MultiSelect>
    </div>
    <ContextMenu ref="fixedMenu" :model="fixedItems" />
    <ContextMenu ref="detectedMenu" :model="detectedItems" />
</template>

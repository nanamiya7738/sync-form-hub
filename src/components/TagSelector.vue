<script setup lang="ts">
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import InputText from 'primevue/inputtext';
import OverlayPanel from 'primevue/overlaypanel';
import ScrollPanel from 'primevue/scrollpanel';
import InputGroup from 'primevue/inputgroup';
import { storageTagList } from '~/logic/storage'

const props = defineProps({
    tags: {
        type: Array<String>,
        required: true
    },
    selectedTags: {
        type: Array<String>,
        required: true
    }
})

const op = ref();
const addTag = ref<string>()

const toggle = (event: Event) => {
    op.value.toggle(event);
}

const selectTag = (tag: String) => {
    const index = props.selectedTags.findIndex(val => val === tag)
    if (index > -1) {
        props.selectedTags.splice(index, 1)
    } else {
        props.selectedTags.push(tag)
    }
}

const fixTag = (tag: String) => {
    storageTagList.value = Array.from(new Set([...storageTagList.value, tag.toString()]))
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
        storageTagList.value = Array.from(new Set([...storageTagList.value, ...list]))
    }
    addTag.value = ""
}

const deleteTag = (tag: string) => {
    const index = storageTagList.value.findIndex(val => val === tag)
    if (index > -1) {
        storageTagList.value.splice(index, 1)
    }

    const selectedIndex = props.selectedTags.findIndex(val => val === tag)
    if (selectedIndex > -1) {
        props.selectedTags.splice(index, 1)
    }
}
</script>

<template>
    <div class="flex flex-col">
        <div class="mr-auto pl-1 pb-1 flex flex-row">
            <p class="mr-2 mt-auto mb-auto">選択済みタグ:</p>
        </div>
        <ScrollPanel style="width: 90%; height: 60px">
            <div class="flex flex-col">
                <p v-if="props.selectedTags.length > 0" class="text-[11px] ml-2 mr-auto">※選択したタグはTwitter投稿内容にのみ付与されます
                </p>
                <div class="flex flex-wrap">
                    <Tag v-for="tag in props.selectedTags" class="m-1 w-[150px] " rounded :severity="'contrast'"
                        @click="selectTag(tag)">
                        <div class="flex align-items-center gap-2 px-1 relative">
                            <p class="pr-3 delay-150 duration-300 hover:scale-105 cursor-pointer">{{ tag }}</p>
                        </div>
                    </Tag>
                </div>
            </div>
        </ScrollPanel>

        <div class="mr-auto pl-1 pb-1 flex flex-row">
            <p class="mr-2 mt-auto mb-auto">タグ一覧:</p>
            <i class="mt-auto mb-auto p-0 pi pi-plus-circle" @click="toggle"></i>
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
        <p class="text-[11px] ml-2 mr-auto"><i class="pi pi-thumbtack text-[10px]"></i>
            をクリックすることで保持できます。
        </p>
        <ScrollPanel style="width: 95%; height: 40vh">
            <div class="flex flex-col">
                <div class="flex flex-wrap">
                    <Tag v-for="tag in storageTagList" class="m-1 w-[180px]" rounded
                        :severity="selectedTags.includes(tag) ? 'success' : 'secondary'">
                        <div class="flex align-items-center gap-2 px-1 relative w-100">
                            <Button icon="pi pi-times" class="h-[12px] w-[12px] mt-auto mb-auto z-20" text rounded
                                aria-label="refresh" @click="deleteTag(tag)" />
                            <p class="delay-150 duration-300 hover:scale-105 cursor-pointer line-clamp-1"
                                v-tooltip.bottom="tag" @click="selectTag(tag)">{{ tag }}</p>
                        </div>
                    </Tag>
                </div>
                <div class="flex flex-wrap mt-2">
                    <Tag v-for="tag in props.tags" class="m-1 w-[120px]" rounded
                        :severity="selectedTags.includes(tag) ? 'success' : 'secondary'">
                        <div class="flex align-items-center gap-2 px-1 relative w-100">
                            <p class="delay-150 duration-300 hover:scale-105 cursor-pointer mr-auto line-clamp-1 text-[10px]"
                                v-tooltip.bottom="tag" @click="selectTag(tag)">{{ tag }}</p>
                            <Button icon="pi pi-thumbtack" class="h-[14px] w-[14px] mt-auto mb-auto z-20" text rounded
                                aria-label="refresh" @click="fixTag(tag)" />
                        </div>
                    </Tag>
                </div>
            </div>
        </ScrollPanel>
    </div>
</template>
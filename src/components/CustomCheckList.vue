<template>
    <div class="card flex flex-wrap justify-content-center gap-3">
        <div class="flex align-items-center" v-for="key in keyList">
            <Checkbox v-model="selected[key]" :inputId="key" :value="key" />
            <label :for="key" class="ml-2"> {{ props.data[key].title }} </label>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import type { TargetInfoList } from '~/logic/storage'

const props = defineProps({
    data: {
        type: Object as PropType<TargetInfoList>,
        required: true
    },
})

const keyList = ref(Object.keys(props.data))
watch(keyList, (val) => {
    val.forEach(key => {
        selected.value[key] = true
    })
})
const selected = ref<{ [id: string]: boolean }>({})
</script>
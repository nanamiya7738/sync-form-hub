<script setup lang="ts">
import Button from 'primevue/button';
import ToggleButton from 'primevue/togglebutton';
import { storageTabList, storageSendResult, storageText, storageAutoDescriptiionExpand } from '~/logic/storage'

const openOptionsPage = () => {
  const url = browser.runtime.getURL('/dist/options/index.html')
  window.open(url, '_blank',
    'width=600, height=400, top=0, left=200,　resizable=yes, scrollbars=yes, menubar=yes, toolbar=yes')
}
const openTwitter = () => {
  window.open("https://twitter.com/home")
}

const clear = () => {
  storageTabList.value = [{
    tabId: 1,
    title: "Twitter",
    url: "https://twitter.com/home",
    type: "twitter",
    tag: []
  }]
  storageText.value = ""
  storageSendResult.value = { "https://twitter.com/home": "" }
}
</script>

<template>
  <main class="w-[320px] px-4 py-5 text-center text-gray-700">
    <Logo />
    <div>sync-form-hub</div>

    <div class="flex flex-col w-full mt-2 ml-auto mr-auto">
      <div class="mb-5 scale-105">
        <Button class="p-1" label="フォームを開く" severity="contrast" raised @click="openOptionsPage" />
      </div>
      <div class="mb-2">
        <p class="mt-1 text-[10px] w-[280px]">投稿したいアカウントで予めログインを実行してください</p>
        <Button class="p-1" label="Twitterログイン" icon="pi pi-twitter" severity="contrast" raised @click="openTwitter" />
      </div>
      <div class="mb-2">
        <p class="mt-1 text-[10px] w-[280px]">YouTube概要欄を自動で開き</p>
        <p class="mt-1 text-[10px] w-[280px]">自動でタグ情報を読み込みます</p>
        <ToggleButton v-model="storageAutoDescriptiionExpand" onLabel="On" offLabel="Off" class="h-[26px] w-[63px]" />
      </div>
      <div class="mb-2">
        <p class="mt-1 text-[10px] w-[280px]">※送信先・タグ等が消えない場合は下記を押下してください</p>
        <Button class="p-1" label="機能の初期化" icon="pi pi-refresh" severity="contrast" raised @click="clear" />
      </div>
    </div>
  </main>
</template>

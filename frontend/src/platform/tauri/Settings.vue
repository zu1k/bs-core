<template>
  <a-button shape="circle" @click="showSettings">
    <template #icon><SettingOutlined /></template
  ></a-button>
  <a-modal
    v-model:visible="visible"
    title="设置"
    ok-text="保存"
    cancel-text="取消"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
  >
    <a-form layout="vertical">
      <a-form-item label="索引文件目录">
        <a-input v-model:value="config.index_dir" />
      </a-form-item>
      <a-form-item label="IPFS RPC 地址">
        <a-input v-model:value="config.ipfs_api_url" placeholder="http://localhost:5001/" />
      </a-form-item>
      <a-form-item label="下载目录">
        <a-input v-model:value="config.download_path" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { SettingOutlined } from '@ant-design/icons-vue';
import { invoke } from '@tauri-apps/api';

const visible = ref<boolean>(false);
const confirmLoading = ref<boolean>(false);
function showSettings() {
  visible.value = true;
}
async function handleOk() {
  confirmLoading.value = true;
  await invoke('set_config', { newConfig: config.value });
  visible.value = false;
  confirmLoading.value = false;
}

interface Config {
  index_dir: string;
  ipfs_api_url: string;
  download_path: string;
}

const config = ref<Config>({
  index_dir: '',
  ipfs_api_url: '',
  download_path: ''
});

onMounted(async () => {
  const res = await invoke('get_config');
  config.value = res as Config;
});
</script>

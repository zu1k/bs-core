<template>
  <a-layout class="layout">
    <a-page-header style="padding: 10px 30px"
        title="zLib Searcher"
    />

    <a-layout-content style="padding: 0 20px">

      <Search />
    </a-layout-content>

    <a-layout-footer style="text-align: center">
      zLib Searcher ©2022 | <a href="https://github.com/zu1k/zlib-searcher" id="source">Source Code</a>
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import Search from './components/Search.vue'
</script>

<style scoped>
</style>

<template>
  <a-layout class="layout">
    <a-page-header style="padding: 10px 30px"
        title="Book Searcher"
    />

    <a-layout-content style="padding: 0 20px">

      <Search />
    </a-layout-content>

    <a-layout-footer style="text-align: center">
      Book Searcher ©2022 Created by <a href="https://github.com/zu1k" id="author">zu1k</a> | 
      <a href="https://github.com/zu1k/book-searcher" id="source">Source Code</a>
    </a-layout-footer>
  </a-layout>
</template>

<script setup lang="ts">
import Search from './components/Search.vue'
</script>

<style scoped>
</style>

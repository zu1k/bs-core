<template>
  <div id="input">
    <a-row type="flex">
      <a-col :flex="1">
        <a-input
          v-model:value="title"
          placeholder="书名"
          allow-clear
          @input="debounce(handleSearch)"
        >
          <template #prefix>
            <BookOutlined />
          </template>
        </a-input>
      </a-col>
      <a-col :flex="1">
        <a-input
          v-model:value="author"
          placeholder="作者"
          allow-clear
          @input="debounce(handleSearch)"
        >
          <template #prefix>
            <UserOutlined />
          </template>
        </a-input>
      </a-col>
      <a-col :flex="1">
        <a-input
          v-model:value="publisher"
          placeholder="出版社"
          allow-clear
          @input="debounce(handleSearch)"
        >
          <template #prefix>
            <BankOutlined />
          </template>
        </a-input>
      </a-col>
    </a-row>
    <a-row>
      <a-col :flex="1">
        <a-input
          v-model:value="extension"
          placeholder="扩展名"
          allow-clear
          @input="debounce(handleSearch)"
        >
          <template #prefix>
            <FileTextOutlined />
          </template>
        </a-input>
      </a-col>
      <a-col :flex="1">
        <a-input
          v-model:value="language"
          placeholder="语言"
          allow-clear
          @input="debounce(handleSearch)"
        >
          <template #prefix>
            <TranslationOutlined />
          </template>
        </a-input>
      </a-col>
      <a-col :flex="1">
        <a-input
          v-model:value="isbn"
          placeholder="ISBN"
          allow-clear
          @input="debounce(handleSearch)"
        >
          <template #prefix>
            <BorderlessTableOutlined />
          </template>
        </a-input>
      </a-col>
    </a-row>
    <a-input
      v-model:value="complexQuery"
      placeholder="复杂查询"
      allow-clear
      @input="debounce(handleSearch)"
    />
  </div>

  <div id="result" style="margin-top: 20px">
    <a-table
      style="word-break: break-all"
      :dataSource="books"
      :columns="columns"
      :rowKey="(record: any) => record.id"
      :pagination="{ defaultPageSize: 20 }"
      bordered
      expandRowByClick
      :expand-icon-column-index="-1"
      size="middle"
      @resizeColumn="handleResizeColumn"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'filesize'">
          {{ getFilesize(record.filesize) }}
        </template>
        <template v-else-if="column.dataIndex === 'isbn'">
          <span>
            <a-tag v-for="isbn in record.isbn.split(',')" :key="isbn">
              {{ isbn }}
            </a-tag>
          </span>
        </template>
      </template>

      <template #expandedRowRender="{ record }">
        <a-card size="small">
          <a-row>
            <a-descriptions bordered>
              <a-descriptions-item label="id | libgen_id">{{ record.id }}</a-descriptions-item>
              <a-descriptions-item label="ISBN">{{ record.isbn }}</a-descriptions-item>
              <a-descriptions-item label="ipfs_cid">{{ record.ipfs_cid }}</a-descriptions-item>
              <a-descriptions-item label="标题">{{ record.title }}</a-descriptions-item>
              <a-descriptions-item label="作者">{{ record.author }}</a-descriptions-item>
              <a-descriptions-item label="出版社">{{ record.publisher }}</a-descriptions-item>
              <a-descriptions-item label="扩展名">{{ record.extension }}</a-descriptions-item>
              <a-descriptions-item label="文件大小">{{
                getFilesize(record.filesize)
              }}</a-descriptions-item>
              <a-descriptions-item label="页数">{{ record.pages }}</a-descriptions-item>
              <a-descriptions-item label="语言">{{ record.language }}</a-descriptions-item>
              <a-descriptions-item label="发布年份">{{ record.year }}</a-descriptions-item>
            </a-descriptions>
          </a-row>
          <a-row style="margin-top: 10px; overflow-x: scroll">
            <a-space style="width: 100px">
              <a-button
                v-for="item in ipfsGateways"
                :key="item"
                @click="downloadFromIPFS(item, record)"
                >{{ item }}</a-button
              >
              <a-button @click="downloadFromIPFS('127.0.0.1:8080', record, 'http')"
                >127.0.0.1:8080</a-button
              >
            </a-space>
          </a-row>
        </a-card>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import {
  UserOutlined,
  BookOutlined,
  TranslationOutlined,
  FileTextOutlined,
  BankOutlined,
  BorderlessTableOutlined
} from '@ant-design/icons-vue';
import { filesize } from 'filesize';
import type { TableColumnType } from 'ant-design-vue';
import { Book, useSearcher } from '../scripts/searcher';
import { createDebounce } from '../scripts/debounce';
const columns: TableColumnType<Book>[] = [
  {
    title: '书名',
    key: 'title',
    dataIndex: 'title',
    width: '20%'
  },
  {
    title: '作者',
    key: 'author',
    dataIndex: 'author',
    width: '20%'
  },
  {
    title: '出版社',
    key: 'publisher',
    dataIndex: 'publisher',
    width: '20%',
    responsive: ['xxxl', 'xxl', 'xl', 'lg', 'md']
  },
  {
    title: '扩展名',
    key: 'extension',
    dataIndex: 'extension',
    width: 40,
    align: 'center',
    responsive: ['xxxl', 'xxl', 'xl', 'lg'],
    filters: [
      {
        text: 'epub',
        value: 'epub'
      },
      {
        text: 'mobi',
        value: 'mobi'
      },
      {
        text: 'azw3',
        value: 'azw3'
      },
      {
        text: 'pdf',
        value: 'pdf'
      },
      {
        text: 'txt',
        value: 'txt'
      }
    ],
    onFilter: (value: string | number | boolean, record: Book) =>
      record.extension.indexOf(value as string) === 0
  },
  {
    title: '文件大小',
    key: 'filesize',
    dataIndex: 'filesize',
    width: 40,
    align: 'center',
    sorter: (a: Book, b: Book) => a.filesize - b.filesize,
    sortDirections: ['descend', 'ascend'],
    responsive: ['xxxl', 'xxl', 'xl', 'lg']
  },
  {
    title: '语言',
    key: 'language',
    dataIndex: 'language',
    width: 50,
    align: 'center',
    responsive: ['xxxl', 'xxl', 'xl', 'lg']
  },
  {
    title: '年份',
    key: 'year',
    dataIndex: 'year',
    width: 20,
    align: 'center',
    responsive: ['xxxl', 'xxl', 'xl', 'lg'],
    sorter: (a: Book, b: Book) => a.year - b.year,
    sortDirections: ['descend', 'ascend']
  },
  {
    title: '页数',
    key: 'pages',
    dataIndex: 'pages',
    width: 40,
    align: 'center',
    responsive: ['xxxl', 'xxl', 'xl', 'lg']
  },
  {
    title: 'ISBN',
    key: 'isbn',
    dataIndex: 'isbn',
    width: 70,
    responsive: ['xxxl', 'xxl', 'xl', 'lg']
  }
];
const complexQuery = ref<string>('');
const title = ref<string>('');
const author = ref<string>('');
const publisher = ref<string>('');
const extension = ref<string>('');
const language = ref<string>('');
const isbn = ref<string>('');
const books = ref<Book[]>([]);
const ipfsGateways: string[] = [
  'cloudflare-ipfs.com',
  'dweb.link',
  'ipfs.io',
  'gateway.pinata.cloud'
];
const searcher = useSearcher();
const debounce = createDebounce();
function handleSearch() {
  searcher?.value
    ?.handleSearch(constructQuery(), 100)
    .then((data) => {
      books.value = data;
    })
    .catch(() => {});
}
function handleResizeColumn(w: number, col: any) {
  col.width = w;
}
function getFilesize(s: number | null) {
  return typeof s === 'number' ? `${filesize(s)}` : '0';
}
function constructQuery() {
  if (complexQuery.value) {
    return complexQuery.value;
  }
  const queryParts = [
    ...title.value
      ?.split(' ')
      .filter((s) => s && s.trim())
      .map((e) => `title:"${e}"`),
    ...author.value
      ?.split(' ')
      .filter((s) => s && s.trim())
      .map((e) => `author:"${e}"`),
    ...publisher.value
      ?.split(' ')
      .filter((s) => s && s.trim())
      .map((e) => `publisher:"${e}"`),
    ...(extension.value ? [`extension:"${extension.value}"`] : []),
    ...(language.value ? [`language:"${language.value}"`] : []),
    ...(isbn.value ? [`isbn:"${isbn.value}"`] : [])
  ];
  const query = queryParts.join('');
  console.log(query);
  return query;
}
function downloadFromIPFS(gateway: string, book: Book, schema: string = 'https') {
  const downloadUrl =
    `${schema}://${gateway}/ipfs/${book.ipfs_cid}?filename=` +
    encodeURIComponent(`${book.title}_${book.author}.${book.extension}`);
  window.open(downloadUrl, '_blank');
}
</script>

<style scoped></style>
<template>
  <div id="input">
    <a-space direction="vertical">
      <a-space>
        <a-input v-model:value="title" placeholder="书名" allow-clear @input="handleSearch" @change="handleSearch" @click="handleSearch">
          <template #prefix>
            <BookOutlined />
          </template>
        </a-input>
        <a-input v-model:value="author" placeholder="作者" allow-clear @input="handleSearch" @change="handleSearch" @click="handleSearch">
          <template #prefix>
            <UserOutlined />
          </template>
        </a-input>
        <a-input v-model:value="publisher" placeholder="出版社" allow-clear @input="handleSearch" @change="handleSearch" @click="handleSearch">
          <template #prefix>
            <BankOutlined />
          </template>
        </a-input>
        <a-input v-model:value="extension" placeholder="扩展名" allow-clear @input="handleSearch" @change="handleSearch" @click="handleSearch">
          <template #prefix>
            <FileTextOutlined />
          </template>
        </a-input>
        <a-input v-model:value="language" placeholder="语言" allow-clear @input="handleSearch" @change="handleSearch" @click="handleSearch">
          <template #prefix>
            <TranslationOutlined />
          </template>
        </a-input>
        <a-input v-model:value="isbn" placeholder="ISBN" allow-clear @input="handleSearch" @change="handleSearch" @click="handleSearch">
          <template #prefix>
            <BorderlessTableOutlined />
          </template>
        </a-input>
      </a-space>
      <a-input v-model:value="query" placeholder="复杂查询" allow-clear @input="handleSearch" @change="handleSearch" @click="handleSearch"/>
    </a-space>
  </div>

  <div id="result" style="margin-top: 20px;">
      <a-table :dataSource="books" :columns="columns" :rowKey="(record: any) => record.id" 
        :pagination="{ defaultPageSize: 20 }"
        bordered expandRowByClick
        size="middle" 
        @resizeColumn="handleResizeColumn"
      >
        <template #expandedRowRender="{ record }">
          <a-card>
            <a-descriptions bordered>
              <a-descriptions-item label="zlib_id | libgen_id">{{ record.id }}</a-descriptions-item>
              <a-descriptions-item label="ISBN">{{ record.isbn }}</a-descriptions-item>
              <a-descriptions-item label="ipfs_cid">{{ record.ipfs_cid }}</a-descriptions-item>
              <a-descriptions-item label="标题">{{ record.title }}</a-descriptions-item>
              <a-descriptions-item label="作者">{{ record.author }}</a-descriptions-item>
              <a-descriptions-item label="出版社">{{ record.publisher }}</a-descriptions-item>
              <a-descriptions-item label="扩展名">{{ record.extension }}</a-descriptions-item>
              <a-descriptions-item label="文件大小">{{ record.filesize }}</a-descriptions-item>
              <a-descriptions-item label="页数">{{ record.pages }}</a-descriptions-item>
              <a-descriptions-item label="语言">{{ record.language }}</a-descriptions-item>
              <a-descriptions-item label="发布年份">{{ record.year }}</a-descriptions-item>
            </a-descriptions>
          </a-card>
        </template>
      </a-table>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { defineComponent, ref } from 'vue';
import { UserOutlined, BookOutlined, TranslationOutlined, FileTextOutlined, BankOutlined, BorderlessTableOutlined } from '@ant-design/icons-vue';


const http = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE_API,
  timeout: 5000
})

export default defineComponent({
  components: {
    UserOutlined,
    BookOutlined,
    TranslationOutlined,
    FileTextOutlined,
    BankOutlined,
    BorderlessTableOutlined
  },
  setup() {
    const query = ref<string>('');
    const title = ref<string>('');
    const author = ref<string>('');
    const publisher = ref<string>('');
    const extension = ref<string>('');
    const language = ref<string>('');
    const isbn = ref<string>('');

    const books = ref([]);

    const columns = [
        {
          title: '书名',
          key: 'title',
          dataIndex: 'title',
          width: 200,
          resizable: true,
        },
        {
          title: '作者',
          key: 'author',
          dataIndex: 'author',
          width: 200,
          resizable: true,
        },
        {
          title: '出版社',
          key: 'publisher',
          dataIndex: 'publisher',
          width: 200,
          resizable: true,
        },
        {
          title: '扩展名',
          key: 'extension',
          dataIndex: 'extension',
          width: 40,
          align: 'center',
          resizable: true,
        },
        {
          title: '文件大小',
          key: 'filesize',
          dataIndex: 'filesize',
          width: 40,
          align: 'center',
          resizable: true,
        },
        {
          title: '语言',
          key: 'language',
          dataIndex: 'language',
          width: 50,
          align: 'center',
          resizable: true,
        },
        {
          title: '年份',
          key: 'year',
          dataIndex: 'year',
          width: 20,
          align: 'center',
          resizable: true,
        },
        {
          title: '页数',
          key: 'pages',
          dataIndex: 'pages',
          width: 40,
          align: 'center',
          resizable: true,
        }
      ];

    return {
      query,
      title,
      author,
      publisher,
      extension,
      language,
      isbn,
      books,
      columns,
      handleResizeColumn: (w: number, col: any) => {
        col.width = w;
      },
    };
  },
  methods: {
    handleSearch: function () {
      http.get("search?limit=100&query=" + this.constructQuery()).then((response) => {
        this.books = response.data.books;
      }).catch(() => { });
    },
    constructQuery: function () {
      if (this.query) {
        return this.query
      }

      var query = '';
      if (this.title) {
        this.title.split(' ').forEach((e) => {
          if (e) {
            query = query + 'title:"' + e + '"';
          }
        });
      }
      if (this.author) {
        this.author.split(' ').forEach((e) => {
          if (e) {
            query = query + 'author:"' + e + '"';
          }
        });
      }
      if (this.publisher) {
        this.publisher.split(' ').forEach((e) => {
          if (e) {
            query = query + 'publisher:"' + e + '"';
          }
        });
      }
      if (this.extension) {
        query = query + 'extension:"' + this.extension + '"';
      }
      if (this.language) {
        query = query + 'language:"' + this.language + '"';
      }

      if (this.isbn) {
        query = query + 'isbn:"' + this.isbn + '"';
      }

      console.log(query);
      return query;
    }
  },
});
</script>

<style scoped>
</style>

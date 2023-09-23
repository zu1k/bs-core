import { GridItem, Icon, SimpleGrid } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {
  TbBook2,
  TbBuilding,
  TbFileDescription,
  TbHash,
  TbReportSearch,
  TbUserCircle
} from 'react-icons/tb';
import search, { Book, SearchQuery } from '../scripts/searcher';

import { IoLanguage } from 'react-icons/io5';
import SearchInput from './SearchInput';
import { useDebounce, useDebounceEffect } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';

function rmEmptyString<T extends { [s: string]: unknown }>(query: T) {
  return Object.fromEntries(Object.entries(query).filter(([_, v]) => v != '')) as T;
}

export interface SearchProps {
  pagination: {
    pageSize: number;
    pageIndex: number;
  };
  setPageCount: (pageCount: number) => void;
  setBooks: (books: Book[]) => void;
}

const Search: React.FC<SearchProps> = ({ setBooks, pagination, setPageCount }) => {
  const { t } = useTranslation();

  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [publisher, setPublisher] = useState<string>('');
  const [extension, setExtension] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [isbn, setISBN] = useState<string>('');
  const [complexQuery, setComplexQuery] = useState<string>('');

  const queryKey = useDebounce(
    rmEmptyString({
      title,
      author,
      publisher,
      extension,
      language,
      isbn,
      query: complexQuery
    }),
    { wait: 300 }
  );

  const result = useQuery({
    queryKey: ['search', { queryKey, pagination }],
    queryFn: () =>
      search({
        ...queryKey,
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize
      }),
    keepPreviousData: true
  });

  useEffect(() => {
    if (result.data) {
      const { books, total } = result.data;
      if (books != undefined) setBooks(books);
      setPageCount(Math.ceil(total / pagination.pageSize));
    }
  }, [result.data]);

  return (
    <SimpleGrid
      columns={{ sm: 1, md: 2, lg: 3 }}
      spacing={{ base: 2, md: 4 }}
      px={{ base: 4, md: 8 }}
    >
      <SearchInput
        icon={<Icon as={TbBook2} />}
        placeholder={t('book.title')}
        value={title}
        onChange={setTitle}
      />
      <SearchInput
        icon={<Icon as={TbUserCircle} />}
        placeholder={t('book.author')}
        value={author}
        onChange={setAuthor}
      />
      <SearchInput
        icon={<Icon as={TbBuilding} />}
        placeholder={t('book.publisher')}
        value={publisher}
        onChange={setPublisher}
      />
      <SearchInput
        icon={<Icon as={TbFileDescription} />}
        placeholder={t('book.extension')}
        value={extension}
        onChange={setExtension}
      />
      <SearchInput
        icon={<Icon as={IoLanguage} />}
        placeholder={t('book.language')}
        value={language}
        onChange={setLanguage}
      />
      <SearchInput
        icon={<Icon as={TbHash} />}
        placeholder={t('book.isbn')}
        value={isbn}
        onChange={setISBN}
      />
      <GridItem colSpan={{ sm: 1, md: 2, lg: 3 }}>
        <SearchInput
          icon={<Icon as={TbReportSearch} />}
          placeholder={t('search.complex')}
          value={complexQuery}
          onChange={setComplexQuery}
        />
      </GridItem>
    </SimpleGrid>
  );
};

export default Search;

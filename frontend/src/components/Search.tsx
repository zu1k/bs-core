import { GridItem, Icon, SimpleGrid } from '@chakra-ui/react';
import React, { useState } from 'react';
import {
  TbBook2,
  TbBuilding,
  TbFileDescription,
  TbHash,
  TbReportSearch,
  TbUserCircle
} from 'react-icons/tb';
import search, { Book } from '../scripts/searcher';

import { IoLanguage } from 'react-icons/io5';
import SearchInput from './SearchInput';
import { useDebounceEffect } from 'ahooks';
import { useTranslation } from 'react-i18next';

function constructQuery(parts: Record<string, string>): string {
  return Object.keys(parts)
    .map((key) =>
      parts[key]
        .split(' ')
        .filter((s) => s !== '')
        .map((s) => `${key}:"${s}"`)
    )
    .flat()
    .join('');
}

export interface SearchProps {
  setBooks: (books: Book[]) => void;
}

const Search: React.FC<SearchProps> = ({ setBooks }) => {
  const { t } = useTranslation();

  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('');
  const [publisher, setPublisher] = useState<string>('');
  const [extension, setExtension] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [isbn, setISBN] = useState<string>('');
  const [complexQuery, setComplexQuery] = useState<string>('');

  useDebounceEffect(
    () => {
      const query = complexQuery
        ? complexQuery
        : constructQuery({ title, author, publisher, extension, language, isbn });

      search(query, 100).then((books) => {
        setBooks(books);
      });
    },
    [title, author, publisher, extension, language, isbn, complexQuery],
    { wait: 300 }
  );

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

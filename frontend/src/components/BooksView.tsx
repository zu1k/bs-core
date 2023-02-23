import { Box, TableContainer, Tag } from '@chakra-ui/react';
import { FilterFn, createColumnHelper } from '@tanstack/react-table';
import React, { useContext } from 'react';
import { filesize as formatFileSize } from 'filesize';
import { useTranslation } from 'react-i18next';

import DataTable from './DataTable';
import RootContext from '../store';
import { Book } from '../scripts/searcher';
import getIpfsGateways from '../scripts/ipfs';

import BookDetailView from './BookDetailView';

const columnHelper = createColumnHelper<Book>();

const colorSchemes = [
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'cyan',
  'purple',
  'pink',
  'gray'
];

const arrFilter: FilterFn<Book> = (row, columnId, filterValue: string[]) => {
  if (!filterValue.length) return true;
  const value: string = row.getValue(columnId);
  return filterValue.includes(value);
};

export interface BooksViewProps {
  books: Book[];
}

const BooksView: React.FC<BooksViewProps> = ({ books }) => {
  const { t } = useTranslation();
  const rootContext = useContext(RootContext);

  React.useEffect(() => {
    getIpfsGateways().then((gateways) => {
      rootContext.setIpfsGateways(gateways);
    });
  }, []);

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('title', {
        header: t('book.title') ?? 'Title',
        sortingFn: 'text',
        enableColumnFilter: false,
        meta: { width: '30%' }
      }),
      columnHelper.accessor('author', {
        header: t('book.author') ?? 'Author',
        sortingFn: 'text',
        enableColumnFilter: false,
        meta: { width: '15%' }
      }),
      columnHelper.accessor('publisher', {
        header: t('book.publisher') ?? 'Publisher',
        sortingFn: 'text',
        sortUndefined: 1,
        enableColumnFilter: false,
        meta: { width: '15%', breakpoint: 'md' }
      }),
      columnHelper.accessor(
        'extension',
        (() => {
          const renderer = (value: string) => {
            const extension = value;
            const colorScheme = colorSchemes[extension.charCodeAt(0) % colorSchemes.length];
            return <Tag colorScheme={colorScheme}>{extension}</Tag>;
          };
          return {
            header: t('book.extension') ?? 'Extension',
            cell: (cell) => renderer(cell.getValue()),
            enableSorting: false,
            filterFn: arrFilter,
            meta: { breakpoint: 'lg', filterRenderer: renderer }
          };
        })()
      ),
      columnHelper.accessor('filesize', {
        header: t('book.filesize') ?? 'Filesize',
        cell: (cell) => {
          const filesize = cell.getValue();
          return <Box>{formatFileSize(filesize) as string}</Box>;
        },
        enableColumnFilter: false,
        meta: { breakpoint: 'lg' }
      }),
      columnHelper.accessor(
        'language',
        (() => {
          const renderer = (value: string) => {
            const language = value.toLocaleLowerCase().trim();
            const colorScheme = colorSchemes[language.length % colorSchemes.length];
            return (
              <Tag colorScheme={colorScheme} textTransform="capitalize" minW="fit-content">
                {language}
              </Tag>
            );
          };
          return {
            header: t('book.language') ?? 'Language',
            cell: (cell) => renderer(cell.getValue()),
            enableSorting: false,
            filterFn: arrFilter,
            meta: { width: 'max-content', breakpoint: 'lg', filterRenderer: renderer }
          };
        })()
      ),
      columnHelper.accessor('year', {
        header: t('book.year') ?? 'Year',
        cell: (cell) => {
          const year = cell.getValue();
          return year ? year : '';
        },
        sortUndefined: 1,
        enableColumnFilter: false,
        meta: { breakpoint: 'xl' }
      }),
      columnHelper.accessor('pages', {
        header: t('book.pages') ?? 'Pages',
        cell: (cell) => {
          const pages = cell.getValue();
          return pages ? pages : '';
        },
        sortUndefined: 1,
        enableColumnFilter: false,
        meta: { breakpoint: 'xl' }
      })
    ],
    [t]
  );

  const data = books.map((book) => ({
    ...book,
    publisher: book.publisher ? book.publisher : undefined,
    year: book.year ? book.year : undefined,
    pages: book.pages ? book.pages : undefined
  }));

  const extensions = [...new Set(books.map((book) => book.extension.toLowerCase()))].sort();
  const languages = [...new Set(books.map((book) => book.language.toLowerCase()))].sort();

  return (
    <TableContainer px={{ base: 4, md: 8 }} my={{ base: 2, md: 4 }} overflowY="unset">
      <DataTable
        data={data}
        columns={columns}
        pageSize={20}
        filterSchema={{ extension: extensions, language: languages }}
        sx={{ tableLayout: 'fixed' }}
        renderSubComponent={(row) => <BookDetailView row={row} />}
      />
    </TableContainer>
  );
};

export default BooksView;

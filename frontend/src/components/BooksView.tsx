import {
  Box,
  TableContainer,
  Tag,
  Image,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody
} from '@chakra-ui/react';
import { FilterFn, createColumnHelper } from '@tanstack/react-table';
import React, { useContext } from 'react';
import { filesize as formatFileSize } from 'filesize';
import { useTranslation } from 'react-i18next';
import MediaQuery from 'react-responsive';

import DataTable, { type OnPaginationChange, type PaginationState } from './DataTable';
import BookCardList from './BookCardList';
import RootContext from '../store';
import { Book } from '../scripts/searcher';

import BookDetailView from './BookDetailCard';
import { getCoverImageUrl, getMd5CoverImageUrl, white_pic } from '../scripts/cover';
import IpfsDownloadButton from './IpfsDownloadButton';

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
  pagination: PaginationState;
  setPagination: OnPaginationChange;
  pageCount: number;
}

const BooksView: React.FC<BooksViewProps> = ({ books, pagination, setPagination, pageCount }) => {
  const { t } = useTranslation();
  const rootContext = useContext(RootContext);

  const columns = [
    columnHelper.accessor('cover_url', {
      header: '',
      cell: (cell) => {
        const cover = cell.getValue();
        const md5 = cell.row.original.md5;
        return (
          <Popover
            trigger="hover"
            closeDelay={0}
            openDelay={0}
            placement="right"
            autoFocus={false}
            matchWidth={true}
          >
            <PopoverTrigger>
              <Image
                referrerPolicy="no-referrer"
                htmlWidth="70%"
                src={getCoverImageUrl(cover)}
                onError={({ currentTarget }) => {
                  currentTarget.src = getMd5CoverImageUrl(md5);
                  currentTarget.onerror = () => {
                    currentTarget.style.display = 'none';
                    currentTarget.src = white_pic;
                  };
                }}
              />
            </PopoverTrigger>
            <PopoverContent width="fit-content">
              <PopoverArrow />
              <PopoverBody width="200px" padding={[0, 0]}>
                <Image
                  htmlWidth="200px"
                  referrerPolicy="no-referrer"
                  src={getCoverImageUrl(cover)}
                  onError={({ currentTarget }) => {
                    currentTarget.src = getMd5CoverImageUrl(md5);
                    currentTarget.onerror = () => {
                      currentTarget.style.display = 'none';
                      currentTarget.src = white_pic;
                    };
                  }}
                />
              </PopoverBody>
            </PopoverContent>
          </Popover>
        );
      },
      enableColumnFilter: false,
      enableSorting: false,
      meta: { width: '30px', breakpoint: 'md' }
    }),
    columnHelper.accessor('title', {
      header: t('book.title') ?? 'Title',
      sortingFn: 'text',
      enableColumnFilter: false,
      meta: { width: '25%' }
    }),
    columnHelper.accessor('author', {
      header: t('book.author') ?? 'Author',
      sortingFn: 'text',
      enableColumnFilter: false,
      meta: { width: '17%' }
    }),
    columnHelper.accessor('publisher', {
      header: t('book.publisher') ?? 'Publisher',
      sortingFn: 'text',
      sortUndefined: 1,
      enableColumnFilter: false,
      meta: {
        width: {
          xl: '18%',
          lg: '12%'
        },
        breakpoint: 'md'
      }
    }),
    columnHelper.accessor(
      'extension',
      (() => {
        const renderer = (value: string) => {
          const extension = value;
          const colorScheme = colorSchemes[extension.charCodeAt(0) % colorSchemes.length];
          return (
            <Tag colorScheme={colorScheme} minW="max-content">
              {extension}
            </Tag>
          );
        };
        return {
          header: t('book.extension') ?? 'Extension',
          cell: (cell) => renderer(cell.getValue()),
          enableSorting: false,
          filterFn: arrFilter,
          meta: { breakpoint: 'md', filterRenderer: renderer }
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
      meta: {
        breakpoint: 'lg'
      }
    }),
    columnHelper.accessor(
      'language',
      (() => {
        const renderer = (value: string) => {
          const language = value.toLocaleLowerCase().trim();
          const colorScheme = colorSchemes[language.length % colorSchemes.length];
          return (
            <Tag colorScheme={colorScheme} textTransform="capitalize" minW="max-content">
              {language}
            </Tag>
          );
        };
        return {
          header: t('book.language') ?? 'Language',
          cell: (cell) => renderer(cell.getValue()),
          enableSorting: false,
          filterFn: arrFilter,
          meta: {
            breakpoint: 'md',
            filterRenderer: renderer
          }
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
      meta: { breakpoint: '2xl' }
    }),
    columnHelper.accessor('pages', {
      header: t('book.pages') ?? 'Pages',
      cell: (cell) => {
        const pages = cell.getValue();
        return pages ? pages : '';
      },
      sortUndefined: 1,
      enableColumnFilter: false,
      meta: { breakpoint: '2xl' }
    }),
    columnHelper.accessor(
      'ipfs_cid',
      (() => {
        const renderer = (book: Book) => {
          return book.ipfs_cid != undefined &&
            book.ipfs_cid.length > 0 &&
            rootContext.ipfsGateways.length > 0 ? (
            <IpfsDownloadButton book={book} onlyIcon></IpfsDownloadButton>
          ) : null;
        };
        return {
          header: '',
          cell: (cell) => renderer(cell.row.original),
          enableSorting: false,
          enableColumnFilter: false,
          meta: {
            width: {
              xl: '90px',
              lg: '60px',
              md: '40px'
            },
            breakpoint: 'md'
          }
        };
      })()
    )
  ];

  const data = books.map((book) => ({
    ...book,
    publisher: book.publisher ? book.publisher : undefined,
    year: book.year ? book.year : undefined,
    pages: book.pages ? book.pages : undefined
  }));

  const extensions = [...new Set(books.map((book) => book.extension.toLowerCase()))].sort();
  const languages = [...new Set(books.map((book) => book.language.toLowerCase()))].sort();

  return (
    <>
      <MediaQuery minWidth={900}>
        <TableContainer px={{ base: 4, md: 8 }} my={{ base: 2, md: 4 }} overflowY="unset">
          <DataTable
            data={data}
            columns={columns}
            pagination={pagination}
            setPagination={setPagination}
            pageCount={pageCount}
            filterSchema={{ extension: extensions, language: languages }}
            sx={{ tableLayout: 'fixed' }}
            renderSubComponent={(row) => <BookDetailView book={row.original} />}
          />
        </TableContainer>
      </MediaQuery>
      <MediaQuery maxWidth={899}>
        <BookCardList
          px={{ base: 4, md: 8 }}
          my={{ base: 2, md: 4 }}
          data={data}
          columns={columns}
          pagination={pagination}
          setPagination={setPagination}
          pageCount={pageCount}
          filterSchema={{ extension: extensions, language: languages }}
          renderSubComponent={(row) => <BookDetailView book={row.original} />}
        />
      </MediaQuery>
    </>
  );
};

export default BooksView;

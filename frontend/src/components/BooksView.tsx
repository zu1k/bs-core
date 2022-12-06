import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Flex,
  GridItem,
  Heading,
  Icon,
  Link,
  SimpleGrid,
  TableContainer,
  Tag,
  Text
} from '@chakra-ui/react';
import { FilterFn, createColumnHelper } from '@tanstack/react-table';

import { Book } from '../scripts/searcher';
import DataTable from './DataTable';
import ExternalLink from './ExternalLink';
import React from 'react';
import { TbChevronUp } from 'react-icons/tb';
import { filesize as formatFileSize } from 'filesize';
import { useTranslation } from 'react-i18next';

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

const ipfsGateways: string[] = [
  'cloudflare-ipfs.com',
  'dweb.link',
  'ipfs.io',
  'gateway.pinata.cloud'
];

function downloadLinkFromIPFS(gateway: string, book: Book, schema: string = 'https') {
  return (
    `${schema}://${gateway}/ipfs/${book.ipfs_cid}?filename=` +
    encodeURIComponent(`${book.title}_${book.author}.${book.extension}`)
  );
}

interface DescriptionProps {
  name: string;
  children: React.ReactNode;
}

const Description: React.FC<DescriptionProps> = ({ name, children }) => {
  return (
    <Text whiteSpace="normal" wordBreak="break-all">
      <Text as="span" fontWeight="bold">
        {name}
      </Text>
      <Text as="span">{children}</Text>
    </Text>
  );
};

export interface BooksViewProps {
  books: Book[];
}

const BooksView: React.FC<BooksViewProps> = ({ books }) => {
  const { t } = useTranslation();

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
              <Tag colorScheme={colorScheme} textTransform="capitalize">
                {language}
              </Tag>
            );
          };
          return {
            header: t('book.language') ?? 'Language',
            cell: (cell) => renderer(cell.getValue()),
            enableSorting: false,
            filterFn: arrFilter,
            meta: { breakpoint: 'lg', filterRenderer: renderer }
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
        renderSubComponent={(row) => {
          const {
            id,
            title,
            author,
            publisher,
            extension,
            filesize,
            language,
            year,
            pages,
            isbn,
            ipfs_cid
          } = row.original;
          return (
            <Card mt={{ base: 1, md: 2 }} mb={{ base: 2, md: 4 }} mx={{ base: 4, md: 8 }}>
              <CardHeader>
                <Heading as="h3" fontSize="xl">
                  {title}
                </Heading>
              </CardHeader>
              <Divider />
              <CardBody>
                <SimpleGrid columns={{ sm: 1, md: 3, lg: 4 }} spacing={{ base: 2, md: 4 }}>
                  <Description name={`${t('book.id') ?? 'zlib/libgen id'}: `}>{id}</Description>
                  <GridItem colSpan={{ sm: 1, md: 2, lg: 3 }}>
                    <Description name={`${t('book.ipfs_cid') ?? 'IPFS CID'}: `}>
                      {ipfs_cid}
                    </Description>
                  </GridItem>
                  <Description name={`${t('book.author') ?? 'Author'}: `}>{author}</Description>
                  <Description name={`${t('book.publisher') ?? 'Publisher'}: `}>
                    {publisher || t('book.unknown') || 'Unknown'}
                  </Description>
                  <Description name={`${t('book.extension') ?? 'Extension'}: `}>
                    {extension}
                  </Description>
                  <Description name={`${t('book.filesize') ?? 'Filesize'}: `}>
                    {formatFileSize(filesize) as string}
                  </Description>
                  <Description name={`${t('book.language') ?? 'Language'}: `}>
                    <Text as="span" textTransform="capitalize">
                      {language}
                    </Text>
                  </Description>
                  <Description name={`${t('book.year') ?? 'Year'}: `}>
                    {year || t('book.unknown') || 'Unknown'}
                  </Description>
                  <Description name={`${t('book.pages') ?? 'Pages'}: `}>
                    {pages || t('book.unknown') || 'Unknown'}
                  </Description>
                  <Description name={`${t('book.isbn') ?? 'ISBN'}: `}>
                    {isbn || t('book.unknown') || 'Unknown'}
                  </Description>
                </SimpleGrid>
              </CardBody>
              <CardFooter flexDirection="column">
                <SimpleGrid columns={{ sm: 2, md: 3, lg: 4, xl: 5 }} spacing={{ base: 2, md: 4 }}>
                  {ipfsGateways.map((gateway) => (
                    <Button
                      as={ExternalLink}
                      href={downloadLinkFromIPFS(gateway, row.original)}
                      key={gateway}
                      variant="outline"
                    >
                      {gateway}
                    </Button>
                  ))}
                  <Button
                    as={ExternalLink}
                    href={downloadLinkFromIPFS('localhost:8080', row.original, 'http')}
                    variant="outline"
                  >
                    localhost:8080
                  </Button>
                </SimpleGrid>
                <Flex justify="flex-end">
                  <Button
                    variant="unstyled"
                    onClick={() => row.toggleExpanded(false)}
                    color="gray.500"
                    mt={2}
                    mb={-2}
                  >
                    {t('table.collaspe')}
                    <Icon as={TbChevronUp} boxSize={4} position="relative" top={0.5} left={1} />
                  </Button>
                </Flex>
              </CardFooter>
            </Card>
          );
        }}
      />
    </TableContainer>
  );
};

export default BooksView;

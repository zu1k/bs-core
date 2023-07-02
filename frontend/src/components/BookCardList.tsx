import React, { useEffect } from 'react';
import {
  Collapse,
  Flex,
  Icon,
  IconButton,
  IconButtonProps,
  TableProps,
  Text,
  useColorMode,
  Card,
  CardHeader,
  Image,
  Box,
  CardBody,
  Stack,
  Tag
} from '@chakra-ui/react';
import {
  type ColumnDef,
  type PaginationState,
  type Row,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel
} from '@tanstack/react-table';
import { TbChevronLeft, TbChevronRight, TbChevronsLeft, TbChevronsRight } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import { Book } from '../scripts/searcher';
import { filesize as formatFileSize } from 'filesize';
import getCoverImageUrl from '../scripts/cover';

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

const rendererExtension = (value: string) => {
  const colorScheme = colorSchemes[value.charCodeAt(0) % colorSchemes.length];
  return <Tag colorScheme={colorScheme}>{value}</Tag>;
};

const rendererLanguage = (value: string) => {
  const colorScheme = colorSchemes[value.length % colorSchemes.length];
  return <Tag colorScheme={colorScheme}>{value}</Tag>;
};

export interface BookCardListProps<Data extends object> extends TableProps {
  data: Data[];
  columns: ColumnDef<Data, any>[];
  pageSize?: number;
  filterSchema?: { [K in keyof Data]?: Data[K][] };
  renderSubComponent: (row: Row<Data>) => React.ReactNode;
}

export default function BookCardList<Data extends object>({
  data,
  columns,
  pageSize = 20,
  filterSchema = {},
  renderSubComponent,
  ...props
}: BookCardListProps<Data>) {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageSize,
    pageIndex: 0
  });

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination
    },

    enableHiding: true,

    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    enableExpanding: true,
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),

    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination
  });

  useEffect(() => {
    table.resetExpanded();
  }, [data]);

  const rows = table.getRowModel().rows.map((row) => {
    return {
      row: row,
      book: row.original as Book
    };
  });

  return (
    <Box {...props}>
      {rows.map(({ row, book }) => (
        <React.Fragment key={row.id}>
          <Card
            backgroundColor={'transparent'}
            mt={{ base: 0, md: 2 }}
            mb={{ base: 2, md: 4 }}
            onClick={row.getToggleExpandedHandler()}
            direction="row"
            overflow="hidden"
          >
            <Image
              referrerPolicy="no-referrer"
              width="auto"
              maxW="min(24%, 100px)"
              objectFit="cover"
              src={getCoverImageUrl(book.cover_url)}
              onError={(event) => {
                (event.target as HTMLImageElement).style.display = 'none';
              }}
            />

            <CardBody alignSelf="center">
              <Text marginBottom={2} fontSize="lg" noOfLines={2}>
                {book.title}
              </Text>

              <Text marginBottom={2} color={'gray.500'} fontSize="xs" noOfLines={2}>
                {book.author.length > 0 ? book.author : ''}
                {book.author.length > 0 && book.publisher != undefined ? ' - ' : ''}
                {book.publisher != undefined ? book.publisher : ''}
              </Text>
              <div>
                {rendererExtension(book.extension)} {rendererLanguage(book.language)}{' '}
                {formatFileSize(book.filesize) as string}
              </div>
            </CardBody>
          </Card>

          <Collapse in={row.getIsExpanded()} animateOpacity unmountOnExit>
            {renderSubComponent(row)}
          </Collapse>
        </React.Fragment>
      ))}

      {data.length === 0 && (
        <Flex mt={16} mb={12} justifyContent="center">
          <Text color={colorMode === 'light' ? 'gray.400' : 'gray.600'}>{t('table.no_data')}</Text>
        </Flex>
      )}
      <Flex w="full" mt={4} mr={2} justify="flex-end" wrap="wrap">
        <IconButton
          aria-label={t('table.first_page')}
          title={t('table.first_page') ?? ''}
          icon={<Icon as={TbChevronsLeft} />}
          mr={1}
          display={{ base: 'none', md: 'inline-flex' }}
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        />
        <IconButton
          aria-label={t('table.previous_page')}
          title={t('table.previous_page') ?? ''}
          icon={<Icon as={TbChevronLeft} />}
          mr={1}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        />
        {Array.from({ length: table.getPageCount() }, (_, i) => i).map((pageIndex) => {
          const title = t('table.page', { page: pageIndex + 1 });
          const disabled = pagination.pageIndex === pageIndex;
          const style: Partial<IconButtonProps> = disabled ? { colorScheme: 'blue' } : {};
          return (
            <IconButton
              aria-label={title}
              title={title}
              key={pageIndex}
              icon={<Text>{pageIndex + 1}</Text>}
              mr={1}
              onClick={() => table.setPageIndex(pageIndex)}
              disabled={disabled}
              {...style}
            />
          );
        })}
        <IconButton
          aria-label={t('table.next_page')}
          title={t('table.next_page') ?? ''}
          icon={<Icon as={TbChevronRight} />}
          mr={{ base: 0, md: 1 }}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        />
        <IconButton
          aria-label={t('table.last_page')}
          title={t('table.last_page') ?? ''}
          icon={<Icon as={TbChevronsRight} />}
          display={{ base: 'none', md: 'inline-flex' }}
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        />
      </Flex>
    </Box>
  );
}

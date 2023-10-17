import React, { useEffect } from 'react';
import {
  Collapse,
  Flex,
  TableProps,
  Text,
  useColorMode,
  Card,
  Image,
  Box,
  CardBody,
  Tag,
  Spacer,
  Center
} from '@chakra-ui/react';
import {
  type ColumnDef,
  type PaginationState,
  type Row,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { Book } from '../scripts/searcher';
import { filesize as formatFileSize } from 'filesize';
import { getCoverImageUrl, getMd5CoverImageUrl, white_pic } from '../scripts/cover';
import { OnPaginationChange } from './DataTable';
import Pagination from './Pagination';
import getColorScheme from '../data/color';
import IpfsDownloadButton from './IpfsDownloadButton';
import RootContext from '../store';
import MediaQuery from 'react-responsive';

const rendererTag = (value: string) => {
  return <Tag colorScheme={getColorScheme(value)}>{value}</Tag>;
};

export interface BookCardListProps<Data extends object> extends TableProps {
  data: Data[];
  columns: ColumnDef<Data, any>[];
  pagination: PaginationState;
  setPagination: OnPaginationChange;
  pageCount: number;
  filterSchema?: { [K in keyof Data]?: Data[K][] };
  renderSubComponent: (row: Row<Data>) => React.ReactNode;
}

export default function BookCardList<Data extends object>({
  data,
  columns,
  pagination,
  setPagination,
  pageCount,
  filterSchema = {},
  renderSubComponent,
  ...props
}: BookCardListProps<Data>) {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const rootContext = React.useContext(RootContext);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination
    },
    pageCount,

    enableHiding: true,

    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),

    enableExpanding: true,
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),

    manualPagination: true,
    // getPaginationRowModel: getPaginationRowModel(),
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
              onError={({ currentTarget }) => {
                currentTarget.src = getMd5CoverImageUrl(book.md5);
                currentTarget.onerror = () => {
                  currentTarget.style.display = 'none';
                  currentTarget.src = white_pic;
                };
              }}
            />

            <CardBody alignSelf="center">
              <Flex>
                <Box>
                  <Text marginBottom={2} fontSize="lg" noOfLines={2}>
                    {book.title}
                  </Text>

                  <Text marginBottom={2} color={'gray.500'} fontSize="xs" noOfLines={2}>
                    {book.author.length > 0 ? book.author : ''}
                    {book.author.length > 0 && book.publisher != undefined ? ' - ' : ''}
                    {book.publisher != undefined ? book.publisher : ''}
                  </Text>
                  <div>
                    {rendererTag(book.extension)} {rendererTag(book.language)}{' '}
                    {formatFileSize(book.filesize) as string}
                  </div>
                </Box>

                <Spacer />

                <MediaQuery minWidth={600}>
                  <Center width="80px" justifyContent="center">
                    {book.ipfs_cid != undefined &&
                    book.ipfs_cid.length > 0 &&
                    rootContext.ipfsGateways.length > 0 ? (
                      <IpfsDownloadButton book={book} onlyIcon></IpfsDownloadButton>
                    ) : null}
                  </Center>
                </MediaQuery>
              </Flex>
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
      <Pagination
        w="full"
        mt={4}
        mr={2}
        pageCount={table.getPageCount()}
        pageIndex={pagination.pageIndex}
        setPageIndex={table.setPageIndex}
        canPreviousPage={table.getCanPreviousPage()}
        previousPage={table.previousPage}
        canNextPage={table.getCanNextPage()}
        nextPage={table.nextPage}
      />
    </Box>
  );
}

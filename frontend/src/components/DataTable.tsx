import React, { useCallback, useEffect } from 'react';
import {
  Collapse,
  Flex,
  Icon,
  IconButton,
  Table,
  TableProps,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useBreakpoint,
  MenuButton,
  Menu,
  MenuList,
  Portal,
  MenuOptionGroup,
  MenuItemOption,
  useColorMode
} from '@chakra-ui/react';
import {
  type ColumnDef,
  type Row,
  type RowData,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  // getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
  OnChangeFn
} from '@tanstack/react-table';
import { TbArrowNarrowDown, TbArrowNarrowUp, TbArrowsSort, TbFilter } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import Pagination from './Pagination';
type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    isNumeric?: boolean;
    width?: number | string | Partial<Record<Breakpoint, number | string>>;
    filterRenderer?: (value: string) => JSX.Element;
    breakpoint?: Breakpoint;
  }
}

const breakpoints = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];

function compareBreakpoints(a: Breakpoint, b: Breakpoint) {
  return breakpoints.indexOf(a) >= breakpoints.indexOf(b);
}

export type PaginationState = {
  pageSize: number;
  pageIndex: number;
};
export type OnPaginationChange = OnChangeFn<PaginationState>;

export interface DataTableProps<Data extends object> extends TableProps {
  data: Data[];
  columns: ColumnDef<Data, any>[];
  pagination: PaginationState;
  setPagination: OnPaginationChange;
  pageCount: number;
  filterSchema?: { [K in keyof Data]?: Data[K][] };
  renderSubComponent: (row: Row<Data>) => React.ReactNode;
}

export default function DataTable<Data extends object>({
  data,
  columns,
  pagination,
  setPagination,
  pageCount,
  filterSchema = {},
  renderSubComponent,
  ...props
}: DataTableProps<Data>) {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

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

  const breakpoint = useBreakpoint() as Breakpoint;

  useEffect(() => {
    table.resetExpanded();

    table.getAllColumns().forEach((column) => {
      const meta = column.columnDef.meta;
      if (meta && compareBreakpoints(breakpoint, meta.breakpoint ?? 'base'))
        column.toggleVisibility(true);
      else column.toggleVisibility(false);
    });
  }, [breakpoint, data]);

  const getColumnWidth = useCallback(
    (
      width: string | number | Partial<Record<Breakpoint, string | number>> | undefined,
      breakpoint: Breakpoint
    ) => {
      if (typeof width === 'number' || typeof width === 'string') return width;
      if (typeof width === 'object') {
        const breakpointIndex = breakpoints.indexOf(breakpoint);
        const widthBreakpoints = Object.keys(width).sort(
          (a, b) => breakpoints.indexOf(b) - breakpoints.indexOf(a)
        ) as Breakpoint[];
        const widthBreakpoint = widthBreakpoints.find(
          (bp) => breakpoints.indexOf(bp) <= breakpointIndex
        );
        if (widthBreakpoint) return width[widthBreakpoint];
      }
      return 'auto';
    },
    []
  );

  return (
    <>
      <Table {...props}>
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta;
                return header.column.getIsVisible() ? (
                  <Th
                    key={header.id}
                    w={getColumnWidth(meta?.width, breakpoint)}
                    isNumeric={meta?.isNumeric ?? false}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}

                    {header.column.getCanSort() ? (
                      <Text as="span" pl={2} position="relative" top={0.5}>
                        {header.column.getIsSorted() ? (
                          header.column.getIsSorted() === 'desc' ? (
                            <IconButton
                              aria-label={t('table.sort_desc') ?? ''}
                              title={t('table.sort_desc') ?? ''}
                              icon={<Icon as={TbArrowNarrowDown} />}
                              variant="unstyled"
                              size="xs"
                              onClick={header.column.getToggleSortingHandler()}
                            />
                          ) : (
                            <IconButton
                              aria-label={t('table.sort_asc') ?? ''}
                              title={t('table.sort_asc') ?? ''}
                              icon={<Icon as={TbArrowNarrowUp} />}
                              variant="unstyled"
                              size="xs"
                              onClick={header.column.getToggleSortingHandler()}
                            />
                          )
                        ) : (
                          <IconButton
                            aria-label={t('table.not_sorted') ?? ''}
                            title={t('table.not_sorted') ?? ''}
                            icon={<Icon as={TbArrowsSort} />}
                            variant="unstyled"
                            size="xs"
                            onClick={header.column.getToggleSortingHandler()}
                          />
                        )}
                      </Text>
                    ) : null}

                    {header.column.getCanFilter() ? (
                      <Text as="span" pl={2} position="relative" top={0.5}>
                        <Menu closeOnSelect={false}>
                          <MenuButton
                            aria-label={t('table.filter') ?? ''}
                            title={t('table.filter') ?? ''}
                            as={IconButton}
                            type="button"
                            icon={<Icon as={TbFilter} />}
                            variant="unstyled"
                            size="xs"
                          />
                          <Portal>
                            <MenuList>
                              <MenuOptionGroup
                                type="checkbox"
                                onChange={header.column.setFilterValue}
                              >
                                {filterSchema[header.column.id as keyof Data]?.map((val, i) => {
                                  const value = `${val}`;
                                  return (
                                    <MenuItemOption value={value} key={i}>
                                      {meta?.filterRenderer ? meta.filterRenderer(value) : value}
                                    </MenuItemOption>
                                  );
                                })}
                              </MenuOptionGroup>
                            </MenuList>
                          </Portal>
                        </Menu>
                      </Text>
                    ) : null}
                  </Th>
                ) : null;
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map((row) => (
            <React.Fragment key={row.id}>
              <Tr onClick={row.getToggleExpandedHandler()}>
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta;
                  return cell.column.getIsVisible() ? (
                    <Td
                      key={cell.id}
                      isNumeric={meta?.isNumeric ?? false}
                      borderBottom="none"
                      overflow="hidden"
                      padding={
                        cell.column.id == 'cover_url' || cell.column.id == 'ipfs_cid'
                          ? '0'
                          : undefined
                      }
                      textOverflow={cell.id.endsWith('title') ? 'ellipsis' : 'hidden'}
                      title={(cell.getValue() as any)?.toString()}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Td>
                  ) : null;
                })}
              </Tr>
              <Tr>
                <Td colSpan={row.getVisibleCells().length} p={0}>
                  <Collapse in={row.getIsExpanded()} animateOpacity unmountOnExit>
                    {renderSubComponent(row)}
                  </Collapse>
                </Td>
              </Tr>
            </React.Fragment>
          ))}
        </Tbody>
      </Table>
      {data.length === 0 && (
        <Flex mt={16} mb={12} justifyContent="center" minH="200px">
          <Text color={colorMode === 'light' ? 'gray.400' : 'gray.600'}>{t('table.no_data')}</Text>
        </Flex>
      )}
      <Pagination
        w="full"
        mt={4}
        pageCount={table.getPageCount()}
        pageIndex={pagination.pageIndex}
        setPageIndex={table.setPageIndex}
        canPreviousPage={table.getCanPreviousPage()}
        previousPage={table.previousPage}
        canNextPage={table.getCanNextPage()}
        nextPage={table.nextPage}
      />
    </>
  );
}

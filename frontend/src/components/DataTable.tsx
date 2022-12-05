import * as React from 'react';

import {
  Collapse,
  Flex,
  Icon,
  IconButton,
  IconButtonProps,
  Spacer,
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
  useColorMode,
  Box
} from '@chakra-ui/react';
import {
  type ColumnDef,
  type PaginationState,
  type Row,
  type RowData,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel
} from '@tanstack/react-table';
import {
  TbArrowNarrowDown,
  TbArrowNarrowUp,
  TbArrowsSort,
  TbChevronLeft,
  TbChevronRight,
  TbChevronsLeft,
  TbChevronsRight,
  TbFilter
} from 'react-icons/tb';
import { useTranslation } from 'react-i18next';

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    isNumeric?: boolean;
    width?: number | string;
    filterRenderer?: (value: string) => JSX.Element;
    breakpoint?: 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  }
}

const breakpoints = ['base', 'sm', 'md', 'lg', 'xl', '2xl'];

function compareBreakpoints(a: string, b: string) {
  return breakpoints.indexOf(a) >= breakpoints.indexOf(b);
}

export interface DataTableProps<Data extends object> extends TableProps {
  data: Data[];
  columns: ColumnDef<Data, any>[];
  pageSize?: number;
  filterSchema?: { [K in keyof Data]?: Data[K][] };
  renderSubComponent: (row: Row<Data>) => React.ReactNode;
}

export default function DataTable<Data extends object>({
  data,
  columns,
  pageSize = 20,
  filterSchema = {},
  renderSubComponent,
  ...props
}: DataTableProps<Data>) {
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

  const breakpoint = useBreakpoint();

  React.useEffect(() => {
    table.getAllColumns().forEach((column) => {
      const meta = column.columnDef.meta;
      if (meta && compareBreakpoints(breakpoint, meta.breakpoint ?? 'base'))
        column.toggleVisibility(true);
      else column.toggleVisibility(false);
    });
  }, [breakpoint]);

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
                    w={meta?.width ?? 'auto'}
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
                      textOverflow="ellipsis"
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
        <Flex mt={16} mb={12} justifyContent="center">
          <Text color={colorMode === 'light' ? 'gray.400' : 'gray.600'}>{t('table.no_data')}</Text>
        </Flex>
      )}
      <Flex w="full" mt={4} justify="flex-end" wrap="wrap">
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
    </>
  );
}

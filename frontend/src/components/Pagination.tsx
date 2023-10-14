import {
  Flex,
  IconButtonProps,
  FlexProps,
  NumberInput,
  NumberInputField,
  Button
} from '@chakra-ui/react';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'react-responsive';

export interface PaginationProps extends FlexProps {
  pageCount: number;

  pageIndex: number;
  setPageIndex: (pageIndex: number) => void;

  canPreviousPage: boolean;
  previousPage: () => void;

  canNextPage: boolean;
  nextPage: () => void;
}

export default function Pagination({
  pageCount,
  pageIndex,
  setPageIndex,
  canPreviousPage,
  previousPage,
  canNextPage,
  nextPage,
  ...props
}: PaginationProps) {
  const { t } = useTranslation();
  const jumpToPageInput = useRef<HTMLInputElement>(null);
  const isSmallScreen = useMediaQuery({ query: '(max-width: 700px)' });
  const isBigScreen = useMediaQuery({ query: '(min-width: 1200px)' });
  const pageButtonSidecount = isBigScreen ? 3 : isSmallScreen ? 1 : 2;

  if (pageCount === 0) return <Flex {...props} gap={1} justify="flex-end" wrap="wrap" />;

  function genPageButtonList(pageIdx: number): number[] {
    const start = pageIdx > pageButtonSidecount ? pageIdx - pageButtonSidecount : 0;
    const end =
      pageIdx < pageCount - pageButtonSidecount ? pageIdx + pageButtonSidecount : pageCount - 1;
    const sequence: number[] = [...Array.from({ length: end - start + 1 }, (_, i) => i + start)];
    return sequence;
  }

  return (
    <Flex {...props} gap={1} justify="flex-end" wrap="wrap">
      <Button
        display={pageIndex < pageButtonSidecount + 1 ? 'none' : 'inline-flex'}
        title={t('table.first_page') ?? ''}
        size="sm"
        onClick={() => setPageIndex(0)}
        disabled={!canPreviousPage}
      >
        {1}
      </Button>
      {genPageButtonList(pageIndex).map((idx) => {
        const title = t('table.page', { page: idx + 1 });
        const disabled = pageIndex === idx;
        const style: Partial<IconButtonProps> = disabled ? { colorScheme: 'blue' } : {};
        return (
          <Button
            aria-label={title}
            title={title}
            key={idx}
            onClick={() => setPageIndex(idx)}
            disabled={disabled}
            spacing="0"
            size="sm"
            {...style}
          >
            {idx + 1}
          </Button>
        );
      })}
      <Button
        display={pageIndex > pageCount - pageButtonSidecount - 2 ? 'none' : 'inline-flex'}
        title={t('table.last_page') ?? ''}
        size="sm"
        onClick={() => setPageIndex(pageCount - 1)}
        disabled={!canNextPage}
      >
        {pageCount}
      </Button>
      <NumberInput
        defaultValue={pageIndex + 1}
        key={`${pageIndex + 1}`}
        inputMode="text"
        max={pageCount}
        min={1}
        maxW={14}
        size="sm"
        allowMouseWheel
        onKeyUp={(e) => {
          if (e.key !== 'Enter') return;
          if (jumpToPageInput.current?.value == null) return;
          setPageIndex(+jumpToPageInput.current?.value - 1);
        }}
      >
        <NumberInputField ref={jumpToPageInput} px={2} textAlign="center" />
      </NumberInput>
    </Flex>
  );
}

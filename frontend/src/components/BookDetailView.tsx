import React, { Suspense } from 'react';
import {
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
  SimpleGrid,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { TbChevronUp } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';
import type { Row } from '@tanstack/react-table';
import { filesize as formatFileSize } from 'filesize';

import RootContext from '../store';
import ExternalLink from './ExternalLink';
import { Book } from '../scripts/searcher';
import { getDownloadLinkFromIPFS } from '../scripts/ipfs';

const Preview = React.lazy(() => import('./Preview'));

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

export interface BookDetailViewProps {
  row: Row<Book>;
}

const BookDetailView: React.FC<BookDetailViewProps> = ({ row }) => {
  const rootContext = React.useContext(RootContext);

  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    <React.Fragment>
      <Card mt={{ base: 1, md: 2 }} mb={{ base: 2, md: 4 }} mx={{ base: 4, md: 8 }}>
        <CardHeader>
          <Flex align="center" justify="space-between" gap="2">
            <Heading as="h3" fontSize={['xl', '2xl', '2xl']} flexShrink={0} flex={1} minW="0">
              <Text isTruncated>{title}</Text>
            </Heading>
            {extension === 'epub' && rootContext.ipfsGateways.length > 0 ? (
              <Button onClick={onOpen}>{t('table.preview')}</Button>
            ) : null}
          </Flex>
        </CardHeader>
        <Divider />
        <CardBody>
          <SimpleGrid columns={{ sm: 1, md: 3, lg: 4 }} spacing={{ base: 2, md: 4 }}>
            <Description name={`${t('book.id') ?? 'ID'}: `}>{id}</Description>
            <GridItem colSpan={{ sm: 1, md: 2, lg: 3 }}>
              <Description name={`${t('book.ipfs_cid') ?? 'IPFS CID'}: `}>{ipfs_cid}</Description>
            </GridItem>
            <Description name={`${t('book.author') ?? 'Author'}: `}>{author}</Description>
            <Description name={`${t('book.publisher') ?? 'Publisher'}: `}>
              {publisher || t('book.unknown') || 'Unknown'}
            </Description>
            <Description name={`${t('book.extension') ?? 'Extension'}: `}>{extension}</Description>
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
          {rootContext.ipfsGateways.length > 0 ? (
            <SimpleGrid columns={{ sm: 2, md: 3, lg: 4, xl: 5 }} spacing={{ base: 2, md: 4 }}>
              {rootContext.ipfsGateways.map((gateway) => (
                <Button
                  as={ExternalLink}
                  href={getDownloadLinkFromIPFS(gateway, row.original)}
                  key={gateway}
                  variant="outline"
                >
                  {gateway}
                </Button>
              ))}
            </SimpleGrid>
          ) : null}
          <Flex justify="flex-end">
            <Button
              variant="unstyled"
              onClick={() => row.toggleExpanded(false)}
              color="gray.500"
              mt={2}
              mb={-2}
            >
              {t('table.collapse')}
              <Icon as={TbChevronUp} boxSize={4} position="relative" top={0.5} left={1} />
            </Button>
          </Flex>
        </CardFooter>
      </Card>
      {isOpen ? (
        <Suspense>
          <Preview onClose={onClose} book={row.original} />
        </Suspense>
      ) : null}
    </React.Fragment>
  );
};

export default BookDetailView;

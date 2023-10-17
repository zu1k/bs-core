import React, { Suspense, useState } from 'react';
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
  SimpleGrid,
  Text,
  useDisclosure,
  Image,
  Stack,
  TextProps
} from '@chakra-ui/react';
import { CopyIcon, LinkIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import { filesize as formatFileSize } from 'filesize';

import RootContext from '../store';
import ExternalLink from './ExternalLink';
import { Book } from '../scripts/searcher';
import { getDownloadLinkFromIPFS } from '../scripts/ipfs';
import { getCoverImageUrl, getMd5CoverImageUrl, white_pic } from '../scripts/cover';
import IpfsDownloadButton from './IpfsDownloadButton';

const Preview = React.lazy(() => import('./Preview'));

interface DescriptionProps extends TextProps {
  name: string;
  children: React.ReactNode;
}
const Description: React.FC<DescriptionProps> = ({ name, children, ...props }) => {
  return (
    <Text whiteSpace="normal" wordBreak="break-all" {...props}>
      <Text as="span" fontWeight="bold">
        {name}
      </Text>
      <Text as="span">{children}</Text>
    </Text>
  );
};

export interface BookDetailViewProps {
  book: Book;
}

const BookDetailView: React.FC<BookDetailViewProps> = ({ book }) => {
  const rootContext = React.useContext(RootContext);

  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [ipfsCidCopied, setIpfsCidCopied] = useState(false);
  const [md5Copied, setMd5Copied] = useState(false);

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
    ipfs_cid,
    cover_url,
    md5
  } = book;
  return (
    <React.Fragment>
      <Card
        mt={{ base: 1, md: 2 }}
        mb={{ base: 2, md: 4 }}
        mx={{ base: 0, lg: 8 }}
        variant="outline"
      >
        <CardHeader>
          <Flex
            align="center"
            flexWrap={{ base: 'wrap', lg: 'nowrap' }}
            justify="space-between"
            gap={{ base: '4', lg: '2' }}
          >
            <Heading as="h3" fontSize={['xl', '2xl', '2xl']} whiteSpace="break-spaces" minW="0">
              <Text>{title}</Text>
            </Heading>
            <Flex gap="2">
              {md5 != undefined && md5.length > 0 ? (
                <Button
                  as={ExternalLink}
                  minWidth="unset"
                  href={import.meta.env.VITE_MD5_BASE_URL + md5}
                >
                  {t('table.redirect2aa')}
                </Button>
              ) : null}
              {extension === 'epub' &&
              ipfs_cid != undefined &&
              ipfs_cid.length > 0 &&
              rootContext.ipfsGateways.length > 0 ? (
                <Button onClick={onOpen}>{t('table.preview')}</Button>
              ) : null}
            </Flex>
          </Flex>
        </CardHeader>
        <Divider />
        <CardBody>
          <Flex direction={{ base: 'column', md: 'row' }}>
            <Image
              referrerPolicy="no-referrer"
              borderRadius="lg"
              width="auto"
              maxWidth="150px"
              objectFit="contain"
              src={getCoverImageUrl(cover_url)}
              onError={({ currentTarget }) => {
                currentTarget.src = getMd5CoverImageUrl(book.md5);
                currentTarget.onerror = () => {
                  currentTarget.style.display = 'none';
                  currentTarget.src = white_pic;
                };
              }}
            />
            <Stack pl={{ base: undefined, md: '20px' }} pt="10px" flex="1">
              <SimpleGrid columns={{ sm: 1, md: 3, lg: 4 }} spacing={{ base: 2, md: 4 }}>
                <Description name={`${t('book.id') ?? 'ID'}: `}>{id}</Description>
                <GridItem colSpan={{ sm: 1, md: 3, lg: 3 }}>
                  <Description
                    name={`${t('book.ipfs_cid') ?? 'IPFS CID'}: `}
                    isTruncated
                    textOverflow="hidden"
                  >
                    {ipfs_cid != undefined && ipfs_cid.length > 0 ? (
                      <Button
                        colorScheme="gray"
                        variant="ghost"
                        size="xs"
                        leftIcon={<CopyIcon />}
                        onClick={() => {
                          navigator.clipboard.writeText(ipfs_cid);
                          setIpfsCidCopied(true);
                          setTimeout(() => {
                            setIpfsCidCopied(false);
                          }, 2000);
                        }}
                      >
                        {ipfsCidCopied ? t('copied') : ipfs_cid}
                      </Button>
                    ) : (
                      'Unknown'
                    )}
                  </Description>
                </GridItem>
                <Description name={`${t('book.author') ?? 'Author'}: `}>{author}</Description>
                <GridItem colSpan={{ sm: 1, md: 2, lg: 3 }}>
                  <Description name={`${t('book.publisher') ?? 'Publisher'}: `}>
                    {publisher || t('book.unknown') || 'Unknown'}
                  </Description>
                </GridItem>
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
                <GridItem colSpan={{ sm: 1, md: 2, lg: 2 }}>
                  <Description name={`${t('book.md5') ?? 'MD5'}: `}>
                    {(
                      <Button
                        colorScheme="gray"
                        variant="ghost"
                        size="xs"
                        leftIcon={<LinkIcon />}
                        onClick={() => {
                          navigator.clipboard.writeText(md5?.toLowerCase() ?? 'Unknown');
                          setMd5Copied(true);
                          setTimeout(() => {
                            setMd5Copied(false);
                          }, 2000);
                        }}
                      >
                        {md5Copied ? t('copied') : md5}
                      </Button>
                    ) ||
                      t('book.unknown') ||
                      'Unknown'}
                  </Description>
                </GridItem>
              </SimpleGrid>
            </Stack>
          </Flex>
        </CardBody>
        <CardFooter flexDirection="column">
          {ipfs_cid != undefined && ipfs_cid.length > 0 && rootContext.ipfsGateways.length > 0 ? (
            <SimpleGrid columns={{ sm: 2, md: 3, lg: 4, xl: 5 }} spacing={{ base: 2, md: 4 }}>
              <IpfsDownloadButton book={book} onlyIcon={false}></IpfsDownloadButton>

              {rootContext.ipfsGateways.map((gateway) => (
                <Button
                  as={ExternalLink}
                  href={getDownloadLinkFromIPFS(gateway, book)}
                  key={gateway}
                  variant="outline"
                >
                  {gateway}
                </Button>
              ))}
            </SimpleGrid>
          ) : null}
        </CardFooter>
      </Card>
      {isOpen ? (
        <Suspense>
          <Preview onClose={onClose} book={book} />
        </Suspense>
      ) : null}
    </React.Fragment>
  );
};

export default BookDetailView;

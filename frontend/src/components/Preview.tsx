import React, { useEffect, useState, useContext, useRef, useCallback } from 'react';
import ePub from 'epubjs';
import type { Rendition, Book as EPubBook } from 'epubjs';
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Select,
  Spinner,
  Text,
  useColorMode,
  useDisclosure
} from '@chakra-ui/react';
import { TbChevronLeft, TbChevronRight, TbMenu2, TbBookDownload } from 'react-icons/tb';

import RootContext from '../store';
import TocView from './TocView';
import ExternalLink from './ExternalLink';
import { Book } from '../scripts/searcher';
import { getDownloadLinkFromIPFS } from '../scripts/ipfs';
import { downloadBookData } from '../scripts/download';

export interface PreviewProps {
  book: Book;
  onClose: () => void;
}

export interface Toc {
  href: string;
  id: string;
  label: string;
  parent?: string;
  subitems: Toc[];
}

const Preview: React.FC<PreviewProps> = ({ book, onClose }: PreviewProps) => {
  const { ipfsGateways } = useContext(RootContext);
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose: onCloseTocView } = useDisclosure();

  const bookRef = useRef<EPubBook | undefined>();
  const renditionRef = useRef<Rendition | undefined>();
  const [toc, setToc] = useState<Toc[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [gateway, setGateway] = useState('竞速下载');
  const abortController = useRef<AbortController>(new AbortController());

  const handleChangeGateWay = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsLoaded(false);
    setToc([]);
    setGateway(e.target.value);
    initBook(e.target.value);
  };

  const handleChangeToc = (href: string) => {
    renditionRef?.current?.display(href);
  };

  const registerEvents = (rendition: Rendition) => {
    const next = document.getElementById('next');
    if (next) {
      next.addEventListener(
        'click',
        function (e) {
          rendition.next();
          e.preventDefault();
        },
        false
      );
    }

    const prev = document.getElementById('prev');

    if (prev) {
      prev.addEventListener(
        'click',
        function (e) {
          rendition.prev();
          e.preventDefault();
        },
        false
      );
    }

    const keyListener = function (e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        rendition.prev();
      }

      if (e.key === 'ArrowRight') {
        rendition.next();
      }
    };

    rendition.on('keyup', keyListener);
    document.addEventListener('keyup', keyListener, false);
  };

  const initBook = useCallback(async (gateway: string) => {
    bookRef?.current?.destroy();

    const ePubBook: any =
      gateway == '竞速下载'
        ? ePub(await downloadBookData(book, abortController.current.signal))
        : ePub(getDownloadLinkFromIPFS(gateway, book));
    const rendition = ePubBook.renderTo('viewer', {
      width: '100%',
      height: '100%',
      spread: 'always'
    });

    rendition.display();

    registerTheme(rendition);

    bookRef.current = ePubBook;
    renditionRef.current = rendition;

    ePubBook.loaded.navigation.then(function ({ toc }: { toc: Toc[] }) {
      setIsLoaded(true);
      setToc(toc);
      registerEvents(rendition);
    });

    return () => {
      abortController.current.abort();
      renditionRef?.current?.destroy();
      bookRef?.current?.destroy();
    };
  }, []);

  const registerTheme = (rendition: Rendition) => {
    rendition.themes.register('light', {
      html: {
        padding: '0 !important'
      },
      body: {
        background: 'transparent'
      },
      'a:any-link': {
        color: '#3b82f6 !important',
        'text-decoration': 'none !important'
      },
      '::selection': {
        'background-color': 'rgba(3, 102, 214, 0.2)'
      }
    });

    rendition.themes.register('dark', {
      body: {
        'background-color': '#2D3748',
        color: 'rgba(255, 255, 255, 0.80) !important',
        'border-radius': '4px'
      },
      'a:any-link': {
        color: '#3b82f6 !important',
        'text-decoration': 'none !important'
      },
      '::selection': {
        'background-color': 'rgba(3, 102, 214, 0.2)'
      }
    });

    rendition.themes.select(colorMode);
  };

  useEffect(() => {
    abortController.current.abort();
    abortController.current = new AbortController();
    initBook(gateway);
    return () => {
      abortController.current.abort();
    };
  }, [gateway, book]);

  useEffect(() => {
    if (renditionRef?.current) {
      renditionRef?.current.themes.select(colorMode);
    }
  }, [colorMode]);

  return (
    <React.Fragment>
      <Modal onClose={onClose} size="full" isOpen returnFocusOnClose={false} autoFocus={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex align="center" justify="space-between" gap={4}>
              <Box flex="1">
                <Button variant="outline" onClick={onOpen}>
                  <TbMenu2 />
                </Button>
              </Box>
              <Heading
                as="h3"
                fontSize={['xl', '2xl', '2xl']}
                flexShrink={0}
                maxW={['8rem', '12rem', '36rem']}
              >
                <Text isTruncated>{book.title}</Text>
              </Heading>
              <Flex flex="1" justifyContent="flex-end" pr="2rem">
                <Select value={gateway} maxW={256} onChange={handleChangeGateWay}>
                  {['竞速下载'].concat(ipfsGateways).map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
                <Button
                  ml="1rem"
                  as={ExternalLink}
                  href={getDownloadLinkFromIPFS(
                    gateway == '竞速下载' ? ipfsGateways[0] : gateway,
                    book
                  )}
                  variant="outline"
                  fontSize={['3xl', '3xl', 'md']}
                >
                  <TbBookDownload />
                </Button>
              </Flex>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <Divider />
          <ModalBody pos="relative" bg="gray.50" _dark={{ bg: 'gray.800' }}>
            <Box
              id="viewer"
              w={['85%', '85%', '82%']}
              h="calc(100% - 40px)"
              mx="auto"
              my="0"
              top="20px"
              right="0"
              bottom="20px"
              left="0"
              pos="absolute"
              bg="white"
              rounded="md"
              shadow="md"
              overflow="hidden"
              _dark={{ bg: 'gray.700' }}
              display="flex"
              alignItems="center"
              justifyContent="center"
              key={gateway}
            >
              {!isLoaded ? (
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.400"
                  size="xl"
                />
              ) : null}
            </Box>

            {['prev', 'next'].map((item, index) => (
              <Flex
                id={item}
                key={index}
                href={`#${item}`}
                as="a"
                pos="fixed"
                top="50%"
                left={item === 'prev' ? ['5px', '5px', '40px'] : []}
                right={item === 'next' ? ['5px', '5px', '40px'] : []}
                mt="-24px"
                fontSize={['2xl', '2xl', '4xl']}
                padding="0.4rem"
                color="gray.300"
                rounded="full"
                bg="gray.100"
                alignItems="center"
                justifyContent="center"
                shadow="md"
                userSelect="none"
                _hover={{ color: 'gray.500', bg: 'gray.300' }}
                _dark={{ bg: 'gray.600', color: 'gray.400', _hover: { color: 'gray.300' } }}
              >
                {item === 'prev' ? <TbChevronLeft /> : <TbChevronRight />}
              </Flex>
            ))}

            <TocView
              toc={toc}
              isOpen={isOpen}
              book={book}
              onClose={onCloseTocView}
              handleChangeToc={handleChangeToc}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </React.Fragment>
  );
};

export default Preview;

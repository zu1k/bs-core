import {
  Box,
  Heading,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton
} from '@chakra-ui/react';
import type { Rendition } from 'epubjs';

import { Toc } from './Preview';
import { Book } from '../scripts/searcher';

interface TocViewProps {
  isOpen: boolean;
  toc: Toc[];
  book: Book;
  onClose: () => void;
  handleChangeToc: (href: string) => void;
}

const TocView: React.FC<TocViewProps> = ({
  isOpen,
  book,
  toc,
  onClose,
  handleChangeToc
}: TocViewProps) => {
  return (
    <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>
          <Heading as="h3" fontSize="2xl" flexShrink={0}>
            {book.title}
          </Heading>
        </DrawerHeader>

        <DrawerBody>
          {toc.map((item, index) => (
            <Box
              fontSize="md"
              color="gray.500"
              px="0.8rem"
              py="1rem"
              pl="0"
              cursor="pointer"
              borderBottom="1px"
              borderColor="gray.200"
              _dark={{ color: 'gray.200', borderColor: 'gray.600' }}
              key={index}
              onClick={() => {
                handleChangeToc(item.href);
                onClose();
              }}
            >
              {item.label}
            </Box>
          ))}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default TocView;

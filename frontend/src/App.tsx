import { Flex, HStack, Icon, IconButton, Spacer } from '@chakra-ui/react';
import React, { Suspense, useState } from 'react';
import { SkipNavContent, SkipNavLink } from '@chakra-ui/skip-nav';

import { Book } from './scripts/searcher';
import BooksView from './components/BooksView';
import ColorModeSwitch from './components/ColorModeSwitch';
import Footer from './components/Footer';
import Header from './components/Header';
import LanguageSwitch from './components/LanguageSwitch';
import RootContext from './store';
import Search from './components/Search';
import { repository } from '../package.json';
import { useTranslation } from 'react-i18next';

const Main: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  return (
    <>
      <SkipNavContent />
      <Search setBooks={setBooks} />
      <BooksView books={books} />
    </>
  );
};

const Settings =
  import.meta.env.VITE_TAURI === '1'
    ? React.lazy(() => import('./components/Settings-tauri'))
    : React.lazy(() => import('./components/Settings'));

const App: React.FC = () => {
  const { t } = useTranslation();
  const [ipfsGateways, setIpfsGateways] = useState<string[]>([]);

  return (
    <RootContext.Provider value={{ ipfsGateways, setIpfsGateways }}>
      <Flex direction="column" minH="100vh">
        <SkipNavLink>Skip to content</SkipNavLink>
        <Header title="Book Searcher">
          <HStack spacing={{ base: 1, md: 2 }}>
            <LanguageSwitch />
            <ColorModeSwitch />
            <Suspense>
              <Settings />
            </Suspense>
          </HStack>
        </Header>

        <Main />

        <Spacer />
        <Footer>Book Searcher ©2023</Footer>
      </Flex>
    </RootContext.Provider>
  );
};

export default App;

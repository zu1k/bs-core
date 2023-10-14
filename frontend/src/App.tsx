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
import { version, repository } from '../package.json';
import { useTranslation } from 'react-i18next';
import getIpfsGateways from './scripts/ipfs';
import ExternalLink from './components/ExternalLink';
import { FaGithub } from 'react-icons/fa';

const Main: React.FC<{ searchComponentKey: number }> = ({ searchComponentKey }) => {
  const initialPagination = { pageSize: 20, pageIndex: 0 };
  const [pagination, setPagination] = React.useState(initialPagination);
  const [pageCount, setPageCount] = useState<number>(1);
  const [books, setBooks] = useState<Book[]>([]);
  return (
    <>
      <SkipNavContent />
      <Search
        key={searchComponentKey}
        setBooks={setBooks}
        pagination={pagination}
        setPageCount={setPageCount}
        resetPageIndex={() => setPagination(initialPagination)}
      />
      <BooksView
        books={books}
        pagination={pagination}
        setPagination={setPagination}
        pageCount={pageCount}
      />
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
  const [searchComponentKey, setSearchComponentKey] = useState<number>(0);

  React.useEffect(() => {
    getIpfsGateways().then((gateways) => {
      setIpfsGateways(gateways);
    });
  }, []);

  return (
    <RootContext.Provider value={{ ipfsGateways, setIpfsGateways }}>
      <Flex direction="column" minH="100vh">
        <SkipNavLink>Skip to content</SkipNavLink>
        <Header title="Book Searcher" onClick={() => setSearchComponentKey((key) => key + 1)}>
          <HStack spacing={{ base: 1, md: 2 }}>
            <IconButton
              as={ExternalLink}
              aria-label={t('nav.repository')}
              title={t('nav.repository') ?? ''}
              href={repository}
              variant="ghost"
              icon={<Icon as={FaGithub} boxSize={5} />}
            />
            <LanguageSwitch />
            <ColorModeSwitch />
            <Suspense>
              <Settings />
            </Suspense>
          </HStack>
        </Header>

        <Main searchComponentKey={searchComponentKey} />

        <Spacer />
        <Footer>
          <ExternalLink href={repository}>Book Searcher</ExternalLink> v{version} ©2023
        </Footer>
      </Flex>
    </RootContext.Provider>
  );
};

export default App;

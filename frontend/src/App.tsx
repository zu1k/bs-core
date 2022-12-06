import { Flex, HStack, Icon, IconButton, Spacer } from '@chakra-ui/react';
import React, { Suspense, useState } from 'react';
import { SkipNavContent, SkipNavLink } from '@chakra-ui/skip-nav';

import { Book } from './scripts/searcher';
import BooksView from './components/BooksView';
import ColorModeSwitch from './components/ColorModeSwitch';
import ExternalLink from './components/ExternalLink';
import { FaGithub } from 'react-icons/fa';
import Footer from './components/Footer';
import Header from './components/Header';
import LanguageSwitch from './components/LanguageSwitch';
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
    : React.Fragment;

const App: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Flex direction="column" minH="100vh">
      <SkipNavLink>Skip to content</SkipNavLink>
      <Header title="zLib Searcher">
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
          {import.meta.env.VITE_TAURI === '1' && (
            <Suspense>
              <Settings />
            </Suspense>
          )}
        </HStack>
      </Header>

      <Main />

      <Spacer />
      <Footer>
        zLib Searcher ©2022
      </Footer>
    </Flex>
  );
};

export default App;

import './style.css';

import * as ReactDOM from 'react-dom/client';

import App from './App';
import { ChakraProvider } from '@chakra-ui/react';
import LanguageDetector from 'i18next-browser-languagedetector';
import React from 'react';
import i18n from 'i18next';
import i18nResource from './i18n.json';
import { initReactI18next } from 'react-i18next';
import merge from 'lodash/merge';
import theme from './theme';

const resources =
  import.meta.env.VITE_TAURI === '1'
    ? merge(i18nResource, (await import('./i18n-tauri.json')).default)
    : i18nResource;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',

    // debug: true,
    interpolation: { escapeValue: false }
  });

const rootElement = document.getElementById('app')!;
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
);

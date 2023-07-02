import type { Book } from './searcher';
import getIpfsGateways, { getDownloadLinkFromIPFS } from './ipfs';
import axios, { AxiosProgressEvent, AxiosResponse } from 'axios';
import fileDownload from 'js-file-download';
import { t } from 'i18next';

const ipfsGateways = [
  'https://gateway.pinata.cloud',
  'https://cloudflare-ipfs.com',
  'https://cf-ipfs.com',
  'https://ipfs-gateway.cloud',
  'https://4everland.io',
  'https://ipfs.io',
  'https://w3s.link',
  'https://gateway.ipfs.io',
  'https://ipfs.eth.aragon.network',
  'https://ipfs.joaoleitao.org',
  'https://nftstorage.link',
  'https://dweb.link',
  'https://ipfs.best-practice.se'
];

export default async function autoDownload(book: Book, toast: any, setDownloadProgress: any) {
  const filename = `${book.title}_${book.author}.${book.extension}`;
  toast({
    title: `${filename} ${t('download_start')}!`,
    status: 'info',
    position: 'bottom-right',
    isClosable: true,
    duration: 3000
  });

  console.log('Download: ', book);
  var gateways = ipfsGateways.concat(await getIpfsGateways());
  gateways = gateways.filter(function (item, pos) {
    return gateways.indexOf(item) == pos;
  });
  console.log('Try gateways:', gateways);
  const controllerMap = new Map();
  var fastedProgress = 0;
  setDownloadProgress(fastedProgress.toFixed(2));
  Promise.any(
    gateways.map((gateway) => {
      const controller = new AbortController();
      controllerMap.set(gateway, controller);
      return axios
        .get(getDownloadLinkFromIPFS(gateway, book), {
          signal: controller.signal,
          withCredentials: false,
          responseType: 'blob',
          onDownloadProgress: (e: AxiosProgressEvent) => {
            console.log('Download Progress: ', gateway, e);
            const myProgress = e.progress! * 100;
            const bar = 10;
            if (fastedProgress > bar && myProgress < bar) {
              controllerMap.get(gateway).abort();
            }
            if (myProgress > fastedProgress && myProgress != 100) {
              fastedProgress = myProgress;
              setDownloadProgress(fastedProgress.toFixed(2));
            }
          }
        })
        .catch();
    })
  )
    .then((resp: AxiosResponse) => {
      controllerMap.forEach((c) => c.abort());
      fileDownload(resp.data, filename);
      toast({
        title: `${filename} ${t('download_success')}!`,
        status: 'success',
        position: 'bottom-right',
        isClosable: true,
        duration: 6000
      });
    })
    .catch(() => {
      toast({
        title: `${filename} ${t('download_failed')}!`,
        status: 'error',
        position: 'bottom-right',
        isClosable: true,
        duration: 6000
      });
    })
    .finally(() => {
      setDownloadProgress(-1);
    });
}

const downloadBookData = async function (book: Book, signal: AbortSignal) {
  var gateways = ipfsGateways.concat(await getIpfsGateways());
  gateways = gateways.filter(function (item, pos) {
    return gateways.indexOf(item) == pos;
  });
  const controllerMap = new Map();
  var fastedProgress = 0;
  return Promise.any(
    gateways.map((gateway) => {
      const controller = new AbortController();
      controllerMap.set(gateway, controller);
      return axios
        .get(getDownloadLinkFromIPFS(gateway, book), {
          signal: anySignal([controller.signal, signal]),
          withCredentials: false,
          responseType: 'arraybuffer',
          onDownloadProgress: (e: AxiosProgressEvent) => {
            console.log('Download Progress: ', gateway, e);
            const myProgress = e.progress! * 100;
            const bar = 10;
            if (fastedProgress > bar && myProgress < bar) {
              controllerMap.get(gateway).abort();
            }
            if (myProgress > fastedProgress && myProgress != 100) {
              fastedProgress = myProgress;
            }
          }
        })
        .catch();
    })
  )
    .then((resp: AxiosResponse) => {
      return resp.data;
    })
    .catch()
    .finally(() => {
      controllerMap.forEach((c) => c.abort());
    });
};

export { downloadBookData, ipfsGateways };

function anySignal(signals: AbortSignal[]) {
  const controller = new AbortController();

  function onAbort() {
    controller.abort();

    // Cleanup
    for (const signal of signals) {
      signal.removeEventListener('abort', onAbort);
    }
  }

  for (const signal of signals) {
    if (signal.aborted) {
      onAbort();
      break;
    }
    signal.addEventListener('abort', onAbort);
  }

  return controller.signal;
}

import { Book } from './searcher';

interface TauriConfig {
  index_dir: string;
  ipfs_gateways: string[];
}

export default async function getIpfsGateways() {
  if (import.meta.env.VITE_TAURI === '1') {
    const api = await import('@tauri-apps/api/primitives');
    return await api.invoke('get_config').then((conf) => {
      const config = conf as TauriConfig;
      return config.ipfs_gateways;
    });
  } else {
    const ipfsGateways: string[] = JSON.parse(
      localStorage.getItem('ipfs_gateways') ||
        '["https://cloudflare-ipfs.com","https://dweb.link","https://ipfs.io","https://gateway.pinata.cloud"]'
    );
    return ipfsGateways;
  }
}

export function parseIpfsGateways(text: string) {
  const gateways = text.split('\n').filter((g) => g.length > 0);
  return gateways.filter((g, i) => gateways.indexOf(g) === i);
}

export function getDownloadLinkFromIPFS(gateway: string, book: Book) {
  return (
    `${gateway}/ipfs/${book.ipfs_cid}?filename=` +
    encodeURIComponent(`${book.title}_${book.author}.${book.extension}`)
  );
}

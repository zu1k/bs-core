interface TauriConfig {
  index_dir: string;
  ipfs_gateways: string[];
}

export default async function getIpfsGateways() {
  if (import.meta.env.VITE_TAURI === '1') {
    import('@tauri-apps/api').then((api) => {
      api.invoke('get_config').then((conf) => {
        const config = conf as TauriConfig;
        return config.ipfs_gateways;
      });
    });
    return <string[]>[];
  } else {
    const ipfsGateways: string[] = JSON.parse(localStorage.getItem('ipfs_gateways') || '[]');
    return ipfsGateways;
  }
}

export function parseIpfsGateways(text: string) {
  const gateways = text.split('\n').filter((g) => g.length > 0);
  return gateways.filter((g, i) => gateways.indexOf(g) === i);
}

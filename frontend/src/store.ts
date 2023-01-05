import React from 'react';

const RootContext = React.createContext({
  ipfsGateways: [] as string[],
  setIpfsGateways: (gateways: string[]) => {}
});

export default RootContext;

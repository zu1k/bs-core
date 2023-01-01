import React from "react";

export const initRootContext = {
    ipfs_gateways: <string[]>[]
};

const RootContext = React.createContext(initRootContext);

export default RootContext;
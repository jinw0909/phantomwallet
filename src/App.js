// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DesktopApp from './DesktopApp';
import MobilePhantomConnection from './MobilePhantomConnection';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, WagmiProvider, createConfig } from 'wagmi';
import { mainnet, linea, lineaSepolia } from "wagmi/chains";
import { metaMask } from 'wagmi/connectors';
import MetaMaskApp from "./MetaMaskApp"; // Your wagmi config

const config = createConfig({
    ssr: true,
    chains: [mainnet, linea, lineaSepolia],
    connectors: [metaMask()],
    transports: {
        [mainnet.id]: http(),
        [linea.id]: http(),
        [lineaSepolia.id]: http(),
    },
});
const queryClient = new QueryClient();

function App() {
    return (
        <Routes>
            <Route path="/" element={<DesktopApp />} />
            {/*<Route path="/mobile/*" element={<MobilePhantomConnection />} />*/}
            <Route path="/metamask/*" element={
                <WagmiProvider config={config}>
                    <QueryClientProvider client={queryClient}>
                        <MetaMaskApp/>
                    </QueryClientProvider>
                </WagmiProvider>
                }
            />
        </Routes>
    );
}

export default App;

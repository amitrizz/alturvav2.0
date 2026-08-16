import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import '@rainbow-me/rainbowkit/styles.css'
import { connectorsForWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { 
  metaMaskWallet, 
  trustWallet, 
  safepalWallet, 
  bitgetWallet, 
  coinbaseWallet 
} from '@rainbow-me/rainbowkit/wallets'
import { createConfig, WagmiProvider, http } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

const projectId = '88c9df409ffc9779df52c80333333333';

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        metaMaskWallet,
        trustWallet,
        safepalWallet,
        bitgetWallet,
        coinbaseWallet
      ],
    },
  ],
  {
    appName: 'BTC3.O DEX',
    projectId,
  }
)

const config = createConfig({
  connectors,
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: http(),
  },
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

registerSW({ immediate: true })

import '@rainbow-me/rainbowkit/styles.css'
import { connectorsForWallets, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  trustWallet,
  safepalWallet,
  bitgetWallet,
  coinbaseWallet,
  walletConnectWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets'
import { createConfig, WagmiProvider, http } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '88c9df409ffc9779df52c80333333333'

if (!import.meta.env.VITE_WALLETCONNECT_PROJECT_ID) {
  console.warn(
    '[BTC3.O] Set VITE_WALLETCONNECT_PROJECT_ID in frontend/.env for reliable mobile wallet connections. Get a free ID at https://cloud.walletconnect.com'
  )
}

const BSC_TESTNET_RPC = import.meta.env.VITE_BSC_TESTNET_RPC || 'https://bsc-testnet-rpc.publicnode.com'

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [
        walletConnectWallet,
        metaMaskWallet,
        trustWallet,
        injectedWallet,
        safepalWallet,
        bitgetWallet,
        coinbaseWallet,
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
    [bscTestnet.id]: http(BSC_TESTNET_RPC),
  },
  ssr: false,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme()} initialChain={bscTestnet}>
            <App />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import '@rainbow-me/rainbowkit/styles.css'
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

const config = getDefaultConfig({
  appName: 'BTC 3.0 DEX',
  projectId: '88c9df409ffc9779df52c80333333333', // 32-character ProjectID
  chains: [bscTestnet],
  ssr: false,
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

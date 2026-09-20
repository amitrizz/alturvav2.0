import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'
import './styles/gold-theme-buttons.css'
import './styles/gold-theme-pages.css'

function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  import('virtual:pwa-register')
    .then(({ registerSW }) => {
      registerSW({
        immediate: true,
        onRegisterError(error) {
          console.warn('[BTC3.O] Service worker registration failed:', error)
        },
      })
    })
    .catch((error) => {
      console.warn('[BTC3.O] Service worker module unavailable:', error)
    })
}

if (typeof window !== 'undefined') {
  window.addEventListener('load', registerServiceWorker, { once: true })
}

import '@rainbow-me/rainbowkit/styles.css'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { bscTestnet } from 'wagmi/chains'
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { isWalletConnectConfigured, wagmiConfig } from './wagmiConfig.js'

if (!isWalletConnectConfigured) {
  console.warn(
    '[BTC3.O] VITE_WALLETCONNECT_PROJECT_ID is missing or invalid. Mobile wallet deep links will fail until you set a real project ID from https://cloud.walletconnect.com (also add it in Vercel env vars).'
  )
}

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
      <WagmiProvider config={wagmiConfig} reconnectOnMount>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme()}
            initialChain={bscTestnet}
            modalSize="compact"
            appInfo={{
              appName: 'BTC3.O DEX',
              learnMoreUrl: 'https://kchain.vercel.app',
            }}
          >
            <App />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)

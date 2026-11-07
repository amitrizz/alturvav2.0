import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  trustWallet,
  safepalWallet,
  bitgetWallet,
  coinbaseWallet,
  walletConnectWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { http } from "wagmi";
import { bscTestnet, bsc } from "wagmi/chains";

const PLACEHOLDER_PROJECT_IDS = new Set([
  "your_walletconnect_cloud_project_id",
]);

const envProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim();
export const walletConnectProjectId = envProjectId || "3a8170812b534d0ff9d794f19a901d64";

export const isWalletConnectConfigured = Boolean(
  envProjectId && !PLACEHOLDER_PROJECT_IDS.has(envProjectId)
);

const appOrigin =
  typeof window !== "undefined" ? window.location.origin : "https://altruva.live";
const appUrl = `${appOrigin}/`;
const appIcon = `${appOrigin}/favicon-32x32.png`;

const BSC_TESTNET_RPC =
  import.meta.env.VITE_BSC_TESTNET_RPC || "https://bsc-testnet-rpc.publicnode.com";
const BSC_MAINNET_RPC =
  import.meta.env.VITE_BSC_RPC || "https://binance.llamarpc.com";

export const wagmiConfig = getDefaultConfig({
  appName: "Altruva",
  appDescription: "Altruva 100% Community Distribution Model in USDT on BNB Smart Chain",
  appUrl,
  appIcon,
  projectId: walletConnectProjectId,
  chains: [bscTestnet, bsc],
  transports: {
    [bscTestnet.id]: http(BSC_TESTNET_RPC),
    [bsc.id]: http(BSC_MAINNET_RPC),
  },
  ssr: false,
  wallets: [
    {
      groupName: "Recommended",
      wallets: [
        walletConnectWallet,
        trustWallet,
        metaMaskWallet,
        injectedWallet,
        safepalWallet,
        bitgetWallet,
        coinbaseWallet,
      ],
    },
  ],
  walletConnectParameters: {
    metadata: {
      name: "Altruva",
      description: "100% Community Distribution Model in USDT on BNB Smart Chain",
      url: appUrl,
      icons: [appIcon],
    },
  },
});

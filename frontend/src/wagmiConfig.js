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
import { bscTestnet } from "wagmi/chains";

const PLACEHOLDER_PROJECT_IDS = new Set([
  "88c9df409ffc9779df52c80333333333",
  "your_walletconnect_cloud_project_id",
]);

const envProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim();
export const walletConnectProjectId = envProjectId || "88c9df409ffc9779df52c80333333333";

export const isWalletConnectConfigured = Boolean(
  envProjectId && !PLACEHOLDER_PROJECT_IDS.has(envProjectId)
);

const appOrigin =
  typeof window !== "undefined" ? window.location.origin : "https://kchain.vercel.app";
const appUrl = `${appOrigin}/`;
const appIcon = `${appOrigin}/pwa-192x192.png`;

const BSC_TESTNET_RPC =
  import.meta.env.VITE_BSC_TESTNET_RPC || "https://bsc-testnet-rpc.publicnode.com";

export const wagmiConfig = getDefaultConfig({
  appName: "BTC3.O DEX",
  appDescription: "Mint, stake, and earn on BSC Testnet with BTC3.0",
  appUrl,
  appIcon,
  projectId: walletConnectProjectId,
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: http(BSC_TESTNET_RPC),
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
      name: "BTC3.O DEX",
      description: "Mint, stake, and earn on BSC Testnet with BTC3.0",
      url: appUrl,
      icons: [appIcon],
    },
  },
});

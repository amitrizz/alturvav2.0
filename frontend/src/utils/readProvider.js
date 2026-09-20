import { ethers } from "ethers";
import addresses from "../addresses.json";

const DEFAULT_RPCS = [
  import.meta.env.VITE_BSC_TESTNET_RPC,
  "https://bsc-testnet-rpc.publicnode.com",
  "https://data-seed-prebsc-1-s1.binance.org:8545",
  "https://bsc-testnet.bnbchain.org",
].filter(Boolean);

const chainId = parseInt(String(addresses.chainId), 16);

let cachedReadProvider = null;

/** JSON-RPC provider for read-only calls (logs, history). Avoids wallet RPC log limits. */
export function getReadProvider() {
  if (!cachedReadProvider) {
    cachedReadProvider = new ethers.JsonRpcProvider(DEFAULT_RPCS[0], chainId);
  }
  return cachedReadProvider;
}

/** Try multiple public RPCs when fetching logs (testnet nodes often prune history). */
export async function withReadProviders(fn) {
  const urls = [...new Set(DEFAULT_RPCS)];
  let lastErr;
  for (const url of urls) {
    try {
      const provider = new ethers.JsonRpcProvider(url, chainId);
      return await fn(provider);
    } catch (err) {
      lastErr = err;
    }
  }
  if (lastErr) throw lastErr;
  return null;
}

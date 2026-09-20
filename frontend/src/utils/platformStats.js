import { ethers } from "ethers";

const LOG_CHUNK_SIZE = 4_000;
const MAX_LOG_BLOCK_RANGE = 49_999;
const INDEXED_LOG_WINDOWS_LIGHT = 2;
const INDEXED_LOG_WINDOWS_DEEP = 8;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function queryFilterChunked(contract, filter, provider, fromBlock, toBlock) {
  const latest =
    toBlock === "latest" ? await provider.getBlockNumber() : Number(toBlock);
  let from = Math.max(0, Number(fromBlock));
  const events = [];

  while (from <= latest) {
    const to = Math.min(from + LOG_CHUNK_SIZE - 1, latest);
    try {
      const chunk = await contract.queryFilter(filter, from, to);
      if (chunk.length) events.push(...chunk);
    } catch {
      if (LOG_CHUNK_SIZE > 500) {
        const mid = Math.floor((from + to) / 2);
        try {
          const a = await contract.queryFilter(filter, from, mid);
          if (a.length) events.push(...a);
        } catch {
          /* skip sub-range */
        }
        try {
          const b = await contract.queryFilter(filter, mid + 1, to);
          if (b.length) events.push(...b);
        } catch {
          /* skip sub-range */
        }
      }
    }
    from = to + 1;
  }

  return events;
}

export async function queryEventsWithFallback(contract, filter, provider, options = {}) {
  const currentBlock = await provider.getBlockNumber();
  const from = Math.max(0, currentBlock - MAX_LOG_BLOCK_RANGE);

  try {
    return await contract.queryFilter(filter, from, "latest");
  } catch {
    if (options.allowChunked) {
      return await queryFilterChunked(contract, filter, provider, from, "latest");
    }
    return [];
  }
}

async function queryIndexedUserEventsInWindows(
  contract,
  eventName,
  userAddress,
  provider,
  maxWindows = INDEXED_LOG_WINDOWS_LIGHT
) {
  const user = ethers.getAddress(userAddress);
  const filter = contract.filters[eventName](user);
  const latest = await provider.getBlockNumber();
  const events = [];

  for (let w = 0; w < maxWindows; w++) {
    const to = latest - w * MAX_LOG_BLOCK_RANGE;
    const from = Math.max(0, to - MAX_LOG_BLOCK_RANGE + 1);
    if (to < 0 || from > to) break;

    try {
      const chunk = await contract.queryFilter(filter, from, to);
      if (chunk.length) events.push(...chunk);
    } catch {
      /* skip pruned / rate-limited window */
    }
    if (w < maxWindows - 1) await sleep(80);
  }

  return events;
}

async function queryUserEvents(contract, eventName, userAddress, provider, options = {}) {
  const user = ethers.getAddress(userAddress);
  const windows = options.deepScan ? INDEXED_LOG_WINDOWS_DEEP : INDEXED_LOG_WINDOWS_LIGHT;
  return queryIndexedUserEventsInWindows(contract, eventName, user, provider, windows);
}

async function blockTimestamp(provider, blockNumber, cache) {
  if (cache.has(blockNumber)) return cache.get(blockNumber);
  try {
    const block = await provider.getBlock(blockNumber);
    const ts = block?.timestamp ?? Math.floor(Date.now() / 1000);
    cache.set(blockNumber, ts);
    return ts;
  } catch {
    return Math.floor(Date.now() / 1000);
  }
}

const LOCAL_TX_KEY = (account) => `btc3_tx_${account.toLowerCase()}`;

export function readLocalTransactionHistory(account) {
  if (!account) return [];
  try {
    const raw = localStorage.getItem(LOCAL_TX_KEY(account));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendLocalTransaction(account, tx) {
  if (!account || !tx?.hash) return;
  const list = readLocalTransactionHistory(account);
  const hash = tx.hash.toLowerCase();
  if (list.some((t) => String(t.hash).toLowerCase() === hash)) return;
  list.unshift({
    ...tx,
    date: tx.date || new Date().toISOString(),
    source: "local",
  });
  localStorage.setItem(LOCAL_TX_KEY(account), JSON.stringify(list.slice(0, 100)));
}

const STAKING_EVENT_NAMES = [
  "Minted",
  "Staked",
  "Sold",
  "Unstaked",
  "RewardClaimed",
  "RankBonusClaimed",
  "MonthlySalaryClaimed",
  "CouponApplied",
  "WheelSpun",
];

export async function historyRecordsFromReceipt(receipt, stakingContract, account, provider) {
  if (!receipt?.logs?.length) return [];
  const user = ethers.getAddress(account);
  const tsCache = new Map();
  const blockNumber = receipt.blockNumber;
  const timestamp = await blockTimestamp(provider, blockNumber, tsCache);
  const hash = receipt.hash;
  const records = [];

  for (const log of receipt.logs) {
    let parsed;
    try {
      parsed = stakingContract.interface.parseLog(log);
    } catch {
      continue;
    }
    if (!parsed || !STAKING_EVENT_NAMES.includes(parsed.name)) continue;

    const who = parsed.args?.user ?? parsed.args?.[0];
    try {
      if (ethers.getAddress(who) !== user) continue;
    } catch {
      if (String(who).toLowerCase() !== user.toLowerCase()) continue;
    }

    const base = {
      hash,
      blockNumber,
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
      source: "receipt",
    };

    switch (parsed.name) {
      case "Minted":
        records.push({
          ...base,
          type: "Mint",
          usdtAmount: ethers.formatEther(parsed.args.usdtAmount ?? parsed.args[1] ?? 0),
          btcAmount: ethers.formatEther(parsed.args.btcAmount ?? parsed.args[2] ?? 0),
          price: ethers.formatEther(parsed.args.currentPrice ?? parsed.args[3] ?? 0),
          category: "purchase",
        });
        break;
      case "Staked":
        records.push({
          ...base,
          type: "Stake",
          btcAmount: ethers.formatEther(parsed.args.amountTokens ?? parsed.args[1] ?? 0),
          usdValue: ethers.formatEther(parsed.args.amountUSD ?? parsed.args[2] ?? 0),
          ratePerDay: Number(parsed.args.ratePerDay ?? parsed.args[3] ?? 0) / 100,
          lockupMonths: 12,
          category: "purchase",
        });
        break;
      case "Sold":
        records.push({
          ...base,
          type: "Sell",
          btcAmount: ethers.formatEther(parsed.args.btcAmount ?? parsed.args[1] ?? 0),
          usdtAmount: ethers.formatEther(parsed.args.usdtAmount ?? parsed.args[2] ?? 0),
          category: "withdrawal",
        });
        break;
      case "Unstaked":
        records.push({
          ...base,
          type: "Unstake",
          btcAmount: ethers.formatEther(parsed.args.tokenReturned ?? parsed.args[2] ?? 0),
          category: "withdrawal",
        });
        break;
      case "RewardClaimed":
        records.push({
          ...base,
          type: "Yield Claim",
          btcAmount: ethers.formatEther(parsed.args.rewardTokens ?? parsed.args[2] ?? 0),
          usdValue: ethers.formatEther(parsed.args.rewardUSD ?? parsed.args[3] ?? 0),
          category: "withdrawal",
        });
        break;
      case "RankBonusClaimed":
        records.push({
          ...base,
          type: "Rank Bonus",
          usdValue: ethers.formatEther(parsed.args.bonusUSD ?? parsed.args[2] ?? 0),
          category: "withdrawal",
        });
        break;
      case "MonthlySalaryClaimed":
        records.push({
          ...base,
          type: "Monthly Salary",
          usdValue: ethers.formatEther(parsed.args.salaryUSD ?? parsed.args[1] ?? 0),
          category: "withdrawal",
        });
        break;
      case "CouponApplied":
        records.push({
          ...base,
          type: "Coupon",
          code: parsed.args.code ?? parsed.args[1],
          usdValue: ethers.formatEther(parsed.args.rewardUSD ?? parsed.args[2] ?? 0),
          category: "purchase",
        });
        break;
      case "WheelSpun":
        records.push({
          ...base,
          type: "Wheel Spin",
          prizeIdx: Number(parsed.args.index ?? parsed.args[1] ?? 0),
          rewardTokens: ethers.formatEther(parsed.args.rewardAmount ?? parsed.args[2] ?? 0),
          category: "purchase",
        });
        break;
      default:
        break;
    }
  }

  return records;
}

export async function importHistoryFromTxHash(stakingContract, provider, account, txHash) {
  const hash = txHash.trim();
  if (!hash || !hash.startsWith("0x")) {
    throw new Error("Enter a valid transaction hash (0x…).");
  }
  const receipt = await provider.getTransactionReceipt(hash);
  if (!receipt) {
    throw new Error("Transaction not found yet. Wait for confirmation and try again.");
  }
  const records = await historyRecordsFromReceipt(receipt, stakingContract, account, provider);
  if (!records.length) {
    throw new Error("No platform events for your wallet in this transaction.");
  }
  records.forEach((r) => appendLocalTransaction(account, r));
  return records;
}

export function mergeTransactionHistories(chainTxs, localTxs) {
  const map = new Map();
  [...chainTxs, ...localTxs].forEach((tx) => {
    const key = tx.hash ? String(tx.hash).toLowerCase() : `${tx.type}-${tx.blockNumber}-${tx.timestamp}`;
    const existing = map.get(key);
    if (!existing || (tx.blockNumber || 0) >= (existing.blockNumber || 0)) {
      map.set(key, tx);
    }
  });
  return Array.from(map.values()).sort((a, b) => {
    const tb = b.timestamp || (b.date ? new Date(b.date).getTime() / 1000 : 0);
    const ta = a.timestamp || (a.date ? new Date(a.date).getTime() / 1000 : 0);
    return tb - ta;
  });
}

async function queryTokenTransfersFromStaking(tokenAddress, stakingAddress, account, provider) {
  if (!tokenAddress || !stakingAddress || !account) return [];
  const token = new ethers.Contract(
    tokenAddress,
    ["event Transfer(address indexed from, address indexed to, uint256 value)"],
    provider
  );
  const user = ethers.getAddress(account);
  const staking = ethers.getAddress(stakingAddress).toLowerCase();

  const latest = await provider.getBlockNumber();
  const from = Math.max(0, latest - MAX_LOG_BLOCK_RANGE);
  let incoming = [];
  try {
    incoming = await token.queryFilter(token.filters.Transfer(stakingAddress, user), from, "latest");
  } catch {
    /* skip — avoids extra chunked scans */
  }

  return incoming.filter((e) => {
    const from = e.args?.from ?? e.args?.[0];
    try {
      return ethers.getAddress(from).toLowerCase() === staking;
    } catch {
      return String(from).toLowerCase() === staking;
    }
  });
}

const HISTORY_EVENT_NAMES = [
  "Minted",
  "Staked",
  "Sold",
  "Unstaked",
  "RewardClaimed",
  "RankBonusClaimed",
  "MonthlySalaryClaimed",
  "CouponApplied",
  "WheelSpun",
];

export async function buildUserTransactionHistory(
  stakingContract,
  provider,
  account,
  { tokenAddress, stakingAddress, currentPrice, deepScan = false } = {}
) {
  const queryOpts = { deepScan };
  const eventBatches = [];
  for (const name of HISTORY_EVENT_NAMES) {
    eventBatches.push(await queryUserEvents(stakingContract, name, account, provider, queryOpts));
    await sleep(100);
  }

  const [
    mintedEvents,
    stakedEvents,
    soldEvents,
    unstakedEvents,
    rewardClaimedEvents,
    rankBonusClaimedEvents,
    monthlySalaryClaimedEvents,
    couponAppliedEvents,
    wheelSpunEvents,
  ] = eventBatches;

  const tsCache = new Map();
  const txs = [];

  for (const e of mintedEvents) {
    const timestamp = await blockTimestamp(provider, e.blockNumber, tsCache);
    txs.push({
      type: "Mint",
      hash: e.transactionHash,
      usdtAmount: ethers.formatEther(e.args.usdtAmount ?? e.args[1] ?? 0),
      btcAmount: ethers.formatEther(e.args.btcAmount ?? e.args[2] ?? 0),
      price: ethers.formatEther(e.args.currentPrice ?? e.args[3] ?? 0),
      blockNumber: e.blockNumber,
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
      category: "purchase",
      source: "chain",
    });
  }

  for (const e of stakedEvents) {
    const timestamp = await blockTimestamp(provider, e.blockNumber, tsCache);
    const endTime = Number(e.args.endTime ?? e.args[4] ?? 0);
    const startEstimate = timestamp;
    const lockupMonths = endTime > startEstimate ? Math.max(1, Math.round((endTime - startEstimate) / (30 * 86400))) : 12;
    txs.push({
      type: "Stake",
      hash: e.transactionHash,
      btcAmount: ethers.formatEther(e.args.amountTokens ?? e.args[1] ?? 0),
      usdValue: ethers.formatEther(e.args.amountUSD ?? e.args[2] ?? 0),
      ratePerDay: Number(e.args.ratePerDay ?? e.args[3] ?? 0) / 100,
      lockupMonths,
      blockNumber: e.blockNumber,
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
      category: "purchase",
      source: "chain",
    });
  }

  for (const e of soldEvents) {
    const timestamp = await blockTimestamp(provider, e.blockNumber, tsCache);
    txs.push({
      type: "Sell",
      hash: e.transactionHash,
      btcAmount: ethers.formatEther(e.args.btcAmount ?? e.args[1] ?? 0),
      usdtAmount: ethers.formatEther(e.args.usdtAmount ?? e.args[2] ?? 0),
      price: ethers.formatEther(e.args.price ?? e.args[3] ?? 0),
      blockNumber: e.blockNumber,
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
      category: "withdrawal",
      source: "chain",
    });
  }

  for (const e of unstakedEvents) {
    const timestamp = await blockTimestamp(provider, e.blockNumber, tsCache);
    txs.push({
      type: "Unstake",
      hash: e.transactionHash,
      btcAmount: ethers.formatEther(e.args.tokenReturned ?? e.args[2] ?? 0),
      feeUSD: ethers.formatEther(e.args.feeApplied ?? e.args[3] ?? 0),
      blockNumber: e.blockNumber,
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
      category: "withdrawal",
      source: "chain",
    });
  }

  for (const e of rewardClaimedEvents) {
    const timestamp = await blockTimestamp(provider, e.blockNumber, tsCache);
    txs.push({
      type: "Yield Claim",
      hash: e.transactionHash,
      btcAmount: ethers.formatEther(e.args.rewardTokens ?? e.args[2] ?? 0),
      usdValue: ethers.formatEther(e.args.rewardUSD ?? e.args[3] ?? 0),
      blockNumber: e.blockNumber,
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
      category: "withdrawal",
      source: "chain",
    });
  }

  for (const e of rankBonusClaimedEvents) {
    const timestamp = await blockTimestamp(provider, e.blockNumber, tsCache);
    txs.push({
      type: "Rank Bonus",
      hash: e.transactionHash,
      usdValue: ethers.formatEther(e.args.bonusUSD ?? e.args[2] ?? 0),
      blockNumber: e.blockNumber,
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
      category: "withdrawal",
      source: "chain",
    });
  }

  for (const e of monthlySalaryClaimedEvents) {
    const timestamp = await blockTimestamp(provider, e.blockNumber, tsCache);
    txs.push({
      type: "Monthly Salary",
      hash: e.transactionHash,
      usdValue: ethers.formatEther(e.args.salaryUSD ?? e.args[1] ?? 0),
      blockNumber: e.blockNumber,
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
      category: "withdrawal",
      source: "chain",
    });
  }

  for (const e of couponAppliedEvents) {
    const timestamp = await blockTimestamp(provider, e.blockNumber, tsCache);
    txs.push({
      type: "Coupon",
      hash: e.transactionHash,
      code: e.args.code ?? e.args[1],
      usdValue: ethers.formatEther(e.args.rewardUSD ?? e.args[2] ?? 0),
      blockNumber: e.blockNumber,
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
      category: "purchase",
      source: "chain",
    });
  }

  for (const e of wheelSpunEvents) {
    const timestamp = await blockTimestamp(provider, e.blockNumber, tsCache);
    txs.push({
      type: "Wheel Spin",
      hash: e.transactionHash,
      prizeIdx: Number(e.args.index ?? e.args[1] ?? 0),
      rewardTokens: ethers.formatEther(e.args.rewardAmount ?? e.args[2] ?? 0),
      blockNumber: e.blockNumber,
      timestamp,
      date: new Date(timestamp * 1000).toISOString(),
      category: "purchase",
      source: "chain",
    });
  }

  const mintHashes = new Set(
    txs.filter((t) => t.type === "Mint" && t.hash).map((t) => String(t.hash).toLowerCase())
  );

  if (deepScan && tokenAddress && stakingAddress) {
    try {
      const transfers = await queryTokenTransfersFromStaking(
        tokenAddress,
        stakingAddress,
        account,
        provider
      );
      const priceNum = parseFloat(currentPrice || "0.5") || 0.5;

      for (const e of transfers) {
        const hash = e.transactionHash;
        if (hash && mintHashes.has(String(hash).toLowerCase())) continue;

        const timestamp = await blockTimestamp(provider, e.blockNumber, tsCache);
        const btcAmount = ethers.formatEther(e.args?.value ?? e.args?.[2] ?? 0);
        const usdEst = (parseFloat(btcAmount) * priceNum).toFixed(2);

        txs.push({
          type: "Mint",
          hash,
          usdtAmount: usdEst,
          btcAmount,
          paymentMethod: "USDT",
          blockNumber: e.blockNumber,
          timestamp,
          date: new Date(timestamp * 1000).toISOString(),
          category: "purchase",
          source: "transfer",
        });
        if (hash) mintHashes.add(String(hash).toLowerCase());
      }
    } catch (err) {
      console.warn("Token transfer history fallback failed:", err);
    }
  }

  return mergeTransactionHistories(txs, readLocalTransactionHistory(account));
}

export function buildMintVolumeChart(mintedEvents, currentBlock) {
  if (!mintedEvents.length) return [];

  const sorted = [...mintedEvents].sort((a, b) => a.blockNumber - b.blockNumber);
  const points = [];
  let cumulative = 0;

  sorted.forEach((event) => {
    const usd = parseFloat(ethers.formatEther(event.args[1] || event.args.usdtAmount || 0));
    cumulative += usd;
    const estTimestamp = Math.floor(Date.now() / 1000) - Math.max(0, currentBlock - event.blockNumber) * 3;
    points.push({ cumulative, timestamp: estTimestamp });
  });

  if (points.length <= 8) return points;

  const sampled = [];
  const step = Math.max(1, Math.floor(points.length / 8));
  for (let i = 0; i < points.length; i += step) {
    sampled.push(points[i]);
  }
  if (sampled[sampled.length - 1] !== points[points.length - 1]) {
    sampled.push(points[points.length - 1]);
  }
  return sampled;
}

export function sumRewardsPaidUSD(events, currentPrice) {
  let total = 0;

  events.rewardClaimed.forEach((e) => {
    total += parseFloat(ethers.formatEther(e.args[3] || e.args.rewardUSD || 0));
  });
  events.rankBonusClaimed.forEach((e) => {
    total += parseFloat(ethers.formatEther(e.args[2] || e.args.bonusUSD || 0));
  });
  events.monthlySalaryClaimed.forEach((e) => {
    total += parseFloat(ethers.formatEther(e.args[1] || e.args.salaryUSD || 0));
  });
  events.couponApplied.forEach((e) => {
    total += parseFloat(ethers.formatEther(e.args[2] || e.args.rewardUSD || 0));
  });
  events.wheelSpun.forEach((e) => {
    const tokens = parseFloat(ethers.formatEther(e.args[2] || e.args.rewardAmount || 0));
    total += tokens * parseFloat(currentPrice || "0.5");
  });

  return total;
}

export function computeGrowthPercent(points, daysWindow = 7) {
  if (points.length < 2) return null;
  const now = Math.floor(Date.now() / 1000);
  const windowSec = daysWindow * 86400;

  const recent = points.filter((p) => p.timestamp >= now - windowSec);
  const previous = points.filter((p) => p.timestamp >= now - windowSec * 2 && p.timestamp < now - windowSec);

  if (!recent.length || !previous.length) return null;

  const recentVal = recent[recent.length - 1].cumulative;
  const previousVal = previous[previous.length - 1].cumulative;
  if (previousVal <= 0) return null;

  return ((recentVal - previousVal) / previousVal) * 100;
}

export function buildBondingCurveTiers(startPrice, stepVolume, stepIncrease, totalUsdMinted, windowSize = 5) {
  const start = parseFloat(ethers.formatEther(startPrice));
  const volume = parseFloat(ethers.formatEther(stepVolume));
  const increase = parseFloat(ethers.formatEther(stepIncrease));
  const totalUsd = parseFloat(totalUsdMinted) || 0;

  const currentStep = Math.floor(totalUsd / volume);
  const bandProgress = volume > 0 ? ((totalUsd % volume) / volume) * 100 : 0;
  const fromStep = Math.max(0, currentStep - 1);
  const toStep = currentStep + (windowSize - 2);

  const tiers = [];
  for (let step = fromStep; step <= toStep; step++) {
    const price = start + step * increase;
    const bandMin = step * volume;
    const bandMax = (step + 1) * volume;
    let status = "Upcoming";
    if (step < currentStep) status = "Passed";
    if (step === currentStep) status = "Live";

    tiers.push({
      step,
      price,
      bandMin,
      bandMax,
      status,
      progress: step === currentStep ? bandProgress : step < currentStep ? 100 : 0,
    });
  }

  return { tiers, currentStep, bandProgress };
}

export function chartPathFromPoints(points, width = 300, height = 120) {
  if (!points.length) {
    return { path: `M 0 ${height - 10} L ${width} ${height - 10}`, dotY: height - 10, labels: [] };
  }

  const maxVal = Math.max(...points.map((p) => p.cumulative), 1);
  const padding = 15;
  const usableHeight = height - padding * 2;

  const coords = points.map((p, i) => {
    const x = points.length === 1 ? width / 2 : (i / (points.length - 1)) * width;
    const y = height - padding - (p.cumulative / maxVal) * usableHeight;
    return { x, y, timestamp: p.timestamp };
  });

  const pathParts = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`);
  const labels = coords.map((c) =>
    new Date(c.timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  );

  const last = coords[coords.length - 1];
  return { path: pathParts.join(" "), dotY: last.y, dotX: last.x, labels };
}

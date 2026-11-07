/**
 * 🌐 SOVEREIGN GLOBAL PROTOCOL v3.3
 * (Master Final Architecture & 10X Viral Edition)
 * 100% P2P Instant Split on BNB Smart Chain (BSC) in USDT (BEP-20)
 */

export const PROTOCOL_NAME = "Sovereign Global Protocol v3.3";
export const PROTOCOL_EDITION = "Master Final Architecture & 10X Viral Edition";
export const BLOCKCHAIN_NETWORK = "BNB Smart Chain (BSC)";
export const TOKEN_STANDARD = "USDT (BEP-20)";
export const GAS_FEE_ASSET = "BNB";

// Genesis Setup: Admin Triangle Chain (Top 3 Hardcoded IDs)
export const GENESIS_ADMIN_TRIANGLE = [
  { id: 1, label: "Admin Apex Master #1", address: "0x89A3B56f2B11c6d328F50EcB75FaCeB0F9C11111" },
  { id: 2, label: "Admin Left Core #2", address: "0x44D211F9C01b7a54B4B929a0F1C5F07122222222" },
  { id: 3, label: "Admin Right Core #3", address: "0x98EE44B1D0f5e14d31B91738CaC88d4033333333" }
];

// 6 Fixed Packages
export const PROTOCOL_PACKAGES = [
  { val: 25, label: "$25 STARTER", tier: "Tier 1", roiCap: 50, hardCap3X: 75, monolineReach: "15 Up + 15 Down" },
  { val: 50, label: "$50 RUNNER", tier: "Tier 2", roiCap: 100, hardCap3X: 150, monolineReach: "15 Up + 15 Down" },
  { val: 100, label: "$100 PRO", tier: "Tier 3", roiCap: 200, hardCap3X: 300, monolineReach: "15 Up + 15 Down" },
  { val: 200, label: "$200 ELITE", tier: "Tier 4", roiCap: 400, hardCap3X: 600, monolineReach: "15 Up + 15 Down" },
  { val: 500, label: "$500 MASTER", tier: "Tier 5", roiCap: 1000, hardCap3X: 1500, monolineReach: "15 Up + 15 Down" },
  { val: 1000, label: "$1,000 TITAN VIP", tier: "Tier 6", roiCap: 2000, hardCap3X: 3000, monolineReach: "15 Up + 15 Down" }
];

// 5 Community Pools (100% Live Split)
export const COMMUNITY_POOLS = [
  {
    id: "roi",
    name: "Time-Bomb Quantum ROI",
    splitPct: 30,
    capMultiplier: 2.0, // 200% (2X)
    description: "Global passive pool. First 10 days 3% daily, then 1% daily. 1 new direct referral resets 3% rate for another 10 days.",
    rules: {
      initialDailyRate: 3.0,
      initialDays: 10,
      postDaysDailyRate: 1.0,
      directResetDays: 10,
      withdrawalSplit: { cash: 40, reinvest: 60 },
      directsRequiredForWithdrawal: 0
    }
  },
  {
    id: "monoline",
    name: "Monoline Nexus Yield",
    splitPct: 30,
    description: "Global single leg monoline. 1% commission each from 15 active wallets above and 15 active wallets below with dynamic compression.",
    reachUpline: 15,
    reachDownline: 15,
    ratePerWalletPct: 1.0
  },
  {
    id: "velocity",
    name: "Velocity Multi-Tier Bonus",
    splitPct: 25,
    description: "9-level generation unilevel income with fixed 13% direct commission on Level 1.",
    levels: [
      { level: 1, pct: 13, reqDirects: 0, note: "Always unlocked for ROI withdrawal, working locked until 3 directs" },
      { level: 2, pct: 3, reqDirects: 1, note: "Requires 1 active direct" },
      { level: 3, pct: 2, reqDirects: 1, note: "Requires 1 active direct" },
      { level: 4, pct: 1, reqDirects: 2, note: "Requires 2 active directs" },
      { level: 5, pct: 1, reqDirects: 2, note: "Requires 2 active directs" },
      { level: 6, pct: 1, reqDirects: 2, note: "Requires 2 active directs" },
      { level: 7, pct: 1, reqDirects: 3, note: "Requires 3 active directs" },
      { level: 8, pct: 1, reqDirects: 3, note: "Requires 3 active directs" },
      { level: 9, pct: 1, reqDirects: 3, note: "Requires 3 active directs" }
    ]
  },
  {
    id: "cashback",
    name: "72H Alpha Cashback Surge",
    splitPct: 10,
    description: "Sponsor 3 active directs within 72 hours of activation to get 100% of your joining fee refunded. Unclaimed funds roll into Community Airdrop Pool.",
    windowHours: 72,
    directsRequired: 3,
    refundPct: 100
  },
  {
    id: "fomo",
    name: "FOMO Apocalypse Jackpot",
    splitPct: 5,
    description: "24-hour countdown pool. 70% shared among the last 50 paid users and 30% split among top 3 direct sponsors.",
    countdownHours: 24,
    lastPaidSharePct: 70,
    lastPaidSpots: 50,
    topSponsorsSharePct: 30,
    topSponsorsSpots: 3
  }
];

// Leader Retention & Growth Hooks
export const LEADER_MECHANISMS = {
  speedDecay: {
    inactivityDays: 14,
    normalSpeedPct: 100,
    decayedSpeedPct: 10, // Drops from 50% to 10%
    resetAction: "1 new direct sponsor"
  },
  dynamicOverride: [
    { minDirects: 4, maxDirects: 10, overridePct: 5, label: "Tier 1 Infinity Override (5%)" },
    { minDirects: 11, maxDirects: 25, overridePct: 7, label: "Tier 2 Dynamic Override (7%)" },
    { minDirects: 26, maxDirects: Infinity, overridePct: 10, label: "Master Royalty (10%)" }
  ],
  smartRebirthQueueJump: {
    qualifyingDays: 30,
    minDirects: 3,
    perk: "Re-Birth ID pushed into VIP Fast-Track Slot instead of bottom queue"
  },
  activeDirectMaintenance: {
    cycleDays: 30,
    minDirectOrVolume: 1,
    healthySplit: { cash: 70, reinvest: 30 },
    penaltySplit: { cash: 50, reinvest: 50 }
  }
};

// 300% Hard-Cap (Zero-Leak) & Re-Birth Loop
export const HARD_CAP_RULES = {
  multiplier: 3.0, // 300% (3X)
  actionOnCap: "Instant lock on income; overflow routes to System Stability Pool",
  rebirthAction: "Old ID retires; new Re-Birth ID spawned at bottom or VIP queue funded from final payout"
};

// Withdrawal & Reinvestment Rules
export const WITHDRAWAL_RULES = {
  minWithdrawalUSD: 5,
  quantumRoi: {
    teamRequirement: 0,
    cashPct: 40,
    reinvestPct: 60
  },
  workingNetwork: {
    requiredDirectsToUnlock: 3,
    standardSplit: { cash: 70, reinvest: 30 },
    decayedSplit: { cash: 50, reinvest: 50 }
  }
};

// Simulated Real-Time Global Queue Stream Feed
export const LIVE_STREAM_BLOCK = {
  blockNumber: 4892011,
  totalActiveWallets: 14892,
  monolineDepth: 84210,
  dailyTurnoverUSD: 342800,
  initialTicker: [
    { id: 1, wallet: "0x7F8C...31A2", action: "Joined Package: $1,000", detail: "30% ROI | 30% Monoline | 25% Gen | 10% CB | 5% FOMO" },
    { id: 2, wallet: "0x3B91...99E4", action: "Re-Birth Loop Triggered", detail: "3X Limit Reached ($3,000) ➔ Spawned at VIP Fast-Track" },
    { id: 3, wallet: "0x112A...55C8", action: "Monoline Nexus Yield", detail: "Claimed from upper/lower 15 active wallets" },
    { id: 4, wallet: "0x98EE...44B1", action: "Ghost Position Expired", detail: "Slot deleted due to non-activation within 10 minutes" },
    { id: 5, wallet: "0x44D2...11F9", action: "Velocity Gen Payout", detail: "Level 1 (13%) distributed instantly to sponsor" },
    { id: 6, wallet: "0x66C3...77B5", action: "72H Cashback Surge", detail: "3 Directs verified ➔ 100% Joining Fee Refunded ($500)" }
  ]
};

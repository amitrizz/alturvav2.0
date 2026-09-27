/** AI EARN BTC3.0 PLAN — marketing + UI tables (sync with BtcStakingSystem.sol) */

export const PLAN_RANK_BONUSES = [
  { rank: "Bronze", selfUsd: 500, directs: 3, team: 10, bonusUsd: 20 },
  { rank: "Silver", selfUsd: 1000, directs: 6, team: 30, bonusUsd: 50 },
  { rank: "Gold", selfUsd: 1500, directs: 9, team: 100, bonusUsd: 100 },
  { rank: "Diamond", selfUsd: 2500, directs: 12, team: 300, bonusUsd: 250 },
  { rank: "Platinum", selfUsd: 4000, directs: 15, team: 800, bonusUsd: 500 },
  { rank: "Sapphire", selfUsd: 7000, directs: 18, team: 2500, bonusUsd: 1200 },
  { rank: "Ruby", selfUsd: 15000, directs: 21, team: 7500, bonusUsd: 2500 },
  { rank: "Emerald", selfUsd: 25000, directs: 24, team: 25000, bonusUsd: 6600 },
  { rank: "Crown", selfUsd: 40000, directs: 27, team: 75000, bonusUsd: 16500 },
  { rank: "Elite Crown", selfUsd: 55000, directs: 30, team: 250000, bonusUsd: 50000 },
];

export const PLAN_MONTHLY_SALARIES = [
  { rank: "Gold", selfUsd: 1500, directs: 9, team: 100, salaryUsd: 50 },
  { rank: "Diamond", selfUsd: 2500, directs: 12, team: 300, salaryUsd: 80 },
  { rank: "Platinum", selfUsd: 4000, directs: 12, team: 300, salaryUsd: 120 },
  { rank: "Sapphire", selfUsd: 7000, directs: 18, team: 2500, salaryUsd: 350 },
  { rank: "Ruby", selfUsd: 15000, directs: 21, team: 7500, salaryUsd: 800 },
  { rank: "Emerald", selfUsd: 25000, directs: 21, team: 25000, salaryUsd: 1100 },
  { rank: "Crown", selfUsd: 40000, directs: 27, team: 75000, salaryUsd: 4800 },
  { rank: "Elite Crown", selfUsd: 55000, directs: 30, team: 250000, salaryUsd: 10000 },
];

export const TOKENOMICS_PUBLIC_PERCENT = 85;

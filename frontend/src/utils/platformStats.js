import { ethers } from "ethers";

export async function queryEventsWithFallback(contract, filter, provider) {
  try {
    return await contract.queryFilter(filter, 0, "latest");
  } catch {
    try {
      const currentBlock = await provider.getBlockNumber();
      return await contract.queryFilter(filter, Math.max(0, currentBlock - 50000), "latest");
    } catch {
      return [];
    }
  }
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

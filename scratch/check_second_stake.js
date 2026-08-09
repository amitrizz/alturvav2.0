const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
  const addresses = JSON.parse(fs.readFileSync("frontend/src/addresses.json", "utf8"));
  
  const abi = [
    "function userStakes(address, uint256) view returns (uint256 amountTokens, uint256 amountUSD, uint256 startTime, uint256 lastClaimTime, uint256 rewardClaimedUSD, uint256 rewardCapUSD, bool is365Day, bool active)",
    "function getPendingReward(address _user, uint256 _index) view returns (uint256 rewardTokens, uint256 rewardUSD)"
  ];

  const contract = new ethers.Contract(addresses.stakingSystem, abi, provider);
  const refereeAddr = "0x06a9982979c8d307932e45db4f93E52bB8200A3b";

  console.log("Checking userStakes index 1:");
  const st1 = await contract.userStakes(refereeAddr, 1);
  console.log("Second Stake Position:", {
    amountTokens: ethers.formatEther(st1.amountTokens),
    amountUSD: ethers.formatEther(st1.amountUSD),
    startTime: new Date(Number(st1.startTime) * 1000).toLocaleString(),
    lastClaimTime: new Date(Number(st1.lastClaimTime) * 1000).toLocaleString(),
    rewardClaimedUSD: ethers.formatEther(st1.rewardClaimedUSD),
    rewardCapUSD: ethers.formatEther(st1.rewardCapUSD),
    is365Day: st1.is365Day,
    active: st1.active
  });

  const pending = await contract.getPendingReward(refereeAddr, 1);
  console.log("Pending Reward:", {
    rewardTokens: ethers.formatEther(pending.rewardTokens),
    rewardUSD: ethers.formatEther(pending.rewardUSD)
  });
}

main().catch(console.error);

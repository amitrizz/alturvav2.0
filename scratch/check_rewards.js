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

  console.log("Checking User Stakes for:", refereeAddr);
  const st = await contract.userStakes(refereeAddr, 0);
  console.log("First Stake Position:", {
    amountTokens: ethers.formatEther(st.amountTokens),
    amountUSD: ethers.formatEther(st.amountUSD),
    startTime: new Date(Number(st.startTime) * 1000).toLocaleString(),
    lastClaimTime: new Date(Number(st.lastClaimTime) * 1000).toLocaleString(),
    rewardClaimedUSD: ethers.formatEther(st.rewardClaimedUSD),
    rewardCapUSD: ethers.formatEther(st.rewardCapUSD),
    is365Day: st.is365Day,
    active: st.active
  });

  const pending = await contract.getPendingReward(refereeAddr, 0);
  console.log("Pending Reward:", {
    rewardTokens: ethers.formatEther(pending.rewardTokens),
    rewardUSD: ethers.formatEther(pending.rewardUSD)
  });
}

main().catch(console.error);

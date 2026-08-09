const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
  const addresses = JSON.parse(fs.readFileSync("frontend/src/addresses.json", "utf8"));
  
  const abi = [
    "function users(address) view returns (address referrer, uint256 directActiveCount, uint256 totalSelfStakeUSD, uint256 totalTeamBusinessUSD, uint256 dailyRankReward, uint256 lastRankClaimTime, uint256 currentRank, bool registered)",
    "function getDirectsCount(address _user) view returns (uint256)"
  ];

  const contract = new ethers.Contract(addresses.stakingSystem, abi, provider);

  const referrerAddr = "0xb4f76803C43Bf84E249E0EC15c7545701F5FeD63";
  const refereeAddr = ethers.getAddress("0x06a9982979c8d307932e45db4f93E52bB8200A3b".toLowerCase());

  console.log("Checking Referrer:", referrerAddr);
  const refUser = await contract.users(referrerAddr);
  console.log("Referrer Data:", {
    referrer: refUser.referrer,
    directActiveCount: refUser.directActiveCount.toString(),
    totalSelfStakeUSD: ethers.formatEther(refUser.totalSelfStakeUSD),
    totalTeamBusinessUSD: ethers.formatEther(refUser.totalTeamBusinessUSD),
    registered: refUser.registered
  });

  console.log("\nChecking Referee:", refereeAddr);
  const user = await contract.users(refereeAddr);
  console.log("Referee Data:", {
    referrer: user.referrer,
    directActiveCount: user.directActiveCount.toString(),
    totalSelfStakeUSD: ethers.formatEther(user.totalSelfStakeUSD),
    totalTeamBusinessUSD: ethers.formatEther(user.totalTeamBusinessUSD),
    registered: user.registered
  });
}

main().catch(console.error);

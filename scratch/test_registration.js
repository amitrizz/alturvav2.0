const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
  const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const addresses = JSON.parse(fs.readFileSync("frontend/src/addresses.json", "utf8"));

  console.log("Wallet:", wallet.address);
  console.log("Staking system contract:", addresses.stakingSystem);

  const abi = [
    "function register(address _referrer) external",
    "function users(address) view returns (address referrer, uint256 directActiveCount, uint256 totalSelfStakeUSD, uint256 totalTeamBusinessUSD, uint256 dailyRankReward, uint256 lastRankClaimTime, uint256 currentRank, bool registered)"
  ];

  const contract = new ethers.Contract(addresses.stakingSystem, abi, wallet);

  // Check if wallet is registered
  const user = await contract.users(wallet.address);
  console.log("Deployer registered status:", user.registered);

  if (!user.registered) {
    console.log("Attempting to register deployer with ZeroAddress...");
    try {
      const tx = await contract.register(ethers.ZeroAddress);
      console.log("Tx hash:", tx.hash);
      const receipt = await tx.wait();
      console.log("Registration succeeded! Gas used:", receipt.gasUsed.toString());
    } catch (err) {
      console.error("Registration failed with error:", err);
    }
  } else {
    console.log("Deployer already registered!");
  }
}

main();

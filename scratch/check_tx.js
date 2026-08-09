const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
  const address = "0x06A99dF41D83aB529Ef0c48F67FD571a812D0A3B";
  
  // Get transaction count
  const txCount = await provider.getTransactionCount(address);
  console.log("Transaction count:", txCount);

  // Since RPC providers don't easily allow listing history of an address directly, 
  // let's fetch the events from the BtcStakingSystem contract!
  const fs = require("fs");
  const addresses = JSON.parse(fs.readFileSync("frontend/src/addresses.json", "utf8"));
  
  const abi = [
    "event RewardClaimed(address indexed user, uint256 stakeIndex, uint256 rewardTokens, uint256 rewardUSD)",
    "event CommissionPaid(address indexed referrer, address indexed referee, uint256 level, uint256 amountTokens)"
  ];
  
  const contract = new ethers.Contract(addresses.stakingSystem, abi, provider);
  
  const filter = contract.filters.RewardClaimed(address);
  const events = await contract.queryFilter(filter, -1000); // query last 1000 blocks
  
  console.log("RewardClaimed Events found:", events.length);
  for (const event of events) {
    console.log("Event:", {
      user: event.args[0],
      stakeIndex: event.args[1].toString(),
      rewardTokens: ethers.formatEther(event.args[2]),
      rewardUSD: ethers.formatEther(event.args[3]),
      txHash: event.transactionHash
    });
  }
}

main().catch(console.error);

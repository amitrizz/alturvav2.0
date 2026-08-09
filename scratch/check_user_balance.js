const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
  const addresses = JSON.parse(fs.readFileSync("frontend/src/addresses.json", "utf8"));
  
  const tokenAbi = [
    "function balanceOf(address) view returns (uint256)"
  ];
  
  const tokenContract = new ethers.Contract(addresses.token, tokenAbi, provider);
  const user = "0x06a9982979c8d307932e45db4f93E52bB8200A3b";
  
  const bal = await tokenContract.balanceOf(user);
  console.log("User RSS Balance:", ethers.formatEther(bal), "RSS");
}

main().catch(console.error);

const { ethers } = require("ethers");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
  const deployer = "0xb4f76803C43Bf84E249E0EC15c7545701F5FeD63";
  const bal = await provider.getBalance(deployer);
  console.log("Deployer tBNB Balance:", ethers.formatEther(bal), "tBNB");
}

main().catch(console.error);

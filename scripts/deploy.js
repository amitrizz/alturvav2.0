const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy MockUSDT
  console.log("Deploying MockUSDT...");
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("MockUSDT deployed to:", usdtAddress);

  // 2. Deploy BtcToken
  console.log("Deploying BtcToken (BTC 3.0 / RSS)...");
  const BtcToken = await hre.ethers.getContractFactory("BtcToken");
  const initialSupply = hre.ethers.parseEther("100000000"); // 100 million tokens (10 crores)
  const token = await BtcToken.deploy("BTC 3.0", "BTC 3.0", initialSupply);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("BtcToken deployed to:", tokenAddress);

  // 3. Deploy BtcStakingSystem
  console.log("Deploying BtcStakingSystem...");
  const BtcStakingSystem = await hre.ethers.getContractFactory("BtcStakingSystem");
  const stakingSystem = await BtcStakingSystem.deploy(tokenAddress, usdtAddress);
  await stakingSystem.waitForDeployment();
  const stakingSystemAddress = await stakingSystem.getAddress();
  console.log("BtcStakingSystem deployed to:", stakingSystemAddress);

  // 4. Fund Staking contract with 85% of total supply (85,000,000 BTC3.O)
  console.log("Funding staking system with 85 million BTC 3.0 (85% of supply)...");
  const fundAmount = hre.ethers.parseEther("85000000");
  const transferTx = await token.transfer(stakingSystemAddress, fundAmount);
  await transferTx.wait();
  console.log("Staking contract successfully funded with tokens!");

  // 5. Fund USDT for rank bonuses and monthly salaries
  console.log("Funding staking system with USDT for rank bonuses & salaries...");
  const usdtFundAmount = hre.ethers.parseEther("500000");
  const mintUsdtTx = await usdt.mint(deployer.address, usdtFundAmount);
  await mintUsdtTx.wait();
  const usdtTransferTx = await usdt.transfer(stakingSystemAddress, usdtFundAmount);
  await usdtTransferTx.wait();
  console.log("Staking contract funded with 500,000 USDT for rewards!");

  const network = await hre.ethers.provider.getNetwork();
  const chainIdHex = "0x" + network.chainId.toString(16);

  // Save deployment info to a JSON file for frontend access
  const addresses = {
    chainId: chainIdHex,
    usdt: usdtAddress,
    token: tokenAddress,
    stakingSystem: stakingSystemAddress,
    tokenName: "BTC 3.0",
    tokenSymbol: "BTC 3.0"
  };

  const frontendConfigDir = path.join(__dirname, "..", "frontend", "src");
  if (!fs.existsSync(frontendConfigDir)) {
    fs.mkdirSync(frontendConfigDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(frontendConfigDir, "addresses.json"),
    JSON.stringify(addresses, null, 2)
  );
  console.log("Saved deployed contract addresses to frontend src/addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

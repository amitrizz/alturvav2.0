const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Sovereign Global Protocol v3.3 contracts with:", deployer.address);

  // 1. Deploy or reuse MockUSDT
  console.log("Deploying MockUSDT...");
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const usdt = await MockUSDT.deploy();
  await usdt.waitForDeployment();
  const usdtAddress = await usdt.getAddress();
  console.log("MockUSDT deployed to:", usdtAddress);

  // 2. Define Admin Triangle Chain (Top 3 Hardcoded IDs)
  const adminApex1 = deployer.address;
  // Use secondary derived addresses or deployer
  const adminLeft2 = "0x44D211F9C01b7a54B4B929a0F1C5F07122222222";
  const adminRight3 = "0x98EE44B1D0f5e14d31B91738CaC88d4033333333";

  // 3. Deploy SovereignGlobalCore
  console.log("Deploying SovereignGlobalCore...");
  const SovereignGlobalCore = await hre.ethers.getContractFactory("SovereignGlobalCore");
  const core = await SovereignGlobalCore.deploy(usdtAddress, adminApex1, adminLeft2, adminRight3);
  await core.waitForDeployment();
  const coreAddress = await core.getAddress();
  console.log("SovereignGlobalCore deployed to:", coreAddress);

  const network = await hre.ethers.provider.getNetwork();
  const chainIdHex = "0x" + network.chainId.toString(16);

  // Update frontend addresses.json
  const addresses = {
    chainId: chainIdHex,
    network: network.chainId === 97n ? "BSC Testnet" : "Localhost",
    usdt: usdtAddress,
    sovereignCore: coreAddress,
    altruvaCore: coreAddress,
    adminApex1: adminApex1,
    adminLeft2: adminLeft2,
    adminRight3: adminRight3,
    tokenSymbol: "USDT",
    currency: "USDT"
  };

  const frontendConfigDir = path.join(__dirname, "..", "frontend", "src");
  fs.writeFileSync(
    path.join(frontendConfigDir, "addresses.json"),
    JSON.stringify(addresses, null, 2)
  );
  console.log("Updated frontend/src/addresses.json with SovereignGlobalCore!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


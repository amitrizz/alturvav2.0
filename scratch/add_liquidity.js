const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

async function main() {
  const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const addresses = JSON.parse(fs.readFileSync("frontend/src/addresses.json", "utf8"));
  
  console.log("Using Wallet:", wallet.address);
  console.log("Token address:", addresses.token);
  console.log("Router address:", addresses.router);

  const tokenAbi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)"
  ];
  
  const routerAbi = [
    "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) external payable returns (uint amountToken, uint amountETH, uint liquidity)"
  ];

  const token = new ethers.Contract(addresses.token, tokenAbi, wallet);
  const router = new ethers.Contract(addresses.router, routerAbi, wallet);

  // Check balance of MTK
  const mtkBal = await token.balanceOf(wallet.address);
  console.log("Deployer MTK Balance:", ethers.formatEther(mtkBal));

  const liquidityTokenAmount = ethers.parseEther("5000"); // 5000 MTK
  const liquidityBnbAmount = ethers.parseEther("0.01"); // 0.01 BNB

  console.log("Approving router to spend MTK...");
  const approveTx = await token.approve(addresses.router, liquidityTokenAmount);
  await approveTx.wait();
  console.log("Approved!");

  console.log("Adding liquidity...");
  const deadline = Math.floor(Date.now() / 1000) + 600;
  const tx = await router.addLiquidityETH(
    addresses.token,
    liquidityTokenAmount,
    0,
    0,
    wallet.address,
    deadline,
    { value: liquidityBnbAmount }
  );

  console.log("Transaction sent:", tx.hash);
  const receipt = await tx.wait();
  console.log("Liquidity added! Gas used:", receipt.gasUsed.toString());
}

main().catch(console.error);

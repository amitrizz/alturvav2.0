const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
  const addresses = JSON.parse(fs.readFileSync("frontend/src/addresses.json", "utf8"));
  
  console.log("Addresses configuration:");
  console.log(addresses);
  
  // ABIs
  const factoryAbi = ["function getPair(address tokenA, address tokenB) external view returns (address pair)"];
  const pairAbi = [
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function token0() external view returns (address)",
    "function token1() external view returns (address)",
    "function balanceOf(address account) external view returns (uint256)"
  ];
  const routerAbi = [
    "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
  ];
  const erc20Abi = [
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)"
  ];

  const factory = new ethers.Contract(addresses.factory, factoryAbi, provider);
  const router = new ethers.Contract(addresses.router, routerAbi, provider);
  const token = new ethers.Contract(addresses.token, erc20Abi, provider);
  const weth = new ethers.Contract(addresses.weth, erc20Abi, provider);

  try {
    const pairAddress = await factory.getPair(addresses.token, addresses.weth);
    console.log("Pair Address from Factory:", pairAddress);

    if (pairAddress === ethers.ZeroAddress) {
      console.log("Pair does not exist!");
      return;
    }

    const pair = new ethers.Contract(pairAddress, pairAbi, provider);
    const token0 = await pair.token0();
    const token1 = await pair.token1();
    console.log("token0:", token0);
    console.log("token1:", token1);

    const reserves = await pair.getReserves();
    console.log("Reserves:", {
      reserve0: reserves[0].toString(),
      reserve1: reserves[1].toString()
    });

    const tokenBal = await token.balanceOf(pairAddress);
    const wethBal = await weth.balanceOf(pairAddress);
    console.log(`Balance of MTK on pair: ${ethers.formatEther(tokenBal)}`);
    console.log(`Balance of WETH on pair: ${ethers.formatEther(wethBal)}`);

    // Let's try getAmountsOut
    const path = [addresses.token, addresses.weth];
    const amountIn = ethers.parseEther("10");
    console.log(`Querying getAmountsOut for ${ethers.formatEther(amountIn)} MTK...`);
    const amounts = await router.getAmountsOut(amountIn, path);
    console.log("Amounts out:", amounts.map(a => ethers.formatEther(a)));
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

main();

const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/");
  const addresses = {
    chainId: '0x61',
    weth: '0x55D74259b0D6486C7386491ad4059125C154D5be',
    factory: '0xb366e6A1ae4eDc1a60378b4Bf036b802241dF373',
    router: '0xbf9b236D8C8312c6f03679850b3B7B01C30105C1',
    token: '0x9a5dD0D921389954cD0Aeba02F6D7B7261e16618',
    lockingSystem: '0xC7f3C932474261f2b8ae7bEB385e99cd84fbA149'
  };
  
  const erc20Abi = [
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address) external view returns (uint256)"
  ];

  const token = new ethers.Contract(addresses.token, erc20Abi, provider);
  const weth = new ethers.Contract(addresses.weth, erc20Abi, provider);

  try {
    console.log("MTK Decimals:", await token.decimals());
    console.log("MTK Symbol:", await token.symbol());
    console.log("MTK Total Supply:", (await token.totalSupply()).toString());

    console.log("WETH Decimals:", await weth.decimals());
    console.log("WETH Symbol:", await weth.symbol());
    console.log("WETH Total Supply:", (await weth.totalSupply()).toString());
  } catch (error) {
    console.error("Error:", error);
  }
}

main();

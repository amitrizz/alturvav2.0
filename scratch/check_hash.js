const fs = require('fs');
const ethers = require('ethers');

const pairJson = JSON.parse(fs.readFileSync('d:\\Home\\Desktop\\Work\\Projects\\blockchain\\cake\\artifacts\\contracts\\UniswapV2Factory.sol\\UniswapV2Pair.json', 'utf8'));
const bytecode = pairJson.bytecode;
const hash = ethers.keccak256(bytecode);
console.log('Calculated INIT_CODE_HASH:', hash);

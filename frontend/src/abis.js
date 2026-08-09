export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 value) returns (bool)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function transferFrom(address from, address to, uint256 value) returns (bool)"
];

export const BTC_STAKING_SYSTEM_ABI = [
  "function getCurrentPrice() view returns (uint256)",
  "function register(address _referrer)",
  "function mintTokens(uint256 _usdtAmount)",
  "function mintTokensWithBNB() payable",
  "function stake(uint256 _btcAmount, bool _is365Day)",
  "function userStakes(address, uint256) view returns (uint256 amountTokens, uint256 amountUSD, uint256 startTime, uint256 lastClaimTime, uint256 rewardClaimedUSD, uint256 rewardCapUSD, bool is365Day, bool active)",
  "function users(address) view returns (address referrer, uint256 directActiveCount, uint256 totalSelfStakeUSD, uint256 totalTeamBusinessUSD, uint256 dailyRankReward, uint256 lastRankClaimTime, uint256 currentRank, bool registered)",
  "function getPendingReward(address _user, uint256 _index) view returns (uint256 rewardTokens, uint256 rewardUSD)",
  "function claimStakingReward(uint256 _index)",
  "function claimRankReward()",
  "function unstake(uint256 _index)",
  "function sellTokens(uint256 _btcAmount)",
  "function sellTokensForBNB(uint256 _btcAmount)",
  "function withdrawUSDT(uint256 _amount)",
  "function withdrawBNB(uint256 _amount)",
  "function spinWheel()",
  "function setSpinCost(uint256 _newCost)",
  "function setLevelPercents(uint256[5] _newPercents)",
  "function levelPercents(uint256) view returns (uint256)",
  "function spinCost() view returns (uint256)",
  "function totalUSDValueMinted() view returns (uint256)",
  "function totalMintedTokens() view returns (uint256)",
  "function getDirectsCount(address _user) view returns (uint256)",
  "function owner() view returns (address)"
];

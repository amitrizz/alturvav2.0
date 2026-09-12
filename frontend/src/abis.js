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
  "event Registered(address indexed user, address indexed referrer)",
  "event Minted(address indexed user, uint256 usdtAmount, uint256 btcAmount, uint256 currentPrice)",
  "event Staked(address indexed user, uint256 amountTokens, uint256 amountUSD, uint256 ratePerDay, uint256 endTime)",
  "event Sold(address indexed user, uint256 btcAmount, uint256 usdtAmount, uint256 price)",
  "event Unstaked(address indexed user, uint256 stakeIndex, uint256 tokenReturned, uint256 feeApplied)",
  "event RewardClaimed(address indexed user, uint256 stakeIndex, uint256 rewardTokens, uint256 rewardUSD)",
  "event RankBonusClaimed(address indexed user, uint256 rankIndex, uint256 bonusUSD)",
  "event MonthlySalaryClaimed(address indexed user, uint256 salaryUSD)",
  "event CouponApplied(address indexed user, string code, uint256 rewardUSD)",
  "event WheelSpun(address indexed user, uint8 index, uint256 rewardAmount)",
  "function getCurrentPrice() view returns (uint256)",
  "function getRateByAmount(uint256 usdAmount) view returns (uint256)",
  "function getQualifiedSalaryRank(address _user) view returns (uint256)",
  "function qualifiesForRankBonus(address _user, uint256 _rankIndex) view returns (bool)",
  "function register(address _referrer)",
  "function mintTokens(uint256 _usdtAmount)",
  "function mintTokensWithBNB() payable",
  "function stake(uint256 _btcAmount)",
  "function userStakes(address, uint256) view returns (uint256 amountTokens, uint256 amountUSD, uint256 startTime, uint256 endTime, uint256 lastClaimTime, uint256 rewardClaimedUSD, uint256 ratePerDay, bool active)",
  "function users(address) view returns (address referrer, uint256 directActiveCount, uint256 directReferralsCount, uint256 teamSize, uint256 totalSelfStakeUSD, uint256 totalTeamBusinessUSD, uint256 lastSalaryClaimTime, uint256 highestSalaryRank, bool registered)",
  "function rankBonuses(uint256) view returns (string name, uint256 minSelfUSD, uint256 minDirects, uint256 minTeamSize, uint256 oneTimeBonusUSD)",
  "function salaries(uint256) view returns (string name, uint256 minSelfUSD, uint256 minDirects, uint256 minTeamSize, uint256 monthlySalaryUSD)",
  "function rankBonusClaimed(address, uint256) view returns (bool)",
  "function getPendingReward(address _user, uint256 _index) view returns (uint256 rewardTokens, uint256 rewardUSD)",
  "function claimStakingReward(uint256 _index)",
  "function claimRankBonus(uint256 _rankIndex)",
  "function claimMonthlySalary()",
  "function unstake(uint256 _index)",
  "function sellTokens(uint256 _btcAmount)",
  "function sellTokensForBNB(uint256 _btcAmount)",
  "function withdrawUSDT(uint256 _amount)",
  "function withdrawBNB(uint256 _amount)",
  "function spinWheel()",
  "function setSpinCost(uint256 _newCost)",
  "function levelPercents(uint256) view returns (uint256)",
  "function spinCost() view returns (uint256)",
  "function totalUSDValueMinted() view returns (uint256)",
  "function totalMintedTokens() view returns (uint256)",
  "function START_PRICE() view returns (uint256)",
  "function PRICE_STEP_VOLUME() view returns (uint256)",
  "function PRICE_STEP_INCREASE() view returns (uint256)",
  "function owner() view returns (address)",
  "function applyCoupon(string _code)"
];

export const ROI_TIERS = [
  { min: 10, max: 499, rate: 0.5 },
  { min: 500, max: 2000, rate: 0.6 },
  { min: 2001, max: 5000, rate: 0.75 },
  { min: 5001, max: 10000, rate: 1.0 },
];

export const LEVEL_COMMISSIONS = [
  8, 1, 1, 1, 1,
  0.5, 0.5, 0.5, 0.5, 0.5,
  0.25, 0.25, 0.25, 0.25, 0.25,
  0.1, 0.1, 0.1, 0.1, 0.1,
];

export const RANK_BONUS_NAMES = [
  "Bronze", "Silver", "Gold", "Diamond", "Platinum",
  "Sapphire", "Ruby", "Emerald", "Crown", "Elite Crown"
];

export const SALARY_RANK_NAMES = [
  "Gold", "Diamond", "Platinum", "Sapphire", "Ruby", "Emerald", "Crown", "Elite Crown"
];

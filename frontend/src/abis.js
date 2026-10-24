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

export const ALTRUVA_CORE_ABI = [
  "event Registered(address indexed user, address indexed referrer, uint256 globalIndex)",
  "event PackagePurchased(address indexed user, uint256 amountUSD, bool isReinvestment)",
  "event SingleLegDistributed(address indexed source, address indexed recipient, uint256 amountUSD, uint256 level, bool isUpline)",
  "event LevelCommissionDistributed(address indexed source, address indexed recipient, uint256 amountUSD, uint256 level)",
  "event BinaryMatched(address indexed user, uint256 matchedUSD, uint256 rewardUSD)",
  "event Withdrawn(address indexed user, uint256 sentToWalletUSD, uint256 autoReinvestUSD)",
  "event CouponClaimed(address indexed user, uint256 rewardUSD)",
  "event LeadershipBonusClaimed(address indexed user, uint256 amountUSD)",

  "function registerAndActivate(address _referrer, uint256 _amountUSD, uint8 _preferredLeg) external",
  "function registerAndBuy(address _sponsor, uint256 _amountUSD, uint8 _preferredLeg) external",
  "function upgradePackage(uint256 _amountUSD) external",
  "function setPreferredLeg(uint8 _preferredLeg) external",
  "function withdraw(uint256 _amountUSD) external",
  "function scratchCoupon() external returns (uint256 prizeUSD)",
  "function claimLeadershipBonus() external returns (uint256 amountUSD)",

  "function users(address) view returns (bool registered, uint256 globalIndex, address referrer, uint256 totalPackageUSD, uint256 selfDepositUSD, uint256 selfReinvestUSD, uint256 registrationTime, uint256 directCount, uint256 directActiveCount, uint256 leftVolume, uint256 rightVolume, uint256 matchedVolume, uint8 preferredLeg, uint256 claimableEarnings, uint256 totalWithdrawnUSD, uint256 totalEarnedUSD)",
  "function getSingleLegOpenLevels(address _user) view returns (uint256 halfLevels, uint256 totalLevels)",
  "function getUserOpenLevels(address _user) view returns (uint256 halfLevels, uint256 totalLevels)",
  "function globalUsers(uint256) view returns (address)",
  "function getUserReferrals(address _user) view returns (address[])",
  "function userCoupons(address) view returns (uint256)",
  "function isNexusQualified(address _user) view returns (bool)",
  "function isLegacyCrownQualified(address _user) view returns (bool)",

  "function totalCompanyVolumeUSD() view returns (uint256)",
  "function totalReinvestVolumeUSD() view returns (uint256)",
  "function totalWithdrawnSystemUSD() view returns (uint256)",
  "function totalUsersCount() view returns (uint256)",
  "function nexusPool() view returns (uint256)",
  "function legacyCrownPool() view returns (uint256)",
  "function jackpotPool() view returns (uint256)",
  "function usdtToken() view returns (address)",
  "function owner() view returns (address)"
];

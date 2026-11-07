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

export const SOVEREIGN_CORE_ABI = [
  "event Registered(address indexed user, address indexed referrer, uint256 globalIndex, uint256 packageUSD)",
  "event PackageActivated(address indexed user, uint256 packageUSD, bool isRebirth)",
  "event QuantumRoiBoosted(address indexed user, uint256 newBoostEnd)",
  "event MonolineYieldPaid(address indexed source, address indexed recipient, uint256 amountUSD, uint256 offset, bool isUpline)",
  "event VelocityCommissionPaid(address indexed source, address indexed recipient, uint256 amountUSD, uint256 level)",
  "event DynamicOverridePaid(address indexed sponsor, address indexed admin, uint256 overrideUSD, uint256 directCount)",
  "event CashbackClaimed(address indexed user, uint256 refundUSD)",
  "event FomoRoundSettled(uint256 roundId, uint256 totalDistributed, uint256 buyersShare, uint256 sponsorsShare)",
  "event HardCapReached(address indexed user, uint256 packageUSD, uint256 totalEarnedUSD)",
  "event RebirthTriggered(address indexed user, uint256 newIndex, bool isVipFastTrack)",
  "event Withdrawn(address indexed user, uint256 grossAmountUSD, uint256 sentToWalletUSD, uint256 reinvestedUSD, bool isRoiWithdrawal)",

  "function registerAndActivate(address _referrer, uint256 _packageUSD) external",
  "function upgradePackage(uint256 _packageUSD) external",
  "function claimQuantumRoi() external",
  "function claim72HCashback() external",
  "function withdrawRoi(uint256 _amountUSD) external",
  "function withdrawWorking(uint256 _amountUSD) external",
  "function settleFomoJackpot() external",

  "function users(address) view returns (bool registered, uint256 globalIndex, address referrer, uint256 activePackageUSD, uint256 cumulativeDepositUSD, uint256 cumulativeReinvestUSD, uint256 registrationTime, uint256 packageActivationTime, uint256 directCount, uint256 directActiveCount, uint256 lastDirectTimestamp, uint256 directsIn30Days, bool cashbackClaimed, bool cashbackEligible, uint256 cashbackDirectsCount, uint256 roiAccruedUSD, uint256 lastRoiClaimTimestamp, uint256 boostEndTimestamp, uint256 claimableRoiUSD, uint256 claimableWorkingUSD, uint256 totalWithdrawnUSD, uint256 totalEarnedUSD, bool isHardCapped, uint256 rebirthCount, bool isVipFastTrack)",
  "function getPendingQuantumRoi(address _user) view returns (uint256)",
  "function monolineUsers(uint256) view returns (address)",
  "function getMonolineCount() view returns (uint256)",
  "function getDirects(address _user) view returns (address[])",
  
  "function cashbackPool() view returns (uint256)",
  "function fomoJackpotPool() view returns (uint256)",
  "function stabilityPool() view returns (uint256)",
  "function totalSystemVolumeUSD() view returns (uint256)",
  "function totalSystemWithdrawnUSD() view returns (uint256)",
  "function fomoRound() view returns (uint256)",
  "function fomoRoundEndTime() view returns (uint256)",
  "function adminApex1() view returns (address)",
  "function adminLeft2() view returns (address)",
  "function adminRight3() view returns (address)",
  "function usdtToken() view returns (address)",
  "function owner() view returns (address)"
];

export const ALTRUVA_CORE_ABI = SOVEREIGN_CORE_ABI;

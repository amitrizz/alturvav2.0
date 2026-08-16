// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IBtcToken is IERC20 {
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
}

contract BtcStakingSystem is Ownable, ReentrancyGuard {
    IBtcToken public btcToken;
    IERC20 public usdtToken; 

    // Staking limits
    uint256 public constant MIN_STAKE_USD = 10 * 10**18;
    uint256 public constant MAX_STAKE_USD = 10000 * 10**18;

    // Pricing parameters
    uint256 public constant START_PRICE = 5 * 10**17; // $0.50
    uint256 public constant PRICE_STEP_VOLUME = 500 * 10**18; // $500
    uint256 public constant PRICE_STEP_INCREASE = 5 * 10**14; // $0.0005

    uint256 public totalUSDValueMinted;
    uint256 public totalMintedTokens;
    uint256 public spinCost = 10 * 10**18; 

    // Affiliate Commission Percentages (15 levels, total 19%)
    uint256[15] public levelPercents = [800, 400, 200, 100, 50, 50, 50, 50, 50, 25, 25, 25, 25, 25, 25]; 

    // Coupon System
    mapping(bytes32 => bool) public validCoupons;
    mapping(address => mapping(uint256 => uint256)) public userCouponsAppliedCountByMonth; 

    struct User {
        address referrer;
        uint256 directActiveCount;
        uint256 totalSelfStakeUSD;
        uint256 totalTeamBusinessUSD;
        uint256 dailyRankReward;
        uint256 lastRankClaimTime;
        uint256 currentRank;
        bool registered;
    }

    struct StakePosition {
        uint256 amountTokens;
        uint256 amountUSD;
        uint256 startTime;
        uint256 lastClaimTime;
        uint256 rewardClaimedUSD;
        uint256 lockupMonths; // 0 for normal, 3, 6, 12 months
        uint256 ratePerDay; // basis points: 50 (0.5%), 60 (0.6%), 75 (0.75%), 100 (1.0%)
        bool active;
    }

    mapping(address => User) public users;
    mapping(address => StakePosition[]) public userStakes;
    mapping(address => address[]) public directs;
    mapping(address => mapping(uint256 => uint256)) public rankClaimDays;

    struct RankConfig {
        string name;
        uint256 minBusinessUSD;
        uint256 dailyRewardUSD;
        uint256 rankPercent; 
    }

    RankConfig[14] public ranks;

    event Registered(address indexed user, address indexed referrer);
    event Minted(address indexed user, uint256 usdtAmount, uint256 btcAmount, uint256 currentPrice);
    event Staked(address indexed user, uint256 amountTokens, uint256 amountUSD, uint256 lockupMonths, uint256 ratePerDay);
    event RewardClaimed(address indexed user, uint256 stakeIndex, uint256 rewardTokens, uint256 rewardUSD);
    event RankRewardClaimed(address indexed user, uint256 rewardUSD);
    event Unstaked(address indexed user, uint256 stakeIndex, uint256 tokenReturned, uint256 feeApplied);
    event Sold(address indexed user, uint256 btcAmount, uint256 usdtAmount, uint256 price);
    event WheelSpun(address indexed user, uint8 index, uint256 rewardAmount);
    event CouponApplied(address indexed user, string code, uint256 rewardUSD);

    constructor(address _btcToken, address _usdtToken) Ownable(msg.sender) {
        btcToken = IBtcToken(_btcToken);
        usdtToken = IERC20(_usdtToken);

        // Initialize ranks (Starter to Director)
        ranks[0] = RankConfig("Starter", 1000 * 10**18, 1 * 10**18, 1500);
        ranks[1] = RankConfig("Executive", 2501 * 10**18, 5 * 10**18, 2000);
        ranks[2] = RankConfig("Engr", 10001 * 10**18, 11 * 10**18, 2500);
        ranks[3] = RankConfig("Manager", 30001 * 10**18, 35 * 10**18, 3000);
        ranks[4] = RankConfig("SR Manager", 50001 * 10**18, 45 * 10**18, 4000);
        ranks[5] = RankConfig("AGM", 150001 * 10**18, 150 * 10**18, 5500);
        ranks[6] = RankConfig("DGM", 300001 * 10**18, 300 * 10**18, 6500);
        ranks[7] = RankConfig("Add GM", 650001 * 10**18, 500 * 10**18, 7000);
        ranks[8] = RankConfig("GM", 1500001 * 10**18, 1200 * 10**18, 7500);
        ranks[9] = RankConfig("SR GM", 3000001 * 10**18, 2500 * 10**18, 8000);
        ranks[10] = RankConfig("VP", 6000001 * 10**18, 5000 * 10**18, 8500);
        ranks[11] = RankConfig("Sr VP", 15000001 * 10**18, 12000 * 10**18, 9000);
        ranks[12] = RankConfig("President", 30000001 * 10**18, 20000 * 10**18, 9500);
        ranks[13] = RankConfig("Director", 70000001 * 10**18, 35000 * 10**18, 10000);
    }

    function getCurrentPrice() public view returns (uint256) {
        uint256 steps = totalUSDValueMinted / PRICE_STEP_VOLUME;
        return START_PRICE + (steps * PRICE_STEP_INCREASE);
    }

    function register(address _referrer) external {
        require(!users[msg.sender].registered, "Already registered");
        require(msg.sender != _referrer, "Cannot refer yourself");

        if (_referrer != address(0)) {
            require(users[_referrer].registered, "Referrer must be registered");
            users[msg.sender].referrer = _referrer;
            directs[_referrer].push(msg.sender);
        }

        users[msg.sender].registered = true;
        emit Registered(msg.sender, _referrer);
    }

    function mintTokens(uint256 _usdtAmount) external nonReentrant {
        require(users[msg.sender].registered, "Must be registered first");
        require(_usdtAmount >= 10 * 10**18, "Min mint is $10");
        require(_usdtAmount <= 10000 * 10**18, "Max mint is $10000");

        usdtToken.transferFrom(msg.sender, address(this), _usdtAmount);

        uint256 fee = (_usdtAmount * 2) / 100;
        uint256 netUSD = _usdtAmount - fee;

        uint256 price = getCurrentPrice();
        uint256 btcAmount = (netUSD * 10**18) / price;

        totalUSDValueMinted += netUSD;
        totalMintedTokens += btcAmount;

        btcToken.transfer(msg.sender, btcAmount);

        emit Minted(msg.sender, _usdtAmount, btcAmount, price);
    }

    function mintTokensWithBNB() external payable nonReentrant {
        require(users[msg.sender].registered, "Must be registered first");
        require(msg.value > 0, "BNB amount must be greater than 0");

        uint256 bnbPriceUSD = 600;
        uint256 usdtAmount = msg.value * bnbPriceUSD;

        require(usdtAmount >= 10 * 10**18, "Min mint is $10");
        require(usdtAmount <= 10000 * 10**18, "Max mint is $10000");

        uint256 fee = (usdtAmount * 2) / 100;
        uint256 netUSD = usdtAmount - fee;

        uint256 price = getCurrentPrice();
        uint256 btcAmount = (netUSD * 10**18) / price;

        totalUSDValueMinted += netUSD;
        totalMintedTokens += btcAmount;

        btcToken.transfer(msg.sender, btcAmount);

        emit Minted(msg.sender, msg.value, btcAmount, price);
    }

    // Stake package selection (lockupMonths: 0, 3, 6, 12)
    function stake(uint256 _btcAmount, uint256 _lockupMonths) external nonReentrant {
        require(users[msg.sender].registered, "Must be registered");
        require(_lockupMonths == 0 || _lockupMonths == 3 || _lockupMonths == 6 || _lockupMonths == 12, "Invalid lockup period");
        
        uint256 price = getCurrentPrice();
        uint256 usdValue = (_btcAmount * price) / 10**18;
        require(usdValue >= MIN_STAKE_USD, "Min stake is $10");
        require(usdValue <= MAX_STAKE_USD, "Max stake is $10000");

        btcToken.transferFrom(msg.sender, address(this), _btcAmount);

        uint256 dailyRate = 50; // default 0.5%
        if (_lockupMonths == 3) dailyRate = 60; // 0.6%
        else if (_lockupMonths == 6) dailyRate = 75; // 0.75%
        else if (_lockupMonths == 12) dailyRate = 100; // 1.0%

        userStakes[msg.sender].push(StakePosition({
            amountTokens: _btcAmount,
            amountUSD: usdValue,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            rewardClaimedUSD: 0,
            lockupMonths: _lockupMonths,
            ratePerDay: dailyRate,
            active: true
        }));

        users[msg.sender].totalSelfStakeUSD += usdValue;
        _updateTeamBusiness(msg.sender, usdValue);

        emit Staked(msg.sender, _btcAmount, usdValue, _lockupMonths, dailyRate);
    }

    function _updateTeamBusiness(address _user, uint256 _stakeUSD) internal {
        address current = users[_user].referrer;
        uint256 level = 1;

        while (current != address(0) && level <= 15) { 
            users[current].totalTeamBusinessUSD += _stakeUSD;
            _checkRankQualification(current);

            if (level == 1) {
                uint256 activeCount = 0;
                for (uint256 i = 0; i < directs[current].length; i++) {
                    if (users[directs[current][i]].totalSelfStakeUSD >= 10 * 10**18) {
                        activeCount++;
                    }
                }
                users[current].directActiveCount = activeCount;
            }

            current = users[current].referrer;
            level++;
        }
    }

    // 50% Strongest Leg (Team A) / 50% Other Legs (Team B) structural check
    function _checkRankQualification(address _user) internal {
        uint256 totalVolume = users[_user].totalTeamBusinessUSD;
        if (totalVolume == 0) return;

        uint256 maxLegVolume = 0;
        for (uint256 i = 0; i < directs[_user].length; i++) {
            address child = directs[_user][i];
            uint256 legVol = users[child].totalSelfStakeUSD + users[child].totalTeamBusinessUSD;
            if (legVol > maxLegVolume) {
                maxLegVolume = legVol;
            }
        }

        uint256 otherLegsVolume = totalVolume - maxLegVolume;
        uint256 qualifiedRank = 0;
        bool found = false;

        for (int256 i = 13; i >= 0; i--) {
            uint256 minReq = ranks[uint256(i)].minBusinessUSD;
            uint256 maxAllowedFromStrongest = minReq / 2; // 50%
            uint256 effectiveStrongest = maxLegVolume > maxAllowedFromStrongest ? maxAllowedFromStrongest : maxLegVolume;

            if (effectiveStrongest + otherLegsVolume >= minReq) {
                qualifiedRank = uint256(i);
                found = true;
                break;
            }
        }

        if (found && qualifiedRank > users[_user].currentRank) {
            users[_user].currentRank = qualifiedRank;
            users[_user].dailyRankReward = ranks[qualifiedRank].dailyRewardUSD;
        }
    }

    // Caps: Non-working (2.5x) vs Working (5x)
    function getPendingReward(address _user, uint256 _index) public view returns (uint256 rewardTokens, uint256 rewardUSD) {
        if (_index >= userStakes[_user].length) return (0, 0);
        StakePosition memory st = userStakes[_user][_index];
        if (!st.active) return (0, 0);

        uint256 elapsed = block.timestamp - st.lastClaimTime;
        uint256 accruedUSD = (st.amountUSD * st.ratePerDay * elapsed) / (10000 * 86400);

        // Calculate dynamic cap: 5x if working (active directs > 0), 2.5x if non-working
        uint256 capMultiplier = (users[_user].directActiveCount > 0) ? 50 : 25; // 5.0x or 2.5x
        uint256 rewardCapUSD = (st.amountUSD * capMultiplier) / 10;

        if (st.rewardClaimedUSD + accruedUSD > rewardCapUSD) {
            accruedUSD = rewardCapUSD - st.rewardClaimedUSD;
        }

        uint256 price = getCurrentPrice();
        uint256 tokens = (accruedUSD * 10**18) / price;

        return (tokens, accruedUSD);
    }

    function claimStakingReward(uint256 _index) external nonReentrant {
        require(_index < userStakes[msg.sender].length, "Invalid stake index");
        StakePosition storage st = userStakes[msg.sender][_index];
        require(st.active, "Stake is not active");

        (uint256 tokens, uint256 accruedUSD) = getPendingReward(msg.sender, _index);
        require(tokens > 0, "No rewards to claim");

        st.lastClaimTime = block.timestamp;
        st.rewardClaimedUSD += accruedUSD;

        uint256 capMultiplier = (users[msg.sender].directActiveCount > 0) ? 50 : 25;
        uint256 rewardCapUSD = (st.amountUSD * capMultiplier) / 10;

        if (st.rewardClaimedUSD >= rewardCapUSD) {
            st.active = false;
        }

        btcToken.transfer(msg.sender, tokens);
        _payReferralCommission(msg.sender, tokens);

        emit RewardClaimed(msg.sender, _index, tokens, accruedUSD);
    }

    // 15 level payout logic
    function _payReferralCommission(address _user, uint256 _rewardTokens) internal {
        address current = users[_user].referrer;
        
        for (uint256 i = 0; i < 15; i++) {
            if (current == address(0)) break;

            if (users[current].directActiveCount >= (i + 1)) {
                uint256 comm = (_rewardTokens * levelPercents[i]) / 10000;
                btcToken.transfer(current, comm);
            }

            current = users[current].referrer;
        }
    }

    // Claim daily rank rewards with 150 days limit
    function claimRankReward() external nonReentrant {
        User storage u = users[msg.sender];
        require(u.dailyRankReward > 0, "No rank rewards qualified");
        require(rankClaimDays[msg.sender][u.currentRank] < 150, "Claim limit of 150 days exceeded for current rank");

        uint256 elapsed = block.timestamp - (u.lastRankClaimTime == 0 ? block.timestamp - 1 days : u.lastRankClaimTime);
        require(elapsed >= 1 days, "Can claim daily rank reward once per day");

        uint256 daysAccrued = elapsed / 1 days;
        if (rankClaimDays[msg.sender][u.currentRank] + daysAccrued > 150) {
            daysAccrued = 150 - rankClaimDays[msg.sender][u.currentRank];
        }

        require(daysAccrued > 0, "No remaining claimable days");

        rankClaimDays[msg.sender][u.currentRank] += daysAccrued;
        uint256 totalUSD = daysAccrued * u.dailyRankReward;

        u.lastRankClaimTime = block.timestamp;

        uint256 price = getCurrentPrice();
        uint256 tokens = (totalUSD * 10**18) / price;

        btcToken.transfer(msg.sender, tokens);

        emit RankRewardClaimed(msg.sender, totalUSD);
    }

    function unstake(uint256 _index) external nonReentrant {
        require(_index < userStakes[msg.sender].length, "Invalid stake index");
        StakePosition storage st = userStakes[msg.sender][_index];
        require(st.active, "Stake is not active");

        (uint256 pendingTokens, ) = getPendingReward(msg.sender, _index);
        if (pendingTokens > 0) {
            btcToken.transfer(msg.sender, pendingTokens);
            _payReferralCommission(msg.sender, pendingTokens);
        }

        uint256 tokensToReturn = st.amountTokens;
        uint256 totalFee = 0;

        // Apply 5% early withdrawal fee if adaptable locked staking is terminated early
        if (st.lockupMonths > 0 && (block.timestamp < st.startTime + (st.lockupMonths * 30 days))) {
            uint256 penalty = (tokensToReturn * 5) / 100;
            totalFee += penalty;
        }

        uint256 withdrawalFee = (tokensToReturn * 10) / 100;
        totalFee += withdrawalFee;

        uint256 netReturn = tokensToReturn - totalFee;

        st.active = false;
        users[msg.sender].totalSelfStakeUSD -= st.amountUSD;

        uint256 burnAmount = (withdrawalFee * 96) / 100;
        if (burnAmount > 0) {
            btcToken.burn(burnAmount);
        }

        btcToken.transfer(msg.sender, netReturn);

        emit Unstaked(msg.sender, _index, netReturn, totalFee);
    }

    function sellTokens(uint256 _btcAmount) external nonReentrant {
        require(users[msg.sender].registered, "Must be registered");
        require(_btcAmount > 0, "Amount must be greater than 0");

        btcToken.transferFrom(msg.sender, address(this), _btcAmount);

        uint256 fee = (_btcAmount * 2) / 100;
        uint256 netBtc = _btcAmount - fee;

        uint256 burnAmount = (fee * 96) / 100;
        if (burnAmount > 0) {
            btcToken.burn(burnAmount);
        }

        uint256 price = getCurrentPrice();
        uint256 usdtPayout = (netBtc * price) / 10**18;

        require(usdtToken.balanceOf(address(this)) >= usdtPayout, "Insufficient contract USDT balance");
        usdtToken.transfer(msg.sender, usdtPayout);

        if (totalUSDValueMinted >= usdtPayout) {
            totalUSDValueMinted -= usdtPayout;
        } else {
            totalUSDValueMinted = 0;
        }

        emit Sold(msg.sender, _btcAmount, usdtPayout, price);
    }

    function sellTokensForBNB(uint256 _btcAmount) external nonReentrant {
        require(users[msg.sender].registered, "Must be registered");
        require(_btcAmount > 0, "Amount must be greater than 0");

        btcToken.transferFrom(msg.sender, address(this), _btcAmount);

        uint256 fee = (_btcAmount * 2) / 100;
        uint256 netBtc = _btcAmount - fee;

        uint256 burnAmount = (fee * 96) / 100;
        if (burnAmount > 0) {
            btcToken.burn(burnAmount);
        }

        uint256 price = getCurrentPrice();
        uint256 usdtValue = (netBtc * price) / 10**18;
        uint256 bnbPayout = usdtValue / 600;

        require(address(this).balance >= bnbPayout, "Insufficient contract BNB balance");
        payable(msg.sender).transfer(bnbPayout);

        emit Sold(msg.sender, _btcAmount, bnbPayout, price);
    }

    function withdrawUSDT(uint256 _amount) external onlyOwner {
        require(usdtToken.balanceOf(address(this)) >= _amount, "Insufficient balance");
        usdtToken.transfer(owner(), _amount);

        if (totalUSDValueMinted >= _amount) {
            totalUSDValueMinted -= _amount;
        } else {
            totalUSDValueMinted = 0;
        }
    }

    function withdrawBNB(uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Insufficient BNB balance");
        payable(owner()).transfer(_amount);
    }

    // Coupon Actions
    function addCoupon(string calldata _code) external onlyOwner {
        validCoupons[keccak256(abi.encodePacked(_code))] = true;
    }

    function removeCoupon(string calldata _code) external onlyOwner {
        validCoupons[keccak256(abi.encodePacked(_code))] = false;
    }

    function applyCoupon(string calldata _code) external {
        require(users[msg.sender].registered, "Must be registered");
        bytes32 hash = keccak256(abi.encodePacked(_code));
        require(validCoupons[hash], "Invalid or expired coupon");

        uint256 currentMonth = block.timestamp / (30 days);
        require(userCouponsAppliedCountByMonth[msg.sender][currentMonth] < 3, "Coupon limit reached (max 3/month)");

        userCouponsAppliedCountByMonth[msg.sender][currentMonth]++;
        validCoupons[hash] = false; 

        uint256 rewardUSD = 5 * 10**18; // $5 USD bonus
        uint256 price = getCurrentPrice();
        uint256 btcAmount = (rewardUSD * 10**18) / price;

        require(btcToken.balanceOf(address(this)) >= btcAmount, "Insufficient token reserves");
        btcToken.transfer(msg.sender, btcAmount);

        emit CouponApplied(msg.sender, _code, rewardUSD);
    }

    function spinWheel() external nonReentrant {
        require(users[msg.sender].registered, "Must be registered");
        require(btcToken.balanceOf(msg.sender) >= spinCost, "Insufficient balance to spin");

        btcToken.transferFrom(msg.sender, address(this), spinCost);

        uint256 burnAmount = (spinCost * 75) / 100;
        if (burnAmount > 0) {
            btcToken.burn(burnAmount);
        }

        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 100;
        uint8 prizeIndex;
        uint256 rewardAmount = 0;

        if (rand < 50) {
            prizeIndex = 0;
            rewardAmount = 0;
        } else if (rand < 80) {
            prizeIndex = 1;
            rewardAmount = (spinCost * 5) / 10;
        } else if (rand < 93) {
            prizeIndex = 2;
            rewardAmount = (spinCost * 15) / 10;
        } else if (rand < 98) {
            prizeIndex = 3;
            rewardAmount = (spinCost * 50) / 10;
        } else {
            prizeIndex = 4;
            rewardAmount = (spinCost * 150) / 10;
        }

        if (rewardAmount > 0) {
            require(btcToken.balanceOf(address(this)) >= rewardAmount, "Insufficient token reserves");
            btcToken.transfer(msg.sender, rewardAmount);
        }

        emit WheelSpun(msg.sender, prizeIndex, rewardAmount);
    }

    function setSpinCost(uint256 _newCost) external onlyOwner {
        spinCost = _newCost;
    }

    receive() external payable {}
}

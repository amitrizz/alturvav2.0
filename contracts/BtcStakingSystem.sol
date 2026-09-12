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

    uint256 public constant MIN_STAKE_USD = 10 * 10**18;
    uint256 public constant MAX_STAKE_USD = 10000 * 10**18;
    uint256 public constant INVESTMENT_CYCLE = 365 days;

    uint256 public constant START_PRICE = 5 * 10**17;
    uint256 public constant PRICE_STEP_VOLUME = 500 * 10**18;
    uint256 public constant PRICE_STEP_INCREASE = 5 * 10**14;

    uint256 public totalUSDValueMinted;
    uint256 public totalMintedTokens;
    uint256 public spinCost = 10 * 10**18;

    // 20-level affiliate commissions (basis points, total 20%)
    // L1: 8%, L2-5: 1%, L6-10: 0.5%, L11-15: 0.25%, L16-20: 0.1%
    uint256[20] public levelPercents = [
        800, 100, 100, 100, 100,
        50, 50, 50, 50, 50,
        25, 25, 25, 25, 25,
        10, 10, 10, 10, 10
    ];

    mapping(bytes32 => bool) public validCoupons;
    mapping(address => mapping(uint256 => uint256)) public userCouponsAppliedCountByMonth;

    struct User {
        address referrer;
        uint256 directActiveCount;
        uint256 directReferralsCount;
        uint256 teamSize;
        uint256 totalSelfStakeUSD;
        uint256 totalTeamBusinessUSD;
        uint256 lastSalaryClaimTime;
        uint256 highestSalaryRank;
        bool registered;
    }

    struct StakePosition {
        uint256 amountTokens;
        uint256 amountUSD;
        uint256 startTime;
        uint256 endTime;
        uint256 lastClaimTime;
        uint256 rewardClaimedUSD;
        uint256 ratePerDay;
        bool active;
    }

    struct RankBonusConfig {
        string name;
        uint256 minSelfUSD;
        uint256 minDirects;
        uint256 minTeamSize;
        uint256 oneTimeBonusUSD;
    }

    struct SalaryConfig {
        string name;
        uint256 minSelfUSD;
        uint256 minDirects;
        uint256 minTeamSize;
        uint256 monthlySalaryUSD;
    }

    mapping(address => User) public users;
    mapping(address => StakePosition[]) public userStakes;
    mapping(address => address[]) public directs;
    mapping(address => mapping(uint256 => bool)) public rankBonusClaimed;

    RankBonusConfig[10] public rankBonuses;
    SalaryConfig[8] public salaries;

    event Registered(address indexed user, address indexed referrer);
    event Minted(address indexed user, uint256 usdtAmount, uint256 btcAmount, uint256 currentPrice);
    event Staked(address indexed user, uint256 amountTokens, uint256 amountUSD, uint256 ratePerDay, uint256 endTime);
    event RewardClaimed(address indexed user, uint256 stakeIndex, uint256 rewardTokens, uint256 rewardUSD);
    event RankBonusClaimed(address indexed user, uint256 rankIndex, uint256 bonusUSD);
    event MonthlySalaryClaimed(address indexed user, uint256 salaryUSD);
    event Unstaked(address indexed user, uint256 stakeIndex, uint256 tokenReturned, uint256 feeApplied);
    event Sold(address indexed user, uint256 btcAmount, uint256 usdtAmount, uint256 price);
    event WheelSpun(address indexed user, uint8 index, uint256 rewardAmount);
    event CouponApplied(address indexed user, string code, uint256 rewardUSD);

    constructor(address _btcToken, address _usdtToken) Ownable(msg.sender) {
        btcToken = IBtcToken(_btcToken);
        usdtToken = IERC20(_usdtToken);

        rankBonuses[0] = RankBonusConfig("Bronze", 100 * 10**18, 2, 5, 20 * 10**18);
        rankBonuses[1] = RankBonusConfig("Silver", 500 * 10**18, 5, 15, 100 * 10**18);
        rankBonuses[2] = RankBonusConfig("Gold", 1000 * 10**18, 10, 50, 500 * 10**18);
        rankBonuses[3] = RankBonusConfig("Diamond", 2500 * 10**18, 15, 100, 1500 * 10**18);
        rankBonuses[4] = RankBonusConfig("Platinum", 5000 * 10**18, 20, 250, 5000 * 10**18);
        rankBonuses[5] = RankBonusConfig("Sapphire", 10000 * 10**18, 30, 500, 10000 * 10**18);
        rankBonuses[6] = RankBonusConfig("Ruby", 15000 * 10**18, 40, 1000, 20000 * 10**18);
        rankBonuses[7] = RankBonusConfig("Emerald", 25000 * 10**18, 50, 2500, 30000 * 10**18);
        rankBonuses[8] = RankBonusConfig("Crown", 50000 * 10**18, 75, 5000, 40000 * 10**18);
        rankBonuses[9] = RankBonusConfig("Elite Crown", 100000 * 10**18, 100, 10000, 50000 * 10**18);

        salaries[0] = SalaryConfig("Gold", 1000 * 10**18, 10, 50, 50 * 10**18);
        salaries[1] = SalaryConfig("Diamond", 2500 * 10**18, 15, 100, 200 * 10**18);
        salaries[2] = SalaryConfig("Platinum", 5000 * 10**18, 20, 250, 500 * 10**18);
        salaries[3] = SalaryConfig("Sapphire", 10000 * 10**18, 30, 500, 1000 * 10**18);
        salaries[4] = SalaryConfig("Ruby", 15000 * 10**18, 40, 1000, 2500 * 10**18);
        salaries[5] = SalaryConfig("Emerald", 25000 * 10**18, 50, 2500, 5000 * 10**18);
        salaries[6] = SalaryConfig("Crown", 50000 * 10**18, 75, 5000, 7500 * 10**18);
        salaries[7] = SalaryConfig("Elite Crown", 100000 * 10**18, 100, 10000, 10000 * 10**18);
    }

    function getCurrentPrice() public view returns (uint256) {
        uint256 steps = totalUSDValueMinted / PRICE_STEP_VOLUME;
        return START_PRICE + (steps * PRICE_STEP_INCREASE);
    }

    function getRateByAmount(uint256 usdAmount) public pure returns (uint256) {
        if (usdAmount <= 499 * 10**18) return 50;
        if (usdAmount <= 2000 * 10**18) return 60;
        if (usdAmount <= 5000 * 10**18) return 75;
        return 100;
    }

    function register(address _referrer) external {
        require(!users[msg.sender].registered, "Already registered");
        require(msg.sender != _referrer, "Cannot refer yourself");

        if (_referrer != address(0)) {
            require(users[_referrer].registered, "Referrer must be registered");
            users[msg.sender].referrer = _referrer;
            directs[_referrer].push(msg.sender);
            users[_referrer].directReferralsCount++;

            address current = _referrer;
            while (current != address(0)) {
                users[current].teamSize++;
                current = users[current].referrer;
            }
        }

        users[msg.sender].registered = true;
        emit Registered(msg.sender, _referrer);
    }

    function mintTokens(uint256 _usdtAmount) external nonReentrant {
        require(users[msg.sender].registered, "Must be registered first");
        require(_usdtAmount >= MIN_STAKE_USD, "Min mint is $10");
        require(_usdtAmount <= MAX_STAKE_USD, "Max mint is $10000");

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

        require(usdtAmount >= MIN_STAKE_USD, "Min mint is $10");
        require(usdtAmount <= MAX_STAKE_USD, "Max mint is $10000");

        uint256 fee = (usdtAmount * 2) / 100;
        uint256 netUSD = usdtAmount - fee;
        uint256 price = getCurrentPrice();
        uint256 btcAmount = (netUSD * 10**18) / price;

        totalUSDValueMinted += netUSD;
        totalMintedTokens += btcAmount;
        btcToken.transfer(msg.sender, btcAmount);

        emit Minted(msg.sender, msg.value, btcAmount, price);
    }

    function stake(uint256 _btcAmount) external nonReentrant {
        require(users[msg.sender].registered, "Must be registered");

        uint256 price = getCurrentPrice();
        uint256 usdValue = (_btcAmount * price) / 10**18;
        require(usdValue >= MIN_STAKE_USD, "Min stake is $10");
        require(usdValue <= MAX_STAKE_USD, "Max stake is $10000");

        btcToken.transferFrom(msg.sender, address(this), _btcAmount);

        uint256 dailyRate = getRateByAmount(usdValue);
        uint256 endTime = block.timestamp + INVESTMENT_CYCLE;

        userStakes[msg.sender].push(StakePosition({
            amountTokens: _btcAmount,
            amountUSD: usdValue,
            startTime: block.timestamp,
            endTime: endTime,
            lastClaimTime: block.timestamp,
            rewardClaimedUSD: 0,
            ratePerDay: dailyRate,
            active: true
        }));

        users[msg.sender].totalSelfStakeUSD += usdValue;
        _updateTeamBusiness(msg.sender, usdValue);

        emit Staked(msg.sender, _btcAmount, usdValue, dailyRate, endTime);
    }

    function _updateTeamBusiness(address _user, uint256 _stakeUSD) internal {
        address current = users[_user].referrer;
        uint256 level = 1;

        while (current != address(0) && level <= 20) {
            users[current].totalTeamBusinessUSD += _stakeUSD;

            if (level == 1) {
                uint256 activeCount = 0;
                for (uint256 i = 0; i < directs[current].length; i++) {
                    if (users[directs[current][i]].totalSelfStakeUSD >= MIN_STAKE_USD) {
                        activeCount++;
                    }
                }
                users[current].directActiveCount = activeCount;
            }

            current = users[current].referrer;
            level++;
        }
    }

    function getPendingReward(address _user, uint256 _index) public view returns (uint256 rewardTokens, uint256 rewardUSD) {
        if (_index >= userStakes[_user].length) return (0, 0);
        StakePosition memory st = userStakes[_user][_index];
        if (!st.active) return (0, 0);

        uint256 effectiveEnd = st.endTime < block.timestamp ? st.endTime : block.timestamp;
        if (effectiveEnd <= st.lastClaimTime) return (0, 0);

        uint256 elapsed = effectiveEnd - st.lastClaimTime;
        uint256 accruedUSD = (st.amountUSD * st.ratePerDay * elapsed) / (10000 * 86400);

        uint256 capMultiplier = users[_user].directActiveCount > 0 ? 50 : 25;
        uint256 rewardCapUSD = (st.amountUSD * capMultiplier) / 10;

        if (st.rewardClaimedUSD + accruedUSD > rewardCapUSD) {
            accruedUSD = rewardCapUSD - st.rewardClaimedUSD;
        }

        if (accruedUSD == 0) return (0, 0);

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

        uint256 capMultiplier = users[msg.sender].directActiveCount > 0 ? 50 : 25;
        uint256 rewardCapUSD = (st.amountUSD * capMultiplier) / 10;
        if (st.rewardClaimedUSD >= rewardCapUSD || block.timestamp >= st.endTime) {
            st.active = false;
        }

        btcToken.transfer(msg.sender, tokens);
        _payReferralCommission(msg.sender, tokens);

        emit RewardClaimed(msg.sender, _index, tokens, accruedUSD);
    }

    function _payReferralCommission(address _user, uint256 _rewardTokens) internal {
        address current = users[_user].referrer;

        for (uint256 i = 0; i < 20; i++) {
            if (current == address(0)) break;

            if (users[current].directActiveCount >= (i + 1)) {
                uint256 comm = (_rewardTokens * levelPercents[i]) / 10000;
                if (comm > 0) {
                    btcToken.transfer(current, comm);
                }
            }

            current = users[current].referrer;
        }
    }

    function qualifiesForRankBonus(address _user, uint256 _rankIndex) public view returns (bool) {
        if (_rankIndex >= 10) return false;
        RankBonusConfig memory cfg = rankBonuses[_rankIndex];
        User memory u = users[_user];
        return u.totalSelfStakeUSD >= cfg.minSelfUSD
            && u.directReferralsCount >= cfg.minDirects
            && u.teamSize >= cfg.minTeamSize;
    }

    function claimRankBonus(uint256 _rankIndex) external nonReentrant {
        require(_rankIndex < 10, "Invalid rank");
        require(!rankBonusClaimed[msg.sender][_rankIndex], "Already claimed");
        require(qualifiesForRankBonus(msg.sender, _rankIndex), "Not qualified");

        rankBonusClaimed[msg.sender][_rankIndex] = true;
        uint256 bonusUSD = rankBonuses[_rankIndex].oneTimeBonusUSD;

        require(usdtToken.balanceOf(address(this)) >= bonusUSD, "Insufficient USDT reserves");
        usdtToken.transfer(msg.sender, bonusUSD);

        emit RankBonusClaimed(msg.sender, _rankIndex, bonusUSD);
    }

    function getQualifiedSalaryRank(address _user) public view returns (uint256) {
        uint256 qualified = type(uint256).max;
        for (uint256 i = 0; i < 8; i++) {
            SalaryConfig memory cfg = salaries[i];
            User memory u = users[_user];
            if (u.totalSelfStakeUSD >= cfg.minSelfUSD
                && u.directReferralsCount >= cfg.minDirects
                && u.teamSize >= cfg.minTeamSize) {
                qualified = i;
            }
        }
        return qualified;
    }

    function claimMonthlySalary() external nonReentrant {
        uint256 rankIdx = getQualifiedSalaryRank(msg.sender);
        require(rankIdx != type(uint256).max, "Not qualified for salary");

        uint256 elapsed = block.timestamp - users[msg.sender].lastSalaryClaimTime;
        if (users[msg.sender].lastSalaryClaimTime > 0) {
            require(elapsed >= 30 days, "Salary claimable once per month");
        }

        uint256 salaryUSD = salaries[rankIdx].monthlySalaryUSD;
        require(usdtToken.balanceOf(address(this)) >= salaryUSD, "Insufficient USDT reserves");

        users[msg.sender].lastSalaryClaimTime = block.timestamp;
        users[msg.sender].highestSalaryRank = rankIdx;
        usdtToken.transfer(msg.sender, salaryUSD);

        emit MonthlySalaryClaimed(msg.sender, salaryUSD);
    }

    function unstake(uint256 _index) external nonReentrant {
        require(_index < userStakes[msg.sender].length, "Invalid stake index");
        StakePosition storage st = userStakes[msg.sender][_index];
        require(st.active, "Stake is not active");
        require(block.timestamp >= st.endTime, "365-day cycle not complete");

        (uint256 pendingTokens, ) = getPendingReward(msg.sender, _index);
        if (pendingTokens > 0) {
            btcToken.transfer(msg.sender, pendingTokens);
            _payReferralCommission(msg.sender, pendingTokens);
        }

        uint256 tokensToReturn = st.amountTokens;
        st.active = false;
        users[msg.sender].totalSelfStakeUSD -= st.amountUSD;

        btcToken.transfer(msg.sender, tokensToReturn);
        emit Unstaked(msg.sender, _index, tokensToReturn, 0);
    }

    function sellTokens(uint256 _btcAmount) external nonReentrant {
        require(users[msg.sender].registered, "Must be registered");
        require(_btcAmount > 0, "Amount must be greater than 0");

        btcToken.transferFrom(msg.sender, address(this), _btcAmount);

        uint256 fee = (_btcAmount * 2) / 100;
        uint256 netBtc = _btcAmount - fee;

        uint256 burnAmount = (fee * 96) / 100;
        if (burnAmount > 0) btcToken.burn(burnAmount);

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
        if (burnAmount > 0) btcToken.burn(burnAmount);

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
        require(userCouponsAppliedCountByMonth[msg.sender][currentMonth] < 3, "Coupon limit reached");

        userCouponsAppliedCountByMonth[msg.sender][currentMonth]++;
        validCoupons[hash] = false;

        uint256 rewardUSD = 5 * 10**18;
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
        if (burnAmount > 0) btcToken.burn(burnAmount);

        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 100;
        uint8 prizeIndex;
        uint256 rewardAmount = 0;

        if (rand < 50) {
            prizeIndex = 0;
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

    function fundUSDT(uint256 _amount) external onlyOwner {
        usdtToken.transferFrom(msg.sender, address(this), _amount);
    }

    receive() external payable {}
}

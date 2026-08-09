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
    IERC20 public usdtToken; // stablecoin used for payment (USD reference)

    // Staking limits
    uint256 public constant MIN_STAKE_USD = 10 * 10**18;
    uint256 public constant MAX_STAKE_USD = 10000 * 10**18;

    // Pricing parameters
    uint256 public constant START_PRICE = 5 * 10**17; // $0.50
    uint256 public constant PRICE_STEP_VOLUME = 500 * 10**18; // $500
    uint256 public constant PRICE_STEP_INCREASE = 5 * 10**14; // $0.0005 (0.1% of $0.50)

    uint256 public totalUSDValueMinted;
    uint256 public totalMintedTokens;
    uint256 public spinCost = 10 * 10**18; // 10 RSS to spin

    // Affiliate Commission Percentages (5 levels)
    uint256[5] public levelPercents = [1000, 300, 200, 200, 100]; // basis points (10%, 3%, 2%, 2%, 1%)

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
        uint256 rewardCapUSD; // e.g. 3x or 5x
        bool is365Day;
        bool active;
    }

    mapping(address => User) public users;
    mapping(address => StakePosition[]) public userStakes;
    mapping(address => address[]) public directs;

    // Rank configurations (14 Ranks)
    struct RankConfig {
        string name;
        uint256 minBusinessUSD;
        uint256 dailyRewardUSD;
        uint256 rankPercent; // basis points
    }

    RankConfig[14] public ranks;

    event Registered(address indexed user, address indexed referrer);
    event Minted(address indexed user, uint256 usdtAmount, uint256 btcAmount, uint256 currentPrice);
    event Staked(address indexed user, uint256 amountTokens, uint256 amountUSD, bool is365Day);
    event RewardClaimed(address indexed user, uint256 stakeIndex, uint256 rewardTokens, uint256 rewardUSD);
    event RankRewardClaimed(address indexed user, uint256 rewardUSD);
    event Unstaked(address indexed user, uint256 stakeIndex, uint256 tokenReturned, uint256 feeApplied);
    event Sold(address indexed user, uint256 btcAmount, uint256 usdtAmount, uint256 price);
    event WheelSpun(address indexed user, uint8 index, uint256 rewardAmount);


    constructor(address _btcToken, address _usdtToken) Ownable(msg.sender) {
        btcToken = IBtcToken(_btcToken);
        usdtToken = IERC20(_usdtToken);

        // Initialize ranks
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

    // Get current BTC 3.0 price in USD (18 decimals)
    function getCurrentPrice() public view returns (uint256) {
        uint256 steps = totalUSDValueMinted / PRICE_STEP_VOLUME;
        return START_PRICE + (steps * PRICE_STEP_INCREASE);
    }

    // Register user with a referrer
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

    // Mint BTC 3.0 tokens using USDT
    function mintTokens(uint256 _usdtAmount) external nonReentrant {
        require(users[msg.sender].registered, "Must be registered first");
        require(_usdtAmount >= 10 * 10**18, "Min mint is $10");
        require(_usdtAmount <= 10000 * 10**18, "Max mint is $10000");

        // Transfer USDT to contract
        usdtToken.transferFrom(msg.sender, address(this), _usdtAmount);

        // 2% Mint Fee
        uint256 fee = (_usdtAmount * 2) / 100;
        uint256 netUSD = _usdtAmount - fee;

        uint256 price = getCurrentPrice();
        uint256 btcAmount = (netUSD * 10**18) / price;

        totalUSDValueMinted += netUSD;
        totalMintedTokens += btcAmount;

        // Transfer BTC tokens to user from contract reserve
        btcToken.transfer(msg.sender, btcAmount);

        emit Minted(msg.sender, _usdtAmount, btcAmount, price);
    }

    // Mint BTC 3.0 tokens using Native BNB (assuming fixed rate 1 BNB = $600 USD)
    function mintTokensWithBNB() external payable nonReentrant {
        require(users[msg.sender].registered, "Must be registered first");
        require(msg.value > 0, "BNB amount must be greater than 0");

        uint256 bnbPriceUSD = 600;
        uint256 usdtAmount = msg.value * bnbPriceUSD;

        require(usdtAmount >= 10 * 10**18, "Min mint is $10");
        require(usdtAmount <= 10000 * 10**18, "Max mint is $10000");

        // 2% Mint Fee
        uint256 fee = (usdtAmount * 2) / 100;
        uint256 netUSD = usdtAmount - fee;

        uint256 price = getCurrentPrice();
        uint256 btcAmount = (netUSD * 10**18) / price;

        totalUSDValueMinted += netUSD;
        totalMintedTokens += btcAmount;

        // Transfer BTC tokens to user from contract reserve
        btcToken.transfer(msg.sender, btcAmount);

        emit Minted(msg.sender, msg.value, btcAmount, price);
    }

    // Stake BTC 3.0 tokens
    function stake(uint256 _btcAmount, bool _is365Day) external nonReentrant {
        require(users[msg.sender].registered, "Must be registered");
        
        uint256 price = getCurrentPrice();
        uint256 usdValue = (_btcAmount * price) / 10**18;
        require(usdValue >= MIN_STAKE_USD, "Min stake is $10");
        require(usdValue <= MAX_STAKE_USD, "Max stake is $10000");

        // Transfer BTC tokens from user to contract
        btcToken.transferFrom(msg.sender, address(this), _btcAmount);

        uint256 cap = _is365Day ? usdValue * 5 : usdValue * 3;

        userStakes[msg.sender].push(StakePosition({
            amountTokens: _btcAmount,
            amountUSD: usdValue,
            startTime: block.timestamp,
            lastClaimTime: block.timestamp,
            rewardClaimedUSD: 0,
            rewardCapUSD: cap,
            is365Day: _is365Day,
            active: true
        }));

        users[msg.sender].totalSelfStakeUSD += usdValue;

        // Update Affiliate direct active counts & business volume
        _updateTeamBusiness(msg.sender, usdValue);

        emit Staked(msg.sender, _btcAmount, usdValue, _is365Day);
    }

    // Process team business volume calculations up the tree
    function _updateTeamBusiness(address _user, uint256 _stakeUSD) internal {
        address current = users[_user].referrer;
        uint256 level = 1;

        while (current != address(0) && level <= 15) { // Track up to 15 referral levels for safety
            users[current].totalTeamBusinessUSD += _stakeUSD;
            
            // Check rank qualification
            _checkRankQualification(current);

            // Update direct active direct count on Level 1
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

    // Rank validation logic with 40% A-Team / 60% Other Teams structural check
    function _checkRankQualification(address _user) internal {
        uint256 totalVolume = users[_user].totalTeamBusinessUSD;
        if (totalVolume == 0) return;

        // Find the strongest direct leg volume (A-Team)
        uint256 maxLegVolume = 0;
        for (uint256 i = 0; i < directs[_user].length; i++) {
            address child = directs[_user][i];
            uint256 legVol = users[child].totalSelfStakeUSD + users[child].totalTeamBusinessUSD;
            if (legVol > maxLegVolume) {
                maxLegVolume = legVol;
            }
        }

        uint256 otherLegsVolume = totalVolume - maxLegVolume;

        // For each rank config, check if eligible
        uint256 qualifiedRank = 0;
        bool found = false;

        for (int256 i = 13; i >= 0; i--) {
            uint256 minReq = ranks[uint256(i)].minBusinessUSD;
            
            // 40% Max of minReq can come from the strongest leg
            uint256 maxAllowedFromStrongest = (minReq * 40) / 100;
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

    // Calculate daily rewards (0.5% or 1%)
    function getPendingReward(address _user, uint256 _index) public view returns (uint256 rewardTokens, uint256 rewardUSD) {
        if (_index >= userStakes[_user].length) return (0, 0);
        StakePosition memory st = userStakes[_user][_index];
        if (!st.active) return (0, 0);

        uint256 elapsed = block.timestamp - st.lastClaimTime;
        uint256 ratePerDay = st.is365Day ? 100 : 50; // 1% or 0.5% (basis points)
        
        uint256 accruedUSD = (st.amountUSD * ratePerDay * elapsed) / (10000 * 86400);

        // Cap rewards
        if (st.rewardClaimedUSD + accruedUSD > st.rewardCapUSD) {
            accruedUSD = st.rewardCapUSD - st.rewardClaimedUSD;
        }

        uint256 price = getCurrentPrice();
        uint256 tokens = (accruedUSD * 10**18) / price;

        return (tokens, accruedUSD);
    }

    // Claim staking rewards and distribute level commissions
    function claimStakingReward(uint256 _index) external nonReentrant {
        require(_index < userStakes[msg.sender].length, "Invalid stake index");
        StakePosition storage st = userStakes[msg.sender][_index];
        require(st.active, "Stake is not active");

        (uint256 tokens, uint256 accruedUSD) = getPendingReward(msg.sender, _index);
        require(tokens > 0, "No rewards to claim");

        st.lastClaimTime = block.timestamp;
        st.rewardClaimedUSD += accruedUSD;

        if (st.rewardClaimedUSD >= st.rewardCapUSD) {
            st.active = false;
        }

        // Payout reward tokens
        btcToken.transfer(msg.sender, tokens);

        // Process referral commission up to 5 levels
        _payReferralCommission(msg.sender, tokens);

        emit RewardClaimed(msg.sender, _index, tokens, accruedUSD);
    }

    // Distribute level commissions
    function _payReferralCommission(address _user, uint256 _rewardTokens) internal {
        address current = users[_user].referrer;
        
        for (uint256 i = 0; i < 5; i++) {
            if (current == address(0)) break;

            // Check if referrer has unlocked this level (1 direct active direct per level)
            if (users[current].directActiveCount >= (i + 1)) {
                uint256 comm = (_rewardTokens * levelPercents[i]) / 10000;
                btcToken.transfer(current, comm);
            }

            current = users[current].referrer;
        }
    }

    // Claim daily rank rewards
    function claimRankReward() external nonReentrant {
        User storage u = users[msg.sender];
        require(u.dailyRankReward > 0, "No rank rewards qualified");
        
        uint256 elapsed = block.timestamp - (u.lastRankClaimTime == 0 ? block.timestamp - 1 days : u.lastRankClaimTime);
        require(elapsed >= 1 days, "Can claim daily rank reward once per day");

        uint256 daysAccrued = elapsed / 1 days;
        uint256 totalUSD = daysAccrued * u.dailyRankReward;

        u.lastRankClaimTime = block.timestamp;

        uint256 price = getCurrentPrice();
        uint256 tokens = (totalUSD * 10**18) / price;

        btcToken.transfer(msg.sender, tokens);

        emit RankRewardClaimed(msg.sender, totalUSD);
    }

    // Unstake / early withdrawal
    function unstake(uint256 _index) external nonReentrant {
        require(_index < userStakes[msg.sender].length, "Invalid stake index");
        StakePosition storage st = userStakes[msg.sender][_index];
        require(st.active, "Stake is not active");

        // Claim any pending reward first
        (uint256 pendingTokens, ) = getPendingReward(msg.sender, _index);
        if (pendingTokens > 0) {
            btcToken.transfer(msg.sender, pendingTokens);
            _payReferralCommission(msg.sender, pendingTokens);
        }

        uint256 tokensToReturn = st.amountTokens;
        uint256 totalFee = 0;

        // Apply 5% early withdrawal fee if 365-day locked staking is terminated early
        if (st.is365Day && (block.timestamp < st.startTime + 365 days)) {
            uint256 penalty = (tokensToReturn * 5) / 100;
            totalFee += penalty;
        }

        // Apply 10% sell/withdrawal fee
        uint256 withdrawalFee = (tokensToReturn * 10) / 100;
        totalFee += withdrawalFee;

        uint256 netReturn = tokensToReturn - totalFee;

        st.active = false;
        users[msg.sender].totalSelfStakeUSD -= st.amountUSD;

        // Burn 96% of the 10% withdrawal fee
        uint256 burnAmount = (withdrawalFee * 96) / 100;
        if (burnAmount > 0) {
            btcToken.burn(burnAmount);
        }

        // Transfer remaining net tokens back to user
        btcToken.transfer(msg.sender, netReturn);

        emit Unstaked(msg.sender, _index, netReturn, totalFee);
    }

    // Sell BTC 3.0 tokens back to USDT
    function sellTokens(uint256 _btcAmount) external nonReentrant {
        require(users[msg.sender].registered, "Must be registered");
        require(_btcAmount > 0, "Amount must be greater than 0");

        // Transfer BTC tokens from user to contract
        btcToken.transferFrom(msg.sender, address(this), _btcAmount);

        // 2% Sell Fee
        uint256 fee = (_btcAmount * 2) / 100;
        uint256 netBtc = _btcAmount - fee;

        // Burn 96% of the 2% fee
        uint256 burnAmount = (fee * 96) / 100;
        if (burnAmount > 0) {
            btcToken.burn(burnAmount);
        }

        // Calculate USDT payout based on current price
        uint256 price = getCurrentPrice();
        uint256 usdtPayout = (netBtc * price) / 10**18;

        require(usdtToken.balanceOf(address(this)) >= usdtPayout, "Insufficient contract USDT balance");
        
        // Transfer USDT to user
        usdtToken.transfer(msg.sender, usdtPayout);

        if (totalUSDValueMinted >= usdtPayout) {
            totalUSDValueMinted -= usdtPayout;
        } else {
            totalUSDValueMinted = 0;
        }

        emit Sold(msg.sender, _btcAmount, usdtPayout, price);
    }

    // Sell BTC 3.0 tokens back to BNB (assuming fixed rate 1 BNB = $600 USD)
    function sellTokensForBNB(uint256 _btcAmount) external nonReentrant {
        require(users[msg.sender].registered, "Must be registered");
        require(_btcAmount > 0, "Amount must be greater than 0");

        // Transfer BTC tokens from user to contract
        btcToken.transferFrom(msg.sender, address(this), _btcAmount);

        // 2% Sell Fee
        uint256 fee = (_btcAmount * 2) / 100;
        uint256 netBtc = _btcAmount - fee;

        // Burn 96% of the 2% fee
        uint256 burnAmount = (fee * 96) / 100;
        if (burnAmount > 0) {
            btcToken.burn(burnAmount);
        }

        // Calculate BNB payout based on current price
        uint256 price = getCurrentPrice();
        uint256 usdtValue = (netBtc * price) / 10**18;
        uint256 bnbPayout = usdtValue / 600;

        require(address(this).balance >= bnbPayout, "Insufficient contract BNB balance");

        // Transfer BNB to user
        payable(msg.sender).transfer(bnbPayout);

        emit Sold(msg.sender, _btcAmount, bnbPayout, price);
    }

    // Withdraw USDT gathered in the contract
    function withdrawUSDT(uint256 _amount) external onlyOwner {
        require(usdtToken.balanceOf(address(this)) >= _amount, "Insufficient balance");
        usdtToken.transfer(owner(), _amount);

        if (totalUSDValueMinted >= _amount) {
            totalUSDValueMinted -= _amount;
        } else {
            totalUSDValueMinted = 0;
        }
    }

    // Withdraw BNB gathered in the contract
    function withdrawBNB(uint256 _amount) external onlyOwner {
        require(address(this).balance >= _amount, "Insufficient BNB balance");
        payable(owner()).transfer(_amount);
    }

    // Spin the Lucky Wheel
    function spinWheel() external nonReentrant {
        require(users[msg.sender].registered, "Must be registered");
        require(btcToken.balanceOf(msg.sender) >= spinCost, "Insufficient RSS balance to spin");

        // Transfer spin cost from user to this contract
        btcToken.transferFrom(msg.sender, address(this), spinCost);

        // Burn 75% of the spin cost, leaving 25% in the contract reward pool
        uint256 burnAmount = (spinCost * 75) / 100;
        if (burnAmount > 0) {
            btcToken.burn(burnAmount);
        }

        // Generate pseudorandom number between 0 and 99
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
            require(btcToken.balanceOf(address(this)) >= rewardAmount, "Contract has insufficient token reserves");
            btcToken.transfer(msg.sender, rewardAmount);
        }

        emit WheelSpun(msg.sender, prizeIndex, rewardAmount);
    }

    // Set the spin cost (Admin only)
    function setSpinCost(uint256 _newCost) external onlyOwner {
        spinCost = _newCost;
    }

    // Set level commission percentages (basis points, e.g. 1000 = 10%)
    function setLevelPercents(uint256[5] calldata _newPercents) external onlyOwner {
        for (uint256 i = 0; i < 5; i++) {
            require(_newPercents[i] <= 5000, "Max 50% per level");
        }
        levelPercents = _newPercents;
    }

    // Allow contract to receive BNB directly for funding
    receive() external payable {}
}

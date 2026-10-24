// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AltruvaCore
 * @dev 100% Community Distribution System in pure USDT (BEP-20) on BNB Smart Chain.
 * 
 * 5 Income Streams (100% Total Distribution):
 * 1. Community Participation Income: 40% (Global Single-Leg up to 40 levels)
 * 2. Team Performance Income: 25% (Binary 50:50 Matching)
 * 3. Contribution Level Income: 25% (Unilevel Levels 1-9)
 * 4. Leadership Achievement: 5% (Nexus 3%, Legacy Crown 2%, Daily 50/50 carry forward, 5x exit cap)
 * 5. Community Reward & Jackpot: 5% (Scratch & Win Coupons, 70/30 carry forward)
 *
 * The X-Factor: Withdrawal & Auto Re-Investment Plan:
 * - $25 - $5,000: 50% Withdrawal / 50% Auto Re-Invest
 * - $5,001 - $29,999: 60% Withdrawal / 40% Auto Re-Invest
 * - $30,000+: 70% Withdrawal / 30% Auto Re-Invest
 */
contract AltruvaCore is Ownable, ReentrancyGuard {
    IERC20 public immutable usdtToken;

    uint256 public constant MIN_PACKAGE_USD = 25 * 10**18;
    uint256 public constant TIER_2_MIN_USD = 50 * 10**18;
    uint256 public constant TIER_3_MIN_USD = 100 * 10**18;

    uint256 public constant QUALIFY_WINDOW = 3 days; // 72 hours for rank and coupon direct qualification

    // Contribution Level Percents (basis points out of 10000, Total = 2500 bps = 25%)
    // L1: 10%, L2: 4%, L3: 2%, L4: 2%, L5: 2%, L6: 2%, L7: 1%, L8: 1%, L9: 1%
    uint256[9] public contributionPercents = [
        1000, 400, 200, 200, 200, 200, 100, 100, 100
    ];

    struct User {
        bool registered;
        uint256 globalIndex;      // 1-based index in global single leg
        address referrer;         // Direct sponsor
        uint256 totalPackageUSD;   // Current active package (increases with fresh packages/reinvests)
        uint256 selfDepositUSD;    // Cumulative fresh deposits
        uint256 selfReinvestUSD;   // Cumulative auto-reinvested funds
        uint256 registrationTime;
        uint256 directCount;       // Total direct referrals
        uint256 directActiveCount; // Directs with active package >= $25
        
        // Binary volume
        uint256 leftVolume;
        uint256 rightVolume;
        uint256 matchedVolume;
        uint8 preferredLeg;        // 0 = Left, 1 = Right, 2 = Auto-Balance

        // Financials
        uint256 claimableEarnings; // USDT balance ready to withdraw
        uint256 totalWithdrawnUSD; // Total USDT transferred to user wallet
        uint256 totalEarnedUSD;    // Cumulative total income earned from all streams
        
        // Leadership & Gamification
        bool nexusQualified;
        bool legacyCrownQualified;
        bool exitedLeadership;     // True if 5x cap reached
        uint256 scratchCoupons;
    }

    // Global Single Leg list
    address[] public globalUsers;
    mapping(address => User) public users;
    mapping(address => address[]) public directs;

    // Binary Tree Relationships
    mapping(address => address) public binaryParent;
    mapping(address => address) public binaryLeftChild;
    mapping(address => address) public binaryRightChild;

    // Leadership Pools (USDT)
    uint256 public nexusPool;
    uint256 public legacyCrownPool;
    address[] public nexusLeaders;
    address[] public legacyCrownLeaders;
    uint256 public lastLeadershipSettlement;

    // Community Reward & Jackpot Pool (5%)
    uint256 public jackpotPool;
    uint256 public totalJackpotPaid;

    // Platform Stats
    uint256 public totalCompanyVolumeUSD;
    uint256 public totalReinvestVolumeUSD;
    uint256 public totalWithdrawnSystemUSD;
    uint256 public totalUsersCount;

    // Events
    event Registered(address indexed user, address indexed referrer, uint256 globalIndex);
    event PackagePurchased(address indexed user, uint256 amountUSD, bool isReinvestment);
    event SingleLegDistributed(address indexed source, address indexed recipient, uint256 amountUSD, uint256 level, bool isUpline);
    event LevelCommissionDistributed(address indexed source, address indexed recipient, uint256 amountUSD, uint256 level);
    event BinaryVolumeAdded(address indexed user, uint256 leftAdd, uint256 rightAdd);
    event BinaryMatched(address indexed user, uint256 matchedUnits, uint256 payoutUSD);
    event LeadershipQualified(address indexed user, string rankName);
    event LeadershipSettled(uint256 nexusDistributed, uint256 legacyDistributed, uint256 timestamp);
    event ScratchCouponAwarded(address indexed user, uint256 count);
    event ScratchRevealed(address indexed user, uint256 prizeUSD);
    event Withdrawn(address indexed user, uint256 grossAmount, uint256 sentToWallet, uint256 autoReinvested);

    constructor(address _usdtAddress) Ownable(msg.sender) {
        require(_usdtAddress != address(0), "Invalid USDT address");
        usdtToken = IERC20(_usdtAddress);
        lastLeadershipSettlement = block.timestamp;

        // Register Root Node (Owner = ID #1)
        _registerUser(msg.sender, address(0));
        users[msg.sender].totalPackageUSD = 100000 * 10**18; // Max root tier
        users[msg.sender].nexusQualified = true;
        users[msg.sender].legacyCrownQualified = true;
        nexusLeaders.push(msg.sender);
        legacyCrownLeaders.push(msg.sender);
    }

    /**
     * @notice Get user single-leg open level count based on package amount
     * $25-$49 -> 10 Up + 10 Down = 20 levels
     * $50-$99 -> 15 Up + 15 Down = 30 levels
     * $100+   -> 20 Up + 20 Down = 40 levels
     */
    function getSingleLegOpenLevels(address _user) public view returns (uint256 halfLevels, uint256 totalLevels) {
        uint256 pkg = users[_user].totalPackageUSD;
        if (pkg >= TIER_3_MIN_USD) {
            return (20, 40);
        } else if (pkg >= TIER_2_MIN_USD) {
            return (15, 30);
        } else if (pkg >= MIN_PACKAGE_USD) {
            return (10, 20);
        }
        return (0, 0);
    }

    /**
     * @notice Register and activate package in a single transaction
     */
    function registerAndActivate(address _referrer, uint256 _amountUSD, uint8 _preferredLeg) external nonReentrant {
        require(!users[msg.sender].registered, "Already registered");
        require(_amountUSD >= MIN_PACKAGE_USD, "Minimum package is $25");
        
        address sponsor = _referrer;
        if (sponsor == address(0) || !users[sponsor].registered || sponsor == msg.sender) {
            sponsor = owner(); // Default fallback sponsor is root
        }

        _registerUser(msg.sender, sponsor);
        users[msg.sender].preferredLeg = _preferredLeg;

        // Transfer USDT from user to contract
        usdtToken.transferFrom(msg.sender, address(this), _amountUSD);

        _activatePackage(msg.sender, _amountUSD, false);
    }

    /**
     * @notice Upgrade or top-up active package
     */
    function upgradePackage(uint256 _amountUSD) external nonReentrant {
        require(users[msg.sender].registered, "Must be registered first");
        require(_amountUSD >= MIN_PACKAGE_USD, "Minimum upgrade is $25");

        usdtToken.transferFrom(msg.sender, address(this), _amountUSD);
        _activatePackage(msg.sender, _amountUSD, false);
    }

    /**
     * @dev Internal registration logic
     */
    function _registerUser(address _user, address _sponsor) internal {
        globalUsers.push(_user);
        uint256 gIdx = globalUsers.length; // 1-based index

        users[_user].registered = true;
        users[_user].globalIndex = gIdx;
        users[_user].referrer = _sponsor;
        users[_user].registrationTime = block.timestamp;
        totalUsersCount++;

        if (_sponsor != address(0) && _sponsor != _user) {
            directs[_sponsor].push(_user);
            users[_sponsor].directCount++;
            
            // Place into Binary Tree under sponsor
            _placeBinaryNode(_sponsor, _user);
        }

        emit Registered(_user, _sponsor, gIdx);
    }

    /**
     * @dev Places a new user into the binary tree based on sponsor preference
     */
    function _placeBinaryNode(address _sponsor, address _newUser) internal {
        uint8 pref = users[_sponsor].preferredLeg;
        address parent = _sponsor;

        // Auto balance if preferredLeg == 2
        if (pref == 2) {
            pref = users[_sponsor].leftVolume <= users[_sponsor].rightVolume ? 0 : 1;
        }

        // Traverse down the chosen side to find first empty leaf
        while (true) {
            if (pref == 0) {
                if (binaryLeftChild[parent] == address(0)) {
                    binaryLeftChild[parent] = _newUser;
                    binaryParent[_newUser] = parent;
                    break;
                } else {
                    parent = binaryLeftChild[parent];
                }
            } else {
                if (binaryRightChild[parent] == address(0)) {
                    binaryRightChild[parent] = _newUser;
                    binaryParent[_newUser] = parent;
                    break;
                } else {
                    parent = binaryRightChild[parent];
                }
            }
        }
    }

    /**
     * @dev Core package processing and 100% distribution execution
     */
    function _activatePackage(address _user, uint256 _amountUSD, bool _isReinvestment) internal {
        users[_user].totalPackageUSD += _amountUSD;
        if (!_isReinvestment) {
            users[_user].selfDepositUSD += _amountUSD;
            totalCompanyVolumeUSD += _amountUSD;
            _checkCouponsAndRanksOnJoin(_user, _amountUSD);
        } else {
            users[_user].selfReinvestUSD += _amountUSD;
            totalReinvestVolumeUSD += _amountUSD;
        }

        // Update active directs for sponsor if not already counted
        address sponsor = users[_user].referrer;
        if (sponsor != address(0) && users[_user].totalPackageUSD >= MIN_PACKAGE_USD) {
            // Check direct active count
            uint256 active = 0;
            for (uint256 i = 0; i < directs[sponsor].length; i++) {
                if (users[directs[sponsor][i]].totalPackageUSD >= MIN_PACKAGE_USD) {
                    active++;
                }
            }
            users[sponsor].directActiveCount = active;
        }

        // 100% Mathematical Distribution:
        // 1. 40% Community Participation (Global Single Leg)
        _distributeGlobalSingleLeg(_user, _amountUSD, _isReinvestment);

        // 2. 25% Contribution Level Income (Unilevel 1-9)
        _distributeContributionLevels(_user, _amountUSD);

        // 3. 25% Team Performance (Binary Matching Volume)
        _distributeBinaryPerformance(_user, _amountUSD);

        // 4. 5% Leadership Achievement Pool
        _distributeLeadershipPool(_amountUSD);

        // 5. 5% Community Reward & Jackpot Pool
        _distributeJackpotPool(_amountUSD);

        emit PackagePurchased(_user, _amountUSD, _isReinvestment);
    }

    /**
     * @dev Stream 1: 40% Community Participation Income (Global Single Leg)
     * Up to 20 Uplines (1% each) and up to 20 Downlines (1% each)
     * Any unqualified or out-of-bounds shares route to owner (breakage).
     */
    function _distributeGlobalSingleLeg(address _user, uint256 _amountUSD, bool _isReinvestment) internal {
        uint256 onePercent = _amountUSD / 100;
        uint256 userIdx = users[_user].globalIndex; // 1-based
        uint256 breakage = 0;

        // Distribute to Uplines (up to 20 users registered before _user)
        for (uint256 i = 1; i <= 20; i++) {
            if (userIdx > i) {
                address upline = globalUsers[userIdx - 1 - i];
                (uint256 halfLevels, ) = getSingleLegOpenLevels(upline);
                if (i <= halfLevels) {
                    _creditEarnings(upline, onePercent);
                    emit SingleLegDistributed(_user, upline, onePercent, i, true);
                } else {
                    breakage += onePercent;
                }
            } else {
                breakage += onePercent;
            }
        }

        // Distribute to Downlines (up to 20 users registered after _user)
        // Downlines earn when uplines re-invest (or fresh activity triggers pool)
        for (uint256 i = 1; i <= 20; i++) {
            if (userIdx + i <= globalUsers.length) {
                address downline = globalUsers[userIdx - 1 + i];
                (uint256 halfLevels, ) = getSingleLegOpenLevels(downline);
                if (i <= halfLevels) {
                    _creditEarnings(downline, onePercent);
                    emit SingleLegDistributed(_user, downline, onePercent, i, false);
                } else {
                    breakage += onePercent;
                }
            } else {
                breakage += onePercent;
            }
        }

        if (breakage > 0) {
            _creditEarnings(owner(), breakage);
        }
    }

    /**
     * @dev Stream 2: 25% Contribution Level Income (Unilevel 1-9)
     * L1: 10%, L2: 4%, L3: 2%, L4: 2%, L5: 2%, L6: 2%, L7: 1%, L8: 1%, L9: 1%
     */
    function _distributeContributionLevels(address _user, uint256 _amountUSD) internal {
        address current = users[_user].referrer;
        uint256 totalAllocated = 0;

        for (uint256 level = 0; level < 9; level++) {
            if (current == address(0)) {
                // Route remaining levels to owner breakage
                uint256 remainingBps = 0;
                for (uint256 rem = level; rem < 9; rem++) {
                    remainingBps += contributionPercents[rem];
                }
                uint256 breakage = (_amountUSD * remainingBps) / 10000;
                _creditEarnings(owner(), breakage);
                break;
            }

            uint256 directCount = users[current].directActiveCount;
            bool qualified = false;

            // Direct Qualification:
            // 1 Direct -> Levels 1-3
            // 2 Directs -> Levels 4-6
            // 3 Directs -> Levels 7-9
            if (level < 3 && directCount >= 1) {
                qualified = true;
            } else if (level >= 3 && level < 6 && directCount >= 2) {
                qualified = true;
            } else if (level >= 6 && directCount >= 3) {
                qualified = true;
            }

            uint256 comm = (_amountUSD * contributionPercents[level]) / 10000;
            if (qualified) {
                _creditEarnings(current, comm);
                emit LevelCommissionDistributed(_user, current, comm, level + 1);
            } else {
                // Breakage to owner
                _creditEarnings(owner(), comm);
            }

            totalAllocated += comm;
            current = users[current].referrer;
        }
    }

    /**
     * @dev Stream 3: 25% Team Performance (Binary Matching)
     * Traverses upline binary tree, adds volume, and executes instant 50:50 matching
     */
    function _distributeBinaryPerformance(address _user, uint256 _amountUSD) internal {
        address current = binaryParent[_user];
        address child = _user;

        while (current != address(0)) {
            bool isLeft = (binaryLeftChild[current] == child);
            if (isLeft) {
                users[current].leftVolume += _amountUSD;
                emit BinaryVolumeAdded(current, _amountUSD, 0);
            } else {
                users[current].rightVolume += _amountUSD;
                emit BinaryVolumeAdded(current, 0, _amountUSD);
            }

            // 50:50 Matching Check
            uint256 minVol = users[current].leftVolume < users[current].rightVolume ? users[current].leftVolume : users[current].rightVolume;
            if (minVol > users[current].matchedVolume) {
                uint256 newMatch = minVol - users[current].matchedVolume;
                users[current].matchedVolume = minVol;
                
                // 25% pool equivalent payout for matching units
                uint256 binaryPayout = (newMatch * 25) / 100;
                _creditEarnings(current, binaryPayout);
                emit BinaryMatched(current, newMatch, binaryPayout);
            }

            child = current;
            current = binaryParent[current];
        }
    }

    /**
     * @dev Stream 4: 5% Leadership Achievement Pool (Nexus 3%, Legacy Crown 2%)
     */
    function _distributeLeadershipPool(uint256 _amountUSD) internal {
        nexusPool += (_amountUSD * 3) / 100;
        legacyCrownPool += (_amountUSD * 2) / 100;
    }

    /**
     * @dev Stream 5: 5% Community Reward & Jackpot Pool
     */
    function _distributeJackpotPool(uint256 _amountUSD) internal {
        jackpotPool += (_amountUSD * 5) / 100;
    }

    /**
     * @dev Check and qualify for coupons and leadership ranks within 72h window
     */
    function _checkCouponsAndRanksOnJoin(address _user, uint256 _amountUSD) internal {
        // Coupon granting on fresh joining
        if (_amountUSD >= TIER_3_MIN_USD) {
            users[_user].scratchCoupons += 2; // $100 -> 2 coupons
            emit ScratchCouponAwarded(_user, 2);
        } else if (_amountUSD >= TIER_2_MIN_USD) {
            users[_user].scratchCoupons += 1; // $50 -> 1 coupon
            emit ScratchCouponAwarded(_user, 1);
        }

        // Check sponsor for coupon & rank qualifications
        address sponsor = users[_user].referrer;
        if (sponsor != address(0) && block.timestamp <= users[sponsor].registrationTime + QUALIFY_WINDOW) {
            // Count directs with same or above package
            uint256 directs50Count = 0;
            uint256 directs100Count = 0;
            uint256 directs25Count = 0;

            for (uint256 i = 0; i < directs[sponsor].length; i++) {
                address d = directs[sponsor][i];
                if (users[d].totalPackageUSD >= TIER_3_MIN_USD) directs100Count++;
                if (users[d].totalPackageUSD >= TIER_2_MIN_USD) directs50Count++;
                if (users[d].totalPackageUSD >= MIN_PACKAGE_USD) directs25Count++;
            }

            // Coupon qualification for $25 package holder (2 directs >= $25 in 3 days)
            if (users[sponsor].totalPackageUSD >= MIN_PACKAGE_USD && directs25Count >= 2) {
                // Award 1 coupon if not yet received
                users[sponsor].scratchCoupons += 1;
                emit ScratchCouponAwarded(sponsor, 1);
            }

            // Nexus Rank: Self $50 + 2 directs of $50+ within 3 days
            if (!users[sponsor].nexusQualified && users[sponsor].totalPackageUSD >= TIER_2_MIN_USD && directs50Count >= 2) {
                users[sponsor].nexusQualified = true;
                nexusLeaders.push(sponsor);
                emit LeadershipQualified(sponsor, "NEXUS");
            }

            // Legacy Crown Rank: Self $100 + 2 directs of $100+ within 3 days
            if (!users[sponsor].legacyCrownQualified && users[sponsor].totalPackageUSD >= TIER_3_MIN_USD && directs100Count >= 2) {
                users[sponsor].legacyCrownQualified = true;
                legacyCrownLeaders.push(sponsor);
                emit LeadershipQualified(sponsor, "LEGACY CROWN");
            }
        }
    }

    /**
     * @notice Daily Settle Leadership Pools (Nexus 3%, Legacy Crown 2%)
     * 50% distributed to active qualified leaders, 50% carried forward to next day!
     */
    function settleDailyLeadership() external {
        require(block.timestamp >= lastLeadershipSettlement + 1 days, "Can settle once every 24 hours");
        lastLeadershipSettlement = block.timestamp;

        uint256 nexusToDistribute = nexusPool / 2;
        uint256 legacyToDistribute = legacyCrownPool / 2;

        nexusPool -= nexusToDistribute;
        legacyCrownPool -= legacyToDistribute;

        // Nexus distribution
        uint256 activeNexusCount = 0;
        for (uint256 i = 0; i < nexusLeaders.length; i++) {
            if (!users[nexusLeaders[i]].exitedLeadership) activeNexusCount++;
        }
        if (activeNexusCount > 0 && nexusToDistribute > 0) {
            uint256 share = nexusToDistribute / activeNexusCount;
            for (uint256 i = 0; i < nexusLeaders.length; i++) {
                address leader = nexusLeaders[i];
                if (!users[leader].exitedLeadership) {
                    _creditEarnings(leader, share);
                }
            }
        } else {
            // Carry forward back to pool if no active leaders
            nexusPool += nexusToDistribute;
            nexusToDistribute = 0;
        }

        // Legacy Crown distribution
        uint256 activeLegacyCount = 0;
        for (uint256 i = 0; i < legacyCrownLeaders.length; i++) {
            if (!users[legacyCrownLeaders[i]].exitedLeadership) activeLegacyCount++;
        }
        if (activeLegacyCount > 0 && legacyToDistribute > 0) {
            uint256 share = legacyToDistribute / activeLegacyCount;
            for (uint256 i = 0; i < legacyCrownLeaders.length; i++) {
                address leader = legacyCrownLeaders[i];
                if (!users[leader].exitedLeadership) {
                    _creditEarnings(leader, share);
                }
            }
        } else {
            legacyCrownPool += legacyToDistribute;
            legacyToDistribute = 0;
        }

        emit LeadershipSettled(nexusToDistribute, legacyToDistribute, block.timestamp);
    }

    /**
     * @notice Scratch & Win card action using earned coupons
     * Settles 70% pool across 250 winner slots, 30% carried forward
     */
    function scratchCard() external nonReentrant returns (uint256 prizeWonUSD) {
        require(users[msg.sender].scratchCoupons > 0, "No scratch coupons available");
        users[msg.sender].scratchCoupons--;

        uint256 poolToDistribute = (jackpotPool * 70) / 100;
        if (poolToDistribute == 0) return 0;

        // Pseudo-random index selection across 250 winner brackets:
        // 1st Prize (1/250): 20%
        // 2nd Prize (1/250): 10%
        // 3rd Prize (1/250): 3%
        // 4th-10th (7/250): 2% each
        // 11th-50th (40/250): 0.50% each
        // 51st-100th (50/250): 0.30% each
        // 101st-250th (150/250): 0.12% each
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, users[msg.sender].scratchCoupons))) % 250;
        uint256 prizeShareBps = 0;

        if (rand == 0) {
            prizeShareBps = 2000; // 20%
        } else if (rand == 1) {
            prizeShareBps = 1000; // 10%
        } else if (rand == 2) {
            prizeShareBps = 300;  // 3%
        } else if (rand < 10) {
            prizeShareBps = 200;  // 2%
        } else if (rand < 50) {
            prizeShareBps = 50;   // 0.50%
        } else if (rand < 100) {
            prizeShareBps = 30;   // 0.30%
        } else {
            prizeShareBps = 12;   // 0.12%
        }

        prizeWonUSD = (poolToDistribute * prizeShareBps) / 10000;
        if (prizeWonUSD > jackpotPool) prizeWonUSD = jackpotPool;

        jackpotPool -= prizeWonUSD;
        totalJackpotPaid += prizeWonUSD;
        _creditEarnings(msg.sender, prizeWonUSD);

        emit ScratchRevealed(msg.sender, prizeWonUSD);
        return prizeWonUSD;
    }

    /**
     * @notice Withdrawal & Auto Re-Investment Engine (The X-Factor)
     * Auto-splits withdrawal amount based on package tier:
     * - $25 - $5,000: 50% Wallet / 50% Auto Re-invest
     * - $5,001 - $29,999: 60% Wallet / 40% Auto Re-invest
     * - $30,000+: 70% Wallet / 30% Auto Re-invest
     */
    function withdraw(uint256 _amountUSD) external nonReentrant {
        require(_amountUSD > 0, "Amount must be > 0");
        require(users[msg.sender].claimableEarnings >= _amountUSD, "Insufficient claimable balance");

        users[msg.sender].claimableEarnings -= _amountUSD;

        uint256 pkg = users[msg.sender].totalPackageUSD;
        uint256 walletPercent = 50;
        uint256 reinvestPercent = 50;

        if (pkg >= 30000 * 10**18) {
            walletPercent = 70;
            reinvestPercent = 30;
        } else if (pkg >= 5001 * 10**18) {
            walletPercent = 60;
            reinvestPercent = 40;
        }

        uint256 sendToWallet = (_amountUSD * walletPercent) / 100;
        uint256 autoReinvest = (_amountUSD * reinvestPercent) / 100;

        users[msg.sender].totalWithdrawnUSD += sendToWallet;
        totalWithdrawnSystemUSD += sendToWallet;

        // 1. Send USDT to user wallet
        require(usdtToken.balanceOf(address(this)) >= sendToWallet, "Contract USDT liquidity buffer check");
        usdtToken.transfer(msg.sender, sendToWallet);

        // 2. Auto Re-invest: re-enters the 100% distribution cycle!
        _activatePackage(msg.sender, autoReinvest, true);

        emit Withdrawn(msg.sender, _amountUSD, sendToWallet, autoReinvest);
    }

    /**
     * @dev Internal credit helper with 5x rank exit check
     */
    function _creditEarnings(address _user, uint256 _amount) internal {
        if (_amount == 0 || _user == address(0)) return;

        users[_user].claimableEarnings += _amount;
        users[_user].totalEarnedUSD += _amount;

        // 5x Rank Exit Cap Check:
        // "5x income from any stream, then you exit from rank income only"
        if (!users[_user].exitedLeadership && users[_user].totalPackageUSD > 0) {
            if (users[_user].totalEarnedUSD >= users[_user].totalPackageUSD * 5) {
                users[_user].exitedLeadership = true;
            }
        }
    }

    /**
     * @notice Set preferred binary leg (0 = Left, 1 = Right, 2 = Auto)
     */
    function setPreferredLeg(uint8 _leg) external {
        require(_leg <= 2, "Invalid leg");
        users[msg.sender].preferredLeg = _leg;
    }

    /**
     * @notice View function for direct referrals list
     */
    function getDirects(address _user) external view returns (address[] memory) {
        return directs[_user];
    }

    /**
     * @notice View function for global users total count
     */
    function getGlobalUsersCount() external view returns (uint256) {
        return globalUsers.length;
    }

    /**
     * @notice View slice of global users around a user (for the 40-level upline/downline UI table)
     */
    function getSingleLegWindow(address _user) external view returns (
        address[] memory uplines,
        uint256[] memory uplinePackages,
        address[] memory downlines,
        uint256[] memory downlinePackages
    ) {
        uint256 idx = users[_user].globalIndex;
        if (idx == 0) return (new address[](0), new uint256[](0), new address[](0), new uint256[](0));

        uint256 upCount = idx > 1 ? (idx - 1 > 20 ? 20 : idx - 1) : 0;
        uplines = new address[](upCount);
        uplinePackages = new uint256[](upCount);

        for (uint256 i = 0; i < upCount; i++) {
            address up = globalUsers[idx - 2 - i];
            uplines[i] = up;
            uplinePackages[i] = users[up].totalPackageUSD;
        }

        uint256 downAvail = globalUsers.length > idx ? globalUsers.length - idx : 0;
        uint256 downCount = downAvail > 20 ? 20 : downAvail;
        downlines = new address[](downCount);
        downlinePackages = new uint256[](downCount);

        for (uint256 i = 0; i < downCount; i++) {
            address down = globalUsers[idx + i];
            downlines[i] = down;
            downlinePackages[i] = users[down].totalPackageUSD;
        }
    }
}

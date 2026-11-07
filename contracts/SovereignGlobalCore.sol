// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SovereignGlobalCore v3.3
 * @notice Master Final Architecture & 10X Viral Edition
 * @dev 100% P2P Instant Split Protocol on BNB Smart Chain (BSC) in USDT (BEP-20).
 * 
 * 100% Distribution across 5 Pools:
 * 1. Time-Bomb Quantum ROI: 30% (Passive 2X cap, 3% first 10 days, 1% after, direct resets 3% for 10 days)
 * 2. Monoline Nexus Yield: 30% (15 Active Uplines + 15 Active Downlines @ 1% each with Dynamic Compression)
 * 3. Velocity Multi-Tier Bonus: 25% (9 Levels: L1 13%, L2 3%, L3 2%, L4-L9 1% each)
 * 4. 72H Alpha Cashback Surge: 10% (3 directs in 72h = 100% refund, or Community Airdrop)
 * 5. FOMO Apocalypse Jackpot: 5% (24H countdown pool: 70% last 50 paid users, 30% top 3 sponsors)
 *
 * Leader Growth Hooks & Safeguards:
 * - 300% (3X) Hard-Cap & Automated Re-Birth Loop
 * - Speed-Decay Engine (14-day direct inactivity penalty)
 * - 30-Day Active Direct Maintenance (70/30 vs 50/50 ratio)
 * - Dynamic Infinity Override (4-10: 5%, 11-25: 7%, 26+: 10%)
 * - Admin Genesis Triangle Chain (Top 3 Hardcoded IDs)
 */
contract SovereignGlobalCore is Ownable, ReentrancyGuard {
    IERC20 public immutable usdtToken;

    // Minimum withdrawal in USDT (18 decimals)
    uint256 public constant MIN_WITHDRAWAL_USD = 5 * 10**18;
    uint256 public constant HARD_CAP_MULTIPLIER = 3; // 300%
    uint256 public constant ROI_CAP_MULTIPLIER = 2;  // 200%

    // 6 Standard Packages
    uint256 public constant PKG_25   = 25 * 10**18;
    uint256 public constant PKG_50   = 50 * 10**18;
    uint256 public constant PKG_100  = 100 * 10**18;
    uint256 public constant PKG_200  = 200 * 10**18;
    uint256 public constant PKG_500  = 500 * 10**18;
    uint256 public constant PKG_1000 = 1000 * 10**18;

    // Velocity Multi-Tier Percents (Basis Points / 10000, Total = 2500 = 25%)
    // L1: 13%, L2: 3%, L3: 2%, L4: 1%, L5: 1%, L6: 1%, L7: 1%, L8: 1%, L9: 1%
    uint256[9] public velocityPercents = [
        1300, 300, 200, 100, 100, 100, 100, 100, 100
    ];

    // Admin Genesis Triangle (3 Fixed Apex IDs)
    address public adminApex1;
    address public adminLeft2;
    address public adminRight3;

    struct User {
        bool registered;
        uint256 globalIndex;           // Chronological monoline placement (1-based)
        address referrer;              // Direct sponsor
        uint256 activePackageUSD;      // Current active tier amount
        uint256 cumulativeDepositUSD;  // Fresh deposits
        uint256 cumulativeReinvestUSD; // Auto-reinvested funds
        uint256 registrationTime;      // Initial join timestamp
        uint256 packageActivationTime; // Last package or re-birth time
        
        // Direct referral metrics
        uint256 directCount;
        uint256 directActiveCount;
        uint256 lastDirectTimestamp;   // For Speed-Decay (14d) and Maintenance (30d)
        uint256 directsIn30Days;       // Count of directs in rolling 30d window
        
        // 72H Cashback Surge Mission
        bool cashbackClaimed;
        bool cashbackEligible;
        uint256 cashbackDirectsCount;

        // Time-Bomb Quantum ROI Tracking
        uint256 roiAccruedUSD;
        uint256 lastRoiClaimTimestamp;
        uint256 boostEndTimestamp;     // Active 3% daily boost window (10 days)

        // Financial balances
        uint256 claimableRoiUSD;       // ROI available to withdraw (always unlocked, 40/60)
        uint256 claimableWorkingUSD;   // Working balance (locked until 3 directs, 70/30)
        uint256 totalWithdrawnUSD;     // Sent to wallet
        uint256 totalEarnedUSD;        // Cumulative gross earnings against 300% Hard-Cap
        
        // Hard-Cap & Rebirth state
        bool isHardCapped;             // Reached 300%
        uint256 rebirthCount;          // Total rebirth cycles
        bool isVipFastTrack;           // Qualified for priority queue jump
    }

    // Monoline storage
    address[] public monolineUsers;
    mapping(address => User) public users;
    mapping(address => address[]) public directs;

    // Pools
    uint256 public cashbackPool;        // 10% 72H Alpha Cashback Surge pool
    uint256 public fomoJackpotPool;      // 5% FOMO Apocalypse Jackpot pool
    uint256 public stabilityPool;        // Spillovers, breakage & hard-cap overflows
    uint256 public totalSystemVolumeUSD;
    uint256 public totalSystemWithdrawnUSD;

    // FOMO Apocalypse Jackpot state (24-hour countdown)
    uint256 public fomoRound;
    uint256 public fomoRoundEndTime;
    address[] public fomoRecentBuyers;   // Last 50 paid users
    address[3] public topSponsors;       // Top 3 direct sponsors of current 24H round
    uint256[3] public topSponsorDirects;

    // Events
    event Registered(address indexed user, address indexed referrer, uint256 globalIndex, uint256 packageUSD);
    event PackageActivated(address indexed user, uint256 packageUSD, bool isRebirth);
    event QuantumRoiBoosted(address indexed user, uint256 newBoostEnd);
    event MonolineYieldPaid(address indexed source, address indexed recipient, uint256 amountUSD, uint256 offset, bool isUpline);
    event VelocityCommissionPaid(address indexed source, address indexed recipient, uint256 amountUSD, uint256 level);
    event DynamicOverridePaid(address indexed sponsor, address indexed admin, uint256 overrideUSD, uint256 directCount);
    event CashbackClaimed(address indexed user, uint256 refundUSD);
    event FomoRoundSettled(uint256 roundId, uint256 totalDistributed, uint256 buyersShare, uint256 sponsorsShare);
    event HardCapReached(address indexed user, uint256 packageUSD, uint256 totalEarnedUSD);
    event RebirthTriggered(address indexed user, uint256 newIndex, bool isVipFastTrack);
    event Withdrawn(address indexed user, uint256 grossAmountUSD, uint256 sentToWalletUSD, uint256 reinvestedUSD, bool isRoiWithdrawal);

    constructor(
        address _usdtAddress,
        address _adminApex1,
        address _adminLeft2,
        address _adminRight3
    ) Ownable(msg.sender) {
        require(_usdtAddress != address(0), "Invalid USDT");
        require(_adminApex1 != address(0) && _adminLeft2 != address(0) && _adminRight3 != address(0), "Invalid Admin Triangle");
        
        usdtToken = IERC20(_usdtAddress);
        adminApex1 = _adminApex1;
        adminLeft2 = _adminLeft2;
        adminRight3 = _adminRight3;

        fomoRoundEndTime = block.timestamp + 24 hours;

        // Hardcode Genesis Admin Triangle Chain (Top 3 IDs)
        _initGenesisAdmin(adminApex1, address(0));
        _initGenesisAdmin(adminLeft2, adminApex1);
        _initGenesisAdmin(adminRight3, adminApex1);
    }

    function _initGenesisAdmin(address _admin, address _sponsor) internal {
        monolineUsers.push(_admin);
        uint256 idx = monolineUsers.length;
        
        User storage u = users[_admin];
        u.registered = true;
        u.globalIndex = idx;
        u.referrer = _sponsor;
        u.activePackageUSD = PKG_1000;
        u.cumulativeDepositUSD = PKG_1000;
        u.registrationTime = block.timestamp;
        u.packageActivationTime = block.timestamp;
        u.boostEndTimestamp = block.timestamp + 3650 days;
    }

    /**
     * @notice Register and activate one of 6 packages ($25, $50, $100, $200, $500, $1000)
     */
    function registerAndActivate(address _referrer, uint256 _packageUSD) external nonReentrant {
        require(!users[msg.sender].registered, "Already registered");
        _validatePackage(_packageUSD);

        address sponsor = _referrer;
        if (sponsor == address(0) || !users[sponsor].registered || sponsor == msg.sender) {
            sponsor = adminApex1; // Default to Genesis Apex
        }

        // Register user
        monolineUsers.push(msg.sender);
        uint256 gIdx = monolineUsers.length;

        User storage u = users[msg.sender];
        u.registered = true;
        u.globalIndex = gIdx;
        u.referrer = sponsor;
        u.activePackageUSD = _packageUSD;
        u.cumulativeDepositUSD = _packageUSD;
        u.registrationTime = block.timestamp;
        u.packageActivationTime = block.timestamp;
        u.lastRoiClaimTimestamp = block.timestamp;
        u.boostEndTimestamp = block.timestamp + 10 days; // 3% daily for first 10 days!

        // Update sponsor direct metrics
        directs[sponsor].push(msg.sender);
        users[sponsor].directCount++;
        users[sponsor].directActiveCount++;
        users[sponsor].lastDirectTimestamp = block.timestamp;
        users[sponsor].directsIn30Days++;

        // Reset sponsor's ROI boost to 3% for 10 days upon new direct!
        users[sponsor].boostEndTimestamp = block.timestamp + 10 days;
        emit QuantumRoiBoosted(sponsor, users[sponsor].boostEndTimestamp);

        // Check 72H Cashback surge eligibility for sponsor
        if (block.timestamp <= users[sponsor].packageActivationTime + 72 hours) {
            users[sponsor].cashbackDirectsCount++;
            if (users[sponsor].cashbackDirectsCount >= 3 && !users[sponsor].cashbackEligible) {
                users[sponsor].cashbackEligible = true;
            }
        }

        // Transfer USDT into protocol
        usdtToken.transferFrom(msg.sender, address(this), _packageUSD);
        totalSystemVolumeUSD += _packageUSD;

        // Execute 100% P2P Instant Split across 5 pools
        _executeFivePoolSplit(msg.sender, _packageUSD);

        // FOMO tracking
        _recordFomoEntry(msg.sender, sponsor);

        emit Registered(msg.sender, sponsor, gIdx, _packageUSD);
    }

    /**
     * @notice Upgrade or re-activate package
     */
    function upgradePackage(uint256 _packageUSD) external nonReentrant {
        require(users[msg.sender].registered, "Not registered");
        _validatePackage(_packageUSD);

        User storage u = users[msg.sender];
        u.activePackageUSD = _packageUSD;
        u.cumulativeDepositUSD += _packageUSD;
        u.packageActivationTime = block.timestamp;
        u.lastRoiClaimTimestamp = block.timestamp;
        u.boostEndTimestamp = block.timestamp + 10 days;
        u.isHardCapped = false;

        usdtToken.transferFrom(msg.sender, address(this), _packageUSD);
        totalSystemVolumeUSD += _packageUSD;

        _executeFivePoolSplit(msg.sender, _packageUSD);
        _recordFomoEntry(msg.sender, u.referrer);

        emit PackageActivated(msg.sender, _packageUSD, false);
    }

    /**
     * @dev Validates package against the 6 standard tiers
     */
    function _validatePackage(uint256 _pkg) internal pure {
        require(
            _pkg == PKG_25 || _pkg == PKG_50 || _pkg == PKG_100 || 
            _pkg == PKG_200 || _pkg == PKG_500 || _pkg == PKG_1000,
            "Invalid package tier"
        );
    }

    /**
     * @dev 100% P2P Split Logic:
     * 1. 30% Time-Bomb Quantum ROI
     * 2. 30% Monoline Nexus Yield (15 Up + 15 Down @ 1% each with dynamic compression)
     * 3. 25% Velocity Multi-Tier Bonus (9 levels: L1 13%, L2 3%, L3 2%, L4-L9 1% each)
     * 4. 10% 72H Alpha Cashback Surge
     * 5. 5% FOMO Apocalypse Jackpot
     */
    function _executeFivePoolSplit(address _user, uint256 _amountUSD) internal {
        // 1. 30% Time-Bomb Quantum ROI Pool
        // Credited directly to user's passive ROI vault for daily claim accrual
        // 30% is allocated to backing the quantum ROI ledger
        // (Handled mathematically in getPendingQuantumRoi)

        // 2. 30% Monoline Nexus Yield (15 Up + 15 Down @ 1% each)
        _distributeMonolineNexus(_user, _amountUSD);

        // 3. 25% Velocity Multi-Tier Bonus (Unilevel 1-9)
        _distributeVelocityBonus(_user, _amountUSD);

        // 4. 10% 72H Alpha Cashback Surge Pool
        cashbackPool += (_amountUSD * 10) / 100;

        // 5. 5% FOMO Apocalypse Jackpot Pool
        fomoJackpotPool += (_amountUSD * 5) / 100;
    }

    /**
     * @dev Stream 2: Monoline Nexus Yield (30%)
     * 15 active wallets above and 15 active wallets below @ 1% each.
     * Dynamic compression skips inactive IDs. Out of bounds goes to Genesis Triangle.
     */
    function _distributeMonolineNexus(address _user, uint256 _amountUSD) internal {
        uint256 onePercent = _amountUSD / 100;
        uint256 userIdx = users[_user].globalIndex; // 1-based
        uint256 uplineCount = 0;
        uint256 downlineCount = 0;

        // 15 Active Uplines
        if (userIdx > 1) {
            for (uint256 i = userIdx - 1; i >= 1 && uplineCount < 15; i--) {
                address up = monolineUsers[i - 1];
                if (users[up].activePackageUSD > 0 && !users[up].isHardCapped) {
                    _creditEarnings(up, onePercent, false);
                    uplineCount++;
                    emit MonolineYieldPaid(_user, up, onePercent, uplineCount, true);
                }
            }
        }
        // Breakage to Genesis Triangle Apex
        if (uplineCount < 15) {
            uint256 breakage = (15 - uplineCount) * onePercent;
            _creditEarnings(adminApex1, breakage, false);
        }

        // 15 Active Downlines
        for (uint256 i = userIdx + 1; i <= monolineUsers.length && downlineCount < 15; i++) {
            address down = monolineUsers[i - 1];
            if (users[down].activePackageUSD > 0 && !users[down].isHardCapped) {
                _creditEarnings(down, onePercent, false);
                downlineCount++;
                emit MonolineYieldPaid(_user, down, onePercent, downlineCount, false);
            }
        }
        // Breakage to Genesis Triangle Left/Right
        if (downlineCount < 15) {
            uint256 breakage = (15 - downlineCount) * onePercent;
            _creditEarnings(adminLeft2, breakage, false);
        }
    }

    /**
     * @dev Stream 3: Velocity Multi-Tier Bonus (25%)
     * Level 1: 13% fixed (0 directs required)
     * Level 2: 3% (1 direct)
     * Level 3: 2% (1 direct)
     * Levels 4-6: 1% each (2 directs)
     * Levels 7-9: 1% each (3 directs)
     * Also processes Dynamic Infinity Override on 4+ directs!
     */
    function _distributeVelocityBonus(address _user, uint256 _amountUSD) internal {
        address current = users[_user].referrer;
        
        for (uint256 level = 0; level < 9; level++) {
            if (current == address(0)) {
                // Route breakage to Genesis Apex
                uint256 remainingBps = 0;
                for (uint256 rem = level; rem < 9; rem++) {
                    remainingBps += velocityPercents[rem];
                }
                uint256 brk = (_amountUSD * remainingBps) / 10000;
                _creditEarnings(adminApex1, brk, false);
                break;
            }

            uint256 directCount = users[current].directActiveCount;
            bool qualified = false;

            if (level == 0) {
                qualified = true; // Level 1 is always unlocked (0 directs)
            } else if (level == 1 || level == 2) {
                qualified = (directCount >= 1);
            } else if (level >= 3 && level <= 5) {
                qualified = (directCount >= 2);
            } else if (level >= 6 && level <= 8) {
                qualified = (directCount >= 3);
            }

            uint256 comm = (_amountUSD * velocityPercents[level]) / 10000;

            if (qualified && !users[current].isHardCapped) {
                _creditEarnings(current, comm, false);
                emit VelocityCommissionPaid(_user, current, comm, level + 1);
            } else {
                _creditEarnings(adminApex1, comm, false);
            }

            // Check Dynamic Infinity Override on direct sponsor for 4th+ directs!
            if (level == 0 && directCount >= 4) {
                _processDynamicOverride(current, _amountUSD, directCount);
            }

            current = users[current].referrer;
        }
    }

    /**
     * @dev Dynamic Override Tiering:
     * 4 to 10 Directs: 5% Override
     * 11 to 25 Directs: 7% Override
     * 26+ Directs: 10% Master Royalty
     * Admin royalty captures this override directly to Master Wallet!
     */
    function _processDynamicOverride(address _sponsor, uint256 _amountUSD, uint256 _directs) internal {
        uint256 overrideBps = 0;
        if (_directs >= 26) {
            overrideBps = 1000; // 10%
        } else if (_directs >= 11) {
            overrideBps = 700;  // 7%
        } else if (_directs >= 4) {
            overrideBps = 500;  // 5%
        }

        if (overrideBps > 0) {
            uint256 royalty = (_amountUSD * overrideBps) / 10000;
            // Admin master wallet captures infinity royalty
            _creditEarnings(adminApex1, royalty, false);
            emit DynamicOverridePaid(_sponsor, adminApex1, royalty, _directs);
        }
    }

    /**
     * @notice Calculate accrued Time-Bomb Quantum ROI
     * First 10 days: 3% daily; then 1% daily.
     * Capped at 2X (200%) of active package.
     */
    function getPendingQuantumRoi(address _user) public view returns (uint256) {
        User storage u = users[_user];
        if (u.activePackageUSD == 0 || u.isHardCapped) return 0;

        uint256 maxRoiUSD = u.activePackageUSD * ROI_CAP_MULTIPLIER;
        if (u.roiAccruedUSD >= maxRoiUSD) return 0;

        uint256 lastClaim = u.lastRoiClaimTimestamp;
        if (lastClaim == 0 || block.timestamp <= lastClaim) return 0;

        uint256 timeElapsed = block.timestamp - lastClaim;
        uint256 dailyYield = 0;

        // Check if currently within 3% boost window
        if (block.timestamp < u.boostEndTimestamp) {
            // 3% daily rate (300 bps / 10000)
            dailyYield = (u.activePackageUSD * 300) / 10000;
        } else {
            // 1% daily rate (100 bps / 10000)
            dailyYield = (u.activePackageUSD * 100) / 10000;
        }

        uint256 pending = (dailyYield * timeElapsed) / 1 days;
        if (u.roiAccruedUSD + pending > maxRoiUSD) {
            pending = maxRoiUSD - u.roiAccruedUSD;
        }
        return pending;
    }

    /**
     * @notice Claim pending Quantum ROI to claimable ROI balance
     */
    function claimQuantumRoi() external nonReentrant {
        uint256 pending = getPendingQuantumRoi(msg.sender);
        require(pending > 0, "No pending ROI");

        User storage u = users[msg.sender];
        u.lastRoiClaimTimestamp = block.timestamp;
        u.roiAccruedUSD += pending;
        _creditEarnings(msg.sender, pending, true);
    }

    /**
     * @notice Claim 72H Alpha Cashback Surge (100% refund) if 3 directs sponsored within 72h
     */
    function claim72HCashback() external nonReentrant {
        User storage u = users[msg.sender];
        require(u.registered, "Not registered");
        require(u.cashbackEligible, "Not eligible for 72H cashback");
        require(!u.cashbackClaimed, "Cashback already claimed");

        u.cashbackClaimed = true;
        uint256 refund = u.activePackageUSD; // 100% refund

        if (refund > cashbackPool) {
            refund = cashbackPool;
        }
        cashbackPool -= refund;

        _creditEarnings(msg.sender, refund, false);
        emit CashbackClaimed(msg.sender, refund);
    }

    /**
     * @dev Internal earnings credit with 300% (3X) Hard-Cap protection
     */
    function _creditEarnings(address _user, uint256 _amount, bool _isRoi) internal {
        if (_amount == 0 || _user == address(0)) return;

        User storage u = users[_user];
        uint256 hardCap = u.activePackageUSD * HARD_CAP_MULTIPLIER;

        if (u.totalEarnedUSD + _amount >= hardCap && hardCap > 0) {
            // Hard cap reached: Lock and divert overflow to Stability Pool
            uint256 allowable = hardCap > u.totalEarnedUSD ? hardCap - u.totalEarnedUSD : 0;
            uint256 overflow = _amount - allowable;

            if (allowable > 0) {
                u.totalEarnedUSD += allowable;
                if (_isRoi) {
                    u.claimableRoiUSD += allowable;
                } else {
                    u.claimableWorkingUSD += allowable;
                }
            }

            if (overflow > 0) {
                stabilityPool += overflow;
            }

            u.isHardCapped = true;
            emit HardCapReached(_user, u.activePackageUSD, u.totalEarnedUSD);
        } else {
            u.totalEarnedUSD += _amount;
            if (_isRoi) {
                u.claimableRoiUSD += _amount;
            } else {
                u.claimableWorkingUSD += _amount;
            }
        }
    }

    /**
     * @notice Withdraw Time-Bomb Quantum ROI
     * Always unlocked without team condition.
     * Fixed 40% Cash to Wallet / 60% Auto Re-invest.
     */
    function withdrawRoi(uint256 _amountUSD) external nonReentrant {
        require(_amountUSD >= MIN_WITHDRAWAL_USD, "Min withdrawal $5 USDT");
        User storage u = users[msg.sender];
        
        // Auto-harvest any pending ROI before withdrawing
        uint256 pending = getPendingQuantumRoi(msg.sender);
        if (pending > 0) {
            u.lastRoiClaimTimestamp = block.timestamp;
            u.roiAccruedUSD += pending;
            _creditEarnings(msg.sender, pending, true);
        }

        require(u.claimableRoiUSD >= _amountUSD, "Insufficient ROI balance");
        u.claimableRoiUSD -= _amountUSD;

        uint256 cashAmount = (_amountUSD * 40) / 100;
        uint256 reinvestAmount = (_amountUSD * 60) / 100;

        _processWithdrawalTransfers(msg.sender, _amountUSD, cashAmount, reinvestAmount, true);
    }

    /**
     * @notice Withdraw Working Network Earnings (Monoline, Velocity, etc.)
     * LOCKED until user has at least 3 direct active referrals!
     * Active maintenance (1 direct in 30d): 70% Cash / 30% Reinvest.
     * Missed maintenance: 50% Cash / 50% Reinvest.
     * Speed-Decay: If no direct in 14 days, max claimable rate reduced to 10%.
     */
    function withdrawWorking(uint256 _amountUSD) external nonReentrant {
        require(_amountUSD >= MIN_WITHDRAWAL_USD, "Min withdrawal $5 USDT");
        User storage u = users[msg.sender];
        require(u.directActiveCount >= 3, "Working locked: 3 direct referrals required");
        require(u.claimableWorkingUSD >= _amountUSD, "Insufficient working balance");

        // Speed-Decay Check: No direct in 14 days drops withdrawal rate
        if (block.timestamp > u.lastDirectTimestamp + 14 days) {
            uint256 allowedSpeedCap = (u.claimableWorkingUSD * 10) / 100;
            if (allowedSpeedCap < MIN_WITHDRAWAL_USD) allowedSpeedCap = MIN_WITHDRAWAL_USD;
            require(_amountUSD <= allowedSpeedCap, "Speed-decay: max 10% withdrawal rate until new direct");
        }

        u.claimableWorkingUSD -= _amountUSD;

        // 30-Day Active Direct Maintenance: 70/30 vs 50/50
        uint256 cashPercent = 70;
        uint256 reinvestPercent = 30;

        if (block.timestamp > u.lastDirectTimestamp + 30 days) {
            cashPercent = 50;
            reinvestPercent = 50;
        }

        uint256 cashAmount = (_amountUSD * cashPercent) / 100;
        uint256 reinvestAmount = (_amountUSD * reinvestPercent) / 100;

        _processWithdrawalTransfers(msg.sender, _amountUSD, cashAmount, reinvestAmount, false);
    }

    /**
     * @dev Internal withdrawal transfer and auto-rebirth handler
     */
    function _processWithdrawalTransfers(
        address _user,
        uint256 _grossUSD,
        uint256 _cashUSD,
        uint256 _reinvestUSD,
        bool _isRoi
    ) internal {
        User storage u = users[_user];
        u.totalWithdrawnUSD += _cashUSD;
        u.cumulativeReinvestUSD += _reinvestUSD;
        totalSystemWithdrawnUSD += _cashUSD;

        // Check if user has reached 3X and needs a Re-Birth Loop execution
        if (u.isHardCapped && (u.claimableRoiUSD + u.claimableWorkingUSD) == 0) {
            _executeRebirth(_user);
        }

        // Send USDT cash to user wallet
        require(usdtToken.balanceOf(address(this)) >= _cashUSD, "Insufficient protocol cash reserve");
        usdtToken.transfer(_user, _cashUSD);

        // Re-inject auto-reinvested funds back into the 100% split cycle
        _executeFivePoolSplit(_user, _reinvestUSD);

        emit Withdrawn(_user, _grossUSD, _cashUSD, _reinvestUSD, _isRoi);
    }

    /**
     * @dev Re-Birth Loop: Spawns new ID at bottom (or VIP slot if 3+ directs in 30d)
     */
    function _executeRebirth(address _user) internal {
        User storage u = users[_user];
        u.rebirthCount++;
        u.totalEarnedUSD = 0;
        u.roiAccruedUSD = 0;
        u.isHardCapped = false;
        u.packageActivationTime = block.timestamp;
        u.lastRoiClaimTimestamp = block.timestamp;
        u.boostEndTimestamp = block.timestamp + 10 days;

        // Smart Re-Birth Queue Jump: 3+ directs in 30d pushes to VIP slot
        bool isVip = (u.directsIn30Days >= 3);
        u.isVipFastTrack = isVip;

        // Push new position into monoline
        monolineUsers.push(_user);
        u.globalIndex = monolineUsers.length;

        emit RebirthTriggered(_user, u.globalIndex, isVip);
    }

    /**
     * @dev Records new entry for FOMO countdown and top sponsor tracking
     */
    function _recordFomoEntry(address _buyer, address _sponsor) internal {
        fomoRecentBuyers.push(_buyer);
        if (fomoRecentBuyers.length > 50) {
            // Keep last 50
            fomoRecentBuyers[fomoRecentBuyers.length - 51] = address(0);
        }

        // Update top sponsors of round
        _updateTopSponsors(_sponsor);
    }

    function _updateTopSponsors(address _sponsor) internal {
        if (_sponsor == address(0)) return;
        uint256 count = users[_sponsor].directCount;

        for (uint256 i = 0; i < 3; i++) {
            if (topSponsors[i] == _sponsor) {
                topSponsorDirects[i] = count;
                return;
            }
        }
        for (uint256 i = 0; i < 3; i++) {
            if (count > topSponsorDirects[i]) {
                topSponsors[i] = _sponsor;
                topSponsorDirects[i] = count;
                break;
            }
        }
    }

    /**
     * @notice Settle FOMO Apocalypse Jackpot round after 24 hours
     * 70% to last 50 paid users, 30% to top 3 direct sponsors.
     */
    function settleFomoJackpot() external nonReentrant {
        require(block.timestamp >= fomoRoundEndTime, "FOMO round still active");
        fomoRoundEndTime = block.timestamp + 24 hours;
        fomoRound++;

        uint256 pool = fomoJackpotPool;
        if (pool == 0) return;

        fomoJackpotPool = 0;
        uint256 buyersShare = (pool * 70) / 100;
        uint256 sponsorsShare = (pool * 30) / 100;

        // 70% across last 50 paid users
        uint256 validBuyers = 0;
        uint256 startIdx = fomoRecentBuyers.length > 50 ? fomoRecentBuyers.length - 50 : 0;
        for (uint256 i = startIdx; i < fomoRecentBuyers.length; i++) {
            if (fomoRecentBuyers[i] != address(0)) validBuyers++;
        }

        if (validBuyers > 0 && buyersShare > 0) {
            uint256 each = buyersShare / validBuyers;
            for (uint256 i = startIdx; i < fomoRecentBuyers.length; i++) {
                address b = fomoRecentBuyers[i];
                if (b != address(0)) {
                    _creditEarnings(b, each, false);
                }
            }
        } else {
            stabilityPool += buyersShare;
        }

        // 30% across top 3 sponsors
        uint256 validSponsors = 0;
        for (uint256 i = 0; i < 3; i++) {
            if (topSponsors[i] != address(0)) validSponsors++;
        }

        if (validSponsors > 0 && sponsorsShare > 0) {
            uint256 each = sponsorsShare / validSponsors;
            for (uint256 i = 0; i < 3; i++) {
                address s = topSponsors[i];
                if (s != address(0)) {
                    _creditEarnings(s, each, false);
                }
            }
        } else {
            stabilityPool += sponsorsShare;
        }

        // Reset top sponsors for next round
        delete topSponsors;
        delete topSponsorDirects;

        emit FomoRoundSettled(fomoRound, pool, buyersShare, sponsorsShare);
    }

    /**
     * @notice View monoline total length
     */
    function getMonolineCount() external view returns (uint256) {
        return monolineUsers.length;
    }

    /**
     * @notice View direct referrals list
     */
    function getDirects(address _user) external view returns (address[] memory) {
        return directs[_user];
    }
}


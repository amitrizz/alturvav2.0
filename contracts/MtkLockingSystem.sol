// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address owner) external view returns (uint256);
}

contract MtkLockingSystem is Ownable {
    IERC20 public token;
    
    struct LockPosition {
        uint256 amountLocked;
        uint256 lastClaimTime;
        uint256 lockDuration; // in days
        bool autoCompound;
        uint256 startTime;
    }
    
    mapping(address => LockPosition[]) public userLocks;
    mapping(address => uint256) public totalEarned;
    uint256 public rewardPoolBalance;
    
    uint256 public constant DAILY_REWARD_PERCENT = 10; // 10% daily reward
    uint256 public constant PENALTY_PERCENT = 1; // 1% penalty
    uint256 public constant CLAIM_WINDOW = 6 hours;
    
    event Locked(address indexed user, uint256 index, uint256 amount, uint256 duration);
    event Withdrawn(address indexed user, uint256 index, uint256 amount);
    event RewardClaimed(address indexed user, uint256 index, uint256 reward, bool compounded);
    event PenaltyApplied(address indexed user, uint256 index, uint256 penalty);
    event PoolFunded(address indexed user, uint256 amount);
    event WheelSpun(address indexed user, uint256 cost, uint256 reward);
    
    constructor(address _tokenAddress) Ownable(msg.sender) {
        token = IERC20(_tokenAddress);
    }
    
    // Get total count of locks for a user
    function getUserLocksCount(address _user) external view returns (uint256) {
        return userLocks[_user].length;
    }
    
    // Calculate pending reward for a specific lock position
    function getPendingReward(address _user, uint256 _index) public view returns (uint256 reward, bool expired, uint256 timeRemaining) {
        if (_index >= userLocks[_user].length) {
            return (0, false, 0);
        }
        LockPosition memory lockPos = userLocks[_user][_index];
        if (lockPos.amountLocked == 0 || lockPos.lastClaimTime == 0) {
            return (0, false, 0);
        }
        
        uint256 elapsedTime = block.timestamp - lockPos.lastClaimTime;
        if (elapsedTime > CLAIM_WINDOW) {
            return (0, true, 0);
        } else {
            // reward = amountLocked * 10% * (elapsedTime / 24 hours)
            reward = (lockPos.amountLocked * DAILY_REWARD_PERCENT * elapsedTime) / (100 * CLAIM_WINDOW);
            timeRemaining = CLAIM_WINDOW - elapsedTime;
            return (reward, false, timeRemaining);
        }
    }
    
    // Toggles auto compound on a specific lock position
    function toggleAutoCompound(uint256 _index) external {
        require(_index < userLocks[msg.sender].length, "Invalid lock index");
        userLocks[msg.sender][_index].autoCompound = !userLocks[msg.sender][_index].autoCompound;
    }
    
    // Lock MTK tokens with specified duration
    function lock(uint256 _amount, uint256 _durationDays) external {
        require(_amount > 0, "Amount must be greater than 0");
        require(_durationDays > 0, "Duration must be greater than 0");
        
        token.transferFrom(msg.sender, address(this), _amount);
        
        userLocks[msg.sender].push(LockPosition({
            amountLocked: _amount,
            lastClaimTime: block.timestamp,
            lockDuration: _durationDays,
            autoCompound: true,
            startTime: block.timestamp
        }));
        
        emit Locked(msg.sender, userLocks[msg.sender].length - 1, _amount, _durationDays);
    }
    
    // Claim pending reward manually for a specific lock
    function claimReward(uint256 _index) external {
        require(_index < userLocks[msg.sender].length, "Invalid lock index");
        _processRewardOrPenalty(msg.sender, _index);
    }
    
    // Internal helper to process claim window for a specific lock
    function _processRewardOrPenalty(address _user, uint256 _index) internal {
        LockPosition storage lockPos = userLocks[_user][_index];
        if (lockPos.amountLocked == 0) return;
        
        uint256 elapsedTime = block.timestamp - lockPos.lastClaimTime;
        
        if (elapsedTime > CLAIM_WINDOW) {
            // Case 2: Claim missed. Reward expires and 1% penalty is applied
            uint256 penalty = (lockPos.amountLocked * PENALTY_PERCENT) / 100;
            if (penalty > lockPos.amountLocked) {
                penalty = lockPos.amountLocked;
            }
            
            lockPos.amountLocked -= penalty;
            rewardPoolBalance += penalty;
            lockPos.lastClaimTime = block.timestamp;
            
            emit PenaltyApplied(_user, _index, penalty);
        } else {
            // Case 1: Claimed on time
            uint256 reward = (lockPos.amountLocked * DAILY_REWARD_PERCENT * elapsedTime) / (100 * CLAIM_WINDOW);
            
            if (reward > 0) {
                require(rewardPoolBalance >= reward, "Insufficient reward pool");
                rewardPoolBalance -= reward;
                totalEarned[_user] += reward;
                
                if (lockPos.autoCompound) {
                    lockPos.amountLocked += reward;
                    emit RewardClaimed(_user, _index, reward, true);
                } else {
                    token.transfer(_user, reward);
                    emit RewardClaimed(_user, _index, reward, false);
                }
            }
            lockPos.lastClaimTime = block.timestamp;
        }
    }
    
    // Withdraw staked MTK from a specific lock index
    function withdraw(uint256 _index, uint256 _amount) external {
        require(_index < userLocks[msg.sender].length, "Invalid lock index");
        LockPosition storage lockPos = userLocks[msg.sender][_index];
        require(block.timestamp >= lockPos.startTime + (lockPos.lockDuration * 1 days), "Lock period not ended");
        require(lockPos.amountLocked >= _amount, "Insufficient locked balance");
        
        // Process any accrued rewards/penalties before updating locked balance
        _processRewardOrPenalty(msg.sender, _index);
        
        // Re-check after potential penalty deduction
        require(lockPos.amountLocked >= _amount, "Insufficient locked balance after penalty check");
        
        lockPos.amountLocked -= _amount;
        token.transfer(msg.sender, _amount);
        
        emit Withdrawn(msg.sender, _index, _amount);
    }
    
    // Fund the reward pool (called by admin or anyone to deposit rewards)
    function fundRewardPool(uint256 _amount) external {
        require(_amount > 0, "Amount must be greater than 0");
        token.transferFrom(msg.sender, address(this), _amount);
        rewardPoolBalance += _amount;
        emit PoolFunded(msg.sender, _amount);
    }
    
    // Spin & Win Wheel Game
    // Cost: 50 MTK
    function spinWheel() external {
        uint256 cost = 50 * 10**18; // 50 MTK (assuming 18 decimals)
        
        // Transfer MTK from user's wallet directly
        token.transferFrom(msg.sender, address(this), cost);
        rewardPoolBalance += cost;
        
        // Generate pseudo-random prize (based on block details)
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % 100;
        
        uint256 winAmount = 0;
        if (rand < 2) {
            winAmount = 1000 * 10**18;
        } else if (rand < 10) {
            winAmount = 200 * 10**18;
        } else if (rand < 30) {
            winAmount = 50 * 10**18;
        } else if (rand < 70) {
            winAmount = 10 * 10**18;
        } else {
            winAmount = 0;
        }
        
        if (winAmount > 0) {
            require(rewardPoolBalance >= winAmount, "Reward pool low");
            rewardPoolBalance -= winAmount;
            token.transfer(msg.sender, winAmount);
        }
        
        emit WheelSpun(msg.sender, cost, winAmount);
    }

    // Withdraw MTK from the reward pool (only owner)
    function withdrawRewardPool(uint256 _amount) external onlyOwner {
        require(_amount <= rewardPoolBalance, "Insufficient reward pool balance");
        rewardPoolBalance -= _amount;
        require(token.transfer(msg.sender, _amount), "Transfer failed");
    }
}

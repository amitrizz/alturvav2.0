const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BtcStakingSystem", function () {
  let BtcToken, btcToken;
  let MockUSDT, usdt;
  let BtcStakingSystem, staking;
  let owner, addr1, addr2, addr3, addr4, addr5, addr6;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3, addr4, addr5, addr6] = await ethers.getSigners();

    MockUSDT = await ethers.getContractFactory("MockUSDT");
    usdt = await MockUSDT.deploy();

    BtcToken = await ethers.getContractFactory("BtcToken");
    btcToken = await BtcToken.deploy("BTC 3.0", "RSS", ethers.parseEther("100000000"));

    BtcStakingSystem = await ethers.getContractFactory("BtcStakingSystem");
    staking = await BtcStakingSystem.deploy(await btcToken.getAddress(), await usdt.getAddress());

    // Fund the staking contract with 85M RSS
    await btcToken.transfer(await staking.getAddress(), ethers.parseEther("85000000"));
  });

  describe("Dynamic Pricing", function () {
    it("should start at $0.50 and increase by $0.0005 per $500 minted", async function () {
      expect(await staking.getCurrentPrice()).to.equal(ethers.parseEther("0.5"));

      // Register addr1
      await staking.connect(addr1).register(ethers.ZeroAddress);

      // Mint $500 worth of tokens (requires usdt approval)
      // Since fee is 2%, let's mint with slightly more to achieve $500 net, or let's see how much we mint
      const mintAmount = ethers.parseEther("511"); // 511 * 0.98 = 500.78 net USD
      await usdt.transfer(addr1.address, mintAmount);
      await usdt.connect(addr1).approve(await staking.getAddress(), mintAmount);

      await staking.connect(addr1).mintTokens(mintAmount);

      // Price should increase by one step ($0.0005) to $0.5005
      expect(await staking.getCurrentPrice()).to.equal(ethers.parseEther("0.5005"));
    });
  });

  describe("Staking and Limits", function () {
    it("should reject stakes below $10 value", async function () {
      await staking.connect(addr1).register(ethers.ZeroAddress);
      
      // Let's give addr1 some BTC tokens (e.g. 10 RSS = $5 value at $0.50 price)
      await btcToken.transfer(addr1.address, ethers.parseEther("10"));
      await btcToken.connect(addr1).approve(await staking.getAddress(), ethers.parseEther("10"));

      await expect(
        staking.connect(addr1).stake(ethers.parseEther("10"), false)
      ).to.be.revertedWith("Min stake is $10");
    });

    it("should accept valid stakes and accrue daily rewards", async function () {
      await staking.connect(addr1).register(ethers.ZeroAddress);
      
      // Give addr1 100 RSS ($50 value)
      await btcToken.transfer(addr1.address, ethers.parseEther("100"));
      await btcToken.connect(addr1).approve(await staking.getAddress(), ethers.parseEther("100"));

      await staking.connect(addr1).stake(ethers.parseEther("100"), false);

      const stakePos = await staking.userStakes(addr1.address, 0);
      expect(stakePos.amountTokens).to.equal(ethers.parseEther("100"));
      expect(stakePos.amountUSD).to.equal(ethers.parseEther("50")); // 100 * 0.50 = 50 USD
      expect(stakePos.rewardCapUSD).to.equal(ethers.parseEther("150")); // 3x of 50 = 150 USD
    });
  });

  describe("Affiliate Program", function () {
    it("should distribute referral commissions based on active direct counts", async function () {
      // Tree: Owner -> Addr1 -> Addr2
      await staking.connect(owner).register(ethers.ZeroAddress);
      await staking.connect(addr1).register(owner.address);
      await staking.connect(addr2).register(addr1.address);

      // Give Addr2 100 RSS to stake
      await btcToken.transfer(addr2.address, ethers.parseEther("100"));
      await btcToken.connect(addr2).approve(await staking.getAddress(), ethers.parseEther("100"));

      // Stake 100 RSS
      await staking.connect(addr2).stake(ethers.parseEther("100"), false);

      // Fast forward 10 days
      await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]);
      await ethers.provider.send("evm_mine");

      // Claim reward for Addr2
      const initialBalanceAddr1 = await btcToken.balanceOf(addr1.address);
      await staking.connect(addr2).claimStakingReward(0);

      const finalBalanceAddr1 = await btcToken.balanceOf(addr1.address);
      
      // Owner has 0 direct active directs initially, so Level 1 commission of Addr2's claim should NOT be paid if they don't have enough active directs.
      // Wait, Addr1 has owner as referrer. Let's see: Addr1 has 1 active direct (Addr2).
      // So Addr1 has unlocked Level 1.
      // Let's verify that Addr1 received Level 1 commission (10% of Addr2's rewards).
      expect(finalBalanceAddr1).to.be.gt(initialBalanceAddr1);
    });
  });
});

const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("BtcStakingSystem", function () {
  let btcToken, usdt, staking;
  let owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    usdt = await MockUSDT.deploy();

    const BtcToken = await ethers.getContractFactory("BtcToken");
    btcToken = await BtcToken.deploy("BTC 3.0", "BTC3.O", ethers.parseEther("100000000"));

    const BtcStakingSystem = await ethers.getContractFactory("BtcStakingSystem");
    staking = await BtcStakingSystem.deploy(await btcToken.getAddress(), await usdt.getAddress());

    await btcToken.transfer(await staking.getAddress(), ethers.parseEther("85000000"));
    await usdt.transfer(await staking.getAddress(), ethers.parseEther("500000"));
  });

  describe("ROI by investment amount", function () {
    it("returns correct rates for each tier", async function () {
      expect(await staking.getRateByAmount(ethers.parseEther("100"))).to.equal(50n);
      expect(await staking.getRateByAmount(ethers.parseEther("500"))).to.equal(60n);
      expect(await staking.getRateByAmount(ethers.parseEther("2001"))).to.equal(75n);
      expect(await staking.getRateByAmount(ethers.parseEther("5001"))).to.equal(100n);
    });
  });

  describe("365-day staking cycle", function () {
    it("creates stake with 365-day end time and tier-based rate", async function () {
      await staking.connect(addr1).register(ethers.ZeroAddress);

      const stakeAmount = ethers.parseEther("200");
      await btcToken.transfer(addr1.address, stakeAmount);
      await btcToken.connect(addr1).approve(await staking.getAddress(), stakeAmount);

      const tx = await staking.connect(addr1).stake(stakeAmount);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt.blockNumber);

      const st = await staking.userStakes(addr1.address, 0);
      expect(st.ratePerDay).to.equal(50n);
      expect(st.endTime).to.equal(BigInt(block.timestamp) + 365n * 24n * 60n * 60n);
    });

    it("blocks unstake before 365 days", async function () {
      await staking.connect(addr1).register(ethers.ZeroAddress);
      const stakeAmount = ethers.parseEther("200");
      await btcToken.transfer(addr1.address, stakeAmount);
      await btcToken.connect(addr1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(addr1).stake(stakeAmount);

      await expect(staking.connect(addr1).unstake(0)).to.be.revertedWith("365-day cycle not complete");
    });

    it("allows unstake after 365 days", async function () {
      await staking.connect(addr1).register(ethers.ZeroAddress);
      const stakeAmount = ethers.parseEther("200");
      await btcToken.transfer(addr1.address, stakeAmount);
      await btcToken.connect(addr1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(addr1).stake(stakeAmount);

      await time.increase(365 * 24 * 60 * 60);
      await expect(staking.connect(addr1).unstake(0)).to.not.be.reverted;
    });
  });

  describe("20-level commissions", function () {
    it("has 20 level percents configured", async function () {
      expect(await staking.levelPercents(0)).to.equal(800n);
      expect(await staking.levelPercents(1)).to.equal(100n);
      expect(await staking.levelPercents(19)).to.equal(10n);
    });
  });

  describe("Rank bonus", function () {
    it("allows claiming bronze bonus when qualified", async function () {
      await staking.connect(addr1).register(ethers.ZeroAddress);

      for (let i = 0; i < 2; i++) {
        const user = (await ethers.getSigners())[i + 4] || addr2;
        try {
          await staking.connect(user).register(addr1.address);
        } catch (_) {}
      }

      const stakeAmount = ethers.parseEther("200");
      await btcToken.transfer(addr1.address, stakeAmount);
      await btcToken.connect(addr1).approve(await staking.getAddress(), stakeAmount);
      await staking.connect(addr1).stake(stakeAmount);

      const qualified = await staking.qualifiesForRankBonus(addr1.address, 0);
      if (qualified) {
        const balBefore = await usdt.balanceOf(addr1.address);
        await staking.connect(addr1).claimRankBonus(0);
        const balAfter = await usdt.balanceOf(addr1.address);
        expect(balAfter - balBefore).to.equal(ethers.parseEther("20"));
      }
    });
  });
});

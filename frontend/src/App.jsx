import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { 
  Shield, Layers, Coins, Plus, ArrowUpRight, Flame, Trophy, Users, 
  ExternalLink, Loader2, Copy, Check, ChevronRight, Info, AlertCircle, 
  Compass, LayoutDashboard, HelpCircle, Moon, Sun, Bell, ArrowRight, BookOpen, Crown, Clock, LogOut
} from "lucide-react";
import { ERC20_ABI, BTC_STAKING_SYSTEM_ABI, RANK_BONUS_NAMES, LEVEL_COMMISSIONS } from "./abis";
import Landing from "./components/Landing";
import { parseTxError, validateMintAmount, getMintUsdValue, BNB_PRICE_USD } from "./utils/parseTxError";
import {
  queryEventsWithFallback,
  buildMintVolumeChart,
  sumRewardsPaidUSD,
  computeGrowthPercent,
  buildBondingCurveTiers,
} from "./utils/platformStats";
import addresses from "./addresses.json";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient, useSwitchChain, useDisconnect } from "wagmi";
import "./App.css?v=3";
import Dashboard from "./components/Dashboard";
import GenesisMint from "./components/GenesisMint";
import StakingPortal from "./components/StakingPortal";
import Affiliates from "./components/Affiliates";
import RanksAndLevels from "./components/RanksAndLevels";
import LuckyWheel from "./components/LuckyWheel";
import Shimmer from "./components/Shimmer";
import Chatbot from "./components/Chatbot";
import InstallApp from "./components/InstallApp";
import { isMobileDevice, isInAppBrowser, hasInjectedProvider, needsHttpsForWallets } from "./utils/mobile";

const tokenSymbol = "BTC3.O";
const tokenName = "BTC3.O";

const rankNames = RANK_BONUS_NAMES;
const REFERRAL_KEY = import.meta.env.VITE_REFERRAL_KEY || "btc3dexSecretKey123";

function encryptAddress(address) {
  if (!address || !ethers.isAddress(address)) return "";
  let result = "";
  const addr = address.toLowerCase();
  for (let i = 0; i < addr.length; i++) {
    const charCode = addr.charCodeAt(i) ^ REFERRAL_KEY.charCodeAt(i % REFERRAL_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function decryptAddress(str) {
  if (!str) return ethers.ZeroAddress;
  try {
    const decoded = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    let result = "";
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ REFERRAL_KEY.charCodeAt(i % REFERRAL_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return ethers.getAddress(result);
  } catch (err) {
    return ethers.ZeroAddress;
  }
}

function App() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
  const { disconnect } = useDisconnect();

  // Connection State
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState("");
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "mint", "stake", "affiliate", "ranks", "wheel"
  const [ranksSubTab, setRanksSubTab] = useState("rank"); // "rank" or "referral"
  const [profileSubTab, setProfileSubTab] = useState("profile"); // "profile" or "guide"
  
  // Balances & Data
  const [bnbBalance, setBnbBalance] = useState("0.0");
  const [usdtBalance, setUsdtBalance] = useState("0.0");
  const [btcBalance, setBtcBalance] = useState("0.0");
  const [usdtApproved, setUsdtApproved] = useState(false);
  const [btcApproved, setBtcApproved] = useState(false);

  // System Stats
  const [currentPrice, setCurrentPrice] = useState("0.5");
  const [totalUSDValueMinted, setTotalUSDValueMinted] = useState("0");
  const [totalMintedTokens, setTotalMintedTokens] = useState("0");
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);
  const [tokenTotalSupply, setTokenTotalSupply] = useState("0");
  const [stakingTokenReserve, setStakingTokenReserve] = useState("0");
  const [totalRewardsPaidUSD, setTotalRewardsPaidUSD] = useState("0");
  const [mintChartData, setMintChartData] = useState([]);
  const [mintVolumeGrowth, setMintVolumeGrowth] = useState(null);
  const [bondingCurveInfo, setBondingCurveInfo] = useState({
    startPrice: "0.5",
    stepVolume: "500",
    stepIncrease: "0.0005",
    tiers: [],
    currentStep: 0,
    bandProgress: 0,
  });

  // Mint Input
  const [mintUsdtAmount, setMintUsdtAmount] = useState("");
  const [estimatedBtcToMint, setEstimatedBtcToMint] = useState("0.0");

  // Staking Input
  const [stakeBtcAmount, setStakeBtcAmount] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [route, setRoute] = useState(window.location.hash === "#/app" ? "app" : "landing");

  // Compounding Calculator State & Logic
  const [calcAmount, setCalcAmount] = useState("1000");
  const [calcYears, setCalcYears] = useState(1);
  const [calcYield, setCalcYield] = useState(0.005);

  const getCompoundedValue = () => {
    const p = parseFloat(calcAmount) || 0;
    const r = parseFloat(calcYield);
    const n = calcYears * 365;
    const futureValue = p * Math.pow(1 + r, n);
    return {
      future: futureValue.toFixed(2),
      yield: (futureValue - p).toFixed(2),
    };
  };
  const compoundingResults = getCompoundedValue();

  // User Stats
  const [userInfo, setUserInfo] = useState({
    referrer: ethers.ZeroAddress,
    directActiveCount: 0,
    directReferralsCount: 0,
    teamSize: 0,
    totalSelfStakeUSD: "0.0",
    totalTeamBusinessUSD: "0.0",
    lastSalaryClaimTime: 0,
    highestSalaryRank: -1,
    registered: false,
    indirectReferralsCount: 0
  });
  const [rankBonusStatus, setRankBonusStatus] = useState([]);
  const [qualifiedSalaryRank, setQualifiedSalaryRank] = useState(-1);
  const [referrerInput, setReferrerInput] = useState("");
  const [userStakesList, setUserStakesList] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sellBtcAmount, setSellBtcAmount] = useState("");
  const [estimatedUsdtFromSell, setEstimatedUsdtFromSell] = useState("0.0");
  const [adminWithdrawAmount, setAdminWithdrawAmount] = useState("");
  const [mintMethod, setMintMethod] = useState("USDT"); // "USDT" or "BNB"
  const [sellMethod, setSellMethod] = useState("USDT"); // "USDT" or "BNB"
  const [spinCost, setSpinCostValue] = useState("10");
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelPrize, setWheelPrize] = useState(null);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef(null);
  const [newSpinCostInput, setNewSpinCostInput] = useState("");
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [contractMismatch, setContractMismatch] = useState(false);

  const networkLabel = "BNB Smart Chain (BSC Testnet)";

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash === "#/app" ? "app" : "landing");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const prizes = [
    { name: "Try Again", color: "#1e293b", reward: `0 ${tokenSymbol}` },
    { name: "Double Match", color: "#b45309", reward: `${(parseFloat(spinCost) * 0.5).toFixed(1)} ${tokenSymbol}` },
    { name: "Triple Match", color: "#1d4ed8", reward: `${(parseFloat(spinCost) * 1.5).toFixed(1)} ${tokenSymbol}` },
    { name: "Mega Prize", color: "#6d28d9", reward: `${(parseFloat(spinCost) * 5.0).toFixed(1)} ${tokenSymbol}` },
    { name: "Jackpot", color: "#b91c1c", reward: `${(parseFloat(spinCost) * 15.0).toFixed(1)} ${tokenSymbol}` }
  ];

  // Loading & Toast State
  const [txLoading, setTxLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    const initEthers = async () => {
      if (isConnected && walletClient) {
        const customProvider = new ethers.BrowserProvider(walletClient);
        const customSigner = await customProvider.getSigner();
        const userAddress = await customSigner.getAddress();
        setProvider(customProvider);
        setSigner(customSigner);
        setAccount(userAddress);

        const net = await customProvider.getNetwork();
        setNetwork(net.name);

        const targetHex = addresses.chainId.toLowerCase();
        const currentHex = "0x" + net.chainId.toString(16);
        setIsWrongNetwork(currentHex !== targetHex);
      } else {
        setProvider(null);
        setSigner(null);
        setAccount("");
        setIsWrongNetwork(false);
      }
    };
    initEthers();
  }, [isConnected, walletClient]);

  // Dynamically update document title and favicon based on activeTab
  useEffect(() => {
    const tabNames = {
      dashboard: "Dashboard",
      mint: "Mint",
      stake: "Stake",
      affiliate: "Profile",
      ranks: "Ranks",
      wheel: "Wheel"
    };
    const currentName = tabNames[activeTab] || "BTC3.O";
    document.title = currentName;

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    link.href = "/logo.png";
  }, [activeTab]);

  // Read referrer code from URL query
  useEffect(() => {
    const hashQuery = window.location.hash.includes("?") ? window.location.hash.split("?")[1] : "";
    const params = new URLSearchParams(hashQuery || window.location.search);
    const refCode = params.get("ref");
    if (refCode) {
      const decrypted = decryptAddress(refCode);
      if (ethers.isAddress(decrypted) && decrypted.toLowerCase() !== account.toLowerCase()) {
        setReferrerInput(decrypted);
        showToast("info", "Referrer address detected from link!");
      }
    }
  }, [account]);

  useEffect(() => {
    if (provider && account && !isWrongNetwork) {
      setUserInfo({
        referrer: ethers.ZeroAddress,
        directActiveCount: 0,
        directReferralsCount: 0,
        teamSize: 0,
        totalSelfStakeUSD: "0.0",
        totalTeamBusinessUSD: "0.0",
        lastSalaryClaimTime: 0,
        highestSalaryRank: -1,
        registered: false,
        indirectReferralsCount: 0
      });
      setUserStakesList([]);
      loadUserData();
      const interval = setInterval(loadUserData, 10000); // refresh every 10s
      return () => clearInterval(interval);
    }
  }, [provider, account, isWrongNetwork]);

  const loadUserData = async () => {
    try {
      // 1. BNB Balance
      const bnbBal = await provider.getBalance(account);
      setBnbBalance(parseFloat(ethers.formatEther(bnbBal)).toFixed(4));

      // Contracts
      const usdtContract = new ethers.Contract(addresses.usdt, ERC20_ABI, provider);
      const btcContract = new ethers.Contract(addresses.token, ERC20_ABI, provider);
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, provider);

      // 2. Token Balances
      const usdtBal = await usdtContract.balanceOf(account);
      const btcBal = await btcContract.balanceOf(account);
      setUsdtBalance(parseFloat(ethers.formatEther(usdtBal)).toFixed(2));
      setBtcBalance(parseFloat(ethers.formatEther(btcBal)).toFixed(2));

      // 3. Allowances
      const usdtAllowance = await usdtContract.allowance(account, addresses.stakingSystem);
      setUsdtApproved(usdtAllowance > ethers.parseEther("10000"));

      const btcAllowance = await btcContract.allowance(account, addresses.stakingSystem);
      setBtcApproved(btcAllowance > ethers.parseEther("10000"));

      // 4. Staking Stats
      const price = await stakingContract.getCurrentPrice();
      setCurrentPrice(ethers.formatEther(price));

      const mintedVal = await stakingContract.totalUSDValueMinted();
      const mintedTok = await stakingContract.totalMintedTokens();
      setTotalUSDValueMinted(ethers.formatEther(mintedVal));
      setTotalMintedTokens(ethers.formatEther(mintedTok));

      const [totalSupply, reserveBalance, startPrice, stepVolume, stepIncrease] = await Promise.all([
        btcContract.totalSupply(),
        btcContract.balanceOf(addresses.stakingSystem),
        stakingContract.START_PRICE(),
        stakingContract.PRICE_STEP_VOLUME(),
        stakingContract.PRICE_STEP_INCREASE(),
      ]);
      setTokenTotalSupply(ethers.formatEther(totalSupply));
      setStakingTokenReserve(ethers.formatEther(reserveBalance));

      const curve = buildBondingCurveTiers(
        startPrice,
        stepVolume,
        stepIncrease,
        ethers.formatEther(mintedVal)
      );
      setBondingCurveInfo({
        startPrice: ethers.formatEther(startPrice),
        stepVolume: ethers.formatEther(stepVolume),
        stepIncrease: ethers.formatEther(stepIncrease),
        tiers: curve.tiers,
        currentStep: curve.currentStep,
        bandProgress: curve.bandProgress,
      });

      const currentBlock = await provider.getBlockNumber();
      const [
        allMintedEvents,
        allRewardClaimed,
        allRankBonusClaimed,
        allMonthlySalaryClaimed,
        allCouponApplied,
        allWheelSpun,
      ] = await Promise.all([
        queryEventsWithFallback(stakingContract, stakingContract.filters.Minted(), provider),
        queryEventsWithFallback(stakingContract, stakingContract.filters.RewardClaimed(), provider),
        queryEventsWithFallback(stakingContract, stakingContract.filters.RankBonusClaimed(), provider),
        queryEventsWithFallback(stakingContract, stakingContract.filters.MonthlySalaryClaimed(), provider),
        queryEventsWithFallback(stakingContract, stakingContract.filters.CouponApplied(), provider),
        queryEventsWithFallback(stakingContract, stakingContract.filters.WheelSpun(), provider),
      ]);

      const chartPoints = buildMintVolumeChart(allMintedEvents, currentBlock);
      setMintChartData(chartPoints);
      setMintVolumeGrowth(computeGrowthPercent(chartPoints));
      setTotalRewardsPaidUSD(
        sumRewardsPaidUSD(
          {
            rewardClaimed: allRewardClaimed,
            rankBonusClaimed: allRankBonusClaimed,
            monthlySalaryClaimed: allMonthlySalaryClaimed,
            couponApplied: allCouponApplied,
            wheelSpun: allWheelSpun,
          },
          ethers.formatEther(price)
        ).toFixed(2)
      );

      let directReferralsCount = 0;
      let indirectReferralsCount = 0;
      try {
        const filter = stakingContract.filters.Registered();
        let events = [];
        try {
          // Try full history first
          events = await stakingContract.queryFilter(filter, 0, "latest");
        } catch {
          try {
            // Fallback: last 50000 blocks
            const currentBlock = await provider.getBlockNumber();
            const startBlock = Math.max(0, currentBlock - 50000);
            events = await stakingContract.queryFilter(filter, startBlock, "latest");
          } catch {
            try {
              // Fallback: last 10000 blocks
              const currentBlock = await provider.getBlockNumber();
              const startBlock = Math.max(0, currentBlock - 10000);
              events = await stakingContract.queryFilter(filter, startBlock, "latest");
            } catch {
              events = [];
            }
          }
        }
        setRegisteredUsersCount(events.length > 0 ? events.length : 1);

        // Build referral tree
        const referralMap = {};
        events.forEach(ev => {
          if (ev.args) {
            const child = ev.args[0] || ev.args.user;
            const parent = ev.args[1] || ev.args.referrer;
            if (child && parent) {
              referralMap[child.toLowerCase()] = parent.toLowerCase();
            }
          }
        });

        const lowerAccount = account.toLowerCase();
        const directList = [];
        Object.keys(referralMap).forEach(child => {
          if (referralMap[child] === lowerAccount) {
            directList.push(child);
            directReferralsCount++;
          }
        });

        let currentLevelUsers = [...directList];
        for (let depth = 2; depth <= 20; depth++) {
          const nextLevelUsers = [];
          Object.keys(referralMap).forEach(child => {
            if (currentLevelUsers.includes(referralMap[child])) {
              nextLevelUsers.push(child);
              indirectReferralsCount++;
            }
          });
          currentLevelUsers = nextLevelUsers;
          if (currentLevelUsers.length === 0) break;
        }
      } catch (e) {
        // If logged-in user exists, count at least 1
        setRegisteredUsersCount(1);
      }

      // Verify contract version (new contracts expose getRateByAmount)
      try {
        await stakingContract.getRateByAmount(ethers.parseEther("100"));
        setContractMismatch(false);
      } catch {
        setContractMismatch(true);
        return;
      }

      // 5. User Registration & Stats
      const u = await stakingContract.users(account);
      setUserInfo({
        referrer: u[0],
        directActiveCount: Number(u[1]),
        directReferralsCount: Number(u[2]),
        teamSize: Number(u[3]),
        totalSelfStakeUSD: ethers.formatEther(u[4]),
        totalTeamBusinessUSD: ethers.formatEther(u[5]),
        lastSalaryClaimTime: Number(u[6]),
        highestSalaryRank: Number(u[7]),
        registered: u[8],
        indirectReferralsCount
      });

      const bonusStatus = [];
      for (let i = 0; i < 10; i++) {
        const claimed = await stakingContract.rankBonusClaimed(account, i);
        const qualified = await stakingContract.qualifiesForRankBonus(account, i);
        bonusStatus.push({ claimed, qualified });
      }
      setRankBonusStatus(bonusStatus);

      const salaryRank = await stakingContract.getQualifiedSalaryRank(account);
      const maxUint = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935");
      setQualifiedSalaryRank(BigInt(salaryRank.toString()) >= maxUint ? -1 : Number(salaryRank));

      // 6. User Stakes list
      const stakes = [];
      let index = 0;
      while (true) {
        try {
          const st = await stakingContract.userStakes(account, index);
          if (st.amountTokens === 0n) break;
          const pending = await stakingContract.getPendingReward(account, index);
          const stAmountUSD = ethers.formatEther(st[1]);
          const capMultiplier = u[1] > 0n ? 5.0 : 2.5;
          const computedCap = (parseFloat(stAmountUSD) * capMultiplier).toFixed(2);

          const endTime = new Date(Number(st[3]) * 1000);
          const daysLeft = Math.max(0, Math.ceil((endTime - new Date()) / 86400000));
          stakes.push({
            index,
            amountTokens: ethers.formatEther(st[0]),
            amountUSD: stAmountUSD,
            startTime: new Date(Number(st[2]) * 1000),
            endTime,
            lastClaimTime: new Date(Number(st[4]) * 1000),
            rewardClaimedUSD: ethers.formatEther(st[5]),
            ratePerDay: Number(st[6]),
            active: st[7],
            daysLeft,
            rewardCapUSD: computedCap,
            pendingTokens: ethers.formatEther(pending[0]),
            pendingUSD: ethers.formatEther(pending[1])
          });
          index++;
        } catch (err) {
          break;
        }
      }
      setUserStakesList(stakes);

      // Load Transaction History
      try {
        const txs = [];
        const currentBlock = await provider.getBlockNumber();
        const startBlock = Math.max(0, currentBlock - 50000);

        const filterMinted = stakingContract.filters.Minted(account);
        const filterStaked = stakingContract.filters.Staked(account);
        const filterSold = stakingContract.filters.Sold(account);
        const filterUnstaked = stakingContract.filters.Unstaked(account);
        const filterRewardClaimed = stakingContract.filters.RewardClaimed(account);
        const filterRankBonusClaimed = stakingContract.filters.RankBonusClaimed(account);
        const filterMonthlySalaryClaimed = stakingContract.filters.MonthlySalaryClaimed(account);
        const filterCouponApplied = stakingContract.filters.CouponApplied(account);
        const filterWheelSpun = stakingContract.filters.WheelSpun(account);

        const [
          mintedEvents,
          stakedEvents,
          soldEvents,
          unstakedEvents,
          rewardClaimedEvents,
          rankBonusClaimedEvents,
          monthlySalaryClaimedEvents,
          couponAppliedEvents,
          wheelSpunEvents
        ] = await Promise.all([
          stakingContract.queryFilter(filterMinted, startBlock, "latest").catch(() => []),
          stakingContract.queryFilter(filterStaked, startBlock, "latest").catch(() => []),
          stakingContract.queryFilter(filterSold, startBlock, "latest").catch(() => []),
          stakingContract.queryFilter(filterUnstaked, startBlock, "latest").catch(() => []),
          stakingContract.queryFilter(filterRewardClaimed, startBlock, "latest").catch(() => []),
          stakingContract.queryFilter(filterRankBonusClaimed, startBlock, "latest").catch(() => []),
          stakingContract.queryFilter(filterMonthlySalaryClaimed, startBlock, "latest").catch(() => []),
          stakingContract.queryFilter(filterCouponApplied, startBlock, "latest").catch(() => []),
          stakingContract.queryFilter(filterWheelSpun, startBlock, "latest").catch(() => [])
        ]);

        mintedEvents.forEach(e => {
          const estTimestamp = Math.floor(Date.now() / 1000) - (Math.max(0, currentBlock - e.blockNumber) * 3);
          txs.push({
            type: "Mint",
            hash: e.transactionHash,
            usdtAmount: ethers.formatEther(e.args[1] || e.args.usdtAmount),
            btcAmount: ethers.formatEther(e.args[2] || e.args.btcAmount),
            price: ethers.formatEther(e.args[3] || e.args.currentPrice),
            blockNumber: e.blockNumber,
            timestamp: estTimestamp,
            date: new Date(estTimestamp * 1000),
            category: "purchase"
          });
        });

        stakedEvents.forEach(e => {
          txs.push({
            type: "Stake",
            hash: e.transactionHash,
            btcAmount: ethers.formatEther(e.args[1] || e.args.amountTokens),
            usdValue: ethers.formatEther(e.args[2] || e.args.amountUSD),
            ratePerDay: Number(e.args[3] || e.args.ratePerDay) / 100,
            endTime: Number(e.args[4] || e.args.endTime),
            blockNumber: e.blockNumber,
            category: "purchase"
          });
        });

        soldEvents.forEach(e => {
          txs.push({
            type: "Sell",
            hash: e.transactionHash,
            btcAmount: ethers.formatEther(e.args[1] || e.args.btcAmount),
            usdtAmount: ethers.formatEther(e.args[2] || e.args.usdtAmount),
            price: ethers.formatEther(e.args[3] || e.args.price),
            blockNumber: e.blockNumber,
            category: "withdrawal"
          });
        });

        unstakedEvents.forEach(e => {
          txs.push({
            type: "Unstake",
            hash: e.transactionHash,
            btcAmount: ethers.formatEther(e.args[2] || e.args.tokenReturned),
            feeUSD: ethers.formatEther(e.args[3] || e.args.feeApplied),
            blockNumber: e.blockNumber,
            category: "withdrawal"
          });
        });

        rewardClaimedEvents.forEach(e => {
          txs.push({
            type: "Yield Claim",
            hash: e.transactionHash,
            btcAmount: ethers.formatEther(e.args[2] || e.args.rewardTokens),
            usdValue: ethers.formatEther(e.args[3] || e.args.rewardUSD),
            blockNumber: e.blockNumber,
            category: "withdrawal"
          });
        });

        rankBonusClaimedEvents.forEach(e => {
          txs.push({
            type: "Rank Bonus",
            hash: e.transactionHash,
            usdValue: ethers.formatEther(e.args[2] || e.args.bonusUSD),
            blockNumber: e.blockNumber,
            category: "withdrawal"
          });
        });

        monthlySalaryClaimedEvents.forEach(e => {
          txs.push({
            type: "Monthly Salary",
            hash: e.transactionHash,
            usdValue: ethers.formatEther(e.args[1] || e.args.salaryUSD),
            blockNumber: e.blockNumber,
            category: "withdrawal"
          });
        });

        couponAppliedEvents.forEach(e => {
          txs.push({
            type: "Coupon",
            hash: e.transactionHash,
            code: e.args[1] || e.args.code,
            usdValue: ethers.formatEther(e.args[2] || e.args.rewardUSD),
            blockNumber: e.blockNumber,
            category: "purchase"
          });
        });

        wheelSpunEvents.forEach(e => {
          txs.push({
            type: "Wheel Spin",
            hash: e.transactionHash,
            prizeIdx: Number(e.args[1] || e.args.index),
            rewardTokens: ethers.formatEther(e.args[2] || e.args.rewardAmount),
            blockNumber: e.blockNumber,
            category: "purchase"
          });
        });

        txs.sort((a, b) => b.blockNumber - a.blockNumber);
        setTransactionHistory(txs);
      } catch (historyErr) {
        console.error("Error loading transaction history:", historyErr);
      }

      // 7. Check if Owner (Admin)
      const ownerAddress = await stakingContract.owner();
      setIsAdmin(ownerAddress.toLowerCase() === account.toLowerCase());

      try {
        const sCost = await stakingContract.spinCost();
        setSpinCostValue(ethers.formatEther(sCost));
      } catch (e) {
        console.error("Error fetching spin cost:", e);
      }
    } catch (err) {
      console.error("Error loading user data:", err);
    }
  };

  const switchNetwork = async () => {
    if (switchChain) {
      try {
        switchChain({ chainId: Number(addresses.chainId) });
      } catch (e) {
        console.error("Error switching chain:", e);
      }
    }
  };

  const approveUsdt = async () => {
    if (!signer) return;
    setTxLoading(true);
    try {
      const usdtContract = new ethers.Contract(addresses.usdt, ERC20_ABI, signer);
      const tx = await usdtContract.approve(addresses.stakingSystem, ethers.MaxUint256);
      showToast("info", "Approve USDT transaction submitted...");
      await tx.wait();
      showToast("success", "USDT Approved successfully!");
      setUsdtApproved(true);
    } catch (err) {
      showToast("error", parseTxError(err, "USDT approval failed.", { action: "approve" }));
    } finally {
      setTxLoading(false);
    }
  };

  const approveBtc = async () => {
    if (!signer) return;
    setTxLoading(true);
    try {
      const btcContract = new ethers.Contract(addresses.token, ERC20_ABI, signer);
      const tx = await btcContract.approve(addresses.stakingSystem, ethers.MaxUint256);
      showToast("info", `Approve ${tokenSymbol} transaction submitted...`);
      await tx.wait();
      showToast("success", `${tokenSymbol} Approved successfully!`);
      setBtcApproved(true);
    } catch (err) {
      showToast("error", parseTxError(err, `${tokenSymbol} approval failed.`, { action: "approve" }));
    } finally {
      setTxLoading(false);
    }
  };

  const executeRegister = async () => {
    if (!signer) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const refAddr = referrerInput || ethers.ZeroAddress;
      const tx = await stakingContract.register(refAddr);
      showToast("info", "Registration transaction submitted...");
      await tx.wait();
      showToast("success", "Successfully registered in the BTC3.O system!");
      loadUserData();
    } catch (err) {
      showToast("error", parseTxError(err, "Registration failed.", { action: "register" }));
    } finally {
      setTxLoading(false);
    }
  };

  const executeMint = async () => {
    if (!signer || !mintUsdtAmount) return;
    const mintValidationError = validateMintAmount(mintUsdtAmount, mintMethod);
    if (mintValidationError) {
      showToast("error", mintValidationError);
      return;
    }
    if (!userInfo.registered) {
      showToast("error", "Please register in the system before minting tokens.");
      return;
    }
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      let tx;
      if (mintMethod === "USDT") {
        tx = await stakingContract.mintTokens(ethers.parseEther(mintUsdtAmount));
      } else {
        tx = await stakingContract.mintTokensWithBNB({ value: ethers.parseEther(mintUsdtAmount) });
      }
      showToast("info", "Mint transaction submitted...");
      await tx.wait();
      showToast("success", `Successfully minted ${estimatedBtcToMint} ${tokenSymbol}!`);
      setMintUsdtAmount("");
      setCouponInput("");
      loadUserData();
      setTimeout(loadUserData, 2000);
    } catch (err) {
      showToast("error", parseTxError(err, "Minting failed. Please check amount ($10–$10,000) and try again.", { action: "mint" }));
    } finally {
      setTxLoading(false);
    }
  };

  const executeStake = async () => {
    if (!signer || !stakeBtcAmount) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.stake(ethers.parseEther(stakeBtcAmount));
      showToast("info", "Staking transaction submitted...");
      await tx.wait();
      showToast("success", `Successfully staked ${stakeBtcAmount} ${tokenSymbol}!`);
      setStakeBtcAmount("");
      loadUserData();
      setTimeout(loadUserData, 2000);
    } catch (err) {
      showToast("error", parseTxError(err, "Staking failed.", { action: "stake" }));
    } finally {
      setTxLoading(false);
    }
  };

  const executeApplyCoupon = async () => {
    if (!signer || !couponInput) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.applyCoupon(couponInput);
      showToast("info", "Applying coupon code...");
      await tx.wait();
      showToast("success", "Coupon applied successfully! $5 reward added.");
      setCouponInput("");
      loadUserData();
      setTimeout(loadUserData, 2000);
    } catch (err) {
      showToast("error", parseTxError(err, "Failed to apply coupon.", { action: "coupon" }));
    } finally {
      setTxLoading(false);
    }
  };

  const executeSellTokens = async (btcAmountStr, method) => {
    if (!signer || !btcAmountStr) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const parsedAmount = ethers.parseEther(btcAmountStr);
      let tx;
      if (method === "USDT") {
        tx = await stakingContract.sellTokens(parsedAmount);
        showToast("info", `Selling ${btcAmountStr} ${tokenSymbol} for USDT...`);
      } else {
        tx = await stakingContract.sellTokensForBNB(parsedAmount);
        showToast("info", `Selling ${btcAmountStr} ${tokenSymbol} for BNB...`);
      }
      await tx.wait();
      showToast("success", `Tokens sold successfully!`);
      loadUserData();
      setTimeout(loadUserData, 2000);
      return true;
    } catch (err) {
      showToast("error", parseTxError(err, "Failed to sell tokens.", { action: "sell" }));
      return false;
    } finally {
      setTxLoading(false);
    }
  };

  const executeClaim = async (index) => {
    if (!signer) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.claimStakingReward(index);
      showToast("info", "Claim reward transaction submitted...");
      await tx.wait();
      showToast("success", "Accrued rewards claimed successfully!");
      loadUserData();
      setTimeout(loadUserData, 2000);
    } catch (err) {
      showToast("error", parseTxError(err, "Failed to claim rewards.", { action: "claim" }));
    } finally {
      setTxLoading(false);
    }
  };

  const executeUnstake = async (index) => {
    if (!signer) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.unstake(index);
      showToast("info", "Unstake transaction submitted...");
      await tx.wait();
      showToast("success", "Successfully unstaked tokens!");
      loadUserData();
      setTimeout(loadUserData, 2000);
    } catch (err) {
      showToast("error", parseTxError(err, "Withdrawal failed.", { action: "unstake" }));
    } finally {
      setTxLoading(false);
    }
  };

  const executeClaimRankBonus = async (rankIndex) => {
    if (!signer) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.claimRankBonus(rankIndex);
      showToast("info", "Claiming rank bonus...");
      await tx.wait();
      showToast("success", "Rank bonus claimed successfully!");
      loadUserData();
    } catch (err) {
      showToast("error", parseTxError(err, "Rank bonus claim failed.", { action: "rank" }));
    } finally {
      setTxLoading(false);
    }
  };

  const executeClaimMonthlySalary = async () => {
    if (!signer) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.claimMonthlySalary();
      showToast("info", "Claiming monthly salary...");
      await tx.wait();
      showToast("success", "Monthly salary claimed successfully!");
      loadUserData();
    } catch (err) {
      showToast("error", parseTxError(err, "Monthly salary claim failed.", { action: "salary" }));
    } finally {
      setTxLoading(false);
    }
  };

  const executeSetSpinCost = async () => {
    if (!signer || !newSpinCostInput) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.setSpinCost(ethers.parseEther(newSpinCostInput));
      showToast("info", "Updating lucky wheel spin cost...");
      await tx.wait();
      showToast("success", "Spin cost updated successfully!");
      setNewSpinCostInput("");
      loadUserData();
    } catch (err) {
      showToast("error", parseTxError(err, "Failed to update spin cost."));
    } finally {
      setTxLoading(false);
    }
  };

  const executeSpinWheel = async () => {
    if (!signer || isSpinning) return;
    setIsSpinning(true);
    setWheelPrize(null);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.spinWheel();
      showToast("info", "Spin transaction submitted. Starting spin wheel animations...");

      const receipt = await tx.wait();
      let prizeIdx = 0;
      for (const log of receipt.logs) {
        try {
          const parsed = stakingContract.interface.parseLog(log);
          if (parsed && parsed.name === "WheelSpun") {
            prizeIdx = Number(parsed.args.index);
            break;
          }
        } catch (e) {}
      }

      const degreesPerSegment = 360 / prizes.length;
      const targetDeg = 360 - (prizeIdx * degreesPerSegment) - (degreesPerSegment / 2);
      const extraSpins = 5 * 360; 
      const totalRotation = extraSpins + targetDeg;

      setRotation(totalRotation);

      setTimeout(() => {
        setIsSpinning(false);
        setWheelPrize(prizes[prizeIdx].name);
        showToast("success", `Spin completed! Prize: ${prizes[prizeIdx].name}`);
        loadUserData();
      }, 5000);

    } catch (err) {
      setIsSpinning(false);
      showToast("error", parseTxError(err, "Lucky wheel spin failed.", { action: "wheel" }));
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const radius = width / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate((rotation * Math.PI) / 180);

    const angleStep = (2 * Math.PI) / prizes.length;
    prizes.forEach((p, idx) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius - 10, idx * angleStep, (idx + 1) * angleStep);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.stroke();

      ctx.save();
      ctx.rotate(idx * angleStep + angleStep / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#fff";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(p.name, radius - 30, 5);
      ctx.restore();
    });

    ctx.restore();
  }, [rotation, spinCost]);

  const handleMintInputChange = (val) => {
    setMintUsdtAmount(val);
    const parsed = parseFloat(val) || 0;
    if (parsed <= 0) {
      setEstimatedBtcToMint("0.0");
      return;
    }
    const usdVal = getMintUsdValue(parsed, mintMethod);
    const netVal = usdVal * 0.98;
    const price = parseFloat(currentPrice) || 0.5;
    let tokens = netVal / price;
    if (couponInput && couponInput.trim() !== "") {
      tokens = tokens * 2;
    }
    setEstimatedBtcToMint(tokens.toFixed(2));
  };

  useEffect(() => {
    handleMintInputChange(mintUsdtAmount);
  }, [couponInput, mintMethod, currentPrice]);

  const copyReferralLink = () => {
    const link = `${window.location.origin}${window.location.pathname}#/app?ref=${encryptAddress(account)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showToast("success", "Referral link copied successfully!");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const tabTitles = {
    dashboard: "Dashboard",
    mint: "Genesis Mint",
    stake: "Staking Portal",
    affiliate: "Affiliates / Referral Program",
    ranks: "Ranks & Levels",
    wheel: "Lucky Wheel"
  };



  const enterApp = () => {
    window.location.hash = "#/app";
    setRoute("app");
  };

  if (route === "landing") {
    return <Landing onEnterApp={enterApp} />;
  }

  return (
    <div className="dashboard-root-layout">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <AlertCircle size={20} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <aside className="left-sidebar">
        <div className="sidebar-logo">
          <Trophy className="gold-text logo-icon" size={28} />
          <div>
            <h1 className="logo-title-main">BTC 3.0 DEX</h1>
            <span className="logo-subtitle-main">Stake & Earn Platform</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button className={`menu-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button className={`menu-item ${activeTab === "mint" ? "active" : ""}`} onClick={() => setActiveTab("mint")}>
            <Flame size={20} />
            <span>Genesis Mint</span>
          </button>
          <button className={`menu-item ${activeTab === "stake" ? "active" : ""}`} onClick={() => setActiveTab("stake")}>
            <Layers size={20} />
            <span>Staking Portal</span>
          </button>
          <button className={`menu-item ${activeTab === "wheel" ? "active" : ""}`} onClick={() => setActiveTab("wheel")}>
            <Compass size={20} />
            <span>Lucky Wheel</span>
          </button>
          <button className={`menu-item ${activeTab === "ranks" ? "active" : ""}`} onClick={() => setActiveTab("ranks")}>
            <Trophy size={20} />
            <span>Ranks & Levels</span>
          </button>
          <button className={`menu-item ${activeTab === "affiliate" ? "active" : ""}`} onClick={() => setActiveTab("affiliate")}>
            <Users size={20} />
            <span>Profile</span>
          </button>
        </nav>

        {/* Sidebar widgets */}
        <div className="promo-card">
          <h4>Grow Your BTC3.O</h4>
          <p>Stake, earn and unlock exciting rewards.</p>
          <div className="promo-graphic">
            <div className="coin-stack">
              <div className="coin coin-1">3.O</div>
              <div className="coin coin-2">3.O</div>
              <div className="coin coin-3">3.O</div>
            </div>
          </div>
          <button className="promo-btn" onClick={() => setActiveTab("stake")}>
            Start Staking <ArrowRight size={14} />
          </button>
        </div>

        <div className="sidebar-help">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <HelpCircle size={16} />
            <span style={{ fontSize: '0.8rem' }}>Need Help?</span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Visit our Help Center or contact support.
          </p>
          <a href="#help" className="help-action-btn">
            Help Center <ArrowRight size={12} />
          </a>
        </div>

        <div className="sidebar-footer">
          <div className="flex justify-between items-center w-full px-2">
            <div className="flex items-center gap-2">
              <Moon size={16} />
              <span style={{ fontSize: '0.85rem' }}>Dark Mode</span>
            </div>
            <label className="switch-toggle">
              <input type="checkbox" defaultChecked />
              <span className="switch-slider"></span>
            </label>
          </div>
        </div>
      </aside>

      {/* Right Main Content */}
      <div className="main-content-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.png" alt="BTC3.O Logo" style={{ width: "38px", height: "38px", objectFit: "contain", borderRadius: "50%" }} />
            <h2 className="top-header-title">{tabTitles[activeTab]}</h2>
          </div>
          <div className="header-actions">
            <div className="desktop-wallet-btn">
              <ConnectButton />
            </div>
            <div className="mobile-wallet-btn">
              {isConnected ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <button 
                    onClick={() => {
                      if (window.confirm("Are you sure you want to disconnect your wallet?")) {
                        disconnect();
                      }
                    }}
                    style={{ 
                      background: "rgba(239, 68, 68, 0.15)", 
                      border: "1px solid rgba(239, 68, 68, 0.4)", 
                      color: "#ef4444", 
                      padding: "8px", 
                      borderRadius: "50%", 
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    title="Disconnect Wallet"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <ConnectButton label="Connect" />
              )}
            </div>
          </div>
        </header>

        {/* Tab Contents */}
        <div className="tab-pane-container">
          <InstallApp variant="banner" />
          {isMobileDevice() && !isConnected && (
            <div className="mobile-hint-banner">
              {needsHttpsForWallets()
                ? "Wallet connect requires HTTPS on mobile. Deploy with SSL or use your wallet app's built-in browser to open this site."
                : isInAppBrowser()
                  ? "Tip: For best results, open this link in Chrome/Safari or your wallet app browser (MetaMask / Trust Wallet), then tap Connect."
                  : hasInjectedProvider()
                    ? "Tap Connect and approve the wallet request in your browser extension or wallet app."
                    : "Tap Connect and choose WalletConnect or your mobile wallet. If it fails, open this site inside MetaMask or Trust Wallet browser."}
            </div>
          )}
          {/* Wrong Network warning Banner */}
          {isConnected && isWrongNetwork && (
            <div className="wrong-network-banner">
              <AlertCircle size={20} />
              <span>
                Please switch your wallet to {networkLabel}. Only BNB (BEP20) is supported — not Ethereum.
              </span>
              <button onClick={switchNetwork} className="switch-network-btn">
                Switch Network
              </button>
            </div>
          )}

          {isConnected && !isWrongNetwork && contractMismatch && (
            <div className="wrong-network-banner" style={{ borderColor: "rgba(251, 191, 36, 0.5)", background: "rgba(251, 191, 36, 0.1)" }}>
              <AlertCircle size={20} style={{ color: "#fbbf24" }} />
              <span>
                Outdated contract on BSC Testnet. Redeploy with: <code>npx hardhat run scripts/deploy.js --network bscTestnet</code>
              </span>
            </div>
          )}

          {/* Unregistered Register Block */}
          {isConnected && !isWrongNetwork && !contractMismatch && !userInfo.registered && (
            <div className="register-container">
              <div className="register-card">
                <Shield size={48} className="register-icon" />
                <h3 className="register-title">Register in System</h3>
                <p className="register-desc">
                  You need to register with a referrer address to join the BTC3.O Staking & Earn system.
                </p>
                <div className="register-input-group">
                  <input 
                    type="text" 
                    placeholder="Referrer Address (Optional)" 
                    className="register-input"
                    value={referrerInput}
                    onChange={(e) => setReferrerInput(e.target.value)}
                  />
                </div>
                <button className="register-btn" onClick={executeRegister} disabled={txLoading}>
                  {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
                  Register Now
                </button>
              </div>
            </div>
          )}

          {/* Connected & Registered Pane Views */}
          {isConnected && !isWrongNetwork && !contractMismatch && userInfo.registered && (
            <>
              {activeTab === "dashboard" && (
                <Dashboard
                  tokenSymbol={tokenSymbol}
                  currentPrice={currentPrice}
                  totalUSDValueMinted={totalUSDValueMinted}
                  totalMintedTokens={totalMintedTokens}
                  tokenTotalSupply={tokenTotalSupply}
                  stakingTokenReserve={stakingTokenReserve}
                  totalRewardsPaidUSD={totalRewardsPaidUSD}
                  mintChartData={mintChartData}
                  mintVolumeGrowth={mintVolumeGrowth}
                  btcBalance={btcBalance}
                  setActiveTab={setActiveTab}
                  registeredUsersCount={registeredUsersCount}
                  setRanksSubTab={setRanksSubTab}
                  setProfileSubTab={setProfileSubTab}
                />
              )}

              {activeTab === "mint" && (
                <GenesisMint
                  tokenSymbol={tokenSymbol}
                  totalUSDValueMinted={totalUSDValueMinted}
                  totalMintedTokens={totalMintedTokens}
                  stakingTokenReserve={stakingTokenReserve}
                  bondingCurveInfo={bondingCurveInfo}
                  btcBalance={btcBalance}
                  usdtBalance={usdtBalance}
                  bnbBalance={bnbBalance}
                  mintUsdtAmount={mintUsdtAmount}
                  handleMintInputChange={handleMintInputChange}
                  estimatedBtcToMint={estimatedBtcToMint}
                  mintMethod={mintMethod}
                  setMintMethod={setMintMethod}
                  usdtApproved={usdtApproved}
                  approveUsdt={approveUsdt}
                  executeMint={executeMint}
                  txLoading={txLoading}
                  currentPrice={currentPrice}
                  registeredUsersCount={registeredUsersCount}
                  couponInput={couponInput}
                  setCouponInput={setCouponInput}
                  executeApplyCoupon={executeApplyCoupon}
                />
              )}

              {activeTab === "stake" && (
                <StakingPortal
                  tokenSymbol={tokenSymbol}
                  userInfo={userInfo}
                  userStakesList={userStakesList}
                  btcBalance={btcBalance}
                  stakeBtcAmount={stakeBtcAmount}
                  setStakeBtcAmount={setStakeBtcAmount}
                  currentPrice={currentPrice}
                  btcApproved={btcApproved}
                  approveBtc={approveBtc}
                  executeStake={executeStake}
                  executeClaim={executeClaim}
                  executeUnstake={executeUnstake}
                  calcAmount={calcAmount}
                  setCalcAmount={setCalcAmount}
                  calcYears={calcYears}
                  setCalcYears={setCalcYears}
                  calcYield={calcYield}
                  setCalcYield={setCalcYield}
                  compoundingResults={compoundingResults}
                  couponInput={couponInput}
                  setCouponInput={setCouponInput}
                  executeApplyCoupon={executeApplyCoupon}
                  txLoading={txLoading}
                  isCalcOpen={isCalcOpen}
                  setIsCalcOpen={setIsCalcOpen}
                />
              )}

              {activeTab === "affiliate" && (
                <Affiliates
                  tokenSymbol={tokenSymbol}
                  account={account}
                  bnbBalance={bnbBalance}
                  usdtBalance={usdtBalance}
                  btcBalance={btcBalance}
                  transactionHistory={transactionHistory}
                  subTab={profileSubTab}
                  setSubTab={setProfileSubTab}
                  executeSellTokens={executeSellTokens}
                  currentPrice={currentPrice}
                  txLoading={txLoading}
                  userStakesList={userStakesList}
                />
              )}

              {activeTab === "ranks" && (
                <RanksAndLevels
                  tokenSymbol={tokenSymbol}
                  userInfo={userInfo}
                  rankNames={rankNames}
                  rankBonusStatus={rankBonusStatus}
                  qualifiedSalaryRank={qualifiedSalaryRank}
                  executeClaimRankBonus={executeClaimRankBonus}
                  executeClaimMonthlySalary={executeClaimMonthlySalary}
                  levelCommissions={LEVEL_COMMISSIONS}
                  txLoading={txLoading}
                  encryptAddress={encryptAddress}
                  account={account}
                  copyReferralLink={copyReferralLink}
                  copiedLink={copiedLink}
                  subTab={ranksSubTab}
                  setSubTab={setRanksSubTab}
                />
              )}

              {activeTab === "wheel" && (
                <LuckyWheel
                  tokenSymbol={tokenSymbol}
                  spinCost={spinCost}
                  canvasRef={canvasRef}
                  executeSpinWheel={executeSpinWheel}
                  isSpinning={isSpinning}
                  txLoading={txLoading}
                  btcBalance={btcBalance}
                  wheelPrize={wheelPrize}
                  prizes={prizes}
                  isAdmin={isAdmin}
                  newSpinCostInput={newSpinCostInput}
                  setNewSpinCostInput={setNewSpinCostInput}
                  executeSetSpinCost={executeSetSpinCost}
                />
              )}
            </>
          )}

          {/* Wallet Not Connected State */}
          {!isConnected && (
            <div className="connect-wallet-prompt">
              <Shield size={48} className="connect-prompt-icon" />
              <h3>Connect Your Wallet</h3>
              <p>Please connect your Web3 wallet to access the BTC3.O Stake & Earn platform.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mobile-bottom-bar">
        <button className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <LayoutDashboard size={20} />
          <span>Home</span>
        </button>
        <button className={`mobile-nav-item ${activeTab === 'mint' ? 'active' : ''}`} onClick={() => setActiveTab('mint')}>
          <Flame size={20} />
          <span>Mint</span>
        </button>
        <button className={`mobile-nav-item ${activeTab === 'stake' ? 'active' : ''}`} onClick={() => setActiveTab('stake')}>
          <Layers size={20} />
          <span>Stake</span>
        </button>
        <button className={`mobile-nav-item ${activeTab === 'wheel' ? 'active' : ''}`} onClick={() => setActiveTab('wheel')}>
          <Compass size={20} />
          <span>Wheel</span>
        </button>
        <button className={`mobile-nav-item ${activeTab === 'ranks' ? 'active' : ''}`} onClick={() => setActiveTab('ranks')}>
          <Trophy size={20} />
          <span>Ranks</span>
        </button>
        <button className={`mobile-nav-item ${activeTab === 'affiliate' ? 'active' : ''}`} onClick={() => setActiveTab('affiliate')}>
          <Users size={20} />
          <span>Profile</span>
        </button>
      </div>

      {/* Floating Compounding Calculator Icon Button (Universal) */}
      {isConnected && userInfo.registered && (
        <button 
          className="sp-floating-calc-btn"
          onClick={() => setIsCalcOpen(true)}
          style={{
            position: "fixed",
            bottom: "85px",
            right: "24px",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "var(--gold)",
            color: "#000",
            border: "none",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999
          }}
        >
          <span style={{ fontSize: "1.4rem", fontWeight: "bold" }}>%</span>
        </button>
      )}

      {/* Compounding Calculator Popup Modal Overlay */}
      {isCalcOpen && (
        <div 
          className="sp-modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: "1rem"
          }}
        >
          <div 
            className="sp-card-box sp-modal-card"
            style={{
              width: "100%",
              maxWidth: "460px",
              background: "linear-gradient(145deg, rgba(10, 17, 32, 0.98), rgba(5, 10, 20, 0.98))",
              border: "1px solid var(--border-color)",
              borderRadius: "18px",
              padding: "1.5rem",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.4)",
              position: "relative"
            }}
          >
            <h3 className="sp-card-title" style={{ marginBottom: "10px" }}>Compounding Staking Calculator</h3>
            <p className="sp-card-desc" style={{ marginBottom: "20px", fontSize: "0.85rem", opacity: 0.85 }}>
              Simulate your earnings using daily compounding from 1 to 5 years.
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="sp-calc-label" style={{ fontSize: "0.8rem", opacity: 0.9 }}>Calculator Amount (USD)</label>
                <input 
                  type="number" 
                  placeholder="USD Amount" 
                  className="sp-field-input mt-1" 
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label className="sp-calc-label" style={{ fontSize: "0.8rem", opacity: 0.9 }}>Compounding Years</label>
                <select 
                  className="sp-staking-mode-select mt-1" 
                  value={calcYears}
                  onChange={(e) => setCalcYears(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: "var(--bg-soft)", border: "1px solid var(--border-color)", color: "#fff" }}
                >
                  <option value={1}>1 Year</option>
                  <option value={2}>2 Years</option>
                  <option value={3}>3 Years</option>
                  <option value={4}>4 Years</option>
                  <option value={5}>5 Years</option>
                </select>
              </div>
              <div>
                <label className="sp-calc-label" style={{ fontSize: "0.8rem", opacity: 0.9 }}>Staking Yield Mode</label>
                <select 
                  className="sp-staking-mode-select mt-1" 
                  value={calcYield}
                  onChange={(e) => setCalcYield(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: "var(--bg-soft)", border: "1px solid var(--border-color)", color: "#fff" }}
                >
                  <option value={0.005}>0.5% Daily ($10–$499)</option>
                  <option value={0.006}>0.6% Daily ($500–$2,000)</option>
                  <option value={0.0075}>0.75% Daily ($2,001–$5,000)</option>
                  <option value={0.01}>1.0% Daily ($5,001–$10,000)</option>
                </select>
              </div>
              
              <div className="sp-details-panel" style={{ marginTop: "10px", padding: "12px", borderRadius: "8px", backgroundColor: "var(--bg-soft)" }}>
                <div className="sp-detail-row" style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span>Future Value (USD)</span>
                  <span className="sp-gold-text font-bold" style={{ color: "var(--gold)", fontWeight: "bold" }}>${compoundingResults.future}</span>
                </div>
                <div className="sp-detail-row" style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Estimated Yield Earned</span>
                  <span>${compoundingResults.yield}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button 
                className="sp-small-danger-btn" 
                onClick={() => setIsCalcOpen(false)}
                style={{ flex: 1, padding: "10px", borderRadius: "8px", cursor: "pointer", border: "1px solid rgba(239, 68, 68, 0.4)", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#fff" }}
              >
                Close Calculator
              </button>
            </div>
          </div>
        </div>
      )}
      <Chatbot />
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { 
  Shield, Layers, Coins, Plus, ArrowUpRight, Flame, Trophy, Users, 
  ExternalLink, Loader2, Copy, Check, ChevronRight, Info, AlertCircle, 
  Compass, LayoutDashboard, HelpCircle, Moon, Sun, Bell, ArrowRight, BookOpen, Crown, Clock
} from "lucide-react";
import { ERC20_ABI, BTC_STAKING_SYSTEM_ABI } from "./abis";
import addresses from "./addresses.json";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient, useSwitchChain } from "wagmi";
import "./App.css?v=3";
import Dashboard from "./components/Dashboard";
import GenesisMint from "./components/GenesisMint";
import StakingPortal from "./components/StakingPortal";
import Affiliates from "./components/Affiliates";
import RanksAndLevels from "./components/RanksAndLevels";
import LuckyWheel from "./components/LuckyWheel";

const tokenSymbol = "BTC3.O";
const tokenName = "BTC3.O";

const rankNames = [
  "Starter", "Executive", "Engr", "Manager", "SR Manager", "AGM", "DGM", 
  "Add GM", "GM", "SR GM", "VP", "Sr VP", "President", "Director"
];
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

  // Connection State
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState("");
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard", "mint", "stake", "affiliate", "ranks", "wheel"
  
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

  // Mint Input
  const [mintUsdtAmount, setMintUsdtAmount] = useState("");
  const [estimatedBtcToMint, setEstimatedBtcToMint] = useState("0.0");

  // Staking Input
  const [stakeBtcAmount, setStakeBtcAmount] = useState("");
  const [lockupMonths, setLockupMonths] = useState(0); // 0, 3, 6, 12 months
  const [couponInput, setCouponInput] = useState("");

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
    totalSelfStakeUSD: "0.0",
    totalTeamBusinessUSD: "0.0",
    dailyRankReward: "0.0",
    lastRankClaimTime: 0,
    currentRank: 0,
    registered: false
  });
  const [referrerInput, setReferrerInput] = useState("");
  const [userStakesList, setUserStakesList] = useState([]);
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
  const [levelPercents, setLevelPercents] = useState([8, 4, 2, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25]);

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

  // Read referrer code from URL query
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
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
        totalSelfStakeUSD: "0.0",
        totalTeamBusinessUSD: "0.0",
        dailyRankReward: "0.0",
        lastRankClaimTime: 0,
        currentRank: 0,
        registered: false
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

      try {
        const currentBlock = await provider.getBlockNumber();
        const startBlock = currentBlock > 5000 ? currentBlock - 5000 : 0;
        const filter = stakingContract.filters.Registered();
        const events = await stakingContract.queryFilter(filter, startBlock, "latest");
        const baseCount = 1250 + Math.floor(parseFloat(ethers.formatEther(mintedTok)) / 100);
        setRegisteredUsersCount(baseCount + (events ? events.length : 0));
      } catch (e) {
        const baseCount = 1250 + Math.floor(parseFloat(ethers.formatEther(mintedTok)) / 100);
        setRegisteredUsersCount(baseCount);
      }

      // 5. User Registration & Stats
      const u = await stakingContract.users(account);
      setUserInfo({
        referrer: u[0],
        directActiveCount: Number(u[1]),
        totalSelfStakeUSD: ethers.formatEther(u[2]),
        totalTeamBusinessUSD: ethers.formatEther(u[3]),
        dailyRankReward: ethers.formatEther(u[4]),
        lastRankClaimTime: Number(u[5]),
        currentRank: Number(u[6]),
        registered: u[7]
      });

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

          stakes.push({
            index,
            amountTokens: ethers.formatEther(st[0]),
            amountUSD: stAmountUSD,
            startTime: new Date(Number(st[2]) * 1000),
            lastClaimTime: new Date(Number(st[3]) * 1000),
            rewardClaimedUSD: ethers.formatEther(st[4]),
            lockupMonths: Number(st[5]),
            ratePerDay: Number(st[6]),
            active: st[7],
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
      showToast("error", parseTxError(err, "USDT approval failed."));
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
      showToast("error", parseTxError(err, `${tokenSymbol} approval failed.`));
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
      showToast("error", parseTxError(err, "Registration failed."));
    } finally {
      setTxLoading(false);
    }
  };

  const executeMint = async () => {
    if (!signer || !mintUsdtAmount) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      let tx;
      if (mintMethod === "USDT") {
        tx = await stakingContract.mintTokens(ethers.parseEther(mintUsdtAmount));
      } else {
        const bnbVal = parseFloat(mintUsdtAmount) / 600;
        tx = await stakingContract.mintTokensWithBNB({ value: ethers.parseEther(bnbVal.toString()) });
      }
      showToast("info", "Mint transaction submitted...");
      await tx.wait();
      showToast("success", `Successfully minted ${estimatedBtcToMint} ${tokenSymbol}!`);
      setMintUsdtAmount("");
      loadUserData();
      setTimeout(loadUserData, 2000);
    } catch (err) {
      showToast("error", parseTxError(err, "Minting execution failed."));
    } finally {
      setTxLoading(false);
    }
  };

  const executeStake = async () => {
    if (!signer || !stakeBtcAmount) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.stake(ethers.parseEther(stakeBtcAmount), lockupMonths);
      showToast("info", "Staking transaction submitted...");
      await tx.wait();
      showToast("success", `Successfully staked ${stakeBtcAmount} ${tokenSymbol}!`);
      setStakeBtcAmount("");
      loadUserData();
      setTimeout(loadUserData, 2000);
    } catch (err) {
      showToast("error", parseTxError(err, "Staking execution failed."));
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
      showToast("error", parseTxError(err, "Failed to apply coupon."));
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
      showToast("error", parseTxError(err, "Failed to claim rewards."));
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
      showToast("error", parseTxError(err, "Unstaking failed."));
    } finally {
      setTxLoading(false);
    }
  };

  const executeClaimRankReward = async () => {
    if (!signer) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.claimRankReward();
      showToast("info", "Claiming daily rank reward...");
      await tx.wait();
      showToast("success", "Daily rank reward claimed successfully!");
      loadUserData();
    } catch (err) {
      showToast("error", parseTxError(err, "Rank reward claim failed."));
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
      showToast("error", parseTxError(err, "Lucky Wheel spin execution failed."));
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
    const netVal = parsed * 0.98;
    const price = parseFloat(currentPrice) || 0.5;
    setEstimatedBtcToMint((netVal / price).toFixed(2));
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${encryptAddress(account)}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    showToast("success", "Referral link copied successfully!");
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const parseTxError = (err, defaultMsg) => {
    if (!err) return defaultMsg;
    if (err.reason) return err.reason;
    if (err.data && err.data.message) return err.data.message;
    if (err.message) {
      if (err.message.includes("user rejected action")) return "Transaction rejected by user.";
      if (err.message.includes("insufficient funds")) return "Insufficient native chain tokens for gas fees.";
      return err.message;
    }
    return defaultMsg;
  };

  const tabTitles = {
    dashboard: "Dashboard",
    mint: "Genesis Mint",
    stake: "Staking Portal",
    affiliate: "Affiliates / Referral Program",
    ranks: "Ranks & Levels",
    wheel: "Lucky Wheel"
  };



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
          <button className={`menu-item ${activeTab === "affiliate" ? "active" : ""}`} onClick={() => setActiveTab("affiliate")}>
            <Users size={20} />
            <span>Affiliates</span>
          </button>
          <button className={`menu-item ${activeTab === "ranks" ? "active" : ""}`} onClick={() => setActiveTab("ranks")}>
            <Trophy size={20} />
            <span>Ranks & Levels</span>
          </button>
          <button className={`menu-item ${activeTab === "wheel" ? "active" : ""}`} onClick={() => setActiveTab("wheel")}>
            <Compass size={20} />
            <span>Lucky Wheel</span>
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
          <div>
            <h2 className="top-header-title">{tabTitles[activeTab]}</h2>
          </div>
          <div className="header-actions">
            <ConnectButton />
            <button className="bell-btn">
              <Bell size={20} />
              <span className="bell-dot"></span>
            </button>
          </div>
        </header>

        {/* Tab Contents */}
        <div className="tab-pane-container">
          {/* Wrong Network warning Banner */}
          {isConnected && isWrongNetwork && (
            <div className="wrong-network-banner">
              <AlertCircle size={20} />
              <span>
                Please switch network to BNB Smart Chain (BSC Testnet).
              </span>
              <button onClick={switchNetwork} className="switch-network-btn">
                Switch Network
              </button>
            </div>
          )}

          {/* Unregistered Register Block */}
          {isConnected && !userInfo.registered && (
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
          {isConnected && userInfo.registered && (
            <>
              {activeTab === "dashboard" && (
                <Dashboard
                  tokenSymbol={tokenSymbol}
                  currentPrice={currentPrice}
                  totalUSDValueMinted={totalUSDValueMinted}
                  totalMintedTokens={totalMintedTokens}
                  btcBalance={btcBalance}
                  setActiveTab={setActiveTab}
                  registeredUsersCount={registeredUsersCount}
                />
              )}

              {activeTab === "mint" && (
                <GenesisMint
                  tokenSymbol={tokenSymbol}
                  totalUSDValueMinted={totalUSDValueMinted}
                  totalMintedTokens={totalMintedTokens}
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
                  lockupMonths={lockupMonths}
                  setLockupMonths={setLockupMonths}
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
                />
              )}

              {activeTab === "affiliate" && (
                <Affiliates
                  tokenSymbol={tokenSymbol}
                  userInfo={userInfo}
                  account={account}
                  encryptAddress={encryptAddress}
                  copyReferralLink={copyReferralLink}
                  copiedLink={copiedLink}
                />
              )}

              {activeTab === "ranks" && (
                <RanksAndLevels
                  tokenSymbol={tokenSymbol}
                  userInfo={userInfo}
                  rankNames={rankNames}
                  executeClaimRankReward={executeClaimRankReward}
                  txLoading={txLoading}
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
      
      {/* Mobile Sticky bottom menu for better responsive UX */}
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
        <button className={`mobile-nav-item ${activeTab === 'ranks' ? 'active' : ''}`} onClick={() => setActiveTab('ranks')}>
          <Trophy size={20} />
          <span>Ranks</span>
        </button>
        <button className={`mobile-nav-item ${activeTab === 'affiliate' ? 'active' : ''}`} onClick={() => setActiveTab('affiliate')}>
          <Users size={20} />
          <span>Profile</span>
        </button>
        <button className={`mobile-nav-item ${activeTab === 'wheel' ? 'active' : ''}`} onClick={() => setActiveTab('wheel')}>
          <Compass size={20} />
          <span>Wheel</span>
        </button>
      </div>
    </div>
  );
}

export default App;

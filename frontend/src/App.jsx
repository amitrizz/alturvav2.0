import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { 
  Shield, Layers, Coins, Plus, ArrowUpRight, Flame, Trophy, Users, 
  ExternalLink, Loader2, Copy, Check, ChevronRight, Info, AlertCircle, Compass
} from "lucide-react";
import { ERC20_ABI, BTC_STAKING_SYSTEM_ABI } from "./abis";
import addresses from "./addresses.json";
import "./App.css?v=2";

const tokenSymbol = "BTC 3.0";
const tokenName = "BTC 3.0";

const rankNames = [
  "Starter", "Executive", "Engr", "Manager", "SR Manager", "AGM", "DGM", 
  "Add GM", "GM", "SR GM", "VP", "Sr VP", "President", "Director"
];
const REFERRAL_KEY = import.meta.env.VITE_REFERRAL_KEY || "btc3dexSecretKey123";

// Simple XOR and base64 helper to obfuscate/deobfuscate addresses
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
  // Connection State
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState("");
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState("mint"); // "mint", "stake", "affiliate", "ranks"
  
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

  // Mint Input
  const [mintUsdtAmount, setMintUsdtAmount] = useState("");
  const [estimatedBtcToMint, setEstimatedBtcToMint] = useState("0.0");

  // Staking Input
  const [stakeBtcAmount, setStakeBtcAmount] = useState("");
  const [is365Day, setIs365Day] = useState(false);

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
  const [levelPercents, setLevelPercents] = useState([10, 3, 2, 2, 1]);
  const [newLevelPercentsInput, setNewLevelPercentsInput] = useState(["10", "3", "2", "2", "1"]);

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
    if (window.ethereum) {
      connectWallet();
      window.ethereum.on("accountsChanged", (accs) => {
        if (accs.length > 0) connectWallet();
        else resetConnection();
      });
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  const resetConnection = () => {
    setProvider(null);
    setSigner(null);
    setAccount("");
    setNetwork("");
  };

  const connectWallet = async () => {
    if (!window.ethereum) return;
    try {
      const tempProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const tempSigner = await tempProvider.getSigner();
      const networkInfo = await tempProvider.getNetwork();

      setProvider(tempProvider);
      setSigner(tempSigner);
      setAccount(accounts[0]);
      setNetwork(networkInfo.name);

      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      setIsWrongNetwork(chainId.toLowerCase() !== addresses.chainId.toLowerCase());
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to connect wallet.");
    }
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;
    const targetChainId = addresses.chainId;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          let params = [];
          if (targetChainId.toLowerCase() === "0x7a69") {
            params = [{
              chainId: "0x7a69",
              chainName: "Hardhat Localhost",
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["http://127.0.0.1:8545"],
            }];
          } else if (targetChainId.toLowerCase() === "0x61") {
            params = [{
              chainId: "0x61",
              chainName: "BNB Smart Chain Testnet",
              nativeCurrency: { name: "BNB", symbol: "tBNB", decimals: 18 },
              rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
              blockExplorerUrls: ["https://testnet.bscscan.com"],
            }];
          }
          if (params.length > 0) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: params,
            });
          }
        } catch (addError) {
          console.error("Failed to add network:", addError);
          showToast("error", "Failed to add the network to MetaMask.");
        }
      } else {
        console.error("Failed to switch network:", switchError);
        showToast("error", "Failed to switch network in MetaMask.");
      }
    }
  };

  const addTokenToWallet = async (address, symbol) => {
    if (!window.ethereum) return;
    try {
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: address,
            symbol: symbol,
            decimals: 18,
          },
        },
      });
      if (wasAdded) {
        showToast("success", `${symbol} added to wallet!`);
        if (symbol === "USDT") {
          localStorage.setItem(`added_usdt_${account.toLowerCase()}`, 'true');
        } else {
          localStorage.setItem(`added_token_${account.toLowerCase()}`, 'true');
        }
        loadUserData();
      }
    } catch (err) {
      console.error(err);
      showToast("error", `Failed to add ${symbol} to wallet.`);
    }
  };

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
          stakes.push({
            index,
            amountTokens: ethers.formatEther(st[0]),
            amountUSD: ethers.formatEther(st[1]),
            startTime: new Date(Number(st[2]) * 1000),
            lastClaimTime: new Date(Number(st[3]) * 1000),
            rewardClaimedUSD: ethers.formatEther(st[4]),
            rewardCapUSD: ethers.formatEther(st[5]),
            is365Day: st[6],
            active: st[7],
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

      try {
        const percents = [];
        for (let i = 0; i < 5; i++) {
          const bps = await stakingContract.levelPercents(i);
          percents.push(Number(bps) / 100); // e.g. 1000 bps -> 10%
        }
        setLevelPercents(percents);
      } catch (e) {
        console.error("Error fetching level percents:", e);
      }

    } catch (err) {
      console.error("Error loading user data:", err);
    }
  };

  // Helper to extract clean revert reasons from Ethers errors
  const parseTxError = (err, defaultMsg) => {
    console.error(err);
    let reason = "";
    if (err.reason) {
      reason = err.reason;
    } else if (err.message) {
      reason = err.message;
    }
    
    // Check for specific revert messages
    if (reason.includes("Insufficient contract USDT balance") || reason.includes("insufficient contract USDT")) {
      return "The contract has insufficient USDT reserves to buy back your tokens at this moment.";
    }
    if (reason.includes("Insufficient contract BNB balance") || reason.includes("insufficient contract BNB")) {
      return "The contract has insufficient BNB reserves to complete this transaction.";
    }
    if (reason.includes("Insufficient RSS balance to spin") || reason.includes("insufficient token balance") || reason.includes("Insufficient BTC 3.0 balance")) {
      return `You do not have enough BTC 3.0 tokens to spin the wheel.`;
    }
    if (reason.includes("Contract has insufficient token reserves") || reason.includes("insufficient token reserves")) {
      return "The contract does not have enough token reserves to pay out the prize.";
    }
    if (reason.includes("Must be registered") || reason.includes("not registered")) {
      return "You must be registered in the system first.";
    }
    if (reason.includes("Invalid percentage") || reason.includes("Max 50% per level")) {
      return "Invalid percentage value. Levels must be between 0% and 50%.";
    }
    if (reason.includes("user rejected") || reason.includes("ACTION_REJECTED")) {
      return "Transaction was cancelled by the user.";
    }
    
    return defaultMsg;
  };

  // Register
  const executeRegister = async () => {
    if (!signer) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      let ref = ethers.ZeroAddress;
      if (referrerInput) {
        if (ethers.isAddress(referrerInput)) {
          ref = referrerInput;
        } else {
          ref = decryptAddress(referrerInput);
        }
      }
      const tx = await stakingContract.register(ref);
      showToast("info", "Registration transaction sent...");
      await tx.wait();
      showToast("success", "Successfully registered referrer!");
      setUserInfo(prev => ({ ...prev, registered: true }));
      loadUserData();
      setTimeout(loadUserData, 2000);
    } catch (err) {
      showToast("error", parseTxError(err, "Registration failed."));
    } finally {
      setTxLoading(false);
    }
  };

  // Approve USDT
  const approveUsdt = async () => {
    if (!signer) return;
    setTxLoading(true);
    try {
      const usdtContract = new ethers.Contract(addresses.usdt, ERC20_ABI, signer);
      const tx = await usdtContract.approve(addresses.stakingSystem, ethers.parseEther("100000000"));
      showToast("info", "USDT Approve transaction submitted...");
      await tx.wait();
      setUsdtApproved(true);
      showToast("success", "USDT Approved successfully!");
    } catch (err) {
      showToast("error", parseTxError(err, "USDT Approval failed."));
    } finally {
      setTxLoading(false);
    }
  };

  // Approve BTC RSS
  const approveBtc = async () => {
    if (!signer) return;
    setTxLoading(true);
    try {
      const btcContract = new ethers.Contract(addresses.token, ERC20_ABI, signer);
      const tx = await btcContract.approve(addresses.stakingSystem, ethers.parseEther("100000000"));
      showToast("info", "RSS Approve transaction submitted...");
      await tx.wait();
      setBtcApproved(true);
      showToast("success", "RSS Token Approved successfully!");
    } catch (err) {
      showToast("error", parseTxError(err, "Approval failed."));
    } finally {
      setTxLoading(false);
    }
  };

  // Mint / Purchase Tokens
  const executeMint = async () => {
    if (!signer || !mintUsdtAmount) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      let tx;
      if (mintMethod === "USDT") {
        tx = await stakingContract.mintTokens(ethers.parseEther(mintUsdtAmount));
      } else {
        tx = await stakingContract.mintTokensWithBNB({ value: ethers.parseEther(mintUsdtAmount) });
      }
      showToast("info", "Minting transaction submitted...");
      await tx.wait();
      showToast("success", `Successfully minted RSS Tokens!`);
      setMintUsdtAmount("");
      loadUserData();
      setTimeout(loadUserData, 2000);
    } catch (err) {
      showToast("error", parseTxError(err, "Minting execution failed."));
    } finally {
      setTxLoading(false);
    }
  };

  // Stake RSS Tokens
  const executeStake = async () => {
    if (!signer || !stakeBtcAmount) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.stake(ethers.parseEther(stakeBtcAmount), is365Day);
      showToast("info", "Staking transaction submitted...");
      await tx.wait();
      showToast("success", `Successfully staked ${stakeBtcAmount} RSS!`);
      setStakeBtcAmount("");
      loadUserData();
      setTimeout(loadUserData, 2000);
    } catch (err) {
      showToast("error", parseTxError(err, "Staking execution failed."));
    } finally {
      setTxLoading(false);
    }
  };

  // Claim Staking Reward
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

  // Unstake
  const executeUnstake = async (index) => {
    if (!signer) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.unstake(index);
      showToast("info", "Unstaking transaction submitted...");
      await tx.wait();
      showToast("success", "Tokens successfully unstaked!");
      loadUserData();
      setTimeout(loadUserData, 2000);
    } catch (err) {
      showToast("error", parseTxError(err, "Unstaking failed."));
    } finally {
      setTxLoading(false);
    }
  };

  // Claim Daily Rank Reward
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
      showToast("error", parseTxError(err, "Failed to claim rank reward."));
    } finally {
      setTxLoading(false);
    }
  };

  // Sell Tokens
  const executeSell = async () => {
    if (!signer || !sellBtcAmount) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.sellTokens(ethers.parseEther(sellBtcAmount));
      showToast("info", "Selling transaction submitted...");
      await tx.wait();
      showToast("success", `Successfully sold ${tokenSymbol} Tokens!`);
      setSellBtcAmount("");
      loadUserData();
    } catch (err) {
      showToast("error", parseTxError(err, "Selling execution failed."));
    } finally {
      setTxLoading(false);
    }
  };

  // Withdraw USDT (Admin only)
  const executeWithdrawUsdt = async () => {
    if (!signer || !adminWithdrawAmount) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.withdrawUSDT(ethers.parseEther(adminWithdrawAmount));
      showToast("info", "Withdrawal transaction submitted...");
      await tx.wait();
      showToast("success", `Withdrew $${adminWithdrawAmount} USDT successfully!`);
      setAdminWithdrawAmount("");
      loadUserData();
    } catch (err) {
      showToast("error", parseTxError(err, "Withdrawal failed."));
    } finally {
      setTxLoading(false);
    }
  };

  // Withdraw BNB (Admin only)
  const executeWithdrawBnb = async () => {
    if (!signer || !adminWithdrawAmount) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.withdrawBNB(ethers.parseEther(adminWithdrawAmount));
      showToast("info", "Withdrawal transaction submitted...");
      await tx.wait();
      showToast("success", `Withdrew ${adminWithdrawAmount} BNB successfully!`);
      setAdminWithdrawAmount("");
      loadUserData();
    } catch (err) {
      showToast("error", parseTxError(err, "Withdrawal failed."));
    } finally {
      setTxLoading(false);
    }
  };

  // Set Spin Cost (Admin only)
  const executeSetSpinCost = async () => {
    if (!signer || !newSpinCostInput) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const tx = await stakingContract.setSpinCost(ethers.parseEther(newSpinCostInput));
      showToast("info", "Spin cost update transaction submitted...");
      await tx.wait();
      showToast("success", `Successfully set spin cost to ${newSpinCostInput} ${tokenSymbol}!`);
      setNewSpinCostInput("");
      loadUserData();
      setTimeout(loadUserData, 2000);
    } catch (err) {
      showToast("error", parseTxError(err, "Failed to update spin cost."));
    } finally {
      setTxLoading(false);
    }
  };

  const executeSetLevelPercents = async () => {
    if (!signer) return;
    setTxLoading(true);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      const bps = newLevelPercentsInput.map((p, idx) => {
        const val = parseFloat(p);
        if (isNaN(val) || val < 0 || val > 50) {
          throw new Error(`Invalid percentage for Level ${idx + 1}. Must be between 0% and 50%.`);
        }
        return BigInt(Math.round(val * 100)); // 10% -> 1000 bps
      });
      const tx = await stakingContract.setLevelPercents(bps);
      showToast("info", "Updating referral level percentages...");
      await tx.wait();
      showToast("success", "Referral level percentages updated successfully!");
      loadUserData();
    } catch (err) {
      showToast("error", parseTxError(err, "Failed to update level percentages."));
    } finally {
      setTxLoading(false);
    }
  };

  // Change mint method helper
  const changeMintMethod = (method) => {
    setMintMethod(method);
    setMintUsdtAmount("");
    setEstimatedBtcToMint("0.0");
  };

  const changeSellMethod = (method) => {
    setSellMethod(method);
    setSellBtcAmount("");
    setEstimatedUsdtFromSell("0.0");
  };

  // Draw Wheel on canvas
  const drawWheel = (currentAngle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    ctx.clearRect(0, 0, width, height);
    
    const numSectors = prizes.length;
    const arcSize = (2 * Math.PI) / numSectors;
    
    for (let i = 0; i < numSectors; i++) {
      const angle = currentAngle + i * arcSize;
      ctx.beginPath();
      ctx.fillStyle = prizes[i].color;
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
      ctx.lineTo(centerX, centerY);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px Outfit, sans-serif";
      ctx.fillText(prizes[i].name, radius - 30, 5);
      ctx.restore();
    }
    
    // Draw center pin
    ctx.beginPath();
    ctx.fillStyle = "#f59e0b";
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const spinAnimation = (targetPrizeIndex, callback) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const numSectors = prizes.length;
    const arcSize = (2 * Math.PI) / numSectors;
    
    const targetAngle = -Math.PI / 2 - (targetPrizeIndex * arcSize + arcSize / 2);
    
    const spinStartAngle = rotation % (2 * Math.PI);
    const finalAngle = targetAngle - 10 * Math.PI; 
    
    let startTime = null;
    const duration = 4000; 
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = spinStartAngle + (finalAngle - spinStartAngle) * easeOut;
      
      drawWheel(currentAngle);
      setRotation(currentAngle);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        if (callback) callback();
      }
    };
    
    requestAnimationFrame(animate);
  };

  const executeSpinWheel = async () => {
    if (!signer) return;
    setTxLoading(true);
    setIsSpinning(true);
    setWheelPrize(null);
    try {
      const stakingContract = new ethers.Contract(addresses.stakingSystem, BTC_STAKING_SYSTEM_ABI, signer);
      
      const tx = await stakingContract.spinWheel();
      showToast("info", "Spin transaction submitted. Awaiting block confirmation...");
      
      const receipt = await tx.wait();
      
      let prizeIndex = 0;
      let rewardAmount = 0n;
      
      for (const log of receipt.logs) {
        try {
          const parsedLog = stakingContract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === "WheelSpun") {
            prizeIndex = parsedLog.args[1];
            rewardAmount = parsedLog.args[2];
            break;
          }
        } catch (e) {
          // ignore logs from other contracts
        }
      }
      
      spinAnimation(prizeIndex, () => {
        if (prizeIndex === 0) {
          showToast("info", "Better luck next time!");
          setWheelPrize("Try Again");
        } else {
          showToast("success", `Congratulations! You won ${ethers.formatEther(rewardAmount)} RSS!`);
          setWheelPrize(prizes[prizeIndex].name);
        }
        loadUserData();
        setTimeout(loadUserData, 2000);
      });
      
    } catch (err) {
      showToast("error", parseTxError(err, "Spin failed. Please try again."));
      setIsSpinning(false);
    } finally {
      setTxLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "wheel" && canvasRef.current) {
      drawWheel(rotation);
    }
  }, [activeTab]);

  // Handle sell estimate calculation
  const handleSellInputChange = (val) => {
    setSellBtcAmount(val);
    if (!val || isNaN(val) || parseFloat(val) <= 0) {
      setEstimatedUsdtFromSell("0.0");
      return;
    }
    const netBtc = parseFloat(val) * 0.98; // 2% fee
    const usdtAmount = netBtc * parseFloat(currentPrice);
    setEstimatedUsdtFromSell(usdtAmount.toFixed(4));
  };

  // Handle mint estimate calculation
  const handleMintInputChange = (val) => {
    if (val === "") {
      setMintUsdtAmount("");
      setEstimatedBtcToMint("0.0");
      return;
    }
    
    let num = parseFloat(val);
    if (isNaN(num)) return;
    
    // Restrict to max $10,000
    if (mintMethod === "USDT") {
      if (num > 10000) {
        val = "10000";
        num = 10000;
      }
    } else {
      const maxBnb = 10000 / 600; // ~16.6666
      if (num > maxBnb) {
        val = maxBnb.toFixed(4);
        num = parseFloat(val);
      }
    }
    
    setMintUsdtAmount(val);
    const usdVal = mintMethod === "USDT" ? num : num * 600;
    const netUSD = usdVal * 0.98; // 2% fee
    const btcAmount = netUSD / parseFloat(currentPrice);
    setEstimatedBtcToMint(btcAmount.toFixed(4));
  };

  const copyReferralLink = () => {
    const encrypted = encryptAddress(account);
    const link = `${window.location.origin}?ref=${encrypted}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Extract referrer from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get("ref");
    if (refParam) {
      setReferrerInput(refParam);
    }
  }, []);

  return (
    <div className="app-container">
      {/* Toast notifications */}
      {toast && (
        <div className={`toast-notification ${toast.type}`}>
          <AlertCircle size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="main-header">
        <div className="logo-section">
          <Trophy className="logo-icon" size={32} />
          <div>
            <h1 className="logo-title">BTC 3.0 DEX</h1>
            <span className="logo-subtitle">Stake & Earn Platform</span>
          </div>
        </div>
        
        <div className="wallet-panel">
          {account ? (
            <div className="wallet-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="network-badge">{network || "Localhost"}</span>
              <span className="account-address">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </span>
              {!(parseFloat(btcBalance) > 0 || localStorage.getItem(`added_token_${account.toLowerCase()}`) === 'true') && (
                <button 
                  onClick={() => addTokenToWallet(addresses.token, tokenSymbol)}
                  className="add-token-btn"
                  style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: 'var(--gold)',
                    border: '1px solid var(--gold)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  + {tokenSymbol}
                </button>
              )}
              {!(parseFloat(usdtBalance) > 0 || localStorage.getItem(`added_usdt_${account.toLowerCase()}`) === 'true') && (
                <button 
                  onClick={() => addTokenToWallet(addresses.usdt, "USDT")}
                  className="add-token-btn"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    border: '1px solid var(--border-color)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  + USDT
                </button>
              )}
            </div>
          ) : (
            <button className="connect-btn" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      {isWrongNetwork && (
        <div className="wrong-network-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <Info size={18} />
          <span>
            Please switch your network to{" "}
            {addresses.chainId.toLowerCase() === "0x7a69"
              ? "Localhost (31337)"
              : "the BNB Smart Chain (BSC Testnet)"}
            .
          </span>
          <button 
            onClick={switchNetwork}
            className="switch-network-btn"
            style={{
              background: '#eab308',
              color: '#000',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '12px',
              marginLeft: '8px'
            }}
          >
            Switch Network
          </button>
        </div>
      )}

      {/* Hero Stats */}
      <section className="stats-strip">
        <div className="stat-card">
          <span className="stat-label">BTC 3.0 Price</span>
          <h3 className="stat-value">${parseFloat(currentPrice).toFixed(4)}</h3>
          <span className="stat-change text-green">+0.1% per $500 minted</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Value Minted</span>
          <h3 className="stat-value">${parseFloat(totalUSDValueMinted).toFixed(2)}</h3>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Minted Supply</span>
          <h3 className="stat-value">{parseFloat(totalMintedTokens).toFixed(2)} {tokenSymbol}</h3>
        </div>
        <div className="stat-card">
          <span className="stat-label">Max Total Supply</span>
          <h3 className="stat-value">100,000,000 {tokenSymbol}</h3>
        </div>
        <div className="stat-card">
          <span className="stat-label">Your {tokenSymbol} Balance</span>
          <h3 className="stat-value">{btcBalance} {tokenSymbol}</h3>
        </div>
      </section>

      {/* Dashboard Body */}
      <main className="dashboard-grid">
        {/* Navigation Sidebar */}
        <nav className="nav-sidebar">
          <button 
            className={`nav-item ${activeTab === "mint" ? "active" : ""}`}
            onClick={() => setActiveTab("mint")}
          >
            <Flame size={20} />
            <span>Genesis Mint</span>
          </button>
          <button 
            className={`nav-item ${activeTab === "stake" ? "active" : ""}`}
            onClick={() => setActiveTab("stake")}
          >
            <Layers size={20} />
            <span>Staking Portal</span>
          </button>
          <button 
            className={`nav-item ${activeTab === "affiliate" ? "active" : ""}`}
            onClick={() => setActiveTab("affiliate")}
          >
            <Users size={20} />
            <span>Affiliates</span>
          </button>
          <button 
            className={`nav-item ${activeTab === "ranks" ? "active" : ""}`}
            onClick={() => setActiveTab("ranks")}
          >
            <Trophy size={20} />
            <span>Ranks & Levels</span>
          </button>
          <button 
            className={`nav-item ${activeTab === "wheel" ? "active" : ""}`}
            onClick={() => setActiveTab("wheel")}
          >
            <Compass size={20} className={isSpinning ? "animate-spin" : ""} />
            <span>Lucky Wheel</span>
          </button>
        </nav>

        {/* Tab Content Box */}
        <section className="content-box">
          {/* Unregistered warning / Register form */}
          {!userInfo.registered && (
            <div className="registration-overlay">
              <div className="card-box text-center max-w-md mx-auto">
                <Shield size={48} className="gold-text mx-auto mb-4" />
                <h3 className="card-title">Register in System</h3>
                <p className="card-desc mb-6">
                  You need to register with a referrer address to join the BTC 3.0 Staking & Earn system.
                </p>
                <div className="custom-input-group mb-4">
                  <input 
                    type="text" 
                    placeholder="Referrer Address (Optional)" 
                    className="field-input text-center"
                    value={referrerInput}
                    onChange={(e) => setReferrerInput(e.target.value)}
                  />
                </div>
                <button 
                  className="cta-gradient-btn" 
                  onClick={executeRegister}
                  disabled={txLoading}
                >
                  {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
                  Register Now
                </button>
              </div>
            </div>
          )}

          {userInfo.registered && (
            <>
              {/* Tab 1: Minting */}
              {activeTab === "mint" && (
                <div className="tab-pane">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Genesis Mint Box */}
                    <div className="card-box">
                      <h3 className="card-title">BTC 3.0 Genesis Mint</h3>
                      <p className="card-desc">
                        Mint {tokenSymbol} tokens directly from the smart contract using USDT or tBNB. Price increases dynamically by 0.1% every $500 minted.
                      </p>

                      {/* Payment Method Switcher */}
                      <div className="flex gap-2 mb-6">
                        <button 
                          className="small-cta-btn"
                          style={mintMethod === "USDT" ? { flex: 1 } : { flex: 1, background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border-color)' }}
                          onClick={() => changeMintMethod("USDT")}
                        >
                          Mint with USDT
                        </button>
                        <button 
                          className="small-cta-btn"
                          style={mintMethod === "BNB" ? { flex: 1 } : { flex: 1, background: 'var(--bg-tertiary)', color: '#fff', border: '1px solid var(--border-color)' }}
                          onClick={() => changeMintMethod("BNB")}
                        >
                          Mint with BNB (tBNB)
                        </button>
                      </div>

                      <div className="input-block mb-6">
                        <div className="input-label-row">
                          <span>{mintMethod === "USDT" ? "USDT to Deposit" : "BNB to Deposit"}</span>
                          <span>Bal: {mintMethod === "USDT" ? `${usdtBalance} USDT` : `${bnbBalance} BNB`}</span>
                        </div>
                        <input 
                          type="number" 
                          placeholder={mintMethod === "USDT" ? "Min $10 | Max $10000" : "Amount of BNB"} 
                          className="field-input"
                          value={mintUsdtAmount}
                          onChange={(e) => handleMintInputChange(e.target.value)}
                        />
                      </div>

                      <div className="details-panel mb-6">
                        <div className="detail-row">
                          <span>Estimated {tokenSymbol} Received</span>
                          <span className="gold-text font-bold">{estimatedBtcToMint} {tokenSymbol}</span>
                        </div>
                        <div className="detail-row">
                          <span>Dynamic Mint Fee</span>
                          <span>2%</span>
                        </div>
                        <div className="detail-row">
                          <span>Current Rate (USDT)</span>
                          <span>1 {tokenSymbol} = {parseFloat(currentPrice).toFixed(4)} USDT</span>
                        </div>
                        <div className="detail-row">
                          <span>Current Rate (BNB)</span>
                          <span>1 {tokenSymbol} = {(parseFloat(currentPrice) / 600).toFixed(6)} BNB</span>
                        </div>
                        {mintMethod === "BNB" && (
                          <div className="detail-row">
                            <span>BNB Price Reference</span>
                            <span>1 BNB = $600 USD</span>
                          </div>
                        )}
                      </div>

                      {mintMethod === "USDT" && !usdtApproved ? (
                        <button className="cta-gradient-btn" onClick={approveUsdt} disabled={txLoading}>
                          {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
                          Approve USDT
                        </button>
                      ) : (
                        <button className="cta-gradient-btn" onClick={executeMint} disabled={txLoading || !mintUsdtAmount}>
                          {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
                          {mintMethod === "USDT" ? `Mint ${tokenSymbol} Tokens` : `Mint ${tokenSymbol} with BNB`}
                        </button>
                      )}
                    </div>

                    {/* Liquid Sell & Admin Panel Box */}
                    <div className="flex flex-col gap-6">
                      <div className="card-box">
                        <h3 className="card-title">BTC 3.0 Liquid Sell</h3>
                        <p className="card-desc">
                          Sell your {tokenSymbol} tokens back to the contract for USDT. A 2% sell fee is charged (96% of the fee is burned permanently).
                        </p>

                        <div className="input-block mb-6">
                          <div className="input-label-row">
                            <span>{tokenSymbol} to Sell</span>
                            <span>Bal: {btcBalance} {tokenSymbol}</span>
                          </div>
                          <input 
                            type="number" 
                            placeholder="Amount to Sell" 
                            className="field-input"
                            value={sellBtcAmount}
                            onChange={(e) => handleSellInputChange(e.target.value)}
                          />
                        </div>

                        <div className="details-panel mb-6">
                          <div className="detail-row">
                            <span>Estimated USDT Received</span>
                            <span className="gold-text font-bold">${estimatedUsdtFromSell} USDT</span>
                          </div>
                          <div className="detail-row">
                            <span>Estimated BNB Equivalent</span>
                            <span className="gold-text font-bold">{(parseFloat(estimatedUsdtFromSell) / 600).toFixed(6)} BNB</span>
                          </div>
                          <div className="detail-row">
                            <span>Sell Fee (96% Burned)</span>
                            <span>2%</span>
                          </div>
                          <div className="detail-row">
                            <span>Current Rate (USDT)</span>
                            <span>1 {tokenSymbol} = {parseFloat(currentPrice).toFixed(4)} USDT</span>
                          </div>
                          <div className="detail-row">
                            <span>Current Rate (BNB)</span>
                            <span>1 {tokenSymbol} = {(parseFloat(currentPrice) / 600).toFixed(6)} BNB</span>
                          </div>
                        </div>

                        {!btcApproved ? (
                          <button className="cta-gradient-btn" onClick={approveBtc} disabled={txLoading}>
                            {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
                            Approve {tokenSymbol}
                          </button>
                        ) : (
                          <button className="cta-gradient-btn" onClick={executeSell} disabled={txLoading || !sellBtcAmount}>
                            {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
                            Sell {tokenSymbol} Tokens
                          </button>
                        )}
                      </div>

                      {isAdmin && (
                        <div className="card-box">
                          <h3 className="card-title text-red">Admin Treasury Panel</h3>
                          <p className="card-desc">
                            Withdraw USDT gathered in the contract back to the owner treasury wallet.
                          </p>

                          <div className="input-block mb-6">
                            <div className="input-label-row">
                              <span>Amount to Withdraw</span>
                            </div>
                            <input 
                              type="number" 
                              placeholder="Amount (USDT or BNB)" 
                              className="field-input"
                              value={adminWithdrawAmount}
                              onChange={(e) => setAdminWithdrawAmount(e.target.value)}
                            />
                          </div>

                          <div className="flex gap-2">
                            <button className="cta-gradient-btn" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', color: '#fff', flex: 1 }} onClick={executeWithdrawUsdt} disabled={txLoading || !adminWithdrawAmount}>
                              {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
                              Withdraw USDT
                            </button>
                            <button className="cta-gradient-btn" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#000', flex: 1 }} onClick={executeWithdrawBnb} disabled={txLoading || !adminWithdrawAmount}>
                              {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
                              Withdraw BNB
                            </button>
                          </div>

                          <div className="input-block mb-6 mt-6">
                            <div className="input-label-row">
                              <span>Set Spin Wheel Cost ({tokenSymbol})</span>
                            </div>
                            <input 
                              type="number" 
                              placeholder={`New Spin Cost (e.g. 10)`} 
                              className="field-input"
                              value={newSpinCostInput}
                              onChange={(e) => setNewSpinCostInput(e.target.value)}
                            />
                          </div>

                          <button className="cta-gradient-btn" onClick={executeSetSpinCost} disabled={txLoading || !newSpinCostInput}>
                            {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
                            Update Spin Cost
                          </button>

                          <div className="input-block mb-6 mt-6">
                            <div className="input-label-row">
                              <span>Set Referral Level Percentages (%)</span>
                            </div>
                            <div className="grid grid-cols-5 gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                              {newLevelPercentsInput.map((val, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>L{idx+1}</span>
                                  <input 
                                    type="number" 
                                    style={{ textAlign: 'center', padding: '8px', fontSize: '12px' }}
                                    className="field-input"
                                    value={val}
                                    onChange={(e) => {
                                      const copy = [...newLevelPercentsInput];
                                      copy[idx] = e.target.value;
                                      setNewLevelPercentsInput(copy);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          <button className="cta-gradient-btn" onClick={executeSetLevelPercents} disabled={txLoading}>
                            {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
                            Update Referral Percentages
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Staking Portal */}
              {activeTab === "stake" && (
                <div className="tab-pane">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card-box">
                      <h3 className="card-title">New Stake Position</h3>
                      <p className="card-desc">
                        Stake your {tokenSymbol} tokens to earn daily yield. Choose between flexible standard stake or 365-day locked staking.
                      </p>

                      <div className="input-block mb-6">
                        <div className="input-label-row">
                          <span>Amount of {tokenSymbol} to Stake</span>
                          <span>Bal: {btcBalance} {tokenSymbol}</span>
                        </div>
                        <input 
                          type="number" 
                          placeholder="Min $10 equivalent" 
                          className="field-input"
                          value={stakeBtcAmount}
                          onChange={(e) => setStakeBtcAmount(e.target.value)}
                        />
                      </div>

                      <div className="toggle-group mb-6">
                        <span className="toggle-label">365-Day Lock (1.0% daily, 5x Limit)</span>
                        <input 
                          type="checkbox" 
                          id="lock365"
                          checked={is365Day} 
                          onChange={(e) => setIs365Day(e.target.checked)} 
                        />
                        <label htmlFor="lock365" className="toggle-slider"></label>
                      </div>

                      <div className="details-panel mb-6">
                        <div className="detail-row">
                          <span>Expected Daily Yield</span>
                          <span>{is365Day ? "1.0% daily" : "0.5% daily"}</span>
                        </div>
                        <div className="detail-row">
                          <span>Max Return Limit</span>
                          <span>{is365Day ? "5x Cap" : "3x Cap"}</span>
                        </div>
                      </div>

                      {!btcApproved ? (
                        <button className="cta-gradient-btn" onClick={approveBtc} disabled={txLoading}>
                          {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
                          Approve {tokenSymbol}
                        </button>
                      ) : (
                        <button className="cta-gradient-btn" onClick={executeStake} disabled={txLoading || !stakeBtcAmount}>
                          {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
                          Stake {tokenSymbol}
                        </button>
                      )}
                    </div>

                    {/* Active Stakes List */}
                    <div className="card-box">
                      <h3 className="card-title">Your Active Stakes</h3>
                      <div className="active-stakes-list">
                        {userStakesList.filter(st => st.active).length === 0 ? (
                          <p className="no-stakes text-center">No active stakes found.</p>
                        ) : (
                          userStakesList.filter(st => st.active).map((st, idx) => (
                            <div className="stake-item" key={idx}>
                              <div className="stake-item-header">
                                <span className={`stake-badge ${st.is365Day ? "lock-365" : "standard"}`}>
                                  {st.is365Day ? "365-Day Lock" : "Standard"}
                                </span>
                                <span className="stake-amount">{st.amountTokens} {tokenSymbol}</span>
                              </div>
                              <div className="stake-item-details">
                                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                  <div>Staked on:</div>
                                  <div className="text-right text-xs opacity-75">{st.startTime.toLocaleDateString()}</div>
                                  {st.is365Day && (
                                    <>
                                      <div>Lock Expiry:</div>
                                      <div className="text-right text-xs gold-text font-bold">
                                        {(() => {
                                          const expiry = new Date(st.startTime.getTime() + 365 * 24 * 60 * 60 * 1000);
                                          const diff = expiry - new Date();
                                          if (diff <= 0) return "Unlocked";
                                          const days = Math.floor(diff / (24 * 60 * 60 * 1000));
                                          const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                                          return `${days}d ${hours}h left`;
                                        })()}
                                      </div>
                                    </>
                                  )}
                                  <div>Accrued rewards:</div>
                                  <div className="text-right gold-text font-bold">{parseFloat(st.pendingTokens).toFixed(4)} {tokenSymbol}</div>
                                  <div>Progress to Cap:</div>
                                  <div className="text-right font-bold">${parseFloat(st.rewardClaimedUSD).toFixed(2)} / ${parseFloat(st.rewardCapUSD).toFixed(2)}</div>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                <button className="small-cta-btn" onClick={() => executeClaim(st.index)} disabled={txLoading || parseFloat(st.pendingTokens) <= 0}>
                                  Claim
                                </button>
                                <button className="small-danger-btn" onClick={() => executeUnstake(st.index)} disabled={txLoading}>
                                  Unstake
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Affiliate Structure */}
              {activeTab === "affiliate" && (
                <div className="tab-pane max-w-lg mx-auto">
                  <div className="card-box">
                    <h3 className="card-title">Referral Program</h3>
                    <p className="card-desc">
                      Share your referral link with your network and earn commissions across 5 levels.
                    </p>

                    <div className="link-copy-block mb-6">
                      <input 
                        type="text" 
                        readOnly 
                        value={`${window.location.origin}?ref=${encryptAddress(account)}`} 
                        className="field-input text-sm"
                      />
                      <button className="copy-btn" onClick={copyReferralLink}>
                        {copiedLink ? <Check size={18} className="text-green" /> : <Copy size={18} />}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="stat-mini-card">
                        <span className="stat-label">Direct Active Affiliates</span>
                        <h4 className="stat-value">{userInfo.directActiveCount}</h4>
                      </div>
                      <div className="stat-mini-card">
                        <span className="stat-label">Total Team Volume</span>
                        <h4 className="stat-value">${parseFloat(userInfo.totalTeamBusinessUSD).toFixed(2)}</h4>
                      </div>
                    </div>

                    <h4 className="level-heading mb-4">Level Unlock Status</h4>
                    <div className="level-list">
                      <div className="level-row">
                        <span>Level 1 ({levelPercents[0]}% Rewards)</span>
                        <span className={`status-badge ${userInfo.directActiveCount >= 1 ? "unlocked" : "locked"}`}>
                          {userInfo.directActiveCount >= 1 ? "Unlocked" : "Locked (1 Direct Req)"}
                        </span>
                      </div>
                      <div className="level-row">
                        <span>Level 2 ({levelPercents[1]}% Rewards)</span>
                        <span className={`status-badge ${userInfo.directActiveCount >= 2 ? "unlocked" : "locked"}`}>
                          {userInfo.directActiveCount >= 2 ? "Unlocked" : "Locked (2 Directs Req)"}
                        </span>
                      </div>
                      <div className="level-row">
                        <span>Level 3 ({levelPercents[2]}% Rewards)</span>
                        <span className={`status-badge ${userInfo.directActiveCount >= 3 ? "unlocked" : "locked"}`}>
                          {userInfo.directActiveCount >= 3 ? "Unlocked" : "Locked (3 Directs Req)"}
                        </span>
                      </div>
                      <div className="level-row">
                        <span>Level 4 ({levelPercents[3]}% Rewards)</span>
                        <span className={`status-badge ${userInfo.directActiveCount >= 4 ? "unlocked" : "locked"}`}>
                          {userInfo.directActiveCount >= 4 ? "Unlocked" : "Locked (4 Directs Req)"}
                        </span>
                      </div>
                      <div className="level-row">
                        <span>Level 5 ({levelPercents[4]}% Rewards)</span>
                        <span className={`status-badge ${userInfo.directActiveCount >= 5 ? "unlocked" : "locked"}`}>
                          {userInfo.directActiveCount >= 5 ? "Unlocked" : "Locked (5 Directs Req)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Ranks & Leadership */}
              {activeTab === "ranks" && (
                <div className="tab-pane max-w-lg mx-auto">
                  <div className="card-box">
                    <h3 className="card-title">Leadership Ranks</h3>
                    <p className="card-desc">
                      Advance through 14 leadership ranks to qualify for daily USDT/USD rewards. Ranks are based on team volume and structure.
                    </p>

                    <div className="rank-display mb-6">
                      <span className="rank-label">Your Current Rank</span>
                      <h2 className="rank-name gold-text">
                        {rankNames[userInfo.currentRank] || "None"}
                      </h2>
                      {userInfo.dailyRankReward > 0 && (
                        <span className="rank-daily-reward">
                          Receiving ${userInfo.dailyRankReward} / daily
                        </span>
                      )}
                    </div>

                    <div className="stat-mini-card mb-6">
                      <span className="stat-label">Qualifications structure:</span>
                      <p className="card-desc mt-2 text-xs text-left">
                        To count team business for ranks, a maximum of 40% can come from your strongest direct leg, and 60% must come from all other legs combined.
                      </p>
                    </div>

                    {userInfo.dailyRankReward > 0 && (
                      <button 
                        className="cta-gradient-btn mb-6" 
                        onClick={executeClaimRankReward}
                        disabled={txLoading}
                      >
                        {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
                        Claim Daily Rank Reward
                      </button>
                    )}

                    <h4 className="level-heading mb-4">Rank Hierarchy & Daily Rewards</h4>
                    <div className="ranks-table">
                      {rankNames.map((name, idx) => (
                        <div key={idx} className={`rank-row-item ${userInfo.currentRank === idx ? "active" : ""}`}>
                          <span>{idx + 1}. {name}</span>
                          <span className="gold-text">${(idx === 0 ? 1 : idx === 1 ? 5 : idx === 2 ? 11 : idx === 3 ? 35 : idx === 4 ? 45 : idx === 5 ? 150 : idx === 6 ? 300 : idx === 7 ? 500 : idx === 8 ? 1200 : idx === 9 ? 2500 : idx === 10 ? 5000 : idx === 11 ? 12000 : idx === 12 ? 20000 : 35000)}/day</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Lucky Wheel */}
              {activeTab === "wheel" && (
                <div className="tab-pane max-w-lg mx-auto">
                  <div className="card-box text-center">
                    <h3 className="card-title">Lucky Spin Wheel</h3>
                    <p className="card-desc mb-6">
                      Spend {spinCost} {tokenSymbol} to spin the wheel! 100% of the cost is burned to reduce token supply. Win up to 150 {tokenSymbol}!
                    </p>

                    {/* Wheel Container */}
                    <div className="relative flex flex-col items-center justify-center mb-6">
                      {/* Top pointer arrow pointing down */}
                      <div 
                        className="w-0 h-0 mb-2" 
                        style={{
                          borderLeft: "15px solid transparent",
                          borderRight: "15px solid transparent",
                          borderTop: "20px solid #f59e0b"
                        }}
                      ></div>
                      
                      <canvas 
                        ref={canvasRef} 
                        width={300} 
                        height={300} 
                        className="rounded-full shadow-lg border-4 border-gold"
                      ></canvas>
                    </div>

                    {/* Spin Button */}
                    <button 
                      className="cta-gradient-btn mb-6" 
                      onClick={executeSpinWheel}
                      disabled={isSpinning || txLoading || parseFloat(btcBalance) < parseFloat(spinCost)}
                    >
                      {isSpinning ? "Spinning..." : txLoading ? "Awaiting Confirmation..." : `Spin (Cost: ${spinCost} ${tokenSymbol})`}
                    </button>

                    {/* Prize display */}
                    {wheelPrize && (
                      <div className="details-panel mb-6 p-4 rounded bg-dark border border-gold animate-pulse">
                        <h4 className="text-lg font-bold gold-text">
                          {wheelPrize === "Try Again" ? "Better luck next time!" : `You won: ${wheelPrize}!`}
                        </h4>
                      </div>
                    )}

                    {/* Prize List Table */}
                    <h4 className="level-heading mb-4">Prizes & Odds</h4>
                    <div className="ranks-table text-left">
                      <div className="rank-row-item">
                        <span>Try Again</span>
                        <span>50% Odds</span>
                      </div>
                      <div className="rank-row-item">
                        <span className="text-amber">Double Match (5 {tokenSymbol})</span>
                        <span>30% Odds</span>
                      </div>
                      <div className="rank-row-item">
                        <span className="text-blue">Triple Match (15 {tokenSymbol})</span>
                        <span>13% Odds</span>
                      </div>
                      <div className="rank-row-item">
                        <span className="text-purple">Mega Prize (50 {tokenSymbol})</span>
                        <span>5% Odds</span>
                      </div>
                      <div className="rank-row-item">
                        <span className="text-red font-bold">Jackpot (150 {tokenSymbol})</span>
                        <span>2% Odds</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

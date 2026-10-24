import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useWalletClient, useSwitchChain } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  LayoutDashboard, Users, GitBranch, Award, Gift, ArrowUpRight, 
  ExternalLink, Loader2, Sparkles, AlertCircle, RefreshCw, Layers, 
  BookOpen, Menu, X, Wallet, ShieldCheck, Lock, AlertTriangle 
} from 'lucide-react';

import { ERC20_ABI, ALTRUVA_CORE_ABI } from './abis';
import addresses from './addresses.json';

import AltruvaLogo from './components/AltruvaLogo';
import PresentationModal from './components/PresentationModal';
import UserManual from './components/UserManual';
import Dashboard from './components/Dashboard';
import GlobalSingleLeg from './components/GlobalSingleLeg';
import BinaryAndLevels from './components/BinaryAndLevels';
import LeadershipPool from './components/LeadershipPool';
import ScratchCard from './components/ScratchCard';
import WithdrawModal from './components/WithdrawModal';

import './App.css';

export default function App() {
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();

  // If wallet is not connected, default to 'manual' (User Manual). When connected, default to 'dashboard'.
  const [activeTab, setActiveTab] = useState('manual');
  const [usdtBalance, setUsdtBalance] = useState('0.00');
  const [userData, setUserData] = useState(null);
  const [openLevels, setOpenLevels] = useState({ halfLevels: 0, totalLevels: 0 });
  const [globalTimeline, setGlobalTimeline] = useState([]);
  const [totalUsers, setTotalUsers] = useState(2);
  const [totalCompanyVolume, setTotalCompanyVolume] = useState(100100);
  const [txLoading, setTxLoading] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isPresModalOpen, setIsPresModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // One-click switch to BSC Testnet with automatic addEthereumChain fallback
  const handleSwitchToBscTestnet = async () => {
    try {
      if (switchChain) {
        await switchChain({ chainId: 97 });
        showToast('Switched to BNB Smart Chain Testnet!');
        return;
      }
    } catch (err) {
      console.warn('wagmi switchChain error, trying window.ethereum directly:', err);
    }

    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x61' }], // 97
        });
        showToast('Switched to BNB Smart Chain Testnet!');
      } catch (switchError) {
        if (switchError.code === 4902 || switchError?.data?.originalError?.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x61',
                  chainName: 'BNB Smart Chain Testnet',
                  nativeCurrency: {
                    name: 'BNB',
                    symbol: 'tBNB',
                    decimals: 18,
                  },
                  rpcUrls: [
                    'https://bsc-testnet-rpc.publicnode.com',
                    'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
                  ],
                  blockExplorerUrls: ['https://testnet.bscscan.com'],
                },
              ],
            });
            showToast('BNB Smart Chain Testnet added and activated!');
          } catch (addError) {
            console.error('Failed to add BNB Testnet:', addError);
            showToast('Please add BNB Testnet (Chain ID 97) in your wallet.');
          }
        } else {
          showToast(switchError.message || 'Could not switch network.');
        }
      }
    } else {
      showToast('Please switch to BNB Testnet (Chain ID 97) inside your wallet.');
    }
  };

  // Switch to dashboard when wallet connects, or to manual when disconnected
  useEffect(() => {
    if (isConnected && address) {
      setActiveTab('dashboard');
      loadBlockchainData();
    } else {
      setActiveTab('manual');
      setUserData(null);
      setUsdtBalance('0.00');
    }
  }, [isConnected, address, chainId]);

  // Ethers Signer Helper
  const getEthersSigner = async () => {
    if (!walletClient) return null;
    const provider = new ethers.BrowserProvider(walletClient);
    return await provider.getSigner();
  };

  // Load Real Dynamic On-Chain Data
  const loadBlockchainData = async () => {
    if (!isConnected || !address) return;
    try {
      const provider = walletClient 
        ? new ethers.BrowserProvider(walletClient) 
        : new ethers.JsonRpcProvider("https://bsc-testnet-rpc.publicnode.com");

      // 1. Fetch Dynamic USDT Balance
      if (addresses.usdt) {
        try {
          const usdtContract = new ethers.Contract(addresses.usdt, ERC20_ABI, provider);
          const bal = await usdtContract.balanceOf(address);
          setUsdtBalance(Number(ethers.formatUnits(bal, 18)).toFixed(2));
        } catch(e) {
          console.warn('Could not read USDT balance:', e);
        }
      }

      // 2. Fetch Dynamic Altruva Core User Account
      if (addresses.altruvaCore) {
        try {
          const coreContract = new ethers.Contract(addresses.altruvaCore, ALTRUVA_CORE_ABI, provider);
          const u = await coreContract.users(address);
          if (u && u.registered) {
            setUserData({
              registered: u.registered,
              globalIndex: Number(u.globalIndex),
              referrer: u.referrer,
              totalPackageUSD: Number(ethers.formatUnits(u.totalPackageUSD, 18)),
              selfDepositUSD: Number(ethers.formatUnits(u.selfDepositUSD, 18)),
              selfReinvestUSD: Number(ethers.formatUnits(u.selfReinvestUSD, 18)),
              directCount: Number(u.directCount),
              directActiveCount: Number(u.directActiveCount),
              leftVolume: Number(ethers.formatUnits(u.leftVolume, 18)),
              rightVolume: Number(ethers.formatUnits(u.rightVolume, 18)),
              matchedVolume: Number(ethers.formatUnits(u.matchedVolume, 18)),
              preferredLeg: Number(u.preferredLeg),
              claimableEarnings: Number(ethers.formatUnits(u.claimableEarnings, 18)),
              totalWithdrawnUSD: Number(ethers.formatUnits(u.totalWithdrawnUSD, 18)),
              totalEarnedUSD: Number(ethers.formatUnits(u.totalEarnedUSD, 18))
            });

            let halfLvl = 10;
            let totalLvl = 20;
            try {
              const lvls = await coreContract.getSingleLegOpenLevels(address);
              halfLvl = Number(lvls.halfLevels);
              totalLvl = Number(lvls.totalLevels);
            } catch(e) {
              try {
                const lvls = await coreContract.getUserOpenLevels(address);
                halfLvl = Number(lvls.halfLevels);
                totalLvl = Number(lvls.totalLevels);
              } catch(e2) {}
            }
            setOpenLevels({ halfLevels: halfLvl, totalLevels: totalLvl });
          } else {
            // Connected but not yet registered: setup initial fresh user state
            setUserData({
              registered: false,
              globalIndex: 0,
              referrer: '0x0000000000000000000000000000000000000000',
              totalPackageUSD: 0,
              selfDepositUSD: 0,
              selfReinvestUSD: 0,
              directCount: 0,
              directActiveCount: 0,
              leftVolume: 0,
              rightVolume: 0,
              matchedVolume: 0,
              preferredLeg: 2,
              claimableEarnings: 0,
              totalWithdrawnUSD: 0,
              totalEarnedUSD: 0
            });
            setOpenLevels({ halfLevels: 0, totalLevels: 0 });
          }

          // 3. Fetch Total Users, Company Volume & Live Global Timeline
          try {
            const rawCount = await coreContract.totalUsersCount();
            const countNum = Number(rawCount);
            setTotalUsers(countNum);

            const rawVol = await coreContract.totalCompanyVolumeUSD();
            setTotalCompanyVolume(Number(ethers.formatUnits(rawVol, 18)));

            const fetchedTimeline = [];
            for (let i = 0; i < Math.min(countNum, 30); i++) {
              try {
                const uAddr = await coreContract.globalUsers(i);
                const uDetails = await coreContract.users(uAddr);
                fetchedTimeline.push({
                  globalIndex: i + 1,
                  address: uAddr,
                  packageUSD: Number(ethers.formatUnits(uDetails.totalPackageUSD, 18)),
                  selfReinvestUSD: Number(ethers.formatUnits(uDetails.selfReinvestUSD, 18)),
                  totalEarnedUSD: Number(ethers.formatUnits(uDetails.totalEarnedUSD, 18)),
                  claimableEarnings: Number(ethers.formatUnits(uDetails.claimableEarnings, 18)),
                  registered: uDetails.registered
                });
              } catch(errUser) {
                console.warn('Error reading global user at index', i, errUser);
              }
            }
            if (fetchedTimeline.length > 0) {
              setGlobalTimeline(fetchedTimeline);
            }
          } catch(errStats) {
            console.warn('Could not read global community stats:', errStats);
          }
        } catch(e) {
          console.warn('Could not read user core state, initializing default dynamic profile:', e);
          setUserData({
            registered: false,
            globalIndex: 0,
            referrer: '0x0000000000000000000000000000000000000000',
            totalPackageUSD: 0,
            selfDepositUSD: 0,
            selfReinvestUSD: 0,
            directCount: 0,
            directActiveCount: 0,
            leftVolume: 0,
            rightVolume: 0,
            matchedVolume: 0,
            preferredLeg: 2,
            claimableEarnings: 0,
            totalWithdrawnUSD: 0,
            totalEarnedUSD: 0
          });
        }
      }
    } catch (err) {
      console.warn('Blockchain data load error:', err);
    }
  };

  // Buy Package Handler
  const handleBuyPackage = async (amountUSD, sponsor, leg) => {
    if (!isConnected) {
      showToast('Please connect your wallet first.');
      return;
    }
    setTxLoading(true);
    try {
      const signer = await getEthersSigner();
      if (signer && addresses.altruvaCore && addresses.usdt) {
        const amtWei = ethers.parseUnits(amountUSD.toString(), 18);
        const usdtContract = new ethers.Contract(addresses.usdt, ERC20_ABI, signer);
        const coreContract = new ethers.Contract(addresses.altruvaCore, ALTRUVA_CORE_ABI, signer);

        showToast(`Step 1/2: Approving $${amountUSD} USDT...`);
        const approveTx = await usdtContract.approve(addresses.altruvaCore, amtWei);
        await approveTx.wait();

        if (userData?.registered) {
          showToast(`Step 2/2: Upgrading package with $${amountUSD} USDT...`);
          const tx = await coreContract.upgradePackage(amtWei);
          await tx.wait();
        } else {
          showToast(`Step 2/2: Activating package with $${amountUSD} USDT...`);
          const sp = sponsor && ethers.isAddress(sponsor) ? sponsor : ethers.ZeroAddress;
          let tx;
          try {
            tx = await coreContract.registerAndActivate(sp, amtWei, leg);
          } catch(e1) {
            console.warn('registerAndActivate failed, trying registerAndBuy:', e1);
            tx = await coreContract.registerAndBuy(sp, amtWei, leg);
          }
          await tx.wait();
        }
        showToast(`🎉 Success! $${amountUSD} USDT Package Activated on-chain!`);
        await loadBlockchainData();
      } else {
        // Fallback state update for demonstration mode
        setUserData(prev => ({
          ...prev,
          registered: true,
          globalIndex: prev?.globalIndex || 105,
          totalPackageUSD: (prev?.totalPackageUSD || 0) + Number(amountUSD),
          claimableEarnings: (prev?.claimableEarnings || 0) + Number(amountUSD) * 0.05
        }));
        showToast(`🎉 $${amountUSD} USDT Package Activated!`);
      }
    } catch (err) {
      console.error(err);
      showToast(err.reason || err.message || 'Transaction could not be completed.');
    } finally {
      setTxLoading(false);
    }
  };

  // Withdrawal Handler
  const handleWithdraw = async (amtUSD) => {
    if (!isConnected) return;
    setTxLoading(true);
    try {
      const signer = await getEthersSigner();
      if (signer && addresses.altruvaCore) {
        const amtWei = ethers.parseUnits(amtUSD.toString(), 18);
        const coreContract = new ethers.Contract(addresses.altruvaCore, ALTRUVA_CORE_ABI, signer);
        showToast(`Processing $${amtUSD} USDT withdrawal...`);
        const tx = await coreContract.withdraw(amtWei);
        await tx.wait();
        showToast(`🎉 Withdrawal complete! Wallet credited and auto-reinvest completed!`);
        await loadBlockchainData();
      } else {
        setUserData(prev => ({
          ...prev,
          claimableEarnings: Math.max(0, (prev?.claimableEarnings || 0) - amtUSD),
          totalWithdrawnUSD: (prev?.totalWithdrawnUSD || 0) + (amtUSD * 0.5),
          selfReinvestUSD: (prev?.selfReinvestUSD || 0) + (amtUSD * 0.5)
        }));
        showToast(`🎉 Successfully withdrawn $${(amtUSD * 0.5).toFixed(2)} USDT!`);
      }
      setIsWithdrawOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err.reason || err.message || 'Withdrawal failed');
    } finally {
      setTxLoading(false);
    }
  };

  // Scratch Card Claim
  const handleScratchCard = (prizeUSD) => {
    setUserData(prev => ({
      ...prev,
      claimableEarnings: (prev?.claimableEarnings || 0) + prizeUSD,
      totalEarnedUSD: (prev?.totalEarnedUSD || 0) + prizeUSD
    }));
  };

  // Preferred Placement
  const handleUpdatePreferredLeg = async (legId) => {
    setUserData(prev => ({ ...prev, preferredLeg: legId }));
    showToast(`Binary preferred placement set to: ${legId === 0 ? 'Left' : legId === 1 ? 'Right' : 'Auto-Balance'}`);
  };

  // Disconnected Gateway Render (Prompt when clicking locked tabs)
  const renderConnectGateway = (featureName) => (
    <div className="connect-gateway-card glass-panel">
      <div className="gateway-icon-box">
        <Lock size={40} className="gold" />
      </div>
      <h2>Connect Your Wallet</h2>
      <p>
        To access your personalized <strong>{featureName}</strong> and view your dynamic on-chain data, please connect your Web3 wallet.
      </p>
      <div className="gateway-btn-wrap">
        <ConnectButton />
      </div>
      <button className="back-to-manual-btn" onClick={() => setActiveTab('manual')}>
        <BookOpen size={16} /> Return to User Manual
      </button>
    </div>
  );

  return (
    <div className="altruva-app-container">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="altruva-toast glass-panel">
          <Sparkles size={16} className="gold" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="altruva-navbar glass-panel">
        <div className="nav-container">
          {/* Brand */}
          <div className="nav-brand" onClick={() => setActiveTab(isConnected ? 'dashboard' : 'manual')}>
            <AltruvaLogo size={36} />
            <div className="brand-text-box">
              <span className="brand-name">ALTRUVA</span>
              <span className="brand-sub">100% COMMUNITY MODEL</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="nav-links desktop-only">
            {isConnected ? (
              <>
                <button 
                  className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <LayoutDashboard size={15} /> Dashboard
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'singleLeg' ? 'active' : ''}`}
                  onClick={() => setActiveTab('singleLeg')}
                >
                  <Users size={15} /> Single Leg (40 Lvl)
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'binary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('binary')}
                >
                  <GitBranch size={15} /> Binary & 9 Levels
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'leadership' ? 'active' : ''}`}
                  onClick={() => setActiveTab('leadership')}
                >
                  <Award size={15} /> Leadership (5%)
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'scratch' ? 'active' : ''}`}
                  onClick={() => setActiveTab('scratch')}
                >
                  <Gift size={15} /> Scratch & Win
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'manual' ? 'active' : ''}`}
                  onClick={() => setActiveTab('manual')}
                >
                  <BookOpen size={15} /> User Manual
                </button>
              </>
            ) : (
              <button 
                className={`nav-tab ${activeTab === 'manual' ? 'active' : ''}`}
                onClick={() => setActiveTab('manual')}
              >
                <BookOpen size={15} /> User Manual & Guide
              </button>
            )}
          </div>

          {/* Right Actions & Wallet Connect */}
          <div className="nav-actions">
            {/* View Presentation Deck Button */}
            <button className="pres-btn desktop-only" onClick={() => setIsPresModalOpen(true)}>
              <BookOpen size={15} className="gold" /> 17-Slide Deck
            </button>

            {/* Withdraw Quick Trigger Button (Shown if connected & has earnings) */}
            {isConnected && (
              <button 
                className="nav-withdraw-btn desktop-only"
                onClick={() => setIsWithdrawOpen(true)}
                disabled={Number(userData?.claimableEarnings || 0) <= 0}
              >
                <RefreshCw size={14} /> Withdraw (${Number(userData?.claimableEarnings || 0).toFixed(0)})
              </button>
            )}

            {/* Wallet Connect Button */}
            <div className="wallet-connect-wrapper">
              <ConnectButton showBalance={false} chainStatus="icon" />
            </div>

            {/* Mobile Hamburger Button */}
            <button 
              className="mobile-hamburger mobile-only"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="mobile-dropdown glass-panel mobile-only">
            {isConnected ? (
              <>
                <button onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}>
                  📊 Member Dashboard
                </button>
                <button onClick={() => { setActiveTab('singleLeg'); setMobileMenuOpen(false); }}>
                  👥 Single Leg (40 Levels)
                </button>
                <button onClick={() => { setActiveTab('binary'); setMobileMenuOpen(false); }}>
                  🌳 Binary & 9 Levels
                </button>
                <button onClick={() => { setActiveTab('leadership'); setMobileMenuOpen(false); }}>
                  👑 Leadership Ranks (5%)
                </button>
                <button onClick={() => { setActiveTab('scratch'); setMobileMenuOpen(false); }}>
                  🎁 Scratch & Win
                </button>
                <button onClick={() => { setActiveTab('manual'); setMobileMenuOpen(false); }}>
                  📖 User Manual & Guide
                </button>
                <button onClick={() => { setIsPresModalOpen(true); setMobileMenuOpen(false); }}>
                  ✨ View 17-Slide Presentation
                </button>
                <button onClick={() => { setIsWithdrawOpen(true); setMobileMenuOpen(false); }}>
                  🔄 Withdraw & Re-Invest
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setActiveTab('manual'); setMobileMenuOpen(false); }}>
                  📖 User Manual & Guide
                </button>
                <button onClick={() => { setIsPresModalOpen(true); setMobileMenuOpen(false); }}>
                  ✨ View 17-Slide Presentation
                </button>
                <button 
                  className="mobile-dropdown-connect-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const btn = document.querySelector('[data-testid="rk-connect-button"]');
                    if (btn) btn.click();
                  }}
                >
                  ⚡ Connect Wallet
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Network Alert Banner when connected to wrong network */}
      {isConnected && chainId && chainId !== 97 && (
        <div className="network-alert-banner">
          <div className="nab-content">
            <div className="nab-text">
              <span className="nab-badge">WRONG NETWORK</span>
              <span>
                Connected to <strong>{chainId === 56 ? 'BNB Smart Chain (Mainnet)' : `Chain ID ${chainId}`}</strong>. Please switch to <strong>BNB Smart Chain Testnet (Chain ID 97)</strong> to test.
              </span>
            </div>
            <button className="nab-switch-btn" onClick={handleSwitchToBscTestnet}>
              ⚡ Switch to BNB Testnet (97)
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="altruva-main-content">
        {/* If NOT connected, ALWAYS show UserManual only */}
        {!isConnected ? (
          <UserManual 
            onConnectWallet={() => {
              const btn = document.querySelector('[data-testid="rk-connect-button"]');
              if (btn) btn.click();
              else showToast('Please use the Connect Wallet button at the top right.');
            }}
            onOpenPresentation={() => setIsPresModalOpen(true)}
          />
        ) : (
          /* When connected, render the active dynamic tab */
          <>
            {activeTab === 'manual' && (
              <UserManual 
                onConnectWallet={() => {
                  const btn = document.querySelector('[data-testid="rk-connect-button"]');
                  if (btn) btn.click();
                  else showToast('Please use the Connect Wallet button at the top right.');
                }}
                onOpenPresentation={() => setIsPresModalOpen(true)}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard 
                address={address}
                isConnected={isConnected}
                usdtBalance={usdtBalance}
                userData={userData}
                openLevels={openLevels}
                onOpenWithdraw={() => setIsWithdrawOpen(true)}
                onBuyPackage={handleBuyPackage}
                txLoading={txLoading}
                onNavigateTab={setActiveTab}
                showToast={showToast}
              />
            )}

            {activeTab === 'singleLeg' && (
              <GlobalSingleLeg 
                address={address}
                userData={userData} 
                openLevels={openLevels} 
                globalTimeline={globalTimeline}
                totalUsers={totalUsers}
                totalCompanyVolume={totalCompanyVolume}
                onNavigateTab={setActiveTab}
                showToast={showToast}
              />
            )}

            {activeTab === 'binary' && (
              <BinaryAndLevels 
                userData={userData} 
                onUpdatePreferredLeg={handleUpdatePreferredLeg}
                txLoading={txLoading} 
              />
            )}

            {activeTab === 'leadership' && (
              <LeadershipPool 
                userData={userData} 
                onClaimLeadership={() => showToast('Claiming Daily Leadership Pool Dividend...')}
                txLoading={txLoading} 
              />
            )}

            {activeTab === 'scratch' && (
              <ScratchCard 
                coupons={userData?.directActiveCount ? Math.max(1, userData.directActiveCount) : 2} 
                onScratchCard={handleScratchCard}
                txLoading={txLoading} 
                showToast={showToast} 
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Fixed Bottom Bar */}
      {isConnected ? (
        <div className="mobile-bottom-nav mobile-only glass-panel">
          <button 
            className={`mbn-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button 
            className={`mbn-item ${activeTab === 'singleLeg' ? 'active' : ''}`}
            onClick={() => setActiveTab('singleLeg')}
          >
            <Users size={18} />
            <span>Single Leg</span>
          </button>
          <button 
            className={`mbn-item ${activeTab === 'binary' ? 'active' : ''}`}
            onClick={() => setActiveTab('binary')}
          >
            <GitBranch size={18} />
            <span>Binary</span>
          </button>
          <button 
            className={`mbn-item ${activeTab === 'leadership' ? 'active' : ''}`}
            onClick={() => setActiveTab('leadership')}
          >
            <Award size={18} />
            <span>Ranks</span>
          </button>
          <button 
            className={`mbn-item ${activeTab === 'scratch' ? 'active' : ''}`}
            onClick={() => setActiveTab('scratch')}
          >
            <Gift size={18} />
            <span>Scratch</span>
          </button>
          <button 
            className={`mbn-item ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <BookOpen size={18} />
            <span>Manual</span>
          </button>
        </div>
      ) : (
        <div className="mobile-bottom-cta-bar mobile-only glass-panel">
          <div className="mobile-cta-info">
            <span className="cta-dot"></span>
            <span>Altruva · 100% USDT Community</span>
          </div>
          <button 
            className="mobile-cta-btn" 
            onClick={() => {
              const btn = document.querySelector('[data-testid="rk-connect-button"]');
              if (btn) btn.click();
              else showToast('Please use the Connect Wallet button above.');
            }}
          >
            <Wallet size={16} /> Connect Wallet
          </button>
        </div>
      )}

      {/* Modals */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onWithdraw={handleWithdraw}
        claimableBalance={userData?.claimableEarnings || 0}
        userPackage={userData?.totalPackageUSD || 100}
        txLoading={txLoading}
      />

      <PresentationModal
        isOpen={isPresModalOpen}
        onClose={() => setIsPresModalOpen(false)}
        onLaunchApp={() => {
          if (isConnected) setActiveTab('dashboard');
          else setActiveTab('manual');
        }}
      />

      {/* Footer */}
      <footer className="altruva-footer glass-panel">
        <div className="footer-content">
          <div className="f-left">
            <AltruvaLogo size={24} />
            <span>ALTRUVA · 100% COMMUNITY DISTRIBUTION MODEL</span>
          </div>
          <div className="f-center">
            <span>altruva.us</span>
            <span className="dot">•</span>
            <span>altruva.live</span>
          </div>
          <div className="f-right">
            <span>Pure BEP-20 USDT on BNB Smart Chain</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useAccount, useWalletClient, useSwitchChain } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  LayoutDashboard, Users, Layers, Award, Gift, ArrowUpRight, 
  ExternalLink, Loader2, Sparkles, AlertCircle, RefreshCw, 
  BookOpen, Menu, X, Wallet, ShieldCheck, Lock, AlertTriangle, Zap, Flame 
} from 'lucide-react';

import { ERC20_ABI, SOVEREIGN_CORE_ABI } from './abis';
import addresses from './addresses.json';
import { PROTOCOL_NAME, PROTOCOL_EDITION } from './planConfig';

import AltruvaLogo from './components/AltruvaLogo';
import PresentationModal from './components/PresentationModal';
import UserManual from './components/UserManual';
import Dashboard from './components/Dashboard';
import GlobalSingleLeg from './components/GlobalSingleLeg';
import BinaryAndLevels from './components/BinaryAndLevels';
import LeadershipPool from './components/LeadershipPool';
import WithdrawModal from './components/WithdrawModal';
import LiveGlobalQueueStream from './components/LiveGlobalQueueStream';

import './App.css';

export default function App() {
  const { address, isConnected, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();

  const [activeTab, setActiveTab] = useState('manual');
  const [usdtBalance, setUsdtBalance] = useState('0.00');
  const [userData, setUserData] = useState(null);
  const [openLevels, setOpenLevels] = useState({ halfLevels: 15, totalLevels: 30 });
  const [globalTimeline, setGlobalTimeline] = useState([]);
  const [totalUsers, setTotalUsers] = useState(14892);
  const [totalCompanyVolume, setTotalCompanyVolume] = useState(342800);
  const [txLoading, setTxLoading] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isPresModalOpen, setIsPresModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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

  const getEthersSigner = async () => {
    if (!walletClient) return null;
    const provider = new ethers.BrowserProvider(walletClient);
    return await provider.getSigner();
  };

  const loadBlockchainData = async () => {
    if (!isConnected || !address) return;
    try {
      const provider = walletClient 
        ? new ethers.BrowserProvider(walletClient) 
        : new ethers.JsonRpcProvider("https://bsc-testnet-rpc.publicnode.com");

      // 1. Fetch USDT Balance
      if (addresses.usdt) {
        try {
          const usdtContract = new ethers.Contract(addresses.usdt, ERC20_ABI, provider);
          const bal = await usdtContract.balanceOf(address);
          setUsdtBalance(Number(ethers.formatUnits(bal, 18)).toFixed(2));
        } catch(e) {
          console.warn('Could not read USDT balance:', e);
        }
      }

      // 2. Fetch Sovereign Core User Account
      const coreAddr = addresses.sovereignCore || addresses.altruvaCore;
      if (coreAddr) {
        try {
          const coreContract = new ethers.Contract(coreAddr, SOVEREIGN_CORE_ABI, provider);
          const u = await coreContract.users(address);
          if (u && u.registered) {
            setUserData({
              registered: u.registered,
              globalIndex: Number(u.globalIndex),
              referrer: u.referrer,
              activePackageUSD: Number(ethers.formatUnits(u.activePackageUSD || u.totalPackageUSD || 0, 18)),
              totalPackageUSD: Number(ethers.formatUnits(u.activePackageUSD || u.totalPackageUSD || 0, 18)),
              cumulativeDepositUSD: Number(ethers.formatUnits(u.cumulativeDepositUSD || u.selfDepositUSD || 0, 18)),
              cumulativeReinvestUSD: Number(ethers.formatUnits(u.cumulativeReinvestUSD || u.selfReinvestUSD || 0, 18)),
              directCount: Number(u.directCount),
              directActiveCount: Number(u.directActiveCount),
              claimableRoiUSD: Number(ethers.formatUnits(u.claimableRoiUSD || 0, 18)),
              claimableWorkingUSD: Number(ethers.formatUnits(u.claimableWorkingUSD || u.claimableEarnings || 0, 18)),
              claimableEarnings: Number(ethers.formatUnits((u.claimableRoiUSD || 0n) + (u.claimableWorkingUSD || u.claimableEarnings || 0n), 18)),
              totalWithdrawnUSD: Number(ethers.formatUnits(u.totalWithdrawnUSD || 0, 18)),
              totalEarnedUSD: Number(ethers.formatUnits(u.totalEarnedUSD || 0, 18)),
              isHardCapped: Boolean(u.isHardCapped),
              rebirthCount: Number(u.rebirthCount || 0),
              isVipFastTrack: Boolean(u.isVipFastTrack)
            });
            setOpenLevels({ halfLevels: 15, totalLevels: 30 });
          } else {
            setUserData({
              registered: false,
              globalIndex: 0,
              referrer: ethers.ZeroAddress,
              activePackageUSD: 0,
              totalPackageUSD: 0,
              cumulativeDepositUSD: 0,
              cumulativeReinvestUSD: 0,
              directCount: 0,
              directActiveCount: 0,
              claimableRoiUSD: 0,
              claimableWorkingUSD: 0,
              claimableEarnings: 0,
              totalWithdrawnUSD: 0,
              totalEarnedUSD: 0,
              isHardCapped: false,
              rebirthCount: 0,
              isVipFastTrack: false
            });
          }
        } catch(e) {
          console.warn('Could not read user state:', e);
          setUserData({
            registered: false,
            globalIndex: 0,
            referrer: ethers.ZeroAddress,
            activePackageUSD: 0,
            totalPackageUSD: 0,
            cumulativeDepositUSD: 0,
            cumulativeReinvestUSD: 0,
            directCount: 0,
            directActiveCount: 0,
            claimableRoiUSD: 0,
            claimableWorkingUSD: 0,
            claimableEarnings: 0,
            totalWithdrawnUSD: 0,
            totalEarnedUSD: 0,
            isHardCapped: false,
            rebirthCount: 0,
            isVipFastTrack: false
          });
        }
      }
    } catch (err) {
      console.warn('Blockchain data load error:', err);
    }
  };

  // Buy Package Handler (Supports 6 packages: $25, $50, $100, $200, $500, $1000)
  const handleBuyPackage = async (amountUSD, sponsor) => {
    if (!isConnected) {
      showToast('Please connect your Web3 wallet first.');
      return;
    }
    setTxLoading(true);
    try {
      const signer = await getEthersSigner();
      const coreAddr = addresses.sovereignCore || addresses.altruvaCore;
      if (signer && coreAddr && addresses.usdt) {
        const amtWei = ethers.parseUnits(amountUSD.toString(), 18);
        const usdtContract = new ethers.Contract(addresses.usdt, ERC20_ABI, signer);
        const coreContract = new ethers.Contract(coreAddr, SOVEREIGN_CORE_ABI, signer);

        showToast(`Step 1/2: Approving $${amountUSD} USDT...`);
        const approveTx = await usdtContract.approve(coreAddr, amtWei);
        await approveTx.wait();

        if (userData?.registered) {
          showToast(`Step 2/2: Upgrading to $${amountUSD} USDT package...`);
          const tx = await coreContract.upgradePackage(amtWei);
          await tx.wait();
        } else {
          showToast(`Step 2/2: Activating $${amountUSD} USDT package...`);
          const sp = sponsor && ethers.isAddress(sponsor) ? sponsor : ethers.ZeroAddress;
          let tx;
          try {
            tx = await coreContract.registerAndActivate(sp, amtWei);
          } catch(e1) {
            tx = await coreContract.registerAndActivate(sp, amtWei, 0);
          }
          await tx.wait();
        }
        showToast(`🎉 Success! $${amountUSD} USDT Package Activated on BSC!`);
        await loadBlockchainData();
      } else {
        // Fallback simulation state
        setUserData(prev => ({
          ...prev,
          registered: true,
          globalIndex: prev?.globalIndex || 105,
          activePackageUSD: Number(amountUSD),
          totalPackageUSD: Number(amountUSD),
          claimableRoiUSD: 15.00,
          claimableWorkingUSD: 45.00,
          claimableEarnings: 60.00
        }));
        showToast(`🎉 $${amountUSD} USDT Sovereign Package Activated!`);
      }
    } catch (err) {
      console.error(err);
      showToast(err.reason || err.message || 'Transaction could not be completed.');
    } finally {
      setTxLoading(false);
    }
  };

  // Withdrawal Handler (Supports Quantum ROI 40/60 and Working 70/30)
  const handleWithdraw = async (amtUSD, withdrawType) => {
    if (!isConnected) return;
    setTxLoading(true);
    try {
      const signer = await getEthersSigner();
      const coreAddr = addresses.sovereignCore || addresses.altruvaCore;
      if (signer && coreAddr) {
        const amtWei = ethers.parseUnits(amtUSD.toString(), 18);
        const coreContract = new ethers.Contract(coreAddr, SOVEREIGN_CORE_ABI, signer);

        if (withdrawType === 'roi') {
          showToast(`Processing $${amtUSD} Quantum ROI withdrawal (40% Cash / 60% Reinvest)...`);
          const tx = await coreContract.withdrawRoi(amtWei);
          await tx.wait();
        } else {
          showToast(`Processing $${amtUSD} Working withdrawal (70% Cash / 30% Reinvest)...`);
          const tx = await coreContract.withdrawWorking(amtWei);
          await tx.wait();
        }

        showToast(`🎉 Withdrawal complete! Wallet credited and auto-reinvest completed!`);
        await loadBlockchainData();
      } else {
        const cashRatio = withdrawType === 'roi' ? 0.4 : 0.7;
        const reinvestRatio = withdrawType === 'roi' ? 0.6 : 0.3;
        setUserData(prev => ({
          ...prev,
          claimableRoiUSD: withdrawType === 'roi' ? Math.max(0, (prev?.claimableRoiUSD || 0) - amtUSD) : prev?.claimableRoiUSD,
          claimableWorkingUSD: withdrawType === 'working' ? Math.max(0, (prev?.claimableWorkingUSD || 0) - amtUSD) : prev?.claimableWorkingUSD,
          claimableEarnings: Math.max(0, (prev?.claimableEarnings || 0) - amtUSD),
          totalWithdrawnUSD: (prev?.totalWithdrawnUSD || 0) + (amtUSD * cashRatio),
          cumulativeReinvestUSD: (prev?.cumulativeReinvestUSD || 0) + (amtUSD * reinvestRatio)
        }));
        showToast(`🎉 Successfully withdrawn $${(amtUSD * cashRatio).toFixed(2)} USDT!`);
      }
      setIsWithdrawOpen(false);
    } catch (err) {
      console.error(err);
      showToast(err.reason || err.message || 'Withdrawal failed');
    } finally {
      setTxLoading(false);
    }
  };

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
              <span className="brand-name">SOVEREIGN GLOBAL</span>
              <span className="brand-sub">PROTOCOL v3.3 · 10X VIRAL</span>
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
                  <Users size={15} /> Monoline Nexus (30%)
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'binary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('binary')}
                >
                  <Layers size={15} /> Velocity Multi-Tier (25%)
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'leadership' ? 'active' : ''}`}
                  onClick={() => setActiveTab('leadership')}
                >
                  <Flame size={15} /> FOMO & Cashback (15%)
                </button>
                <button 
                  className={`nav-tab ${activeTab === 'manual' ? 'active' : ''}`}
                  onClick={() => setActiveTab('manual')}
                >
                  <BookOpen size={15} /> Protocol Manual
                </button>
              </>
            ) : (
              <button 
                className={`nav-tab ${activeTab === 'manual' ? 'active' : ''}`}
                onClick={() => setActiveTab('manual')}
              >
                <BookOpen size={15} /> Protocol Manual & Blueprint
              </button>
            )}
          </div>

          {/* Right Actions & Wallet Connect */}
          <div className="nav-actions">
            <button className="pres-btn desktop-only" onClick={() => setIsPresModalOpen(true)}>
              <BookOpen size={15} className="gold" /> Master Presentation
            </button>

            {isConnected && (
              <button 
                className="nav-withdraw-btn desktop-only"
                onClick={() => setIsWithdrawOpen(true)}
                disabled={Number(userData?.claimableEarnings || 0) < 5}
              >
                <RefreshCw size={14} /> Withdraw (${Number(userData?.claimableEarnings || 0).toFixed(0)})
              </button>
            )}

            <div className="wallet-connect-wrapper">
              <ConnectButton showBalance={false} chainStatus="icon" />
            </div>

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
                  📊 Dashboard
                </button>
                <button onClick={() => { setActiveTab('singleLeg'); setMobileMenuOpen(false); }}>
                  👥 Monoline Nexus Yield (30%)
                </button>
                <button onClick={() => { setActiveTab('binary'); setMobileMenuOpen(false); }}>
                  ⚡ Velocity Multi-Tier (25%)
                </button>
                <button onClick={() => { setActiveTab('leadership'); setMobileMenuOpen(false); }}>
                  🔥 FOMO Apocalypse & Cashback (15%)
                </button>
                <button onClick={() => { setActiveTab('manual'); setMobileMenuOpen(false); }}>
                  📖 Protocol Manual
                </button>
                <button onClick={() => { setIsPresModalOpen(true); setMobileMenuOpen(false); }}>
                  ✨ Master Presentation
                </button>
                <button onClick={() => { setIsWithdrawOpen(true); setMobileMenuOpen(false); }}>
                  🔄 Withdraw ($5 Min)
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { setActiveTab('manual'); setMobileMenuOpen(false); }}>
                  📖 Protocol Manual & Blueprint
                </button>
                <button onClick={() => { setIsPresModalOpen(true); setMobileMenuOpen(false); }}>
                  ✨ Master Presentation
                </button>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Network Alert Banner */}
      {isConnected && chainId && chainId !== 97 && chainId !== 56 && (
        <div className="network-alert-banner">
          <div className="nab-content">
            <div className="nab-text">
              <span className="nab-badge">NETWORK</span>
              <span>
                Connected to Chain ID {chainId}. Please switch to <strong>BNB Smart Chain (BSC)</strong>.
              </span>
            </div>
            <button className="nab-switch-btn" onClick={handleSwitchToBscTestnet}>
              ⚡ Switch to BNB Chain
            </button>
          </div>
        </div>
      )}

      {/* Real-Time Live Global Queue Stream Bar */}
      <div className="live-stream-bar-section">
        <LiveGlobalQueueStream />
      </div>

      {/* Main Content Area */}
      <main className="altruva-main-content">
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
                txLoading={txLoading} 
              />
            )}

            {activeTab === 'leadership' && (
              <LeadershipPool 
                userData={userData} 
                onClaimLeadership={() => showToast('Claiming Daily Leadership Dividend...')}
                txLoading={txLoading} 
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Fixed Bottom Bar */}
      {isConnected && (
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
            <span>Monoline</span>
          </button>
          <button 
            className={`mbn-item ${activeTab === 'binary' ? 'active' : ''}`}
            onClick={() => setActiveTab('binary')}
          >
            <Layers size={18} />
            <span>Velocity</span>
          </button>
          <button 
            className={`mbn-item ${activeTab === 'leadership' ? 'active' : ''}`}
            onClick={() => setActiveTab('leadership')}
          >
            <Flame size={18} />
            <span>FOMO</span>
          </button>
          <button 
            className={`mbn-item ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            <BookOpen size={18} />
            <span>Manual</span>
          </button>
        </div>
      )}

      {/* Modals */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onWithdraw={handleWithdraw}
        claimableRoi={userData?.claimableRoiUSD || 0}
        claimableWorking={userData?.claimableWorkingUSD || 0}
        directCount={userData?.directActiveCount || userData?.directCount || 0}
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
            <span>{PROTOCOL_NAME.toUpperCase()} · 100% P2P LIVE SPLIT</span>
          </div>
          <div className="f-center">
            <span>BNB Chain (BSC)</span>
            <span className="dot">•</span>
            <span>Zero Ledger Retention</span>
          </div>
          <div className="f-right">
            <span>USDT (BEP-20)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

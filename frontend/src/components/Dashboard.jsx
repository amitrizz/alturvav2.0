import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, Users, Award, Gift, ArrowUpRight, Copy, Check, 
  ExternalLink, Sparkles, RefreshCw, Layers, ShieldCheck, ChevronRight, 
  Clock, AlertTriangle, Flame, Zap, Lock, Unlock, PlayCircle 
} from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';
import { PROTOCOL_PACKAGES, LEADER_MECHANISMS, WITHDRAWAL_RULES } from '../planConfig';

export default function Dashboard({
  address,
  isConnected,
  usdtBalance,
  userData,
  openLevels,
  onOpenWithdraw,
  onBuyPackage,
  txLoading,
  onNavigateTab,
  showToast
}) {
  const [selectedPkg, setSelectedPkg] = useState(100);
  const [sponsorInput, setSponsorInput] = useState('');
  const [copied, setCopied] = useState(false);

  // 10-Minute Ghost Position Timer (09:59 Reverse Countdown)
  const [ghostSeconds, setGhostSeconds] = useState(599); // 9m 59s
  const [incomingTurnover, setIncomingTurnover] = useState(2450);

  useEffect(() => {
    const timer = setInterval(() => {
      setGhostSeconds(prev => (prev > 0 ? prev - 1 : 0));
      if (Math.random() > 0.6) {
        setIncomingTurnover(prev => prev + Math.floor(Math.random() * 100 + 25));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const referralUrl = typeof window !== 'undefined' && address 
    ? `${window.location.origin}/?ref=${address}` 
    : 'https://sovereign.protocol/?ref=0x000...';

  const copyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    showToast('Direct sponsor link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const isRegistered = userData && userData.registered;
  const activePkg = Number(userData?.activePackageUSD || userData?.totalPackageUSD || 0);
  const totalEarned = Number(userData?.totalEarnedUSD || 0);
  const hardCap3X = activePkg * 3;
  const hardCapPercent = hardCap3X > 0 ? Math.min(100, (totalEarned / hardCap3X) * 100) : 0;

  const directs = Number(userData?.directActiveCount || userData?.directCount || 0);
  const isWorkingUnlocked = directs >= 3;

  // Quantum ROI state
  const claimableRoi = Number(userData?.claimableRoiUSD || 0);
  const claimableWorking = Number(userData?.claimableWorkingUSD || userData?.claimableEarnings || 0);
  const totalClaimable = claimableRoi + claimableWorking;

  return (
    <div className="dashboard-wrap">
      {/* 10-Minute Ghost Position FOMO Banner (Visible if fresh account or wallet not yet active) */}
      {!isRegistered && (
        <div className="ghost-position-banner glass-panel">
          <div className="gpb-left">
            <div className="gpb-icon-box">
              <Clock size={28} className="gold pulse" />
            </div>
            <div className="gpb-text">
              <div className="gpb-badge-row">
                <span className="gpb-badge">10-MINUTE GHOST POSITION RESERVED</span>
                <span className="gpb-warning">ACTION REQUIRED</span>
              </div>
              <h3>Temporary Global Monoline Position Locked!</h3>
              <p>
                Your position in the Global Single Leg is temporarily held. 
                Incoming global participants are queuing underneath you!
              </p>
              <div className="gpb-live-queue">
                <span>Live Incoming Turnover: <strong className="green-txt">+${incomingTurnover.toLocaleString()} USDT</strong></span>
                <span className="dot">•</span>
                <span>Queuing Behind You: <strong className="cyan-gradient-text">14 Global Wallets</strong></span>
              </div>
            </div>
          </div>

          <div className="gpb-right">
            <span className="gpb-timer-lbl">SLOT DELETION COUNTDOWN</span>
            <div className="gpb-timer gold-gradient-text">
              {formatTimer(ghostSeconds)}
            </div>
            <button 
              className="gpb-activate-btn"
              onClick={() => {
                const el = document.getElementById('activation-box');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Zap size={16} /> Activate Before Deletion
            </button>
          </div>
        </div>
      )}

      {/* User Identity / Global Header */}
      <div className="user-id-bar glass-panel">
        <div className="id-left">
          <div className="global-badge">
            <span className="lbl">GLOBAL MONOLINE ID</span>
            <strong className="id-val cyan-gradient-text">
              #{userData?.globalIndex || (isConnected ? '104' : '---')}
            </strong>
          </div>
          <div className="user-meta">
            <span className="addr-txt">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet Not Connected'}
            </span>
            <span className={`status-pill ${isRegistered ? 'active' : 'inactive'}`}>
              {isRegistered ? '● Active Sovereign Node' : '○ Ghost Position Reserved'}
            </span>
            {userData?.isVipFastTrack && (
              <span className="vip-tag gold-gradient-text">★ VIP FAST-TRACK SLOT</span>
            )}
          </div>
        </div>

        <div className="ref-link-box">
          <span className="ref-lbl">YOUR DIRECT SPONSOR LINK (13% DIRECT COMMISSION)</span>
          <div className="ref-input-group">
            <input type="text" readOnly value={referralUrl} />
            <button className="copy-btn" onClick={copyReferral}>
              {copied ? <Check size={16} className="green" /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* 300% (3X) Hard-Cap Earning Gauge Bar */}
      {isRegistered && (
        <div className="hardcap-gauge-card glass-panel">
          <div className="hc-header">
            <div className="hc-title-box">
              <span className="hc-pill gold-gradient-text">ZERO-LEAK SAFEGUARD</span>
              <h4>300% (3X) HARD-CAP & RE-BIRTH ENGINE</h4>
            </div>
            <div className="hc-stats">
              <span>Earned: <strong>${totalEarned.toFixed(2)}</strong> / ${hardCap3X.toFixed(2)} USDT</span>
              <span className="gold-gradient-text">({hardCapPercent.toFixed(1)}%)</span>
            </div>
          </div>
          <div className="hc-progress-track">
            <div className="hc-progress-bar" style={{ width: `${hardCapPercent}%` }}></div>
          </div>
          <div className="hc-footer">
            <small>
              Upon reaching 300% ($ {hardCap3X} USDT), your ID is retired and an automatic <strong>Re-Birth ID</strong> spawns at the bottom of the Global Monoline.
            </small>
            {userData?.isHardCapped && (
              <span className="cap-reached-alert"><AlertTriangle size={14} /> 3X Cap Reached: Re-Birth Ready</span>
            )}
          </div>
        </div>
      )}

      {/* Financials & Balances Grid */}
      <div className="stats-grid">
        {/* Card 1: Total Available Earnings */}
        <div className="stat-card glass-panel highlight-card">
          <div className="stat-top">
            <span className="stat-label">TOTAL CLAIMABLE USDT</span>
            <span className="stat-icon cyan-glow"><Wallet size={20} /></span>
          </div>
          <div className="stat-value-row">
            <strong className="stat-amount cyan-gradient-text">
              ${totalClaimable.toFixed(2)}
            </strong>
            <span className="stat-cur">USDT</span>
          </div>
          <div className="balance-breakdown-sub">
            <span>ROI Vault (Unlocked): <strong>${claimableRoi.toFixed(2)}</strong></span>
            <span>Working (3 Directs Req): <strong>${claimableWorking.toFixed(2)}</strong></span>
          </div>
          <div className="stat-action-row">
            <button 
              className="quick-withdraw-btn"
              onClick={onOpenWithdraw}
              disabled={totalClaimable < 5}
            >
              <RefreshCw size={14} /> Withdraw ($5 Min)
            </button>
          </div>
        </div>

        {/* Card 2: Active Package Tier */}
        <div className="stat-card glass-panel">
          <div className="stat-top">
            <span className="stat-label">ACTIVE PACKAGE TIER</span>
            <span className="stat-icon gold-glow"><Layers size={20} /></span>
          </div>
          <div className="stat-value-row">
            <strong className="stat-amount gold-gradient-text">
              ${activePkg.toFixed(0)}
            </strong>
            <span className="stat-cur">USDT</span>
          </div>
          <div className="stat-sub-info">
            <span>Monoline Reach: <strong>15 UP + 15 DOWN (30%)</strong></span>
            <small>Dynamic Compression Active (Skips Inactive IDs)</small>
          </div>
        </div>

        {/* Card 3: Quantum ROI Status */}
        <div className="stat-card glass-panel">
          <div className="stat-top">
            <span className="stat-label">TIME-BOMB QUANTUM ROI</span>
            <span className="stat-icon cyan-glow"><Flame size={20} /></span>
          </div>
          <div className="stat-value-row">
            <strong className="stat-amount green-txt">
              3.0% DAILY
            </strong>
            <span className="stat-cur">BOOSTED</span>
          </div>
          <div className="stat-sub-info">
            <span>Passive Yield Cap: <strong>2X (${(activePkg * 2).toFixed(0)} USDT)</strong></span>
            <small>Sponsor 1 Direct to reset 3% daily for 10 days!</small>
          </div>
        </div>

        {/* Card 4: Team & Working Status */}
        <div className="stat-card glass-panel">
          <div className="stat-top">
            <span className="stat-label">DIRECT REFERRALS</span>
            <span className="stat-icon gold-glow"><Users size={20} /></span>
          </div>
          <div className="stat-value-row">
            <strong className="stat-amount gold-gradient-text">
              {directs}
            </strong>
            <span className="stat-cur">Active Directs</span>
          </div>
          <div className="stat-sub-info">
            <div className="lock-status-pill">
              {isWorkingUnlocked ? (
                <span className="green-txt"><Unlock size={12} /> Working Ledger Unlocked</span>
              ) : (
                <span className="yellow-txt"><Lock size={12} /> Need {3 - directs} more for Working Withdrawal</span>
              )}
            </div>
            <small>Level 1 Pays 13% Fixed Commission</small>
          </div>
        </div>
      </div>

      {/* 72H Alpha Cashback Surge Mission Box */}
      <div className="cashback-mission-card glass-panel">
        <div className="cm-left">
          <div className="cm-badge-row">
            <span className="cm-badge gold"><Gift size={14} /> 72H ALPHA CASHBACK SURGE</span>
            <span className="cm-pill cyan-gradient-text">100% JOINING FEE REFUND MISSION</span>
          </div>
          <h3>Sponsor 3 Direct Active Members within 72 Hours</h3>
          <p>
            Complete this mission within 72 hours of your package activation to receive an immediate 
            <strong>100% refund of your joining fee (${activePkg || selectedPkg} USDT)</strong>!
          </p>
          <div className="cm-progress-row">
            <div className="cm-dots">
              <span className={`cm-dot ${directs >= 1 ? 'done' : ''}`}>1</span>
              <span className={`cm-dot ${directs >= 2 ? 'done' : ''}`}>2</span>
              <span className={`cm-dot ${directs >= 3 ? 'done' : ''}`}>3</span>
            </div>
            <span className="cm-status-txt">
              {directs >= 3 ? '🎉 Mission Accomplished! 100% Refund Claimable' : `${directs}/3 Directs Verified`}
            </span>
          </div>
        </div>
        <div className="cm-right">
          <span className="cm-timer-lbl">MISSION WINDOW</span>
          <strong className="cm-timer cyan-gradient-text">72:00:00</strong>
          <small className="cm-note">Unclaimed funds roll into Community Airdrop Pool</small>
        </div>
      </div>

      {/* Package Activation / Upgrade Section */}
      <div id="activation-box" className="activation-section glass-panel">
        <div className="sec-header">
          <div className="sec-title-box">
            <AltruvaLogo size={28} />
            <div>
              <h3>{isRegistered ? 'Upgrade / Top-Up Active Package' : 'Activate Sovereign Community Package'}</h3>
              <p>100% USDT (BEP-20) P2P Live Split. Unlocks 15 Up + 15 Down Monoline and 2X ROI Cap.</p>
            </div>
          </div>
          <div className="wallet-bal-pill">
            <span>Wallet USDT:</span> <strong>${Number(usdtBalance || 0).toFixed(2)}</strong>
          </div>
        </div>

        {/* 6 Preset Packages */}
        <div className="preset-pkgs-grid">
          {PROTOCOL_PACKAGES.map(pkg => (
            <div 
              key={pkg.val}
              className={`preset-pkg-card glass-panel ${selectedPkg === pkg.val ? 'selected' : ''}`}
              onClick={() => setSelectedPkg(pkg.val)}
            >
              <div className="pkg-card-top">
                <span className="p-tag">{pkg.tier}</span>
                <span className="p-price gold-gradient-text">${pkg.val} USDT</span>
              </div>
              <strong className="p-levels">{pkg.monolineReach}</strong>
              <small className="p-perks">2X ROI: ${pkg.roiCap} | 3X Cap: ${pkg.hardCap3X}</small>
            </div>
          ))}
        </div>

        {/* Sponsor input for fresh registration */}
        {!isRegistered && (
          <div className="reg-inputs-row">
            <div className="input-group full-width">
              <label>Direct Sponsor Address (Receives 13% Instant Commission):</label>
              <input 
                type="text" 
                placeholder="0x... (Defaults to Genesis Apex Master #1 if empty)"
                value={sponsorInput}
                onChange={e => setSponsorInput(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Buy / Activate Button */}
        <div className="activation-submit-row">
          <button 
            className="activate-btn"
            onClick={() => onBuyPackage(selectedPkg, sponsorInput, 0)}
            disabled={txLoading || selectedPkg < 25}
          >
            {txLoading ? (
              <span>Processing Transaction on BNB Chain...</span>
            ) : (
              <span>
                {isRegistered ? `Upgrade to $${selectedPkg} USDT Package` : `Activate $${selectedPkg} Sovereign Package`} ➔
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

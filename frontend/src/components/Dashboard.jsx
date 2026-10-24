import React, { useState } from 'react';
import { 
  Wallet, TrendingUp, Users, Award, Gift, ArrowUpRight, Copy, Check, 
  ExternalLink, Sparkles, RefreshCw, Layers, ShieldCheck, ChevronRight 
} from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';

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
  const [selectedPkg, setSelectedPkg] = useState(50);
  const [sponsorInput, setSponsorInput] = useState('');
  const [preferredLeg, setPreferredLeg] = useState(0); // 0=Left, 1=Right, 2=Auto
  const [copied, setCopied] = useState(false);

  const referralUrl = typeof window !== 'undefined' && address 
    ? `${window.location.origin}/?ref=${address}` 
    : 'https://altruva.live/?ref=0x000...';

  const copyReferral = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    showToast('Referral link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const isRegistered = userData && userData.registered;

  return (
    <div className="dashboard-wrap">
      {/* User Identity / Global Header */}
      <div className="user-id-bar glass-panel">
        <div className="id-left">
          <div className="global-badge">
            <span className="lbl">GLOBAL SINGLE LEG ID</span>
            <strong className="id-val cyan-gradient-text">
              #{userData?.globalIndex || (isConnected ? '104' : '---')}
            </strong>
          </div>
          <div className="user-meta">
            <span className="addr-txt">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Wallet Not Connected'}
            </span>
            <span className={`status-pill ${isRegistered ? 'active' : 'inactive'}`}>
              {isRegistered ? '● Active Member' : '○ Fresh Account'}
            </span>
          </div>
        </div>

        <div className="ref-link-box">
          <span className="ref-lbl">YOUR DIRECT SPONSOR LINK</span>
          <div className="ref-input-group">
            <input type="text" readOnly value={referralUrl} />
            <button className="copy-btn" onClick={copyReferral}>
              {copied ? <Check size={16} className="green" /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Financials & Balances Grid */}
      <div className="stats-grid">
        {/* Card 1: Claimable Balance */}
        <div className="stat-card glass-panel highlight-card">
          <div className="stat-top">
            <span className="stat-label">AVAILABLE USDT EARNINGS</span>
            <span className="stat-icon cyan-glow"><Wallet size={20} /></span>
          </div>
          <div className="stat-value-row">
            <strong className="stat-amount cyan-gradient-text">
              ${Number(userData?.claimableEarnings || 0).toFixed(2)}
            </strong>
            <span className="stat-cur">USDT</span>
          </div>
          <div className="stat-action-row">
            <button 
              className="quick-withdraw-btn"
              onClick={onOpenWithdraw}
              disabled={Number(userData?.claimableEarnings || 0) <= 0}
            >
              <RefreshCw size={14} /> Withdraw & Re-Invest
            </button>
          </div>
        </div>

        {/* Card 2: Active Package & Open Levels */}
        <div className="stat-card glass-panel">
          <div className="stat-top">
            <span className="stat-label">ACTIVE PACKAGE TIER</span>
            <span className="stat-icon gold-glow"><Layers size={20} /></span>
          </div>
          <div className="stat-value-row">
            <strong className="stat-amount gold-gradient-text">
              ${Number(userData?.totalPackageUSD || 0).toFixed(0)}
            </strong>
            <span className="stat-cur">USDT</span>
          </div>
          <div className="stat-sub-info">
            <span>Open Single Leg Reach: <strong>{openLevels.totalLevels || 30} Levels</strong></span>
            <small>({openLevels.halfLevels || 15} UP + {openLevels.halfLevels || 15} DOWN)</small>
          </div>
        </div>

        {/* Card 3: Total Income */}
        <div className="stat-card glass-panel">
          <div className="stat-top">
            <span className="stat-label">CUMULATIVE EARNINGS</span>
            <span className="stat-icon gold-glow"><TrendingUp size={20} /></span>
          </div>
          <div className="stat-value-row">
            <strong className="stat-amount">
              ${Number(userData?.totalEarnedUSD || 0).toFixed(2)}
            </strong>
            <span className="stat-cur">USDT</span>
          </div>
          <div className="stat-sub-info">
            <span>Transferred to Wallet: ${Number(userData?.totalWithdrawnUSD || 0).toFixed(2)}</span>
            <span>Auto Re-invested: ${Number(userData?.selfReinvestUSD || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Card 4: Team & Referrals */}
        <div className="stat-card glass-panel">
          <div className="stat-top">
            <span className="stat-label">COMMUNITY TEAM</span>
            <span className="stat-icon cyan-glow"><Users size={20} /></span>
          </div>
          <div className="stat-value-row">
            <strong className="stat-amount cyan-gradient-text">
              {userData?.directCount || 0}
            </strong>
            <span className="stat-cur">Directs</span>
          </div>
          <div className="stat-sub-info">
            <span>Active Directs: <strong>{userData?.directActiveCount || 0}</strong></span>
            <span>Binary Matching: <strong>${Number(userData?.matchedVolume || 0).toFixed(0)}</strong></span>
          </div>
        </div>
      </div>

      {/* Package Activation / Upgrade Section */}
      <div className="activation-section glass-panel">
        <div className="sec-header">
          <div className="sec-title-box">
            <AltruvaLogo size={28} />
            <div>
              <h3>{isRegistered ? 'Upgrade / Top-Up Active Package' : 'Activate Community Package'}</h3>
              <p>100% USDT BEP-20 Payment. Instantly unlocks global single leg depth and scratch coupons.</p>
            </div>
          </div>
          <div className="wallet-bal-pill">
            <span>Wallet USDT:</span> <strong>${Number(usdtBalance || 0).toFixed(2)}</strong>
          </div>
        </div>

        {/* Preset Packages */}
        <div className="preset-pkgs-grid">
          {[
            { val: 25, tier: 'TIER 1', levels: '20 Levels (10 Up + 10 Down)', perks: '1% from 20 global single leg members' },
            { val: 50, tier: 'TIER 2 (POPULAR)', levels: '30 Levels (15 Up + 15 Down)', perks: '30 Levels + 1 Scratch Coupon + Nexus Rank Eligibility' },
            { val: 100, tier: 'TIER 3 (ELITE)', levels: '40 Levels (20 Up + 20 Down)', perks: 'Max 40 Levels + 2 Scratch Coupons + Legacy Crown Rank' },
            { val: 500, tier: 'LEADER $500', levels: '40 Levels + 2 Coupons', perks: 'Maximum Single Leg & High Volume Team Matching' },
            { val: 1000, tier: 'VIP $1,000', levels: '40 Levels + 2 Coupons', perks: 'VIP Leadership Pool & Accelerated Binary Growth' }
          ].map(pkg => (
            <div 
              key={pkg.val}
              className={`preset-pkg-card glass-panel ${selectedPkg === pkg.val ? 'selected' : ''}`}
              onClick={() => setSelectedPkg(pkg.val)}
            >
              <div className="pkg-card-top">
                <span className="p-tag">{pkg.tier}</span>
                <span className="p-price gold-gradient-text">${pkg.val} USDT</span>
              </div>
              <strong className="p-levels">{pkg.levels}</strong>
              <small className="p-perks">{pkg.perks}</small>
            </div>
          ))}
        </div>

        {/* Form controls (Sponsor & Preferred Leg) */}
        {!isRegistered && (
          <div className="reg-inputs-row">
            <div className="input-group">
              <label>Direct Sponsor / Referral Address:</label>
              <input 
                type="text" 
                placeholder="0x... (Defaults to Root Sponsor if empty)"
                value={sponsorInput}
                onChange={e => setSponsorInput(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Binary Placement Leg:</label>
              <select value={preferredLeg} onChange={e => setPreferredLeg(Number(e.target.value))}>
                <option value={0}>Left Team</option>
                <option value={1}>Right Team</option>
                <option value={2}>Auto-Balance (Recommended)</option>
              </select>
            </div>
          </div>
        )}

        {/* Buy / Activate Button */}
        <div className="activation-submit-row">
          <button 
            className="activate-btn"
            onClick={() => onBuyPackage(selectedPkg, sponsorInput, preferredLeg)}
            disabled={txLoading || selectedPkg < 25}
          >
            {txLoading ? (
              <>Approving & Activating ${selectedPkg} USDT...</>
            ) : (
              <>
                <ShieldCheck size={18} /> 
                {isRegistered ? `Upgrade with $${selectedPkg} USDT` : `Activate Package for $${selectedPkg} USDT`}
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5 Streams Quick Jump Section */}
      <div className="streams-navigation-grid">
        <div className="stream-nav-box glass-panel" onClick={() => onNavigateTab('singleLeg')}>
          <div className="sn-top">
            <span className="sn-badge">STREAM 1 (40%)</span>
            <ChevronRight size={16} />
          </div>
          <h4>Global Single Leg</h4>
          <p>40 levels chronological timeline. Earn 1% from uplines & downlines.</p>
        </div>

        <div className="stream-nav-box glass-panel" onClick={() => onNavigateTab('binary')}>
          <div className="sn-top">
            <span className="sn-badge gold">STREAM 2 & 3 (50%)</span>
            <ChevronRight size={16} />
          </div>
          <h4>Binary & 9 Levels</h4>
          <p>50:50 Team Performance matching + 9 working unilevel levels.</p>
        </div>

        <div className="stream-nav-box glass-panel" onClick={() => onNavigateTab('leadership')}>
          <div className="sn-top">
            <span className="sn-badge">STREAM 4 (5%)</span>
            <ChevronRight size={16} />
          </div>
          <h4>Leadership Ranks</h4>
          <p>Nexus (3%) & Legacy Crown (2%) daily pools with 50/50 carry forward.</p>
        </div>

        <div className="stream-nav-box glass-panel" onClick={() => onNavigateTab('scratch')}>
          <div className="sn-top">
            <span className="sn-badge gold">STREAM 5 (5%)</span>
            <ChevronRight size={16} />
          </div>
          <h4>Scratch & Win</h4>
          <p>Instant scratch cards & 250 winner jackpot pool ($1,000 top prize).</p>
        </div>
      </div>
    </div>
  );
}

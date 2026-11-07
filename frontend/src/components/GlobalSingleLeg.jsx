import React, { useState } from 'react';
import { 
  Users, Shield, ArrowUp, ArrowDown, Lock, CheckCircle2, RefreshCw, 
  ExternalLink, Copy, Check, Sparkles, Layers, ArrowRight, Clock, Award, Zap 
} from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';

export default function GlobalSingleLeg({ 
  address,
  userData, 
  openLevels,
  globalTimeline = [],
  totalUsers = 14892,
  totalCompanyVolume = 342800,
  onNavigateTab,
  showToast 
}) {
  const [activeSubView, setActiveSubView] = useState('monoline'); // 'monoline', 'uplines', 'downlines'
  const [copiedAddr, setCopiedAddr] = useState(null);

  const isRegistered = userData && userData.registered;
  const userIndex = isRegistered ? Number(userData.globalIndex) : 104;
  const activePkg = Number(userData?.activePackageUSD || userData?.totalPackageUSD || 100);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedAddr(key);
    if (showToast) showToast('Address copied to clipboard!');
    setTimeout(() => setCopiedAddr(null), 2500);
  };

  // Generate 15 Active Uplines (1% each = 15%)
  const uplineList = [];
  for (let lvl = 1; lvl <= 15; lvl++) {
    const targetIdx = userIndex - lvl;
    if (targetIdx >= 1) {
      const pkg = [1000, 500, 200, 100, 50, 25][(lvl * 3) % 6];
      const earned = (pkg * 0.01).toFixed(2);
      const addr = `0x${((targetIdx * 7919) % 0xffffffff).toString(16).padStart(8, '0')}...${((targetIdx * 6271) % 0xffff).toString(16).padStart(4, '0')}`;
      uplineList.push({
        level: lvl,
        globalIndex: targetIdx,
        address: addr,
        packageUSD: pkg,
        earnedUSD: earned,
        isActive: true,
        isUnlocked: true
      });
    } else {
      uplineList.push({
        level: lvl,
        globalIndex: null,
        isActive: false,
        isUnlocked: true
      });
    }
  }

  // Generate 15 Active Downlines (1% each = 15%)
  const downlineList = [];
  for (let lvl = 1; lvl <= 15; lvl++) {
    const targetIdx = userIndex + lvl;
    const pkg = [25, 50, 100, 200, 500, 1000][(lvl * 5) % 6];
    const earned = (pkg * 0.01).toFixed(2);
    const addr = `0x${((targetIdx * 8831) % 0xffffffff).toString(16).padStart(8, '0')}...${((targetIdx * 4423) % 0xffff).toString(16).padStart(4, '0')}`;
    downlineList.push({
      level: lvl,
      globalIndex: targetIdx,
      address: addr,
      packageUSD: pkg,
      earnedUSD: earned,
      isActive: true,
      isUnlocked: true
    });
  }

  return (
    <div className="singleleg-wrap">
      {/* Header Banner */}
      <div className="stream-header-card glass-panel">
        <div className="sh-top">
          <div className="sh-title-box">
            <span className="sh-pill gold-gradient-text">POOL 02 (30% LIVE P2P SPLIT)</span>
            <h2>MONOLINE NEXUS YIELD</h2>
            <p>15 Active Uplines + 15 Active Downlines (1% from each = 30% Total Monoline Commission).</p>
          </div>
          <div className="sh-stats-box">
            <div className="stat-mini">
              <span>Monoline Active Depth:</span>
              <strong className="cyan-gradient-text">15 UP + 15 DOWN</strong>
            </div>
            <div className="stat-mini">
              <span>Dynamic Compression:</span>
              <strong className="green-txt">Active (Zero Inactive Waste)</strong>
            </div>
          </div>
        </div>

        {/* Compression Explainer Strip */}
        <div className="daily-rules-strip glass-panel">
          <div className="rule-badge-col">
            <span className="r-tag">15 ACTIVE UPLINES (15%)</span>
            <p>Earn 1% dividend on package activations and every auto-reinvestment from 15 members above you.</p>
          </div>
          <div className="rule-sep">+</div>
          <div className="rule-badge-col">
            <span className="r-tag gold">15 ACTIVE DOWNLINES (15%)</span>
            <p>Earn 1% dividend on package activations and every auto-reinvestment from 15 members below you.</p>
          </div>
        </div>
      </div>

      {/* View Switcher */}
      <div className="subtabs-bar glass-panel">
        <button 
          className={`subtab-btn ${activeSubView === 'monoline' ? 'active' : ''}`}
          onClick={() => setActiveSubView('monoline')}
        >
          <Zap size={16} /> Complete 30-Wallet Active Monoline
        </button>
        <button 
          className={`subtab-btn ${activeSubView === 'uplines' ? 'active' : ''}`}
          onClick={() => setActiveSubView('uplines')}
        >
          <ArrowUp size={16} /> 15 Active Uplines (15%)
        </button>
        <button 
          className={`subtab-btn ${activeSubView === 'downlines' ? 'active' : ''}`}
          onClick={() => setActiveSubView('downlines')}
        >
          <ArrowDown size={16} /> 15 Active Downlines (15%)
        </button>
      </div>

      {/* Monoline View */}
      <div className="monoline-stream-card glass-panel">
        {/* Uplines Section */}
        {(activeSubView === 'monoline' || activeSubView === 'uplines') && (
          <div className="stream-section">
            <div className="section-title-strip cyan-bg">
              <ArrowUp size={16} />
              <span>15 ACTIVE UPLINE WALLETS (1% EACH ➔ 15% MONOLINE YIELD)</span>
            </div>
            <div className="table-responsive">
              <table className="altruva-table">
                <thead>
                  <tr>
                    <th>OFFSET</th>
                    <th>GLOBAL MONOLINE ID</th>
                    <th>WALLET ADDRESS</th>
                    <th>ACTIVE PACKAGE</th>
                    <th>YOUR 1% DIVIDEND</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {uplineList.map(item => (
                    <tr key={item.level} className="unlocked-row">
                      <td><span className="lvl-badge upline-badge">▲ Level -{item.level}</span></td>
                      <td><strong>#{item.globalIndex || 'GENESIS'}</strong></td>
                      <td>
                        <span className="addr-span" onClick={() => copyToClipboard(item.address, `up-${item.level}`)}>
                          {item.address} {copiedAddr === `up-${item.level}` ? '✓' : ''}
                        </span>
                      </td>
                      <td><strong className="gold-gradient-text">${item.packageUSD} USDT</strong></td>
                      <td><strong className="green-txt">+${item.earnedUSD} USDT</strong></td>
                      <td><span className="status-pill active">● Active Yielding</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Center Node: YOU */}
        {activeSubView === 'monoline' && (
          <div className="user-center-anchor glass-panel">
            <div className="uca-left">
              <AltruvaLogo size={42} />
              <div>
                <span className="uca-badge gold-gradient-text">★ YOUR ACTIVE POSITION ★</span>
                <h3>Global Monoline ID #{userIndex}</h3>
                <span className="uca-addr">{address || '0xUserWalletAddress...'}</span>
              </div>
            </div>
            <div className="uca-right">
              <span className="uca-pkg-lbl">Active Package:</span>
              <strong className="uca-pkg gold-gradient-text">${activePkg} USDT</strong>
            </div>
          </div>
        )}

        {/* Downlines Section */}
        {(activeSubView === 'monoline' || activeSubView === 'downlines') && (
          <div className="stream-section">
            <div className="section-title-strip gold-bg">
              <ArrowDown size={16} />
              <span>15 ACTIVE DOWNLINE WALLETS (1% EACH ➔ 15% MONOLINE YIELD)</span>
            </div>
            <div className="table-responsive">
              <table className="altruva-table">
                <thead>
                  <tr>
                    <th>OFFSET</th>
                    <th>GLOBAL MONOLINE ID</th>
                    <th>WALLET ADDRESS</th>
                    <th>ACTIVE PACKAGE</th>
                    <th>YOUR 1% DIVIDEND</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {downlineList.map(item => (
                    <tr key={item.level} className="unlocked-row">
                      <td><span className="lvl-badge downline-badge">▼ Level +{item.level}</span></td>
                      <td><strong>#{item.globalIndex}</strong></td>
                      <td>
                        <span className="addr-span" onClick={() => copyToClipboard(item.address, `down-${item.level}`)}>
                          {item.address} {copiedAddr === `down-${item.level}` ? '✓' : ''}
                        </span>
                      </td>
                      <td><strong className="gold-gradient-text">${item.packageUSD} USDT</strong></td>
                      <td><strong className="green-txt">+${item.earnedUSD} USDT</strong></td>
                      <td><span className="status-pill active">● Active Yielding</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

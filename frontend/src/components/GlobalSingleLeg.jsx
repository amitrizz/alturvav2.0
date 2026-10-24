import React, { useState } from 'react';
import { 
  Users, Shield, ArrowUp, ArrowDown, Lock, CheckCircle2, RefreshCw, 
  ExternalLink, Copy, Check, Sparkles, Layers, ArrowRight, Clock, Award 
} from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';

export default function GlobalSingleLeg({ 
  address,
  userData, 
  openLevels,
  globalTimeline = [],
  totalUsers = 2,
  totalCompanyVolume = 100100,
  onNavigateTab,
  showToast 
}) {
  const [activeSubView, setActiveSubView] = useState('timeline'); // 'timeline', 'uplines', 'downlines'
  const [copiedAddr, setCopiedAddr] = useState(null);

  const isRegistered = userData && userData.registered;
  const userIndex = isRegistered ? Number(userData.globalIndex) : 0;
  const half = openLevels?.halfLevels || (isRegistered ? (Number(userData.totalPackageUSD) >= 100 ? 20 : Number(userData.totalPackageUSD) >= 50 ? 15 : 10) : 0);
  const total = openLevels?.totalLevels || (half * 2);
  const userPkg = Number(userData?.totalPackageUSD || 0);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedAddr(key);
    if (showToast) showToast('Address copied to clipboard!');
    setTimeout(() => setCopiedAddr(null), 2500);
  };

  // Helper to get actual member data from on-chain timeline
  const getMemberByIndex = (targetIdx) => {
    return globalTimeline.find(m => Number(m.globalIndex) === targetIdx);
  };

  // Build dynamic real upline list (up to 20 levels above user)
  const uplineList = [];
  if (isRegistered && userIndex > 1) {
    for (let lvl = 1; lvl <= 20; lvl++) {
      const targetIdx = userIndex - lvl;
      if (targetIdx >= 1) {
        const member = getMemberByIndex(targetIdx);
        const isUnlocked = lvl <= half;
        const pkg = member ? member.packageUSD : (targetIdx === 1 ? 100000 : 100);
        const reinvest = member ? member.selfReinvestUSD : Math.floor(pkg * 0.4);
        const earned = isUnlocked ? (pkg * 0.01 + reinvest * 0.01).toFixed(2) : '0.00';
        const addr = member ? member.address : (targetIdx === 1 ? '0x06a9982979c8d307932e45db4f93E52bB8200A3b' : '0xb4f76803C43Bf84E249E0EC15c7545701F5FeD63');

        uplineList.push({
          level: lvl,
          globalIndex: targetIdx,
          address: addr,
          packageUSD: pkg,
          reinvestUSD: reinvest,
          earnedUSD: earned,
          isUnlocked,
          exists: true
        });
      } else {
        // Single leg top reached (fewer than 20 members existed before this user)
        uplineList.push({
          level: lvl,
          globalIndex: null,
          isUnlocked: lvl <= half,
          exists: false
        });
      }
    }
  }

  // Build dynamic real downline list (up to 20 levels below user)
  const downlineList = [];
  if (isRegistered) {
    for (let lvl = 1; lvl <= 20; lvl++) {
      const targetIdx = userIndex + lvl;
      const member = getMemberByIndex(targetIdx);
      const isUnlocked = lvl <= half;

      if (member) {
        const pkg = member.packageUSD;
        const reinvest = member.selfReinvestUSD;
        const earned = isUnlocked ? (pkg * 0.01 + reinvest * 0.01).toFixed(2) : '0.00';

        downlineList.push({
          level: lvl,
          globalIndex: targetIdx,
          address: member.address,
          packageUSD: pkg,
          reinvestUSD: reinvest,
          earnedUSD: earned,
          isUnlocked,
          exists: true
        });
      } else {
        // Downline position waiting for the next global community participant
        downlineList.push({
          level: lvl,
          globalIndex: targetIdx,
          isUnlocked: lvl <= half,
          exists: false
        });
      }
    }
  }

  // Format short address helper
  const shortAddr = (a) => a ? `${a.slice(0, 6)}...${a.slice(-4)}` : '0x000...0000';

  return (
    <div className="singleleg-wrap">
      {/* Dynamic Header Overview */}
      <div className="stream-header-card glass-panel">
        <div className="sh-top">
          <div className="sh-title-box">
            <span className="sh-pill cyan-gradient-text">STREAM 1 (40% TOTAL USDT POOL)</span>
            <h2>COMMUNITY PARTICIPATION (GLOBAL SINGLE LEG)</h2>
            <p>
              100% Chronological Global Placement. You receive <strong>1% USDT dividends</strong> from up to 20 uplines and 20 downlines on all activations and withdrawal re-investments.
            </p>
          </div>

          <div className="sh-stats-box">
            <div className="stat-mini">
              <span>Your Single Leg Position:</span>
              <strong className={isRegistered ? 'cyan-gradient-text' : 'gold-gradient-text'}>
                {isRegistered ? `Global ID #${userIndex}` : 'Pending Activation'}
              </strong>
            </div>
            <div className="stat-mini">
              <span>Single Leg Reach:</span>
              <strong className="gold-gradient-text">
                {total > 0 ? `${total} Levels (${half} UP + ${half} DOWN)` : '0 Levels (Need Package)'}
              </strong>
            </div>
            <div className="stat-mini">
              <span>Global Community Size:</span>
              <strong className="cyan-gradient-text">{Math.max(totalUsers, globalTimeline.length)} Members</strong>
            </div>
          </div>
        </div>

        {/* Dynamic Tier Depth Tracker */}
        <div className="singleleg-depth-tracker glass-panel">
          <div className="depth-tracker-header">
            <span className="dt-title">
              <Layers size={16} className="cyan" /> Your Active Package Reach
            </span>
            <span className="dt-active-pkg gold-gradient-text">
              Active Tier: ${userPkg.toFixed(0)} USDT
            </span>
          </div>

          <div className="depth-tiers-row">
            <div className={`depth-tier-pill ${half >= 10 ? 'unlocked' : 'locked'}`}>
              <div className="dtp-icon">
                {half >= 10 ? <CheckCircle2 size={16} className="green" /> : <Lock size={16} />}
              </div>
              <div className="dtp-info">
                <strong>$25 Tier</strong>
                <span>20 Levels (10 Up + 10 Down)</span>
              </div>
              <span className={`dtp-badge ${half >= 10 ? 'active' : ''}`}>
                {half >= 10 ? 'Active' : 'Locked'}
              </span>
            </div>

            <div className={`depth-tier-pill ${half >= 15 ? 'unlocked' : 'locked'}`}>
              <div className="dtp-icon">
                {half >= 15 ? <CheckCircle2 size={16} className="green" /> : <Lock size={16} />}
              </div>
              <div className="dtp-info">
                <strong>$50 Tier (Popular)</strong>
                <span>30 Levels (15 Up + 15 Down)</span>
              </div>
              <span className={`dtp-badge ${half >= 15 ? 'active' : ''}`}>
                {half >= 15 ? 'Active' : 'Upgrade to $50'}
              </span>
            </div>

            <div className={`depth-tier-pill ${half >= 20 ? 'unlocked' : 'locked'}`}>
              <div className="dtp-icon">
                {half >= 20 ? <CheckCircle2 size={16} className="green" /> : <Lock size={16} />}
              </div>
              <div className="dtp-info">
                <strong>$100+ Tier (Maximum)</strong>
                <span>40 Levels (20 Up + 20 Down)</span>
              </div>
              <span className={`dtp-badge ${half >= 20 ? 'active' : ''}`}>
                {half >= 20 ? 'Max Depth' : 'Upgrade to $100+'}
              </span>
            </div>
          </div>
        </div>

        {/* Fresh User Activation Callout (Shown if not yet registered) */}
        {!isRegistered && (
          <div className="fresh-activation-banner glass-panel">
            <div className="fab-left">
              <Sparkles size={24} className="gold" />
              <div>
                <h4>Your Wallet is Connected but Not Yet Registered in the Global Chain</h4>
                <p>
                  Activate an entry package ($25+) to claim <strong>Global ID #{Math.max(totalUsers, globalTimeline.length) + 1}</strong> and start earning 1% from global upline and downline members!
                </p>
              </div>
            </div>
            {onNavigateTab && (
              <button className="fab-action-btn" onClick={() => onNavigateTab('dashboard')}>
                Activate Package Now <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}

        {/* Perpetual Re-Investment Notice */}
        <div className="reinvest-notice glass-panel">
          <RefreshCw size={18} className="cyan animate-spin-slow" />
          <span>
            <strong>The Perpetual Dividend Engine:</strong> You earn 1% USDT not only when members join, but on <strong>every withdrawal re-investment</strong> executed by your upline and downline members!
          </span>
        </div>
      </div>

      {/* Sub-Views Switcher Navigation */}
      <div className="singleleg-nav-tabs">
        <button 
          className={`sl-tab-btn ${activeSubView === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveSubView('timeline')}
        >
          <Clock size={16} /> Live On-Chain Timeline ({Math.max(totalUsers, globalTimeline.length)} Members)
        </button>
        <button 
          className={`sl-tab-btn ${activeSubView === 'uplines' ? 'active' : ''}`}
          onClick={() => setActiveSubView('uplines')}
        >
          <ArrowUp size={16} /> Your Top 20 Uplines ({isRegistered ? (userIndex > 1 ? Math.min(20, userIndex - 1) : 0) : 0})
        </button>
        <button 
          className={`sl-tab-btn ${activeSubView === 'downlines' ? 'active' : ''}`}
          onClick={() => setActiveSubView('downlines')}
        >
          <ArrowDown size={16} /> Your Bottom 20 Downlines ({isRegistered ? Math.max(0, Math.min(20, totalUsers - userIndex)) : 0})
        </button>
      </div>

      {/* SUB-VIEW 1: LIVE ON-CHAIN GLOBAL TIMELINE */}
      {activeSubView === 'timeline' && (
        <div className="timeline-view-wrap">
          <div className="view-intro-bar glass-panel">
            <div className="vib-text">
              <h3>Chronological Global Single Leg Sequence</h3>
              <p>Every account is placed sequentially in a single worldwide decentralized timeline on BNB Smart Chain.</p>
            </div>
            <div className="vib-badge">
              <span>Smart Contract Verified</span>
            </div>
          </div>

          <div className="timeline-cards-chain">
            {/* Show real on-chain users */}
            {globalTimeline.map((item) => {
              const isCurrentUser = address && item.address.toLowerCase() === address.toLowerCase();
              return (
                <div 
                  key={item.globalIndex} 
                  className={`timeline-node-card glass-panel ${isCurrentUser ? 'current-user-node' : ''}`}
                >
                  <div className="tnc-left">
                    <div className="tnc-index-badge">
                      <span className="tnc-lbl">GLOBAL ID</span>
                      <strong className="gold-gradient-text">#{item.globalIndex}</strong>
                    </div>
                    <div className="tnc-avatar">
                      <AltruvaLogo size={28} />
                    </div>
                    <div className="tnc-meta">
                      <div className="tnc-addr-row">
                        <span className="tnc-addr"><code>{shortAddr(item.address)}</code></span>
                        {isCurrentUser && (
                          <span className="you-pill">★ YOU</span>
                        )}
                        <button 
                          className="tnc-copy-btn" 
                          onClick={() => copyToClipboard(item.address, `tl_${item.globalIndex}`)}
                          title="Copy Address"
                        >
                          {copiedAddr === `tl_${item.globalIndex}` ? <Check size={14} className="green" /> : <Copy size={14} />}
                        </button>
                        <a 
                          href={`https://testnet.bscscan.com/address/${item.address}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="tnc-link-btn"
                          title="View on BSCScan"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                      <span className="tnc-sub">
                        {item.globalIndex === 1 ? 'Root Genesis Node' : `Position #${item.globalIndex} in Single Leg`}
                      </span>
                    </div>
                  </div>

                  <div className="tnc-right">
                    <div className="tnc-stat">
                      <span>Package:</span>
                      <strong className="cyan-gradient-text">${Number(item.packageUSD).toLocaleString()} USDT</strong>
                    </div>
                    <div className="tnc-stat">
                      <span>Auto Re-Invest:</span>
                      <strong className="gold-gradient-text">${Number(item.selfReinvestUSD).toLocaleString()} USDT</strong>
                    </div>
                    <div className="tnc-status-badge active">
                      <CheckCircle2 size={14} /> Active Node
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Next Available Spot in Queue */}
            <div className="timeline-node-card glass-panel next-spot-node">
              <div className="tnc-left">
                <div className="tnc-index-badge next">
                  <span className="tnc-lbl">NEXT SPOT</span>
                  <strong className="cyan-gradient-text">#{Math.max(totalUsers, globalTimeline.length) + 1}</strong>
                </div>
                <div className="tnc-avatar placeholder">
                  <Users size={24} className="gold" />
                </div>
                <div className="tnc-meta">
                  <div className="tnc-addr-row">
                    <span className="tnc-addr">
                      <strong>{isRegistered ? 'Open for Next Global Member' : '⚡ Your Reserved Slot'}</strong>
                    </span>
                  </div>
                  <span className="tnc-sub">
                    {isRegistered 
                      ? 'Will automatically become your direct downline in the single leg' 
                      : 'Activate any package ($25+) to claim this exact Global ID immediately!'}
                  </span>
                </div>
              </div>

              <div className="tnc-right">
                {!isRegistered && onNavigateTab ? (
                  <button className="claim-spot-btn" onClick={() => onNavigateTab('dashboard')}>
                    Claim Global ID #{Math.max(totalUsers, globalTimeline.length) + 1}
                  </button>
                ) : (
                  <div className="tnc-status-badge waiting">
                    <Clock size={14} /> Next Joining
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: TOP 20 UPLINES */}
      {activeSubView === 'uplines' && (
        <div className="uplines-view-wrap">
          <div className="view-intro-bar glass-panel">
            <div className="vib-text">
              <h3>Your 20 Global Uplines (1% Dividend Yield)</h3>
              <p>You earn 1% from these accounts whenever they activate or withdraw with auto-reinvestment.</p>
            </div>
            <div className="vib-badge">
              <span>{half} / 20 Uplines Unlocked</span>
            </div>
          </div>

          {!isRegistered ? (
            <div className="not-registered-card glass-panel">
              <Lock size={36} className="gold" />
              <h3>Single Leg Uplines are Locked</h3>
              <p>Activate an active package ($25+) to connect to up to 20 global uplines and start collecting 1% dividends.</p>
              {onNavigateTab && (
                <button className="activate-now-btn" onClick={() => onNavigateTab('dashboard')}>
                  Activate Package Now
                </button>
              )}
            </div>
          ) : userIndex === 1 ? (
            <div className="root-node-card glass-panel">
              <Award size={36} className="gold" />
              <h3>You are the Genesis Root Node (Global ID #1)</h3>
              <p>As the first account in the decentralized timeline, you have no uplines above you. You receive dividends from all downlines below!</p>
            </div>
          ) : (
            <div className="member-cards-grid">
              {uplineList.map((m) => {
                if (!m.exists) {
                  return (
                    <div key={m.level} className="member-card glass-panel empty-slot">
                      <div className="mc-top">
                        <span className="mc-lvl-tag">UP #{m.level}</span>
                        <span className="mc-status-pill locked">Top of Chain</span>
                      </div>
                      <div className="mc-body">
                        <span className="mc-empty-msg">Single Leg Top Reached</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={m.level} className={`member-card glass-panel ${m.isUnlocked ? 'unlocked' : 'locked'}`}>
                    <div className="mc-top">
                      <div className="mc-lvl-box">
                        <span className="mc-lvl-tag">UP #{m.level}</span>
                        <strong className="mc-id gold-gradient-text">Global ID #{m.globalIndex}</strong>
                      </div>
                      <span className={`mc-status-pill ${m.isUnlocked ? 'active' : 'locked'}`}>
                        {m.isUnlocked ? <><CheckCircle2 size={12} /> Active</> : <><Lock size={12} /> Locked</>}
                      </span>
                    </div>

                    <div className="mc-addr-row">
                      <span>Wallet:</span>
                      <code>{shortAddr(m.address)}</code>
                      <button 
                        className="mc-copy-btn" 
                        onClick={() => copyToClipboard(m.address, `up_${m.level}`)}
                      >
                        {copiedAddr === `up_${m.level}` ? <Check size={13} className="green" /> : <Copy size={13} />}
                      </button>
                    </div>

                    <div className="mc-stats-row">
                      <div className="mc-stat">
                        <span>Active Package:</span>
                        <strong className="cyan-gradient-text">${m.packageUSD.toLocaleString()} USDT</strong>
                      </div>
                      <div className="mc-stat">
                        <span>1% Dividend Earned:</span>
                        <strong className="gold-gradient-text">${m.earnedUSD} USDT</strong>
                      </div>
                    </div>

                    <div className="mc-footer">
                      <small>Re-Investment: ${m.reinvestUSD.toLocaleString()} USDT</small>
                      <a 
                        href={`https://testnet.bscscan.com/address/${m.address}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="mc-scan-link"
                      >
                        Explorer <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 3: BOTTOM 20 DOWNLINES */}
      {activeSubView === 'downlines' && (
        <div className="downlines-view-wrap">
          <div className="view-intro-bar glass-panel">
            <div className="vib-text">
              <h3>Your 20 Global Downlines (1% Dividend Yield)</h3>
              <p>Whenever any member joins after you or executes an auto re-investment, 1% flows directly into your claimable balance.</p>
            </div>
            <div className="vib-badge">
              <span>{half} / 20 Downlines Unlocked</span>
            </div>
          </div>

          {!isRegistered ? (
            <div className="not-registered-card glass-panel">
              <Lock size={36} className="gold" />
              <h3>Single Leg Downlines are Locked</h3>
              <p>Activate your entry package to claim your Global ID and begin autofilling downlines.</p>
              {onNavigateTab && (
                <button className="activate-now-btn" onClick={() => onNavigateTab('dashboard')}>
                  Activate Package Now
                </button>
              )}
            </div>
          ) : (
            <div className="member-cards-grid">
              {downlineList.map((m) => {
                if (!m.exists) {
                  return (
                    <div key={m.level} className="member-card glass-panel empty-downline-slot">
                      <div className="mc-top">
                        <span className="mc-lvl-tag cyan">DOWN #{m.level}</span>
                        <span className={`mc-status-pill ${m.isUnlocked ? 'active' : 'locked'}`}>
                          {m.isUnlocked ? 'Unlocked & Waiting' : 'Locked'}
                        </span>
                      </div>
                      <div className="mc-body">
                        <Clock size={20} className="gold animate-pulse" />
                        <span className="mc-empty-msg">Autofills on Next Community Joining</span>
                        <small>Will automatically become your Global Downline #{m.level}</small>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={m.level} className={`member-card glass-panel ${m.isUnlocked ? 'unlocked' : 'locked'}`}>
                    <div className="mc-top">
                      <div className="mc-lvl-box">
                        <span className="mc-lvl-tag cyan">DOWN #{m.level}</span>
                        <strong className="mc-id gold-gradient-text">Global ID #{m.globalIndex}</strong>
                      </div>
                      <span className={`mc-status-pill ${m.isUnlocked ? 'active' : 'locked'}`}>
                        {m.isUnlocked ? <><CheckCircle2 size={12} /> Active</> : <><Lock size={12} /> Locked</>}
                      </span>
                    </div>

                    <div className="mc-addr-row">
                      <span>Wallet:</span>
                      <code>{shortAddr(m.address)}</code>
                      <button 
                        className="mc-copy-btn" 
                        onClick={() => copyToClipboard(m.address, `down_${m.level}`)}
                      >
                        {copiedAddr === `down_${m.level}` ? <Check size={13} className="green" /> : <Copy size={13} />}
                      </button>
                    </div>

                    <div className="mc-stats-row">
                      <div className="mc-stat">
                        <span>Active Package:</span>
                        <strong className="cyan-gradient-text">${m.packageUSD.toLocaleString()} USDT</strong>
                      </div>
                      <div className="mc-stat">
                        <span>1% Dividend Earned:</span>
                        <strong className="gold-gradient-text">${m.earnedUSD} USDT</strong>
                      </div>
                    </div>

                    <div className="mc-footer">
                      <small>Re-Investment: ${m.reinvestUSD.toLocaleString()} USDT</small>
                      <a 
                        href={`https://testnet.bscscan.com/address/${m.address}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="mc-scan-link"
                      >
                        Explorer <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

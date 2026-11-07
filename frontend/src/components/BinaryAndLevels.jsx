import React, { useState } from 'react';
import { Layers, Users, TrendingUp, CheckCircle2, Lock, ArrowRight, Shield, Award, Zap } from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';

export default function BinaryAndLevels({ userData, txLoading }) {
  const [activeSubTab, setActiveSubTab] = useState('velocity'); // 'velocity' or 'override'

  const directCount = Number(userData?.directActiveCount || userData?.directCount || 0);

  // 9-Level Velocity Generation Matrix
  const levelsConfig = [
    { level: 1, pct: 13, reqDirects: 0, members: 4, vol: 2000, earned: 260, isUnlocked: true },
    { level: 2, pct: 3, reqDirects: 1, members: 12, vol: 6000, earned: 180, isUnlocked: directCount >= 1 },
    { level: 3, pct: 2, reqDirects: 1, members: 28, vol: 14000, earned: 280, isUnlocked: directCount >= 1 },
    { level: 4, pct: 1, reqDirects: 2, members: 64, vol: 32000, earned: 320, isUnlocked: directCount >= 2 },
    { level: 5, pct: 1, reqDirects: 2, members: 140, vol: 70000, earned: 700, isUnlocked: directCount >= 2 },
    { level: 6, pct: 1, reqDirects: 2, members: 320, vol: 160000, earned: 1600, isUnlocked: directCount >= 2 },
    { level: 7, pct: 1, reqDirects: 3, members: 650, vol: 325000, earned: 3250, isUnlocked: directCount >= 3 },
    { level: 8, pct: 1, reqDirects: 3, members: 1400, vol: 700000, earned: 7000, isUnlocked: directCount >= 3 },
    { level: 9, pct: 1, reqDirects: 3, members: 2900, vol: 1450000, earned: 14500, isUnlocked: directCount >= 3 }
  ];

  return (
    <div className="binary-levels-wrap">
      {/* Sub Tabs Toggle */}
      <div className="subtabs-bar glass-panel">
        <button 
          className={`subtab-btn ${activeSubTab === 'velocity' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('velocity')}
        >
          <Layers size={16} /> Stream 3: Velocity Multi-Tier (25% Generation)
        </button>
        <button 
          className={`subtab-btn ${activeSubTab === 'override' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('override')}
        >
          <Award size={16} /> Dynamic Infinity Override (5% – 10% Royalties)
        </button>
      </div>

      {/* STREAM 3: VELOCITY MULTI-TIER BONUS */}
      {activeSubTab === 'velocity' && (
        <div className="binary-tab-content">
          <div className="stream-header-card glass-panel">
            <div className="sh-top">
              <div className="sh-title-box">
                <span className="sh-pill gold-gradient-text">POOL 03 (25% LIVE P2P SPLIT)</span>
                <h2>VELOCITY MULTI-TIER BONUS</h2>
                <p>9-Level Generation unilevel commission with fixed 13% direct reward on Level 1.</p>
              </div>
              <div className="sh-stats-box">
                <div className="stat-mini">
                  <span>Level 1 Direct Rate:</span>
                  <strong className="gold-gradient-text">13% Fixed Instant</strong>
                </div>
                <div className="stat-mini">
                  <span>Your Active Directs:</span>
                  <strong className="cyan-gradient-text">{directCount} Directs Verified</strong>
                </div>
              </div>
            </div>

            {/* Direct Unlock Conditions Strip */}
            <div className="daily-rules-strip glass-panel">
              <div className="rule-badge-col">
                <span className="r-tag gold">0 DIRECTS</span>
                <p>Level 1 (13%) is unlocked immediately for ROI withdrawal.</p>
              </div>
              <div className="rule-sep">+</div>
              <div className="rule-badge-col">
                <span className="r-tag">1 DIRECT</span>
                <p>Unlocks Levels 2 & 3 (3% + 2% = 5% Additional).</p>
              </div>
              <div className="rule-sep">+</div>
              <div className="rule-badge-col">
                <span className="r-tag">2 DIRECTS</span>
                <p>Unlocks Levels 4, 5 & 6 (1% + 1% + 1% = 3% Additional).</p>
              </div>
              <div className="rule-sep">+</div>
              <div className="rule-badge-col">
                <span className="r-tag green">3 DIRECTS</span>
                <p>Unlocks Levels 7, 8 & 9 (Full 25% Unilevel + Working Withdrawal!).</p>
              </div>
            </div>
          </div>

          {/* 9-Level Generation Table */}
          <div className="unilevel-table-panel glass-panel">
            <div className="table-responsive">
              <table className="altruva-table manual-tbl">
                <thead>
                  <tr>
                    <th>LEVEL</th>
                    <th>COMMISSION %</th>
                    <th>UNLOCK REQUIREMENT</th>
                    <th>STATUS</th>
                    <th>TEAM MEMBERS</th>
                    <th>VOLUME (USDT)</th>
                    <th>EARNED (USDT)</th>
                  </tr>
                </thead>
                <tbody>
                  {levelsConfig.map((lvl) => (
                    <tr key={lvl.level} className={lvl.isUnlocked ? 'unlocked-row' : 'locked-row'}>
                      <td>
                        <strong className={lvl.level === 1 ? 'gold-gradient-text' : 'cyan-gradient-text'}>
                          Level {lvl.level} {lvl.level === 1 ? '(Directs)' : ''}
                        </strong>
                      </td>
                      <td>
                        <span className={`pill-pct ${lvl.level === 1 ? 'gold' : ''}`}>
                          {lvl.pct}%
                        </span>
                      </td>
                      <td>
                        <small>
                          {lvl.reqDirects === 0 ? '0 Directs (Always Open)' : `${lvl.reqDirects} Directs Required`}
                        </small>
                      </td>
                      <td>
                        {lvl.isUnlocked ? (
                          <span className="status-pill active"><CheckCircle2 size={12} /> Active</span>
                        ) : (
                          <span className="status-pill locked"><Lock size={12} /> Locked</span>
                        )}
                      </td>
                      <td>{lvl.members} Wallets</td>
                      <td>${lvl.vol.toLocaleString()}</td>
                      <td><strong className="green-txt">+${lvl.earned.toLocaleString()} USDT</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC INFINITY OVERRIDE TAB */}
      {activeSubTab === 'override' && (
        <div className="override-tab-content">
          <div className="stream-header-card glass-panel">
            <div className="sh-top">
              <div className="sh-title-box">
                <span className="sh-pill gold-gradient-text">LEADER ENGINE</span>
                <h2>DYNAMIC OVERRIDE TIERING</h2>
                <p>Infinity overrides triggered on 4th and beyond direct referrals across lifetime team turnover.</p>
              </div>
              <div className="sh-stats-box">
                <div className="stat-mini">
                  <span>Current Directs:</span>
                  <strong className="cyan-gradient-text">{directCount} Directs</strong>
                </div>
                <div className="stat-mini">
                  <span>Admin Master Royalty:</span>
                  <strong className="gold-gradient-text">5% – 10% Channel</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="ranks-dual-grid">
            <div className={`rank-card-box glass-panel ${directCount >= 4 && directCount <= 10 ? 'qualified-glow' : ''}`}>
              <div className="rc-header">
                <div className="rc-badge-title">
                  <span className="rank-roman">TIER 1</span>
                  <h3>4 – 10 DIRECTS</h3>
                </div>
                <div className="pool-pct-pill gold-gradient-text">5% OVERRIDE</div>
              </div>
              <p>5% Infinity Override on entire lifetime turnover from 4th to 10th direct lines.</p>
            </div>

            <div className={`rank-card-box glass-panel ${directCount >= 11 && directCount <= 25 ? 'qualified-glow' : ''}`}>
              <div className="rc-header">
                <div className="rc-badge-title">
                  <span className="rank-roman">TIER 2</span>
                  <h3>11 – 25 DIRECTS</h3>
                </div>
                <div className="pool-pct-pill cyan-gradient-text">7% OVERRIDE</div>
              </div>
              <p>7% Dynamic Override across 11th to 25th direct organization volume.</p>
            </div>

            <div className={`rank-card-box glass-panel ${directCount >= 26 ? 'qualified-glow' : ''}`}>
              <div className="rc-header">
                <div className="rc-badge-title">
                  <span className="rank-roman">MASTER VIP</span>
                  <h3>26+ DIRECTS</h3>
                </div>
                <div className="pool-pct-pill gold-gradient-text">10% MASTER ROYALTY</div>
              </div>
              <p>10% Master Royalty channeled permanently to Master Wallet on all team production.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

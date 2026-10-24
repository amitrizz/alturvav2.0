import React, { useState } from 'react';
import { GitBranch, Layers, Users, TrendingUp, CheckCircle2, Lock, ArrowRight, Shield } from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';

export default function BinaryAndLevels({ userData, onUpdatePreferredLeg, txLoading }) {
  const [activeSubTab, setActiveSubTab] = useState('binary'); // 'binary' or 'unilevel'
  const [selectedLeg, setSelectedLeg] = useState(userData?.preferredLeg || 0);

  const leftVol = Number(userData?.leftVolume || 35000);
  const rightVol = Number(userData?.rightVolume || 48000);
  const matchedVol = Math.min(leftVol, rightVol);
  const prUnits = Math.floor(matchedVol / 100);
  const unitVal = 2.50; // $2.5 per PR based on 25% pool
  const estBinaryIncome = (prUnits * unitVal).toFixed(2);

  const directCount = Number(userData?.directActiveCount || userData?.directCount || 2);

  const levelsConfig = [
    { level: 1, pct: 10, reqDirects: 1, members: 8, vol: 2400, earned: 240 },
    { level: 2, pct: 4, reqDirects: 1, members: 24, vol: 7200, earned: 288 },
    { level: 3, pct: 2, reqDirects: 1, members: 68, vol: 20400, earned: 408 },
    { level: 4, pct: 2, reqDirects: 2, members: 142, vol: 42600, earned: 852 },
    { level: 5, pct: 2, reqDirects: 2, members: 310, vol: 93000, earned: 1860 },
    { level: 6, pct: 2, reqDirects: 2, members: 680, vol: 204000, earned: 4080 },
    { level: 7, pct: 1, reqDirects: 3, members: 1250, vol: 375000, earned: 3750 },
    { level: 8, pct: 1, reqDirects: 3, members: 2800, vol: 840000, earned: 8400 },
    { level: 9, pct: 1, reqDirects: 3, members: 5400, vol: 1620000, earned: 16200 }
  ];

  return (
    <div className="binary-levels-wrap">
      {/* Sub Tabs Toggle */}
      <div className="subtabs-bar glass-panel">
        <button 
          className={`subtab-btn ${activeSubTab === 'binary' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('binary')}
        >
          <GitBranch size={16} /> Stream 2: Team Performance (25% Binary)
        </button>
        <button 
          className={`subtab-btn ${activeSubTab === 'unilevel' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('unilevel')}
        >
          <Layers size={16} /> Stream 3: Contribution Levels (25% Unilevel)
        </button>
      </div>

      {/* STREAM 2: BINARY (50:50 MATCHING) */}
      {activeSubTab === 'binary' && (
        <div className="binary-tab-content">
          <div className="stream-header-card glass-panel">
            <div className="sh-top">
              <div className="sh-title-box">
                <span className="sh-pill gold-gradient-text">STREAM 2 (25% TOTAL POOL)</span>
                <h2>TEAM PERFORMANCE INCOME</h2>
                <p>50:50 Binary Structure matching Left and Right team business volume with matching units (PR).</p>
              </div>
              <div className="sh-stats-box">
                <div className="stat-mini">
                  <span>Unit Value (PR):</span>
                  <strong className="cyan-gradient-text">${unitVal.toFixed(2)} USDT / PR</strong>
                </div>
                <div className="stat-mini">
                  <span>Estimated Binary Bonus:</span>
                  <strong className="gold-gradient-text">${estBinaryIncome} USDT</strong>
                </div>
              </div>
            </div>

            {/* Step-by-step formula from Slide 12 */}
            <div className="binary-formula-strip glass-panel">
              <div className="f-box"><span>1. Company Volume</span><strong>$100,000</strong></div>
              <div className="f-arrow">→</div>
              <div className="f-box"><span>2. 25% Pool</span><strong>$25,000</strong></div>
              <div className="f-arrow">→</div>
              <div className="f-box"><span>3. Total Units</span><strong>10,000 PR</strong></div>
              <div className="f-arrow">→</div>
              <div className="f-box"><span>4. Unit Value</span><strong>$2.50 / PR</strong></div>
              <div className="f-arrow">→</div>
              <div className="f-box gold"><span>5. Your Income</span><strong className="gold-gradient-text">${estBinaryIncome} USDT</strong></div>
            </div>
          </div>

          {/* Interactive Binary Tree Matching Gauge */}
          <div className="binary-tree-panel glass-panel">
            <div className="tree-top-node">
              <div className="you-avatar">
                <AltruvaLogo size={36} />
              </div>
              <div className="you-meta">
                <strong>YOU</strong>
                <span>Matched Volume: ${matchedVol.toLocaleString()} USDT</span>
              </div>
            </div>

            <div className="tree-branches-row">
              {/* Left Team */}
              <div className="leg-card glass-panel left-leg">
                <div className="leg-header">
                  <span className="leg-title cyan">LEFT TEAM</span>
                  <span className="leg-badge">Active Business</span>
                </div>
                <div className="leg-volume-num cyan-gradient-text">
                  ${leftVol.toLocaleString()} USDT
                </div>
                <div className="leg-bar-wrap">
                  <div className="leg-bar cyan-bar" style={{ width: `${Math.min(100, (leftVol / Math.max(leftVol, rightVol)) * 100)}%` }}></div>
                </div>
                <div className="leg-footer-info">
                  <span>Power Leg Units: <strong>{Math.floor(leftVol / 100)} PR</strong></span>
                </div>
              </div>

              {/* Center Matcher */}
              <div className="match-gauge-center glass-panel">
                <span className="match-tag">50:50 MATCHING</span>
                <strong className="matched-amt gold-gradient-text">${matchedVol.toLocaleString()}</strong>
                <small>{prUnits} Units @ ${unitVal}/PR</small>
              </div>

              {/* Right Team */}
              <div className="leg-card glass-panel right-leg">
                <div className="leg-header">
                  <span className="leg-title gold">RIGHT TEAM</span>
                  <span className="leg-badge">Active Business</span>
                </div>
                <div className="leg-volume-num gold-gradient-text">
                  ${rightVol.toLocaleString()} USDT
                </div>
                <div className="leg-bar-wrap">
                  <div className="leg-bar gold-bar" style={{ width: `${Math.min(100, (rightVol / Math.max(leftVol, rightVol)) * 100)}%` }}></div>
                </div>
                <div className="leg-footer-info">
                  <span>Power Leg Units: <strong>{Math.floor(rightVol / 100)} PR</strong></span>
                </div>
              </div>
            </div>

            {/* Preferred Placement Settings */}
            <div className="placement-settings-box glass-panel">
              <div className="ps-left">
                <h4>Direct Referral Placement Preference:</h4>
                <p>Choose where newly sponsored members are automatically positioned in your binary tree.</p>
              </div>
              <div className="ps-radios">
                {[
                  { id: 0, label: 'Left Team' },
                  { id: 1, label: 'Right Team' },
                  { id: 2, label: 'Auto-Balance' }
                ].map(opt => (
                  <label key={opt.id} className={`radio-pill ${selectedLeg === opt.id ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="preferredLeg"
                      value={opt.id}
                      checked={selectedLeg === opt.id}
                      onChange={() => {
                        setSelectedLeg(opt.id);
                        if (onUpdatePreferredLeg) onUpdatePreferredLeg(opt.id);
                      }}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STREAM 3: CONTRIBUTION LEVEL INCOME (25% UNILEVEL) */}
      {activeSubTab === 'unilevel' && (
        <div className="unilevel-tab-content">
          <div className="stream-header-card glass-panel">
            <div className="sh-top">
              <div className="sh-title-box">
                <span className="sh-pill cyan-gradient-text">STREAM 3 (25% TOTAL POOL)</span>
                <h2>CONTRIBUTION LEVEL INCOME (WORKING LEVELS 1–9)</h2>
                <p>Earn up to 25% multi-tier commissions from your direct and indirect personal network.</p>
              </div>
              <div className="sh-stats-box">
                <div className="stat-mini">
                  <span>Qualified Direct Sponsors:</span>
                  <strong className="cyan-gradient-text">{directCount} Directs</strong>
                </div>
                <div className="stat-mini">
                  <span>Unilevel Open Reach:</span>
                  <strong className="gold-gradient-text">
                    {directCount >= 3 ? 'Levels 1–9 (All Unlocked)' : directCount === 2 ? 'Levels 1–6 Open' : 'Levels 1–3 Open'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Criteria Banner from Slide 10 */}
            <div className="criteria-strip-grid glass-panel">
              <div className={`crit-col ${directCount >= 1 ? 'passed' : ''}`}>
                <span className="c-idx">1 DIRECT</span>
                <strong>LEVELS 1–3 OPEN</strong>
                <small>10% + 4% + 2% = 16% Total</small>
              </div>
              <div className="crit-div">→</div>
              <div className={`crit-col ${directCount >= 2 ? 'passed' : ''}`}>
                <span className="c-idx">2 DIRECTS</span>
                <strong>LEVELS 4–6 OPEN</strong>
                <small>+2% each = 22% Total</small>
              </div>
              <div className="crit-div">→</div>
              <div className={`crit-col ${directCount >= 3 ? 'passed' : ''}`}>
                <span className="c-idx">3 DIRECTS</span>
                <strong>LEVELS 7–9 OPEN</strong>
                <small>+1% each = 25% Total</small>
              </div>
            </div>
          </div>

          {/* 9 Levels Table (Desktop Only) */}
          <div className="unilevel-table-card glass-panel desktop-only-table">
            <div className="table-responsive">
              <table className="altruva-table">
                <thead>
                  <tr>
                    <th>WORKING LEVEL</th>
                    <th>COMMISSION %</th>
                    <th>UNLOCK CRITERIA</th>
                    <th>MEMBERS</th>
                    <th>VOLUME (USDT)</th>
                    <th>YOUR INCOME</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {levelsConfig.map(l => {
                    const isUnlocked = directCount >= l.reqDirects;
                    return (
                      <tr key={l.level} className={isUnlocked ? 'unlocked-row' : 'locked-row'}>
                        <td><strong>Level {l.level}</strong></td>
                        <td className="cyan-gradient-text"><strong>{l.pct}%</strong></td>
                        <td>{l.reqDirects} Qualified Direct</td>
                        <td>{l.members.toLocaleString()}</td>
                        <td>${l.vol.toLocaleString()} USDT</td>
                        <td className="earn-val">${isUnlocked ? l.earned.toLocaleString() : '0'} USDT</td>
                        <td>
                          {isUnlocked ? (
                            <span className="badge-unlocked"><CheckCircle2 size={13} /> Unlocked</span>
                          ) : (
                            <span className="badge-locked"><Lock size={13} /> Need {l.reqDirects} Directs</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 9 Levels Mobile Cards (Zero Horizontal Scroll, Full Width Cover) */}
          <div className="mobile-levels-cards mobile-only-cards">
            {levelsConfig.map(l => {
              const isUnlocked = directCount >= l.reqDirects;
              return (
                <div key={l.level} className={`mobile-level-card glass-panel ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  <div className="mlc-top">
                    <div className="mlc-title-box">
                      <span className="mlc-badge">LEVEL {l.level}</span>
                      <strong className="mlc-pct cyan-gradient-text">{l.pct}% Comm.</strong>
                    </div>
                    <span className={`mlc-status-pill ${isUnlocked ? 'unlocked' : 'locked'}`}>
                      {isUnlocked ? <><CheckCircle2 size={12} /> Active</> : <><Lock size={12} /> Need {l.reqDirects} Direct{l.reqDirects > 1 ? 's' : ''}</>}
                    </span>
                  </div>

                  <div className="mlc-stats-grid">
                    <div className="mlc-stat-box">
                      <span className="mlc-stat-lbl">Members</span>
                      <strong>{l.members.toLocaleString()}</strong>
                    </div>
                    <div className="mlc-stat-box">
                      <span className="mlc-stat-lbl">Volume</span>
                      <strong>${l.vol.toLocaleString()} USDT</strong>
                    </div>
                    <div className="mlc-stat-box highlight">
                      <span className="mlc-stat-lbl">Your Income</span>
                      <strong className="earn-val">${isUnlocked ? l.earned.toLocaleString() : '0.00'}</strong>
                    </div>
                  </div>

                  <div className="mlc-footer">
                    <span>Unlock Requirement: <strong>{l.reqDirects} Qualified Direct Sponsor{l.reqDirects > 1 ? 's' : ''}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

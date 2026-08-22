import React, { useState } from "react";
import { Trophy, Loader2, Info, Check, Copy, Users } from "lucide-react";
import "./RanksAndLevels.css";
import "./Affiliates.css";

function RanksAndLevels({
  tokenSymbol,
  userInfo,
  rankNames,
  executeClaimRankReward,
  txLoading,
  encryptAddress,
  account,
  copyReferralLink,
  copiedLink,
  subTab = "rank",
  setSubTab
}) {
  const dailyRewards = [1, 5, 11, 35, 45, 150, 300, 500, 1200, 2500, 5000, 12000, 20000, 35000];

  const getCurrentAndNextRank = () => {
    const thresholds = [
      1000, 2500, 10001, 30001, 50001, 150001, 300001, 
      650001, 1500001, 3000001, 6000001, 15000001, 30000001, 70000001
    ];
    const currentVol = parseFloat(userInfo.totalTeamBusinessUSD) || 0;
    
    let currentRankIdx = -1;
    for (let i = 0; i < thresholds.length; i++) {
      if (currentVol >= thresholds[i]) {
        currentRankIdx = i;
      } else {
        break;
      }
    }
    
    const currentRankName = currentRankIdx === -1 ? "No Rank" : rankNames[currentRankIdx];
    const nextIdx = currentRankIdx + 1;
    
    if (nextIdx >= thresholds.length) {
      return {
        currentRankName,
        nextRankName: "Max Rank Achieved",
        targetVolume: thresholds[thresholds.length - 1],
        progressPercent: 100
      };
    }
    
    const targetVolume = thresholds[nextIdx];
    const nextRankName = rankNames[nextIdx];
    const baseVolume = currentRankIdx === -1 ? 0 : thresholds[currentRankIdx];
    const progressPercent = Math.min(100, ((currentVol - baseVolume) / (targetVolume - baseVolume)) * 100);
    
    return {
      currentRankName,
      nextRankName,
      targetVolume,
      progressPercent
    };
  };

  const { currentRankName, nextRankName, targetVolume, progressPercent } = getCurrentAndNextRank();

  return (
    <div className="rl-tab-pane">
      {/* Subtab Switcher */}
      <div className="rl-subtab-switcher" style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button 
          className={`rl-subtab-btn ${subTab === "rank" ? "active" : ""}`}
          onClick={() => setSubTab("rank")}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid var(--rl-border, rgba(148,163,184,0.1))",
            background: subTab === "rank" ? "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)" : "rgba(255,255,255,0.02)",
            color: subTab === "rank" ? "#000" : "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          <Trophy size={18} /> Rank Details
        </button>
        <button 
          className={`rl-subtab-btn ${subTab === "referral" ? "active" : ""}`}
          onClick={() => setSubTab("referral")}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid var(--rl-border, rgba(148,163,184,0.1))",
            background: subTab === "referral" ? "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)" : "rgba(255,255,255,0.02)",
            color: subTab === "referral" ? "#000" : "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s"
          }}
        >
          <Users size={18} /> Referral Program
        </button>
      </div>

      {subTab === "rank" ? (
        <>
          {/* Progress to next rank header banner */}
          <div className="rl-rank-progress-banner-modern">
            <div className="rl-header-flex">
              <div className="rl-current-rank-icon-badge">
                <Trophy size={32} className="gold-text" />
              </div>
              <div>
                <span className="stat-label">Your Current Rank</span>
                <h2 className="rl-rank-title">
                  {currentRankName}
                </h2>
                <span className="text-xs opacity-75">Keep going! Reach next rank to unlock higher rewards.</span>
              </div>
            </div>
            
            <div className="rl-rank-progress-slider-wrapper">
              <div className="rl-progress-labels">
                <span>Progress to Next Rank ({nextRankName})</span>
                <span>{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="rl-progress-track">
                <div className="rl-progress-bar" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <span className="text-xs mt-1 block font-bold">${parseFloat(userInfo.totalTeamBusinessUSD).toFixed(2)} / ${targetVolume.toLocaleString()} Volume</span>
            </div>
          </div>

          <div className="rl-ranks-grid">
            {/* Rank Hierarchy cards */}
            <div className="rl-card-box rl-main-column">
              <h3 className="rl-card-title">Rank Hierarchy</h3>
              <div className="rl-rank-cards-row">
                {rankNames.map((name, idx) => (
                  <div 
                    key={idx} 
                    className={`rl-rank-mini-badge-card ${userInfo.currentRank === idx ? "active" : ""}`}
                  >
                    <Trophy size={20} className="gold-text" />
                    <h5>{name}</h5>
                    <p>${dailyRewards[idx]}/day</p>
                  </div>
                ))}
              </div>

              {userInfo.dailyRankReward > 0 && (
                <button className="rl-cta-gradient-btn" onClick={executeClaimRankReward} disabled={txLoading}>
                  {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
                  Claim Daily Rank Reward
                </button>
              )}
            </div>

            {/* Rank Requirements card info */}
            <div className="rl-card-box rl-side-column">
              <h3 className="rl-card-title">Rank Requirements</h3>
              <div className="rl-details-panel">
                <div className="rl-detail-row">
                  <span>Team A (Strong Leg Limit)</span>
                  <span>Max 50%</span>
                </div>
                <div className="rl-detail-row">
                  <span>Team B (Other Legs)</span>
                  <span>Min 50%</span>
                </div>
                <div className="rl-detail-row">
                  <span>Daily Rewards Claim Duration</span>
                  <span>150 Days Max</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rewards achievements lists */}
          <div className="rl-card-box rl-achievements-card">
            <h3 className="rl-card-title">Rewards & Achievements</h3>
            <p className="card-desc mb-6">
              Achieve team business milestones to earn luxury reward bonuses.
            </p>

            <div className="rl-active-stakes-list">
              <div className="rl-stake-item">
                <div className="rl-stake-item-header">
                  <span className="rl-stake-badge">
                    SUV Car
                  </span>
                  <span className="rl-stake-amount">$250,000 Volume</span>
                </div>
                <div className="rl-stake-item-details">
                  <p className="text-xs text-left opacity-75">Hyundai Creta Top Model or equivalent.</p>
                  <div className="rl-milestone-progress-track">
                    <div className="rl-progress-bar" style={{ width: `${Math.min(100, (parseFloat(userInfo.totalTeamBusinessUSD) / 250000) * 100)}%` }}></div>
                  </div>
                  <span className="text-xs text-right mt-1 block font-bold">${parseFloat(userInfo.totalTeamBusinessUSD).toFixed(2)} / $250,000</span>
                </div>
              </div>

              <div className="rl-stake-item">
                <div className="rl-stake-item-header">
                  <span className="rl-stake-badge">
                    BMW Car
                  </span>
                  <span className="rl-stake-amount">$500,000 Volume</span>
                </div>
                <div className="rl-stake-item-details">
                  <p className="text-xs text-left opacity-75">BMW series luxury sedan.</p>
                  <div className="rl-milestone-progress-track">
                    <div className="rl-progress-bar" style={{ width: `${Math.min(100, (parseFloat(userInfo.totalTeamBusinessUSD) / 500000) * 100)}%` }}></div>
                  </div>
                  <span className="text-xs text-right mt-1 block font-bold">${parseFloat(userInfo.totalTeamBusinessUSD).toFixed(2)} / $500,000</span>
                </div>
              </div>

              <div className="rl-stake-item">
                <div className="rl-stake-item-header">
                  <span className="rl-stake-badge">
                    Mercedes-Benz
                  </span>
                  <span className="rl-stake-amount">$1,000,000 Volume</span>
                </div>
                <div className="rl-stake-item-details">
                  <p className="text-xs text-left opacity-75">Mercedes Benz Class E luxury sedan.</p>
                  <div className="rl-milestone-progress-track">
                    <div className="rl-progress-bar" style={{ width: `${Math.min(100, (parseFloat(userInfo.totalTeamBusinessUSD) / 1000000) * 100)}%` }}></div>
                  </div>
                  <span className="text-xs text-right mt-1 block font-bold">${parseFloat(userInfo.totalTeamBusinessUSD).toFixed(2)} / $1,000,000</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Referral Program Section (moved from Profile) */}
          <div className="af-affiliates-grid">
            {/* Share referral card */}
            <div className="af-card-box af-main-column">
              <h3 className="af-card-title af-title-flex">
                Your Referral Link
                <span className="af-tooltip-trigger">
                  <Info size={16} />
                  <span className="af-tooltip-popup">
                    Share this link with your friends to earn affiliate commissions across 15 levels.
                  </span>
                </span>
              </h3>

              <div className="af-link-copy-block">
                <input 
                  type="text" 
                  readOnly 
                  value={`${window.location.origin}?ref=${encryptAddress(account)}`} 
                  className="af-copy-input"
                />
                <button className="af-copy-btn" onClick={copyReferralLink}>
                  {copiedLink ? <Check size={18} className="text-green" /> : <Copy size={18} />}
                </button>
              </div>

              <h4 className="af-field-label">Share Via</h4>
              <div className="af-actions-flex">
                <a href={`https://twitter.com/intent/tweet?text=Join%20me%20on%20BTC3.O%20Stake%20%26%20Earn!%20${window.location.origin}?ref=${encryptAddress(account)}`} target="_blank" rel="noreferrer" className="af-social-share-btn twitter">Twitter</a>
                <a href={`https://t.me/share/url?url=${window.location.origin}?ref=${encryptAddress(account)}&text=Join%20me%20on%20BTC3.O%20Stake%20%26%20Earn!`} target="_blank" rel="noreferrer" className="af-social-share-btn telegram">Telegram</a>
                <a href={`https://api.whatsapp.com/send?text=Join%20me%20on%20BTC3.O%20Stake%20%26%20Earn!%20${window.location.origin}?ref=${encryptAddress(account)}`} target="_blank" rel="noreferrer" className="af-social-share-btn whatsapp">WhatsApp</a>
              </div>
            </div>

            {/* Level unlock scrolls list */}
            <div className="af-card-box af-side-column">
              <h3 className="af-card-title">Commission Structure</h3>
              <div className="af-level-list">
                {[8, 4, 2, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25].map((pct, idx) => (
                  <div className="af-level-row" key={idx}>
                    <span>Level {idx + 1} ({pct}% Rewards)</span>
                    <span className={`af-status-badge ${userInfo.directActiveCount >= (idx + 1) ? "unlocked" : "locked"}`}>
                      {userInfo.directActiveCount >= (idx + 1) ? "Active" : `Locked`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Referrals table list */}
          <div className="af-card-box af-table-card" style={{ marginTop: "20px", marginBottom: "25px" }}>
            <h3 className="af-card-title">Top Referrals</h3>
            <div className="af-custom-table-container">
              <table className="af-custom-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Join Date</th>
                    <th>Total Staked</th>
                    <th>Volume (USD)</th>
                    <th>Your Commission</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono">0x7a8...3F21</td>
                    <td>May 15, 2026</td>
                    <td>250.00 {tokenSymbol}</td>
                    <td>$25.40</td>
                    <td className="gold-text">$25.40</td>
                    <td><span className="badge-status-unlocked">Active</span></td>
                  </tr>
                  <tr>
                    <td className="font-mono">0x9c1...8A73</td>
                    <td>May 14, 2026</td>
                    <td>150.00 {tokenSymbol}</td>
                    <td>$15.80</td>
                    <td className="gold-text">$15.80</td>
                    <td><span className="badge-status-unlocked">Active</span></td>
                  </tr>
                  <tr>
                    <td className="font-mono">0x1d2...7B90</td>
                    <td>May 13, 2026</td>
                    <td>100.00 {tokenSymbol}</td>
                    <td>$10.30</td>
                    <td className="gold-text">$10.30</td>
                    <td><span className="badge-status-unlocked">Active</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RanksAndLevels;

import React from "react";
import { Trophy, Loader2 } from "lucide-react";
import "./RanksAndLevels.css";

function RanksAndLevels({
  tokenSymbol,
  userInfo,
  rankNames,
  executeClaimRankReward,
  txLoading
}) {
  const dailyRewards = [1, 5, 11, 35, 45, 150, 300, 500, 1200, 2500, 5000, 12000, 20000, 35000];

  return (
    <div className="rl-tab-pane">
      {/* Progress to next rank header banner */}
      <div className="rl-rank-progress-banner-modern">
        <div className="rl-header-flex">
          <div className="rl-current-rank-icon-badge">
            <Trophy size={32} className="gold-text" />
          </div>
          <div>
            <span className="stat-label">Your Current Rank</span>
            <h2 className="rl-rank-title">
              {rankNames[userInfo.currentRank] || "Starter"}
            </h2>
            <span className="text-xs opacity-75">Keep going! Reach next rank to unlock higher rewards.</span>
          </div>
        </div>
        
        <div className="rl-rank-progress-slider-wrapper">
          <div className="rl-progress-labels">
            <span>Progress to Next Rank</span>
            <span>{(parseFloat(userInfo.totalTeamBusinessUSD) / 10000 * 100).toFixed(0)}%</span>
          </div>
          <div className="rl-progress-track">
            <div className="rl-progress-bar" style={{ width: `${Math.min(100, (parseFloat(userInfo.totalTeamBusinessUSD) / 10000) * 100)}%` }}></div>
          </div>
          <span className="text-xs mt-1 block font-bold">${parseFloat(userInfo.totalTeamBusinessUSD).toFixed(2)} / $10,000 Volume</span>
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
    </div>
  );
}

export default RanksAndLevels;

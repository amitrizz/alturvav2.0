import React from "react";
import { Flame, Layers, Users, Trophy, Compass, BookOpen, Crown } from "lucide-react";
import "./Dashboard.css";

function Dashboard({
  tokenSymbol,
  currentPrice,
  totalUSDValueMinted,
  totalMintedTokens,
  btcBalance,
  setActiveTab,
  registeredUsersCount
}) {
  return (
    <div className="db-tab-pane">
      {/* Hero Stats */}
      <section className="db-stats-strip">
        <div className="db-stat-card db-card-price">
          <span className="db-stat-label">{tokenSymbol} Price</span>
          <h3 className="db-stat-value">${parseFloat(currentPrice).toFixed(4)}</h3>
          <span className="db-stat-change text-green">+0.1% per $500 minted</span>
        </div>
        <div className="db-stat-card db-card-minted">
          <span className="db-stat-label">Total Value Minted</span>
          <h3 className="db-stat-value">${parseFloat(totalUSDValueMinted).toFixed(2)}</h3>
        </div>
        <div className="db-stat-card db-card-remaining">
          <span className="db-stat-label">Remaining Mintable Value</span>
          <h3 className="db-stat-value">${((100000000 - parseFloat(totalMintedTokens)) * parseFloat(currentPrice)).toFixed(2)}</h3>
        </div>
        <div className="db-stat-card db-card-supply">
          <span className="db-stat-label">Total Minted Supply</span>
          <h3 className="db-stat-value">{parseFloat(totalMintedTokens).toFixed(2)} {tokenSymbol}</h3>
        </div>
        <div className="db-stat-card db-card-max">
          <span className="db-stat-label">Max Total Supply</span>
          <h3 className="db-stat-value">100,000,000 {tokenSymbol}</h3>
        </div>
        <div className="db-stat-card db-card-balance">
          <span className="db-stat-label">Your {tokenSymbol} Balance</span>
          <h3 className="db-stat-value">{btcBalance} {tokenSymbol}</h3>
        </div>
      </section>

      <div className="db-dashboard-row-split">
        {/* Quick Actions grid panel */}
        <div className="db-card-box">
          <h3 className="db-card-title">Quick Actions</h3>
          <div className="db-quick-actions-grid">
            <div className="db-action-card" onClick={() => setActiveTab("mint")}>
              <div className="db-action-card-header">
                <Flame size={20} className="db-gold-icon" />
                <h4>Genesis Mint</h4>
              </div>
              <p>Mint {tokenSymbol} tokens and be part of the ecosystem.</p>
              <span className="db-action-link">Mint Now &rarr;</span>
            </div>
            <div className="db-action-card" onClick={() => setActiveTab("stake")}>
              <div className="db-action-card-header">
                <Layers size={20} className="db-gold-icon" />
                <h4>Staking Portal</h4>
              </div>
              <p>Stake your tokens and earn passive daily rewards.</p>
              <span className="db-action-link">Start Staking &rarr;</span>
            </div>
            <div className="db-action-card" onClick={() => setActiveTab("affiliate")}>
              <div className="db-action-card-header">
                <Users size={20} className="db-gold-icon" />
                <h4>Affiliates</h4>
              </div>
              <p>Invite your friends and earn attractive commissions.</p>
              <span className="db-action-link">View Program &rarr;</span>
            </div>
            <div className="db-action-card" onClick={() => setActiveTab("ranks")}>
              <div className="db-action-card-header">
                <Trophy size={20} className="db-gold-icon" />
                <h4>Ranks & Levels</h4>
              </div>
              <p>Climb the ranks and unlock higher rewards.</p>
              <span className="db-action-link">View Ranks &rarr;</span>
            </div>
            <div className="db-action-card" onClick={() => setActiveTab("wheel")}>
              <div className="db-action-card-header">
                <Compass size={20} className="db-gold-icon" />
                <h4>Lucky Wheel</h4>
              </div>
              <p>Spin the wheel and win exciting token prizes.</p>
              <span className="db-action-link">Spin Now &rarr;</span>
            </div>
            <div className="db-action-card">
              <div className="db-action-card-header">
                <BookOpen size={20} className="db-gold-icon" />
                <h4>Docs & Guides</h4>
              </div>
              <p>Learn how {tokenSymbol} works and maximize earnings.</p>
              <span className="db-action-link">View Docs &rarr;</span>
            </div>
          </div>
        </div>

        {/* Platform Overview Mock Chart Card */}
        <div className="db-card-box">
          <h3 className="db-card-title">Platform Overview</h3>
          <div className="db-chart-stats-row">
            <div className="db-chart-col">
              <span className="db-chart-stat-label">Total Volume</span>
              <h4 className="db-chart-stat-val">${parseFloat(totalUSDValueMinted).toFixed(2)}</h4>
              <span className="db-chart-stat-change text-green">&#9650; 12.5%</span>
            </div>
            <div className="db-chart-col">
              <span className="db-chart-stat-label">Active Users</span>
              <h4 className="db-chart-stat-val">{registeredUsersCount}</h4>
              <span className="db-chart-stat-change text-green">&#9650; 8.3%</span>
            </div>
            <div className="db-chart-col">
              <span className="db-chart-stat-label">Rewards Paid</span>
              <h4 className="db-chart-stat-val">${(parseFloat(totalUSDValueMinted) * 0.23).toFixed(2)}</h4>
              <span className="db-chart-stat-change text-green">&#9650; 15.7%</span>
            </div>
          </div>
          <div className="db-mock-chart-container">
            <svg className="db-mock-svg-line" viewBox="0 0 300 120">
              <path d={`M 0 100 Q 50 ${Math.max(30, 100 - (parseFloat(totalUSDValueMinted) / 500) * 10)} 150 ${Math.max(20, 85 - (parseFloat(totalUSDValueMinted) / 500) * 12)} T 300 ${Math.max(10, 45 - (parseFloat(totalUSDValueMinted) / 500) * 15)}`} fill="none" stroke="var(--gold)" strokeWidth="3" />
              <circle cx="150" cy={Math.max(20, 85 - (parseFloat(totalUSDValueMinted) / 500) * 12)} r="5" fill="var(--gold)" />
            </svg>
            <div className="db-mock-chart-labels">
              <span>{getPastDateLabel(6)}</span>
              <span>{getPastDateLabel(4)}</span>
              <span>{getPastDateLabel(2)}</span>
              <span>{getPastDateLabel(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Banner block */}
      <div className="db-unlock-rewards-banner">
        <div className="db-banner-left-content">
          <div className="db-banner-icon-bg">
            <Crown size={24} className="db-gold-icon" />
          </div>
          <div className="db-banner-text-details">
            <h3>Unlock Higher Rewards</h3>
            <p>Stake more, climb the ranks, and earn exclusive bonuses.</p>
          </div>
        </div>
        <button className="db-banner-action-btn" onClick={() => setActiveTab("ranks")}>
          Explore Ranks & Levels &rarr;
        </button>
      </div>
    </div>
  );
}

// Chart date label helper
const getPastDateLabel = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default Dashboard;

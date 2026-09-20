import React, { useState } from "react";
import { Flame, Layers, Users, Trophy, Compass, BookOpen, Crown, Coins, TrendingUp, ShieldAlert, Sparkles, Database, Wallet, X } from "lucide-react";
import { chartPathFromPoints } from "../utils/platformStats";
import "./Dashboard.css";

function DashboardStatCard({ label, value, icon: Icon, sub }) {
  return (
    <div className="db-stat-card ui-gold-card">
      <div className="db-stat-main">
        <span className="db-stat-label">{label}</span>
        <h3 className="db-stat-value">{value}</h3>
        {sub ? <span className="db-stat-sub">{sub}</span> : <span className="db-stat-sub db-stat-sub--empty">&nbsp;</span>}
      </div>
      <div className="db-stat-icon-gold" aria-hidden="true">
        <Icon size={22} strokeWidth={2} />
      </div>
    </div>
  );
}

function Dashboard({
  tokenSymbol,
  currentPrice,
  totalUSDValueMinted,
  totalMintedTokens,
  tokenTotalSupply,
  stakingTokenReserve,
  totalRewardsPaidUSD,
  mintChartData,
  mintVolumeGrowth,
  btcBalance,
  setActiveTab,
  registeredUsersCount,
  setRanksSubTab,
  setProfileSubTab
}) {
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const supply = parseFloat(tokenTotalSupply) || 0;
  const reserve = parseFloat(stakingTokenReserve) || 0;
  const chart = chartPathFromPoints(mintChartData || []);

  const formatGrowth = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) return null;
    const sign = value >= 0 ? "▲" : "▼";
    const cls = value >= 0 ? "text-green" : "text-red";
    return { label: `${sign} ${Math.abs(value).toFixed(1)}%`, cls };
  };

  const volumeGrowth = formatGrowth(mintVolumeGrowth);

  const goSell = () => {
    setProfileSubTab?.("profile");
    setActiveTab("affiliate");
  };

  return (
    <div className="db-tab-pane">
      <section className="db-trade-panel ui-gold-card">
        <div className="db-trade-panel-header">BUY &amp; SELL TOKEN</div>
        <div className="db-trade-panel-actions">
          <button type="button" className="ui-btn-buy" onClick={() => setActiveTab("mint")}>
            Buy Token
          </button>
          <button type="button" className="ui-btn-sell" onClick={goSell}>
            Sell Token
          </button>
        </div>
      </section>

      <section className="db-stats-strip">
        <DashboardStatCard
          label="Price"
          value={`$${parseFloat(currentPrice).toFixed(4)}`}
          icon={Coins}
          sub={<span className="text-green">+0.1% per $500 minted</span>}
        />
        <DashboardStatCard
          label="Total Value Minted"
          value={`$${parseFloat(totalUSDValueMinted).toFixed(2)}`}
          icon={TrendingUp}
        />
        <DashboardStatCard
          label="Remaining Mintable"
          value={reserve.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          icon={ShieldAlert}
        />
        <DashboardStatCard
          label="Total Minted Supply"
          value={parseFloat(totalMintedTokens).toFixed(2)}
          icon={Sparkles}
        />
        <DashboardStatCard
          label="Max Total Supply"
          value={supply.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          icon={Database}
        />
        <DashboardStatCard
          label="Your Balance"
          value={btcBalance}
          icon={Wallet}
        />
      </section>

      <div className="db-dashboard-row-split">
        {/* Ways of Income grid panel */}
        <div className="db-card-box ui-gold-card">
          <h3 className="db-card-title">Ways of Income</h3>
          <div className="db-quick-actions-grid">
            <div className="db-action-card" onClick={() => setActiveTab("mint")}>
              <div className="db-action-card-header">
                <Flame size={20} className="db-gold-icon" />
                <h4>Genesis Minting</h4>
              </div>
              <p>Mint {tokenSymbol} starting at $0.50. Price rises 0.1% for every $500 minted.</p>
              <span className="db-action-link">Mint Now &rarr;</span>
            </div>
            <div className="db-action-card" onClick={() => setActiveTab("stake")}>
              <div className="db-action-card-header">
                <Layers size={20} className="db-gold-icon" />
                <h4>Staking Portal</h4>
              </div>
              <p>Stake your tokens and earn daily ROI based on your investment tier.</p>
              <span className="db-action-link">Stake Now &rarr;</span>
            </div>
            <div className="db-action-card" onClick={() => { setRanksSubTab("referral"); setActiveTab("ranks"); }}>
              <div className="db-action-card-header">
                <Users size={20} className="db-gold-icon" />
                <h4>Referral Income</h4>
              </div>
              <p>Earn commissions across 20 levels when your team grows.</p>
              <span className="db-action-link">View Levels &rarr;</span>
            </div>
            <div className="db-action-card" onClick={() => { setRanksSubTab("rank"); setActiveTab("ranks"); }}>
              <div className="db-action-card-header">
                <Trophy size={20} className="db-gold-icon" />
                <h4>Rank &amp; Salary</h4>
              </div>
              <p>Unlock rank bonuses and monthly salary rewards as you grow.</p>
              <span className="db-action-link">View Ranks &rarr;</span>
            </div>
            <div className="db-action-card" onClick={() => setActiveTab("wheel")}>
              <div className="db-action-card-header">
                <Compass size={20} className="db-gold-icon" />
                <h4>Lucky Wheel</h4>
              </div>
              <p>Spin the wheel for a chance to win bonus token rewards.</p>
              <span className="db-action-link">Spin Now &rarr;</span>
            </div>
            <div className="db-action-card" onClick={() => setIsGuideModalOpen(true)}>
              <div className="db-action-card-header">
                <BookOpen size={20} className="db-gold-icon" />
                <h4>How It Works</h4>
              </div>
              <p>Step-by-step guide to minting, staking, and earning on BTC3.0.</p>
              <span className="db-action-link">Open Guide &rarr;</span>
            </div>
          </div>
        </div>

        <div className="db-card-box ui-gold-card">
          <h3 className="db-card-title">Platform Overview</h3>
          <div className="db-chart-stats-row">
            <div className="db-chart-col">
              <span className="db-chart-stat-label">Total Volume</span>
              <h4 className="db-chart-stat-val">${parseFloat(totalUSDValueMinted).toFixed(2)}</h4>
              {volumeGrowth ? (
                <span className={`db-chart-stat-change ${volumeGrowth.cls}`}>{volumeGrowth.label}</span>
              ) : (
                <span className="db-chart-stat-change" style={{ opacity: 0.5 }}>On-chain</span>
              )}
            </div>
            <div className="db-chart-col">
              <span className="db-chart-stat-label">Registered Users</span>
              <h4 className="db-chart-stat-val">{registeredUsersCount}</h4>
              <span className="db-chart-stat-change" style={{ opacity: 0.5 }}>On-chain</span>
            </div>
            <div className="db-chart-col">
              <span className="db-chart-stat-label">Rewards Paid</span>
              <h4 className="db-chart-stat-val">${parseFloat(totalRewardsPaidUSD || 0).toFixed(2)}</h4>
              <span className="db-chart-stat-change" style={{ opacity: 0.5 }}>On-chain</span>
            </div>
          </div>
          <div className="db-mock-chart-container">
            <svg className="db-mock-svg-line" viewBox="0 0 300 120">
              <path d={chart.path} fill="none" stroke="var(--gold)" strokeWidth="3" />
              {mintChartData?.length > 0 && (
                <circle cx={chart.dotX ?? 150} cy={chart.dotY} r="5" fill="var(--gold)" />
              )}
            </svg>
            <div className="db-mock-chart-labels">
              {(chart.labels?.length ? chart.labels : [getPastDateLabel(6), getPastDateLabel(4), getPastDateLabel(2), getPastDateLabel(0)]).map((label, i) => (
                <span key={`${label}-${i}`}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="db-unlock-rewards-banner ui-gold-card">
        <div className="db-banner-left-content">
          <div className="db-banner-icon-bg">
            <Crown size={24} className="db-gold-icon" />
          </div>
          <div className="db-banner-text-details">
            <h3>Unlock Higher Rewards</h3>
            <p>Stake more, climb the ranks, and earn exclusive bonuses.</p>
          </div>
        </div>
        <button type="button" className="ui-btn-gold db-banner-action-btn" onClick={() => setActiveTab("ranks")}>
          Explore Ranks & Levels &rarr;
        </button>
      </div>

      {isGuideModalOpen && (
        <div className="db-guide-modal-overlay" onClick={() => setIsGuideModalOpen(false)}>
          <div className="db-guide-modal ui-gold-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="db-guide-close" onClick={() => setIsGuideModalOpen(false)} aria-label="Close">
              <X size={20} />
            </button>
            <h3>How BTC3.0 Works</h3>
            <ol className="db-guide-list">
              <li><strong>Connect Wallet:</strong> Click Connect in the header (WalletConnect on mobile).</li>
              <li><strong>Genesis Mint:</strong> Buy {tokenSymbol} with BNB or USDT on BSC Testnet.</li>
              <li><strong>Stake:</strong> Lock tokens in the Staking Portal for daily ROI.</li>
              <li><strong>Refer:</strong> Share your link from Ranks → Level Income.</li>
              <li><strong>Rank Up:</strong> Hit team targets for one-time bonuses and monthly salary.</li>
            </ol>
            <button type="button" className="ui-btn-gold db-guide-cta" onClick={() => setIsGuideModalOpen(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getPastDateLabel(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default Dashboard;

import React, { useState } from "react";
import { Flame, Layers, Users, Trophy, Compass, BookOpen, Crown, Coins, TrendingUp, ShieldAlert, Sparkles, Database, Wallet, X } from "lucide-react";
import { chartPathFromPoints } from "../utils/platformStats";
import "./Dashboard.css";

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
  return (
    <div className="db-tab-pane">
      {/* Hero Stats */}
      <section className="db-stats-strip">
        <div className="db-stat-card db-card-price gm-card-flex" style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <div className="stat-card-icon-wrapper price-icon" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Coins size={18} style={{ color: "#3b82f6" }} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
            <span className="db-stat-label">Price</span>
            <h3 className="db-stat-value">${parseFloat(currentPrice).toFixed(4)}</h3>
            <span className="db-stat-change text-green" style={{ fontSize: "10px", display: "block" }}>+0.1% per $500 minted</span>
          </div>
        </div>

        <div className="db-stat-card db-card-minted gm-card-flex" style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <div className="stat-card-icon-wrapper minted-icon" style={{ backgroundColor: "rgba(139, 92, 246, 0.1)", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <TrendingUp size={18} style={{ color: "#8b5cf6" }} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
            <span className="db-stat-label">Total Value Minted</span>
            <h3 className="db-stat-value">${parseFloat(totalUSDValueMinted).toFixed(2)}</h3>
            <span style={{ fontSize: "10px", opacity: 0 }} className="db-stat-change">&nbsp;</span>
          </div>
        </div>

        <div className="db-stat-card db-card-remaining gm-card-flex" style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <div className="stat-card-icon-wrapper remaining-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldAlert size={18} style={{ color: "#10b981" }} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
            <span className="db-stat-label">Remaining Mintable Tokens</span>
            <h3 className="db-stat-value">{reserve.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <span style={{ fontSize: "10px", opacity: 0 }} className="db-stat-change">&nbsp;</span>
          </div>
        </div>

        <div className="db-stat-card db-card-supply gm-card-flex" style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <div className="stat-card-icon-wrapper supply-icon" style={{ backgroundColor: "rgba(245, 158, 11, 0.1)", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={18} style={{ color: "#f59e0b" }} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
            <span className="db-stat-label">Total Minted Supply</span>
            <h3 className="db-stat-value">{parseFloat(totalMintedTokens).toFixed(2)}</h3>
            <span style={{ fontSize: "10px", opacity: 0 }} className="db-stat-change">&nbsp;</span>
          </div>
        </div>

        <div className="db-stat-card db-card-max gm-card-flex" style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <div className="stat-card-icon-wrapper max-icon" style={{ backgroundColor: "rgba(99, 102, 241, 0.1)", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Database size={18} style={{ color: "#6366f1" }} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
            <span className="db-stat-label">Max Total Supply</span>
            <h3 className="db-stat-value">{supply.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
            <span style={{ fontSize: "10px", opacity: 0 }} className="db-stat-change">&nbsp;</span>
          </div>
        </div>

        <div className="db-stat-card db-card-balance gm-card-flex" style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          <div className="stat-card-icon-wrapper balance-icon" style={{ backgroundColor: "rgba(251, 191, 36, 0.1)", padding: "8px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Wallet size={18} style={{ color: "#fbbf24" }} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
            <span className="db-stat-label">Your Balance</span>
            <h3 className="db-stat-value">{btcBalance}</h3>
            <span style={{ fontSize: "10px", opacity: 0 }} className="db-stat-change">&nbsp;</span>
          </div>
        </div>
      </section>

      <div className="db-dashboard-row-split">
        {/* Ways of Income grid panel */}
        <div className="db-card-box">
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
                <h4>Staking Yield</h4>
              </div>
              <p>Lock your tokens to earn 0.5% daily yields (180% APR) up to a 300% (3x) return cap.</p>
              <span className="db-action-link">Start Staking &rarr;</span>
            </div>
            <div className="db-action-card" onClick={() => { setActiveTab("ranks"); setRanksSubTab("referral"); }}>
              <div className="db-action-card-header">
                <Users size={20} className="db-gold-icon" />
                <h4>Referral Program</h4>
              </div>
              <p>Earn multi-level affiliate commissions (up to 15 levels) from your network.</p>
              <span className="db-action-link">View Program &rarr;</span>
            </div>
            <div className="db-action-card" onClick={() => { setActiveTab("ranks"); setRanksSubTab("rank"); }}>
              <div className="db-action-card-header">
                <Trophy size={20} className="db-gold-icon" />
                <h4>Rank Milestones</h4>
              </div>
              <p>Unlock guaranteed daily payouts (from $1 to $35k/day) and physical car rewards.</p>
              <span className="db-action-link">View Ranks &rarr;</span>
            </div>
            <div className="db-action-card" onClick={() => setActiveTab("wheel")}>
              <div className="db-action-card-header">
                <Compass size={20} className="db-gold-icon" />
                <h4>Lucky Spin Wheel</h4>
              </div>
              <p>Spin the wheel to win instant multipliers up to 150 {tokenSymbol} Jackpot rewards.</p>
              <span className="db-action-link">Spin Now &rarr;</span>
            </div>
            <div className="db-action-card" onClick={() => setIsGuideModalOpen(true)} style={{ cursor: "pointer" }}>
              <div className="db-action-card-header">
                <BookOpen size={20} className="db-gold-icon" />
                <h4>Docs & Guides</h4>
              </div>
              <p>Learn how {tokenSymbol} works and maximize your earnings.</p>
              <span className="db-action-link">View Docs &rarr;</span>
            </div>
          </div>
        </div>

        {/* Platform Overview — on-chain mint volume chart */}
        <div className="db-card-box">
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

      {/* Ecosystem Guide & Documentation Modal */}
      {isGuideModalOpen && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(8px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px"
          }}
          onClick={() => setIsGuideModalOpen(false)}
        >
          <div 
            style={{
              background: "#080d1a",
              border: "1px solid rgba(139, 92, 246, 0.25)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "85vh",
              overflowY: "auto",
              padding: "28px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button 
              onClick={() => setIsGuideModalOpen(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "transparent",
                border: 0,
                color: "#718096",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "50%",
                transition: "color 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.color = "#fff"}
              onMouseLeave={(e) => e.target.style.color = "#718096"}
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div>
              <h3 style={{ margin: "0 0 6px", fontSize: "1.4rem", fontWeight: "bold", color: "#fff" }}>Ecosystem Guide & Documentation</h3>
              <p style={{ margin: 0, color: "#a8b3c7", fontSize: "0.85rem", lineHeight: "1.4" }}>
                Learn how to navigate the platform, explore the various income channels, and maximize your token rewards.
              </p>
            </div>

            {/* Section 1: How to use the platform */}
            <div style={{ borderTop: "1px solid rgba(148, 163, 184, 0.1)", paddingTop: "18px" }}>
              <h4 style={{ margin: "0 0 14px", fontSize: "1.05rem", fontWeight: "bold", color: "var(--gold)" }}>How to Use the Platform</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(251,191,36,0.15)", color: "var(--gold)", fontSize: "0.75rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>1</div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#a8b3c7", lineHeight: "1.4" }}>
                    <strong>Connect Wallet:</strong> Click the wallet connect button in the header to link your Web3 wallet (Metamask, TrustWallet, etc.).
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(251,191,36,0.15)", color: "var(--gold)", fontSize: "0.75rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>2</div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#a8b3c7", lineHeight: "1.4" }}>
                    <strong>Mint BTC3.O:</strong> Head to the <strong>Mint</strong> tab. Enter the amount of USDT or BNB you want to spend and click Mint. (Enter a promo coupon if you have one to double your minted tokens).
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(251,191,36,0.15)", color: "var(--gold)", fontSize: "0.75rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>3</div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#a8b3c7", lineHeight: "1.4" }}>
                    <strong>Stake to Earn:</strong> Go to the <strong>Stake</strong> tab. Lock your minted tokens to earn a daily yield of 0.5%. You can claim your accrued rewards at any time directly from the stakes panel.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(251,191,36,0.15)", color: "var(--gold)", fontSize: "0.75rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>4</div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#a8b3c7", lineHeight: "1.4" }}>
                    <strong>Spin the Wheel:</strong> Go to the <strong>Wheel</strong> tab. Spend 10 tokens to spin the wheel and win instant token multiplier multipliers.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(251,191,36,0.15)", color: "var(--gold)", fontSize: "0.75rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>5</div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#a8b3c7", lineHeight: "1.4" }}>
                    <strong>Grow Your Team:</strong> Copy your referral link from the <strong>Ranks</strong> tab (Referral Program section). Share it with friends to unlock up to 15 levels of affiliate commissions and achieve daily rank payouts.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 2: Ways of Income */}
            <div style={{ borderTop: "1px solid rgba(148, 163, 184, 0.1)", paddingTop: "18px" }}>
              <h4 style={{ margin: "0 0 14px", fontSize: "1.05rem", fontWeight: "bold", color: "var(--gold)" }}>Ways to Generate Income</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                
                {/* Minting */}
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <Flame size={18} style={{ color: "var(--gold)", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h5 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: "bold", color: "#fff" }}>1. Genesis Minting</h5>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#a8b3c7", lineHeight: "1.3" }}>
                      Mint {tokenSymbol} tokens early starting at $0.50. Token price automatically rises by 0.1% for every $500 value minted.
                    </p>
                  </div>
                </div>

                {/* Staking */}
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <Layers size={18} style={{ color: "var(--gold)", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h5 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: "bold", color: "#fff" }}>2. Staking Yields (180% APR)</h5>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#a8b3c7", lineHeight: "1.3" }}>
                      Lock tokens to earn 0.5% daily yields (15% monthly / 180% APR) up to a 300% (3x) initial USD value return cap.
                    </p>
                  </div>
                </div>

                {/* Lucky Wheel */}
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <Compass size={18} style={{ color: "var(--gold)", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h5 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: "bold", color: "#fff" }}>3. Lucky Spin Wheel</h5>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#a8b3c7", lineHeight: "1.3" }}>
                      Use your tokens to spin the wheel for a chance to win instant prize multipliers up to 150 {tokenSymbol} Jackpot payouts.
                    </p>
                  </div>
                </div>

                {/* Referral */}
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <Users size={18} style={{ color: "var(--gold)", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h5 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: "bold", color: "#fff" }}>4. Referral Network Commissions</h5>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#a8b3c7", lineHeight: "1.3" }}>
                      Earn passive affiliate rewards down to 15 levels (8% on Level 1, 4% on Level 2, etc.) depending on your active direct referral counts.
                    </p>
                  </div>
                </div>

                {/* Rank Milestones */}
                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <Trophy size={18} style={{ color: "var(--gold)", flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <h5 style={{ margin: "0 0 4px", fontSize: "0.9rem", fontWeight: "bold", color: "#fff" }}>5. Rank Daily Payouts & Assets</h5>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "#a8b3c7", lineHeight: "1.3" }}>
                      Unlock daily payouts (from $1/day to $35k/day) for 150 days and win physical achievements (SUV, BMW, Mercedes) based on team volume.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}
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

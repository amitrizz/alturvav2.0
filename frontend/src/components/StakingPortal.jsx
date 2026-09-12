import React from "react";
import { Info, Loader2 } from "lucide-react";
import { ROI_TIERS } from "../abis";
import "./StakingPortal.css";

function getTierForUsd(usd) {
  const amount = parseFloat(usd) || 0;
  for (const tier of ROI_TIERS) {
    if (amount >= tier.min && amount <= tier.max) return tier;
  }
  return null;
}

function StakingPortal({
  tokenSymbol,
  userInfo,
  userStakesList,
  btcBalance,
  stakeBtcAmount,
  setStakeBtcAmount,
  currentPrice,
  btcApproved,
  approveBtc,
  executeStake,
  executeClaim,
  executeUnstake,
  txLoading,
}) {
  const estimatedUsd = (parseFloat(stakeBtcAmount) || 0) * (parseFloat(currentPrice) || 0.5);
  const selectedTier = getTierForUsd(estimatedUsd);

  return (
    <div className="sp-tab-pane">
      <section className="sp-stats-strip sp-stats-4-columns">
        <div className="sp-stat-card sp-card-price">
          <span className="sp-stat-label">Total Staked</span>
          <h3 className="sp-stat-value">{userInfo.totalSelfStakeUSD} USD</h3>
        </div>
        <div className="sp-stat-card sp-card-supply">
          <span className="sp-stat-label">Total Rewards Earned</span>
          <h3 className="sp-stat-value">{parseFloat(userStakesList.reduce((acc, st) => acc + parseFloat(st.rewardClaimedUSD), 0)).toFixed(2)} USD</h3>
        </div>
        <div className="sp-stat-card sp-card-remaining">
          <span className="sp-stat-label">Investment Cycle</span>
          <h3 className="sp-stat-value sp-font-mono">365 Days</h3>
        </div>
        <div className="sp-stat-card sp-card-balance">
          <span className="sp-stat-label">Your Daily ROI</span>
          <h3 className="sp-stat-value text-green">{selectedTier ? `${selectedTier.rate}%` : "—"}</h3>
        </div>
      </section>

      <div className="sp-stake-grid">
        <div className="sp-card-box sp-main-column">
          <h3 className="sp-card-title sp-title-flex">
            Stake {tokenSymbol}
            <span className="sp-tooltip-trigger">
              <Info size={16} />
              <span className="sp-tooltip-popup">
                Stake $10–$10,000. Daily ROI is based on your investment amount. Each stake runs for 365 days.
              </span>
            </span>
          </h3>

          <div className="sp-balances-grid">
            <div>
              <span className="sp-stat-label">Available Balance</span>
              <h4>{btcBalance} {tokenSymbol}</h4>
            </div>
            <div>
              <span className="sp-stat-label">Est. USD Value</span>
              <h4>${estimatedUsd.toFixed(2)}</h4>
            </div>
          </div>

          <div className="sp-input-block">
            <div className="sp-input-label-row">
              <span>Amount to Stake</span>
            </div>
            <input
              type="number"
              placeholder="0.00"
              className="sp-field-input"
              value={stakeBtcAmount}
              onChange={(e) => setStakeBtcAmount(e.target.value)}
            />
          </div>

          <div className="sp-shortcuts-grid">
            <button className="sp-shortcut-btn" onClick={() => setStakeBtcAmount((parseFloat(btcBalance) * 0.25).toFixed(2))}>25%</button>
            <button className="sp-shortcut-btn" onClick={() => setStakeBtcAmount((parseFloat(btcBalance) * 0.5).toFixed(2))}>50%</button>
            <button className="sp-shortcut-btn" onClick={() => setStakeBtcAmount((parseFloat(btcBalance) * 0.75).toFixed(2))}>75%</button>
            <button className="sp-shortcut-btn" onClick={() => setStakeBtcAmount(btcBalance)}>100%</button>
          </div>

          {selectedTier && (
            <div className="sp-details-panel" style={{ marginTop: "12px" }}>
              <div className="sp-detail-row">
                <span>Your ROI Tier</span>
                <span className="sp-gold-text font-bold">{selectedTier.rate}% Daily</span>
              </div>
            </div>
          )}

          {!btcApproved ? (
            <button className="sp-cta-gradient-btn" onClick={approveBtc} disabled={txLoading}>
              {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
              Approve {tokenSymbol}
            </button>
          ) : (
            <button className="sp-cta-gradient-btn" onClick={executeStake} disabled={txLoading || !stakeBtcAmount}>
              {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
              Activate Investment
            </button>
          )}
        </div>

        <div className="sp-card-box sp-side-column">
          <h3 className="sp-card-title">Daily ROI by Amount</h3>
          <div className="sp-custom-table-container">
            <table className="sp-custom-table">
              <thead>
                <tr>
                  <th>Investment (USD)</th>
                  <th>Daily ROI</th>
                </tr>
              </thead>
              <tbody>
                {ROI_TIERS.map((tier) => (
                  <tr key={tier.min} className={selectedTier === tier ? "sp-row-highlight" : ""}>
                    <td>${tier.min.toLocaleString()} – ${tier.max.toLocaleString()}</td>
                    <td className="sp-gold-text font-bold">{tier.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="sp-details-panel" style={{ marginTop: "16px" }}>
            <div className="sp-detail-row"><span>Min Investment</span><span>$10 USDT</span></div>
            <div className="sp-detail-row"><span>Max Investment</span><span>$10,000 USDT</span></div>
            <div className="sp-detail-row"><span>Cycle</span><span>365 Days</span></div>
            <div className="sp-detail-row"><span>Network</span><span>BEP20</span></div>
          </div>
        </div>
      </div>

      <div className="sp-card-box sp-stakes-list-card">
        <h3 className="sp-card-title">Your Active Investments</h3>
        <div className="sp-custom-table-container">
          <table className="sp-custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Amount</th>
                <th>Daily ROI</th>
                <th>Days Left</th>
                <th>Rewards</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {userStakesList.map((st) => (
                <tr key={st.index}>
                  <td className="sp-font-mono">#STK-{String(st.index).padStart(5, "0")}</td>
                  <td className="sp-gold-text font-bold">{st.amountTokens} {tokenSymbol}</td>
                  <td>{(st.ratePerDay / 100).toFixed(2)}%</td>
                  <td>{st.daysLeft} days</td>
                  <td>
                    <div>{parseFloat(st.pendingTokens).toFixed(4)} {tokenSymbol}</div>
                    <span className="sp-text-xxs opacity-75">${parseFloat(st.rewardClaimedUSD).toFixed(2)} claimed</span>
                  </td>
                  <td>
                    <span className={st.active ? "sp-badge-status-unlocked" : "sp-badge-status-locked"}>
                      {st.active ? "Active" : "Completed"}
                    </span>
                  </td>
                  <td>
                    <div className="sp-actions-flex">
                      <button className="sp-small-cta-btn" onClick={() => executeClaim(st.index)} disabled={txLoading || parseFloat(st.pendingTokens) <= 0}>
                        Claim
                      </button>
                      <button className="sp-small-danger-btn" onClick={() => executeUnstake(st.index)} disabled={txLoading || st.daysLeft > 0}>
                        Withdraw
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {userStakesList.length === 0 && (
                <tr>
                  <td colSpan="7" className="sp-text-center opacity-75">No active investments. Stake to start earning.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StakingPortal;

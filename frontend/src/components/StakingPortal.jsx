import React from "react";
import { Info, Loader2 } from "lucide-react";
import "./StakingPortal.css";

function StakingPortal({
  tokenSymbol,
  userInfo,
  userStakesList,
  btcBalance,
  stakeBtcAmount,
  setStakeBtcAmount,
  lockupMonths,
  setLockupMonths,
  btcApproved,
  approveBtc,
  executeStake,
  executeClaim,
  executeUnstake,
  calcAmount,
  setCalcAmount,
  calcYears,
  setCalcYears,
  calcYield,
  setCalcYield,
  compoundingResults,
  couponInput,
  setCouponInput,
  executeApplyCoupon,
  txLoading,
  isCalcOpen,
  setIsCalcOpen
}) {
  return (
    <div className="sp-tab-pane">
      {/* Top stats for stake tab */}
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
          <span className="sp-stat-label">Current APY</span>
          <h3 className="sp-stat-value sp-font-mono">180% - 365%</h3>
        </div>
        <div className="sp-stat-card sp-card-balance">
          <span className="sp-stat-label">Compound Rewards</span>
          <h3 className="sp-stat-value text-green">Enabled</h3>
        </div>
      </section>

      <div className="sp-stake-grid">
        {/* New stake layout */}
        <div className="sp-card-box sp-main-column">
          <h3 className="sp-card-title sp-title-flex">
            Stake {tokenSymbol}
            <span className="sp-tooltip-trigger">
              <Info size={16} />
              <span className="sp-tooltip-popup">
                Stake your tokens to start earning daily yield. Lock options grant higher rates.
              </span>
            </span>
          </h3>

          <div className="sp-balances-grid">
            <div>
              <span className="sp-stat-label">Available Balance</span>
              <h4>{btcBalance} {tokenSymbol}</h4>
            </div>
            <div>
              <span className="sp-stat-label">Balance in Wallet</span>
              <h4>{btcBalance} {tokenSymbol}</h4>
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

          <div className="sp-input-block">
            <span className="sp-input-desc mb-2 block">Staking Mode</span>
            <select 
              className="sp-staking-mode-select"
              value={lockupMonths}
              onChange={(e) => setLockupMonths(Number(e.target.value))}
            >
              <option value={0}>Normal Staking (0.5% Daily)</option>
              <option value={3}>3 Months Locked (0.6% Daily)</option>
              <option value={6}>6 Months Locked (0.75% Daily)</option>
              <option value={12}>12 Months Locked (1.0% Daily)</option>
            </select>
          </div>

          {!btcApproved ? (
            <button className="sp-cta-gradient-btn" onClick={approveBtc} disabled={txLoading}>
              {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
              Approve {tokenSymbol}
            </button>
          ) : (
            <button className="sp-cta-gradient-btn" onClick={executeStake} disabled={txLoading || !stakeBtcAmount}>
              {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
              Stake Now
            </button>
          )}
        </div>

        {/* Staking info sidebar block */}
        <div className="sp-card-box sp-side-column">
          <h3 className="sp-card-title">Staking Information</h3>
          <div className="sp-details-panel">
            <div className="sp-detail-row">
              <span>Minimum Stake</span>
              <span>10 {tokenSymbol}</span>
            </div>
            <div className="sp-detail-row">
              <span>Lock-in Period</span>
              <span>{lockupMonths * 30} Days</span>
            </div>
            <div className="sp-detail-row">
              <span>Reward Payout</span>
              <span>Daily</span>
            </div>
            <div className="sp-detail-row">
              <span>Early Unstake Fee</span>
              <span>{lockupMonths > 0 ? "5% Penalty + 10% Fee" : "10% Fee"}</span>
            </div>
            <div className="sp-detail-row">
              <span>Expected Daily Yield</span>
              <span className="sp-gold-text font-bold">
                {lockupMonths === 0 ? "0.5%" : ""}
                {lockupMonths === 3 ? "0.6%" : ""}
                {lockupMonths === 6 ? "0.75%" : ""}
                {lockupMonths === 12 ? "1.0%" : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Stakes List */}
      <div className="sp-card-box sp-stakes-list-card">
        <h3 className="sp-card-title">Your Stakes</h3>
        <div className="sp-custom-table-container">
          <table className="sp-custom-table">
            <thead>
              <tr>
                <th>Stake ID</th>
                <th>Amount</th>
                <th>Expected Rate</th>
                <th>Rewards Earned</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {userStakesList.map((st, idx) => (
                <tr key={idx}>
                  <td className="sp-font-mono">#STK-{String(st.index).padStart(5, '0')}</td>
                  <td className="sp-gold-text font-bold">{st.amountTokens} {tokenSymbol}</td>
                  <td>{((st.ratePerDay * 365) / 100).toFixed(2)}% APY</td>
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
                      <button className="sp-small-danger-btn" onClick={() => executeUnstake(st.index)} disabled={txLoading}>
                        Unstake
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {userStakesList.length === 0 && (
                <tr>
                  <td colSpan="6" className="sp-text-center opacity-75">No active stakes found.</td>
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

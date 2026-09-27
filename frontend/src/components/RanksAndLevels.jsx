import React, { useMemo } from "react";
import { Trophy, Loader2, Check, Copy, Users, DollarSign } from "lucide-react";
import { PLAN_RANK_BONUSES, PLAN_MONTHLY_SALARIES } from "../planConfig";
import "./RanksAndLevels.css";
import "./Affiliates.css";

function RanksAndLevels({
  tokenSymbol,
  userInfo,
  rankNames,
  rankBonusStatus,
  qualifiedSalaryRank,
  executeClaimRankBonus,
  executeClaimMonthlySalary,
  levelCommissions,
  txLoading,
  encryptAddress,
  account,
  copyReferralLink,
  copiedLink,
  subTab = "rank",
  setSubTab
}) {
  const highestQualifiedRank = rankBonusStatus.reduce((max, s, i) => (s.qualified ? i : max), -1);
  const currentRankName = highestQualifiedRank >= 0 ? rankNames[highestQualifiedRank] : "No Rank";

  const referralLink = useMemo(() => {
    if (!account || typeof window === "undefined") return "";
    const ref = encryptAddress(account);
    return `${window.location.origin}${window.location.pathname}#/app?ref=${ref}`;
  }, [account, encryptAddress]);

  return (
    <div className="rl-tab-pane">
      <div className="rl-subtab-nav">
        <button
          type="button"
          className={`rl-subtab-btn ${subTab === "rank" ? "active" : ""}`}
          onClick={() => setSubTab("rank")}
        >
          <Trophy size={16} /> Rank & Salary
        </button>
        <button
          type="button"
          className={`rl-subtab-btn ${subTab === "referral" ? "active" : ""}`}
          onClick={() => setSubTab("referral")}
        >
          <Users size={16} /> Referral Program
        </button>
      </div>

      {subTab === "rank" ? (
        <>
          <div className="rl-rank-progress-banner-modern">
            <div className="rl-banner-left">
              <div className="rl-current-rank-icon-badge">
                <Trophy size={28} />
              </div>
              <div>
                <span className="rl-banner-subtitle">Current Rank</span>
                <h2 className="rl-rank-title">{currentRankName}</h2>
              </div>
            </div>
          </div>

          {qualifiedSalaryRank >= 0 && (
            <button
              type="button"
              className="rl-claim-salary-btn ui-btn-gold"
              disabled={txLoading}
              onClick={() => executeClaimMonthlySalary()}
            >
              {txLoading ? <Loader2 className="animate-spin" size={18} /> : null}
              Claim Monthly Salary ({PLAN_MONTHLY_SALARIES[qualifiedSalaryRank].rank} – $
              {PLAN_MONTHLY_SALARIES[qualifiedSalaryRank].salaryUsd})
            </button>
          )}

          <div className="rl-table-section af-card-box">
            <h3 className="rl-section-title">Rank Bonus (One-Time USDT)</h3>
            <div className="rl-table-wrap rl-desktop-only">
              <table className="rl-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Self {tokenSymbol}</th>
                    <th>Direct</th>
                    <th>Team Size</th>
                    <th>Reward (USDT)</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {PLAN_RANK_BONUSES.map((r, idx) => {
                    const status = rankBonusStatus[idx] || {};
                    return (
                      <tr key={r.rank}>
                        <td className="gold-text font-bold">{rankNames[idx]}</td>
                        <td>${r.selfUsd.toLocaleString()}</td>
                        <td>{r.directs}</td>
                        <td>{r.team.toLocaleString()}</td>
                        <td className="gold-text">${r.bonusUsd.toLocaleString()}</td>
                        <td>
                          {status.claimed ? (
                            <span className="rl-status claimed"><Check size={14} /> Claimed</span>
                          ) : status.qualified ? (
                            <button
                              type="button"
                              className="rl-claim-btn"
                              disabled={txLoading}
                              onClick={() => executeClaimRankBonus(idx)}
                            >
                              Claim
                            </button>
                          ) : (
                            <span className="rl-status locked">Locked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="rl-rank-mobile-list rl-mobile-only">
              {PLAN_RANK_BONUSES.map((r, idx) => {
                const status = rankBonusStatus[idx] || {};
                return (
                  <div key={r.rank} className="rl-rank-mobile-card">
                    <div className="rl-rank-mobile-head">
                      <span className="gold-text font-bold">{rankNames[idx]}</span>
                      <span className="gold-text font-bold">${r.bonusUsd.toLocaleString()} USDT</span>
                    </div>
                    <div className="rl-rank-mobile-grid">
                      <span>Self {tokenSymbol}</span>
                      <strong>${r.selfUsd.toLocaleString()}</strong>
                      <span>Direct</span>
                      <strong>{r.directs}</strong>
                      <span>Team Size</span>
                      <strong>{r.team.toLocaleString()}</strong>
                    </div>
                    <div className="rl-rank-mobile-action">
                      {status.claimed ? (
                        <span className="rl-status claimed"><Check size={14} /> Claimed</span>
                      ) : status.qualified ? (
                        <button
                          type="button"
                          className="rl-claim-btn"
                          disabled={txLoading}
                          onClick={() => executeClaimRankBonus(idx)}
                        >
                          Claim Bonus
                        </button>
                      ) : (
                        <span className="rl-status locked">Locked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rl-table-section af-card-box">
            <h3 className="rl-section-title">Salary Bonus (Monthly USDT)</h3>
            <div className="rl-table-wrap rl-desktop-only">
              <table className="rl-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Self {tokenSymbol}</th>
                    <th>Direct</th>
                    <th>Team Size</th>
                    <th>Salary (USDT)</th>
                  </tr>
                </thead>
                <tbody>
                  {PLAN_MONTHLY_SALARIES.map((row, idx) => (
                    <tr key={row.rank}>
                      <td className="gold-text font-bold">{row.rank}</td>
                      <td>${row.selfUsd.toLocaleString()}</td>
                      <td>{row.directs}</td>
                      <td>{row.team.toLocaleString()}</td>
                      <td className="gold-text">${row.salaryUsd.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rl-rank-mobile-list rl-mobile-only">
              {PLAN_MONTHLY_SALARIES.map((row) => (
                <div key={row.rank} className="rl-rank-mobile-card">
                  <div className="rl-rank-mobile-head">
                    <span className="gold-text font-bold">{row.rank}</span>
                    <span className="gold-text font-bold">${row.salaryUsd.toLocaleString()}/mo</span>
                  </div>
                  <div className="rl-rank-mobile-grid">
                    <span>Self {tokenSymbol}</span>
                    <strong>${row.selfUsd.toLocaleString()}</strong>
                    <span>Direct</span>
                    <strong>{row.directs}</strong>
                    <span>Team Size</span>
                    <strong>{row.team.toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rl-referral-pane">
          <div className="af-card-box rl-referral-card">
            <h3 className="af-card-title">Your Referral Link</h3>
            <p className="rl-referral-hint">
              Level income: 8% (L1), 1% (L2–5), 0.5% (L6–10), 0.25% (L11–15), 0.1% (L16–20) on team
              mint volume.
            </p>
            <div className="af-link-copy-block rl-link-copy-block">
              <input
                type="text"
                readOnly
                className="af-copy-input rl-copy-input"
                value={referralLink}
                aria-label="Referral link"
              />
              <button
                type="button"
                className="af-copy-btn"
                onClick={copyReferralLink}
                title="Copy referral link"
              >
                {copiedLink ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="af-card-box rl-referral-card">
            <h3 className="af-card-title">Level Income (20 Levels)</h3>
            <div className="af-level-list rl-level-income-list">
              {levelCommissions.map((pct, i) => (
                <div key={i} className="af-level-row rl-level-row">
                  <span>L{i + 1}</span>
                  <strong className="rl-level-pct">{pct}%</strong>
                </div>
              ))}
            </div>

            <div className="rl-referral-metrics">
              <div className="rl-referral-metric">
                <Users size={20} className="gold-text" />
                <div>
                  <span className="rl-referral-metric-label">Direct Referrals</span>
                  <strong className="rl-referral-metric-value">{userInfo.directReferralsCount}</strong>
                </div>
              </div>
              <div className="rl-referral-metric">
                <DollarSign size={20} className="gold-text" />
                <div>
                  <span className="rl-referral-metric-label">Team Business (USD)</span>
                  <strong className="rl-referral-metric-value">
                    ${parseFloat(userInfo.totalTeamBusinessUSD || 0).toFixed(2)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RanksAndLevels;

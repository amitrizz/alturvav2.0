import React from "react";
import { Trophy, Loader2, Info, Check, Copy, Users, DollarSign } from "lucide-react";
import { SALARY_RANK_NAMES } from "../abis";
import "./RanksAndLevels.css";
import "./Affiliates.css";

const RANK_BONUSES = [
  { self: 100, directs: 2, team: 5, bonus: 20 },
  { self: 500, directs: 5, team: 15, bonus: 100 },
  { self: 1000, directs: 10, team: 50, bonus: 500 },
  { self: 2500, directs: 15, team: 100, bonus: 1500 },
  { self: 5000, directs: 20, team: 250, bonus: 5000 },
  { self: 10000, directs: 30, team: 500, bonus: 10000 },
  { self: 15000, directs: 40, team: 1000, bonus: 20000 },
  { self: 25000, directs: 50, team: 2500, bonus: 30000 },
  { self: 50000, directs: 75, team: 5000, bonus: 40000 },
  { self: 100000, directs: 100, team: 10000, bonus: 50000 },
];

const MONTHLY_SALARIES = [
  { self: 1000, directs: 10, team: 50, salary: 50 },
  { self: 2500, directs: 15, team: 100, salary: 200 },
  { self: 5000, directs: 20, team: 250, salary: 500 },
  { self: 10000, directs: 30, team: 500, salary: 1000 },
  { self: 15000, directs: 40, team: 1000, salary: 2500 },
  { self: 25000, directs: 50, team: 2500, salary: 5000 },
  { self: 50000, directs: 75, team: 5000, salary: 7500 },
  { self: 100000, directs: 100, team: 10000, salary: 10000 },
];

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

  return (
    <div className="rl-tab-pane">
      <div className="rl-subtab-switcher" style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
        <button
          className={`rl-subtab-btn ${subTab === "rank" ? "active" : ""}`}
          onClick={() => setSubTab("rank")}
          style={{
            flex: 1, padding: "12px", borderRadius: "10px",
            border: "1px solid var(--rl-border, rgba(148,163,184,0.1))",
            background: subTab === "rank" ? "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)" : "rgba(255,255,255,0.02)",
            color: subTab === "rank" ? "#000" : "#fff", fontWeight: "bold", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}
        >
          <Trophy size={18} /> Rank & Salary
        </button>
        <button
          className={`rl-subtab-btn ${subTab === "referral" ? "active" : ""}`}
          onClick={() => setSubTab("referral")}
          style={{
            flex: 1, padding: "12px", borderRadius: "10px",
            border: "1px solid var(--rl-border, rgba(148,163,184,0.1))",
            background: subTab === "referral" ? "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)" : "rgba(255,255,255,0.02)",
            color: subTab === "referral" ? "#000" : "#fff", fontWeight: "bold", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
          }}
        >
          <Users size={18} /> Level Income
        </button>
      </div>

      {subTab === "rank" ? (
        <>
          <div className="rl-rank-progress-banner-modern">
            <div className="rl-header-flex">
              <div className="rl-current-rank-icon-badge">
                <Trophy size={32} className="gold-text" />
              </div>
              <div>
                <span className="stat-label">Your Current Rank</span>
                <h2 className="rl-rank-title">{currentRankName}</h2>
                <span className="text-xs opacity-75">
                  Self: ${parseFloat(userInfo.totalSelfStakeUSD).toFixed(0)} · Directs: {userInfo.directReferralsCount} · Team: {userInfo.teamSize}
                </span>
              </div>
            </div>
            {qualifiedSalaryRank >= 0 && (
              <button className="rl-cta-gradient-btn" onClick={executeClaimMonthlySalary} disabled={txLoading}>
                {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : <DollarSign size={18} />}
                Claim Monthly Salary ({SALARY_RANK_NAMES[qualifiedSalaryRank]} – ${MONTHLY_SALARIES[qualifiedSalaryRank].salary})
              </button>
            )}
          </div>

          <div className="rl-card-box" style={{ marginBottom: "20px" }}>
            <h3 className="rl-card-title">Rank Bonus (One-Time USDT)</h3>
            <div className="sp-custom-table-container">
              <table className="sp-custom-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Self Invest</th>
                    <th>Directs</th>
                    <th>Team Size</th>
                    <th>Bonus</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {RANK_BONUSES.map((r, idx) => {
                    const status = rankBonusStatus[idx] || {};
                    return (
                      <tr key={idx}>
                        <td className="gold-text font-bold">{rankNames[idx]}</td>
                        <td>${r.self.toLocaleString()}</td>
                        <td>{r.directs}</td>
                        <td>{r.team.toLocaleString()}</td>
                        <td className="gold-text">${r.bonus.toLocaleString()}</td>
                        <td>
                          {status.claimed ? (
                            <span className="badge-status-unlocked">Claimed</span>
                          ) : status.qualified ? (
                            <button className="sp-small-cta-btn" onClick={() => executeClaimRankBonus(idx)} disabled={txLoading}>
                              Claim
                            </button>
                          ) : (
                            <span className="badge-status-locked">Locked</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rl-card-box">
            <h3 className="rl-card-title">Monthly Salary Bonus (USDT)</h3>
            <div className="sp-custom-table-container">
              <table className="sp-custom-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Self {tokenSymbol}</th>
                    <th>Directs</th>
                    <th>Team Size</th>
                    <th>Salary/mo</th>
                  </tr>
                </thead>
                <tbody>
                  {MONTHLY_SALARIES.map((s, idx) => (
                    <tr key={idx} className={qualifiedSalaryRank === idx ? "sp-row-highlight" : ""}>
                      <td className="gold-text font-bold">{SALARY_RANK_NAMES[idx]}</td>
                      <td>${s.self.toLocaleString()}</td>
                      <td>{s.directs}</td>
                      <td>{s.team.toLocaleString()}</td>
                      <td className="gold-text">${s.salary.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="af-affiliates-grid">
            <div className="af-card-box af-main-column">
              <h3 className="af-card-title af-title-flex">
                Your Referral Link
                <span className="af-tooltip-trigger">
                  <Info size={16} />
                  <span className="af-tooltip-popup">Share to earn commissions across 20 levels.</span>
                </span>
              </h3>
              <div className="af-link-copy-block">
                <input type="text" readOnly value={`${window.location.origin}${window.location.pathname}#/app?ref=${encryptAddress(account)}`} className="af-copy-input" />
                <button className="af-copy-btn" onClick={copyReferralLink}>
                  {copiedLink ? <Check size={18} className="text-green" /> : <Copy size={18} />}
                </button>
              </div>
              <div className="af-details-panel" style={{ marginTop: "16px" }}>
                <div className="af-detail-row"><span>Direct Referrals</span><span>{userInfo.directReferralsCount}</span></div>
                <div className="af-detail-row"><span>Team Size</span><span>{userInfo.teamSize}</span></div>
                <div className="af-detail-row"><span>Team Volume</span><span>${parseFloat(userInfo.totalTeamBusinessUSD).toFixed(2)}</span></div>
              </div>
            </div>

            <div className="af-card-box af-side-column">
              <h3 className="af-card-title">20-Level Commission</h3>
              <div className="af-level-list">
                {levelCommissions.map((pct, idx) => (
                  <div className="af-level-row" key={idx}>
                    <span>Level {idx + 1} ({pct}%)</span>
                    <span className={`af-status-badge ${userInfo.directActiveCount >= (idx + 1) ? "unlocked" : "locked"}`}>
                      {userInfo.directActiveCount >= (idx + 1) ? "Active" : "Locked"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default RanksAndLevels;

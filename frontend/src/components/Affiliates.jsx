import React from "react";
import { Info, Check, Copy } from "lucide-react";
import "./Affiliates.css";

function Affiliates({
  tokenSymbol,
  userInfo,
  account,
  encryptAddress,
  copyReferralLink,
  copiedLink
}) {
  return (
    <div className="af-tab-pane">
      {/* Top stats for affiliate tab */}
      <section className="af-stats-strip af-stats-4-columns">
        <div className="af-stat-card af-card-price">
          <span className="af-stat-label">Total Referrals</span>
          <h3 className="af-stat-value">128 Users</h3>
        </div>
        <div className="af-stat-card af-card-supply">
          <span className="af-stat-label">Direct Active</span>
          <h3 className="af-stat-value">{userInfo.directActiveCount} Active</h3>
        </div>
        <div className="af-stat-card af-card-remaining">
          <span className="af-stat-label">Total Volume</span>
          <h3 className="af-stat-value">${parseFloat(userInfo.totalTeamBusinessUSD).toFixed(2)}</h3>
        </div>
        <div className="af-stat-card af-card-balance">
          <span className="af-stat-label">Total Earnings</span>
          <h3 className="af-stat-value gold-text">$1,250.30</h3>
        </div>
      </section>

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
      <div className="af-card-box af-table-card">
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
    </div>
  );
}

export default Affiliates;

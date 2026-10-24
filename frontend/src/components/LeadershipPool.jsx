import React from 'react';
import { Award, Clock, TrendingUp, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Shield } from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';

export default function LeadershipPool({ userData, onClaimLeadership, txLoading }) {
  const selfPkg = Number(userData?.totalPackageUSD || 100);
  const totalEarned = Number(userData?.totalEarnedUSD || 180);
  const fiveXCap = selfPkg * 5;
  const progressPct = Math.min(100, (totalEarned / fiveXCap) * 100);

  const isNexus = selfPkg >= 50 && (userData?.directActiveCount || 2) >= 2;
  const isCrown = selfPkg >= 100 && (userData?.directActiveCount || 2) >= 2;

  const nexusDailyPool = 4500; // Simulated active 3% pool balance
  const crownDailyPool = 3000; // Simulated active 2% pool balance

  return (
    <div className="leadership-wrap">
      {/* Header Banner */}
      <div className="stream-header-card glass-panel">
        <div className="sh-top">
          <div className="sh-title-box">
            <span className="sh-pill gold-gradient-text">STREAM 4 (5% TOTAL POOL)</span>
            <h2>LEADERSHIP ACHIEVEMENT INCOME</h2>
            <p>Exclusive daily profit-sharing pools for top performing community builders.</p>
          </div>
          <div className="sh-stats-box">
            <div className="stat-mini">
              <span>Daily Pool Total:</span>
              <strong className="gold-gradient-text">${(nexusDailyPool + crownDailyPool).toLocaleString()} USDT</strong>
            </div>
            <div className="stat-mini">
              <span>Distribution Cycle:</span>
              <strong className="cyan-gradient-text">Every 24 Hours (50/50 Rule)</strong>
            </div>
          </div>
        </div>

        {/* 50% Pay & 50% Carry Forward Rule */}
        <div className="daily-rules-strip glass-panel">
          <div className="rule-badge-col">
            <span className="r-tag">50% CURRENT DAY PAYOUT</span>
            <p>50% of the daily pool is distributed equally to all verified qualified rank holders.</p>
          </div>
          <div className="rule-sep">+</div>
          <div className="rule-badge-col">
            <span className="r-tag cyan">50% CARRY FORWARD</span>
            <p>50% rolls over to the next day, continuously compounding pool depth and stability.</p>
          </div>
        </div>
      </div>

      {/* Ranks Showcase Grid */}
      <div className="ranks-dual-grid">
        {/* Rank 1: NEXUS */}
        <div className={`rank-card-box glass-panel nexus-box ${isNexus ? 'qualified-glow' : ''}`}>
          <div className="rc-header">
            <div className="rc-badge-title">
              <span className="rank-roman">RANK 1ST</span>
              <h3>NEXUS</h3>
            </div>
            <div className="pool-pct-pill cyan-gradient-text">3% DAILY POOL</div>
          </div>

          <div className="rc-pool-val">
            <span className="val-lbl">Today's Nexus Pool:</span>
            <strong className="cyan-gradient-text">${nexusDailyPool.toLocaleString()} USDT</strong>
          </div>

          <div className="rc-requirements glass-panel">
            <h4>Qualification Criteria:</h4>
            <ul>
              <li>
                <CheckCircle2 size={16} className={selfPkg >= 50 ? 'green' : 'gray'} />
                <span>Self Package ≥ <strong>$50 USDT</strong> ({selfPkg >= 50 ? 'Met' : 'Not Met'})</span>
              </li>
              <li>
                <CheckCircle2 size={16} className={(userData?.directActiveCount || 2) >= 2 ? 'green' : 'gray'} />
                <span>Within 3 Days (72h), 2 Direct Members ≥ <strong>$50 USDT</strong></span>
              </li>
            </ul>
          </div>

          <div className="rc-status-footer">
            <span className={`status-tag ${isNexus ? 'active' : 'pending'}`}>
              {isNexus ? '✓ Qualified for Nexus Pool' : 'Needs 2 Directs ≥ $50'}
            </span>
            <button 
              className="claim-rank-btn"
              onClick={onClaimLeadership}
              disabled={!isNexus || txLoading}
            >
              {txLoading ? 'Claiming...' : 'Claim Nexus Bonus'}
            </button>
          </div>
        </div>

        {/* Rank 2: LEGACY CROWN */}
        <div className={`rank-card-box glass-panel crown-box ${isCrown ? 'qualified-glow' : ''}`}>
          <div className="rc-header">
            <div className="rc-badge-title">
              <span className="rank-roman gold">RANK 2ND</span>
              <h3 className="gold-gradient-text">LEGACY CROWN</h3>
            </div>
            <div className="pool-pct-pill gold-gradient-text">2% DAILY POOL</div>
          </div>

          <div className="rc-pool-val">
            <span className="val-lbl">Today's Crown Pool:</span>
            <strong className="gold-gradient-text">${crownDailyPool.toLocaleString()} USDT</strong>
          </div>

          <div className="rc-requirements glass-panel">
            <h4>Qualification Criteria:</h4>
            <ul>
              <li>
                <CheckCircle2 size={16} className={selfPkg >= 100 ? 'green' : 'gray'} />
                <span>Self Package ≥ <strong>$100 USDT</strong> ({selfPkg >= 100 ? 'Met' : 'Not Met'})</span>
              </li>
              <li>
                <CheckCircle2 size={16} className={(userData?.directActiveCount || 2) >= 2 ? 'green' : 'gray'} />
                <span>Within 3 Days (72h), 2 Direct Members ≥ <strong>$100 USDT</strong></span>
              </li>
            </ul>
          </div>

          <div className="rc-status-footer">
            <span className={`status-tag ${isCrown ? 'active' : 'pending'}`}>
              {isCrown ? '✓ Qualified for Legacy Crown Pool' : 'Needs 2 Directs ≥ $100'}
            </span>
            <button 
              className="claim-rank-btn gold"
              onClick={onClaimLeadership}
              disabled={!isCrown || txLoading}
            >
              {txLoading ? 'Claiming...' : 'Claim Crown Bonus'}
            </button>
          </div>
        </div>
      </div>

      {/* Slide 13: Rank Exit Rule (5x Cap Progress) */}
      <div className="rank-exit-panel glass-panel">
        <div className="rep-left">
          <div className="rep-title">
            <AlertCircle size={20} className="gold" />
            <h3>RANK EXIT RULE (5X INCOME CAP)</h3>
          </div>
          <p>
            When your cumulative income from any stream reaches <strong>5x of your self-investment</strong> (${fiveXCap.toLocaleString()} USDT), you exit from rank income only. All other 4 income streams continue completely unaffected!
          </p>
        </div>

        <div className="rep-progress-box">
          <div className="rep-nums">
            <span>Cumulative: ${totalEarned.toLocaleString()} USDT</span>
            <span className="gold-gradient-text">Cap: ${fiveXCap.toLocaleString()} USDT (5x)</span>
          </div>
          <div className="rep-bar-wrap">
            <div className="rep-bar" style={{ width: `${progressPct}%` }}></div>
          </div>
          <small>{progressPct.toFixed(1)}% of 5x limit reached</small>
        </div>
      </div>
    </div>
  );
}

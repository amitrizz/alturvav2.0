import React, { useState, useEffect } from 'react';
import { Award, Clock, TrendingUp, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Shield, Gift, Zap, Flame } from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';

export default function LeadershipPool({ userData, onClaimLeadership, txLoading }) {
  const [fomoSeconds, setFomoSeconds] = useState(86400 * 0.72); // ~17h 16m left
  const selfPkg = Number(userData?.activePackageUSD || userData?.totalPackageUSD || 100);
  const directCount = Number(userData?.directActiveCount || userData?.directCount || 0);

  // FOMO Apocalypse Jackpot simulated 5% pool balance
  const fomoJackpotPool = 17140; // 5% pool
  const buyersShare70 = (fomoJackpotPool * 0.7).toFixed(0);
  const sponsorsShare30 = (fomoJackpotPool * 0.3).toFixed(0);

  // 72H Cashback surge status
  const isCashbackQualified = directCount >= 3;

  useEffect(() => {
    const timer = setInterval(() => {
      setFomoSeconds(prev => (prev > 0 ? prev - 1 : 86400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="leadership-wrap">
      {/* Header Banner */}
      <div className="stream-header-card glass-panel">
        <div className="sh-top">
          <div className="sh-title-box">
            <span className="sh-pill gold-gradient-text">POOLS 04 & 05 (15% TOTAL LIVE SPLIT)</span>
            <h2>FOMO APOCALYPSE & CASHBACK SURGE</h2>
            <p>24-Hour Automated Countdown Jackpot (5%) & 72-Hour Direct Mission Refund (10%).</p>
          </div>
          <div className="sh-stats-box">
            <div className="stat-mini">
              <span>FOMO Jackpot Pool (5%):</span>
              <strong className="gold-gradient-text">${fomoJackpotPool.toLocaleString()} USDT</strong>
            </div>
            <div className="stat-mini">
              <span>Next FOMO Settlement:</span>
              <strong className="cyan-gradient-text">{formatCountdown(fomoSeconds)}</strong>
            </div>
          </div>
        </div>

        {/* 70/30 Rule */}
        <div className="daily-rules-strip glass-panel">
          <div className="rule-badge-col">
            <span className="r-tag">70% LAST 50 PAID USERS</span>
            <p>${buyersShare70} USDT split equally among the last 50 members who activated on-chain.</p>
          </div>
          <div className="rule-sep">+</div>
          <div className="rule-badge-col">
            <span className="r-tag cyan">30% TOP 3 SPONSORS</span>
            <p>${sponsorsShare30} USDT shared among the top 3 direct sponsors of this 24-hour cycle.</p>
          </div>
        </div>
      </div>

      {/* 2 Special Pools Grid */}
      <div className="ranks-dual-grid">
        {/* Pool 5: FOMO Apocalypse Jackpot */}
        <div className="rank-card-box glass-panel nexus-box qualified-glow">
          <div className="rc-header">
            <div className="rc-badge-title">
              <span className="rank-roman">POOL 05</span>
              <h3>FOMO APOCALYPSE JACKPOT</h3>
            </div>
            <div className="pool-pct-pill gold-gradient-text">5% COUNTDOWN POOL</div>
          </div>

          <div className="rc-pool-val">
            <span className="val-lbl">Current Round 24H Pot:</span>
            <strong className="gold-gradient-text">${fomoJackpotPool.toLocaleString()} USDT</strong>
          </div>

          <div className="fomo-timer-widget glass-panel">
            <span className="ft-label">ROUND CLOSING IN:</span>
            <span className="ft-timer gold-gradient-text">{formatCountdown(fomoSeconds)}</span>
          </div>

          <div className="rc-requirements glass-panel">
            <h4>Settlement Architecture:</h4>
            <ul>
              <li>
                <CheckCircle2 size={16} className="green" />
                <span><strong>70% Pool Share:</strong> Split among last 50 paid users (~${(Number(buyersShare70)/50).toFixed(1)} USDT each)</span>
              </li>
              <li>
                <CheckCircle2 size={16} className="green" />
                <span><strong>30% Pool Share:</strong> Split among top 3 direct sponsors</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pool 4: 72H Alpha Cashback Surge */}
        <div className={`rank-card-box glass-panel crown-box ${isCashbackQualified ? 'qualified-glow' : ''}`}>
          <div className="rc-header">
            <div className="rc-badge-title">
              <span className="rank-roman">POOL 04</span>
              <h3>72H ALPHA CASHBACK SURGE</h3>
            </div>
            <div className="pool-pct-pill cyan-gradient-text">10% SURGE POOL</div>
          </div>

          <div className="rc-pool-val">
            <span className="val-lbl">Your Potential Refund:</span>
            <strong className="cyan-gradient-text">${selfPkg} USDT (100%)</strong>
          </div>

          <div className="rc-requirements glass-panel">
            <h4>Mission Qualification:</h4>
            <ul>
              <li>
                <CheckCircle2 size={16} className="green" />
                <span>Active Package ≥ <strong>$25 USDT</strong> (Current: ${selfPkg})</span>
              </li>
              <li>
                <CheckCircle2 size={16} className={isCashbackQualified ? 'green' : 'gray'} />
                <span>Sponsor <strong>3 Direct Active Members</strong> within 72h ({directCount}/3 Verified)</span>
              </li>
            </ul>
          </div>

          <div className="rc-action-row">
            {isCashbackQualified ? (
              <button className="claim-rank-btn gold-glow">
                <Gift size={16} /> Claim 100% Fee Refund (${selfPkg} USDT)
              </button>
            ) : (
              <div className="unqual-note">
                <AlertCircle size={14} /> Mission active: Need {Math.max(0, 3 - directCount)} more direct referrals
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Shield, Award, Users, TrendingUp, 
  Gift, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Layers, Flame, Zap, Clock 
} from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';
import { 
  PROTOCOL_NAME, PROTOCOL_EDITION, PROTOCOL_PACKAGES, COMMUNITY_POOLS, 
  LEADER_MECHANISMS, HARD_CAP_RULES, WITHDRAWAL_RULES 
} from '../planConfig';

export default function PresentationModal({ isOpen, onClose, onLaunchApp }) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 10;

  if (!isOpen) return null;

  const nextSlide = () => setCurrentSlide(prev => (prev < totalSlides ? prev + 1 : 1));
  const prevSlide = () => setCurrentSlide(prev => (prev > 1 ? prev - 1 : totalSlides));

  return (
    <div className="pres-modal-overlay" onClick={onClose}>
      <div className="pres-modal-content" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="pres-header">
          <div className="pres-brand">
            <AltruvaLogo size={32} />
            <div>
              <span className="pres-title">{PROTOCOL_NAME.toUpperCase()}</span>
              <span className="pres-subtitle">{PROTOCOL_EDITION.toUpperCase()}</span>
            </div>
          </div>
          <div className="pres-controls">
            <span className="slide-counter">SLIDE {currentSlide} / {totalSlides}</span>
            <button className="pres-close-btn" onClick={onClose}><X size={20} /></button>
          </div>
        </div>

        {/* Slide Canvas Area */}
        <div className="pres-canvas">
          {/* SLIDE 1: COVER */}
          {currentSlide === 1 && (
            <div className="slide-card cover-slide">
              <div className="slide-badge">MASTER FINAL ARCHITECTURE</div>
              <div className="cover-logo-center">
                <AltruvaLogo size={110} />
              </div>
              <h1 className="cover-title">SOVEREIGN GLOBAL</h1>
              <div className="cover-tagline gold-gradient-text">PROTOCOL v3.3 (10X VIRAL EDITION)</div>
              <div className="cover-subtags">
                <span>100% P2P Instant Split</span>
                <span className="dot">•</span>
                <span>Zero Protocol Retention</span>
                <span className="dot">•</span>
                <span>BNB Chain (BSC)</span>
              </div>
              <div className="cover-footer-note">
                Pure BEP-20 USDT Ecosystem · Gas in BNB · Admin Genesis Triangle Chain
              </div>
            </div>
          )}

          {/* SLIDE 2: CORE SETUP & 6 PACKAGES */}
          {currentSlide === 2 && (
            <div className="slide-card">
              <div className="slide-badge">INFRASTRUCTURE & TIERS</div>
              <h2 className="slide-title">THE 6 STANDARD PACKAGES</h2>
              <p className="slide-desc">Choose from 6 transparent tiers on BNB Smart Chain with 100% USDT instant P2P settlement:</p>
              <div className="tiers-slide-grid">
                {PROTOCOL_PACKAGES.map(pkg => (
                  <div key={pkg.val} className="tier-box-item glass-panel">
                    <span className="t-name gold-gradient-text">{pkg.label}</span>
                    <strong className="t-price">${pkg.val} USDT</strong>
                    <span className="t-detail">{pkg.monolineReach} Active Wallets</span>
                    <small>2X ROI: ${pkg.roiCap} | 3X Cap: ${pkg.hardCap3X}</small>
                  </div>
                ))}
              </div>
              <div className="slide-callout-box glass-panel">
                <strong>Genesis Setup:</strong> Top 3 fixed IDs (Admin Triangle Chain) are hardcoded at Genesis to capture all working spillovers and unclaimed breakage.
              </div>
            </div>
          )}

          {/* SLIDE 3: 100% LIVE 5-POOL SPLIT */}
          {currentSlide === 3 && (
            <div className="slide-card">
              <div className="slide-badge">100% LIVE SPLIT</div>
              <h2 className="slide-title">THE 5 COMMUNITY POOLS</h2>
              <p className="slide-desc">Every dollar entering the protocol is split live with zero funds held in contract ledger:</p>
              <div className="pools-overview-grid">
                <div className="pool-overview-card glass-panel">
                  <span className="p-share cyan-gradient-text">30%</span>
                  <h4>1. Time-Bomb Quantum ROI</h4>
                  <p>Global passive pool. 2X cap. First 10 days 3% daily, then 1% daily. 1 direct resets 3% for 10 days!</p>
                </div>
                <div className="pool-overview-card glass-panel">
                  <span className="p-share gold-gradient-text">30%</span>
                  <h4>2. Monoline Nexus Yield</h4>
                  <p>Global single leg. 15 active wallets above and 15 active wallets below @ 1% each with dynamic compression.</p>
                </div>
                <div className="pool-overview-card glass-panel">
                  <span className="p-share cyan-gradient-text">25%</span>
                  <h4>3. Velocity Multi-Tier</h4>
                  <p>9-level generation unilevel. Level 1 is 13% fixed, L2: 3%, L3: 2%, L4-L9: 1% each.</p>
                </div>
                <div className="pool-overview-card glass-panel">
                  <span className="p-share gold-gradient-text">10%</span>
                  <h4>4. 72H Cashback Surge</h4>
                  <p>Sponsor 3 directs in 72 hours for 100% package refund! Unclaimed transfers to Community Airdrop.</p>
                </div>
                <div className="pool-overview-card glass-panel wide">
                  <span className="p-share green-txt">5%</span>
                  <h4>5. FOMO Apocalypse Jackpot</h4>
                  <p>24-hour countdown pool: 70% shared among last 50 paid users and 30% among top 3 direct sponsors.</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: TIME-BOMB QUANTUM ROI */}
          {currentSlide === 4 && (
            <div className="slide-card">
              <div className="slide-badge">STREAM 01</div>
              <h2 className="slide-title">TIME-BOMB QUANTUM ROI (30%)</h2>
              <p className="slide-desc">Global passive yield with built-in viral acceleration hook:</p>
              <div className="roi-breakdown-box glass-panel">
                <div className="roi-phase-card">
                  <span className="phase-lbl cyan-gradient-text">DAYS 1 – 10</span>
                  <strong className="phase-rate">3.0% DAILY</strong>
                  <p>Initial accelerated passive yield window.</p>
                </div>
                <div className="roi-arrow">➔</div>
                <div className="roi-phase-card">
                  <span className="phase-lbl gold-gradient-text">DAY 11 ONWARDS</span>
                  <strong className="phase-rate">1.0% DAILY</strong>
                  <p>Sustained baseline yield until 2X (200%) cap.</p>
                </div>
                <div className="roi-arrow">➔</div>
                <div className="roi-phase-card highlight">
                  <span className="phase-lbl green-txt">1 NEW DIRECT</span>
                  <strong className="phase-rate">RESETS 3.0%</strong>
                  <p>Resets 3% daily rate for another 10 days!</p>
                </div>
              </div>
              <div className="slide-callout-box glass-panel">
                <strong>Withdrawal Rule:</strong> ROI is ALWAYS unlocked with ZERO direct sponsor condition. 40% Cash to wallet / 60% Auto Re-invested.
              </div>
            </div>
          )}

          {/* SLIDE 5: MONOLINE NEXUS YIELD */}
          {currentSlide === 5 && (
            <div className="slide-card">
              <div className="slide-badge">STREAM 02</div>
              <h2 className="slide-title">MONOLINE NEXUS YIELD (30%)</h2>
              <p className="slide-desc">15 Active Uplines + 15 Active Downlines with Dynamic Compression:</p>
              <div className="monoline-diagram glass-panel">
                <div className="mono-row upline">
                  <span className="mono-tag cyan">15 ACTIVE UPLINES (1% EACH = 15%)</span>
                  <p>1% dividend from the 15 active members who joined before you on fresh activations and reinvestments.</p>
                </div>
                <div className="mono-center-node gold-gradient-text">
                  ★ YOUR POSITION (CHRONOLOGICAL GLOBAL ID) ★
                </div>
                <div className="mono-row downline">
                  <span className="mono-tag gold">15 ACTIVE DOWNLINES (1% EACH = 15%)</span>
                  <p>1% dividend from the next 15 active members who join the global timeline anywhere in the world.</p>
                </div>
              </div>
              <div className="slide-callout-box glass-panel">
                <strong>Dynamic Compression:</strong> Inactive or retired IDs are automatically skipped in real time so you only earn from active participants!
              </div>
            </div>
          )}

          {/* SLIDE 6: VELOCITY MULTI-TIER BONUS */}
          {currentSlide === 6 && (
            <div className="slide-card">
              <div className="slide-badge">STREAM 03</div>
              <h2 className="slide-title">VELOCITY MULTI-TIER BONUS (25%)</h2>
              <p className="slide-desc">9 Generation Levels with 13% Direct Commission on Level 1:</p>
              <div className="table-responsive">
                <table className="altruva-table manual-tbl">
                  <thead>
                    <tr>
                      <th>REFERRAL LEVEL</th>
                      <th>COMMISSION %</th>
                      <th>UNLOCK CONDITION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="unlocked-row">
                      <td><strong>Level 1 (Directs)</strong></td>
                      <td className="gold-gradient-text"><strong>13% FIXED</strong></td>
                      <td>0 Directs (ROI open, working locked)</td>
                    </tr>
                    <tr>
                      <td><strong>Level 2</strong></td>
                      <td className="cyan-txt">3%</td>
                      <td>1 Direct Sponsor required</td>
                    </tr>
                    <tr>
                      <td><strong>Level 3</strong></td>
                      <td className="cyan-txt">2%</td>
                      <td>1 Direct Sponsor required</td>
                    </tr>
                    <tr>
                      <td><strong>Levels 4, 5, 6</strong></td>
                      <td>1% each (3% Total)</td>
                      <td>2 Direct Sponsors required</td>
                    </tr>
                    <tr>
                      <td><strong>Levels 7, 8, 9</strong></td>
                      <td>1% each (3% Total)</td>
                      <td>3 Direct Sponsors required</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SLIDE 7: FOMO TRIGGERS */}
          {currentSlide === 7 && (
            <div className="slide-card">
              <div className="slide-badge">INSTANT FOMO</div>
              <h2 className="slide-title">VIRAL CONVERSION TRIGGERS</h2>
              <p className="slide-desc">High-urgency triggers engineered for explosive onboarding:</p>
              <div className="fomo-dual-grid">
                <div className="fomo-card glass-panel">
                  <div className="f-icon cyan"><Clock size={36} /></div>
                  <h3>10-Minute Ghost Position</h3>
                  <p>Wallet connection locks a temporary slot in the global single leg with a <strong>09:59 reverse timer</strong>.</p>
                  <span className="f-warning">Live incoming turnover ticks underneath. If unpaid, position and volume are permanently deleted!</span>
                </div>
                <div className="fomo-card glass-panel">
                  <div className="f-icon gold"><Gift size={36} /></div>
                  <h3>72H Cashback Mission</h3>
                  <p>Sponsor <strong>3 active direct IDs within 72 hours</strong> of activating your package.</p>
                  <span className="f-success">Smart contract automatically issues an instant 100% joining fee refund!</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 8: LEADER RETENTION ENGINES */}
          {currentSlide === 8 && (
            <div className="slide-card">
              <div className="slide-badge">RETENTION HOOKS</div>
              <h2 className="slide-title">LEADER ENGINES & GROWTH HOOKS</h2>
              <p className="slide-desc">Continuous team compounding mechanisms:</p>
              <div className="growth-hooks-list">
                <div className="hook-item glass-panel">
                  <strong className="gold-gradient-text">Speed-Decay Engine:</strong>
                  <p>If no direct is sponsored in 14 days, payout speed temporarily drops from 50% to 10%. 1 new direct instantly restores 100% speed.</p>
                </div>
                <div className="hook-item glass-panel">
                  <strong className="cyan-gradient-text">Dynamic Infinity Override:</strong>
                  <p>4–10 Directs: 5% Override | 11–25 Directs: 7% Override | 26+ Directs: 10% Master Royalty routed to Admin Master Wallet.</p>
                </div>
                <div className="hook-item glass-panel">
                  <strong className="gold-gradient-text">Smart Re-Birth Queue Jump:</strong>
                  <p>Leaders with 3+ directs in the last 30 days have their Re-Birth ID pushed into the VIP Fast-Track Slot instead of the bottom queue.</p>
                </div>
                <div className="hook-item glass-panel">
                  <strong className="green-txt">30-Day Active Maintenance:</strong>
                  <p>Maintain 1 active direct per 30 days to keep the optimal 70% Cash / 30% Reinvest ratio (otherwise 50/50).</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 9: 300% HARD-CAP & RE-BIRTH LOOP */}
          {currentSlide === 9 && (
            <div className="slide-card">
              <div className="slide-badge">ZERO-LEAK SECURITY</div>
              <h2 className="slide-title">300% HARD-CAP & RE-BIRTH LOOP</h2>
              <p className="slide-desc">System immortality through automated capital recycling:</p>
              <div className="hardcap-visual glass-panel">
                <div className="cap-bar-wrap">
                  <span className="cap-lbl">EARNING PROGRESS TOWARDS 300% (3X) HARD-CAP</span>
                  <div className="cap-bar"><div className="cap-fill" style={{ width: '100%' }}></div></div>
                </div>
                <div className="cap-rules-grid">
                  <div className="cr-item">
                    <h4>No-Overflow Rule</h4>
                    <p>Total cumulative income from all streams hard-caps at 300% (3X) of active package. Overflow diverts to Stability Pool.</p>
                  </div>
                  <div className="cr-item">
                    <h4>Re-Birth Loop</h4>
                    <p>Old ID freezes and retires upon 3X. Contract deducts package amount from final payout to spawn a fresh Re-Birth ID!</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 10: WITHDRAWAL & ADMIN SECRETS */}
          {currentSlide === 10 && (
            <div className="slide-card">
              <div className="slide-badge">WITHDRAWAL MATRIX</div>
              <h2 className="slide-title">WITHDRAWALS & MASTER WALLET</h2>
              <p className="slide-desc">Rigid mathematical parameters ensuring eternal liquidity:</p>
              <div className="withdrawal-grid glass-panel">
                <div className="w-box">
                  <span className="w-title cyan">Time-Bomb Quantum ROI</span>
                  <strong className="w-ratio">40% Cash / 60% Re-Invest</strong>
                  <p>Always unlocked with 0 direct sponsor condition. Min withdrawal: $5 USDT.</p>
                </div>
                <div className="w-box">
                  <span className="w-title gold">Working Network Earnings</span>
                  <strong className="w-ratio">70% Cash / 30% Re-Invest</strong>
                  <p>LOCKED until 3 active direct referrals are achieved. Drops to 50/50 if 30-day maintenance lapses.</p>
                </div>
              </div>
              <div className="slide-callout-box glass-panel gold">
                <strong>Admin Master Profit:</strong> Genesis Triangle captures all unclaimed spillovers. 4th+ direct infinity override channels 5%–10% master royalties directly to the Admin Master Wallet!
              </div>
              <div className="final-slide-btn-wrap">
                <button className="launch-app-btn" onClick={onLaunchApp}>
                  Enter Live Protocol Dashboard <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Navigation */}
        <div className="pres-footer">
          <button className="pres-nav-btn" onClick={prevSlide}><ChevronLeft size={18} /> Previous</button>
          <div className="slide-dots">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <span
                key={idx}
                className={`dot-pill ${currentSlide === idx + 1 ? 'active' : ''}`}
                onClick={() => setCurrentSlide(idx + 1)}
              />
            ))}
          </div>
          <button className="pres-nav-btn" onClick={nextSlide}>Next <ChevronRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Shield, Award, Users, TrendingUp, 
  Gift, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Layers 
} from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';

export default function PresentationModal({ isOpen, onClose, onLaunchApp }) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const totalSlides = 17;

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
              <span className="pres-title">ALTRUVA OFFICIAL PRESENTATION</span>
              <span className="pres-subtitle">100% COMMUNITY DISTRIBUTION MODEL</span>
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
              <div className="slide-badge">A GLOBAL COMMUNITY MOVEMENT</div>
              <div className="cover-logo-center">
                <AltruvaLogo size={110} />
              </div>
              <h1 className="cover-title">ALTRUVA</h1>
              <div className="cover-tagline gold-gradient-text">100% COMMUNITY DISTRIBUTION MODEL</div>
              <div className="cover-subtags">
                <span>Community Powered</span>
                <span className="dot">•</span>
                <span>Performance Driven</span>
                <span className="dot">•</span>
                <span>Transparent Distribution</span>
              </div>
              <div className="cover-footer-note">
                Pure BEP-20 USDT Protocol · Built by People for People · <strong>altruva.us · altruva.live</strong>
              </div>
            </div>
          )}

          {/* SLIDE 2: WHAT IS ALTRUVA? */}
          {currentSlide === 2 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>WHAT IS ALTRUVA?</h2>
                <p>ALTRUVA is a community-driven ecosystem designed around participation, contribution, performance and shared progress.</p>
              </div>
              <div className="four-pillars-grid">
                <div className="pillar-box glass-panel">
                  <div className="p-icon cyan-glow"><Users size={32} /></div>
                  <h3>Community</h3>
                  <p>People Powered</p>
                </div>
                <div className="pillar-box glass-panel">
                  <div className="p-icon gold-glow"><Award size={32} /></div>
                  <h3>Contribution</h3>
                  <p>Value Through Participation</p>
                </div>
                <div className="pillar-box glass-panel">
                  <div className="p-icon cyan-glow"><Shield size={32} /></div>
                  <h3>Transparency</h3>
                  <p>Clear & Open On-Chain</p>
                </div>
                <div className="pillar-box glass-panel">
                  <div className="p-icon gold-glow"><TrendingUp size={32} /></div>
                  <h3>Progress</h3>
                  <p>Shared Growth for All</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: OUR VISION */}
          {currentSlide === 3 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>OUR VISION</h2>
                <p className="highlight-lead">
                  "To build a transparent, connected and globally accessible community ecosystem where participation and contribution create opportunities for shared progress."
                </p>
              </div>
              <div className="four-pillars-grid">
                <div className="pillar-box glass-panel">
                  <div className="p-num">01</div>
                  <h3>Global Community</h3>
                  <p>Connecting worldwide participants into a synchronized chronological timeline.</p>
                </div>
                <div className="pillar-box glass-panel">
                  <div className="p-num">02</div>
                  <h3>Connected Opportunities</h3>
                  <p>Every active member upline and downline benefits from shared activity.</p>
                </div>
                <div className="pillar-box glass-panel">
                  <div className="p-num">03</div>
                  <h3>Sustainable Growth</h3>
                  <p>No debt, zero token emission inflation, pure mathematical USDT circulation.</p>
                </div>
                <div className="pillar-box glass-panel">
                  <div className="p-num">04</div>
                  <h3>Shared Progress</h3>
                  <p>Equitable wealth distribution where collective action drives individual success.</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: OUR MISSION & WHY ALTRUVA */}
          {currentSlide === 4 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>OUR MISSION & WHY ALTRUVA?</h2>
                <p>To empower people through a transparent, fair and sustainable ecosystem, where participation creates opportunities and collective growth builds a brighter tomorrow for all.</p>
              </div>
              <div className="why-boxes-row">
                <div className="why-box neg glass-panel">
                  <span className="why-badge red">NO FIXED ROI</span>
                  <p>We do not guarantee artificial daily percentages that lead to insolvency.</p>
                </div>
                <div className="why-box neg glass-panel">
                  <span className="why-badge red">NO GUARANTEED PROMISE</span>
                  <p>Zero false hype or centralized promises. 100% smart contract executed.</p>
                </div>
                <div className="why-box pos glass-panel">
                  <span className="why-badge green">PARTICIPATION & PERFORMANCE</span>
                  <p>Rewards depend entirely on community participation, contribution and performance.</p>
                </div>
              </div>
              <div className="slide-note-card glass-panel">
                <strong>Simple Example:</strong> If there is activity, 100% is distributed to the community. If there is no activity, there is no fixed return burden on the protocol.
              </div>
            </div>
          )}

          {/* SLIDE 5: OUR GROWTH PATH */}
          {currentSlide === 5 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>OUR GROWTH PATH (5 STEPS)</h2>
                <p>A structured roadmap designed for continuous community expansion and long-term security.</p>
              </div>
              <div className="growth-steps-grid">
                <div className="step-card glass-panel">
                  <span className="step-idx cyan-gradient-text">01</span>
                  <h3>BUILD COMMUNITY</h3>
                  <p>Connect people around a shared vision of transparent decentralized finance.</p>
                </div>
                <div className="step-card glass-panel">
                  <span className="step-idx gold-gradient-text">02</span>
                  <h3>EXPAND NETWORK</h3>
                  <p>Grow reach through meaningful connections and cross-border community hubs.</p>
                </div>
                <div className="step-card glass-panel">
                  <span className="step-idx cyan-gradient-text">03</span>
                  <h3>DRIVE ENGAGEMENT</h3>
                  <p>Encourage active participation, binary team pairing, and ranking milestones.</p>
                </div>
                <div className="step-card glass-panel">
                  <span className="step-idx gold-gradient-text">04</span>
                  <h3>CREATE OPPORTUNITIES</h3>
                  <p>Turn collective activity into shared opportunities across all 5 income pools.</p>
                </div>
                <div className="step-card glass-panel">
                  <span className="step-idx cyan-gradient-text">05</span>
                  <h3>SUSTAINABLE SUCCESS</h3>
                  <p>Progress together through perpetual withdrawal re-investments.</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6: 5 TYPES OF INCOME */}
          {currentSlide === 6 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>5 TYPES OF INCOME (100% COMMUNITY DISTRIBUTION)</h2>
                <p>Every single USDT dollar entering the contract is immediately distributed into 5 distinct pools:</p>
              </div>
              <div className="income-types-list">
                <div className="inc-type-row glass-panel">
                  <span className="inc-badge">01</span>
                  <div className="inc-info">
                    <strong>COMMUNITY PARTICIPATION INCOME (GLOBAL SINGLE LEG)</strong>
                    <small>1% from each level · Total 40 levels global single leg community package amount</small>
                  </div>
                  <span className="inc-pct cyan-gradient-text">40%</span>
                </div>
                <div className="inc-type-row glass-panel">
                  <span className="inc-badge">02</span>
                  <div className="inc-info">
                    <strong>TEAM PERFORMANCE INCOME</strong>
                    <small>50:50 Binary matching between Left and Right team business volume</small>
                  </div>
                  <span className="inc-pct gold-gradient-text">25%</span>
                </div>
                <div className="inc-type-row glass-panel">
                  <span className="inc-badge">03</span>
                  <div className="inc-info">
                    <strong>CONTRIBUTION LEVEL INCOME</strong>
                    <small>9 Working Unilevel levels based on direct sponsorships</small>
                  </div>
                  <span className="inc-pct cyan-gradient-text">25%</span>
                </div>
                <div className="inc-type-row glass-panel">
                  <span className="inc-badge">04</span>
                  <div className="inc-info">
                    <strong>LEADERSHIP ACHIEVEMENT INCOME</strong>
                    <small>Daily rank pools: Nexus (3%) & Legacy Crown (2%)</small>
                  </div>
                  <span className="inc-pct gold-gradient-text">5%</span>
                </div>
                <div className="inc-type-row glass-panel">
                  <span className="inc-badge">05</span>
                  <div className="inc-info">
                    <strong>COMMUNITY REWARD INCOME (SCRATCH & WIN)</strong>
                    <small>Scratch & Win Coupons with 250 lucky winners from 70% pool</small>
                  </div>
                  <span className="inc-pct cyan-gradient-text">5%</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 7: PARTICIPATION PACKAGES */}
          {currentSlide === 7 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>PARTICIPATION PACKAGES</h2>
                <p>Select your entry package to activate global single leg upline and downline levels:</p>
              </div>
              <div className="pkg-cards-grid">
                <div className="pkg-banner-card glass-panel">
                  <div className="pkg-cost gold-gradient-text">$25 – $49</div>
                  <div className="pkg-detail">
                    <strong>10 UP + 10 DOWN = 20 Levels</strong>
                    <span>1% from each global single leg autofill member</span>
                  </div>
                </div>
                <div className="pkg-banner-card glass-panel popular-tier">
                  <div className="pkg-cost gold-gradient-text">$50 – $99</div>
                  <div className="pkg-detail">
                    <strong>15 UP + 15 DOWN = 30 Levels</strong>
                    <span>1% from each global single leg autofill member + 1 Scratch Coupon</span>
                  </div>
                </div>
                <div className="pkg-banner-card glass-panel">
                  <div className="pkg-cost gold-gradient-text">$100 & Above</div>
                  <div className="pkg-detail">
                    <strong>20 UP + 20 DOWN = 40 Levels</strong>
                    <span>1% from each global single leg autofill member + 2 Scratch Coupons</span>
                  </div>
                </div>
              </div>
              <div className="slide-note-card glass-panel">
                Eligibility and single leg open depth is determined by your active package tier.
              </div>
            </div>
          )}

          {/* SLIDE 8: 100% DISTRIBUTION GLOBAL FULL PLAN */}
          {currentSlide === 8 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>100% DISTRIBUTION GLOBAL FULL PLAN (40% SINGLE LEG)</h2>
                <p>Every member earns 1% from every eligible package in their global upline and downline within open levels:</p>
              </div>
              <div className="plan-examples-grid">
                <div className="plan-col glass-panel">
                  <div className="plan-col-head">$25 PACKAGE</div>
                  <div className="plan-col-spec">10 UP + 10 DOWN (20 Levels)</div>
                  <p>Earns 1% from 10 upline members ($0.25 to $1.00+) and 10 downline members = <strong>$6.50+ / round</strong></p>
                </div>
                <div className="plan-col glass-panel popular">
                  <div className="plan-col-head">$50 PACKAGE</div>
                  <div className="plan-col-spec">15 UP + 15 DOWN (30 Levels)</div>
                  <p>Earns 1% from 15 upline and 15 downline members on joinings AND auto re-investments = <strong>$11.25+ / round</strong></p>
                </div>
                <div className="plan-col glass-panel">
                  <div className="plan-col-head">$100+ PACKAGE</div>
                  <div className="plan-col-spec">20 UP + 20 DOWN (40 Levels)</div>
                  <p>Max depth! Earns 1% from 20 upline and 20 downline members continuously = <strong>$40.00+ / round</strong></p>
                </div>
              </div>
              <div className="slide-note-card glass-panel">
                <strong>Mixed Packages:</strong> You earn 1% regardless of whether members activate $25, $50, or $100 packages.
              </div>
            </div>
          )}

          {/* SLIDE 9: WITHDRAWAL & RE-INVEST EXAMPLE */}
          {currentSlide === 9 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>WITHDRAWAL & RE-INVEST EXAMPLE ($100 BASICS)</h2>
                <p>Whenever any community member withdraws, the auto-reinvestment cycle triggers:</p>
              </div>
              <div className="reinvest-flow-row">
                <div className="flow-step glass-panel">
                  <span className="step-num">1</span>
                  <h4>TOTAL WITHDRAWAL</h4>
                  <div className="flow-val gold-gradient-text">$100</div>
                  <small>Requested by member</small>
                </div>
                <div className="flow-arrow"><ArrowRight size={20} /></div>
                <div className="flow-step glass-panel">
                  <span className="step-num">2</span>
                  <h4>50% YOU RECEIVE</h4>
                  <div className="flow-val green">$50</div>
                  <small>Sent directly to wallet</small>
                </div>
                <div className="flow-arrow"><ArrowRight size={20} /></div>
                <div className="flow-step glass-panel">
                  <span className="step-num">3</span>
                  <h4>50% RE-INVEST</h4>
                  <div className="flow-val cyan">$50</div>
                  <small>Auto re-enters system</small>
                </div>
                <div className="flow-arrow"><ArrowRight size={20} /></div>
                <div className="flow-step glass-panel">
                  <span className="step-num">4</span>
                  <h4>1% SINGLE LEG EARNED</h4>
                  <div className="flow-val gold-gradient-text">$0.50</div>
                  <small>Paid to upline & downlines!</small>
                </div>
              </div>
              <div className="slide-note-card glass-panel">
                Whenever your eligible upline & downline members place a withdrawal, their re-invest amount continues generating 1% single leg income for you within open levels.
              </div>
            </div>
          )}

          {/* SLIDE 10: CONTRIBUTION LEVEL INCOME (25%) */}
          {currentSlide === 10 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>CONTRIBUTION LEVEL INCOME — 25% (WORKING LEVELS 1–9)</h2>
                <p>Standard unilevel commission tree powered by direct personal sponsorship:</p>
              </div>
              <div className="levels-badges-grid">
                <div className="lvl-badge-card glass-panel"><span>L1</span><strong>10%</strong></div>
                <div className="lvl-badge-card glass-panel"><span>L2</span><strong>4%</strong></div>
                <div className="lvl-badge-card glass-panel"><span>L3</span><strong>2%</strong></div>
                <div className="lvl-badge-card glass-panel"><span>L4</span><strong>2%</strong></div>
                <div className="lvl-badge-card glass-panel"><span>L5</span><strong>2%</strong></div>
                <div className="lvl-badge-card glass-panel"><span>L6</span><strong>2%</strong></div>
                <div className="lvl-badge-card glass-panel"><span>L7</span><strong>1%</strong></div>
                <div className="lvl-badge-card glass-panel"><span>L8</span><strong>1%</strong></div>
                <div className="lvl-badge-card glass-panel"><span>L9</span><strong>1%</strong></div>
              </div>
              <div className="unlock-criteria-card glass-panel">
                <h4>LEVEL OPENING CRITERIA:</h4>
                <div className="crit-item">
                  <span className="crit-num">1</span>
                  <span><strong>1 Qualified Direct Sponsor</strong> → Unlocks Levels 1–3 (16%)</span>
                </div>
                <div className="crit-item">
                  <span className="crit-num">2</span>
                  <span><strong>2 Qualified Direct Sponsors</strong> → Unlocks Levels 4–6 (22%)</span>
                </div>
                <div className="crit-item">
                  <span className="crit-num">3</span>
                  <span><strong>3 Qualified Direct Sponsors</strong> → Unlocks Levels 7–9 (25% Total)</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 11: CONTRIBUTION LEVEL CALCULATION EXAMPLE */}
          {currentSlide === 11 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>CONTRIBUTION LEVEL INCOME EXAMPLE (10 DUPLICATION)</h2>
                <p>Calculated on a $25 base package with a 10 members per level duplication model:</p>
              </div>
              <div className="calc-table-wrap glass-panel">
                <table className="slide-table">
                  <thead>
                    <tr>
                      <th>LEVEL</th>
                      <th>MEMBERS</th>
                      <th>COMMISSION %</th>
                      <th>PER MEMBER</th>
                      <th>TOTAL INCOME (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Level 1</td><td>10</td><td>10%</td><td>$2.50</td><td>$25.00</td></tr>
                    <tr><td>Level 2</td><td>100</td><td>4%</td><td>$1.00</td><td>$100.00</td></tr>
                    <tr><td>Level 3</td><td>1,000</td><td>2%</td><td>$0.50</td><td>$500.00</td></tr>
                    <tr><td>Level 4</td><td>10,000</td><td>2%</td><td>$0.50</td><td>$5,000.00</td></tr>
                    <tr><td>Level 5</td><td>100,000</td><td>2%</td><td>$0.50</td><td>$50,000.00</td></tr>
                    <tr><td>Level 6</td><td>1,000,000</td><td>2%</td><td>$0.50</td><td>$500,000.00</td></tr>
                    <tr><td>Level 7</td><td>10,000,000</td><td>1%</td><td>$0.25</td><td>$2,500,000.00</td></tr>
                    <tr><td>Level 8</td><td>100,000,000</td><td>1%</td><td>$0.25</td><td>$25,000,000.00</td></tr>
                    <tr><td>Level 9</td><td>1,000,000,000</td><td>1%</td><td>$0.25</td><td>$250,000,000.00</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="slide-total-bar gold-gradient-text">
                TOTAL POTENTIAL: $278,055,625.00 USDT
              </div>
            </div>
          )}

          {/* SLIDE 12: TEAM PERFORMANCE INCOME (25% BINARY) */}
          {currentSlide === 12 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>TEAM PERFORMANCE INCOME — 25% (50:50 BINARY MATCHING)</h2>
                <p>Balanced binary team growth gives you continuous daily matching bonuses:</p>
              </div>
              <div className="binary-diagram-box glass-panel">
                <div className="bin-you">YOU</div>
                <div className="bin-branches">
                  <div className="bin-leg left">
                    <span className="leg-name">LEFT TEAM</span>
                    <strong className="leg-vol cyan">$50,000 Volume</strong>
                  </div>
                  <div className="bin-center-match">50:50 MATCH</div>
                  <div className="bin-leg right">
                    <span className="leg-name">RIGHT TEAM</span>
                    <strong className="leg-vol cyan">$50,000 Volume</strong>
                  </div>
                </div>
              </div>
              <div className="steps-flow-grid">
                <div className="step-mini glass-panel"><span>1. Company Business</span><strong>$100,000</strong></div>
                <div className="step-mini glass-panel"><span>2. 25% Pool</span><strong>$25,000</strong></div>
                <div className="step-mini glass-panel"><span>3. Total Matching PR</span><strong>10,000 PR</strong></div>
                <div className="step-mini glass-panel"><span>4. Per Unit Value</span><strong>$2.50 / PR</strong></div>
                <div className="step-mini glass-panel"><span>5. Your Matching</span><strong>100 PR</strong></div>
                <div className="step-mini glass-panel gold"><span>6. Your Income</span><strong className="gold-gradient-text">$250 USDT</strong></div>
              </div>
            </div>
          )}

          {/* SLIDE 13: LEADERSHIP ACHIEVEMENT (5% RANKS) */}
          {currentSlide === 13 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>LEADERSHIP ACHIEVEMENT — 5% RANKS</h2>
                <p>Earn daily pool shares with qualifying 72-hour direct team performance:</p>
              </div>
              <div className="ranks-grid">
                <div className="rank-card glass-panel nexus-rank">
                  <div className="rank-top">
                    <h3>RANK 1 — NEXUS</h3>
                    <span className="rank-pct cyan-gradient-text">3% POOL</span>
                  </div>
                  <p><strong>Qualification:</strong> Self package ≥ $50 + within 3 days (72h), 2 direct members of ≥ $50.</p>
                  <div className="daily-tag">Daily Distribution</div>
                </div>
                <div className="rank-card glass-panel crown-rank">
                  <div className="rank-top">
                    <h3>RANK 2 — LEGACY CROWN</h3>
                    <span className="rank-pct gold-gradient-text">2% POOL</span>
                  </div>
                  <p><strong>Qualification:</strong> Self package ≥ $100 + within 3 days (72h), 2 direct members of ≥ $100.</p>
                  <div className="daily-tag">Daily Distribution</div>
                </div>
              </div>
              <div className="two-rules-row">
                <div className="rule-card glass-panel">
                  <h4>DAILY SETTLEMENT RULE</h4>
                  <p><strong>50% Current Day</strong> distributed among qualified leaders + <strong>50% Carry Forward</strong> to next day.</p>
                </div>
                <div className="rule-card glass-panel exit-rule">
                  <h4>RANK EXIT RULE</h4>
                  <p><strong>5x Total Income Limit:</strong> When you earn 5x your self-package, you exit rank income only. All other 4 streams continue!</p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 14: COMMUNITY REWARD (5% SCRATCH COUPONS) */}
          {currentSlide === 14 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>COMMUNITY REWARD — 5% SCRATCH & WIN</h2>
                <p>Scratch cards are awarded exclusively on fresh package activations:</p>
              </div>
              <div className="coupons-grid">
                <div className="coupon-card glass-panel">
                  <span className="pkg-lbl">$25+ PACKAGE</span>
                  <p>2 direct referrals with same & above package within 3 days</p>
                  <div className="c-reward cyan-gradient-text">★ 1 COUPON</div>
                </div>
                <div className="coupon-card glass-panel featured">
                  <span className="pkg-lbl">$50 PACKAGE</span>
                  <p>Self package $50 instant activation reward</p>
                  <div className="c-reward gold-gradient-text">★ 1 COUPON</div>
                </div>
                <div className="coupon-card glass-panel">
                  <span className="pkg-lbl">$100 PACKAGE</span>
                  <p>Self package $100 instant activation reward</p>
                  <div className="c-reward gold-gradient-text">★★ 2 COUPONS</div>
                </div>
              </div>
              <div className="slide-note-card glass-panel">
                Coupons give you instant access to scratch cards with direct USDT payouts!
              </div>
            </div>
          )}

          {/* SLIDE 15: REWARD & JACKPOT (250 WINNERS DISTRIBUTION) */}
          {currentSlide === 15 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>REWARD & JACKPOT (5% POOL · 250 WINNERS)</h2>
                <p>70% of the jackpot pool is distributed to 250 lucky winners every round:</p>
              </div>
              <div className="jackpot-podium-row">
                <div className="podium-card silver glass-panel">
                  <span>2ND PRIZE</span>
                  <strong>$500 USDT</strong>
                  <small>1 Winner (10%)</small>
                </div>
                <div className="podium-card gold glass-panel">
                  <span>1ST PRIZE</span>
                  <strong className="gold-gradient-text">$1,000 USDT</strong>
                  <small>1 Winner (20%)</small>
                </div>
                <div className="podium-card bronze glass-panel">
                  <span>3RD PRIZE</span>
                  <strong>$300 USDT</strong>
                  <small>1 Winner (3%)</small>
                </div>
              </div>
              <div className="jackpot-summary-table glass-panel">
                <div className="j-row"><span>4th – 10th (7 Winners)</span><strong>2% each (14%)</strong></div>
                <div className="j-row"><span>11th – 50th (40 Winners)</span><strong>0.50% each (20%)</strong></div>
                <div className="j-row"><span>51st – 100th (50 Winners)</span><strong>0.30% each (15%)</strong></div>
                <div className="j-row"><span>101st – 250th (150 Winners)</span><strong>0.12% each (18%)</strong></div>
              </div>
              <div className="slide-note-card glass-panel">
                <strong>Pool Rule:</strong> 70% Distributed to 250 Winners · 30% Carried Forward to Next Jackpot Round.
              </div>
            </div>
          )}

          {/* SLIDE 16: WITHDRAWAL & RE-INVESTMENT PLAN (THE X-FACTOR) */}
          {currentSlide === 16 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>WITHDRAWAL & RE-INVESTMENT PLAN (THE X-FACTOR)</h2>
                <p>The mathematical engine that generates continuous, perpetual income for all community members:</p>
              </div>
              <div className="split-tiers-grid">
                <div className="split-tier-card glass-panel">
                  <div className="tier-range">$25 – $5,000</div>
                  <div className="split-nums">
                    <div className="split-num green"><strong>50%</strong><span>Withdrawal</span></div>
                    <div className="split-num cyan"><strong>50%</strong><span>Auto Re-Invest</span></div>
                  </div>
                </div>
                <div className="split-tier-card glass-panel popular">
                  <div className="tier-range">$5,001 – $29,999</div>
                  <div className="split-nums">
                    <div className="split-num green"><strong>60%</strong><span>Withdrawal</span></div>
                    <div className="split-num cyan"><strong>40%</strong><span>Auto Re-Invest</span></div>
                  </div>
                </div>
                <div className="split-tier-card glass-panel">
                  <div className="tier-range">$30,000 & Above</div>
                  <div className="split-nums">
                    <div className="split-num green"><strong>70%</strong><span>Withdrawal</span></div>
                    <div className="split-num cyan"><strong>30%</strong><span>Auto Re-Invest</span></div>
                  </div>
                </div>
              </div>
              <div className="slide-note-card glass-panel">
                Every time you withdraw, every re-invest enters back into the 5 income pools to continuously pay your uplines and downlines!
              </div>
            </div>
          )}

          {/* SLIDE 17: HOW IT WORKS & IMPORTANT RULES */}
          {currentSlide === 17 && (
            <div className="slide-card">
              <div className="slide-header">
                <h2>HOW IT WORKS & IMPORTANT RULES</h2>
                <p>Fair Plan · Real Growth · Long Together</p>
              </div>
              <div className="rules-list-box glass-panel">
                <div className="rule-item">
                  <CheckCircle2 size={18} className="cyan" />
                  <span><strong>1. No Coupon from Re-investment:</strong> Scratch coupons are strictly issued for fresh activations.</span>
                </div>
                <div className="rule-item">
                  <CheckCircle2 size={18} className="cyan" />
                  <span><strong>2. Coupon Only from New Business:</strong> New member joinings earn coupons per qualification rules.</span>
                </div>
                <div className="rule-item">
                  <CheckCircle2 size={18} className="cyan" />
                  <span><strong>3. Re-investment Counts as Active Business:</strong> Continual replenishment of the 5 reward pools.</span>
                </div>
                <div className="rule-item">
                  <CheckCircle2 size={18} className="cyan" />
                  <span><strong>4. Zero Protocol Rent:</strong> No extra hidden costs, fees, or company retention. 100% USDT distribution.</span>
                </div>
                <div className="rule-item">
                  <CheckCircle2 size={18} className="cyan" />
                  <span><strong>5. Non-Custodial Security:</strong> All user balances and withdrawals governed purely by smart contract.</span>
                </div>
              </div>
              <div className="thank-you-box">
                <h3 className="gold-gradient-text">THANK YOU FOR BEING A PART OF ALTRUVA</h3>
                <p>Together We Build a Brighter Tomorrow</p>
                <button className="launch-now-btn" onClick={() => { onClose(); onLaunchApp(); }}>
                  Launch DApp Now <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="pres-footer">
          <button className="pres-nav-btn" onClick={prevSlide}>
            <ChevronLeft size={18} /> Previous
          </button>
          
          <div className="slide-dots">
            {Array.from({ length: totalSlides }, (_, i) => (
              <span
                key={i}
                className={`dot ${currentSlide === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentSlide(i + 1)}
              />
            ))}
          </div>

          <button className="pres-nav-btn primary" onClick={nextSlide}>
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

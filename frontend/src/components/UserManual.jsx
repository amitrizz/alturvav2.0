import React, { useState } from 'react';
import { 
  BookOpen, Shield, Users, TrendingUp, Award, Gift, ArrowRight, 
  CheckCircle2, RefreshCw, AlertCircle, HelpCircle, ChevronDown, 
  ChevronUp, ExternalLink, Sparkles, Wallet, Flame, Zap, Clock, Lock
} from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';
import { 
  PROTOCOL_NAME, PROTOCOL_EDITION, BLOCKCHAIN_NETWORK, TOKEN_STANDARD, 
  PROTOCOL_PACKAGES, COMMUNITY_POOLS, LEADER_MECHANISMS, HARD_CAP_RULES, WITHDRAWAL_RULES 
} from '../planConfig';

export default function UserManual({ onConnectWallet, onOpenPresentation }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "What is Sovereign Global Protocol v3.3?",
      a: "Sovereign Global Protocol v3.3 (Master Final Architecture & 10X Viral Edition) is a 100% peer-to-peer (P2P) decentralized mathematical protocol deployed on BNB Chain (BSC). All transactions run purely in USDT (BEP-20) with gas paid in BNB. No protocol funds are retained in the contract ledger."
    },
    {
      q: "How does the 100% Instant Live Split work across the 5 pools?",
      a: "Every package activation ($25 to $1,000) splits instantly on-chain: 30% to Time-Bomb Quantum ROI, 30% to Monoline Nexus Yield (15 Up + 15 Down active wallets), 25% to Velocity Multi-Tier Bonus (9 generation levels), 10% to 72H Alpha Cashback Surge, and 5% to the 24H FOMO Apocalypse Jackpot."
    },
    {
      q: "How does the Time-Bomb Quantum ROI (30% Pool) operate?",
      a: "It is a global passive pool with a 2X (200%) cap. You earn 3% daily for the first 10 days, followed by 1% daily. Sponsoring 1 new direct referral immediately resets the 3% daily rate for another 10 days! ROI withdrawals are always unlocked with a 40% cash / 60% auto-reinvestment ratio."
    },
    {
      q: "What is the Monoline Nexus Yield (30% Pool) with Dynamic Compression?",
      a: "Every user enters a global single leg. You earn 1% commission from the 15 active wallets above you and 15 active wallets below you. Non-active or retired IDs are automatically skipped through Dynamic Compression so you only earn from active participants."
    },
    {
      q: "How do Level Unlocks work in Velocity Multi-Tier (25% Pool)?",
      a: "Level 1 pays 13% fixed with 0 directs required. Levels 2-3 pay 3% and 2% (requires 1 direct). Levels 4-6 pay 1% each (requires 2 directs). Levels 7-9 pay 1% each (requires 3 directs). Total generation distribution is 25%."
    },
    {
      q: "What is the 10-Minute Ghost Position and 72H Cashback Surge?",
      a: "Upon connecting your wallet, a 10-minute Ghost Position temporarily locks your slot in the global single leg with a 09:59 reverse countdown. If you activate and sponsor 3 direct active members within 72 hours, 100% of your joining amount is refunded immediately via the 72H Alpha Cashback Surge!"
    },
    {
      q: "What are the 300% Hard-Cap and Re-Birth Loop rules?",
      a: "Total cumulative income from all streams is capped at 300% (3X) of your active package tier. When 3X is reached, income is hard-locked (overflows route to the Stability Pool), the old ID is retired, and an automatic Re-Birth ID is spawned at the bottom index (or VIP Fast-Track queue for leaders with 3+ directs in 30 days)."
    },
    {
      q: "What are the Withdrawal Rules and Speed-Decay Engine?",
      a: "Global minimum withdrawal is $5 USDT. ROI is unlocked without team conditions (40% Cash / 60% Reinvest). Working network income is locked until you achieve 3 active direct referrals, unlocking at 70% Cash / 30% Reinvest. If you have no direct in 14 days, payout speed temporarily drops from 50% to 10% until 1 direct is made."
    }
  ];

  return (
    <div className="usermanual-wrap">
      {/* Manual Hero Banner */}
      <section className="manual-hero glass-panel">
        <div className="manual-hero-logo">
          <AltruvaLogo size={80} />
        </div>
        <div className="manual-badge">
          <Sparkles size={14} className="gold" /> {PROTOCOL_EDITION.toUpperCase()}
        </div>
        <h1 className="manual-title">
          SOVEREIGN GLOBAL <span className="gold-gradient-text">PROTOCOL v3.3</span>
        </h1>
        <p className="manual-subtitle cyan-gradient-text">
          100% P2P Instant Split · BNB Chain (BSC) · Pure USDT (BEP-20) · Zero Ledger Retention
        </p>
        <p className="manual-intro">
          Official Master Final Architecture & Blueprint: Complete breakdown of the 6 Packages, 5 Community Pools, 
          10-Minute Ghost Position, 72H Alpha Cashback Surge, Speed-Decay Engine, and the 300% Re-Birth Loop.
        </p>

        {/* Action Buttons */}
        <div className="manual-actions-row">
          <button className="manual-connect-btn" onClick={onConnectWallet}>
            <Wallet size={18} /> Connect Wallet to Enter Protocol
          </button>
          <button className="manual-deck-btn" onClick={onOpenPresentation}>
            <BookOpen size={18} /> View Master Presentation Deck
          </button>
        </div>
      </section>

      {/* Core Network Architecture Specs */}
      <section className="onboarding-guide-section">
        <div className="manual-sec-header">
          <span className="sec-pill">Core Setup</span>
          <h2>Network & Infrastructure Specifications</h2>
          <p>Industrial grade on-chain ledger architecture built for maximum viral throughput:</p>
        </div>

        <div className="steps-container-grid">
          <div className="onboard-step-card glass-panel">
            <span className="step-number cyan-gradient-text">01</span>
            <h3>BNB Smart Chain (BSC)</h3>
            <p>Operates on BSC for sub-second block confirmation times and micro gas fees paid natively in BNB.</p>
          </div>

          <div className="onboard-step-card glass-panel">
            <span className="step-number gold-gradient-text">02</span>
            <h3>Pure USDT (BEP-20)</h3>
            <p>100% of deposits, upgrades, and payouts occur directly in stable USDT. No speculative proprietary token dumps.</p>
          </div>

          <div className="onboard-step-card glass-panel">
            <span className="step-number cyan-gradient-text">03</span>
            <h3>100% P2P Instant Split</h3>
            <p>Zero funds retained in the contract core ledger. All incoming package capital splits live into 5 automated pools.</p>
          </div>

          <div className="onboard-step-card glass-panel">
            <span className="step-number gold-gradient-text">04</span>
            <h3>Genesis Admin Triangle</h3>
            <p>Top 3 fixed IDs (Admin Triangle Chain) are hardcoded at Genesis to capture working spillovers and unclaimed breakage.</p>
          </div>
        </div>
      </section>

      {/* The 6 Standard Packages */}
      <section className="activation-section glass-panel">
        <div className="manual-sec-header">
          <span className="sec-pill gold">Package Matrix</span>
          <h2>The 6 Standard Community Packages</h2>
          <p>Choose your entry tier to activate instant global monoline reach and earning caps:</p>
        </div>

        <div className="preset-pkgs-grid">
          {PROTOCOL_PACKAGES.map((pkg) => (
            <div key={pkg.val} className="preset-pkg-card glass-panel selected">
              <div className="pkg-card-top">
                <span className="p-tag">{pkg.tier}</span>
                <span className="p-price gold-gradient-text">${pkg.val} USDT</span>
              </div>
              <strong className="p-levels">{pkg.monolineReach} Active Wallets</strong>
              <small className="p-perks">2X ROI Cap: ${pkg.roiCap} | 3X Hard-Cap: ${pkg.hardCap3X} USDT</small>
            </div>
          ))}
        </div>
      </section>

      {/* The 5 Community Pools (100% Live Split) */}
      <section className="five-streams-detail-section">
        <div className="manual-sec-header">
          <span className="sec-pill">100% Live Split</span>
          <h2>The 5 Community Pools Breakdown</h2>
          <p>Every dollar entering the protocol splits instantly across 5 specialized mathematical pools:</p>
        </div>

        <div className="streams-cards-list">
          {/* Pool 1 */}
          <div className="stream-detail-box glass-panel">
            <div className="sdb-top">
              <div className="sdb-badge">POOL 01</div>
              <span className="sdb-share cyan-gradient-text">30% POOL</span>
            </div>
            <h3>Time-Bomb Quantum ROI (Global Passive)</h3>
            <p>
              Global passive yield pool with a <strong>2X (200%) Cap</strong>. Earn <strong>3% daily for the first 10 days</strong>, 
              then <strong>1% daily</strong> thereafter. Sponsoring 1 new direct referral resets your yield back to 3% for another 10 days!
            </p>
            <div className="sdb-highlight glass-panel">
              <strong>Withdrawal Terms:</strong> Always unlocked with ZERO direct sponsor requirement. 40% Cash sent to wallet / 60% Auto Re-invested.
            </div>
          </div>

          {/* Pool 2 */}
          <div className="stream-detail-box glass-panel">
            <div className="sdb-top">
              <div className="sdb-badge gold">POOL 02</div>
              <span className="sdb-share gold-gradient-text">30% POOL</span>
            </div>
            <h3>Monoline Nexus Yield (Global Single Leg)</h3>
            <p>
              Chronological single leg monoline. You earn <strong>1% from each of the 15 active wallets above you</strong> and 
              <strong>1% from each of the 15 active wallets below you</strong> (total 30%).
            </p>
            <div className="sdb-formula">
              Dynamic Compression: Non-active or retired IDs are bypassed in real time so you always receive yields from 30 active wallets!
            </div>
          </div>

          {/* Pool 3 */}
          <div className="stream-detail-box glass-panel">
            <div className="sdb-top">
              <div className="sdb-badge">POOL 03</div>
              <span className="sdb-share cyan-gradient-text">25% POOL</span>
            </div>
            <h3>Velocity Multi-Tier Bonus (9-Level Generation)</h3>
            <p>
              Unilevel generation rewards with a generous <strong>13% fixed direct bonus on Level 1</strong>:
            </p>
            <div className="unilevel-tiers-strip">
              <span className="ut-pill gold">L1: 13%</span>
              <span className="ut-pill">L2: 3%</span>
              <span className="ut-pill">L3: 2%</span>
              <span className="ut-pill">L4: 1%</span>
              <span className="ut-pill">L5: 1%</span>
              <span className="ut-pill">L6: 1%</span>
              <span className="ut-pill">L7: 1%</span>
              <span className="ut-pill">L8: 1%</span>
              <span className="ut-pill">L9: 1%</span>
            </div>
            <div className="sdb-unlock-info">
              <span><strong>0 Directs:</strong> Unlocks Level 1 (13%)</span> · 
              <span><strong>1 Direct:</strong> Unlocks Levels 2–3 (18% Total)</span> · 
              <span><strong>2 Directs:</strong> Unlocks Levels 4–6 (21% Total)</span> · 
              <span><strong>3 Directs:</strong> Unlocks Levels 7–9 (25% Total)</span>
            </div>
          </div>

          {/* Pool 4 */}
          <div className="stream-detail-box glass-panel">
            <div className="sdb-top">
              <div className="sdb-badge gold">POOL 04</div>
              <span className="sdb-share gold-gradient-text">10% POOL</span>
            </div>
            <h3>72H Alpha Cashback Surge (Mission Refund)</h3>
            <p>
              Sponsor <strong>3 active direct referrals within 72 hours</strong> of your activation to receive an instant 
              <strong>100% refund of your joining package amount</strong>! Unclaimed funds automatically transfer to the Community Airdrop Pool.
            </p>
          </div>

          {/* Pool 5 */}
          <div className="stream-detail-box glass-panel">
            <div className="sdb-top">
              <div className="sdb-badge">POOL 05</div>
              <span className="sdb-share cyan-gradient-text">5% POOL</span>
            </div>
            <h3>FOMO Apocalypse Jackpot (24H Countdown)</h3>
            <p>
              Automated 24-hour countdown pool. <strong>70% is shared equally among the last 50 paid users</strong>, and 
              <strong>30% is split among the top 3 direct sponsors</strong> of that round!
            </p>
          </div>
        </div>
      </section>

      {/* Leader Growth Hooks & Safeguards */}
      <section className="xfactor-manual-section glass-panel">
        <div className="manual-sec-header">
          <span className="sec-pill gold">Growth Engines</span>
          <h2>Leader Retention & Anti-Dumping Safeguards</h2>
          <p>Mechanisms engineered to guarantee compounding activity and system longevity:</p>
        </div>

        <div className="table-responsive desktop-only-table">
          <table className="altruva-table manual-tbl">
            <thead>
              <tr>
                <th>ENGINE / MECHANISM</th>
                <th>CONDITION & TRIGGER</th>
                <th>EFFECT & REWARD IMPACT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Speed-Decay Engine</strong></td>
                <td>No new direct sponsor within 14 days</td>
                <td className="cyan-txt">Withdrawal speed drops from 50% to 10%. Resets to 100% on 1 new direct.</td>
              </tr>
              <tr className="unlocked-row">
                <td><strong>Dynamic Infinity Override</strong></td>
                <td>4–10 Directs: 5% | 11–25: 7% | 26+: 10%</td>
                <td className="gold-gradient-text">Master Royalty captured by Admin Master Wallet across all lifetime volume.</td>
              </tr>
              <tr>
                <td><strong>Smart Re-Birth Queue Jump</strong></td>
                <td>3+ Directs sponsored in last 30 days</td>
                <td className="green-txt">Re-Birth ID pushed into VIP Fast-Track Slot instead of normal bottom queue.</td>
              </tr>
              <tr>
                <td><strong>30-Day Active Maintenance</strong></td>
                <td>Maintain 1 active direct or team volume per 30d</td>
                <td>Keeps 70% Cash / 30% Reinvest ratio; drops to 50/50 if maintenance window lapses.</td>
              </tr>
              <tr className="unlocked-row">
                <td><strong>300% (3X) Hard-Cap & Re-Birth</strong></td>
                <td>Cumulative income reaches 300% of active package</td>
                <td>Old ID freezes/retires. Package amount auto-deducted to spawn new active Re-Birth ID.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="faq-section glass-panel">
        <div className="manual-sec-header">
          <span className="sec-pill">FAQ</span>
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about Sovereign Global Protocol v3.3:</p>
        </div>

        <div className="faq-accordion-list">
          {faqs.map((f, idx) => (
            <div 
              key={idx} 
              className={`faq-item glass-panel ${openFaq === idx ? 'expanded' : ''}`}
              onClick={() => toggleFaq(idx)}
            >
              <div className="faq-question-row">
                <span className="faq-q-text">{f.q}</span>
                <span className="faq-arrow">{openFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
              </div>
              {openFaq === idx && (
                <div className="faq-answer-row">
                  <p>{f.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

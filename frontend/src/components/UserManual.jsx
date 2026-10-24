import React, { useState } from 'react';
import { 
  BookOpen, Shield, Users, TrendingUp, Award, Gift, ArrowRight, 
  CheckCircle2, RefreshCw, AlertCircle, HelpCircle, ChevronDown, 
  ChevronUp, ExternalLink, Sparkles, Wallet 
} from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';

export default function UserManual({ onConnectWallet, onOpenPresentation }) {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "What is Altruva and how does it work?",
      a: "Altruva is a 100% community-driven mathematical distribution ecosystem deployed on BNB Smart Chain. Every dollar entering the protocol (via package activation or withdrawal re-investment) is 100% shared across 5 transparent community pools with zero protocol rent or token minting."
    },
    {
      q: "Why is Altruva operated purely in USDT (BEP-20)?",
      a: "Unlike token projects that create proprietary tokens subject to price dumping, bonding curve crashes, or hyperinflation, Altruva operates 100% in pure USDT. All activations, commissions, pool rewards, and withdrawals are executed directly in USDT."
    },
    {
      q: "How does the 40-Level Global Single Leg work?",
      a: "Every member joining the system receives a sequential Global ID in a single chronological timeline. Depending on your active package tier ($25 = 20 levels, $50 = 30 levels, $100+ = 40 levels), you earn 1% from up to 20 global members who joined before you (upline) and 20 who joined after you (downline) on fresh activations AND every subsequent withdrawal re-investment!"
    },
    {
      q: "What is 'The X-Factor' Withdrawal & Auto Re-Investment Engine?",
      a: "When you withdraw your claimable earnings, funds are automatically split based on your package tier: $25-$5,000 is split 50% to your personal wallet and 50% auto-reinvested. $5,001-$29,999 is split 60/40, and $30,000+ is split 70/30. The auto-reinvested amount re-enters all 5 income pools to continuously pay your uplines and downlines without adding new capital!"
    },
    {
      q: "How do I earn Scratch & Win coupons?",
      a: "Scratch coupons are awarded exclusively on fresh package activations: $25 package with 2 direct referrals in 72h gives 1 coupon; $50 self package gives 1 coupon; $100 self package gives 2 coupons. Each scratch card offers instant on-chain USDT rewards from the 5% Community Reward pool across 250 winner spots with a $1,000 top prize."
    },
    {
      q: "What are the Leadership Ranks and the 5x Exit Cap?",
      a: "Rank 1 (Nexus, 3% pool) requires a $50 package + 2 directs >= $50 within 72h. Rank 2 (Legacy Crown, 2% pool) requires a $100 package + 2 directs >= $100 within 72h. Daily pools pay 50% to qualified leaders and carry forward 50%. When your cumulative earnings reach 5x of your self-package, you exit rank income only, while the other 4 income streams continue forever."
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
          <BookOpen size={14} className="gold" /> OFFICIAL COMMUNITY USER MANUAL & GUIDE
        </div>
        <h1 className="manual-title">
          WELCOME TO <span className="gold-gradient-text">ALTRUVA</span>
        </h1>
        <p className="manual-subtitle cyan-gradient-text">
          100% Community Distribution Model · Pure USDT Protocol · Zero Protocol Retention
        </p>
        <p className="manual-intro">
          This manual explains the complete architecture, mathematical formulas, and 5 income streams. 
          Connect your Web3 wallet to enter your personalized dashboard, view your single leg placement, and start earning.
        </p>

        {/* Action Buttons */}
        <div className="manual-actions-row">
          <button className="manual-connect-btn" onClick={onConnectWallet}>
            <Wallet size={18} /> Connect Wallet to Access Dashboard
          </button>
          <button className="manual-deck-btn" onClick={onOpenPresentation}>
            <BookOpen size={18} /> View Full 17-Slide Presentation
          </button>
        </div>
      </section>

      {/* Quick 4-Step Getting Started Guide */}
      <section className="onboarding-guide-section">
        <div className="manual-sec-header">
          <span className="sec-pill">Quick Start</span>
          <h2>How to Get Started in 4 Simple Steps</h2>
          <p>Follow these steps to activate your membership and unlock global single leg rewards:</p>
        </div>

        <div className="steps-container-grid">
          <div className="onboard-step-card glass-panel">
            <span className="step-number cyan-gradient-text">01</span>
            <h3>Connect Your Wallet</h3>
            <p>Connect using MetaMask, Trust Wallet, SafePal, or any WalletConnect compatible mobile app on <strong>BNB Smart Chain (BSC)</strong>.</p>
          </div>

          <div className="onboard-step-card glass-panel">
            <span className="step-number gold-gradient-text">02</span>
            <h3>Prepare BEP-20 USDT</h3>
            <p>Ensure your wallet has at least <strong>$25 USDT</strong> (BEP-20) plus a small amount of BNB (approx. $1–$2) for blockchain gas fees.</p>
          </div>

          <div className="onboard-step-card glass-panel">
            <span className="step-number cyan-gradient-text">03</span>
            <h3>Activate a Package</h3>
            <p>Select your tier: <strong>$25</strong> (20 Levels), <strong>$50</strong> (30 Levels + 1 Coupon), or <strong>$100+</strong> (40 Levels + 2 Coupons). Click Activate.</p>
          </div>

          <div className="onboard-step-card glass-panel">
            <span className="step-number gold-gradient-text">04</span>
            <h3>Earn & Withdraw Continuously</h3>
            <p>Receive 1% from upline & downline members, team binary matching, unilevel levels, and scratch rewards. Withdraw anytime with auto-reinvestment!</p>
          </div>
        </div>
      </section>

      {/* The 5 Income Streams Mathematical Model */}
      <section className="five-streams-detail-section">
        <div className="manual-sec-header">
          <span className="sec-pill">Mathematical Blueprint</span>
          <h2>The 5 Income Streams (100% USDT Distribution)</h2>
          <p>Every dollar entering the system is shared with zero protocol retention across 5 transparent pools:</p>
        </div>

        <div className="streams-cards-list">
          {/* Stream 1 */}
          <div className="stream-detail-box glass-panel">
            <div className="sdb-top">
              <div className="sdb-badge">STREAM 01</div>
              <span className="sdb-share cyan-gradient-text">40% POOL</span>
            </div>
            <h3>Community Participation Income (Global Single Leg)</h3>
            <p>
              Every registered user is placed in a single global chronological timeline (Global ID #1, #2, #3...). 
              You earn <strong>1% from each member's package</strong> up to 40 levels (20 levels upline who joined before you, and 20 levels downline who joined after you).
            </p>
            <div className="sdb-highlight glass-panel">
              <strong>The Perpetual Cycle:</strong> Whenever any of your 40 global members withdraw, their 50%, 40%, or 30% auto-reinvestment amount continues paying you 1% single leg income over and over again!
            </div>
          </div>

          {/* Stream 2 */}
          <div className="stream-detail-box glass-panel">
            <div className="sdb-top">
              <div className="sdb-badge gold">STREAM 02</div>
              <span className="sdb-share gold-gradient-text">25% POOL</span>
            </div>
            <h3>Team Performance Income (50:50 Binary Structure)</h3>
            <p>
              Each user builds a Left Team and a Right Team. 25% of all ecosystem business volume flows into the Performance Pool. 
              Volume is matched at a <strong>50:50 ratio</strong> (Matched Volume = Minimum of Left and Right Team Volume).
            </p>
            <div className="sdb-formula">
              Unit Value = (25% Performance Pool) / (Total Company PR Units) ⟹ Your Income = Your PR × Unit Value
            </div>
          </div>

          {/* Stream 3 */}
          <div className="stream-detail-box glass-panel">
            <div className="sdb-top">
              <div className="sdb-badge">STREAM 03</div>
              <span className="sdb-share cyan-gradient-text">25% POOL</span>
            </div>
            <h3>Contribution Level Income (Working Levels 1–9)</h3>
            <p>
              Multi-tier unilevel commissions based on direct personal sponsorship:
            </p>
            <div className="unilevel-tiers-strip">
              <span className="ut-pill">L1: 10%</span>
              <span className="ut-pill">L2: 4%</span>
              <span className="ut-pill">L3: 2%</span>
              <span className="ut-pill">L4: 2%</span>
              <span className="ut-pill">L5: 2%</span>
              <span className="ut-pill">L6: 2%</span>
              <span className="ut-pill">L7: 1%</span>
              <span className="ut-pill">L8: 1%</span>
              <span className="ut-pill">L9: 1%</span>
            </div>
            <div className="sdb-unlock-info">
              <span><strong>1 Direct Sponsor:</strong> Unlocks Levels 1–3 (16%)</span> · 
              <span><strong>2 Direct Sponsors:</strong> Unlocks Levels 4–6 (22%)</span> · 
              <span><strong>3 Direct Sponsors:</strong> Unlocks Levels 7–9 (25% Total)</span>
            </div>
          </div>

          {/* Stream 4 */}
          <div className="stream-detail-box glass-panel">
            <div className="sdb-top">
              <div className="sdb-badge gold">STREAM 04</div>
              <span className="sdb-share gold-gradient-text">5% POOL</span>
            </div>
            <h3>Leadership Achievement Income (Daily Pools & 5x Cap)</h3>
            <p>
              Daily profit-sharing reward pools for active leadership builders:
            </p>
            <ul className="manual-list">
              <li><strong>Rank 1 — NEXUS (3% Pool):</strong> Self package ≥ $50 + within 3 days (72h), 2 direct members of ≥ $50.</li>
              <li><strong>Rank 2 — LEGACY CROWN (2% Pool):</strong> Self package ≥ $100 + within 3 days (72h), 2 direct members of ≥ $100.</li>
              <li><strong>50/50 Settlement Rule:</strong> 50% paid daily to qualified leaders; 50% carried forward to the next day.</li>
              <li><strong>Rank Exit Rule (5x Cap):</strong> Cumulative earnings are capped at 5x self-package for rank income only; all other 4 income streams continue unaffected!</li>
            </ul>
          </div>

          {/* Stream 5 */}
          <div className="stream-detail-box glass-panel">
            <div className="sdb-top">
              <div className="sdb-badge">STREAM 05</div>
              <span className="sdb-share cyan-gradient-text">5% POOL</span>
            </div>
            <h3>Community Reward & Jackpot (Scratch & Win)</h3>
            <p>
              Instant digital scratch cards awarded on new package activations with prizes distributed across 250 lucky winners from 70% of the pool, while 30% rolls over to the next round. Top prizes include $1,000 (1st), $500 (2nd), and $300 (3rd).
            </p>
          </div>
        </div>
      </section>

      {/* The X-Factor Re-investment Table */}
      <section className="xfactor-manual-section glass-panel">
        <div className="manual-sec-header">
          <span className="sec-pill gold">The X-Factor</span>
          <h2>Withdrawal & Auto Re-Investment Matrix</h2>
          <p>This automated mechanism ensures the ecosystem never runs out of rewards:</p>
        </div>

        {/* Desktop Table View */}
        <div className="table-responsive desktop-only-table">
          <table className="altruva-table manual-tbl">
            <thead>
              <tr>
                <th>PACKAGE TIER RANGE</th>
                <th>WITHDRAWAL (SENT TO WALLET)</th>
                <th>AUTO RE-INVESTED (BACK INTO SYSTEM)</th>
                <th>RE-INVESTMENT IMPACT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>$25 – $5,000</strong></td>
                <td className="green-txt"><strong>50%</strong></td>
                <td className="cyan-txt"><strong>50%</strong></td>
                <td>Replenishes 40-level upline & downline 1% dividends</td>
              </tr>
              <tr className="unlocked-row">
                <td><strong>$5,001 – $29,999</strong></td>
                <td className="green-txt"><strong>60%</strong></td>
                <td className="cyan-txt"><strong>40%</strong></td>
                <td>Replenishes binary matching & unilevel pools</td>
              </tr>
              <tr>
                <td><strong>$30,000 & Above</strong></td>
                <td className="green-txt"><strong>70%</strong></td>
                <td className="cyan-txt"><strong>30%</strong></td>
                <td>Perpetual circulating liquidity with zero inflation</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Full-Width Responsive Cards (Zero Horizontal Scroll) */}
        <div className="mobile-xfactor-cards mobile-only-cards">
          <div className="m-xfactor-card glass-panel">
            <div className="mxc-top">
              <span className="mxc-badge gold">TIER 1</span>
              <strong className="mxc-tier-title">$25 – $5,000 USDT</strong>
            </div>
            <div className="mxc-splits">
              <div className="mxc-split-item wallet">
                <span className="mxc-lbl">Withdrawal (To Wallet)</span>
                <strong className="green-txt">50%</strong>
              </div>
              <div className="mxc-split-item reinvest">
                <span className="mxc-lbl">Auto Re-Invested</span>
                <strong className="cyan-txt">50%</strong>
              </div>
            </div>
            <div className="mxc-impact">
              <span className="mxc-impact-lbl">Ecosystem Impact:</span>
              <p>Replenishes 40-level upline & downline 1% dividends</p>
            </div>
          </div>

          <div className="m-xfactor-card glass-panel unlocked-border">
            <div className="mxc-top">
              <span className="mxc-badge cyan">TIER 2</span>
              <strong className="mxc-tier-title">$5,001 – $29,999 USDT</strong>
            </div>
            <div className="mxc-splits">
              <div className="mxc-split-item wallet">
                <span className="mxc-lbl">Withdrawal (To Wallet)</span>
                <strong className="green-txt">60%</strong>
              </div>
              <div className="mxc-split-item reinvest">
                <span className="mxc-lbl">Auto Re-Invested</span>
                <strong className="cyan-txt">40%</strong>
              </div>
            </div>
            <div className="mxc-impact">
              <span className="mxc-impact-lbl">Ecosystem Impact:</span>
              <p>Replenishes binary matching & unilevel pools</p>
            </div>
          </div>

          <div className="m-xfactor-card glass-panel">
            <div className="mxc-top">
              <span className="mxc-badge gold">TIER 3</span>
              <strong className="mxc-tier-title">$30,000 & Above USDT</strong>
            </div>
            <div className="mxc-splits">
              <div className="mxc-split-item wallet">
                <span className="mxc-lbl">Withdrawal (To Wallet)</span>
                <strong className="green-txt">70%</strong>
              </div>
              <div className="mxc-split-item reinvest">
                <span className="mxc-lbl">Auto Re-Invested</span>
                <strong className="cyan-txt">30%</strong>
              </div>
            </div>
            <div className="mxc-impact">
              <span className="mxc-impact-lbl">Ecosystem Impact:</span>
              <p>Perpetual circulating liquidity with zero inflation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="faq-section">
        <div className="manual-sec-header">
          <span className="sec-pill">Questions & Answers</span>
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about Altruva community rules and operations:</p>
        </div>

        <div className="faq-accordion-list">
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-item glass-panel" onClick={() => toggleFaq(idx)}>
              <div className="faq-q-row">
                <h4>{faq.q}</h4>
                {openFaq === idx ? <ChevronUp size={18} className="gold" /> : <ChevronDown size={18} />}
              </div>
              {openFaq === idx && (
                <div className="faq-a-content">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="manual-bottom-cta glass-panel">
        <AltruvaLogo size={50} />
        <h2>Ready to Join the Movement?</h2>
        <p>Connect your Web3 wallet now to activate your package and enter the global single leg timeline.</p>
        <button className="manual-connect-btn" onClick={onConnectWallet}>
          <Wallet size={18} /> Connect Wallet to Start
        </button>
      </section>
    </div>
  );
}

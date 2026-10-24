import React from 'react';
import { 
  Shield, Users, TrendingUp, Award, Gift, ArrowRight, Zap, RefreshCw, 
  CheckCircle2, Sparkles, BookOpen, Layers, Lock, Play 
} from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';

export default function Landing({ onLaunchApp, onOpenPresentation }) {
  return (
    <div className="landing-wrap">
      {/* Hero Section */}
      <section className="hero-banner glass-panel">
        <div className="hero-glow-sphere"></div>
        <div className="hero-badge">
          <span className="live-dot"></span> PURE USDT PROTOCOL · 100% NON-CUSTODIAL
        </div>

        <div className="hero-logo-box">
          <AltruvaLogo size={90} />
        </div>

        <h1 className="hero-headline">
          ALTRUVA <span className="gold-gradient-text">COMMUNITY</span>
        </h1>
        <div className="hero-subline cyan-gradient-text">
          100% COMMUNITY DISTRIBUTION MODEL
        </div>

        <p className="hero-description">
          A decentralized, mathematical ecosystem designed around participation, contribution, performance and shared progress. Every dollar is 100% distributed across 5 transparent on-chain streams.
        </p>

        <div className="hero-btn-row">
          <button className="cta-launch-btn" onClick={onLaunchApp}>
            Launch DApp <ArrowRight size={18} />
          </button>
          <button className="cta-pres-btn" onClick={onOpenPresentation}>
            <BookOpen size={18} /> View 17-Slide Presentation
          </button>
        </div>

        {/* 4 Pillars Bar */}
        <div className="pillars-row">
          <div className="pillar-item">
            <span className="p-title cyan">COMMUNITY</span>
            <span className="p-sub">People Powered</span>
          </div>
          <div className="pillar-div">/</div>
          <div className="pillar-item">
            <span className="p-title gold">CONTRIBUTION</span>
            <span className="p-sub">Value Through Action</span>
          </div>
          <div className="pillar-div">/</div>
          <div className="pillar-item">
            <span className="p-title cyan">TRANSPARENCY</span>
            <span className="p-sub">Clear & Open Code</span>
          </div>
          <div className="pillar-div">/</div>
          <div className="pillar-item">
            <span className="p-title gold">PROGRESS</span>
            <span className="p-sub">Shared Long-Term</span>
          </div>
        </div>
      </section>

      {/* Why Altruva vs Conventional Projects */}
      <section className="why-altruva-section">
        <div className="section-title-wrap">
          <span className="section-pill">Why Altruva?</span>
          <h2>A Mathematically Sustainable Ecosystem</h2>
          <p>No proprietary token manipulation, no inflationary printing, no false promises.</p>
        </div>

        <div className="why-grid">
          <div className="why-card glass-panel">
            <div className="why-icon red-glow">🚫</div>
            <h3>No Fixed ROI</h3>
            <p>We do not guarantee artificial daily percentages that mathematically deplete liquidity reserves.</p>
          </div>
          <div className="why-card glass-panel">
            <div className="why-icon red-glow">📜</div>
            <h3>No False Promises</h3>
            <p>100% decentralized smart contract distribution on BNB Smart Chain. No admin backdoors or token mints.</p>
          </div>
          <div className="why-card glass-panel highlight-border">
            <div className="why-icon cyan-glow">⚡</div>
            <h3>Pure USDT (BEP-20)</h3>
            <p>Deposits, package activations, single-leg dividends, binary matches, and withdrawals are purely in USDT.</p>
          </div>
        </div>
      </section>

      {/* 5 Types of Income Streams */}
      <section className="incomes-overview-section">
        <div className="section-title-wrap">
          <span className="section-pill">100% Distribution</span>
          <h2>5 Dynamic Income Streams</h2>
          <p>100% of every incoming package and withdrawal re-investment is shared across 5 distinct pools:</p>
        </div>

        <div className="incomes-showcase-grid">
          <div className="inc-showcase-card glass-panel">
            <div className="inc-top">
              <span className="inc-num">01</span>
              <span className="inc-share cyan-gradient-text">40%</span>
            </div>
            <h3>Community Participation</h3>
            <p>Global Single Leg Autofill. Earn 1% from each member across up to 40 levels (20 Upline + 20 Downline) on new activations & re-investments.</p>
          </div>

          <div className="inc-showcase-card glass-panel">
            <div className="inc-top">
              <span className="inc-num">02</span>
              <span className="inc-share gold-gradient-text">25%</span>
            </div>
            <h3>Team Performance</h3>
            <p>50:50 Binary Structure matching Left & Right volume. Earn matching bonus PR units calculated daily.</p>
          </div>

          <div className="inc-showcase-card glass-panel">
            <div className="inc-top">
              <span className="inc-num">03</span>
              <span className="inc-share cyan-gradient-text">25%</span>
            </div>
            <h3>Contribution Level Income</h3>
            <p>9 Working Unilevel levels: L1 (10%), L2 (4%), L3-L6 (2% each), L7-L9 (1% each) unlocked with direct sponsorships.</p>
          </div>

          <div className="inc-showcase-card glass-panel">
            <div className="inc-top">
              <span className="inc-num">04</span>
              <span className="inc-share gold-gradient-text">5%</span>
            </div>
            <h3>Leadership Achievement</h3>
            <p>Daily rank pools: Nexus (3%) & Legacy Crown (2%) with 50% paid daily, 50% carry forward, and 5x income exit cap.</p>
          </div>

          <div className="inc-showcase-card glass-panel">
            <div className="inc-top">
              <span className="inc-num">05</span>
              <span className="inc-share cyan-gradient-text">5%</span>
            </div>
            <h3>Community Reward & Jackpot</h3>
            <p>Scratch & Win coupons with 250 lucky winners from 70% of pool ($1,000 top prize) and 30% carry forward.</p>
          </div>
        </div>
      </section>

      {/* Participation Packages Banner */}
      <section className="packages-overview-section glass-panel">
        <div className="section-title-wrap">
          <span className="section-pill">Participation Packages</span>
          <h2>Unlock Global Single Leg Depth</h2>
          <p>Choose your entry package to activate your upline and downline earning levels:</p>
        </div>

        <div className="pkg-tiers-grid">
          <div className="tier-box glass-panel">
            <div className="tier-header">TIER 1</div>
            <div className="tier-price gold-gradient-text">$25 – $49</div>
            <div className="tier-spec">10 UP + 10 DOWN = <strong>20 Levels</strong></div>
            <p>1% from 20 global single leg members on activations & re-invests.</p>
            <button className="tier-act-btn" onClick={onLaunchApp}>Activate Tier 1</button>
          </div>

          <div className="tier-box glass-panel popular-glow">
            <div className="popular-badge">RECOMMENDED</div>
            <div className="tier-header">TIER 2</div>
            <div className="tier-price gold-gradient-text">$50 – $99</div>
            <div className="tier-spec">15 UP + 15 DOWN = <strong>30 Levels</strong></div>
            <p>1% from 30 levels + 1 Scratch Coupon + Nexus rank qualification.</p>
            <button className="tier-act-btn featured" onClick={onLaunchApp}>Activate Tier 2</button>
          </div>

          <div className="tier-box glass-panel">
            <div className="tier-header">TIER 3</div>
            <div className="tier-price gold-gradient-text">$100 & Above</div>
            <div className="tier-spec">20 UP + 20 DOWN = <strong>40 Levels</strong></div>
            <p>Maximum 40 levels reach + 2 Scratch Coupons + Legacy Crown rank.</p>
            <button className="tier-act-btn" onClick={onLaunchApp}>Activate Tier 3</button>
          </div>
        </div>
      </section>

      {/* The X-Factor Reinvestment Engine */}
      <section className="xfactor-showcase-section glass-panel">
        <div className="xfactor-badge-pill">
          <RefreshCw size={14} /> THE X-FACTOR OF ALTRUVA
        </div>
        <h2>Withdrawal & Auto Re-Investment Plan</h2>
        <p className="xfactor-text">
          Whenever you click <strong>Withdraw</strong>, a predefined percentage goes immediately to your wallet in USDT, and the remainder auto-reinvests back into the 5 income pools to pay your uplines and downlines continuously!
        </p>

        <div className="xfactor-split-table">
          <div className="x-row x-header">
            <div>PACKAGE RANGE</div>
            <div>WITHDRAWAL (TO YOUR WALLET)</div>
            <div>AUTO RE-INVESTMENT</div>
          </div>
          <div className="x-row">
            <div>$25 – $5,000</div>
            <div className="green-txt">50%</div>
            <div className="cyan-txt">50%</div>
          </div>
          <div className="x-row popular-row">
            <div>$5,001 – $29,999</div>
            <div className="green-txt">60%</div>
            <div className="cyan-txt">40%</div>
          </div>
          <div className="x-row">
            <div>$30,000 & Above</div>
            <div className="green-txt">70%</div>
            <div className="cyan-txt">30%</div>
          </div>
        </div>

        <div className="xfactor-bottom-cta">
          <button className="cta-launch-btn" onClick={onLaunchApp}>
            Join Altruva DApp Today <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}

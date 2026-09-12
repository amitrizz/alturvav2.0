import React, { useEffect } from "react";
import { Shield, TrendingUp, Users, BarChart3, Zap, Lock, ArrowRight, Coins } from "lucide-react";
import { ROI_TIERS, RANK_BONUS_NAMES, SALARY_RANK_NAMES } from "../abis";
import InstallApp from "./InstallApp";
import "./Landing.css";

const RANK_BONUSES = ["$20", "$100", "$500", "$1,500", "$5,000", "$10,000", "$20,000", "$30,000", "$40,000", "$50,000"];
const SALARY_AMOUNTS = ["$50", "$200", "$500", "$1,000", "$2,500", "$5,000", "$7,500", "$10,000"];

const STEPS = [
  { icon: Users, label: "Register" },
  { icon: Coins, label: "Activate Investment" },
  { icon: TrendingUp, label: "Refer & Earn" },
  { icon: BarChart3, label: "Track Progress" },
];

const FEATURES = [
  { icon: Shield, label: "Secure & Trusted" },
  { icon: TrendingUp, label: "Daily High Returns" },
  { icon: Zap, label: "Instant Withdrawal" },
  { icon: Users, label: "Multiple Income" },
  { icon: Lock, label: "Transparent System" },
  { icon: BarChart3, label: "Long Term Growth" },
];

function Landing({ onEnterApp }) {
  useEffect(() => {
    document.body.classList.add("landing-page");
    document.documentElement.classList.add("landing-page");
    return () => {
      document.body.classList.remove("landing-page");
      document.documentElement.classList.remove("landing-page");
    };
  }, []);

  return (
    <div className="landing-root">
      {/* Mobile + desktop top bar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-nav-brand">
            <img src="/logo.png" alt="BTC3.0" className="landing-nav-logo" />
            <span>BTC3.0</span>
          </div>
          <div className="landing-nav-actions">
            <InstallApp variant="button" />
            <button type="button" className="landing-nav-btn" onClick={onEnterApp}>
              Launch App
            </button>
          </div>
        </div>
      </nav>

      <div className="landing-install-wrap">
        <InstallApp variant="banner" />
      </div>

      <header className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-text">
            <span className="landing-badge">BEP20 · BSC Network</span>
            <h1>
              AI EARN <span className="gold">BTC3.0</span>
              <span className="landing-title-break">PLAN</span>
            </h1>
            <p className="landing-tagline">Smart Investment · Smart Earning · Secure Future</p>
            <div className="landing-hero-cta-group">
              <button type="button" className="landing-cta" onClick={onEnterApp}>
                START YOUR JOURNEY NOW <ArrowRight size={18} />
              </button>
              <p className="landing-sub-cta">Join the BTC3.0 Community</p>
            </div>
          </div>
          <div className="landing-hero-visual" aria-hidden="true">
            <div className="landing-coin-ring">
              <div className="landing-coin">BTC3.0</div>
            </div>
          </div>
        </div>
      </header>

      <section className="landing-section">
        <h2>Investment Details</h2>
        <div className="landing-info-grid">
          <div className="landing-info-card"><span>Minimum</span><strong>$10 USDT</strong></div>
          <div className="landing-info-card"><span>Maximum</span><strong>$10,000 USDT</strong></div>
          <div className="landing-info-card"><span>Cycle</span><strong>365 Days</strong></div>
          <div className="landing-info-card"><span>Network</span><strong>BEP20</strong></div>
        </div>
      </section>

      <section className="landing-section">
        <h2>Daily Affiliate Reward Package</h2>
        <div className="landing-table-wrap">
          <table className="landing-table">
            <thead>
              <tr><th>Investment (USD)</th><th>Daily ROI</th></tr>
            </thead>
            <tbody>
              {ROI_TIERS.map((t) => (
                <tr key={t.min}>
                  <td>${t.min.toLocaleString()} – ${t.max.toLocaleString()}</td>
                  <td className="gold">{t.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="landing-mobile-cards landing-mobile-only">
          {ROI_TIERS.map((t) => (
            <div key={t.min} className="landing-mobile-card">
              <span className="landing-mobile-card-label">Investment</span>
              <strong>${t.min.toLocaleString()} – ${t.max.toLocaleString()}</strong>
              <span className="landing-mobile-card-value gold">{t.rate}% daily</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-tokenomics">
        <h2>Tokenomics</h2>
        <div className="landing-tokenomics-grid">
          <div className="landing-donut">
            <div className="donut-center">100%<br />Supply</div>
          </div>
          <ul className="landing-token-list">
            <li><span className="dot dot-60" /> 60% Public Minting</li>
            <li><span className="dot dot-25" /> 25% Staking Rewards</li>
            <li><span className="dot dot-5" /> 5% Marketing</li>
            <li><span className="dot dot-5b" /> 5% Development</li>
            <li><span className="dot dot-25b" /> 2.5% Team</li>
            <li><span className="dot dot-25c" /> 2.5% Reserve</li>
          </ul>
        </div>
      </section>

      <section className="landing-section">
        <h2>Level Income (20 Levels)</h2>
        <div className="landing-levels-grid">
          <div className="landing-level-group"><strong>Level 1</strong><span>8%</span></div>
          <div className="landing-level-group"><strong>Levels 2–5</strong><span>1.0% each</span></div>
          <div className="landing-level-group"><strong>Levels 6–10</strong><span>0.50% each</span></div>
          <div className="landing-level-group"><strong>Levels 11–15</strong><span>0.25% each</span></div>
          <div className="landing-level-group"><strong>Levels 16–20</strong><span>0.10% each</span></div>
        </div>
      </section>

      <section className="landing-section">
        <h2>Rank Bonus</h2>
        <div className="landing-table-wrap landing-desktop-only">
          <table className="landing-table">
            <thead><tr><th>Rank</th><th>One-Time Bonus</th></tr></thead>
            <tbody>
              {RANK_BONUSES.map((b, i) => (
                <tr key={i}><td>{RANK_BONUS_NAMES[i]}</td><td className="gold">{b}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="landing-mobile-cards landing-mobile-only">
          {RANK_BONUSES.map((b, i) => (
            <div key={i} className="landing-mobile-card landing-mobile-card-row">
              <strong>{RANK_BONUS_NAMES[i]}</strong>
              <span className="gold">{b}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section">
        <h2>Monthly Salary Bonus</h2>
        <div className="landing-table-wrap landing-desktop-only">
          <table className="landing-table">
            <thead><tr><th>Rank</th><th>Monthly Salary</th></tr></thead>
            <tbody>
              {SALARY_AMOUNTS.map((s, i) => (
                <tr key={i}><td>{SALARY_RANK_NAMES[i]}</td><td className="gold">{s} USDT</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="landing-mobile-cards landing-mobile-only">
          {SALARY_AMOUNTS.map((s, i) => (
            <div key={i} className="landing-mobile-card landing-mobile-card-row">
              <strong>{SALARY_RANK_NAMES[i]}</strong>
              <span className="gold">{s}/mo</span>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-section-steps">
        <h2>How to Start</h2>
        <div className="landing-steps">
          {STEPS.map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="landing-step">
                <div className="landing-step-num">{i + 1}</div>
                <step.icon size={24} />
                <span>{step.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="landing-step-arrow" aria-hidden="true" />}
            </React.Fragment>
          ))}
        </div>
        <button type="button" className="landing-cta landing-cta-center" onClick={onEnterApp}>
          CREATE ACCOUNT / ENROLL NOW <ArrowRight size={18} />
        </button>
      </section>

      <footer className="landing-footer">
        <div className="landing-features">
          {FEATURES.map((f) => (
            <div key={f.label}>
              <f.icon size={20} />
              {f.label}
            </div>
          ))}
        </div>
        <p className="landing-copy">© 2026 AI EARN BTC3.0 Plan · BSC Testnet</p>
      </footer>

      {/* Sticky mobile CTA */}
      <div className="landing-mobile-sticky-cta">
        <button type="button" className="landing-cta landing-cta-full" onClick={onEnterApp}>
          Launch DApp <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

export default Landing;

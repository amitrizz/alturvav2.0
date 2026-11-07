import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, HelpCircle, ChevronUp, ChevronDown } from "lucide-react";
import "./Chatbot.css";

const PRESETS = [
  {
    q: "What is Sovereign Global Protocol v3.3?",
    answers: [
      "Sovereign Global Protocol v3.3 (Master Final Architecture & 10X Viral Edition) is a 100% decentralized, peer-to-peer (P2P) mathematical protocol on BNB Chain (BSC) operating purely in USDT (BEP-20) with gas paid in BNB. No funds are retained in the contract ledger.",
      "The protocol features 6 entry packages ($25, $50, $100, $200, $500, $1,000) with 100% live split across 5 automated community pools: 30% Quantum ROI, 30% Monoline Nexus, 25% Velocity Gen, 10% Cashback, and 5% FOMO Jackpot.",
      "Built with Genesis Admin Triangle Chain (top 3 fixed IDs) and zero protocol retention, guaranteeing 100% transparent on-chain mathematical liquidity.",
      "Enjoy unlimited multiple IDs from single or multiple wallets, dynamic compression, a 300% Hard-Cap Re-Birth Loop, and instant viral FOMO triggers."
    ]
  },
  {
    q: "How does the Time-Bomb Quantum ROI (30% Pool) work?",
    answers: [
      "Quantum ROI is a global passive yield pool with a 2X (200%) cap. You earn 3.0% daily for the first 10 days, followed by 1.0% daily thereafter.",
      "Viral Reset Mechanism: Sponsoring 1 new direct referral immediately resets the 3.0% daily yield for another 10 days!",
      "Withdrawal Terms: Quantum ROI withdrawals are ALWAYS unlocked with ZERO direct sponsor condition. The withdrawal ratio is 40% Cash sent to your wallet and 60% Auto Re-invested back into the 5 pools.",
      "Minimum withdrawal is strictly $5 USDT, processed on-chain in real-time."
    ]
  },
  {
    q: "What is Monoline Nexus Yield (30% Pool)?",
    answers: [
      "Every member is positioned chronologically in a global single leg (Monoline ID #1, #2, #3...).",
      "You earn a 1% commission on package activations and auto-reinvestments from 15 active wallets above you and 15 active wallets below you (30 wallets total = 30% yield).",
      "Dynamic Compression: Inactive or retired accounts are automatically skipped so you always earn from 30 active wallets!",
      "Breakage or out-of-bounds shares are securely captured by the Genesis Admin Triangle."
    ]
  },
  {
    q: "How does Velocity Multi-Tier (25% Pool) pay out?",
    answers: [
      "Velocity is a 9-level generation unilevel model: Level 1 pays 13% fixed, Level 2 pays 3%, Level 3 pays 2%, and Levels 4 through 9 pay 1% each (total 25%).",
      "Unlock Rules: Level 1 is unlocked with 0 directs; Levels 2–3 require 1 active direct; Levels 4–6 require 2 active directs; Levels 7–9 require 3 active directs.",
      "Direct commission of 13% on Level 1 is credited instantly on every activation and upgrade.",
      "Working ledger withdrawal unlocks once you achieve at least 3 active direct referrals."
    ]
  },
  {
    q: "What is the 10-Minute Ghost Position?",
    answers: [
      "Upon connecting your Web3 wallet without paying, the smart contract locks a temporary Ghost Position in the Global Monoline.",
      "A reverse countdown timer (09:59) displays live global turnover and new participants queuing underneath you in real time.",
      "If you activate before the timer expires, you secure that monoline slot and its underlying volume. If not activated, the slot and queue are permanently deleted."
    ]
  },
  {
    q: "How do I qualify for the 72H Alpha Cashback Surge (10%)?",
    answers: [
      "Sponsor 3 active direct members within 72 hours of your package activation.",
      "Achieving this mission unlocks an instant 100% refund of your joining package amount directly into your wallet!",
      "If the 72-hour mission fails, the 10% pool allocation rolls safely into the Community Airdrop Pool."
    ]
  },
  {
    q: "What is the FOMO Apocalypse Jackpot (5% Pool)?",
    answers: [
      "It is an automated 24-hour countdown jackpot pool funded by 5% of all ecosystem volume.",
      "Settlement Rule: 70% of the jackpot is shared equally among the last 50 paid users, and 30% is split among the top 3 direct sponsors of that round.",
      "The countdown resets every 24 hours to spark perpetual global onboarding pressure."
    ]
  },
  {
    q: "What is the 300% Hard-Cap and Re-Birth Loop?",
    answers: [
      "No-Overflow Rule: Total cumulative earnings from all streams are capped at 300% (3X) of your active package tier. Any overflow diverts to the Stability Pool.",
      "Re-Birth Loop: Once 3X is reached, your old ID is retired, and the contract deducts the package amount from your final payout to spawn a new Re-Birth ID at the bottom of the Monoline.",
      "Smart Re-Birth Queue Jump: Leaders with 3+ directs in the last 30 days have their Re-Birth ID pushed into the priority VIP Fast-Track Slot!"
    ]
  },
  {
    q: "What are the Withdrawal Rules and Speed-Decay Engine?",
    answers: [
      "Global Minimum Withdrawal: $5 USDT.",
      "Quantum ROI: Always unlocked (40% Cash / 60% Auto Re-invest).",
      "Working Network: Locked until you have 3 active direct referrals. Once unlocked, the ratio is 70% Cash / 30% Auto Re-invest.",
      "Speed-Decay: If no new direct is sponsored in 14 days, payout speed temporarily drops from 50% to 10%. Sponsoring 1 new direct instantly restores 100% speed.",
      "30-Day Maintenance: Maintain 1 active direct per 30 days to keep the 70/30 ratio, otherwise it temporarily adjusts to 50/50."
    ]
  },
  {
    q: "What is the Admin Genesis Triangle and Dynamic Infinity Override?",
    answers: [
      "Genesis Triangle: The top 3 fixed IDs are hardcoded to the admin team, capturing all unearned spillovers, breakage, and overflow funds.",
      "Dynamic Infinity Override: When leaders build 4 or more directs, an infinity override triggers on all lifetime turnover (4–10 directs: 5%, 11–25 directs: 7%, 26+ directs: 10% Master Royalty) channeled to the Admin Master Wallet."
    ]
  }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Welcome to Sovereign Global Protocol v3.3 AI Assistant! Ask me anything about our 6 packages, 5 community pools, 10-minute Ghost Position, 72H Cashback Surge, 300% Re-Birth Loop, or withdrawal matrix."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    setTimeout(() => {
      let botResponse = "I'm your Sovereign Global Protocol v3.3 AI guide! Check the User Manual for complete formulas or select one of the suggested topics below.";

      const lower = query.toLowerCase();

      if (lower.includes("package") || lower.includes("tier") || lower.includes("deposit") || lower.includes("25") || lower.includes("1000")) {
        botResponse = "Sovereign Global Protocol v3.3 offers 6 packages: $25, $50, $100, $200, $500, and $1,000 USDT. Each package unlocks 15 Up + 15 Down monoline reach, 2X ROI Cap, and 300% (3X) Hard-Cap.";
      } else if (lower.includes("roi") || lower.includes("quantum") || lower.includes("passive") || lower.includes("3%")) {
        botResponse = "Time-Bomb Quantum ROI (30% Pool) pays 3% daily for the first 10 days, then 1% daily up to a 200% (2X) cap. Sponsoring 1 new direct resets the 3% daily rate for another 10 days! ROI withdrawals are always unlocked at 40% Cash / 60% Re-invest.";
      } else if (lower.includes("monoline") || lower.includes("single leg") || lower.includes("nexus") || lower.includes("15")) {
        botResponse = "Monoline Nexus Yield (30% Pool) pays 1% each from 15 active wallets above you and 15 active wallets below you (30% total). Dynamic compression automatically skips non-active IDs so you always earn from 30 active wallets.";
      } else if (lower.includes("velocity") || lower.includes("level") || lower.includes("unilevel") || lower.includes("generation") || lower.includes("13%")) {
        botResponse = "Velocity Multi-Tier Bonus (25% Pool) spans 9 generation levels: L1 pays 13% fixed (0 directs req), L2 pays 3% (1 direct), L3 pays 2% (1 direct), L4-L6 pay 1% each (2 directs), and L7-L9 pay 1% each (3 directs).";
      } else if (lower.includes("ghost") || lower.includes("10-minute") || lower.includes("timer")) {
        botResponse = "The 10-Minute Ghost Position temporarily reserves your slot in the Global Monoline with a 09:59 reverse countdown timer as soon as you connect your wallet. Activate before the timer hits 00:00 or your position and incoming queue volume are permanently deleted!";
      } else if (lower.includes("cashback") || lower.includes("72h") || lower.includes("72 hour") || lower.includes("refund")) {
        botResponse = "72H Alpha Cashback Surge (10% Pool): Sponsor 3 active direct members within 72 hours of your activation to receive an instant 100% refund of your joining fee!";
      } else if (lower.includes("fomo") || lower.includes("jackpot") || lower.includes("24h")) {
        botResponse = "FOMO Apocalypse Jackpot (5% Pool) is a 24-hour countdown pool: 70% is shared equally among the last 50 paid users, and 30% is split among the top 3 direct sponsors of that round!";
      } else if (lower.includes("hard cap") || lower.includes("rebirth") || lower.includes("re-birth") || lower.includes("300%") || lower.includes("3x")) {
        botResponse = "Zero-Leak 300% Hard-Cap: When your total income reaches 300% (3X) of your package, your ID retires and auto-spawns a new Re-Birth ID at the bottom of the Monoline (or VIP Fast-Track queue if you have 3+ directs in 30 days).";
      } else if (lower.includes("withdraw") || lower.includes("payout") || lower.includes("min") || lower.includes("5")) {
        botResponse = "Global minimum withdrawal is $5 USDT. ROI withdrawals are always unlocked (40% Cash / 60% Re-invest). Working network earnings are locked until you have 3 direct referrals, unlocking at 70% Cash / 30% Re-invest.";
      } else if (lower.includes("admin") || lower.includes("triangle") || lower.includes("override") || lower.includes("royalty")) {
        botResponse = "The Genesis Admin Triangle consists of the top 3 hardcoded IDs capturing spillovers. From the 4th direct onwards, leaders trigger 5% to 10% Dynamic Infinity Overrides routed to the Master Admin Wallet.";
      } else {
        const matchedPreset = PRESETS.find((p) =>
          lower.includes(p.q.toLowerCase().slice(0, 10))
        );
        if (matchedPreset) {
          const randAns = matchedPreset.answers[Math.floor(Math.random() * matchedPreset.answers.length)];
          botResponse = randAns;
        }
      }

      setMessages((prev) => [...prev, { sender: "bot", text: botResponse }]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="chatbot-wrapper">
      {!isOpen && (
        <button className="chatbot-launcher-btn" onClick={() => setIsOpen(true)}>
          <Bot size={22} className="bot-icon" />
          <span className="btn-label">Sovereign AI Guide</span>
          <span className="pulse-indicator"></span>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-card glass-panel">
          <div className="chatbot-header">
            <div className="header-meta">
              <div className="avatar-box">
                <Bot size={20} className="gold" />
              </div>
              <div>
                <h4>Sovereign Protocol v3.3 AI</h4>
                <span className="online-status">● Live Blockchain Assistant</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="chatbot-presets">
            <span className="presets-title"><HelpCircle size={12} /> Popular Protocol Queries:</span>
            <div className="preset-scroll">
              {PRESETS.slice(0, 6).map((preset, idx) => (
                <button
                  key={idx}
                  className="preset-chip"
                  onClick={() => handleSend(preset.q)}
                >
                  {preset.q}
                </button>
              ))}
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-bubble-row ${msg.sender}`}>
                {msg.sender === "bot" && (
                  <div className="bubble-avatar bot">
                    <Bot size={14} />
                  </div>
                )}
                <div className={`chat-bubble ${msg.sender}`}>
                  <p>{msg.text}</p>
                </div>
                {msg.sender === "user" && (
                  <div className="bubble-avatar user">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble-row bot">
                <div className="bubble-avatar bot">
                  <Bot size={14} />
                </div>
                <div className="chat-bubble bot typing">
                  <Loader2 size={16} className="animate-spin cyan" />
                  <span>Analyzing protocol rules...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            className="chatbot-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              placeholder="Ask about pools, 3X cap, ROI, Ghost position..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" disabled={!input.trim() || loading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

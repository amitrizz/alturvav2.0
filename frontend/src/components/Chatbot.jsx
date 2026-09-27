import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, HelpCircle, ChevronUp, ChevronDown } from "lucide-react";
import "./Chatbot.css";

const PRESETS = [
  {
    q: "What is BTC3.O?",
    answers: [
      "BTC3.O is the AI EARN BTC3.0 PLAN — a DeFi platform with 365-day investments, ROI by amount ($10–$10K), 20-level referral income, rank bonuses, and monthly USDT salary.",
      "It is an innovative smart contract ecosystem built for dynamic token minting, passive staking payouts, and affiliate network rewards.",
      "BTC3.O provides multiple Web3 earning channels including daily staking yields, a bonding curve minting mechanism, and team achievements.",
      "Our platform offers a complete Web3 experience combining DeFi staking, lucky draws, network referrers, and rank milestone rewards.",
      "BTC3.O is a decentralized portal designed to let users mint tokens, stake for yield, spin the lucky wheel, and climb affiliate ranks.",
      "At its core, BTC3.O is the AI EARN BTC3.0 plan on BEP20: mint, 365-day stake ROI tiers, 20-level income, rank USDT bonuses, and monthly salary.",
      "BTC3.O is an all-in-one reward platform where you can buy early, stake for daily payouts, spin the wheel, and invite team members.",
      "It is a utility-driven DeFi ecosystem that uses smart contracts to handle decentralized minting, staking yield pools, and rank milestone achievements.",
      "BTC3.O is a community-first DeFi hub offering 365-day ROI tiers, 20-level mint commissions, rank USDT bonuses, and monthly salary.",
      "Welcome to BTC3.O! A decentralized Web3 dashboard that merges bonding curve minting, staking nodes, referral rewards, and lucky draws."
    ]
  },
  {
    q: "How does Staking Yield work?",
    answers: [
      "Stake $10–$10,000 (USD value) for a 365-day cycle. Daily ROI: 0.5% ($10–$499), 0.6% ($500–$2K), 0.75% ($2K–$5K), or 1.0% ($5K–$10K).",
      "After you mint BTC3.O, stake tokens in the Stake tab. Rewards accrue daily by tier and can be claimed in BTC3.O tokens.",
      "The 365-day investment cycle matches the plan poster. Principal unlocks via unstake after the cycle ends.",
      "Higher deposits unlock higher daily ROI bands up to 1% per day on the top tier ($5,001–$10,000).",
      "Mint activates your investment; staking starts the daily affiliate reward package (ROI) from the plan table.",
      "Claim staking rewards from the Stake portal whenever rewards are available, until your stake completes or caps.",
      "ROI rate is set when you stake based on the USD value of that stake position.",
      "Minimum stake/mint is $10 USDT equivalent; maximum is $10,000 per the plan rules.",
      "Team business from your downline mint and stake counts toward rank progress.",
      "See exact ROI tiers on the landing page and Dashboard—they match the smart contract."
    ]
  },
  {
    q: "What is the Referral Program?",
    answers: [
      "Our 20-level program pays: Level 1 = 8%, Levels 2–5 = 1%, Levels 6–10 = 0.5%, Levels 11–15 = 0.25%, Levels 16–20 = 0.1% on team mint volume.",
      "Level income is paid in BTC3.O tokens when your downline mints (activates investment). All 20 upline levels can earn per the plan table.",
      "Refer friends after you register. When they mint USDT/BNB into BTC3.O, you receive your level percentage automatically.",
      "Commissions follow the AI EARN BTC3.0 plan: 8% on level 1, then 1%, 0.5%, 0.25%, and 0.1% for deeper levels.",
      "Mint activates investment and triggers level income for your referrer chain up to 20 levels deep.",
      "Team business and rank progress count both mint and stake volume across your network.",
      "Share your referral link from the Ranks tab. No extra unlock steps—levels pay on qualifying mint events.",
      "Level percentages match the official poster: 8% / 1% / 0.5% / 0.25% / 0.1% bands across 20 levels.",
      "Register first, then mint $10–$10,000 to activate. Your upline earns level income on that mint.",
      "See full level income and rank tables on the landing page and Ranks & Levels screen."
    ]
  },
  {
    q: "How do Rank Rewards work?",
    answers: [
      "Ranks Bronze to Elite Crown unlock one-time USDT bonuses ($20–$50K) based on self BTC3.0 volume, directs, and team size per the plan table.",
      "Gold through Elite Crown can qualify for monthly USDT salary ($50–$10,000) claimable once every 30 days.",
      "Rank requirements match the poster: e.g. Bronze $500 self / 3 directs / team 10 for $20 USDT bonus.",
      "Salary ranks start at Gold ($1,500 self, 9 directs, team 100) for $50/month USDT.",
      "Claim rank bonuses and monthly salary from the Ranks tab when qualified.",
      "Self investment includes mint and stake USD credited on-chain toward rank progress.",
      "Elite Crown rank bonus is $50,000 USDT one-time; Elite monthly salary is $10,000 USDT.",
      "Team size counts your entire referral downline registered under you.",
      "Rank bonuses pay in USDT from the contract reserve; salaries pay monthly in USDT.",
      "Full rank and salary tables are on the landing page and Ranks & Levels dashboard."
    ]
  },
  {
    q: "What is the Lucky Wheel spin cost?",
    answers: [
      "Spinning costs 10 tokens. Payout matches: Double (5 tokens), Triple (15 tokens), Mega (50 tokens), and Jackpot (150 tokens).",
      "Each spin costs 10 BTC3.O. Instant wins include Double Match (5 tokens), Mega (50 tokens), and Jackpot (150 tokens) prizes.",
      "Spend 10 tokens to spin. Prizes range from Double Match (5 tokens), Triple (15 tokens), up to a 150 token Jackpot!",
      "A wheel spin costs 10 tokens. You can win up to 150 tokens (Jackpot) with a 50% overall probability of hitting a match.",
      "Spin for 10 BTC3.O. Rewards are: Double Match (5 tokens), Triple Match (15 tokens), Mega (50 tokens), and Jackpot (150 tokens).",
      "Every draw costs 10 tokens. Win instant prizes: 5 tokens (Double), 15 tokens (Triple), 50 tokens (Mega), or 150 tokens (Jackpot).",
      "Spin cost is 10 tokens. Multipliers pay out instant rewards of 5, 15, 50, or 150 tokens directly to your wallet.",
      "Play the wheel for 10 tokens. Win instant prizes like the 50 token Mega draw or the 150 token Jackpot payout!",
      "Spin the Lucky Wheel for 10 tokens. Possible rewards: 5 tokens, 15 tokens, 50 tokens, or the grand 150 token Jackpot.",
      "Each draw consumes 10 tokens. Hit matching segments to win instant payouts of 5, 15, 50, or 150 tokens."
    ]
  },
  {
    q: "How do I register on the platform?",
    answers: [
      "To register, connect your Web3 wallet and perform a minting transaction or ask your sponsor for their referral link to join.",
      "Registration is simple. Connect your wallet, enter a sponsor address if prompted, and complete a Genesis Mint or Stake action.",
      "Just connect your wallet to the platform! If you came via a referral link, the sponsor address will automatically bind when you register.",
      "You register automatically by connecting your MetaMask/TrustWallet and carrying out your first token mint or stake transaction.",
      "Simply connect your wallet, load BNB or USDT, and perform a mint. This automatically registers your address in our contract database.",
      "The system registers your wallet address on the blockchain as soon as you interact with the minting contract for the first time.",
      "Connect your Web3 browser wallet, make sure you have enough gas fees, and interact with the platform to trigger automatic registration.",
      "To register, connect your wallet and input your sponsor's referral address. Your profile will be instantly saved in the contract.",
      "Registration triggers automatically on your first smart contract transaction. Make sure your sponsor's link is active.",
      "No sign-up form is needed! Connect your decentralized wallet, execute a mint or stake, and you are officially registered."
    ]
  },
  {
    q: "What are Promo Coupons?",
    answers: [
      "Promo coupons are optional codes added by the platform admin. Enter a valid code on the Mint tab to receive the coupon reward.",
      "Coupons must be enabled on-chain before use. Invalid codes will be rejected by the smart contract.",
      "After you register, you can apply a coupon from the Mint screen if you have a valid promotional code.",
      "Coupon rewards are credited per contract rules when the code is accepted.",
      "Ask your community leader or official channels for active coupon codes.",
      "Coupons are separate from the standard mint curve—they are promotional extras only.",
      "You still need to register and meet mint limits ($10–$10,000) when using coupons.",
      "One coupon application is tracked per contract rules; use only official codes.",
      "Coupon success appears in your Profile activity when the transaction confirms.",
      "For coupon issues, verify you are on BSC Testnet and registered in the system."
    ]
  },
  {
    q: "How can I withdraw my earnings?",
    answers: [
      "Withdraw your staking yield and affiliate rewards directly from the Stake and Ranks tabs. Payouts go straight to your wallet.",
      "Claim rewards by clicking 'Claim' in the Staking Portal or Ranks panel. Payouts are transferred directly to your Web3 wallet.",
      "Go to your dashboard or the respective Stake/Rank tab. Click the claim button to send your earnings directly to your connected wallet.",
      "Withdrawals are decentralized. Just click the claim buttons on the tabs to receive your yields and rank bonuses instantly.",
      "Earnings accumulate in the smart contract. You can withdraw them by triggering the claim functions on the Staking or Ranks panels.",
      "All yield and referral earnings can be withdrawn to your wallet at any time by executing the claim transaction in the interface.",
      "Simply click the 'Claim' button in the active stake details box or ranks dashboard to withdraw earnings directly to your address.",
      "Withdrawals are processed instantly on the blockchain. Click Claim, approve the gas fee, and the tokens will hit your wallet.",
      "You can withdraw your accumulated rewards at any moment. The smart contract transfers them to your wallet instantly.",
      "Yields, commissions, and rank bonuses can be withdrawn via the claim buttons. There are no manual holds or delay times."
    ]
  },
  {
    q: "Is there any penalty for unstaking?",
    answers: [
      "Unstake is allowed after the 365-day cycle completes. You cannot unstake principal before the cycle ends.",
      "The plan uses a 365-day investment cycle—wait until your stake end time, then unstake from the Stake tab.",
      "Selling BTC3.O back via Profile swap may include platform fee rules shown in the app; unstake returns staked principal after 365 days.",
      "Claim ROI anytime during the cycle; unstaking principal is separate and time-locked for 365 days.",
      "Check days remaining on each stake in the Staking Portal before planning an unstake.",
      "After 365 days, unstake returns your locked tokens per contract logic.",
      "Early exit is not supported for staked principal before the cycle—plan for the full 365-day term.",
      "Reward cap rules apply to claims during the cycle; see Stake details for your position.",
      "For liquidity before unstake, review Profile swap options and fee breakdown.",
      "Always confirm network (BSC Testnet) and wallet connection before unstake transactions."
    ]
  },
  {
    q: "How can I track my network referrals?",
    answers: [
      "Go to the Ranks tab and select the 'Referral Program' subtab. You will find your link, team tree metrics, and commission history.",
      "You can track your referrals on the Referral Program subtab under Ranks, which displays your referral link and level statistics.",
      "Your team statistics are located in the Referral Program section of the Ranks tab. You can view level-by-level metrics there.",
      "Open the Ranks tab, select the Referral subtab, and review your total downline volume, active direct referrals, and payout logs.",
      "Your dashboard and the Ranks/Referral subtab show your complete downline logs, active referrers count, and team staking volume.",
      "Check the Ranks & Levels page under Referral Program to view your direct partners, downline team count, and unlocked levels.",
      "Track your referral progress on the Ranks tab (Referral subtab). It logs all level allocations and strong leg calculations.",
      "Visit the Referral Program section under Ranks to see your active referral statistics, total team volume, and commissions.",
      "Referral counts and tier payouts are visible under the Ranks tab. Scroll down to the referral program section to track your team.",
      "The Referral subtab in the Ranks page provides a level-by-level team list, total downline staking volume, and network commissions."
    ]
  }
];

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I am your BTC3.O Assistant. How can I help you generate rewards today?" }
  ]);
  const [customInput, setCustomInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking]);

  const handleSendQuestion = (questionText) => {
    if (!questionText.trim()) return;

    // Add user message
    const userMsg = { sender: "user", text: questionText };
    setMessages(prev => [...prev, userMsg]);
    setCustomInput("");
    setIsThinking(true);

    // Look for preset answers or generate a generic reply
    const foundPreset = PRESETS.find(p => p.q.toLowerCase() === questionText.toLowerCase() || questionText.toLowerCase().includes(p.q.toLowerCase().substring(0, 15)));
    
    // Varrying thinking time: random delay between 800ms and 2300ms
    const randomDelay = Math.floor(Math.random() * (2300 - 800 + 1)) + 800;

    setTimeout(() => {
      setIsThinking(false);
      
      let replyText = "That is a great question! For detailed information regarding this DeFi contract feature, you can also consult our official Docs & Guides modal on the Dashboard page.";
      
      if (foundPreset && foundPreset.answers) {
        // Randomly pick one of the 10 answers
        const randIdx = Math.floor(Math.random() * foundPreset.answers.length);
        replyText = foundPreset.answers[randIdx];
      }

      const botReply = {
        sender: "bot",
        text: replyText
      };
      setMessages(prev => [...prev, botReply]);
    }, randomDelay);
  };

  return (
    <div className="cb-chatbot-wrapper">
      {/* Floating Chat Bubble Button */}
      {!isOpen && (
        <button className="cb-bubble-btn" onClick={() => setIsOpen(true)}>
          <Bot size={24} />
          <span className="cb-pulse-dot"></span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="cb-chat-window">
          {/* Header */}
          <div className="cb-chat-header">
            <div className="cb-header-title">
              <Bot size={20} className="cb-bot-logo" />
              <div>
                <h4>BTC3.O Assistant</h4>
                <span className="cb-status">Active Online</span>
              </div>
            </div>
            <button className="cb-close-btn" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </button>
          </div>

          {/* Quick Info Bar showing public images as a slide banner */}
          <div className="cb-promo-banner">
            <img src="/img1.jpeg" alt="promo1" className="cb-promo-img" />
            <img src="/img2.jpeg" alt="promo2" className="cb-promo-img" />
            <img src="/img3.jpeg" alt="promo3" className="cb-promo-img" />
            <div className="cb-banner-overlay-text">
              AI EARN BTC3.0 · Daily ROI up to 1%
            </div>
          </div>

          {/* Messages Area */}
          <div className="cb-messages-area">
            {messages.map((msg, idx) => (
              <div className={`cb-msg-row ${msg.sender}`} key={idx}>
                <div className="cb-avatar-circle">
                  {msg.sender === "bot" ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className="cb-msg-text-bubble">
                  {msg.text}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="cb-msg-row bot">
                <div className="cb-avatar-circle">
                  <Bot size={14} />
                </div>
                <div className="cb-msg-text-bubble cb-thinking-bubble">
                  <Loader2 size={12} className="animate-spin inline mr-1" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          {/* Preset Questions Dropdown Selector (Main Footer) */}
          <div className="cb-chat-footer cb-presets-footer">
            <div className="cb-presets-label">
              <HelpCircle size={12} />
              <span>Ask a Platform Question:</span>
            </div>

            <div className="cb-custom-select-wrapper">
              <button 
                className="cb-custom-select-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>-- Select a Question --</span>
                {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isDropdownOpen && (
                <div className="cb-custom-options-list">
                  {PRESETS.map((item, idx) => (
                    <div 
                      className="cb-custom-option-item" 
                      key={idx}
                      onClick={() => {
                        handleSendQuestion(item.q);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {item.q}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;

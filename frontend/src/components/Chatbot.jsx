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
      "At its core, BTC3.O is a DeFi protocol with a bonding curve mint, 180% APR staking, lucky wheel draws, and level-based team business rewards.",
      "BTC3.O is an all-in-one reward platform where you can buy early, stake for daily payouts, spin the wheel, and invite team members.",
      "It is a utility-driven DeFi ecosystem that uses smart contracts to handle decentralized minting, staking yield pools, and rank milestone achievements.",
      "BTC3.O is a community-first DeFi hub offering staking yields up to 3x cap, 15 referral levels, wheel prize pools, and rank daily salaries.",
      "Welcome to BTC3.O! A decentralized Web3 dashboard that merges bonding curve minting, staking nodes, referral rewards, and lucky draws."
    ]
  },
  {
    q: "How does Staking Yield work?",
    answers: [
      "Invest $10–$10,000 for a 365-day cycle. Daily ROI depends on amount: 0.5% ($10–$499), 0.6% ($500–$2K), 0.75% ($2K–$5K), or 1.0% ($5K–$10K).",
      "Staking pools offer a passive daily rate of 0.5% paid in tokens. Once you reach 3x your initial staked USD value, the stake completes.",
      "Earn 180% APR by staking your tokens. Rewards accumulate daily and can be claimed anytime until you hit the 300% limit.",
      "Staking pays out a stable 0.5% daily yield. Your stake continues earning until total claims equal 300% of your starting USD deposit.",
      "By locking your tokens, you unlock passive daily yields of 0.5%. The maximum payout limit per stake is capped at 300% value.",
      "Staking yield is computed at 0.5% daily. The smart contract limits your total claimed rewards to 3x your initial deposit value.",
      "Lock tokens to start earning daily payouts at 180% APR. Once your claimed rewards hit the 300% USD limit, the staking period ends.",
      "The platform rewards stakers with 0.5% daily interest (15% monthly). The stake reaches completion once you draw 300% total payouts.",
      "Passive rewards accrue daily at a rate of 0.5% (180% annual percentage rate) with a maximum lifetime cap of 3x your stake size.",
      "Enjoy a daily yield of 0.5% on your locked tokens. The contract automatically expires the stake once it delivers a 300% return."
    ]
  },
  {
    q: "What is the Referral Program?",
    answers: [
      "Our 20-level program pays: Level 1 = 8%, Levels 2–5 = 1%, Levels 6–10 = 0.5%, Levels 11–15 = 0.25%, Levels 16–20 = 0.1%.",
      "Earn commissions up to 15 levels deep based on the staking volume of your network referrals.",
      "Unlock affiliate payouts down to 15 tiers. You need active direct referrers to sequentially unlock deeper levels.",
      "Refer friends to earn network percentages: Level 1 pays 8%, Level 2 pays 4%, Level 3 pays 2%, down to 0.25% on Level 15.",
      "We offer a 15-level network program. Commissions are distributed instantly when your referrals register and stake.",
      "The affiliate network awards direct commissions on Level 1 (8%) and Level 2 (4%), going down to Level 15 (0.25%).",
      "Our referral program pays commissions up to 15 levels. Deeper tiers unlock as you refer more active users.",
      "Earn passive commissions from your network: Level 1 offers 8%, Level 2 offers 4%, and levels 5-9 offer 0.5%.",
      "Unlock up to 15 levels of network commissions. The deeper levels unlock based on the number of direct users you invite.",
      "Earn recurring rewards when your referrals lock stakes. Payouts scale down 15 levels (starting at 8% for direct referrals)."
    ]
  },
  {
    q: "How do Rank Rewards work?",
    answers: [
      "Ranks Bronze to Elite Crown unlock one-time USDT bonuses ($20–$50K) based on self investment, directs, and team size. Gold+ ranks earn monthly USDT salary up to $10,000.",
      "Achieving higher ranks based on team volume gives you a daily reward for 150 days plus physical assets (Hyundai, BMW, Mercedes).",
      "Team business volume determines your rank. Higher ranks pay direct daily USD rewards up to 150 days and luxury cars.",
      "Advance ranks by accumulating team volume (50% strong leg limit). Ranks yield guaranteed daily payouts for 150 days and car rewards.",
      "Your rank increases with team staking volume. You will earn daily rank salaries for 150 days and milestone vehicles (Creta, BMW, Mercedes).",
      "Accumulate team volume to reach ranks. Ranks pay guaranteed daily salaries (up to $35,000/day) for 150 days and physical luxury cars.",
      "Ranks pay a daily allowance for up to 150 days. Milestone rewards include SUVs, BMWs, and Mercedes sedans based on volume.",
      "Unlocking ranks awards daily salaries for 150 days. Ranks are based on team business and offer cars as milestone achievements.",
      "Grow your network volume to climb ranks. Receive daily rank bonuses for 150 days and top vehicles (Hyundai SUV, BMW, Mercedes).",
      "Ranks award daily rewards (up to $35k) for 150 days. Reach top milestones to win physical car awards like Hyundai, BMW, and Mercedes."
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
      "Promo Coupons are special promo codes that you can enter on the Mint page to double your minted token rewards.",
      "A Promo Coupon is a discount or bonus key. Applying it during a Genesis Mint gives you 2x the standard token value.",
      "Use coupons on the Genesis Mint tab. Enter a valid code to instantly double the amount of tokens you receive for your deposit.",
      "Coupons are promotional tools. Enter them next to the mint amount to double your token allocation from the curve.",
      "Enter coupon codes during Genesis Minting. They are designed to double your token balance rewards upon successful mint.",
      "Coupons allow you to mint 2x the tokens for the same amount of USDT/BNB. Enter them directly in the mint form input.",
      "These codes double your minted tokens. Get coupon keys from community promotional drops or affiliate leaders.",
      "Promo Coupons give stakers double value on Genesis Minting. Apply a valid code to receive a 100% token bonus.",
      "Simply copy-paste a coupon code into the promo input inside the Mint tab to double your output of tokens.",
      "Applying coupon codes doubles your minted tokens instantly. It's the best way to maximize your starting balance."
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
      "Unstaking before your 3x payout cap is reached is subject to a contract fee of 10% on the remaining staked amount.",
      "Yes, early unstaking incurs a 10% fee on your principal balance, which goes back into the reward pool to sustain the ecosystem.",
      "An early unstake fee of 10% applies if you choose to withdraw your staked principal before achieving your 300% USD return limit.",
      "To maintain pool health, unstaking your tokens before the 3x cap completes incurs a standard 10% smart contract fee.",
      "Unstaking early carries a 10% protocol fee. Letting the stake run to its full 3x return prevents any principal fee.",
      "Yes, you can unstake at any time, but doing so early triggers a 10% fee which is subtracted from your unstaked tokens.",
      "If you unstake early, a 10% fee is applied to your principal. We advise letting your stakes compound to avoid the fee.",
      "The platform charges a 10% early unstake penalty to secure liquidity. The penalty is waived once you achieve the 300% cap.",
      "Unstaking before the 300% return is hit deducts a 10% tax. This tax is automatically sent to the staking pool.",
      "Early unstake transactions trigger a 10% fee. Staking until the 3x cap is reached avoids any early exit penalty."
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
              Earn 180% APR Staking
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

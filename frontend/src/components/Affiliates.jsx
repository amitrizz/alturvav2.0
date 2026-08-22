import React, { useState } from "react";
import { Wallet, Copy, Check, Info, ArrowUpRight, ArrowDownLeft, Coins, Flame, Layers, Users, Trophy, Compass, BookOpen, RefreshCw } from "lucide-react";
import "./Affiliates.css";

function Affiliates({
  tokenSymbol,
  account,
  bnbBalance,
  usdtBalance,
  btcBalance,
  transactionHistory,
  subTab = "profile",
  setSubTab,
  executeSellTokens,
  currentPrice = "0.5",
  txLoading = false,
  userStakesList = []
}) {
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [swapAmount, setSwapAmount] = useState("");
  const [swapMethod, setSwapMethod] = useState("USDT"); // "USDT" or "BNB"
  const [isSwapping, setIsSwapping] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);

  const handleSwap = async (e) => {
    e.preventDefault();
    if (!swapAmount || isNaN(swapAmount) || parseFloat(swapAmount) <= 0) return;
    setIsSwapping(true);
    const success = await executeSellTokens(swapAmount, swapMethod);
    if (success) {
      setSwapAmount("");
    }
    setIsSwapping(false);
  };

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    }
  };

  const truncateAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const getPenaltyBreakdown = (amountStr) => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      return { sub20: 0, sub10: 0, sub5: 0, sub0: 0, totalFeeTokens: 0, totalFeeUSD: 0 };
    }

    const batches = [];

    // 1. Gather Mint batches from transactionHistory
    const mintEvents = transactionHistory.filter(tx => tx.type === "Mint" && tx.timestamp);
    mintEvents.forEach(tx => {
      batches.push({
        type: "Mint",
        amount: parseFloat(tx.btcAmount),
        timestamp: tx.timestamp
      });
    });

    // 2. Gather Staking batches from userStakesList
    userStakesList.forEach(st => {
      const ts = Math.floor(new Date(st.startTime).getTime() / 1000);
      batches.push({
        type: "Stake",
        amount: parseFloat(st.amountTokens),
        timestamp: ts
      });
    });

    // Sort batches FIFO (oldest first)
    batches.sort((a, b) => a.timestamp - b.timestamp);

    let remaining = amount;
    let sub20 = 0;
    let sub10 = 0;
    let sub5 = 0;
    let sub0 = 0;

    const now = Math.floor(Date.now() / 1000);
    const oneMonth = 30 * 24 * 60 * 60;
    const threeMonths = 90 * 24 * 60 * 60;
    const sixMonths = 180 * 24 * 60 * 60;

    for (let batch of batches) {
      if (remaining <= 0) break;
      const take = Math.min(remaining, batch.amount);
      const age = now - batch.timestamp;

      if (batch.type === "Mint") {
        if (age < oneMonth) {
          sub20 += take;
        } else {
          sub0 += take;
        }
      } else {
        if (age < threeMonths) {
          sub10 += take;
        } else if (age >= sixMonths) {
          sub5 += take;
        } else {
          sub0 += take;
        }
      }

      remaining -= take;
    }

    if (remaining > 0) {
      sub0 += remaining;
    }

    const fee20 = sub20 * 0.20;
    const fee10 = sub10 * 0.10;
    const fee5 = sub5 * 0.05;
    const totalFeeTokens = fee20 + fee10 + fee5;
    const totalFeeUSD = totalFeeTokens * parseFloat(currentPrice);

    return {
      sub20,
      sub10,
      sub5,
      sub0,
      totalFeeTokens,
      totalFeeUSD
    };
  };

  // Filter history
  const purchases = transactionHistory.filter(tx => tx.category === "purchase");
  const withdrawals = transactionHistory.filter(tx => tx.category === "withdrawal");

  return (
    <div className="af-tab-pane">
      {/* Wallet Profile Summary Card */}
      <div className="af-wallet-profile-card">
        <div className="af-wallet-card-header">
          <div className="af-wallet-icon-title">
            <div className="af-wallet-avatar">
              <Wallet size={24} className="gold-text" />
            </div>
                <div>
                  <span className="af-wallet-subtitle">Connected Wallet</span>
                  <div className="af-wallet-address-row">
                    <span className="af-wallet-address font-mono">{truncateAddress(account)}</span>
                    <button className="af-copy-addr-btn" onClick={copyAddress} title="Copy Address">
                      {copiedAddr ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="af-balances-grid">
              <div className="af-balance-box main-balance">
                <span className="af-balance-label">{tokenSymbol} Balance</span>
                <div className="af-balance-value-row">
                  <Coins size={22} className="gold-text" />
                  <h3>{btcBalance}</h3>
                </div>
              </div>
              <div className="af-balance-box">
                <span className="af-balance-label">USDT Balance</span>
                <h3>${usdtBalance}</h3>
              </div>
              <div className="af-balance-box">
                <span className="af-balance-label">BNB Balance</span>
                <h3>{bnbBalance} BNB</h3>
              </div>
            </div>
          </div>

      {/* Swap / Exchange Tokens Card */}
      <div className="af-card-box af-swap-card" style={{ marginBottom: "20px", padding: "24px" }}>
        <h3 className="af-card-title" style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0, fontSize: "1.2rem" }}>
          <RefreshCw size={20} className="gold-text" /> Swap / Exchange {tokenSymbol}
        </h3>
        <p className="af-swap-description" style={{ color: "var(--gm-text-secondary)", fontSize: "0.82rem", margin: "6px 0 20px", lineHeight: "1.4" }}>
          Sell your {tokenSymbol} tokens back into the contract instantly for USDT. (<span style={{ textDecoration: "underline", color: "var(--gold)", cursor: "pointer", fontWeight: "bold" }} onClick={() => setIsPenaltyModalOpen(true)}>Applied Platform Fee</span>)
        </p>

        <form onSubmit={handleSwap} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--gm-text-secondary)", marginBottom: "6px" }}>Amount to Swap ({tokenSymbol})</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input 
                  type="number" 
                  placeholder={parseFloat(btcBalance) === 0 ? "No tokens to swap" : "0.0"}
                  value={swapAmount}
                  disabled={parseFloat(btcBalance) === 0}
                  max={btcBalance}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  style={{
                    width: "100%",
                    height: "42px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    border: "1px solid rgba(148,163,184,0.1)",
                    color: "#fff",
                    padding: "0 60px 0 12px",
                    outline: "none",
                    opacity: parseFloat(btcBalance) === 0 ? 0.5 : 1
                  }}
                />
                {parseFloat(btcBalance) > 0 && (
                  <button
                    type="button"
                    onClick={() => setSwapAmount(btcBalance)}
                    style={{
                      position: "absolute",
                      right: "8px",
                      background: "rgba(251, 191, 36, 0.15)",
                      border: "1px solid rgba(251, 191, 36, 0.3)",
                      color: "var(--gold)",
                      fontSize: "0.68rem",
                      fontWeight: "bold",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    MAX
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Rule Breakdown Summary */}
          {(() => {
            const bd = getPenaltyBreakdown(swapAmount);
            return (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "rgba(255,255,255,0.01)", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                    <span style={{ color: "var(--gm-text-secondary)" }}>Estimated Gross Value:</span>
                    <span style={{ fontWeight: "bold", color: "#fff" }}>
                      {swapAmount && !isNaN(swapAmount) 
                        ? `$${(parseFloat(swapAmount) * parseFloat(currentPrice)).toFixed(2)}` 
                        : "$0.00"
                      }
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px" }}>
                    <span style={{ color: "var(--gm-text-secondary)", fontWeight: "bold" }}>Net USDT Received:</span>
                    <span style={{ fontWeight: "bold", color: "var(--gold)" }}>
                      {swapAmount && !isNaN(swapAmount) 
                        ? `$${Math.max(0, (parseFloat(swapAmount) * parseFloat(currentPrice) - bd.totalFeeUSD)).toFixed(2)}` 
                        : "$0.00"
                      }
                    </span>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={txLoading || isSwapping || !swapAmount || parseFloat(swapAmount) <= 0 || parseFloat(swapAmount) > parseFloat(btcBalance)}
                  style={{
                    width: "100%",
                    height: "42px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)",
                    color: "#000",
                    fontWeight: "bold",
                    cursor: "pointer",
                    border: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    opacity: (txLoading || isSwapping || !swapAmount || parseFloat(swapAmount) <= 0 || parseFloat(swapAmount) > parseFloat(btcBalance)) ? 0.5 : 1
                  }}
                >
                  {(txLoading || isSwapping) ? <RefreshCw className="animate-spin" size={16} /> : "Execute Swap to USDT"}
                </button>
              </>
            );
          })()}
        </form>
      </div>

      {/* Penalty Modal Overlay */}
      {isPenaltyModalOpen && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1000, padding: "20px" }}>
          <div className="gm-card" style={{ maxWidth: "480px", width: "100%", padding: "24px", borderRadius: "16px", border: "1px solid rgba(251, 191, 36, 0.2)", position: "relative", backgroundColor: "#060b13", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }}>
            <h3 className="af-card-title" style={{ margin: "0 0 12px 0", fontSize: "1.2rem", color: "var(--gold)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Info size={20} /> Applied Platform Fees
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", color: "var(--gm-text-secondary)", fontSize: "0.85rem", lineHeight: "1.5" }}>
              <div>
                <span style={{ fontWeight: "bold", color: "#fff", display: "block", marginBottom: "6px" }}>General Platform Fee Rules:</span>
                <ul style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <li><strong>Within 1 Month of Mint:</strong> <span className="text-red">20% Platform Fee</span> (Sent back into mint curve).</li>
                  <li><strong>Within 3 Months of Deposit:</strong> <span className="text-red">10% Platform Fee</span> deduction.</li>
                  <li><strong>After 6 Months of Deposit:</strong> <span className="text-red">5% Platform Fee</span> deduction.</li>
                </ul>
              </div>

              {/* Dynamic Rule Breakdown */}
              {(() => {
                const bd = getPenaltyBreakdown(swapAmount);
                if (swapAmount && !isNaN(swapAmount) && parseFloat(swapAmount) > 0) {
                  return (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "14px" }}>
                      <span style={{ fontWeight: "bold", color: "#fff", display: "block", marginBottom: "10px" }}>Breakdown for {swapAmount} {tokenSymbol}:</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Within 1 Month of Mint (20% fee):</span>
                          <span style={{ color: bd.sub20 > 0 ? "#f87171" : "#fff" }}>{bd.sub20.toFixed(2)} {tokenSymbol}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Within 3 Months of Staking (10% fee):</span>
                          <span style={{ color: bd.sub10 > 0 ? "#f87171" : "#fff" }}>{bd.sub10.toFixed(2)} {tokenSymbol}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>After 6 Months of Staking (5% fee):</span>
                          <span style={{ color: bd.sub5 > 0 ? "#f87171" : "#fff" }}>{bd.sub5.toFixed(2)} {tokenSymbol}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>No Platform Fee (0% fee):</span>
                          <span>{bd.sub0.toFixed(2)} {tokenSymbol}</span>
                        </div>
                        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "8px", marginTop: "4px", display: "flex", justifyContent: "space-between", fontWeight: "bold", color: "#f87171" }}>
                          <span>Total Fee Deductions:</span>
                          <span>-{bd.totalFeeTokens.toFixed(2)} {tokenSymbol} (${bd.totalFeeUSD.toFixed(2)})</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            <button 
              onClick={() => setIsPenaltyModalOpen(false)}
              style={{
                marginTop: "20px",
                width: "100%",
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* History Sections */}
      <div className="af-affiliates-grid">
        {/* Purchase History Column */}
        <div className="af-card-box af-main-column">
          <div className="af-card-header-flex">
            <h3 className="af-card-title">Purchase & Activity History</h3>
            <span className="af-badge-count">{purchases.length} Items</span>
          </div>
          
          <div className="af-history-list">
            {purchases.length === 0 ? (
              <div className="af-empty-history">
                <Info size={28} className="af-text-muted" />
                <p>No purchase or activity logs found.</p>
              </div>
            ) : (
              purchases.map((tx, idx) => (
                <div className="af-history-item" key={idx}>
                  <div className="af-history-left">
                    <div className="af-tx-icon-wrapper purchase">
                      <ArrowDownLeft size={16} className="text-green" />
                    </div>
                    <div>
                      <span className="af-tx-type">{tx.type}</span>
                      <span className="af-tx-hash font-mono">{truncateAddress(tx.hash)}</span>
                    </div>
                  </div>
                  <div className="af-history-right">
                    {tx.type === "Mint" && (
                      <>
                        <span className="af-tx-value text-green">+{parseFloat(tx.btcAmount).toFixed(2)} {tokenSymbol}</span>
                        <span className="af-tx-subtext">for ${parseFloat(tx.usdtAmount).toFixed(2)} USDT</span>
                      </>
                    )}
                    {tx.type === "Stake" && (
                      <>
                        <span className="af-tx-value text-red">-{parseFloat(tx.btcAmount).toFixed(2)} {tokenSymbol}</span>
                        <span className="af-tx-subtext">Locked {tx.lockupMonths}mo ({tx.ratePerDay}%/day)</span>
                      </>
                    )}
                    {tx.type === "Coupon" && (
                      <>
                        <span className="af-tx-value text-green">+${parseFloat(tx.usdValue).toFixed(2)}</span>
                        <span className="af-tx-subtext">Code: {tx.code}</span>
                      </>
                    )}
                    {tx.type === "Wheel Spin" && (
                      <>
                        <span className="af-tx-value text-green">+{parseFloat(tx.rewardTokens).toFixed(2)} {tokenSymbol}</span>
                        <span className="af-tx-subtext">Prize Draw</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Withdrawal History Column */}
        <div className="af-card-box af-side-column">
          <div className="af-card-header-flex">
            <h3 className="af-card-title">Withdrawals & Claims</h3>
            <span className="af-badge-count">{withdrawals.length} Items</span>
          </div>

          <div className="af-history-list">
            {withdrawals.length === 0 ? (
              <div className="af-empty-history">
                <Info size={28} className="af-text-muted" />
                <p>No withdrawal or claim logs found.</p>
              </div>
            ) : (
              withdrawals.map((tx, idx) => (
                <div className="af-history-item" key={idx}>
                  <div className="af-history-left">
                    <div className="af-tx-icon-wrapper withdrawal">
                      <ArrowUpRight size={16} className="text-red" />
                    </div>
                    <div>
                      <span className="af-tx-type">{tx.type}</span>
                      <span className="af-tx-hash font-mono">{truncateAddress(tx.hash)}</span>
                    </div>
                  </div>
                  <div className="af-history-right">
                    {tx.type === "Sell" && (
                      <>
                        <span className="af-tx-value text-red">-{parseFloat(tx.btcAmount).toFixed(2)} {tokenSymbol}</span>
                        <span className="af-tx-subtext">Sold for ${parseFloat(tx.usdtAmount).toFixed(2)} USDT</span>
                      </>
                    )}
                    {tx.type === "Unstake" && (
                      <>
                        <span className="af-tx-value text-green">+{parseFloat(tx.btcAmount).toFixed(2)} {tokenSymbol}</span>
                        <span className="af-tx-subtext">Unstake complete</span>
                      </>
                    )}
                    {tx.type === "Yield Claim" && (
                      <>
                        <span className="af-tx-value text-green">+{parseFloat(tx.btcAmount).toFixed(2)} {tokenSymbol}</span>
                        <span className="af-tx-subtext">Accrued Staking reward</span>
                      </>
                    )}
                    {tx.type === "Rank Claim" && (
                      <>
                        <span className="af-tx-value text-green">+${parseFloat(tx.usdValue).toFixed(2)}</span>
                        <span className="af-tx-subtext">Daily rank reward</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Affiliates;

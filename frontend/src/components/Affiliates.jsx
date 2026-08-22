import React, { useState } from "react";
import { Wallet, Copy, Check, Info, ArrowUpRight, ArrowDownLeft, Coins, Flame, Layers, Users, Trophy, Compass, BookOpen } from "lucide-react";
import "./Affiliates.css";

function Affiliates({
  tokenSymbol,
  account,
  bnbBalance,
  usdtBalance,
  btcBalance,
  transactionHistory,
  subTab = "profile",
  setSubTab
}) {
  const [copiedAddr, setCopiedAddr] = useState(false);

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

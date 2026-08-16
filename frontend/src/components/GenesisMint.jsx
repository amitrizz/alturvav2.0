import React from "react";
import { Coins, Users, Clock, Info, Loader2 } from "lucide-react";
import "./GenesisMint.css";

function GenesisMint({
  tokenSymbol,
  totalUSDValueMinted,
  totalMintedTokens,
  btcBalance,
  usdtBalance,
  bnbBalance,
  mintUsdtAmount,
  handleMintInputChange,
  estimatedBtcToMint,
  mintMethod,
  setMintMethod,
  usdtApproved,
  approveUsdt,
  executeMint,
  txLoading,
  currentPrice,
  registeredUsersCount
}) {
  return (
    <div className="gm-tab-pane">
      {/* Top stats for mint tab */}
      <section className="gm-stats-strip gm-stats-4-columns">
        <div className="gm-stat-card gm-card-price gm-card-flex">
          <div className="stat-card-icon-wrapper price-icon">
            <Coins size={24} />
          </div>
          <div>
            <span className="gm-stat-label">Total Minted</span>
            <h3 className="gm-stat-value">${parseFloat(totalUSDValueMinted).toFixed(2)}</h3>
          </div>
        </div>
        <div className="gm-stat-card gm-card-supply gm-card-flex">
          <div className="stat-card-icon-wrapper minters-icon">
            <Users size={24} />
          </div>
          <div>
            <span className="gm-stat-label">Total Minters</span>
            <h3 className="gm-stat-value">{registeredUsersCount} Users</h3>
          </div>
        </div>
        <div className="gm-stat-card gm-card-remaining gm-card-flex">
          <div className="stat-card-icon-wrapper clock-icon">
            <Clock size={24} />
          </div>
          <div>
            <span className="gm-stat-label">Minting Ends In</span>
            <h3 className="gm-stat-value font-mono">12d : 14h : 32m</h3>
          </div>
        </div>
        <div className="gm-stat-card gm-card-balance gm-card-flex">
          <div className="stat-card-icon-wrapper balance-icon">
            <Coins size={24} />
          </div>
          <div>
            <span className="gm-stat-label">Your Balance</span>
            <h3 className="gm-stat-value">{btcBalance} {tokenSymbol}</h3>
          </div>
        </div>
      </section>

      <div className="gm-mint-grid">
        {/* Minting position input box */}
        <div className="gm-card-box">
          <h3 className="gm-card-title gm-title-flex">
            Mint {tokenSymbol}
            <span className="gm-tooltip-trigger">
              <Info size={16} />
              <span className="gm-tooltip-popup">
                Enter the amount of {tokenSymbol} you want to mint using USDT or tBNB.
              </span>
            </span>
          </h3>

          {/* Switcher payment */}
          <div className="gm-switcher-wrapper">
            <button 
              className={`gm-small-cta-btn ${mintMethod === "USDT" ? "active" : ""}`}
              onClick={() => setMintMethod("USDT")}
            >
              Mint with USDT
            </button>
            <button 
              className={`gm-small-cta-btn ${mintMethod === "BNB" ? "active" : ""}`}
              onClick={() => setMintMethod("BNB")}
            >
              Mint with BNB (tBNB)
            </button>
          </div>

          <div className="gm-input-block">
            <div className="gm-input-label-row">
              <span>{mintMethod === "USDT" ? "USDT to Deposit" : "BNB to Deposit"}</span>
              <span>Bal: {mintMethod === "USDT" ? `${usdtBalance} USDT` : `${bnbBalance} BNB`}</span>
            </div>
            <div className="coin-input-wrapper">
              <Coins className="coin-input-icon" size={20} />
              <input 
                type="number" 
                placeholder="Min $10 | Max $10000" 
                className="coin-field-input"
                value={mintUsdtAmount}
                onChange={(e) => handleMintInputChange(e.target.value)}
              />
              <span className="coin-input-symbol">{mintMethod === "USDT" ? "USDT" : "BNB"}</span>
              <button className="coin-input-max-btn" onClick={() => handleMintInputChange(mintMethod === "USDT" ? usdtBalance : bnbBalance)}>MAX</button>
            </div>
          </div>

          {/* Percent shortcuts */}
          <div className="gm-shortcuts-grid">
            <button className="gm-shortcut-btn" onClick={() => handleMintInputChange(mintMethod === "USDT" ? "100" : "0.5")}>25%</button>
            <button className="gm-shortcut-btn" onClick={() => handleMintInputChange(mintMethod === "USDT" ? "500" : "1.5")}>50%</button>
            <button className="gm-shortcut-btn" onClick={() => handleMintInputChange(mintMethod === "USDT" ? "2000" : "5.0")}>75%</button>
            <button className="gm-shortcut-btn" onClick={() => handleMintInputChange(mintMethod === "USDT" ? "10000" : "16.0")}>100%</button>
          </div>

          <div className="gm-details-panel">
            <div className="gm-detail-row">
              <span>Estimated {tokenSymbol} Received</span>
              <span className="gold-text font-bold">{estimatedBtcToMint} {tokenSymbol}</span>
            </div>
            <div className="gm-detail-row">
              <span>Dynamic Mint Fee</span>
              <span>2%</span>
            </div>
            <div className="gm-detail-row">
              <span>Current Rate (USDT)</span>
              <span>1 {tokenSymbol} = {parseFloat(currentPrice).toFixed(4)} USDT</span>
            </div>
            <div className="gm-detail-row">
              <span>Current Rate (BNB)</span>
              <span>1 {tokenSymbol} = {(parseFloat(currentPrice) / 600).toFixed(6)} BNB</span>
            </div>
          </div>

          {mintMethod === "USDT" && !usdtApproved ? (
            <button className="gm-cta-gradient-btn" onClick={approveUsdt} disabled={txLoading}>
              {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
              Approve USDT
            </button>
          ) : (
            <button className="gm-cta-gradient-btn" onClick={executeMint} disabled={txLoading || !mintUsdtAmount}>
              {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
              Proceed to Mint
            </button>
          )}
        </div>

        {/* How it works sidebar layout column */}
        <div className="gm-sidebar-col">
          <div className="gm-card-box">
            <h3 className="gm-card-title">How Genesis Mint Works</h3>
            <div className="gm-steps-list">
              <div className="gm-step-item-guide">
                <span className="gm-step-badge-num">1</span>
                <div>
                  <h5>Choose Amount</h5>
                  <p>Enter the amount of {tokenSymbol} you want to mint.</p>
                </div>
              </div>
              <div className="gm-step-item-guide">
                <span className="gm-step-badge-num">2</span>
                <div>
                  <h5>Confirm Transaction</h5>
                  <p>Review details and confirm your transaction.</p>
                </div>
              </div>
              <div className="gm-step-item-guide">
                <span className="gm-step-badge-num">3</span>
                <div>
                  <h5>Mint & Receive</h5>
                  <p>Your {tokenSymbol} tokens will be minted to your wallet.</p>
                </div>
              </div>
              <div className="gm-step-item-guide">
                <span className="gm-step-badge-num">4</span>
                <div>
                  <h5>Start Earning</h5>
                  <p>Stake your tokens and start earning rewards.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="gm-card-box">
            <h3 className="gm-card-title">Benefits of Early Minting</h3>
            <div className="gm-benefits-row">
              <ul className="gm-benefits-checklist">
                <li>Lower entry price</li>
                <li>Higher staking rewards</li>
                <li>Early access to features</li>
                <li>Exclusive ecosystem benefits</li>
              </ul>
              <div className="gm-benefits-coin-graphic">
                <div className="gm-gold-coin-glow">
                  <Coins size={36} className="gold-text" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mint Rounds table list */}
      <div className="gm-card-box gm-rounds-table-card">
        <h3 className="gm-card-title">Genesis Mint Rounds</h3>
        <div className="gm-custom-table-container">
          <table className="gm-custom-table">
            <thead>
              <tr>
                <th>Round</th>
                <th>Price (USD)</th>
                <th>Tokens Available</th>
                <th>Tokens Minted</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="gold-text font-bold">Round 1</td>
                <td>$0.5185</td>
                <td>5,000,000 {tokenSymbol}</td>
                <td>1,874,700 {tokenSymbol}</td>
                <td>
                  <div className="gm-progress-track">
                    <div className="gm-progress-bar" style={{ width: '37.49%' }}></div>
                  </div>
                  <span className="text-xxs opacity-75">37.49%</span>
                </td>
                <td><span className="badge-status-unlocked">Live</span></td>
              </tr>
              <tr className="opacity-60">
                <td>Round 2</td>
                <td>$0.5695</td>
                <td>5,000,000 {tokenSymbol}</td>
                <td>0 {tokenSymbol}</td>
                <td>0%</td>
                <td><span className="badge-status-locked">Upcoming</span></td>
              </tr>
              <tr className="opacity-60">
                <td>Round 3</td>
                <td>$0.6254</td>
                <td>5,000,000 {tokenSymbol}</td>
                <td>0 {tokenSymbol}</td>
                <td>0%</td>
                <td><span className="badge-status-locked">Upcoming</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GenesisMint;

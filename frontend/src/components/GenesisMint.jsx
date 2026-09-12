import React from "react";
import { Coins, Users, Info, Loader2, AlertCircle } from "lucide-react";
import { validateMintAmount } from "../utils/parseTxError";
import "./GenesisMint.css";

function GenesisMint({
  tokenSymbol,
  totalUSDValueMinted,
  totalMintedTokens,
  stakingTokenReserve,
  bondingCurveInfo,
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
  registeredUsersCount,
  couponInput,
  setCouponInput,
  executeApplyCoupon
}) {
  const mintValidationError = mintUsdtAmount ? validateMintAmount(mintUsdtAmount, mintMethod) : null;
  const depositPlaceholder = mintMethod === "USDT" ? "Min $10 | Max $10,000" : "Min ~0.0167 BNB | Max ~16.67 BNB";

  return (
    <div className="gm-tab-pane">
      {/* Top stats for mint tab */}
      <section className="gm-stats-strip gm-stats-2-columns">
        <div className="gm-stat-card gm-card-price gm-card-flex">
          <div className="stat-card-icon-wrapper price-icon">
            <Coins size={24} />
          </div>
          <div>
            <span className="gm-stat-label">Total Minted</span>
            <h3 className="gm-stat-value">${parseFloat(totalUSDValueMinted).toFixed(2)}</h3>
          </div>
        </div>
        <div className="gm-stat-card gm-card-balance gm-card-flex">
          <div className="stat-card-icon-wrapper balance-icon">
            <Coins size={24} />
          </div>
          <div>
            <span className="gm-stat-label">Your Balance</span>
            <h3 className="gm-stat-value">{btcBalance}</h3>
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
              Mint with USDT (BEP20)
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
                placeholder={depositPlaceholder}
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

          {mintValidationError && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginTop: "10px", padding: "10px 12px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.35)", color: "#fca5a5", fontSize: "0.85rem" }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{mintValidationError}</span>
            </div>
          )}

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
              <span>1 {tokenSymbol} = {(parseFloat(currentPrice) / 600).toFixed(6)} BNB ($600/BNB)</span>
            </div>
          </div>

          {/* Coupon Code Block for Double Mint Bonus */}
          <div className="gm-input-block" style={{ marginTop: "14px" }}>
            <div className="gm-input-label-row">
              <span>Promo Coupon Code</span>
            </div>
            <div style={{ position: "relative", width: "100%" }}>
              <input 
                type="text" 
                placeholder="Enter Coupon for Double Tokens" 
                className="coin-field-input"
                value={couponInput || ""}
                onChange={(e) => setCouponInput(e.target.value)}
                style={{ width: "100%", padding: "10px 95px 10px 14px", borderRadius: "10px", border: "1px solid var(--gm-border)", backgroundColor: "var(--gm-bg-input)", color: "#fff", height: "48px" }}
              />
              <button
                className="gm-cta-gradient-btn"
                onClick={executeApplyCoupon}
                disabled={txLoading || !couponInput}
                style={{ position: "absolute", right: "6px", top: "6px", bottom: "6px", padding: "0 16px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap", width: "auto", minWidth: "65px", margin: 0, height: "36px" }}
              >
                Apply
              </button>
            </div>
          </div>

          <div className="gm-actions-horizontal-row" style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
            {mintMethod === "USDT" && (
              <button 
                className="gm-cta-gradient-btn" 
                onClick={approveUsdt} 
                disabled={txLoading || usdtApproved}
                style={{ flex: 1 }}
              >
                {usdtApproved ? "USDT Approved" : "Approve USDT"}
              </button>
            )}
            <button 
              className="gm-cta-gradient-btn" 
              onClick={executeMint} 
              disabled={txLoading || !mintUsdtAmount || !!mintValidationError || (mintMethod === "USDT" && !usdtApproved)}
              style={{ flex: 1 }}
            >
              {txLoading ? <Loader2 className="animate-spin inline mr-2" size={18} /> : null}
              Proceed to Mint
            </button>
          </div>
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

      {/* Bonding curve tiers — derived from on-chain contract constants */}
      <div className="gm-card-box gm-rounds-table-card">
        <h3 className="gm-card-title">Genesis Mint Bonding Curve</h3>
        <div className="gm-details-panel" style={{ marginBottom: "14px" }}>
          <div className="gm-detail-row">
            <span>Start Price</span>
            <span>${parseFloat(bondingCurveInfo?.startPrice || "0.5").toFixed(4)}</span>
          </div>
          <div className="gm-detail-row">
            <span>Price Step</span>
            <span>+0.1% every ${parseFloat(bondingCurveInfo?.stepVolume || "500").toFixed(0)} minted</span>
          </div>
          <div className="gm-detail-row">
            <span>Total Minted</span>
            <span>{parseFloat(totalMintedTokens).toLocaleString(undefined, { maximumFractionDigits: 2 })} {tokenSymbol}</span>
          </div>
          <div className="gm-detail-row">
            <span>Contract Reserve</span>
            <span>{parseFloat(stakingTokenReserve || "0").toLocaleString(undefined, { maximumFractionDigits: 2 })} {tokenSymbol}</span>
          </div>
        </div>
        <div className="gm-custom-table-container">
          <table className="gm-custom-table">
            <thead>
              <tr>
                <th>Price Tier</th>
                <th>Price (USD)</th>
                <th>Volume Band</th>
                <th>Progress</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(bondingCurveInfo?.tiers || []).map((tier) => (
                <tr key={tier.step} className={tier.status !== "Live" ? "opacity-60" : ""}>
                  <td className={tier.status === "Live" ? "gold-text font-bold" : ""}>Step {tier.step + 1}</td>
                  <td>${tier.price.toFixed(4)}</td>
                  <td>${tier.bandMin.toLocaleString()} – ${tier.bandMax.toLocaleString()}</td>
                  <td>
                    {tier.status === "Live" ? (
                      <>
                        <div className="gm-progress-track">
                          <div className="gm-progress-bar" style={{ width: `${tier.progress.toFixed(2)}%` }}></div>
                        </div>
                        <span className="text-xxs opacity-75">{tier.progress.toFixed(2)}%</span>
                      </>
                    ) : (
                      <span>{tier.status === "Passed" ? "100%" : "0%"}</span>
                    )}
                  </td>
                  <td>
                    <span className={tier.status === "Live" ? "badge-status-unlocked" : "badge-status-locked"}>
                      {tier.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default GenesisMint;

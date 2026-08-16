import React from "react";
import { Info } from "lucide-react";
import "./LuckyWheel.css";

function LuckyWheel({
  tokenSymbol,
  spinCost,
  canvasRef,
  executeSpinWheel,
  isSpinning,
  txLoading,
  btcBalance,
  wheelPrize,
  prizes,
  isAdmin,
  newSpinCostInput,
  setNewSpinCostInput,
  executeSetSpinCost
}) {
  return (
    <div className="lw-tab-pane lw-container">
      <div className="lw-card-box lw-text-center">
        <h3 className="lw-card-title lw-title-flex">
          Lucky Spin Wheel
          <span className="tooltip-trigger">
            <Info size={16} />
            <span className="tooltip-popup">
              Spend {spinCost} {tokenSymbol} to spin the wheel! Win up to 150 {tokenSymbol}!
            </span>
          </span>
        </h3>

        <div className="lw-canvas-wrapper">
          <div className="lw-pointer-indicator"></div>
          
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={300} 
            className="lw-canvas"
          ></canvas>
        </div>

        <button 
          className="lw-cta-gradient-btn" 
          onClick={executeSpinWheel}
          disabled={isSpinning || txLoading || parseFloat(btcBalance) < parseFloat(spinCost)}
        >
          {isSpinning ? "Spinning..." : txLoading ? "Awaiting Confirmation..." : `Spin (Cost: ${spinCost} ${tokenSymbol})`}
        </button>

        {wheelPrize && (
          <div className="lw-details-panel lw-prize-banner">
            <h4 className="lw-prize-title">
              {wheelPrize === "Try Again" ? "Better luck next time!" : `You won: ${wheelPrize}!`}
            </h4>
          </div>
        )}

        <h4 className="lw-level-heading">Prizes & Odds</h4>
        <div className="lw-ranks-table lw-text-left">
          <div className="lw-rank-row-item">
            <span>Try Again</span>
            <span>50% Odds</span>
          </div>
          <div className="lw-rank-row-item">
            <span className="lw-text-amber">Double Match (5 {tokenSymbol})</span>
            <span>30% Odds</span>
          </div>
          <div className="lw-rank-row-item">
            <span className="lw-text-blue">Triple Match (15 {tokenSymbol})</span>
            <span>13% Odds</span>
          </div>
          <div className="lw-rank-row-item">
            <span className="lw-text-purple">Mega Prize (50 {tokenSymbol})</span>
            <span>5% Odds</span>
          </div>
          <div className="lw-rank-row-item">
            <span className="lw-text-red">Jackpot (150 {tokenSymbol})</span>
            <span>2% Odds</span>
          </div>
        </div>
      </div>

      {/* Admin setup panels (for admin users only) */}
      {isAdmin && (
        <div className="lw-card-box lw-admin-card">
          <h3 className="lw-card-title lw-admin-title">Admin Controls</h3>
          <div className="lw-input-block">
            <label>Update Spin Cost ({tokenSymbol})</label>
            <input 
              type="number" 
              placeholder="Cost amount" 
              className="lw-field-input mt-1"
              value={newSpinCostInput}
              onChange={(e) => setNewSpinCostInput(e.target.value)}
            />
          </div>
          <button className="lw-cta-gradient-btn" onClick={executeSetSpinCost}>
            Save Cost
          </button>
        </div>
      )}
    </div>
  );
}

export default LuckyWheel;

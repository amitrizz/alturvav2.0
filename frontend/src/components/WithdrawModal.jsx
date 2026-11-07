import React, { useState } from 'react';
import { X, RefreshCw, Wallet, ArrowRight, ShieldCheck, AlertCircle, Lock, Unlock, Flame, Zap } from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';

export default function WithdrawModal({ 
  isOpen, 
  onClose, 
  onWithdraw, 
  claimableRoi = 45,
  claimableWorking = 180,
  directCount = 3,
  txLoading 
}) {
  const [withdrawType, setWithdrawType] = useState('roi'); // 'roi' or 'working'
  const [withdrawAmount, setWithdrawAmount] = useState('');

  if (!isOpen) return null;

  const isWorkingUnlocked = directCount >= 3;
  const currentBalance = withdrawType === 'roi' ? Number(claimableRoi || 0) : Number(claimableWorking || 0);

  // Split calculations based on Sovereign Global Protocol v3.3
  // ROI: 40% Cash / 60% Reinvest (always unlocked)
  // Working: 70% Cash / 30% Reinvest (locked until 3 directs)
  const cashPercent = withdrawType === 'roi' ? 40 : 70;
  const reinvestPercent = withdrawType === 'roi' ? 60 : 30;

  const amtNum = Number(withdrawAmount) || 0;
  const cashCut = (amtNum * cashPercent) / 100;
  const reinvestCut = (amtNum * reinvestPercent) / 100;

  const handleMax = () => {
    setWithdrawAmount(currentBalance.toFixed(2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amtNum < 5 || amtNum > currentBalance) return;
    if (withdrawType === 'working' && !isWorkingUnlocked) return;
    onWithdraw(amtNum, withdrawType);
  };

  return (
    <div className="withdraw-modal-overlay" onClick={onClose}>
      <div className="withdraw-modal-card glass-panel" onClick={e => e.stopPropagation()}>
        <div className="wm-header">
          <div className="wm-title-box">
            <AltruvaLogo size={32} />
            <div>
              <h3>Protocol Instant P2P Withdrawal</h3>
              <span className="gold-gradient-text">SOVEREIGN GLOBAL PROTOCOL v3.3</span>
            </div>
          </div>
          <button className="wm-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Withdrawal Type Switcher */}
        <div className="wm-type-toggle glass-panel">
          <button 
            type="button"
            className={`wm-type-btn ${withdrawType === 'roi' ? 'active' : ''}`}
            onClick={() => { setWithdrawType('roi'); setWithdrawAmount(''); }}
          >
            <Flame size={14} /> Time-Bomb Quantum ROI (40/60)
          </button>
          <button 
            type="button"
            className={`wm-type-btn ${withdrawType === 'working' ? 'active' : ''}`}
            onClick={() => { setWithdrawType('working'); setWithdrawAmount(''); }}
          >
            {isWorkingUnlocked ? <Unlock size={14} /> : <Lock size={14} />} Working Ledger (70/30)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="wm-body">
          {/* Working Lock Warning */}
          {withdrawType === 'working' && !isWorkingUnlocked && (
            <div className="wm-lock-warning glass-panel">
              <AlertCircle size={18} className="yellow" />
              <div>
                <strong>Working Ledger Locked!</strong>
                <p>Requires at least 3 active direct referrals to unlock working withdrawals. You currently have {directCount}/3 directs.</p>
              </div>
            </div>
          )}

          {/* Balance & Ratio Strip */}
          <div className="wm-balance-strip glass-panel">
            <div className="bs-col">
              <span>Selected Claimable Balance:</span>
              <strong className="cyan-gradient-text">${currentBalance.toFixed(2)} USDT</strong>
            </div>
            <div className="bs-col right">
              <span>Split Matrix:</span>
              <strong className="gold-gradient-text">{cashPercent}% Cash / {reinvestPercent}% Re-Invest</strong>
            </div>
          </div>

          {/* Amount Input */}
          <div className="wm-input-group">
            <div className="ig-label-row">
              <label>Withdrawal Amount ($5 Minimum):</label>
              <button 
                type="button" 
                className="max-btn" 
                onClick={handleMax}
                disabled={currentBalance < 5 || (withdrawType === 'working' && !isWorkingUnlocked)}
              >
                MAX
              </button>
            </div>
            <div className="ig-field-wrap">
              <input
                type="number"
                step="any"
                min="5"
                max={currentBalance}
                placeholder="Enter USDT amount ($5 min)..."
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                disabled={withdrawType === 'working' && !isWorkingUnlocked}
              />
              <span className="ig-currency">USDT</span>
            </div>
          </div>

          {/* Live Breakdown Box */}
          {amtNum >= 5 && (
            <div className="wm-breakdown-box glass-panel">
              <div className="bb-row">
                <span>Sent Directly to Your Wallet ({cashPercent}%):</span>
                <strong className="green-txt">+${cashCut.toFixed(2)} USDT</strong>
              </div>
              <div className="bb-row">
                <span>Auto Re-Invested into 5 Pools ({reinvestPercent}%):</span>
                <strong className="cyan-txt">${reinvestCut.toFixed(2)} USDT</strong>
              </div>
              <small className="bb-note">
                Auto-reinvestment maintains 15 up/down Monoline payouts and system compounding.
              </small>
            </div>
          )}

          {/* Submit Button */}
          <div className="wm-action-row">
            <button
              type="submit"
              className="wm-submit-btn"
              disabled={txLoading || amtNum < 5 || amtNum > currentBalance || (withdrawType === 'working' && !isWorkingUnlocked)}
            >
              {txLoading ? (
                <span>Executing P2P Split on BSC...</span>
              ) : (
                <span>
                  Confirm & Transfer ${cashCut > 0 ? cashCut.toFixed(2) : '0.00'} USDT to Wallet
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

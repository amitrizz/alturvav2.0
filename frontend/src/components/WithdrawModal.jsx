import React, { useState } from 'react';
import { X, RefreshCw, Wallet, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';

export default function WithdrawModal({ isOpen, onClose, onWithdraw, claimableBalance = 150, userPackage = 100, txLoading }) {
  const [withdrawAmount, setWithdrawAmount] = useState('');

  if (!isOpen) return null;

  const pkg = Number(userPackage || 100);
  const claimable = Number(claimableBalance || 0);

  // Split calculations based on Slide 16
  let walletPercent = 50;
  let reinvestPercent = 50;

  if (pkg >= 30000) {
    walletPercent = 70;
    reinvestPercent = 30;
  } else if (pkg >= 5001) {
    walletPercent = 60;
    reinvestPercent = 40;
  }

  const amtNum = Number(withdrawAmount) || 0;
  const walletCut = (amtNum * walletPercent) / 100;
  const reinvestCut = (amtNum * reinvestPercent) / 100;

  const handleMax = () => {
    setWithdrawAmount(claimable.toFixed(2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amtNum <= 0 || amtNum > claimable) return;
    onWithdraw(amtNum);
  };

  return (
    <div className="withdraw-modal-overlay" onClick={onClose}>
      <div className="withdraw-modal-card glass-panel" onClick={e => e.stopPropagation()}>
        <div className="wm-header">
          <div className="wm-title-box">
            <AltruvaLogo size={32} />
            <div>
              <h3>Withdraw & Auto Re-Invest</h3>
              <span className="gold-gradient-text">THE X-FACTOR OF ALTRUVA</span>
            </div>
          </div>
          <button className="wm-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="wm-body">
          {/* Claimable Balance Info */}
          <div className="wm-balance-strip glass-panel">
            <div className="bs-col">
              <span>Claimable Earnings:</span>
              <strong className="cyan-gradient-text">${claimable.toFixed(2)} USDT</strong>
            </div>
            <div className="bs-col right">
              <span>Your Active Tier Split:</span>
              <strong className="gold-gradient-text">{walletPercent}% / {reinvestPercent}%</strong>
            </div>
          </div>

          {/* Amount Input */}
          <div className="wm-input-group">
            <div className="ig-label-row">
              <label>Withdrawal Amount (USDT):</label>
              <button type="button" className="max-btn" onClick={handleMax}>MAX</button>
            </div>
            <div className="ig-field-wrap">
              <input
                type="number"
                step="any"
                min="1"
                max={claimable}
                placeholder="Enter USDT amount..."
                value={withdrawAmount}
                onChange={e => setWithdrawAmount(e.target.value)}
                required
              />
              <span className="cur-pill">USDT</span>
            </div>
          </div>

          {/* Real-time Split Breakdown */}
          <div className="split-preview-box glass-panel">
            <div className="sp-col">
              <span className="sp-lbl">TO YOUR WALLET ({walletPercent}%)</span>
              <strong className="sp-val green-txt">${walletCut.toFixed(2)} USDT</strong>
              <small>Transferred immediately</small>
            </div>
            <div className="sp-divider"></div>
            <div className="sp-col">
              <span className="sp-lbl">AUTO RE-INVEST ({reinvestPercent}%)</span>
              <strong className="sp-val cyan-txt">${reinvestCut.toFixed(2)} USDT</strong>
              <small>Perpetual income engine</small>
            </div>
          </div>

          {/* Explanation notice from Slide 16 */}
          <div className="wm-notice glass-panel">
            <RefreshCw size={18} className="cyan" />
            <p>
              Your auto-reinvested <strong>${reinvestCut.toFixed(2)} USDT</strong> immediately re-enters the 5 income pools to continuously generate rewards for your global uplines and downlines!
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="wm-submit-btn"
            disabled={amtNum <= 0 || amtNum > claimable || txLoading}
          >
            {txLoading ? (
              <>Processing Withdrawal...</>
            ) : (
              <>
                <ShieldCheck size={18} /> Confirm ${amtNum.toFixed(2)} USDT Withdrawal
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { Gift, Award, Sparkles, RefreshCw, CheckCircle2, Trophy, Coins } from 'lucide-react';
import AltruvaLogo from './AltruvaLogo';

export default function ScratchCard({ coupons = 3, onScratchCard, txLoading, showToast }) {
  const [activeCoupons, setActiveCoupons] = useState(coupons || 2);
  const [scratched, setScratched] = useState(false);
  const [revealedPrize, setRevealedPrize] = useState(null);
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Background foil gradient
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#c0c0c0');
    grad.addColorStop(0.3, '#ffffff');
    grad.addColorStop(0.5, '#e0e0e0');
    grad.addColorStop(0.7, '#d4af37');
    grad.addColorStop(1, '#a67c1e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative text on foil
    ctx.fillStyle = '#0a1738';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ SCRATCH & WIN ★', width / 2, height / 2 - 10);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#333333';
    ctx.fillText('Drag mouse or touch to reveal prize', width / 2, height / 2 + 15);
  };

  useEffect(() => {
    initCanvas();
  }, [revealedPrize]);

  const handlePointerDown = (e) => {
    if (activeCoupons <= 0 || scratched) return;
    isDrawing.current = true;
    handlePointerMove(e);
  };

  const handlePointerUp = () => {
    isDrawing.current = false;
  };

  const handlePointerMove = (e) => {
    if (!isDrawing.current || scratched) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      if (e.cancelable) e.preventDefault();
    }

    if (clientX === undefined || clientY === undefined) return;

    // Scale coordinates between canvas resolution and displayed CSS bounding box
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, Math.PI * 2);
    ctx.fill();

    // Check completion
    checkScratchProgress(ctx, canvas.width, canvas.height);
  };

  const checkScratchProgress = (ctx, w, h) => {
    const imgData = ctx.getImageData(0, 0, w, h);
    let transparentPixels = 0;
    const totalPixels = imgData.data.length / 4;

    for (let i = 3; i < imgData.data.length; i += 4) {
      if (imgData.data[i] === 0) {
        transparentPixels++;
      }
    }

    if (transparentPixels / totalPixels > 0.45 && !scratched) {
      setScratched(true);
      const prizes = [25, 50, 100, 300, 500, 1000];
      const win = prizes[Math.floor(Math.random() * prizes.length)];
      setRevealedPrize(win);
      setActiveCoupons(prev => Math.max(0, prev - 1));
      if (showToast) showToast(`🎉 Congratulations! You won $${win} USDT!`);
      if (onScratchCard) onScratchCard(win);
    }
  };

  const resetCard = () => {
    setScratched(false);
    setRevealedPrize(null);
    setTimeout(initCanvas, 50);
  };

  return (
    <div className="scratch-wrap">
      {/* Header Banner */}
      <div className="stream-header-card glass-panel">
        <div className="sh-top">
          <div className="sh-title-box">
            <span className="sh-pill cyan-gradient-text">STREAM 5 (5% TOTAL POOL)</span>
            <h2>COMMUNITY REWARD & JACKPOT (SCRATCH & WIN)</h2>
            <p>70% of pool distributed across 250 lucky winners · 30% carried forward.</p>
          </div>
          <div className="sh-stats-box">
            <div className="stat-mini">
              <span>Your Active Coupons:</span>
              <strong className="gold-gradient-text">{activeCoupons} Coupons</strong>
            </div>
            <div className="stat-mini">
              <span>Jackpot Pool Balance:</span>
              <strong className="cyan-gradient-text">$5,000 USDT</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Scratch Canvas Area */}
      <div className="scratch-play-panel glass-panel">
        <div className="sp-header">
          <div className="coupon-counter-badge">
            <Gift size={16} className="gold" />
            <span>Available Cards: <strong>{activeCoupons}</strong></span>
          </div>
          <span className="instruction-txt">
            {scratched ? 'Prize Claimed!' : 'Scratch the card surface below to reveal your USDT prize'}
          </span>
        </div>

        {/* Card Canvas Container */}
        <div className="card-canvas-container">
          {/* Revealed Secret Under Layer */}
          <div className="card-under-layer">
            <div className="prize-reveal-content">
              <Sparkles size={40} className="gold animate-bounce" />
              <h3>CONGRATULATIONS!</h3>
              <div className="revealed-amount gold-gradient-text">
                ${revealedPrize || 1000} USDT
              </div>
              <p>Instant On-Chain Credit to Claimable Earnings</p>
            </div>
          </div>

          {/* Canvas Scratch Foil Layer */}
          <canvas
            ref={canvasRef}
            width={380}
            height={200}
            className={`scratch-canvas ${scratched ? 'scratched-fade' : ''}`}
            onMouseDown={handlePointerDown}
            onMouseUp={handlePointerUp}
            onMouseMove={handlePointerMove}
            onTouchStart={handlePointerDown}
            onTouchEnd={handlePointerUp}
            onTouchMove={handlePointerMove}
          />
        </div>

        {/* Play Action Buttons */}
        <div className="sp-actions">
          {scratched && activeCoupons > 0 ? (
            <button className="next-card-btn" onClick={resetCard}>
              <RefreshCw size={16} /> Scratch Next Card ({activeCoupons} Left)
            </button>
          ) : activeCoupons === 0 ? (
            <div className="no-coupons-msg">
              <span>No more coupons. Activate a new package to earn more scratch cards!</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* 250 Winners Distribution Table from Slide 15 */}
      <div className="winners-distribution-card glass-panel">
        <div className="wd-header">
          <Trophy size={20} className="gold" />
          <h3>250 Winners Distribution Breakdown (of 70% Reward Pool)</h3>
        </div>

        <div className="top-prizes-row">
          <div className="prize-box silver glass-panel">
            <span className="pz-rank">2ND PRIZE</span>
            <strong className="pz-val">$500 USDT</strong>
            <small>1 Winner (10%)</small>
          </div>
          <div className="prize-box gold glass-panel">
            <span className="pz-rank gold">1ST PRIZE</span>
            <strong className="pz-val gold-gradient-text">$1,000 USDT</strong>
            <small>1 Winner (20%)</small>
          </div>
          <div className="prize-box bronze glass-panel">
            <span className="pz-rank">3RD PRIZE</span>
            <strong className="pz-val">$300 USDT</strong>
            <small>1 Winner (3%)</small>
          </div>
        </div>

        {/* Desktop Prize Table */}
        <div className="table-responsive desktop-only-table">
          <table className="altruva-table">
            <thead>
              <tr>
                <th>POSITION TIER</th>
                <th>WINNERS COUNT</th>
                <th>EACH WINNER GETS</th>
                <th>TIER TOTAL SHARE</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><strong>1st Prize</strong></td><td>1</td><td>20%</td><td>20%</td></tr>
              <tr><td><strong>2nd Prize</strong></td><td>1</td><td>10%</td><td>10%</td></tr>
              <tr><td><strong>3rd Prize</strong></td><td>1</td><td>3%</td><td>3%</td></tr>
              <tr><td>4th – 10th</td><td>7</td><td>2.00% each</td><td>14%</td></tr>
              <tr><td>11th – 50th</td><td>40</td><td>0.50% each</td><td>20%</td></tr>
              <tr><td>51st – 100th</td><td>50</td><td>0.30% each</td><td>15%</td></tr>
              <tr><td>101st – 250th</td><td>150</td><td>0.12% each</td><td>18%</td></tr>
              <tr className="total-row"><td><strong>TOTAL</strong></td><td><strong>250 Winners</strong></td><td>-</td><td><strong>100%</strong></td></tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Prize Cards (Zero Horizontal Scroll) */}
        <div className="mobile-prize-list mobile-only-cards">
          <div className="mp-card glass-panel">
            <div className="mpc-top">
              <span className="mpc-rank gold">1ST PRIZE</span>
              <strong className="gold-gradient-text">$1,000 USDT</strong>
            </div>
            <div className="mpc-details">
              <span>1 Winner</span>
              <span className="mpc-share cyan-txt">20% Pool Share</span>
            </div>
          </div>
          <div className="mp-card glass-panel">
            <div className="mpc-top">
              <span className="mpc-rank">2ND PRIZE</span>
              <strong className="cyan-gradient-text">$500 USDT</strong>
            </div>
            <div className="mpc-details">
              <span>1 Winner</span>
              <span className="mpc-share cyan-txt">10% Pool Share</span>
            </div>
          </div>
          <div className="mp-card glass-panel">
            <div className="mpc-top">
              <span className="mpc-rank bronze">3RD PRIZE</span>
              <strong className="gold-txt">$300 USDT</strong>
            </div>
            <div className="mpc-details">
              <span>1 Winner</span>
              <span className="mpc-share cyan-txt">3% Pool Share</span>
            </div>
          </div>
          <div className="mp-card glass-panel">
            <div className="mpc-top">
              <span className="mpc-rank">4TH – 10TH</span>
              <strong>14% Pool Share</strong>
            </div>
            <div className="mpc-details">
              <span>7 Winners</span>
              <span className="mpc-share cyan-txt">2.00% each</span>
            </div>
          </div>
          <div className="mp-card glass-panel">
            <div className="mpc-top">
              <span className="mpc-rank">11TH – 50TH</span>
              <strong>20% Pool Share</strong>
            </div>
            <div className="mpc-details">
              <span>40 Winners</span>
              <span className="mpc-share cyan-txt">0.50% each</span>
            </div>
          </div>
          <div className="mp-card glass-panel">
            <div className="mpc-top">
              <span className="mpc-rank">51ST – 100TH</span>
              <strong>15% Pool Share</strong>
            </div>
            <div className="mpc-details">
              <span>50 Winners</span>
              <span className="mpc-share cyan-txt">0.30% each</span>
            </div>
          </div>
          <div className="mp-card glass-panel">
            <div className="mpc-top">
              <span className="mpc-rank">101ST – 250TH</span>
              <strong>18% Pool Share</strong>
            </div>
            <div className="mpc-details">
              <span>150 Winners</span>
              <span className="mpc-share cyan-txt">0.12% each</span>
            </div>
          </div>
          <div className="mp-card total-summary glass-panel">
            <div className="mpc-top">
              <span>TOTAL COMMUNITY REWARDS</span>
              <strong className="gold-gradient-text">250 Winners (100% Shared)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

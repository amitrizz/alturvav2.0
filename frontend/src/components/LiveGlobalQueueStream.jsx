import React, { useState, useEffect } from 'react';
import { Activity, Radio, Zap, Shield, ArrowUpRight, Flame, RefreshCw } from 'lucide-react';
import { LIVE_STREAM_BLOCK } from '../planConfig';

export default function LiveGlobalQueueStream() {
  const [tickerItems, setTickerItems] = useState(LIVE_STREAM_BLOCK.initialTicker);
  const [blockHeight, setBlockHeight] = useState(LIVE_STREAM_BLOCK.blockNumber);
  const [turnover, setTurnover] = useState(LIVE_STREAM_BLOCK.dailyTurnoverUSD);
  const [activeWallets, setActiveWallets] = useState(LIVE_STREAM_BLOCK.totalActiveWallets);

  // Live block stream effect (advancing block number and simulated on-chain transactions)
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight(b => b + 1);
      if (Math.random() > 0.4) {
        setTurnover(t => t + Math.floor(Math.random() * 250 + 25));
        if (Math.random() > 0.7) setActiveWallets(w => w + 1);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="live-stream-container glass-panel">
      {/* Stream Header */}
      <div className="stream-header-strip">
        <div className="live-status-pill">
          <span className="live-dot pulse"></span>
          <span className="live-text">SYSTEM LIVE STREAM FEED</span>
          <span className="block-pill">BLOCKCHAIN LEDGER BLOCK #{blockHeight}</span>
        </div>

        <div className="stream-stats-row">
          <div className="s-stat">
            <span className="s-lbl">Total Active Global Wallets:</span>
            <strong className="cyan-gradient-text">{activeWallets.toLocaleString()}</strong>
          </div>
          <div className="s-stat">
            <span className="s-lbl">Global Monoline Depth:</span>
            <strong className="gold-gradient-text">Level #{LIVE_STREAM_BLOCK.monolineDepth.toLocaleString()}</strong>
          </div>
          <div className="s-stat">
            <span className="s-lbl">24H Turnover Volume:</span>
            <strong className="green-txt">+${turnover.toLocaleString()} USDT</strong>
          </div>
        </div>
      </div>

      {/* Real-Time P2P & Re-Birth Ticker */}
      <div className="ticker-wrapper">
        <div className="ticker-badge">
          <Zap size={14} className="gold" /> ⚡ REAL-TIME P2P & RE-BIRTH TICKER
        </div>
        <div className="ticker-scroller">
          {tickerItems.map(item => (
            <div key={item.id} className="ticker-chip glass-panel">
              <span className="t-wallet cyan-gradient-text">{item.wallet}</span>
              <span className="t-arrow">👉</span>
              <strong className="t-action">{item.action}</strong>
              <span className="t-detail">{item.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


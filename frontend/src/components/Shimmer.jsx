import React from "react";
import "./Shimmer.css";

function Shimmer({ activeTab }) {
  const renderDashboardShimmer = () => (
    <div className="shimmer-container" style={{ gap: "25px" }}>
      {/* 6 Stats strip cards matching Dashboard.css */}
      <section className="db-stats-strip">
        <div className="shimmer-block db-stat-card" style={{ height: "92px", display: "flex", gap: "14px", alignItems: "center", padding: "16px" }}>
          <div className="shimmer-block" style={{ width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0 }}></div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
            <div className="shimmer-block" style={{ width: "40%", height: "14px" }}></div>
            <div className="shimmer-block" style={{ width: "80%", height: "20px" }}></div>
          </div>
        </div>
        <div className="shimmer-block db-stat-card" style={{ height: "92px", display: "flex", gap: "14px", alignItems: "center", padding: "16px" }}>
          <div className="shimmer-block" style={{ width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0 }}></div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
            <div className="shimmer-block" style={{ width: "50%", height: "14px" }}></div>
            <div className="shimmer-block" style={{ width: "70%", height: "20px" }}></div>
          </div>
        </div>
        <div className="shimmer-block db-stat-card" style={{ height: "92px", display: "flex", gap: "14px", alignItems: "center", padding: "16px" }}>
          <div className="shimmer-block" style={{ width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0 }}></div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
            <div className="shimmer-block" style={{ width: "60%", height: "14px" }}></div>
            <div className="shimmer-block" style={{ width: "75%", height: "20px" }}></div>
          </div>
        </div>
        <div className="shimmer-block db-stat-card" style={{ height: "92px", display: "flex", gap: "14px", alignItems: "center", padding: "16px" }}>
          <div className="shimmer-block" style={{ width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0 }}></div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
            <div className="shimmer-block" style={{ width: "45%", height: "14px" }}></div>
            <div className="shimmer-block" style={{ width: "60%", height: "20px" }}></div>
          </div>
        </div>
        <div className="shimmer-block db-stat-card" style={{ height: "92px", display: "flex", gap: "14px", alignItems: "center", padding: "16px" }}>
          <div className="shimmer-block" style={{ width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0 }}></div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
            <div className="shimmer-block" style={{ width: "55%", height: "14px" }}></div>
            <div className="shimmer-block" style={{ width: "80%", height: "20px" }}></div>
          </div>
        </div>
        <div className="shimmer-block db-stat-card" style={{ height: "92px", display: "flex", gap: "14px", alignItems: "center", padding: "16px" }}>
          <div className="shimmer-block" style={{ width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0 }}></div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
            <div className="shimmer-block" style={{ width: "40%", height: "14px" }}></div>
            <div className="shimmer-block" style={{ width: "50%", height: "20px" }}></div>
          </div>
        </div>
      </section>
      
      {/* Split Row layout matching Dashboard.css */}
      <div className="db-dashboard-row-split">
        {/* Quick Actions Column */}
        <div className="shimmer-block db-card-box" style={{ height: "390px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="shimmer-block" style={{ width: "35%", height: "22px" }}></div>
          <div className="db-quick-actions-grid" style={{ gridTemplateColumns: "1fr" }}>
            <div className="shimmer-block" style={{ height: "100px", borderRadius: "12px" }}></div>
            <div className="shimmer-block" style={{ height: "100px", borderRadius: "12px" }}></div>
          </div>
        </div>
        {/* Right Info Box */}
        <div className="shimmer-block db-card-box" style={{ height: "390px", padding: "20px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="shimmer-block" style={{ width: "45%", height: "22px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "65px", borderRadius: "10px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "65px", borderRadius: "10px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "65px", borderRadius: "10px" }}></div>
        </div>
      </div>
    </div>
  );

  const renderMintShimmer = () => (
    <div className="shimmer-container">
      <div className="shimmer-grid-2">
        {/* Left main Mint panel */}
        <div className="shimmer-block" style={{ height: "520px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Tabs header */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div className="shimmer-block" style={{ width: "150px", height: "40px", borderRadius: "8px" }}></div>
            <div className="shimmer-block" style={{ width: "150px", height: "40px", borderRadius: "8px" }}></div>
          </div>
          {/* Input field */}
          <div className="shimmer-block" style={{ width: "40%", height: "18px", marginTop: "10px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "55px", borderRadius: "10px" }}></div>
          {/* Percent buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div className="shimmer-block" style={{ flex: 1, height: "38px" }}></div>
            <div className="shimmer-block" style={{ flex: 1, height: "38px" }}></div>
            <div className="shimmer-block" style={{ flex: 1, height: "38px" }}></div>
            <div className="shimmer-block" style={{ flex: 1, height: "38px" }}></div>
          </div>
          {/* Output lines */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "between" }}><div className="shimmer-block" style={{ width: "40%", height: "16px" }}></div><div className="shimmer-block" style={{ width: "30%", height: "16px" }}></div></div>
            <div style={{ display: "flex", justifyContent: "between" }}><div className="shimmer-block" style={{ width: "50%", height: "16px" }}></div><div className="shimmer-block" style={{ width: "20%", height: "16px" }}></div></div>
          </div>
          {/* Promo Code input */}
          <div className="shimmer-block" style={{ width: "100%", height: "46px", borderRadius: "10px", marginTop: "10px" }}></div>
          {/* Actions */}
          <div style={{ display: "flex", gap: "12px", marginTop: "15px" }}>
            <div className="shimmer-block" style={{ flex: 1, height: "48px" }}></div>
            <div className="shimmer-block" style={{ flex: 1, height: "48px" }}></div>
          </div>
        </div>
        {/* Right guide sidebar */}
        <div className="shimmer-block" style={{ height: "520px", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div className="shimmer-block" style={{ width: "60%", height: "24px" }}></div>
          <div style={{ display: "flex", gap: "16px" }}>
            <div className="shimmer-block" style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0 }}></div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="shimmer-block" style={{ width: "50%", height: "18px" }}></div>
              <div className="shimmer-block" style={{ width: "90%", height: "14px" }}></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <div className="shimmer-block" style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0 }}></div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <div className="shimmer-block" style={{ width: "40%", height: "18px" }}></div>
              <div className="shimmer-block" style={{ width: "85%", height: "14px" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStakeShimmer = () => (
    <div className="shimmer-container">
      {/* 3 cards stats */}
      <div className="shimmer-grid-4" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="shimmer-block" style={{ height: "120px" }}></div>
        <div className="shimmer-block" style={{ height: "120px" }}></div>
        <div className="shimmer-block" style={{ height: "120px" }}></div>
      </div>

      <div className="shimmer-grid-2">
        {/* Main staking panel */}
        <div className="shimmer-block" style={{ height: "450px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="shimmer-block" style={{ width: "30%", height: "20px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "55px", borderRadius: "10px" }}></div>
          <div className="shimmer-block" style={{ width: "40%", height: "18px" }}></div>
          <div style={{ display: "flex", gap: "12px" }}>
            <div className="shimmer-block" style={{ flex: 1, height: "80px", borderRadius: "10px" }}></div>
            <div className="shimmer-block" style={{ flex: 1, height: "80px", borderRadius: "10px" }}></div>
          </div>
          <div className="shimmer-block" style={{ width: "100%", height: "48px", borderRadius: "10px", marginTop: "20px" }}></div>
        </div>
        {/* Side panel */}
        <div className="shimmer-block" style={{ height: "450px", padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="shimmer-block" style={{ width: "50%", height: "20px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "120px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "120px" }}></div>
        </div>
      </div>
    </div>
  );

  const renderWheelShimmer = () => (
    <div className="shimmer-container" style={{ alignItems: "center" }}>
      {/* Giant circle wheel placeholder */}
      <div className="shimmer-block" style={{ width: "340px", height: "340px", borderRadius: "50%", margin: "25px 0" }}></div>
      <div className="shimmer-block" style={{ width: "260px", height: "48px", borderRadius: "24px" }}></div>
      <div className="shimmer-block" style={{ width: "100%", height: "240px", marginTop: "25px", padding: "20px" }}>
        <div className="shimmer-block" style={{ width: "30%", height: "20px", marginBottom: "20px" }}></div>
        <div className="shimmer-block" style={{ width: "100%", height: "35px", marginBottom: "10px" }}></div>
        <div className="shimmer-block" style={{ width: "100%", height: "35px", marginBottom: "10px" }}></div>
        <div className="shimmer-block" style={{ width: "100%", height: "35px" }}></div>
      </div>
    </div>
  );

  const renderRanksShimmer = () => (
    <div className="shimmer-container">
      {/* Switcher & Banner */}
      <div style={{ display: "flex", gap: "12px" }}>
        <div className="shimmer-block" style={{ flex: 1, height: "45px", borderRadius: "10px" }}></div>
        <div className="shimmer-block" style={{ flex: 1, height: "45px", borderRadius: "10px" }}></div>
      </div>
      <div className="shimmer-block" style={{ height: "150px", padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div className="shimmer-block" style={{ width: "40px", height: "40px", borderRadius: "50%" }}></div>
          <div className="shimmer-block" style={{ width: "250px", height: "22px" }}></div>
        </div>
        <div className="shimmer-block" style={{ width: "100%", height: "10px", borderRadius: "5px" }}></div>
        <div className="shimmer-block" style={{ width: "30%", height: "14px" }}></div>
      </div>
      
      {/* Dual Column grid structure */}
      <div className="shimmer-grid-2">
        <div className="shimmer-block" style={{ height: "320px", padding: "20px" }}>
          <div className="shimmer-block" style={{ width: "40%", height: "20px", marginBottom: "20px" }}></div>
          <div className="shimmer-grid-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div className="shimmer-block" style={{ height: "65px" }}></div>
            <div className="shimmer-block" style={{ height: "65px" }}></div>
            <div className="shimmer-block" style={{ height: "65px" }}></div>
            <div className="shimmer-block" style={{ height: "65px" }}></div>
          </div>
        </div>
        <div className="shimmer-block" style={{ height: "320px", padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
          <div className="shimmer-block" style={{ width: "50%", height: "20px", marginBottom: "10px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "40px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "40px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "40px" }}></div>
        </div>
      </div>
    </div>
  );

  const renderProfileShimmer = () => (
    <div className="shimmer-container">
      {/* Wallet info card */}
      <div className="shimmer-block" style={{ height: "180px", padding: "24px", display: "flex", flexDirection: "column", gap: "15px" }}>
        <div className="shimmer-block" style={{ width: "30%", height: "18px" }}></div>
        <div className="shimmer-block" style={{ width: "60%", height: "28px" }}></div>
        <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
          <div className="shimmer-block" style={{ width: "120px", height: "35px" }}></div>
          <div className="shimmer-block" style={{ width: "120px", height: "35px" }}></div>
          <div className="shimmer-block" style={{ width: "120px", height: "35px" }}></div>
        </div>
      </div>
      
      {/* Dual panels (Purchase history vs withdrawal history) */}
      <div className="shimmer-grid-equal-2">
        <div className="shimmer-block" style={{ height: "380px", padding: "20px" }}>
          <div className="shimmer-block" style={{ width: "40%", height: "20px", marginBottom: "20px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "50px", marginBottom: "10px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "50px", marginBottom: "10px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "50px" }}></div>
        </div>
        <div className="shimmer-block" style={{ height: "380px", padding: "20px" }}>
          <div className="shimmer-block" style={{ width: "40%", height: "20px", marginBottom: "20px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "50px", marginBottom: "10px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "50px", marginBottom: "10px" }}></div>
          <div className="shimmer-block" style={{ width: "100%", height: "50px" }}></div>
        </div>
      </div>
    </div>
  );

  switch (activeTab) {
    case "dashboard":
      return renderDashboardShimmer();
    case "mint":
      return renderMintShimmer();
    case "stake":
      return renderStakeShimmer();
    case "wheel":
      return renderWheelShimmer();
    case "ranks":
      return renderRanksShimmer();
    case "affiliate":
      return renderProfileShimmer();
    default:
      return renderDashboardShimmer();
  }
}

export default Shimmer;

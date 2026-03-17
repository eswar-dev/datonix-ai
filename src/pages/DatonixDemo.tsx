import { useState } from "react";

/* ──────────────────────────── SVG LOGOS ──────────────────────────── */

function SidebarLogo() {
  return (
    <svg viewBox="0 0 170 38" width="170" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hexagon */}
      <polygon points="16,19 25,5 45,5 54,19 45,33 25,33" stroke="#89D8F8" strokeWidth="2" fill="none" />
      {/* 7 dots */}
      <circle cx="35" cy="19" r="4.8" fill="#0099FF" />
      <circle cx="46" cy="19" r="3.6" fill="#0099FF" />
      <circle cx="35" cy="10" r="3.3" fill="#0099FF" />
      <circle cx="24" cy="19" r="3" fill="#0099FF" />
      <circle cx="35" cy="28" r="3" fill="#0099FF" />
      <circle cx="45" cy="28" r="1.8" fill="#0099FF" />
      <circle cx="25" cy="10" r="1.4" fill="#0099FF" />
      {/* Text */}
      <text x="62" y="24" fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="16" fill="#0099FF">Datonix</text>
      <text x="62" y="32" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="3.8" fill="#7aaabb" letterSpacing="2.2">AI THAT MAKES DECISIONS ACTIONABLE</text>
    </svg>
  );
}


/* ──────────────────────────── NAV ICONS ──────────────────────────── */

const navIcons: Record<string, JSX.Element> = {
  "Data Sources": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>
  ),
  Dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
  ),
  "Datonix AI": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect x="8" y="8" width="8" height="12" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
  ),
  Reports: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
  ),
  "Decision Intelligence": (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3 4 4.5 4.5 0 0 1-3-4"/><path d="M12 18v-3"/></svg>
  ),
  Administration: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
  ),
};

const navItems = ["Data Sources", "Dashboard", "Datonix AI", "Reports", "Decision Intelligence", "Administration"];

/* ──────────────────────────── KPI DATA ──────────────────────────── */

const kpis = [
  { label: "Total Records", value: "2.4M", delta: "+12.5%", up: true },
  { label: "Data Quality Score", value: "94.2%", delta: "-1.3%", up: false },
  { label: "Active Sources", value: "18", delta: "+3", up: true },
  { label: "Insights Generated", value: "342", delta: "+28%", up: true },
];


/* ──────────────────────────── MAIN COMPONENT ──────────────────────────── */

export default function DatonixDemo() {

  return (
    <div style={{ position: "relative", display: "flex", width: "100%", height: "600px", borderRadius: "12px", overflow: "hidden", background: "#f0f2f5", fontFamily: "Arial, sans-serif" }}>
      {/* ─── SIDEBAR ─── */}
      <aside style={{ width: 220, minWidth: 220, background: "#0f1e2d", display: "flex", flexDirection: "column" }}>
        {/* Logo */}
        <div style={{ padding: "16px 14px 12px" }}>
          <SidebarLogo />
        </div>

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e3a52", display: "flex", alignItems: "center", justifyContent: "center", color: "#5ba3d9", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>JD</div>
          <div>
            <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>John Doe</div>
            <div style={{ color: "#7a9ab5", fontSize: 10 }}>Sales Manager</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {navItems.map((item) => {
            const active = item === "Dashboard";
            return (
              <button
                key={item}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: active ? "#1e3a52" : "transparent",
                  color: active ? "#fff" : "#8aaec8",
                  fontSize: 12.5, fontWeight: active ? 700 : 500,
                  textAlign: "left", width: "100%",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (!active) (e.currentTarget.style.background = "rgba(255,255,255,0.04)"); }}
                onMouseLeave={(e) => { if (!active) (e.currentTarget.style.background = "transparent"); }}
              >
                <span style={{ display: "flex", alignItems: "center" }}>{navIcons[item]}</span>
                {item}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ─── MAIN AREA ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header style={{ height: 50, minHeight: 50, background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f5f5f5", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#999", cursor: "pointer" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <span>Search...</span>
            <span style={{ background: "#eee", borderRadius: 4, padding: "2px 6px", fontSize: 10, color: "#888", marginLeft: 16 }}>⌘K</span>
          </div>

          {/* Right icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
            {/* Bell */}
            <button style={{ position: "relative", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              <div style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "#0099FF" }} />
            </button>

            {/* Avatar + dropdown */}
            <div style={{ position: "relative" }}>
              <button
                ref={avatarRef}
                onClick={(e) => { e.stopPropagation(); setDropdownOpen((v) => !v); }}
                style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e3a52", display: "flex", alignItems: "center", justifyContent: "center", color: "#5ba3d9", fontSize: 11, fontWeight: 700, border: "none", cursor: "pointer" }}
              >
                JD
              </button>

              {dropdownOpen && (
                <div
                  ref={dropdownRef}
                  style={{ position: "absolute", top: 38, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,0.10)", width: 160, zIndex: 50, overflow: "hidden" }}
                >
                  <button style={{ ...dropdownItemStyle }}>Profile</button>
                  <button style={{ ...dropdownItemStyle }}>Settings</button>
                  <div style={{ height: 1, background: "#e5e7eb" }} />
                  <button style={{ ...dropdownItemStyle, color: "#e53e3e" }} onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: "0 0 20px" }}>Dashboard</h1>

          {/* KPI Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {kpis.map((kpi) => (
              <div key={kpi.label} style={{ background: "#fff", border: "1px solid #e9ecef", borderRadius: 10, padding: "18px 20px" }}>
                <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#111" }}>{kpi.value}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: 12 }}>
                  <span style={{ color: kpi.up ? "#16a34a" : "#dc2626" }}>
                    {kpi.up ? "▲" : "▼"} {kpi.delta}
                  </span>
                </div>
                <div style={{ fontSize: 9, color: "#aaa", marginTop: 8 }}>Updated 5m ago</div>
              </div>
            ))}
          </div>

        </main>
      </div>

    </div>
  );
}

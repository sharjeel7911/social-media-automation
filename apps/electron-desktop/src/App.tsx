import { useState } from "react";
import { LayoutDashboard, Send, Search, Users } from "lucide-react";
import { DashboardPage } from "./pages/DashboardPage";
import { PostsPage } from "./pages/PostsPage";
import { SeoPage } from "./pages/SeoPage";
import { LeadsPage } from "./pages/LeadsPage";

type ActiveTab = "dashboard" | "posts" | "seo" | "leads";

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  return (
    <div className="unified-app-layout">
      {/* Top Navigation Bar */}
      <header className="app-topbar">
        <div className="app-brand">
          <div className="app-brand-badge">SMA</div>
          <div className="app-brand-title">
            <h1>Marketing Automation Platform</h1>
            <span className="app-brand-subtitle">Unified Operations Center</span>
          </div>
        </div>

        <nav className="module-nav-tabs">
          <button
            type="button"
            className={`module-tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
            <span className="tab-pill">Module D</span>
          </button>

          <button
            type="button"
            className={`module-tab-btn ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            <Send size={18} />
            <span>Social Publisher</span>
            <span className="tab-pill">Module A</span>
          </button>

          <button
            type="button"
            className={`module-tab-btn ${activeTab === "seo" ? "active" : ""}`}
            onClick={() => setActiveTab("seo")}
          >
            <Search size={18} />
            <span>SEO Toolkit</span>
            <span className="tab-pill">Module B</span>
          </button>

          <button
            type="button"
            className={`module-tab-btn ${activeTab === "leads" ? "active" : ""}`}
            onClick={() => setActiveTab("leads")}
          >
            <Users size={18} />
            <span>Signal Desk (Leads)</span>
            <span className="tab-pill">Module C</span>
          </button>
        </nav>
      </header>

      {/* Main Module Content */}
      <main className="module-content-area">
        {activeTab === "dashboard" && <DashboardPage />}
        {activeTab === "posts" && <PostsPage />}
        {activeTab === "seo" && <SeoPage />}
        {activeTab === "leads" && <LeadsPage />}
      </main>
    </div>
  );
}

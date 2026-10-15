// ============================================================================
// WHAT IS THIS FILE?
// The container for all of Module D. Holds a small internal tab bar
// (Dashboard / Analytics / Lead Pipeline / Reports / Integrations) and
// decides which one of those five screens is currently showing.
// ============================================================================

import { useState } from "react";
import { LayoutDashboard, BarChart3, KanbanSquare, FileText, Plug } from "lucide-react";
import { Dashboard } from "../moduleD/components/Dashboard";
import { Analytics } from "../moduleD/components/Analytics";
import { LeadPipeline } from "../moduleD/components/LeadPipeline";
import { Reports } from "../moduleD/components/Reports";
import { Integrations } from "../moduleD/components/Integrations";

type Tab = "dashboard" | "analytics" | "pipeline" | "reports" | "integrations";

const TABS: Array<{ key: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "pipeline", label: "Lead Pipeline", icon: KanbanSquare },
  { key: "reports", label: "Reports", icon: FileText },
  { key: "integrations", label: "Integrations", icon: Plug },
];

export function DashboardPage() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="page">
      <div className="subnav">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={tab === key ? "subnav__button subnav__button--active" : "subnav__button"}
            onClick={() => setTab(key)}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <div className="page__body">
        {tab === "dashboard" && <Dashboard onGoTo={setTab} />}
        {tab === "analytics" && <Analytics />}
        {tab === "pipeline" && <LeadPipeline />}
        {tab === "reports" && <Reports />}
        {tab === "integrations" && <Integrations />}
      </div>
    </div>
  );
}

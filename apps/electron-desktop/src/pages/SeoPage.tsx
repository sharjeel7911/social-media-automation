// ============================================================================
// WHAT IS THIS FILE?
// The container for all of Module B. Holds a small internal tab bar
// (Dashboard / Keyword Research / Rank Tracker / Site Audit / Competitor
// Gap / Google Business Profile) and decides which one of those six
// screens is currently showing.
// ============================================================================

import { useState } from "react";
import { LayoutDashboard, Search, TrendingUp, FileSearch, Users, MapPin } from "lucide-react";
import { Dashboard } from "../moduleB/components/Dashboard";
import { KeywordResearch } from "../moduleB/components/KeywordResearch";
import { RankTracker } from "../moduleB/components/RankTracker";
import { SiteAudit } from "../moduleB/components/SiteAudit";
import { CompetitorGap } from "../moduleB/components/CompetitorGap";
import { GoogleBusinessProfile } from "../moduleB/components/GoogleBusinessProfile";

type Tab = "dashboard" | "keywords" | "rank" | "audit" | "competitor" | "gbp";

const TABS: Array<{ key: Tab; label: string; icon: typeof LayoutDashboard }> = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "keywords", label: "Keyword Research", icon: Search },
  { key: "rank", label: "Rank Tracker", icon: TrendingUp },
  { key: "audit", label: "Site Audit", icon: FileSearch },
  { key: "competitor", label: "Competitor Gap", icon: Users },
  { key: "gbp", label: "Google Business Profile", icon: MapPin },
];

export function SeoPage() {
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
        {tab === "keywords" && <KeywordResearch />}
        {tab === "rank" && <RankTracker />}
        {tab === "audit" && <SiteAudit />}
        {tab === "competitor" && <CompetitorGap />}
        {tab === "gbp" && <GoogleBusinessProfile />}
      </div>
    </div>
  );
}

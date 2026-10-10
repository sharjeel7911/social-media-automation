// ============================================================================
// WHAT IS THIS FILE?
// The cross-platform analytics screen — per SOW Section 3.4
// ("impressions, engagement rate, follower growth, top-performing
// posts"). Three trend charts over the last 30 days, plus a ranked list
// of the posts that performed best.
//
// Note: right now only LinkedIn exists as a platform, so "cross-platform"
// just means LinkedIn today. When more platforms get added to Module A,
// the numbers here would combine all of them.
// ============================================================================

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { LineChart } from "./LineChart";

export function Analytics() {
  const { analytics, loadingAnalytics, loadAnalytics } = useDashboardStore();

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loadingAnalytics || !analytics) {
    return (
      <div className="loading-row">
        <Loader2 size={16} className="spin" /> Loading analytics…
      </div>
    );
  }

  const dates = analytics.history.map((p) => p.date);

  return (
    <div className="analytics">
      <p className="muted-text analytics__note">
        Showing the last 30 days. These numbers are placeholder data — see
        electron/ipc/dashboard.ipc.ts and modules/dashboard/services/dataSync.ts.
      </p>

      <div className="analytics__charts">
        <LineChart
          title="Impressions"
          values={analytics.history.map((p) => p.impressions)}
          dates={dates}
          color="#3D5D8A"
        />
        <LineChart
          title="Engagement rate"
          values={analytics.history.map((p) => p.engagement_rate)}
          dates={dates}
          color="#2F6B2A"
          format={(n) => `${n}%`}
        />
        <LineChart
          title="Followers"
          values={analytics.history.map((p) => p.followers)}
          dates={dates}
          color="#8A5A16"
        />
      </div>

      <h3 className="analytics__heading">Top-performing posts</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Post</th>
            <th>Impressions</th>
            <th>Engagement</th>
          </tr>
        </thead>
        <tbody>
          {analytics.top_posts.map((post, i) => (
            <tr key={post.id}>
              <td>{i + 1}</td>
              <td>{post.content}</td>
              <td>{post.impressions.toLocaleString()}</td>
              <td>{post.engagement_rate}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

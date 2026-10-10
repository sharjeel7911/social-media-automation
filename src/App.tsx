// ============================================================================
// WHAT IS THIS FILE?
// The very top of the on-screen app. Since this project is JUST Module D,
// this file's only job is to render the dashboard screen (DashboardPage) —
// there's nothing else to switch between here.
// ============================================================================

import { DashboardPage } from "./pages/DashboardPage";

function App() {
  return (
    <div className="app">
      <DashboardPage />
    </div>
  );
}

export default App;

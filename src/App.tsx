// ============================================================================
// WHAT IS THIS FILE?
// The very top of the on-screen app. Since this project is JUST Module B,
// this file's only job is to render the SEO toolkit screen (SeoPage) —
// there's nothing else to switch between here.
// ============================================================================

import { SeoPage } from "./pages/SeoPage";

function App() {
  return (
    <div className="app">
      <SeoPage />
    </div>
  );
}

export default App;

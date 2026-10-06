// ============================================================================
// WHAT IS THIS FILE?
// The very top of the on-screen app. Since this project is JUST Module A,
// this file's only job is to render the Module A screen (PostsPage) —
// there's nothing else to switch between here.
// ============================================================================

import { PostsPage } from "./pages/PostsPage";

function App() {
  return (
    <div className="app">
      <PostsPage />
    </div>
  );
}

export default App;

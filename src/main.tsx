// ============================================================================
// WHAT IS THIS FILE?
// This is the literal starting point of everything you SEE in the app.
// index.html has one empty box waiting (id="root"); this file finds that
// box and tells React "put the whole app inside here."
// ============================================================================

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

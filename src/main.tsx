// ============================================================================
// WHAT IS THIS FILE?
// This is the literal starting point of everything you SEE in the app.
// index.html has one empty box waiting (id="root"); this file finds that
// box and tells React "put the whole app inside here."
// ============================================================================

import React from "react";
// ^ The library our whole on-screen app is built with. React lets us
//   describe what the screen should look like, and it takes care of
//   actually drawing and updating it.

import ReactDOM from "react-dom/client";
// ^ The specific part of React that knows how to connect to a real web
//   page/window and put things on screen (as opposed to, say, a mobile app).

import App from "./App";
// ^ Our actual app — everything the user sees and interacts with lives
//   inside this one big component.

import "./index.css";
// ^ Loads our stylesheet (colors, spacing, fonts, etc.) so the app looks
//   the way it's supposed to instead of plain unstyled text.

ReactDOM.createRoot(document.getElementById("root")!).render(
  // Finds that empty "root" box from index.html...
  <React.StrictMode>
    {/* StrictMode is a development helper that double-checks our code for
        common mistakes while we're building the app. It has no effect on
        the finished, packaged version people actually use. */}
    <App />
    {/* ...and draws our whole App component inside it. */}
  </React.StrictMode>
);

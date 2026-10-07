// This file configures Vite — the tool that runs our app while we're
// developing it (with instant reload every time we save a file) and also
// "bundles" (packages up) the finished app for release.
// Think of Vite as the assembly line for turning our source code into
// something a computer can actually open and run.

import { defineConfig } from "vite";
// ^ A helper function from Vite itself, just used to get nice
//   autocomplete/checking while writing this settings file.

import react from "@vitejs/plugin-react";
// ^ A plug-in that teaches Vite how to understand React's special JSX
//   syntax (the HTML-like code inside our components).

export default defineConfig({
  // Everything below is one settings object describing how Vite should behave.

  plugins: [react()],
  // ^ Turns on the React plug-in mentioned above.

  base: "./",
  // ^ Tells the app to look for its own files using relative paths
  //   (e.g. "./assets/logo.png") instead of absolute ones
  //   (e.g. "/assets/logo.png"). This matters because our packaged desktop
  //   app opens files directly from disk rather than from a web address —
  //   relative paths work in both situations, absolute ones don't.
});

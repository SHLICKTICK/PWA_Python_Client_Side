// 1. Load Pyodide.
//
// This worker is created with { type: "module" } in erwe.js, which is
// required by current Pyodide builds — they use ES module features
// (dynamic import) internally and throw "Classic web workers are not
// supported" if loaded via importScripts() in a classic worker.
//
// Because this is now a module worker, we use a static ESM import of the
// .mjs build instead of importScripts() + the .js (UMD) build.
//
// SELF-HOSTED SETUP (npm package):
// Copy these 5 files from node_modules/pyodide/ into a folder your web
// server actually exposes, e.g. a top-level /pyodide/ folder next to
// index.html:
//   - pyodide.mjs
//   - pyodide.asm.mjs
//   - pyodide.asm.wasm
//   - pyodide-lock.json
//   - python_stdlib.zip
// (You don't need pyodide.js, *.map, *.d.ts, console.html, or README.md —
// those aren't loaded at runtime.)
//
// IMPORTANT: never point this at "/node_modules/pyodide/..." directly —
// node_modules is a build-time folder, not something your server should be
// exposing at that path, and most static servers won't serve it anyway.
const PYODIDE_BASE = "/public/pyodide/"; // Adjust this path to where you actually serve the Pyodide files
import { loadPyodide } from "/public/pyodide/pyodide.mjs"; // Adjust this path to where you actually serve the Pyodide files

let pyodideReadyPromise = loadPyodide({
  indexURL: PYODIDE_BASE,
});

// 2. Tell the main thread as soon as Pyodide has actually finished loading,
//    so the UI can stop showing "loading" and enable execution.
pyodideReadyPromise
  .then(() => {
    self.postMessage({ status: "ready" });
  })
  .catch((error) => {
    self.postMessage({ status: "error", error: `Failed to load Pyodide: ${error.message}` });
  });

self.onmessage = async (event) => {
  let pyodide;
  try {
    pyodide = await pyodideReadyPromise;
  } catch (error) {
    self.postMessage({ status: "error", error: `Pyodide failed to initialize: ${error.message}` });
    return;
  }

  // Unpack code and the separate raw data property safely
  const { code, data } = event.data;

  try {
    // Inject the raw string securely into Pyodide globals as a variable
    pyodide.globals.set("js_input", data);

    // Run the script securely
    const result = await pyodide.runPythonAsync(code);
    self.postMessage({ status: "success", result: result });
  } catch (error) {
    self.postMessage({ status: "error", error: error.message });
  }
};
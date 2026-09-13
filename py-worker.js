// This file imports the Pyodide library, downloads the interpreter, and listens for instructions from the main UI thread 
// py-worker.js
importScripts("https://cdn.jsdelivr.net/pyodide/v314.0.6/full/pyodide.js"); // Use local file if bundled locally
// Initialize Pyodide
let pyodideReadyPromise = loadPyodide();
// Wait for Pyodide to be ready before executing any Python code
self.onmessage = async (event) => {
  const pyodide = await pyodideReadyPromise;// Ensure Pyodide is loaded
  const pythonCode = event.data;// Get the Python code from the message

  try {
    // Execute Python string and pass the result back to the main UI thread
    const result = await pyodide.runPythonAsync(pythonCode);// Execute the Python code asynchronously
    self.postMessage({ status: "success", result: result });
  } catch (error) {
    self.postMessage({ status: "error", error: error.message });
  }
};

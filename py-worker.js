// 1. Import the core Pyodide library from your local directory relative to this file
importScripts("/node_modules/pyodide/pyodide.js"); 

// 2. Initialize Pyodide, explicitly passing the indexURL pointing to your local asset directory
let pyodideReadyPromise = loadPyodide({
  indexURL: "/node_modules/pyodide/"
});

// Wait for Pyodide to be ready before executing any Python code
self.onmessage = async (event) => {
  const pyodide = await pyodideReadyPromise; // Ensure Pyodide is loaded
  const pythonCode = event.data;             // Get the Python code from the message

  try {
    // Execute Python string and pass the result back to the main UI thread
    const result = await pyodide.runPythonAsync(pythonCode); // Execute the Python code asynchronously
    self.postMessage({ status: "success", result: result });
  } catch (error) {
    self.postMessage({ status: "error", error: error.message });
  }
};

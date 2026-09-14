async function executeCommand() {
    const inputData = document.getElementById('input_data').value;
    const logElement = document.getElementById('output_log');

    logElement.textContent = "Attempting to execute Python payload...";

    try {
        // 1. Execute the function/script defined in the Python payload string
        // We pass the input data to the Python context.
        const pythonCodeToRun = ``;

        // Execute the code string using pyodide
        const result = await window.pyodide.runPythonAsync(pythonCodeToRun);

        // 2. Display the result
        logElement.textContent = `SUCCESS/RETURN VALUE:\n${result}`;

    } catch (error) {
        logElement.textContent = `EXECUTION ERROR: ${error}`;
    }
}

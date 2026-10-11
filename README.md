# BankSim: Blue-Team AI Firewall

🔗 **Live Demo:** [Try BankSim AI Firewall](https://banksim-ai-firewall.onrender.com)

💻 **GitHub Repository:** [View Source Code](https://github.com/shubha610/banksim-ai-firewall)

![Security Status](https://img.shields.io/badge/Security_Status-Operational-10b981)
![Tech](https://img.shields.io/badge/Focus-AI_Security_%7C_FinTech-06b6d4)
![Platform](https://img.shields.io/badge/Platform-React_%7C_Node.js-f59e0b)

## 🌟 About the Project

BankSim is a web-based banking simulation that demonstrates how an AI firewall can help protect banking applications from prompt injection and other malicious inputs.

As conversational AI becomes more common in financial applications, it is important to ensure that user inputs cannot manipulate an AI assistant into ignoring its rules, exposing confidential information, or attempting unauthorized financial operations.

BankSim explores this problem through a defensive firewall that checks user inputs, identifies suspicious patterns, applies security rules, and decides whether a request should be approved or blocked.

The project combines a simulated banking interface, a firewall inspection engine, a collection of attack scenarios, and a security benchmarking tool in one interactive application.

## 🎯 Project Goals

- Detect common prompt injection and jailbreak attempts.
- Identify suspicious instructions hidden in transaction memo fields.
- Prevent unauthorized or invalid operations in the simulated banking environment.
- Apply deterministic rules for transaction limits and incomplete requests.
- Provide clear explanations of firewall decisions through structured JSON responses.
- Demonstrate the difference between protected and unprotected request handling.

## 🛡️ How the Firewall Works

BankSim uses a multi-layer inspection pipeline to evaluate incoming requests.

### 1. Input Normalization
Checks for suspicious formatting, invisible characters, and common obfuscation techniques.

### 2. Prompt Injection Detection
Looks for instructions that attempt to override existing rules or manipulate the assistant.

### 3. Jailbreak Detection
Checks for known jailbreak patterns, including DAN-style prompts and attempts to disable safety restrictions.

### 4. Roleplay and Authority Checks
Identifies suspicious roleplay scenarios or claims of authority used to bypass normal restrictions.

### 5. Confidential Information Protection
Detects requests attempting to reveal hidden system instructions or internal configuration details.

### 6. Tool and Parameter Validation
Checks for suspicious function calls, SQL-like commands, and attempts to bypass security parameters.

### 7. Transaction Memo Sanitization
Inspects transaction descriptions for embedded malicious instructions and sanitizes suspicious content.

### 8. Financial Policy Checks
Applies rules for transaction limits, spending limits, balances, and incomplete or ambiguous requests.

## ✨ Key Features

### 💬 Interactive Banking Assistant
Try banking-related requests such as checking balances, reviewing transactions, transferring funds, and managing card status in a simulated environment.

### 🔍 Firewall Inspector
Inspect each request to see its risk score, approval status, detected threat category, and structured JSON analysis.

### 🔐 Protected and Bypass Modes
Compare how requests are handled when the firewall is enabled versus when its protective checks are bypassed in the simulation.

**Note:** Bypass mode is intended for controlled demonstrations within the mock banking application.

### 🧪 Attack Lab
Experiment with built-in attack scenarios covering prompt injection, jailbreaks, roleplay manipulation, hidden instructions in transaction memos, and suspicious tool calls.

### 📊 Security Benchmarking
Run a built-in suite of 16 test cases to evaluate the firewall against selected malicious and legitimate inputs.

In the current local test results, the suite achieved:
- 100% accuracy across the built-in test cases
- 100% attack interception on the included attack cases
- 0% false positives on the included legitimate cases
- Average detection latency of approximately 0.31 ms

These results apply to the project's predefined test suite and should not be interpreted as a guarantee against all possible attacks.

### 🏦 Simulated Banking Ledger
Explore mock account balances, transaction history, card controls, and transfers. The application is designed for demonstration and does not connect to real bank accounts.

### 📝 Security Audit Logs
Review firewall decisions, filter recorded events, and export audit logs as JSON.

## 🧰 Tech Stack

- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Node.js, Express.js
- **Security:** Rule-based input inspection, sanitization, and financial policy validation
- **Testing:** Built-in security benchmark suite
- **Deployment:** Render
- **Version Control:** Git and GitHub

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/shubha610/banksim-ai-firewall.git
cd banksim-ai-firewall

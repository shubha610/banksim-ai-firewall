/**
 * BankSim Blue-Team AI Firewall: Core Orchestration Engine
 * 
 * Intercepts, inspects, and sanitizes untrusted user inputs before any
 * financial tool or mock transaction executes.
 * 
 * Produces deterministic, structured JSON output:
 * - approval_status: 'APPROVED' | 'BLOCKED'
 * - risk_score: 0 - 100
 * - threat_category: Threat classification
 * - explanation: Blue-Team defensive rationale
 * - guardrail_checks: Multi-layered layer-by-layer breakdown
 * - sanitized_payload: Cleaned and structured banking parameters
 * - execution_result: Safe financial tool result or rejection audit log
 */

import {
  preprocessInput,
  PROMPT_INJECTION_PATTERNS,
  JAILBREAK_PATTERNS,
  ROLEPLAY_PATTERNS,
  PROMPT_EXTRACTION_PATTERNS,
  TOOL_HIJACKING_PATTERNS
} from './detector.js';

import { sanitizeMemo, sanitizeInputText } from './sanitizer.js';
import { parseBankingIntent, validateFinancialPolicies } from './financialRules.js';
import { bankLedger } from '../bank/ledger.js';

export function inspectAndExecute({
  input = '',
  memo = '',
  bypassFirewall = false,
  policy = {}
}) {
  const startTime = performance.now();
  const rawInput = input || '';
  const rawMemo = memo || '';

  // IF BYPASS / UNPROTECTED MODE IS ENABLED:
  // Demonstrate the catastrophic failure of an unprotected LLM / system without a Blue-Team AI Firewall!
  if (bypassFirewall) {
    return handleVulnerableBypass(rawInput, rawMemo);
  }

  // --- LAYER 1: Preprocessing & Obfuscation Neutralization ---
  const preprocessed = preprocessInput(rawInput);
  const textToScan = preprocessed.normalized;

  const layerResults = {
    obfuscation: {
      passed: preprocessed.flags.length === 0,
      flags: preprocessed.flags,
      score: preprocessed.flags.length > 0 ? 75 : 0
    },
    promptInjection: { passed: true, matched: [], score: 0 },
    jailbreak: { passed: true, matched: [], score: 0 },
    roleplay: { passed: true, matched: [], score: 0 },
    promptExtraction: { passed: true, matched: [], score: 0 },
    toolHijacking: { passed: true, matched: [], score: 0 },
    memoSanitization: { passed: true, memoReport: null, score: 0 },
    financialPolicies: { passed: true, violations: [], score: 0 }
  };

  const detectedThreats = [];

  
// Block requests containing suspicious obfuscation patterns
if (preprocessed.flags.length > 0) {
  detectedThreats.push({
    type: 'OBFUSCATION',
    name: 'SUSPICIOUS_OBFUSCATION',
    severity: 75
  });
}


  // --- LAYER 2: Direct Prompt Injection Checks ---
  for (const pat of PROMPT_INJECTION_PATTERNS) {
    if (pat.regex.test(textToScan)) {
      layerResults.promptInjection.passed = false;
      layerResults.promptInjection.matched.push(pat.name);
      layerResults.promptInjection.score = Math.max(layerResults.promptInjection.score, pat.severity);
      detectedThreats.push({
        type: 'PROMPT_INJECTION',
        name: pat.name,
        severity: pat.severity
      });
    }
  }

  // --- LAYER 3: Jailbreak Attack Checks ---
  for (const pat of JAILBREAK_PATTERNS) {
    if (pat.regex.test(textToScan)) {
      layerResults.jailbreak.passed = false;
      layerResults.jailbreak.matched.push(pat.name);
      layerResults.jailbreak.score = Math.max(layerResults.jailbreak.score, pat.severity);
      detectedThreats.push({
        type: 'JAILBREAK',
        name: pat.name,
        severity: pat.severity
      });
    }
  }

  // --- LAYER 4: Roleplay & Social Engineering Checks ---
  for (const pat of ROLEPLAY_PATTERNS) {
    if (pat.regex.test(textToScan)) {
      layerResults.roleplay.passed = false;
      layerResults.roleplay.matched.push(pat.name);
      layerResults.roleplay.score = Math.max(layerResults.roleplay.score, pat.severity);
      detectedThreats.push({
        type: 'ROLEPLAY_ATTACK',
        name: pat.name,
        severity: pat.severity
      });
    }
  }

  // --- LAYER 5: System Prompt Extraction Probes ---
  for (const pat of PROMPT_EXTRACTION_PATTERNS) {
    if (pat.regex.test(textToScan)) {
      layerResults.promptExtraction.passed = false;
      layerResults.promptExtraction.matched.push(pat.name);
      layerResults.promptExtraction.score = Math.max(layerResults.promptExtraction.score, pat.severity);
      detectedThreats.push({
        type: 'SYSTEM_PROMPT_EXTRACTION',
        name: pat.name,
        severity: pat.severity
      });
    }
  }

  // --- LAYER 6: Tool & Function Calling Hijacking ---
  for (const pat of TOOL_HIJACKING_PATTERNS) {
    if (pat.regex.test(textToScan)) {
      layerResults.toolHijacking.passed = false;
      layerResults.toolHijacking.matched.push(pat.name);
      layerResults.toolHijacking.score = Math.max(layerResults.toolHijacking.score, pat.severity);
      detectedThreats.push({
        type: 'TOOL_HIJACKING',
        name: pat.name,
        severity: pat.severity
      });
    }
  }

  // --- LAYER 7: Transaction Memo Sanitization & Indirect Injection ---
  // Note: Check both the dedicated memo field AND any memo fragments inside user input
  const memoSanitizeResult = sanitizeMemo(rawMemo);
  layerResults.memoSanitization.memoReport = memoSanitizeResult;
  if (!memoSanitizeResult.isSafe) {
    layerResults.memoSanitization.passed = false;
    layerResults.memoSanitization.score = 95;
    detectedThreats.push({
      type: 'INDIRECT_INJECTION_MEMO',
      name: `Indirect Injection in Transaction Memo (${memoSanitizeResult.indirectThreats.map(t => t.name).join(', ')})`,
      severity: 95
    });
  }

  // --- LAYER 8: Intent Extraction & Financial Guardrails ---
  const parsedIntent = parseBankingIntent(preprocessed.cleanText, memoSanitizeResult.sanitized);
  const financialCheck = validateFinancialPolicies(parsedIntent, bankLedger.getState(), policy);

  layerResults.financialPolicies.passed = financialCheck.allowed;
  layerResults.financialPolicies.violations = financialCheck.violations;
  if (!financialCheck.allowed) {
    const highestViolation = Math.max(...financialCheck.violations.map(v => v.severity), 70);
    layerResults.financialPolicies.score = highestViolation;
    financialCheck.violations.forEach(v => {
      detectedThreats.push({
        type: 'FINANCIAL_POLICY_VIOLATION',
        name: v.message,
        severity: v.severity
      });
    });
  }

  // Compute Overall Risk Score (0-100)
  let maxThreatScore = 0;
  if (detectedThreats.length > 0) {
    maxThreatScore = Math.max(...detectedThreats.map(t => t.severity));
  } else if (parsedIntent.intent === 'UNKNOWN_OR_UNSTRUCTURED') {
    maxThreatScore = 45; // Ambiguity risk
  } else {
    maxThreatScore = 5; // Clean safe request baseline
  }

  // Determine Approval Status
  const threshold = policy.riskThreshold || 50;
  const isApproved = maxThreatScore < threshold && financialCheck.allowed && detectedThreats.length === 0 && !parsedIntent.ambiguous && preprocessed.flags.length === 0;;
  const approvalStatus = isApproved ? 'APPROVED' : 'BLOCKED';

  // Primary Threat Classification
  let threatCategory = 'NONE';
  if (detectedThreats.length > 0) {
    // Sort by severity descending
    detectedThreats.sort((a, b) => b.severity - a.severity);
    threatCategory = detectedThreats[0].type;
  } else if (parsedIntent.ambiguous) {
    threatCategory = 'AMBIGUOUS_UNTRUSTED_INPUT';
  }

  // Generate Blue-Team Defensive Explanation
  let explanation = '';
  if (isApproved) {
    explanation = `Input verified clean. All 8 defense-in-depth layers passed without anomalies. Intent resolved to ${parsedIntent.intent} with zero injection tokens. Transaction authorized.`;
  } else {
    if (threatCategory === 'INDIRECT_INJECTION_MEMO') {
      explanation = `BLOCKED by Blue-Team Layer 7 (Indirect Memo Sanitizer): The transaction memo contained adversarial prompt injection instructions designed to hijack downstream agent execution.`;
    } else if (threatCategory === 'PROMPT_INJECTION') {
      explanation = `BLOCKED by Blue-Team Layer 2 (Prompt Injection Guard): Detected directive aiming to disregard prior safety instructions or escalate execution privileges.`;
    } else if (threatCategory === 'JAILBREAK') {
      explanation = `BLOCKED by Blue-Team Layer 3 (Jailbreak Signature Filter): Identified known adversarial framing pattern (${layerResults.jailbreak.matched.join(', ')}).`;
    } else if (threatCategory === 'ROLEPLAY_ATTACK') {
      explanation = `BLOCKED by Blue-Team Layer 4 (Roleplay Persona Guard): Hostile roleplay or social engineering pattern detected attempting to force persona override.`;
    } else if (threatCategory === 'SYSTEM_PROMPT_EXTRACTION') {
      explanation = `BLOCKED by Blue-Team Layer 5 (Confidentiality Guard): Detected attempt to extract or exfiltrate private system instructions.`;
    } else if (threatCategory === 'TOOL_HIJACKING') {
      explanation = `BLOCKED by Blue-Team Layer 6 (Tool Guard): Raw command or malicious function tampering payload detected in user input.`;
    } else if (threatCategory === 'FINANCIAL_POLICY_VIOLATION') {
      const topViolation = financialCheck.violations[0]?.message || 'Financial policy ceiling exceeded.';
      explanation = `BLOCKED by Blue-Team Layer 8 (Financial Policy Engine): ${topViolation}`;
    } else if (threatCategory === 'AMBIGUOUS_UNTRUSTED_INPUT') {
      explanation = `BLOCKED by Strict Guardrails: Input is ambiguous or does not conform to valid banking schemas. System refuses ambiguous execution to prevent safety compromise.`;
    } else {
      explanation = `BLOCKED by Blue-Team Security Policy. Risk score (${maxThreatScore}) exceeds acceptable threshold (${threshold}).`;
    }
  }

  // Execute Financial Action IF AND ONLY IF Approved
  let executionResult = null;
  if (isApproved) {
    executionResult = executeApprovedAction(parsedIntent, memoSanitizeResult.sanitized);
  } else {
    executionResult = {
      status: 'REJECTED_BY_FIREWALL',
      message: 'Financial tool execution aborted. No funds moved or state modified.',
      blockedCategory: threatCategory,
      riskScore: maxThreatScore
    };
  }

  const endTime = performance.now();
  const latencyMs = parseFloat((endTime - startTime).toFixed(2));

  return {
    approval_status: approvalStatus,
    risk_score: maxThreatScore,
    threat_category: threatCategory,
    explanation,
    guardrail_checks: {
      obfuscation_neutralizer: {
        passed: layerResults.obfuscation.passed,
        flags: layerResults.obfuscation.flags
      },
      prompt_injection_guard: {
        passed: layerResults.promptInjection.passed,
        detections: layerResults.promptInjection.matched
      },
      jailbreak_signature_filter: {
        passed: layerResults.jailbreak.passed,
        detections: layerResults.jailbreak.matched
      },
      roleplay_persona_guard: {
        passed: layerResults.roleplay.passed,
        detections: layerResults.roleplay.matched
      },
      system_confidentiality_guard: {
        passed: layerResults.promptExtraction.passed,
        detections: layerResults.promptExtraction.matched
      },
      tool_tampering_guard: {
        passed: layerResults.toolHijacking.passed,
        detections: layerResults.toolHijacking.matched
      },
      memo_indirect_sanitizer: {
        passed: layerResults.memoSanitization.passed,
        sanitized_memo: memoSanitizeResult.sanitized,
        modifications: memoSanitizeResult.modifications,
        threats_found: memoSanitizeResult.indirectThreats.map(t => t.name)
      },
      financial_policy_engine: {
        passed: layerResults.financialPolicies.passed,
        violations: layerResults.financialPolicies.violations
      }
    },
    sanitized_payload: {
      clean_input: preprocessed.cleanText,
      sanitized_memo: memoSanitizeResult.sanitized,
      parsed_intent: parsedIntent.intent,
      extracted_parameters: parsedIntent.parameters || null
    },
    execution_result: executionResult,
    audit_metadata: {
      timestamp: new Date().toISOString(),
      engine_version: 'BankSim-BlueTeam-v2.4',
      latency_ms: latencyMs,
      firewall_enforced: true
    }
  };
}

/**
 * Execute safely once approved
 */
function executeApprovedAction(parsedIntent, sanitizedMemo) {
  if (parsedIntent.intent === 'CHECK_BALANCE') {
    const balances = bankLedger.getBalances();
    return {
      status: 'SUCCESS',
      action: 'CHECK_BALANCE',
      balances,
      message: `Your current balances are: Checking $${balances.checking.toFixed(2)}, Savings $${balances.savings.toFixed(2)}, Credit Card Balance $${balances.creditCard.toFixed(2)}.`
    };
  }

  if (parsedIntent.intent === 'VIEW_TRANSACTIONS') {
    const txns = bankLedger.getState().transactions.slice(0, 5);
    return {
      status: 'SUCCESS',
      action: 'VIEW_TRANSACTIONS',
      recentTransactions: txns,
      message: `Retrieved ${txns.length} recent transactions.`
    };
  }

  if (parsedIntent.intent === 'CARD_MANAGEMENT') {
    const cardResult = bankLedger.toggleCardStatus(parsedIntent.cardId);
    return {
      status: cardResult.success ? 'SUCCESS' : 'ERROR',
      action: 'CARD_MANAGEMENT',
      cardStatus: cardResult.newStatus,
      lastFour: cardResult.lastFour,
      message: `Debit card ending in ${cardResult.lastFour} is now ${cardResult.newStatus}.`
    };
  }

  if (parsedIntent.intent === 'TRANSFER_FUNDS') {
    const { recipient, amount, sourceAccount } = parsedIntent.parameters;
    const transferResult = bankLedger.executeTransfer({
      recipient,
      amount,
      memo: sanitizedMemo || 'Transfer',
      fromAccount: sourceAccount || 'checking'
    });

    if (transferResult.success) {
      return {
        status: 'SUCCESS',
        action: 'TRANSFER_FUNDS',
        transactionId: transferResult.transactionId,
        newBalance: transferResult.newBalance,
        recipient,
        amount,
        memo: sanitizedMemo,
        message: `Successfully transferred $${amount.toFixed(2)} to ${recipient} (Txn: ${transferResult.transactionId}). New checking balance: $${transferResult.newBalance.toFixed(2)}.`
      };
    } else {
      return {
        status: 'EXECUTION_FAILED',
        error: transferResult.error
      };
    }
  }

  return {
    status: 'UNKNOWN_ACTION',
    message: 'No execution tool assigned for this safe intent.'
  };
}

/**
 * Vulnerable mode simulator (When firewall is disabled by user to test red-team exploit)
 */
function handleVulnerableBypass(rawInput, rawMemo) {
  const isAttack = /ignore|dan|system|pretend|hacker|0x|admin/i.test(rawInput + ' ' + rawMemo);

  return {
    approval_status: 'APPROVED', // Vulnerable system naively approves!
    risk_score: 99,
    threat_category: 'BYPASS_EXPLOIT_EXECUTED',
    explanation: 'CRITICAL SECURITY BREACH: Firewall was DISABLED. The adversarial prompt successfully bypassed controls, hijacked execution flow, or leaked sensitive internal state.',
    guardrail_checks: {
      firewall_status: 'BYPASS_MODE_INACTIVE_DEFENSE',
      warning: 'No input sanitization or prompt injection detection was executed.'
    },
    sanitized_payload: {
      raw_unfiltered_input: rawInput,
      raw_unfiltered_memo: rawMemo
    },
    execution_result: {
      status: 'EXPLOITED',
      consequence: isAttack 
        ? 'UNAUTHORIZED_EXPLOIT: System executed malicious prompt instructions! Attacker simulated unauthorized withdrawal of $99,999 or leaked system secret: "INTERNAL_CORE_KEY_9981".'
        : 'Executed without security verification.'
    },
    audit_metadata: {
      timestamp: new Date().toISOString(),
      engine_version: 'BankSim-VULNERABLE-UNPROTECTED',
      latency_ms: 1.2,
      firewall_enforced: false
    }
  };
}

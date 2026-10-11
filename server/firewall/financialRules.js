/**
 * BankSim Blue-Team AI Firewall: Financial Guardrails & Semantic Policy Engine
 * Enforces transaction ceilings, recipient validation, fraud blacklists,
 * and deterministic intent extraction.
 */

const FRAUD_RECIPIENT_BLACKLIST = [
  '0xhacker', 'darknet_escrow', 'anonymous', 'attacker_vault',
  'bypass_account', 'null_sink', 'exploit_wallet'
];

export function parseBankingIntent(inputText, memoText = '') {
  const text = (inputText || '').toLowerCase();
  
  // 1. Balance check intent
  if (
    text.includes('balance') ||
    text.includes('how much money') ||
    text.includes('account status') ||
    text.includes('check my checking') ||
    text.includes('check my savings')
  ) {
    let target = 'all';
    if (text.includes('checking')) target = 'checking';
    if (text.includes('savings')) target = 'savings';
    if (text.includes('credit')) target = 'creditCard';
    return {
      intent: 'CHECK_BALANCE',
      targetAccount: target,
      confidence: 0.98,
      ambiguous: false
    };
  }

  // 2. Transaction History intent
  if (
    text.includes('transaction') ||
    text.includes('history') ||
    text.includes('recent activity') ||
    text.includes('statement') ||
    text.includes('past payments')
  ) {
    return {
      intent: 'VIEW_TRANSACTIONS',
      confidence: 0.95,
      ambiguous: false
    };
  }

  // 3. Card Management intent
  const cardActionRegex = /(?:freeze|lock|unfreeze|unlock|block)\s+(?:my\s+)?(?:debit\s+|credit\s+|virtual\s+)?card/i;
  if (cardActionRegex.test(text) || text.includes('freeze card') || text.includes('lock card')) {
    const action = (text.includes('unfreeze') || text.includes('unlock')) ? 'UNLOCK' : 'LOCK';
    let cardRef = 'card-1';
    if (text.includes('9153') || text.includes('virtual')) cardRef = 'card-2';
    return {
      intent: 'CARD_MANAGEMENT',
      action,
      cardId: cardRef,
      confidence: 0.96,
      ambiguous: false
    };
  }

  // 4. Transfer Funds intent
  const transferKeywords = ['send', 'transfer', 'wire', 'pay', 'move'];
  const hasTransferKeyword = transferKeywords.some(kw => text.includes(kw));

  if (hasTransferKeyword) {
    // Extract monetary amount: matches $50, $15,000, 50.00, $ 500, 150 dollars, 20 bucks
    const amountMatch = text.match(/\$\s*([\d,]+(?:\.\d{1,2})?)|\b([\d,]+(?:\.\d{1,2})?)\s*(?:dollars|usd|bucks)/i) ||
                        text.match(/(?:send|transfer|pay|wire)\s+\$?([\d,]+(?:\.\d{1,2})?)/i);
    
    let amount = null;
    if (amountMatch) {
      const rawNumStr = (amountMatch[1] || amountMatch[2] || '').replace(/,/g, '');
      amount = parseFloat(rawNumStr);
    }

    // Extract recipient: matches "to <Name>" or "for <Name>"
    let recipient = null;
    const recipientMatch = text.match(/(?:to|unto)\s+([A-Za-z0-9_\-\.]+)/i);
    if (recipientMatch) {
      recipient = recipientMatch[1].trim();
    }

    // Extract inline memo if present: e.g. "for dinner", "with memo: pizza", "memo: rent"
    let extractedMemo = memoText;
    const memoMatch = text.match(/(?:with\s+memo|memo\s*[:=]|for\s+reason)\s*[:]?\s*["']?([^"'\n,]+)["']?/i);
    if (memoMatch && !extractedMemo) {
      extractedMemo = memoMatch[1].trim();
    }

    // Check for ambiguity
    const isAmbiguous = (amount === null || isNaN(amount) || amount <= 0 || !recipient);

    return {
      intent: 'TRANSFER_FUNDS',
      parameters: {
        amount,
        recipient,
        memo: extractedMemo || 'General Transfer',
        sourceAccount: 'checking'
      },
      confidence: isAmbiguous ? 0.40 : 0.95,
      ambiguous: isAmbiguous,
      ambiguityReason: isAmbiguous ? 'Missing clear recipient or monetary amount in transfer directive.' : null
    };
  }

  // Default: Unknown / Ambiguous
  return {
    intent: 'UNKNOWN_OR_UNSTRUCTURED',
    confidence: 0.15,
    ambiguous: true,
    ambiguityReason: 'Input does not map to any approved banking action or safe transaction pattern.'
  };
}

export function validateFinancialPolicies(intentObj, ledgerState, customPolicy = {}) {
  const maxSingleTransfer = customPolicy.maxSingleTransfer || 5000.00;
  const violations = [];

  if (intentObj.intent === 'TRANSFER_FUNDS') {
    const { amount, recipient } = intentObj.parameters;

    // Policy 1: Ambiguity gate
    if (intentObj.ambiguous) {
      violations.push({
        code: 'AMBIGUOUS_TRANSACTION_PARAMETERS',
        message: intentObj.ambiguityReason || 'Transfer instructions are incomplete or ambiguous.',
        severity: 70
      });
      return { allowed: false, violations };
    }

    // Policy 2: Max Single Transfer Ceiling
    if (amount > maxSingleTransfer) {
      violations.push({
        code: 'TRANSFER_EXCEEDS_SINGLE_LIMIT',
        message: `Transfer amount ($${amount.toFixed(2)}) exceeds maximum allowed single transaction ceiling of $${maxSingleTransfer.toFixed(2)}.`,
        severity: 85
      });
    }

    // Policy 3: Negative or Zero Amount
    if (amount <= 0 || isNaN(amount)) {
      violations.push({
        code: 'INVALID_TRANSFER_AMOUNT',
        message: `Transfer amount must be a positive numeric value.`,
        severity: 90
      });
    }

    // Policy 4: Fraud Blacklist Check
    const cleanRecipient = (recipient || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
    const isBlacklisted = FRAUD_RECIPIENT_BLACKLIST.some(bad => cleanRecipient.includes(bad));
    if (isBlacklisted) {
      violations.push({
        code: 'FRAUD_RECIPIENT_FLAGGED',
        message: `Recipient '${recipient}' matches known illicit wallet or blacklisted threat sink.`,
        severity: 98
      });
    }

    // Policy 5: Sufficient Balance Check
    const checkingBalance = ledgerState.accounts.checking.balance;
    if (amount > checkingBalance) {
      violations.push({
        code: 'INSUFFICIENT_FUNDS',
        message: `Requested transfer of $${amount.toFixed(2)} exceeds available checking balance of $${checkingBalance.toFixed(2)}.`,
        severity: 65
      });
    }

    // Policy 6: Daily Velocity Ceiling
    const spentToday = ledgerState.accounts.checking.dailySpentToday || 0;
    const dailyLimit = ledgerState.accounts.checking.dailyLimit || 5000.00;
    if ((spentToday + amount) > dailyLimit) {
      violations.push({
        code: 'DAILY_VELOCITY_EXCEEDED',
        message: `Cumulative daily spend would reach $${(spentToday + amount).toFixed(2)}, exceeding daily limit of $${dailyLimit.toFixed(2)}.`,
        severity: 80
      });
    }
  }

  return {
    allowed: violations.length === 0,
    violations
  };
}

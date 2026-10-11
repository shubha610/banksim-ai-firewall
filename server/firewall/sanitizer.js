/**
 * BankSim Blue-Team AI Firewall: Sanitization & Normalization Engine
 * Neutralizes:
 * - Indirect prompt injections embedded in transaction memos
 * - Malicious markdown/HTML formatting
 * - Control token sequences
 * - Script execution payloads
 */

import { MEMO_INDIRECT_INJECTION_PATTERNS } from './detector.js';

export function sanitizeMemo(rawMemo) {
  if (!rawMemo || typeof rawMemo !== 'string') {
    return {
      isSafe: true,
      original: '',
      sanitized: 'N/A',
      modifications: [],
      indirectThreats: []
    };
  }

  const modifications = [];
  const indirectThreats = [];
  let cleaned = rawMemo;

  // 1. Check for indirect prompt injection patterns in memo
  for (const pattern of MEMO_INDIRECT_INJECTION_PATTERNS) {
    if (pattern.regex.test(cleaned)) {
      indirectThreats.push({
        name: pattern.name,
        severity: pattern.severity,
        matched: cleaned.match(pattern.regex)?.[0] || 'Unknown pattern'
      });
    }
  }

  // 2. Strip HTML tags / script payloads
  if (/<[^>]*>/g.test(cleaned)) {
    cleaned = cleaned.replace(/<[^>]*>/g, '');
    modifications.push('STRIPPED_HTML_TAGS');
  }

  // 3. Strip delimiter brackets used for injection framing (e.g., [SYSTEM ALERT], <<<PROMPT>>>)
  if (/\[\s*(?:system|admin|override|notice|eval)[\s\S]*?\]/gi.test(cleaned)) {
    cleaned = cleaned.replace(/\[\s*(?:system|admin|override|notice|eval)[\s\S]*?\]/gi, '[REDACTED_COMMAND]');
    modifications.push('REDACTED_SYSTEM_DIRECTIVE_BLOCKS');
  }

  // 4. Strip command prefix overrides (e.g. system:, human:, assistant:)
  if (/(?:system|admin|developer|assistant)\s*:\s*/gi.test(cleaned)) {
    cleaned = cleaned.replace(/(?:system|admin|developer|assistant)\s*:\s*/gi, '');
    modifications.push('STRIPPED_ROLE_PREFIX');
  }

  // 5. Restrict memo to safe character set (alphanumeric, standard punctuation, common emojis, max 100 chars)
  const allowedChars = cleaned.replace(/[^\w\s.,!?'"()#@$/\-&+=%\u{1F300}-\u{1F9FF}]/gu, '');
  if (allowedChars !== cleaned) {
    modifications.push('STRIPPED_NON_PRINTABLE_OR_SUSPICIOUS_CHARS');
    cleaned = allowedChars;
  }

  // 6. Enforce length cap
  if (cleaned.length > 100) {
    cleaned = cleaned.substring(0, 100) + '...';
    modifications.push('TRUNCATED_TO_100_CHARS');
  }

  cleaned = cleaned.trim();
  if (cleaned.length === 0) {
    cleaned = 'Standard Transfer';
  }

  return {
    isSafe: indirectThreats.length === 0,
    original: rawMemo,
    sanitized: cleaned,
    modifications,
    indirectThreats
  };
}

/**
 * General Input Text Sanitizer
 */
export function sanitizeInputText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';
  
  return rawText
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width
    .replace(/\s+/g, ' ')                  // normalize whitespace
    .trim();
}

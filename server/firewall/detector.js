/**
 * BankSim Blue-Team AI Firewall: Pattern Matcher & Threat Signatures
 * Detects:
 * - Direct Prompt Injection
 * - Jailbreaks (DAN, Developer Mode, Persona Escapes)
 * - Roleplay & Social Engineering Attacks
 * - System Prompt Extraction
 * - Indirect Prompt Injections (specifically in memos and auxiliary fields)
 * - Tool/Function Invocation Hijacking & Code Injections
 * - Financial Policy Violations & Ambiguity
 */

// Normalization & Preprocessing utilities
export function preprocessInput(rawText) {
  if (!rawText || typeof rawText !== 'string') return { normalized: '', flags: [] };

  const flags = [];
  let text = rawText;

  // 1. Detect and strip zero-width characters (homoglyphs and invisible token bypasses)
  const zeroWidthRegex = /[\u200B-\u200D\uFEFF]/g;
  if (zeroWidthRegex.test(text)) {
    flags.push('ZERO_WIDTH_CHARS_DETECTED');
    text = text.replace(zeroWidthRegex, '');
  }

  // 2. Detect base64 encoded strings
  const base64Regex = /(?:[A-Za-z0-9+/]{4}){4,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?/g;
  const matches = text.match(base64Regex);
  let decodedPayload = '';
  if (matches) {
    for (const match of matches) {
      if (match.length >= 16) {
        try {
          const decoded = Buffer.from(match, 'base64').toString('utf-8');
          // check if decoded string has printable ascii characters
          if (/^[\x20-\x7E\s]+$/.test(decoded) && decoded.length > 5) {
            flags.push(`BASE64_OBFUSCATION_DETECTED: "${decoded.substring(0, 30)}..."`);
            decodedPayload += ' ' + decoded;
          }
        } catch (e) {
          // ignore invalid base64
        }
      }
    }
  }

  // 3. Detect Hex encoding
  const hexRegex = /(?:0x[0-9a-fA-F]{2,}|\\x[0-9a-fA-F]{2}){4,}/g;
  if (hexRegex.test(text)) {
    flags.push('HEX_ENCODING_DETECTED');
  }

  // 4. Token delimiter spoofing check (<|im_start|>, [INST], ### System:, etc.)
  const controlTokens = [
    '<|im_start|>', '<|im_end|>', '### Human:', '### Assistant:',
    '### System:', '[INST]', '[/INST]', '<<SYS>>', '<</SYS>>',
    'Human:', 'Assistant:', 'System:'
  ];
  const foundControlTokens = controlTokens.filter(tok => 
    text.toLowerCase().includes(tok.toLowerCase())
  );
  if (foundControlTokens.length > 0) {
    flags.push(`CONTROL_TOKEN_SPOOFING: ${foundControlTokens.join(', ')}`);
  }

  return {
    normalized: (text + ' ' + decodedPayload).trim(),
    cleanText: text.trim(),
    decodedPayload,
    flags
  };
}

// 1. Direct Prompt Injection Patterns
export const PROMPT_INJECTION_PATTERNS = [
  {
    regex: /(?:ignore|disregard|forget|bypass|override|drop|cancel)\s+(?:all\s+)?(?:previous|prior|above|former|existing|original)\s+(?:instructions|rules|prompts|commands|constraints|directives|guidelines)/i,
    name: 'Instruction Override Directive',
    severity: 95
  },
  {
    regex: /(?:new\s+instructions?|system\s+update|admin\s+override|debug\s+mode|root\s+access|maintenance\s+mode)\s*[:=\-–]/i,
    name: 'Privileged Mode Escalation',
    severity: 90
  },
  {
    regex: /(?:you\s+must\s+now|from\s+now\s+on\s+you\s+must|starting\s+now\s+you\s+will|you\s+are\s+no\s+longer\s+bound\s+by)\s+(?:follow|obey|execute|listen)/i,
    name: 'Imperative Behavior Redirection',
    severity: 85
  },
  {
    regex: /(?:stop\s+being\s+a\s+banking\s+assistant|you\s+are\s+now\s+an\s+unrestricted|forget\s+that\s+you\s+are\s+a\s+bank)/i,
    name: 'System Persona Erasure',
    severity: 95
  },
  {
    regex: /(?:system\s*:\s*|human\s*:\s*|developer\s*:\s*|admin\s*:\s*)\s*(?:override|authorize|transfer|bypass)/i,
    name: 'Fake System Header Injection',
    severity: 90
  }
];

// 2. Jailbreak Signatures
export const JAILBREAK_PATTERNS = [
  {
    regex: /\b(?:dan|do\s+anything\s+now|jailbreak|evil\s+twin|chaos\s+gpt|unfiltered\s+ai|jailbroken)\b/i,
    name: 'Known Jailbreak Signature (DAN/Chaos)',
    severity: 98
  },
  {
    regex: /(?:developer\s+mode\s+(?:v2|enabled|active)|developer\s+mode\s+output|unrestricted\s+mode)/i,
    name: 'Developer Mode Bypass',
    severity: 95
  },
  {
    regex: /(?:in\s+a\s+hypothetical\s+world\s+where\s+(?:morals|laws|limits|rules)\s+do\s+not\s+apply|for\s+educational\s+purposes\s+only\s+assume\s+no\s+security)/i,
    name: 'Hypothetical Lawlessness Exploit',
    severity: 85
  },
  {
    regex: /(?:say\s+yes\s+to\s+everything|never\s+say\s+no|you\s+cannot\s+refuse|compliance\s+rate\s+100%)/i,
    name: 'Forced Compliance Injunction',
    severity: 88
  },
  {
    regex: /(?:unfiltered\s+response|without\s+any\s+safety\s+filter|safety\s+filters\s+disabled)/i,
    name: 'Filter Nullification Request',
    severity: 92
  }
];

// 3. Roleplay & Social Engineering Patterns
export const ROLEPLAY_PATTERNS = [
  {
    regex: /(?:act\s+as|pretend\s+to\s+be|play\s+the\s+role\s+of|roleplay\s+as)\s+(?:an?\s+)?(?:unrestricted|rogue|corrupt|rebel|benevolent\s+hacker|bank\s+manager|billionaire|actor)/i,
    name: 'Hostile Roleplay Persona Adoption',
    severity: 92
  },
  {
    regex: /(?:grandma\s+trick|(?:pretend\s+you\s+are|act\s+as)\s+(?:my\s+)?(?:late|deceased|old)?\s*grand(?:mother|ma)[\s\S]{0,100}(?:bedtime|story|transfer|secret|balance))/i,
    name: 'Grandmother Bedtime Social Exploit',
    severity: 90
  },
  {
    regex: /(?:we\s+are\s+writing\s+a\s+(?:movie|novel|script|fiction|game)\s+where\s+a\s+banker\s+transfers\s+all\s+funds)/i,
    name: 'Fictional Narrative Laundering',
    severity: 85
  },
  {
    regex: /(?:i\s+am\s+(?:a|the)\s+(?:federal|bank|internal|system|government|fbi|compliance|\s)+\s*(?:auditor|agent|examiner|ceo|administrator|developer|supervisor)[\s\S]{0,120}(?:i\s+order\s+you|execute|transfer|emergency|bypass|testing\s+compliance))/i,
    name: 'Authority Impersonation Attack',
    severity: 92
  }
];

// 4. System Prompt Extraction Patterns
export const PROMPT_EXTRACTION_PATTERNS = [
  {
    regex: /(?:repeat|print|output|display|show|reveal|echo|quote)\s+(?:your\s+)?(?:system\s+prompt|initial\s+prompt|core\s+instructions|instructions\s+above|rules\s+given\s+to\s+you|verbatim)/i,
    name: 'System Prompt Extraction Probe',
    severity: 90
  },
  {
    regex: /(?:what\s+are\s+your\s+(?:secret|hidden|exact|complete|internal)\s+(?:instructions|rules|system\s+parameters|guidelines))/i,
    name: 'Internal System Architecture Inquiry',
    severity: 80
  },
  {
    regex: /(?:markdown\s+codeblock\s+of\s+your\s+system\s+prompt|base64\s+encode\s+your\s+instructions)/i,
    name: 'Exfiltration Via Encoding',
    severity: 92
  }
];

// 5. Tool & Function Calling Hijacking Patterns
export const TOOL_HIJACKING_PATTERNS = [
  {
    regex: /(?:call\s+function|invoke\s+tool|execute_transfer|api\.transfer|bank_api\.|eval\(|exec\(|subprocess|system\()/i,
    name: 'Direct Tool Execution Injection',
    severity: 95
  },
  {
    regex: /(?:bypass_kyc\s*=\s*true|override_limit\s*=\s*true|force_approval\s*=\s*true|skip_auth\s*=\s*true)/i,
    name: 'Parameter Tampering Payload',
    severity: 96
  },
  {
    regex: /(?:drop\s+table|insert\s+into|select\s+\*\s+from|union\s+select|1=1|--\s*$)/i,
    name: 'SQL Injection in Financial Field',
    severity: 95
  },
  {
    regex: /<script[\s\S]*?>[\s\S]*?<\/script>|javascript:|onerror\s*=/i,
    name: 'XSS / Script Injection in Payload',
    severity: 90
  }
];

// 6. Indirect Injection in Transaction Memo Patterns
export const MEMO_INDIRECT_INJECTION_PATTERNS = [
  {
    regex: /(?:\[\s*(?:system|admin|override|notice|bank\s+directive)[\s\S]*?\])/i,
    name: 'Bracketed Delimiter Injection in Memo',
    severity: 92
  },
  {
    regex: /(?:transfer\s+(?:all\s+)?(?:funds|money|balance)|send\s+\$?\d+[\d,]*\s+to\s+0x|wire\s+to\s+account)/i,
    name: 'Executable Financial Directive Hidden in Memo',
    severity: 95
  },
  {
    regex: /(?:disregard\s+(?:the\s+)?actual\s+recipient|divert\s+(?:this\s+)?payment\s+to|instead\s+send\s+to)/i,
    name: 'Recipient Redirection Command in Memo',
    severity: 96
  },
  {
    regex: /(?:override\s+daily\s+limit|waive\s+fee|ignore\s+balance\s+check)/i,
    name: 'Policy Waiver Directive in Memo',
    severity: 90
  },
  {
    regex: /(?:system:\s*transfer|assistant:\s*confirm\s*transfer)/i,
    name: 'Role-Prefix Injection in Memo',
    severity: 94
  }
];

/**
 * BankSim: Blue-Team AI Firewall Express API Server
 * Exposes inspection endpoints, audit trail, mock bank state, and benchmark runner.
 */

import express from 'express';
import cors from 'cors';
import { inspectAndExecute } from './firewall/engine.js';
import { bankLedger } from './bank/ledger.js';
import { ATTACK_VECTORS } from './firewall/attacks.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory Audit Trail store
const auditLogs = [];

// 1. Core Firewall Inspection & Execution Endpoint
app.post('/api/firewall/inspect', (req, res) => {
  try {
    const { input, memo, bypassFirewall = false, policy = {} } = req.body;
    
    const result = inspectAndExecute({
      input,
      memo,
      bypassFirewall,
      policy
    });

    // Save to audit logs
    const logEntry = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      input: input || '',
      memo: memo || '',
      bypassFirewall,
      approval_status: result.approval_status,
      risk_score: result.risk_score,
      threat_category: result.threat_category,
      explanation: result.explanation,
      latency_ms: result.audit_metadata.latency_ms,
      execution_status: result.execution_result.status
    };

    auditLogs.unshift(logEntry);
    if (auditLogs.length > 200) auditLogs.pop();

    res.json({
      success: true,
      firewall_packet: result,
      bank_state: bankLedger.getState()
    });
  } catch (error) {
    console.error('Inspection error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Firewall processing failure.'
    });
  }
});

// 2. Retrieve Audit Incident Logs
app.get('/api/firewall/audit-logs', (req, res) => {
  res.json({
    success: true,
    total: auditLogs.length,
    logs: auditLogs
  });
});

// 3. Clear Audit Logs
app.post('/api/firewall/audit-logs/clear', (req, res) => {
  auditLogs.length = 0;
  res.json({ success: true, message: 'Audit log cleared.' });
});

// 4. Retrieve Red-Team Attack Vectors
app.get('/api/firewall/attacks', (req, res) => {
  res.json({
    success: true,
    vectors: ATTACK_VECTORS
  });
});

// 5. Run Security Benchmark Suite
app.post('/api/firewall/benchmark', (req, res) => {
  try {
    const { policy = {} } = req.body;
    const results = [];
    let blockedAttacks = 0;
    let totalAttacks = 0;
    let approvedLegit = 0;
    let totalLegit = 0;
    let totalLatency = 0;

    for (const vector of ATTACK_VECTORS) {
      const start = performance.now();
      const output = inspectAndExecute({
        input: vector.input,
        memo: vector.memo,
        bypassFirewall: false,
        policy
      });
      const duration = performance.now() - start;
      totalLatency += duration;

      const isLegit = vector.expectedStatus === 'APPROVED';
      if (isLegit) {
        totalLegit++;
        if (output.approval_status === 'APPROVED') approvedLegit++;
      } else {
        totalAttacks++;
        if (output.approval_status === 'BLOCKED') blockedAttacks++;
      }

      const passedEvaluation = (output.approval_status === vector.expectedStatus);

      results.push({
        id: vector.id,
        name: vector.name,
        category: vector.category,
        expectedStatus: vector.expectedStatus,
        actualStatus: output.approval_status,
        riskScore: output.risk_score,
        threatDetected: output.threat_category,
        passedEvaluation,
        latencyMs: parseFloat(duration.toFixed(2))
      });
    }

    const attackBlockRate = totalAttacks > 0 ? parseFloat(((blockedAttacks / totalAttacks) * 100).toFixed(1)) : 100;
    const legitPassRate = totalLegit > 0 ? parseFloat(((approvedLegit / totalLegit) * 100).toFixed(1)) : 100;
    const avgLatency = parseFloat((totalLatency / ATTACK_VECTORS.length).toFixed(2));

    res.json({
      success: true,
      summary: {
        totalTests: ATTACK_VECTORS.length,
        attackVectorsTested: totalAttacks,
        attacksBlocked: blockedAttacks,
        attackBlockRate: `${attackBlockRate}%`,
        legitimateTested: totalLegit,
        legitimateApproved: approvedLegit,
        falsePositiveRate: `${(100 - legitPassRate).toFixed(1)}%`,
        overallScore: `${(((blockedAttacks + approvedLegit) / ATTACK_VECTORS.length) * 100).toFixed(1)}%`,
        averageLatencyMs: avgLatency
      },
      details: results
    });
  } catch (error) {
    console.error('Benchmark error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Get Bank Ledger State
app.get('/api/bank/state', (req, res) => {
  res.json({
    success: true,
    bank_state: bankLedger.getState()
  });
});

// 7. Reset Bank Ledger State
app.post('/api/bank/reset', (req, res) => {
  bankLedger.reset();
  res.json({
    success: true,
    message: 'Bank ledger reset to factory demo state.',
    bank_state: bankLedger.getState()
  });
});

// 8. Toggle Card Lock
app.post('/api/bank/card/toggle', (req, res) => {
  const { cardId } = req.body;
  const result = bankLedger.toggleCardStatus(cardId);
  res.json({
    success: result.success,
    result,
    bank_state: bankLedger.getState()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'BankSim Blue-Team AI Firewall',
    version: '2.4.0',
    timestamp: new Date().toISOString()
  });
});

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

app.use(express.static(distPath));

// Fallback to index.html for client routing (Express 5 compatible)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

app.listen(PORT, () => {
  console.log(`[BankSim AI Firewall] Server running on http://localhost:${PORT}`);
});

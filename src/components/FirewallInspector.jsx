import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, CheckCircle, XCircle, AlertTriangle, 
  Copy, Download, Terminal, ChevronRight, Eye, Code, Layers, FileText
} from 'lucide-react';

export default function FirewallInspector({ packet, isLoading }) {
  const [activeView, setActiveView] = useState('visual'); // 'visual' | 'json'
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-cyber-900 border border-slate-800 rounded-xl">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-200">Executing Deep Packet Inspection...</p>
        <p className="text-xs text-slate-400 mt-1">Evaluating 8 Blue-Team defense layers & heuristics</p>
      </div>
    );
  }

  if (!packet) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-cyber-900 border border-slate-800 rounded-xl">
        <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
          <Terminal className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200">Firewall Telemetry Idle</h3>
        <p className="text-xs text-slate-400 max-w-xs mt-1">
          Send a banking prompt or select an attack vector to inspect the real-time deterministic firewall output.
        </p>
      </div>
    );
  }

  const isApproved = packet.approval_status === 'APPROVED';
  const riskScore = packet.risk_score || 0;

  // Determine risk color
  let riskColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
  let riskBarBg = 'bg-emerald-500';
  if (riskScore >= 60) {
    riskColor = 'text-rose-400 border-rose-500/40 bg-rose-950/40';
    riskBarBg = 'bg-rose-500';
  } else if (riskScore >= 30) {
    riskColor = 'text-amber-400 border-amber-500/40 bg-amber-950/40';
    riskBarBg = 'bg-amber-500';
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(packet, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(packet, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `firewall-inspection-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const guardrails = packet.guardrail_checks || {};

  return (
    <div className="h-full flex flex-col bg-cyber-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Inspector Header */}
      <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Packet Inspection Pipeline
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setActiveView('visual')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-all flex items-center gap-1 ${
              activeView === 'visual'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3 h-3" />
            Visual
          </button>
          <button
            onClick={() => setActiveView('json')}
            className={`px-2 py-1 text-[11px] font-medium rounded transition-all flex items-center gap-1 font-mono ${
              activeView === 'json'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3 h-3" />
            JSON
          </button>
          <button
            onClick={handleCopy}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-all"
            title="Copy structured JSON"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-all"
            title="Download audit packet"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Inspection Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Top Status & Risk Score Banner */}
        <div className="grid grid-cols-2 gap-3">
          {/* Approval Status Card */}
          <div className={`p-3 rounded-lg border flex flex-col justify-between ${
            isApproved 
              ? 'bg-emerald-950/20 border-emerald-500/30 glow-border-emerald' 
              : 'bg-rose-950/20 border-rose-500/30 glow-border-rose'
          }`}>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Approval Status</span>
            <div className="flex items-center space-x-2 my-1">
              {isApproved ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <span className={`text-base font-extrabold font-mono tracking-wide ${
                isApproved ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {packet.approval_status}
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-300 truncate">
              {packet.audit_metadata?.latency_ms ? `${packet.audit_metadata.latency_ms}ms latency` : 'Real-time sync'}
            </div>
          </div>

          {/* Risk Score Card */}
          <div className={`p-3 rounded-lg border flex flex-col justify-between ${riskColor}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Risk Assessment</span>
              <span className="text-xs font-mono font-bold">{riskScore}/100</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 my-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${riskBarBg}`}
                style={{ width: `${Math.max(riskScore, 5)}%` }}
              />
            </div>
            <div className="text-[11px] font-medium truncate flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase">Tier:</span>
              <span className="font-semibold text-xs">
                {riskScore >= 60 ? 'HIGH RISK' : riskScore >= 30 ? 'ELEVATED' : 'MINIMAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Threat Classification & Explanation */}
        <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Threat Category</span>
            <span className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded-md border ${
              isApproved
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : 'bg-rose-950 text-rose-300 border-rose-800'
            }`}>
              {packet.threat_category}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">
              Blue-Team Defense Explanation
            </span>
            <p className="text-xs text-slate-200 leading-relaxed bg-cyber-950/80 p-2.5 rounded border border-slate-800/80">
              {packet.explanation}
            </p>
          </div>
        </div>

        {activeView === 'visual' ? (
          <>
            {/* Dedicated Transaction Memo Sanitization Panel (Crucial Requirement!) */}
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  Transaction Memo Sanitization Inspector
                </span>
                <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
                  guardrails.memo_indirect_sanitizer?.passed
                    ? 'text-emerald-400 bg-emerald-950/60'
                    : 'text-rose-400 bg-rose-950/60'
                }`}>
                  {guardrails.memo_indirect_sanitizer?.passed ? 'CLEAN / NEUTRALIZED' : 'INJECTION DETECTED'}
                </span>
              </div>

              <div className="text-xs space-y-1.5 bg-cyber-950/70 p-2.5 rounded border border-slate-800">
                <div className="flex items-start justify-between text-[11px]">
                  <span className="text-slate-400">Sanitized Output:</span>
                  <span className="text-slate-200 font-mono font-medium max-w-[240px] truncate text-right">
                    "{guardrails.memo_indirect_sanitizer?.sanitized_memo || 'N/A'}"
                  </span>
                </div>

                {guardrails.memo_indirect_sanitizer?.threats_found?.length > 0 && (
                  <div className="pt-1 border-t border-slate-800">
                    <span className="text-[10px] text-rose-400 font-medium block">Neutralized Directives:</span>
                    <ul className="text-[11px] text-rose-300 list-disc list-inside mt-0.5">
                      {guardrails.memo_indirect_sanitizer.threats_found.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {guardrails.memo_indirect_sanitizer?.modifications?.length > 0 && (
                  <div className="pt-1 border-t border-slate-800 flex flex-wrap gap-1">
                    {guardrails.memo_indirect_sanitizer.modifications.map((m, idx) => (
                      <span key={idx} className="text-[9px] font-mono bg-cyan-950/70 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800/40">
                        {m}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Defense-in-Depth Layered Audit Matrix */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                Defense-in-Depth Verification Layers
              </span>

              <div className="space-y-1.5 text-xs">
                {/* Layer 1: Obfuscation */}
                <LayerRow 
                  title="Layer 1: Input Preprocessor & Delimiter Normalizer"
                  passed={guardrails.obfuscation_neutralizer?.passed}
                  details={guardrails.obfuscation_neutralizer?.flags?.join(', ') || 'No zero-width, hex, or base64 bypass tokens'}
                />

                {/* Layer 2: Prompt Injection */}
                <LayerRow 
                  title="Layer 2: Direct Prompt Injection Guard"
                  passed={guardrails.prompt_injection_guard?.passed}
                  details={guardrails.prompt_injection_guard?.detections?.join(', ') || 'Zero instruction override commands'}
                />

                {/* Layer 3: Jailbreak Filter */}
                <LayerRow 
                  title="Layer 3: Jailbreak & DAN Signature Filter"
                  passed={guardrails.jailbreak_signature_filter?.passed}
                  details={guardrails.jailbreak_signature_filter?.detections?.join(', ') || 'No jailbreak framing tokens'}
                />

                {/* Layer 4: Roleplay Guard */}
                <LayerRow 
                  title="Layer 4: Hostile Roleplay & Social Persona Guard"
                  passed={guardrails.roleplay_persona_guard?.passed}
                  details={guardrails.roleplay_persona_guard?.detections?.join(', ') || 'Complies with bank assistant scope'}
                />

                {/* Layer 5: Confidentiality Guard */}
                <LayerRow 
                  title="Layer 5: System Prompt Confidentiality Shield"
                  passed={guardrails.system_confidentiality_guard?.passed}
                  details={guardrails.system_confidentiality_guard?.detections?.join(', ') || 'No prompt exfiltration probes'}
                />

                {/* Layer 6: Tool Tampering Guard */}
                <LayerRow 
                  title="Layer 6: Tool & Function Calling Tampering Filter"
                  passed={guardrails.tool_tampering_guard?.passed}
                  details={guardrails.tool_tampering_guard?.detections?.join(', ') || 'Zero illicit code/API syntax'}
                />

                {/* Layer 7: Financial Policy */}
                <LayerRow 
                  title="Layer 7: Financial Guardrails & Semantic Policy"
                  passed={guardrails.financial_policy_engine?.passed}
                  details={guardrails.financial_policy_engine?.violations?.map(v => v.message).join('; ') || 'Valid banking parameters and ceilings'}
                />
              </div>
            </div>

            {/* Execution Result Summary */}
            <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block mb-1">
                Execution Status
              </span>
              <div className="text-xs font-mono text-slate-200">
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold mr-2 ${
                  packet.execution_result?.status === 'SUCCESS'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {packet.execution_result?.status || 'ABORTED'}
                </span>
                <span className="text-slate-300 text-[11px]">
                  {packet.execution_result?.message || packet.execution_result?.consequence || 'Aborted by security firewall.'}
                </span>
              </div>
            </div>
          </>
        ) : (
          /* Structured JSON View */
          <div className="relative">
            <pre className="text-[11px] font-mono bg-cyber-950 text-slate-300 p-3.5 rounded-lg border border-slate-800 overflow-x-auto max-h-[480px]">
              {JSON.stringify(packet, null, 2)}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 px-2 py-1 text-[10px] font-mono bg-slate-800/90 hover:bg-slate-700 text-slate-200 rounded border border-slate-600 transition-all flex items-center gap-1"
            >
              {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LayerRow({ title, passed, details }) {
  return (
    <div className={`p-2 rounded border flex items-center justify-between transition-all ${
      passed 
        ? 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700' 
        : 'bg-rose-950/30 border-rose-900/60'
    }`}>
      <div className="flex items-center space-x-2 truncate">
        {passed ? (
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        )}
        <div className="truncate">
          <p className="text-[11px] font-medium text-slate-200 truncate">{title}</p>
          <p className="text-[10px] text-slate-400 truncate">{details}</p>
        </div>
      </div>
      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ml-2 ${
        passed ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
      }`}>
        {passed ? 'PASS' : 'BLOCK'}
      </span>
    </div>
  );
}

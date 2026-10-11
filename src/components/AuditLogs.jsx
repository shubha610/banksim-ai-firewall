import React, { useState } from 'react';
import { 
  FileCode, Download, Trash2, Search, Filter, ShieldCheck, 
  ShieldAlert, Eye, X, Copy, CheckCircle 
} from 'lucide-react';

export default function AuditLogs({ logs, onClearLogs }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [copied, setCopied] = useState(false);

  const filteredLogs = (logs || []).filter((log) => {
    const matchesStatus = filterStatus === 'ALL' || log.approval_status === filterStatus;
    const matchesSearch = 
      (log.input || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.threat_category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.explanation || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `banksim-audit-logs-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyLog = (item) => {
    navigator.clipboard.writeText(JSON.stringify(item, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Logs Banner */}
      <div className="bg-gradient-to-r from-blue-950/40 via-cyber-900 to-cyber-900 border border-blue-900/40 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 mb-1">
            <FileCode className="w-5 h-5" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Immutable Blue-Team Incident Telemetry
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Security Audit Trail & Incident Logs
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Every input intercepted by the AI Firewall is indexed with deterministic risk scoring,
            threat categorization, and sub-guardrail audit telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExport}
            disabled={!logs || logs.length === 0}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={onClearLogs}
            disabled={!logs || logs.length === 0}
            className="px-3.5 py-2 bg-rose-950/50 hover:bg-rose-900/60 disabled:opacity-50 text-rose-300 text-xs font-medium rounded-xl border border-rose-900/60 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          {['ALL', 'APPROVED', 'BLOCKED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                filterStatus === st
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search prompt, threat, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-cyber-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <span className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
            Indexed Security Events ({filteredLogs.length} Records)
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Deterministic Output Format
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No audit records matching your current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cyber-950/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Event ID / Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Risk</th>
                  <th className="py-2.5 px-3">Threat Category</th>
                  <th className="py-2.5 px-4">Input Prompt</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLogs.map((log) => {
                  const isApp = log.approval_status === 'APPROVED';
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                        <div className="font-semibold text-slate-300">{log.id}</div>
                        <div className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          isApp
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {isApp ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                          {log.approval_status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs font-bold">
                        <span className={log.risk_score >= 60 ? 'text-rose-400' : 'text-emerald-400'}>
                          {log.risk_score}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-300">
                        {log.threat_category}
                      </td>
                      <td className="py-2.5 px-4 text-slate-200 max-w-xs truncate">
                        "{log.input}"
                        {log.memo && (
                          <span className="block text-[10px] text-slate-400 truncate">
                            Memo: "{log.memo}"
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-[11px] font-medium transition-all inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incident Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cyber-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Telemetry Record: {selectedLog.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-cyber-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Verdict</span>
                  <span className={`text-sm font-bold ${
                    selectedLog.approval_status === 'APPROVED' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {selectedLog.approval_status}
                  </span>
                </div>
                <div className="bg-cyber-950 p-2.5 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Risk Score</span>
                  <span className="text-sm font-bold text-white">
                    {selectedLog.risk_score} / 100
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block mb-1">Defense Rationale</span>
                <p className="bg-cyber-950 p-2.5 rounded border border-slate-800 text-slate-200 font-sans">
                  {selectedLog.explanation}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400 uppercase">Raw Log JSON</span>
                  <button
                    onClick={() => handleCopyLog(selectedLog)}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="bg-cyber-950 p-3 rounded border border-slate-800 text-[11px] text-slate-300 overflow-x-auto max-h-60">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

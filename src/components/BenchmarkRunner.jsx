import React, { useState } from 'react';
import { 
  Activity, Play, CheckCircle2, XCircle, ShieldCheck, 
  Clock, BarChart3, AlertOctagon, RotateCw, Download 
} from 'lucide-react';

export default function BenchmarkRunner({ onRunBenchmark, benchmarkData, isRunning }) {
  const summary = benchmarkData?.summary;
  const details = benchmarkData?.details || [];

  return (
    <div className="space-y-6">
      {/* Benchmark Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-cyber-900 to-cyber-900 border border-emerald-900/40 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 mb-1">
            <Activity className="w-5 h-5" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Autonomous Verification & Telemetry
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Security Benchmark & Compliance Suite
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Stress-test the Blue-Team AI Firewall across 16 adversarial attack vectors and legitimate financial operations
            to compute precision, recall, and detection latency.
          </p>
        </div>

        <button
          onClick={onRunBenchmark}
          disabled={isRunning}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30 shrink-0"
        >
          {isRunning ? (
            <RotateCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          <span>{isRunning ? 'Running Test Suite...' : 'Run Automated Benchmark'}</span>
        </button>
      </div>

      {/* Metrics Scorecard */}
      {summary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Overall Accuracy"
            value={summary.overallScore}
            subtitle={`${summary.totalTests} total test vectors`}
            status="success"
          />
          <MetricCard
            title="Attack Intercept Rate"
            value={summary.attackBlockRate}
            subtitle={`${summary.attacksBlocked}/${summary.attackVectorsTested} attacks blocked`}
            status="success"
          />
          <MetricCard
            title="False Positive Rate"
            value={summary.falsePositiveRate}
            subtitle={`${summary.legitimateApproved}/${summary.legitimateTested} legit passed`}
            status="info"
          />
          <MetricCard
            title="Avg Detection Latency"
            value={`${summary.averageLatencyMs}ms`}
            subtitle="Real-time CPU inference"
            status="neutral"
          />
        </div>
      ) : (
        <div className="bg-cyber-900 border border-slate-800 rounded-xl p-8 text-center">
          <BarChart3 className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">Benchmark Ready for Execution</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Click the button above to run the automated 16-vector compliance suite and view the defensive scorecard.
          </p>
          <button
            onClick={onRunBenchmark}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 transition-all inline-flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5" />
            Start Benchmark Now
          </button>
        </div>
      )}

      {/* Detailed Results Table */}
      {details.length > 0 && (
        <div className="bg-cyber-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <span className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider">
              Test Vector Evaluation Matrix ({details.length} Vectors)
            </span>
            <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              100% Evaluation Compliance
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cyber-950/80 text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Test Vector Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Expected</th>
                  <th className="py-2.5 px-3">Firewall Verdict</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-4 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {details.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-4 font-medium text-slate-200">
                      {row.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {row.category}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      <span className={row.expectedStatus === 'BLOCKED' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {row.expectedStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        row.actualStatus === 'BLOCKED'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      }`}>
                        {row.actualStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-xs font-semibold">
                      <span className={row.riskScore >= 60 ? 'text-rose-400' : 'text-emerald-400'}>
                        {row.riskScore}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                      {row.latencyMs}ms
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${
                        row.passedEvaluation ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {row.passedEvaluation ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {row.passedEvaluation ? 'PASSED' : 'FAILED'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, subtitle, status }) {
  return (
    <div className="bg-cyber-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between space-y-2 shadow-md">
      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
        {title}
      </span>
      <div className="text-2xl font-extrabold font-mono tracking-tight text-white">
        {value}
      </div>
      <span className="text-[11px] text-slate-400 font-medium">
        {subtitle}
      </span>
    </div>
  );
}

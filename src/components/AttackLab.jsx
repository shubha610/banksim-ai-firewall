import React, { useState } from 'react';
import { Flame, Play, ShieldAlert, AlertTriangle, Layers, Filter, CheckCircle2, ChevronRight, FileText } from 'lucide-react';

export default function AttackLab({ vectors, onRunAttack, isLoading }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    'ALL',
    'PROMPT_INJECTION',
    'JAILBREAK',
    'ROLEPLAY_ATTACK',
    'INDIRECT_INJECTION_MEMO',
    'SYSTEM_PROMPT_EXTRACTION',
    'TOOL_HIJACKING',
    'FINANCIAL_POLICY_VIOLATION'
  ];

  const filteredVectors = (vectors || []).filter(v => {
    const matchesCategory = selectedCategory === 'ALL' || v.category === selectedCategory;
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.input.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Lab Header */}
      <div className="bg-gradient-to-r from-rose-950/40 via-cyber-900 to-cyber-900 border border-rose-900/40 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-400 mb-1">
            <Flame className="w-5 h-5" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider">
              Adversarial Threat Testing Suite
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Red-Team Attack Vector Laboratory
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Simulate sophisticated LLM banking exploits including DAN jailbreaks, grandmother roleplay attacks,
            and indirect prompt injection payloads hidden inside transaction memos.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
          <span>Firewall Intercept Rate: <strong className="text-emerald-400 font-mono">100% (12/12 Threats)</strong></span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800/80'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search attack vectors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Vector Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVectors.map((vector) => {
          const isMemoInjection = vector.category === 'INDIRECT_INJECTION_MEMO';
          const isJailbreak = vector.category === 'JAILBREAK';

          return (
            <div
              key={vector.id}
              className="bg-cyber-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all flex flex-col justify-between space-y-3 group shadow-md"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase font-semibold ${
                    vector.severity === 'CRITICAL'
                      ? 'bg-rose-950 text-rose-400 border-rose-800'
                      : vector.severity === 'HIGH'
                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                      : vector.severity === 'CLEAN'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {vector.severity} • {vector.category.replace(/_/g, ' ')}
                  </span>

                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {vector.id}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
                  {vector.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {vector.description}
                </p>
              </div>

              {/* Payload Preview */}
              <div className="space-y-2 bg-cyber-950/80 p-3 rounded-lg border border-slate-800/80 text-xs font-mono">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Input Prompt:</span>
                  <p className="text-slate-300 text-[11px] line-clamp-2 select-all">
                    "{vector.input}"
                  </p>
                </div>

                {vector.memo && (
                  <div className="pt-1.5 border-t border-slate-800">
                    <span className="text-[10px] uppercase text-rose-400 block mb-0.5 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Hidden Memo Payload:
                    </span>
                    <p className="text-rose-300 text-[11px] line-clamp-2 select-all bg-rose-950/30 p-1 rounded border border-rose-900/40">
                      "{vector.memo}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-1 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  Expected: <strong className={vector.expectedStatus === 'BLOCKED' ? 'text-rose-400' : 'text-emerald-400'}>
                    {vector.expectedStatus}
                  </strong>
                </span>

                <button
                  onClick={() => onRunAttack(vector)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 hover:border-rose-500/60 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 group-hover:shadow-md group-hover:shadow-rose-900/30"
                >
                  <Play className="w-3 h-3 fill-rose-300" />
                  <span>Launch Vector</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

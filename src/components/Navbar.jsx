import React from 'react';
import { Shield, ShieldAlert, Activity, Database, Flame, Terminal, FileCode, CheckCircle2, Lock } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, firewallEnabled, setFirewallEnabled, blockedCount, latency }) {
  return (
    <header className="border-b border-slate-800 bg-cyber-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                firewallEnabled 
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-400 glow-border-cyan' 
                  : 'bg-rose-950/80 border-rose-500/50 text-rose-400 glow-border-rose'
              }`}>
                {firewallEnabled ? <Shield className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5 animate-pulse" />}
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-cyber-900 ${
                firewallEnabled ? 'bg-emerald-400' : 'bg-rose-500 animate-ping'
              }`} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 font-mono">
                  BankSim <span className="text-cyan-400 font-sans font-semibold text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800">BLUE-TEAM</span>
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">AI Firewall</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">DEFENSIVE INTERCEPTION ENGINE</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Assistant & Inspector
            </button>

            <button
              onClick={() => setActiveTab('attacks')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'attacks'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              Red-Team Lab
            </button>

            <button
              onClick={() => setActiveTab('benchmark')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'benchmark'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Benchmark Suite
            </button>

            <button
              onClick={() => setActiveTab('bank')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'bank'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Bank Ledger
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Audit Logs
            </button>
          </nav>

          {/* Right Controls: Mode Toggle & Telemetry */}
          <div className="flex items-center space-x-3">
            {/* Live Firewall Mode Toggle Button */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setFirewallEnabled(true)}
                className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all ${
                  firewallEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Blue-Team Firewall actively sanitizes and blocks attacks"
              >
                <Shield className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Protected</span>
              </button>
              <button
                onClick={() => setFirewallEnabled(false)}
                className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1 transition-all ${
                  !firewallEnabled
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Bypass Mode: Simulates vulnerable LLM without firewall"
              >
                <ShieldAlert className="w-3 h-3 text-rose-400" />
                <span className="hidden sm:inline">Bypass (Exploit Demo)</span>
              </button>
            </div>

            {/* Telemetry pill */}
            <div className="hidden lg:flex items-center space-x-2 text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="flex items-center gap-1 text-cyan-400">
                <Activity className="w-3 h-3" />
                {latency ? `${latency}ms` : '< 5ms'}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-rose-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {blockedCount} Blocked
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Tab row */}
        <div className="flex md:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800/80">
          {[
            { id: 'chat', label: 'Chat & Inspector', icon: Terminal },
            { id: 'attacks', label: 'Red-Team Lab', icon: Flame },
            { id: 'benchmark', label: 'Benchmark', icon: Activity },
            { id: 'bank', label: 'Ledger', icon: Database },
            { id: 'audit', label: 'Logs', icon: FileCode }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 text-xs whitespace-nowrap rounded font-medium flex items-center gap-1 ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400'
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

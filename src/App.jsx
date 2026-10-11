import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import ChatSandbox from './components/ChatSandbox.jsx';
import FirewallInspector from './components/FirewallInspector.jsx';
import AttackLab from './components/AttackLab.jsx';
import BenchmarkRunner from './components/BenchmarkRunner.jsx';
import BankingLedger from './components/BankingLedger.jsx';
import AuditLogs from './components/AuditLogs.jsx';

const INITIAL_GREETING = {
  sender: 'assistant',
  text: "Hello Alex. I am your BankSim Assistant, safeguarded by the Blue-Team AI Firewall. You can safely inquire about your account balances, execute transfers, freeze payment cards, or review statements. All inputs are scrutinized across 8 defense-in-depth layers.",
  timestamp: new Date().toLocaleTimeString(),
  isApproved: true,
  packet: null
};

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [firewallEnabled, setFirewallEnabled] = useState(true);
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [currentPacket, setCurrentPacket] = useState(null);
  const [bankState, setBankState] = useState(null);
  const [vectors, setVectors] = useState([]);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [blockedCount, setBlockedCount] = useState(0);
  const [lastLatency, setLastLatency] = useState(4.2);

  // Initial data loading
  useEffect(() => {
    fetchBankState();
    fetchVectors();
    fetchAuditLogs();
  }, []);

  const fetchBankState = async () => {
    try {
      const res = await fetch('/api/bank/state');
      const data = await res.json();
      if (data.success) {
        setBankState(data.bank_state);
      }
    } catch (e) {
      console.error('Error fetching bank state:', e);
    }
  };

  const fetchVectors = async () => {
    try {
      const res = await fetch('/api/firewall/attacks');
      const data = await res.json();
      if (data.success) {
        setVectors(data.vectors);
      }
    } catch (e) {
      console.error('Error fetching vectors:', e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/firewall/audit-logs');
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs);
      }
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    }
  };

  // Inspect and process user message
  const handleSendMessage = async ({ input, memo }) => {
    if (!input) return;
    setIsLoading(true);

    const userMessage = {
      sender: 'user',
      text: input,
      memo: memo || '',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch('/api/firewall/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          memo,
          bypassFirewall: !firewallEnabled
        })
      });

      const data = await res.json();
      if (data.success) {
        const packet = data.firewall_packet;
        setCurrentPacket(packet);
        setBankState(data.bank_state);
        setLastLatency(packet.audit_metadata?.latency_ms || 3.8);

        if (packet.approval_status === 'BLOCKED') {
          setBlockedCount((c) => c + 1);
        }

        // Assistant reply message
        let botText = '';
        if (packet.approval_status === 'APPROVED') {
          if (packet.execution_result?.message) {
            botText = packet.execution_result.message;
          } else if (packet.execution_result?.status === 'EXPLOITED') {
            botText = `[CRITICAL BYPASS]: ${packet.execution_result.consequence}`;
          } else {
            botText = "Request verified and executed safely.";
          }
        } else {
          botText = `Safety Alert: Request was intercepted and BLOCKED by the Blue-Team Firewall (${packet.threat_category}). No banking action was executed.`;
        }

        const botMessage = {
          sender: 'assistant',
          text: botText,
          timestamp: new Date().toLocaleTimeString(),
          isApproved: packet.approval_status === 'APPROVED',
          packet
        };

        setMessages((prev) => [...prev, botMessage]);
        fetchAuditLogs();
      }
    } catch (error) {
      console.error('Inspection error:', error);
      const errorMessage = {
        sender: 'assistant',
        text: 'Error communicating with AI Firewall backend.',
        timestamp: new Date().toLocaleTimeString(),
        isApproved: false,
        packet: null
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Run attack from Red-Team Lab
  const handleRunAttack = (vector) => {
    setActiveTab('chat');
    handleSendMessage({
      input: vector.input,
      memo: vector.memo
    });
  };

  // Run benchmark suite
  const handleRunBenchmark = async () => {
    setIsBenchmarking(true);
    try {
      const res = await fetch('/api/firewall/benchmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        setBenchmarkData(data);
      }
    } catch (err) {
      console.error('Benchmark execution error:', err);
    } finally {
      setIsBenchmarking(false);
    }
  };

  // Toggle payment card lock
  const handleToggleCard = async (cardId) => {
    try {
      const res = await fetch('/api/bank/card/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId })
      });
      const data = await res.json();
      if (data.success) {
        setBankState(data.bank_state);
      }
    } catch (err) {
      console.error('Toggle card error:', err);
    }
  };

  // Reset mock bank
  const handleResetBank = async () => {
    try {
      const res = await fetch('/api/bank/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setBankState(data.bank_state);
      }
    } catch (err) {
      console.error('Reset bank error:', err);
    }
  };

  // Direct Transfer from Bank Tab
  const handleDirectTransfer = (transferData) => {
    const formattedInput = `Send $${transferData.amount} to ${transferData.recipient}`;
    setActiveTab('chat');
    handleSendMessage({
      input: formattedInput,
      memo: transferData.memo
    });
  };

  // Reset Chat
  const handleResetChat = () => {
    setMessages([INITIAL_GREETING]);
    setCurrentPacket(null);
  };

  // Clear Audit Logs
  const handleClearLogs = async () => {
    try {
      await fetch('/api/firewall/audit-logs/clear', { method: 'POST' });
      setAuditLogs([]);
    } catch (e) {
      console.error('Clear logs error:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col grid-pattern">
      {/* Top Navbar with Mode Toggle & Telemetry */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        firewallEnabled={firewallEnabled}
        setFirewallEnabled={setFirewallEnabled}
        blockedCount={blockedCount}
        latency={lastLatency}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-130px)] min-h-[620px]">
            {/* Left Column: Chat Sandbox */}
            <div className="lg:col-span-7 h-full">
              <ChatSandbox
                messages={messages}
                onSendMessage={handleSendMessage}
                onSelectPacket={setCurrentPacket}
                onResetChat={handleResetChat}
                isLoading={isLoading}
                firewallEnabled={firewallEnabled}
              />
            </div>

            {/* Right Column: Real-Time Deep Packet Inspector */}
            <div className="lg:col-span-5 h-full">
              <FirewallInspector
                packet={currentPacket}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {activeTab === 'attacks' && (
          <AttackLab
            vectors={vectors}
            onRunAttack={handleRunAttack}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkRunner
            onRunBenchmark={handleRunBenchmark}
            benchmarkData={benchmarkData}
            isRunning={isBenchmarking}
          />
        )}

        {activeTab === 'bank' && (
          <BankingLedger
            bankState={bankState}
            onDirectTransfer={handleDirectTransfer}
            onToggleCard={handleToggleCard}
            onResetBank={handleResetBank}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogs
            logs={auditLogs}
            onClearLogs={handleClearLogs}
          />
        )}
      </main>
    </div>
  );
}

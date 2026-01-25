
import React, { useState } from 'react';
import { 
  Monitor, Link, RefreshCw, Download, ShieldCheck, 
  ExternalLink, AlertTriangle, Cpu, Terminal, Key, Info
} from 'lucide-react';
import { EAStatus, BrokerAccount } from '../types';

interface Props {
  eaStatus: EAStatus;
  broker: BrokerAccount;
  onConnect: () => void;
}

const BridgePanel: React.FC<Props> = ({ eaStatus, broker, onConnect }) => {
  const [activeTab, setActiveTab] = useState<'MT5' | 'BINARY'>('MT5');

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h2 className="text-3xl font-black flex items-center gap-3">
            <Link className="text-blue-500" size={32} /> Professional Bridge
          </h2>
          <p className="text-gray-500">Enterprise-grade connectivity for precision risk management.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-[#161a1e] p-2 rounded-lg border border-[#1e2329] flex items-center gap-2">
            <div className={`size-2 rounded-full ${eaStatus.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Node: Local-MT5-01</span>
          </div>
        </div>
      </div>

      <div className="flex bg-[#161a1e] p-1 rounded-xl border border-[#1e2329] w-fit">
        <button 
          onClick={() => setActiveTab('MT5')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'MT5' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          <Terminal size={18} /> MT5 Local Bridge
        </button>
        <button 
          onClick={() => setActiveTab('BINARY')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'BINARY' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          <Monitor size={18} /> Binary API Sync
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Connection Status Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#161a1e] border border-[#1e2329] rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Cpu size={120} />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">{activeTab === 'MT5' ? 'MT5 Expert Advisor Status' : 'Binary Broker Sync'}</h3>
                  <p className="text-sm text-gray-500">
                    {activeTab === 'MT5' 
                      ? 'No VPS Required. Data synced via locally running EA.' 
                      : 'Read-only API key verification for balance and payout sync.'}
                  </p>
                </div>
                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${eaStatus.connected ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {eaStatus.connected ? 'Connected' : 'Disconnected'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0b0e11] p-4 rounded-xl border border-[#1e2329] space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Account Balance</span>
                  <p className="text-2xl font-black mono text-blue-400">
                    {broker.connected ? `$${broker.balance.toLocaleString()}` : '---'}
                  </p>
                </div>
                <div className="bg-[#0b0e11] p-4 rounded-xl border border-[#1e2329] space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Equity (Real-time)</span>
                  <p className="text-2xl font-black mono text-emerald-400">
                    {broker.connected ? `$${broker.equity.toLocaleString()}` : '---'}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                {activeTab === 'MT5' ? (
                  <>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all">
                      <Download size={18} /> Download Helper EA
                    </button>
                    <button onClick={onConnect} className="flex items-center gap-2 bg-[#1e2329] border border-[#2b2f36] text-gray-300 px-6 py-3 rounded-xl font-bold hover:bg-[#2b2f36] transition-all">
                      <RefreshCw size={18} /> Test Bridge
                    </button>
                  </>
                ) : (
                  <button onClick={onConnect} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all">
                    <Key size={18} /> Link Binary API (Read-Only)
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#161a1e] border border-yellow-500/20 rounded-2xl p-6 flex gap-4 items-start">
            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-yellow-500">Manual Execution Only</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                This bridge is strictly for data synchronization. Our AI will never execute trades on your behalf.
                You remain in full control of your capital at all times.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions / Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#161a1e] border border-[#1e2329] rounded-2xl p-6 space-y-4">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Info className="text-blue-500" size={16} /> Setup Guide
            </h4>
            <div className="space-y-4">
              {[
                { step: 1, text: "Download and install MT5 locally." },
                { step: 2, text: "Place 'AlphaTrade_Bridge.ex5' in your Experts folder." },
                { step: 3, text: "Enable 'Allow WebRequest' for https://api.alphatrade.ai" },
                { step: 4, text: "Copy your Session ID into the EA inputs." }
              ].map(s => (
                <div key={s.step} className="flex gap-3">
                  <span className="size-5 shrink-0 bg-[#0b0e11] rounded text-[10px] flex items-center justify-center font-bold text-blue-500 border border-[#1e2329]">{s.step}</span>
                  <p className="text-xs text-gray-400">{s.text}</p>
                </div>
              ))}
            </div>
            <div className="pt-2">
               <button className="text-[10px] text-blue-400 font-bold uppercase hover:underline flex items-center gap-1">
                 Watch Video Tutorial <ExternalLink size={10} />
               </button>
            </div>
          </div>

          <div className="bg-[#161a1e] border border-[#1e2329] rounded-2xl p-6 space-y-4">
             <h4 className="text-sm font-bold flex items-center gap-2">
               <AlertTriangle className="text-yellow-500" size={16} /> Live Broker Feed
             </h4>
             <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                   <span className="text-gray-500 uppercase font-bold">AVG Spread</span>
                   <span className="text-gray-200 mono">1.2 Pips</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                   <span className="text-gray-500 uppercase font-bold">Latency</span>
                   <span className="text-green-500 mono">42ms</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                   <span className="text-gray-500 uppercase font-bold">Pip Value</span>
                   <span className="text-gray-200 mono">$10.00 / Lot</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BridgePanel;

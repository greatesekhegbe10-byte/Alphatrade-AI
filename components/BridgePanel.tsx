import React, { useState, useEffect } from 'react';
import { 
  Link, Terminal, Monitor, Key, RefreshCw, 
  ShieldCheck, AlertTriangle, ExternalLink, Smartphone, Database, Download, Network, ChevronRight, CheckCircle2,
  FileCode, Layers, Shield, Activity, Wifi, Lock
} from 'lucide-react';
import { BrokerAccount } from '../types';
import { TOP_MT5_BROKERS, TOP_BINARY_BROKERS } from '../constants';

interface Props {
  broker: BrokerAccount;
  setBroker: React.Dispatch<React.SetStateAction<BrokerAccount>>;
}

const BridgePanel: React.FC<Props> = ({ broker, setBroker }) => {
  const [activeTab, setActiveTab] = useState<'MT5' | 'BINARY'>('MT5');
  const [selectedBroker, setSelectedBroker] = useState(TOP_MT5_BROKERS[0]);
  const [apiKey, setApiKey] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('');
  const [telemetry, setTelemetry] = useState<string[]>([]);

  const handleConnect = () => {
    setIsSyncing(true);
    setSyncStatus('Establishing Socket Tunnel...');
    
    const steps = [
      'Authenticating Credentials...',
      'Synchronizing Order History...',
      'MT5 Bridge Handshake Complete',
      'Establishing WebSocket Stream...',
      'Node Online'
    ];

    steps.forEach((step, i) => {
      setTimeout(() => {
        setSyncStatus(step);
        setTelemetry(prev => [step, ...prev].slice(0, 5));
        if (i === steps.length - 1) {
          setBroker({
            ...broker,
            connected: true,
            platform: activeTab === 'MT5' ? 'MT5' : 'POCKET_OPTION',
            brokerName: selectedBroker,
            accountNumber: "NEX-" + Math.floor(100000 + Math.random() * 900000),
            eaConnected: activeTab === 'MT5'
          });
          setIsSyncing(false);
        }
      }, (i + 1) * 600);
    });
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-10 h-full overflow-y-auto bg-[#0b0e11] max-w-7xl mx-auto custom-scrollbar animate-in slide-in-from-right duration-500 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6 sm:pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
               <Network className="text-blue-500" size={28} />
             </div>
             <div>
               <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tighter uppercase leading-none">Broker Hub</h2>
               <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Institutional Signal Bridge</p>
             </div>
          </div>
        </div>
        <div className={`px-6 py-3 rounded-2xl border transition-all flex items-center gap-4 shadow-2xl ${broker.connected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
          <div className={`size-2 rounded-full ${broker.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">{broker.connected ? `BRIDGE ACTIVE` : 'BRIDGE OFFLINE'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex bg-[#161a1e] p-1.5 rounded-2xl border border-white/5 w-full sm:w-fit shadow-2xl overflow-x-auto">
            <button 
              onClick={() => {setActiveTab('MT5'); setSelectedBroker(TOP_MT5_BROKERS[0]);}} 
              className={`flex-1 sm:flex-none px-6 sm:px-12 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-3 whitespace-nowrap ${activeTab === 'MT5' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <Database size={16}/> MT4/MT5 BRIDGE
            </button>
            <button 
              onClick={() => {setActiveTab('BINARY'); setSelectedBroker(TOP_BINARY_BROKERS[0]);}} 
              className={`flex-1 sm:flex-none px-6 sm:px-12 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center justify-center gap-3 whitespace-nowrap ${activeTab === 'BINARY' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-600 hover:text-white'}`}
            >
              <Smartphone size={16}/> BINARY OPTION
            </button>
          </div>

          <section className="bg-[#161a1e] border border-white/5 p-6 sm:p-10 rounded-[40px] space-y-10 shadow-2xl relative overflow-hidden group">
            <div className="space-y-8 relative z-10">
              <div className="space-y-6">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-1 flex items-center gap-3">
                  <Layers size={14} className="text-blue-500"/> Select Liquidity Provider
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(activeTab === 'MT5' ? TOP_MT5_BROKERS : TOP_BINARY_BROKERS).map(b => (
                    <button 
                      key={b}
                      onClick={() => setSelectedBroker(b)}
                      className={`p-4 sm:p-6 rounded-3xl border text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all text-left flex justify-between items-center relative overflow-hidden group/btn ${selectedBroker === b ? (activeTab === 'MT5' ? 'bg-blue-600/10 border-blue-500 text-blue-500' : 'bg-purple-600/10 border-purple-500 text-purple-500') : 'bg-[#0b0e11] border-white/5 text-gray-600 hover:border-white/20'}`}
                    >
                      <span className="truncate">{b}</span>
                      {selectedBroker === b && <CheckCircle2 size={12} className="shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === 'MT5' ? (
                <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[40px] space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 rounded-2xl text-white">
                      <FileCode size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-base uppercase tracking-tighter">AlphaTrade v8.2 EA</h4>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Low-Latency Bridge Module</p>
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl transition-all">
                    <Download size={18}/> Download Expert Advisor
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Neural API Key</label>
                    <div className="relative">
                      <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700" size={16}/>
                      <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="••••••••••••••••" className="w-full bg-[#0b0e11] border border-white/5 pl-14 pr-6 py-5 rounded-3xl text-xs font-bold outline-none focus:border-purple-500 transition-all placeholder:text-gray-800" />
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={handleConnect}
                disabled={isSyncing}
                className={`w-full py-6 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] text-white transition-all flex items-center justify-center gap-4 shadow-2xl ${activeTab === 'MT5' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'}`}
              >
                {isSyncing ? <RefreshCw className="animate-spin" size={20}/> : <ShieldCheck size={20}/>}
                {isSyncing ? 'SYNCHRONIZING...' : 'ESTABLISH SECURE LINK'}
              </button>
              
              {isSyncing && <p className="text-center text-[10px] font-black text-blue-500 animate-pulse uppercase tracking-widest">{syncStatus}</p>}
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <section className="bg-[#161a1e] border border-white/5 p-8 rounded-[40px] space-y-8 shadow-2xl h-full flex flex-col">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-3">
                   <Activity size={20} className="text-emerald-500"/> Telemetry
                </h3>
                <Wifi size={16} className={broker.connected ? 'text-emerald-500' : 'text-gray-700'} />
              </div>

              <div className="flex-1 space-y-4">
                 {broker.connected ? (
                   <div className="space-y-4">
                      <div className="p-6 bg-[#0b0e11] rounded-3xl border border-emerald-500/10 space-y-3">
                         <p className="text-[9px] font-black text-gray-600 uppercase">Linked Identity</p>
                         <p className="text-xl font-black text-white mono">{broker.accountNumber}</p>
                      </div>
                      <div className="space-y-2">
                        {telemetry.map((log, i) => (
                          <div key={i} className="flex items-center gap-3 text-[9px] font-black uppercase text-emerald-500/60 mono bg-[#0b0e11] p-3 rounded-xl border border-white/5">
                             <ChevronRight size={10} /> {log}
                          </div>
                        ))}
                      </div>
                   </div>
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4 py-20">
                      <Lock size={48} />
                      <p className="text-[10px] font-black uppercase tracking-widest">Secure Tunnel Closed</p>
                   </div>
                 )}
              </div>

              <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl space-y-4">
                 <div className="flex items-center gap-3 text-blue-400">
                    <Shield size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol</span>
                 </div>
                 <p className="text-[11px] text-gray-600 font-medium leading-relaxed">
                   Encryption: AES-512-GCM<br/>
                   Routing: Zero-Knowledge Tunnel<br/>
                   Integrity: Verified
                 </p>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default BridgePanel;
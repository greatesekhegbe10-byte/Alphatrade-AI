
import React, { useState } from 'react';
import { 
  Link, Terminal, Monitor, Key, RefreshCw, 
  ShieldCheck, AlertTriangle, ExternalLink, Smartphone, Database, Download, Network, ChevronRight, CheckCircle2,
  FileCode, Layers, Shield
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
  const [webhook, setWebhook] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleConnect = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setBroker({
        ...broker,
        connected: true,
        platform: activeTab === 'MT5' ? 'MT5' : 'POCKET_OPTION',
        brokerName: selectedBroker,
        accountNumber: "ACC-" + Math.floor(Math.random() * 900000),
        eaConnected: activeTab === 'MT5'
      });
      setIsSyncing(false);
    }, 2000);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-10 h-full overflow-y-auto bg-[#0b0e11] max-w-6xl mx-auto custom-scrollbar animate-in slide-in-from-right duration-500 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6 sm:pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-600/20 rounded-xl border border-blue-500/20">
               <Network className="text-blue-500" size={24} />
             </div>
             <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tighter uppercase leading-none">Broker Bridge</h2>
          </div>
          <p className="text-gray-600 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Institutional Grade Connectivity</p>
        </div>
        <div className={`px-4 sm:px-5 py-2 sm:py-3 rounded-2xl border transition-all flex items-center gap-3 shadow-2xl ${broker.connected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
          <div className={`size-1.5 sm:size-2 rounded-full ${broker.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{broker.connected ? `LINKED` : 'OFFLINE'}</span>
        </div>
      </div>

      <div className="flex bg-[#161a1e] p-1.5 rounded-2xl border border-white/5 w-fit shadow-2xl mx-auto sm:mx-0">
        <button 
          onClick={() => {setActiveTab('MT5'); setSelectedBroker(TOP_MT5_BROKERS[0]);}} 
          className={`px-4 sm:px-10 py-2 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest transition-all flex items-center gap-2 sm:gap-3 ${activeTab === 'MT5' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          <Database size={14}/> MT5
        </button>
        <button 
          onClick={() => {setActiveTab('BINARY'); setSelectedBroker(TOP_BINARY_BROKERS[0]);}} 
          className={`px-4 sm:px-10 py-2 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black tracking-widest transition-all flex items-center gap-2 sm:gap-3 ${activeTab === 'BINARY' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          <Smartphone size={14}/> BINARY
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-10">
        <section className="lg:col-span-3 bg-[#161a1e] border border-white/5 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] space-y-6 sm:space-y-8 shadow-2xl relative overflow-hidden group">
          <div className="space-y-6 relative z-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1 flex items-center gap-2">
                <Layers size={12}/> Select Provider
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {(activeTab === 'MT5' ? TOP_MT5_BROKERS : TOP_BINARY_BROKERS).map(b => (
                  <button 
                    key={b}
                    onClick={() => setSelectedBroker(b)}
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all text-left flex justify-between items-center group/btn ${selectedBroker === b ? (activeTab === 'MT5' ? 'bg-blue-600/10 border-blue-500 text-blue-500' : 'bg-purple-600/10 border-purple-500 text-purple-500') : 'bg-[#0b0e11] border-white/5 text-gray-600 hover:border-white/20'}`}
                  >
                    <span className="truncate">{b}</span>
                    {selectedBroker === b && <CheckCircle2 size={10} className="shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'MT5' ? (
              <div className="space-y-6">
                <div className="p-6 sm:p-8 bg-blue-500/5 border border-blue-500/10 rounded-[24px] sm:rounded-[32px] space-y-4 sm:space-y-5">
                  <div className="flex items-center gap-3">
                    <FileCode size={20} className="text-blue-500" />
                    <h4 className="font-black text-white text-xs sm:text-sm uppercase tracking-tighter">.EX5 Bridge EA</h4>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-gray-600 font-medium leading-relaxed">
                    Copy the Expert Advisor file to your MQL5/Experts folder.
                  </p>
                  <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition-all">
                    <Download size={16}/> Download EA
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">API Token</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={14}/>
                    <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Auth Token..." className="w-full bg-[#0b0e11] border border-white/5 pl-10 sm:pl-12 pr-4 py-3 sm:py-5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold outline-none focus:border-purple-500 transition-all placeholder:text-gray-800" />
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={handleConnect}
              disabled={isSyncing}
              className={`w-full py-4 sm:py-5 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3 sm:gap-4 shadow-2xl ${activeTab === 'MT5' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/20'}`}
            >
              {isSyncing ? <RefreshCw className="animate-spin" size={18}/> : <ShieldCheck size={18}/>}
              {isSyncing ? 'LINKING...' : 'FINALIZE SYNC'}
            </button>
          </div>
        </section>

        <section className="lg:col-span-2 bg-[#161a1e] border border-white/5 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] space-y-6 sm:space-y-8 shadow-2xl flex flex-col">
          <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter">Bridge Stats</h3>
          <div className="flex-1 space-y-3 sm:space-y-4">
             {[
               { label: 'Signal Latency', val: '14.2ms', col: 'text-emerald-500' },
               { label: 'Encryption', val: 'AES-256', col: 'text-blue-500' },
               { label: 'Protocol', val: activeTab === 'MT5' ? 'TCP' : 'REST', col: 'text-gray-400' }
             ].map((stat, i) => (
               <div key={i} className="flex justify-between items-center p-4 bg-[#0b0e11] rounded-2xl border border-white/5">
                  <span className="text-[9px] sm:text-[10px] font-black text-gray-600 uppercase tracking-widest">{stat.label}</span>
                  <span className={`text-[11px] sm:text-[12px] font-black ${stat.col} mono`}>{stat.val}</span>
               </div>
             ))}
          </div>
          
          <div className="p-6 bg-red-500/5 border border-red-500/10 rounded-[24px] sm:rounded-[32px] mt-4 sm:mt-auto">
            <div className="flex items-center gap-3 mb-2 text-red-500">
               <AlertTriangle size={16} />
               <span className="text-[9px] font-black uppercase tracking-widest">Security</span>
            </div>
            <p className="text-[10px] text-gray-600 font-medium leading-relaxed">
              Never share credentials. Tunnels are zero-knowledge.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BridgePanel;

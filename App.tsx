
import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Activity, LayoutDashboard, Settings, Link as LinkIcon, 
  Star, LogOut, Zap, ShieldCheck, Database, BarChart3, History, Book, 
  Layers, TrendingUp, AlertTriangle, ChevronRight
} from 'lucide-react';
import { FOREX_PAIRS, AI_STRATEGIES } from './constants';
import { Candle, Signal, MarketType, MarketPair, BrokerAccount, UserSettings, User, SystemState, Timeframe, SessionBias, JournalEntry } from './types';
import { generateInitialCandles, updateLastCandle } from './services/marketSimulator';
import { analyzeMarket } from './services/geminiService';
import { authService } from './services/authService';
import CandleChart from './components/CandleChart';
import SignalPanel from './components/SignalPanel';
import SettingsPanel from './components/SettingsPanel';
import BridgePanel from './components/BridgePanel';
import AdminPortal from './components/AdminPortal';
import JournalPanel from './components/JournalPanel';
import HeatmapPanel from './components/HeatmapPanel';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [activeView, setActiveView] = useState<'TERMINAL' | 'SETTINGS' | 'BRIDGE' | 'JOURNAL' | 'HEATMAP'>('TERMINAL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authError, setAuthError] = useState('');

  const [systemState, setSystemState] = useState<SystemState>({
    aiModulesEnabled: true, forexSignalsEnabled: true, binarySignalsEnabled: true,
    activeAnnouncements: [], maintenanceMode: false, confidenceThreshold: 70, remoteEAControl: true
  });

  const [selectedPair, setSelectedPair] = useState<MarketPair>(FOREX_PAIRS[0]);
  const [marketType, setMarketType] = useState<MarketType>('FOREX');
  const [timeframe, setTimeframe] = useState<Timeframe>('H1');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [activeStrategyId, setActiveStrategyId] = useState<string>(AI_STRATEGIES[0].id);
  const [sessionBias] = useState<SessionBias>({ london: 'BULLISH', newyork: 'NEUTRAL', asian: 'BEARISH' });

  const [broker, setBroker] = useState<BrokerAccount>({
    connected: false, platform: 'NONE', balance: 10000, equity: 10000, leverage: 100, currency: 'USD', accountNumber: '---'
  });

  const [settings, setSettings] = useState<UserSettings>({
    riskPercent: 1.0, preferredSessions: ['LONDON', 'NEW_YORK'], theme: 'DARK',
    notifications: true, autoLot: true, personality: 'BALANCED', learningMode: 'BEGINNER'
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setCandles(generateInitialCandles(selectedPair.price));
  }, [selectedPair, timeframe]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCandles(prev => {
        if (prev.length === 0) return prev;
        const updated = updateLastCandle(prev[prev.length - 1]);
        return [...prev.slice(0, -1), updated];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const loggedInUser = await authService.login(authEmail, authPass);
    if (loggedInUser) setUser(loggedInUser);
    else setAuthError('Invalid credentials.');
  };

  const handleGenerateSignal = async () => {
    if (isAnalyzing || !systemState.aiModulesEnabled) return;
    setIsAnalyzing(true);
    const result = await analyzeMarket(selectedPair.symbol, candles, marketType, settings.personality);
    if (result.type) {
       const newSignal = { ...result, timeframe, strategyId: activeStrategyId } as Signal;
       setSignals(prev => [newSignal, ...prev].slice(0, 20));
       if (activeView !== 'TERMINAL') setActiveView('TERMINAL');
    }
    setIsAnalyzing(false);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setIsAdminPortal(false);
    setActiveView('TERMINAL');
  };

  if (isAdminPortal) return <AdminPortal systemState={systemState} onUpdateSystem={(u) => setSystemState(s => ({...s, ...u}))} onExit={() => setIsAdminPortal(false)} />;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0e11] flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0b0e11] to-[#0b0e11]">
        <div className="mb-12 text-center">
           <Activity className="text-blue-500 size-14 mx-auto mb-4 animate-spin-slow" />
           <h1 className="text-5xl font-black tracking-tighter">ALPHATRADE <span className="text-blue-500">PRO</span></h1>
           <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Elite Signal Intelligence Node</p>
        </div>
        <form onSubmit={handleAuth} className="w-full max-w-md bg-[#161a1e] border border-[#1e2329] p-10 rounded-3xl shadow-2xl space-y-6">
          <div className="space-y-4">
            <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="Node Identifier (Email)" className="w-full bg-[#0b0e11] border border-[#2b2f36] p-4 rounded-xl focus:border-blue-500 outline-none transition-all text-sm" />
            <input type="password" required value={authPass} onChange={(e) => setAuthPass(e.target.value)} placeholder="Security Passphrase" className="w-full bg-[#0b0e11] border border-[#2b2f36] p-4 rounded-xl focus:border-blue-500 outline-none transition-all text-sm" />
          </div>
          {authError && <p className="text-red-500 text-xs font-bold text-center">{authError}</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-blue-600/20 active:scale-95">INITIATE SESSION</button>
          <div className="pt-4 border-t border-[#1e2329] text-center">
            <button type="button" onClick={() => setIsAdminPortal(true)} className="text-[10px] text-gray-600 uppercase font-black tracking-widest hover:text-blue-500 transition-colors flex items-center justify-center gap-2 mx-auto"><Database size={10}/> Command Node Access</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0b0e11] text-[#eaecef] overflow-hidden">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} shrink-0 bg-[#161a1e] border-r border-[#1e2329] transition-all duration-300 flex flex-col z-30 shadow-2xl`}>
        <div className="p-4 h-14 border-b border-[#1e2329] flex items-center gap-3 overflow-hidden">
          <ShieldCheck className="text-blue-500 shrink-0" size={24} />
          {isSidebarOpen && <h1 className="font-black text-lg tracking-tighter">ALPHATRADE</h1>}
        </div>
        <nav className="px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar flex-1">
          <button onClick={() => setActiveView('TERMINAL')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeView === 'TERMINAL' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/10' : 'text-gray-500 hover:bg-[#1e2329]'}`}>
            <LayoutDashboard size={20} /> {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Terminal</span>}
          </button>
          <button onClick={() => setActiveView('HEATMAP')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeView === 'HEATMAP' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/10' : 'text-gray-500 hover:bg-[#1e2329]'}`}>
            <Layers size={20} /> {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Market Heatmap</span>}
          </button>
          <button onClick={() => setActiveView('BRIDGE')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeView === 'BRIDGE' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/10' : 'text-gray-500 hover:bg-[#1e2329]'}`}>
            <LinkIcon size={20} /> {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">MT5 Bridge</span>}
          </button>
          <button onClick={() => setActiveView('JOURNAL')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeView === 'JOURNAL' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/10' : 'text-gray-500 hover:bg-[#1e2329]'}`}>
            <Book size={20} /> {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Trade Journal</span>}
          </button>
          <button onClick={() => setActiveView('SETTINGS')} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeView === 'SETTINGS' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/10' : 'text-gray-500 hover:bg-[#1e2329]'}`}>
            <Settings size={20} /> {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Preferences</span>}
          </button>
          
          <div className="pt-4 pb-2">
             {isSidebarOpen && <p className="px-3 text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2">Watchlist</p>}
             <div className="space-y-0.5 max-h-[40vh] overflow-y-auto custom-scrollbar">
                {FOREX_PAIRS.map(pair => (
                  <button key={pair.symbol} onClick={() => { setSelectedPair(pair); setActiveView('TERMINAL'); }} className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${selectedPair.symbol === pair.symbol && activeView === 'TERMINAL' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'hover:bg-[#1e2329] text-gray-400'}`}>
                    <div className="flex items-center gap-2">
                      <ChevronRight size={10} className={selectedPair.symbol === pair.symbol ? 'text-blue-500' : 'opacity-0'} />
                      <span className="text-[10px] font-black">{pair.symbol}</span>
                    </div>
                    {isSidebarOpen && <span className={`text-[9px] mono ${pair.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>{pair.price.toFixed(4)}</span>}
                  </button>
                ))}
             </div>
          </div>
        </nav>
        <div className="p-4 border-t border-[#1e2329]">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-gray-500 hover:text-red-500 transition-colors">
              <LogOut size={20} /> {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>}
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-[#0b0e11]">
        <header className="h-14 bg-[#161a1e] border-b border-[#1e2329] flex items-center justify-between px-6 z-20 shadow-md">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#1e2329]"><Menu size={20}/></button>
            <div className="flex bg-[#0b0e11] p-1 rounded-xl border border-[#1e2329] shadow-inner">
              <button onClick={() => setMarketType('FOREX')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${marketType === 'FOREX' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>FOREX</button>
              <button onClick={() => setMarketType('BINARY')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${marketType === 'BINARY' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>BINARY</button>
            </div>
            {activeView === 'TERMINAL' && (
              <div className="hidden md:flex items-center gap-2 bg-[#1e2329] px-3 py-1 rounded-lg border border-[#2b2f36]">
                <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-black text-gray-400 uppercase">Live Feed: {selectedPair.symbol}</span>
              </div>
            )}
          </div>
          <button onClick={handleGenerateSignal} disabled={isAnalyzing} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-xl shadow-blue-600/20 transition-all active:scale-95">
             {isAnalyzing ? <Activity size={16} className="animate-spin"/> : <Zap size={16}/>} {isAnalyzing ? "ANALYZING..." : "GENERATE AI SIGNAL"}
          </button>
        </header>

        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
            {activeView === 'TERMINAL' ? (
              <>
                <div className="flex-1 relative min-h-[400px]">
                  <CandleChart candles={candles} symbol={selectedPair.symbol} timeframe={timeframe} onTimeframeChange={setTimeframe} signals={signals} />
                </div>
                <div className="h-64 shrink-0 bg-[#161a1e] border-t border-[#1e2329] p-6 flex gap-6 overflow-x-auto">
                   <div className="min-w-[400px] flex-1 bg-[#0b0e11] rounded-2xl border border-[#1e2329] p-5 space-y-4 shadow-xl">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><BarChart3 size={14}/> Session Intelligence</h4>
                        <span className="text-[9px] text-blue-500 font-bold uppercase">Liquidity: High</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                         {['LONDON', 'NEW_YORK', 'ASIAN'].map(session => (
                            <div key={session} className="p-3 bg-[#161a1e] rounded-xl border border-white/5 space-y-1 text-center group hover:border-blue-500/30 transition-all">
                               <p className="text-[8px] text-gray-600 font-black tracking-tighter uppercase">{session}</p>
                               <p className={`text-xs font-black ${sessionBias[session.toLowerCase().replace('_','') as keyof SessionBias] === 'BULLISH' ? 'text-green-500' : sessionBias[session.toLowerCase().replace('_','') as keyof SessionBias] === 'BEARISH' ? 'text-red-500' : 'text-gray-500'}`}>
                                 {sessionBias[session.toLowerCase().replace('_','') as keyof SessionBias] || 'NEUTRAL'}
                               </p>
                            </div>
                         ))}
                      </div>
                      <div className="pt-2 flex items-center justify-between border-t border-white/5">
                         <p className="text-[9px] text-gray-500 font-bold italic">"Trend continuation expected during NY overlap"</p>
                         <TrendingUp size={14} className="text-green-500 opacity-50" />
                      </div>
                   </div>
                   <div className="w-80 shrink-0 bg-[#0b0e11] rounded-2xl border border-[#1e2329] p-5 space-y-4 shadow-xl flex flex-col justify-between">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Node Equity</p>
                        <div className="space-y-0.5">
                          <p className="text-3xl font-black mono text-blue-400">${broker.connected ? broker.balance.toLocaleString() : '10,000.00'}</p>
                          <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Terminal ID: {broker.connected ? broker.accountNumber : 'SIM_NODE_BETA_01'}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-[10px]">
                           <span className="text-gray-600 font-bold uppercase">Volatility Index</span>
                           <span className="text-blue-500 font-black">STABLE</span>
                        </div>
                        <div className="w-full h-1 bg-[#161a1e] rounded-full overflow-hidden">
                           <div className="w-2/3 h-full bg-blue-500 animate-pulse" />
                        </div>
                        <div className="flex gap-2 mt-1">
                           <span className="text-[9px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-black uppercase">Sync OK</span>
                           <span className="text-[9px] bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded font-black uppercase">Bridge: MT5</span>
                        </div>
                      </div>
                   </div>
                </div>
              </>
            ) : activeView === 'SETTINGS' ? (
              <SettingsPanel settings={settings} setSettings={setSettings} />
            ) : activeView === 'BRIDGE' ? (
              <BridgePanel eaStatus={{ connected: broker.connected, version: '1.2.0', lastHeartbeat: Date.now(), terminalId: broker.accountNumber }} broker={broker} onConnect={() => setBroker({ ...broker, connected: true, accountNumber: 'MT5-82910', balance: 15420.50, equity: 15418.20 })} />
            ) : activeView === 'JOURNAL' ? (
              <JournalPanel journal={journal} setJournal={setJournal} />
            ) : activeView === 'HEATMAP' ? (
              <HeatmapPanel onSelectPair={(pair) => { setSelectedPair(pair); setActiveView('TERMINAL'); }} />
            ) : null}
          </div>
          
          {activeView === 'TERMINAL' && (
            <div className="w-80 shrink-0 border-l border-[#1e2329] h-full flex flex-col bg-[#161a1e]">
              <SignalPanel 
                signals={signals} 
                activeType={marketType} 
                broker={broker} 
                settings={settings} 
                activeStrategyId={activeStrategyId} 
                onSelectStrategy={setActiveStrategyId} 
                onMarkTrade={(s) => {
                  const newEntry: JournalEntry = {
                    id: Math.random().toString(36).substr(2, 9),
                    timestamp: Date.now(),
                    pair: s.pair,
                    type: s.type,
                    result: 'WIN',
                    pnl: 150,
                    emotion: 'CALM',
                    aiFeedback: "Excellent execution. Entry aligned perfectly with H1 liquidity."
                  };
                  setJournal([newEntry, ...journal]);
                }}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

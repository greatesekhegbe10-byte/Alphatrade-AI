
import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Activity, LayoutDashboard, Settings, Link as LinkIcon, 
  Star, LogOut, Zap, ShieldCheck, Database, BarChart3, History, Book
} from 'lucide-react';
import { FOREX_PAIRS, AI_STRATEGIES } from './constants';
import { Candle, Signal, MarketType, MarketPair, BrokerAccount, UserSettings, User, SystemState, Timeframe, SessionBias } from './types';
import { generateInitialCandles, updateLastCandle } from './services/marketSimulator';
import { analyzeMarket } from './services/geminiService';
import { authService } from './services/authService';
import CandleChart from './components/CandleChart';
import SignalPanel from './components/SignalPanel';
import SettingsPanel from './components/SettingsPanel';
import BridgePanel from './components/BridgePanel';
import AdminPortal from './components/AdminPortal';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [activeView, setActiveView] = useState<'TERMINAL' | 'SETTINGS' | 'BRIDGE' | 'JOURNAL'>('TERMINAL');
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
    const loggedInUser = await authService.login(authEmail, authPass);
    if (loggedInUser) setUser(loggedInUser);
    else setAuthError('Invalid credentials.');
  };

  const handleGenerateSignal = async () => {
    if (isAnalyzing || !systemState.aiModulesEnabled) return;
    setIsAnalyzing(true);
    const result = await analyzeMarket(selectedPair.symbol, candles, marketType, settings.personality);
    if (result.type) {
       setSignals(prev => [{ ...result, timeframe, strategyId: activeStrategyId } as Signal, ...prev].slice(0, 15));
    }
    setIsAnalyzing(false);
  };

  if (isAdminPortal) return <AdminPortal systemState={systemState} onUpdateSystem={(u) => setSystemState(s => ({...s, ...u}))} onExit={() => setIsAdminPortal(false)} />;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0e11] flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0b0e11] to-[#0b0e11]">
        <div className="mb-12 text-center">
           <Activity className="text-blue-500 size-14 mx-auto mb-4 animate-pulse" />
           <h1 className="text-5xl font-black tracking-tighter">ALPHATRADE <span className="text-blue-500">PRO</span></h1>
           <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">Next-Gen Signal Intelligence</p>
        </div>
        <form onSubmit={handleAuth} className="w-full max-w-md bg-[#161a1e] border border-[#1e2329] p-10 rounded-3xl shadow-2xl space-y-6">
          <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="Node Identifier" className="w-full bg-[#0b0e11] border border-[#2b2f36] p-4 rounded-xl focus:border-blue-500 outline-none transition-all" />
          <input type="password" required value={authPass} onChange={(e) => setAuthPass(e.target.value)} placeholder="Security Passphrase" className="w-full bg-[#0b0e11] border border-[#2b2f36] p-4 rounded-xl focus:border-blue-500 outline-none transition-all" />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-blue-600/20">INITIATE SESSION</button>
          <div className="pt-4 border-t border-[#1e2329] text-center">
            <button type="button" onClick={() => setIsAdminPortal(true)} className="text-[10px] text-gray-600 uppercase font-black tracking-widest hover:text-blue-500 transition-colors flex items-center justify-center gap-2 mx-auto"><Database size={10}/> Command Node</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0b0e11] text-[#eaecef] overflow-hidden">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-16'} shrink-0 bg-[#161a1e] border-r border-[#1e2329] transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-[#1e2329] flex items-center gap-3 overflow-hidden">
          <ShieldCheck className="text-blue-500 shrink-0" size={24} />
          <h1 className="font-black text-lg">ALPHATRADE</h1>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          <button onClick={() => setActiveView('TERMINAL')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${activeView === 'TERMINAL' ? 'bg-blue-600/10 text-blue-500' : 'text-gray-500 hover:bg-[#1e2329]'}`}>
            <LayoutDashboard size={20} /> {isSidebarOpen && <span className="text-xs font-black uppercase tracking-widest">Terminal</span>}
          </button>
          <button onClick={() => setActiveView('BRIDGE')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${activeView === 'BRIDGE' ? 'bg-blue-600/10 text-blue-500' : 'text-gray-500 hover:bg-[#1e2329]'}`}>
            <LinkIcon size={20} /> {isSidebarOpen && <span className="text-xs font-black uppercase tracking-widest">Bridge</span>}
          </button>
          <button onClick={() => setActiveView('JOURNAL')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${activeView === 'JOURNAL' ? 'bg-blue-600/10 text-blue-500' : 'text-gray-500 hover:bg-[#1e2329]'}`}>
            <Book size={20} /> {isSidebarOpen && <span className="text-xs font-black uppercase tracking-widest">Journal</span>}
          </button>
          <button onClick={() => setActiveView('SETTINGS')} className={`w-full flex items-center gap-3 p-3 rounded-xl ${activeView === 'SETTINGS' ? 'bg-blue-600/10 text-blue-500' : 'text-gray-500 hover:bg-[#1e2329]'}`}>
            <Settings size={20} /> {isSidebarOpen && <span className="text-xs font-black uppercase tracking-widest">Settings</span>}
          </button>
        </nav>
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5 custom-scrollbar">
          {FOREX_PAIRS.map(pair => (
            <button key={pair.symbol} onClick={() => setSelectedPair(pair)} className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${selectedPair.symbol === pair.symbol ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'hover:bg-[#1e2329]'}`}>
              <div className="flex items-center gap-2"><span className="text-[11px] font-black">{pair.symbol}</span></div>
              {isSidebarOpen && <span className={`text-[10px] mono ${pair.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>{pair.price.toFixed(4)}</span>}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-[#161a1e] border-b border-[#1e2329] flex items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-400 hover:text-white transition-colors"><Menu size={20}/></button>
            <div className="flex bg-[#0b0e11] p-1 rounded-xl border border-[#1e2329]">
              <button onClick={() => setMarketType('FOREX')} className={`px-4 py-1 rounded-lg text-[10px] font-black tracking-widest ${marketType === 'FOREX' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}>FOREX</button>
              <button onClick={() => setMarketType('BINARY')} className={`px-4 py-1 rounded-lg text-[10px] font-black tracking-widest ${marketType === 'BINARY' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500'}`}>BINARY</button>
            </div>
          </div>
          <button onClick={handleGenerateSignal} disabled={isAnalyzing} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs flex items-center gap-2 shadow-xl shadow-blue-600/20">
             {isAnalyzing ? <Activity size={16} className="animate-spin"/> : <Zap size={16}/>} {isAnalyzing ? "CALIBRATING..." : "RUN AI ANALYTICS"}
          </button>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 relative">
              <CandleChart candles={candles} symbol={selectedPair.symbol} timeframe={timeframe} onTimeframeChange={setTimeframe} signals={signals} />
            </div>
            <div className="h-56 bg-[#161a1e] border-t border-[#1e2329] p-6 flex gap-6">
               <div className="flex-1 bg-[#0b0e11] rounded-2xl border border-[#1e2329] p-4 space-y-4">
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><BarChart3 size={12}/> Live Session Bias</h4>
                  <div className="grid grid-cols-3 gap-4">
                     {['LONDON', 'NEW_YORK', 'ASIAN'].map(session => (
                        <div key={session} className="p-3 bg-[#161a1e] rounded-xl border border-white/5 space-y-1 text-center">
                           <p className="text-[9px] text-gray-600 font-black">{session}</p>
                           <p className={`text-sm font-black ${sessionBias[session.toLowerCase().replace('_','') as keyof SessionBias] === 'BULLISH' ? 'text-green-500' : 'text-gray-500'}`}>
                             {sessionBias[session.toLowerCase().replace('_','') as keyof SessionBias] || 'NEUTRAL'}
                           </p>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="w-80 bg-[#0b0e11] rounded-2xl border border-[#1e2329] p-5 space-y-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Capital Deployment</p>
                  <div className="space-y-1">
                    <p className="text-3xl font-black mono text-blue-400">${broker.connected ? broker.balance.toLocaleString() : '10,000.00'}</p>
                    <p className="text-[10px] text-gray-600 font-bold">MT5 ACCOUNT: {broker.connected ? broker.accountNumber : 'SIMULATED_NODE_01'}</p>
                  </div>
                  <div className="pt-2 flex gap-2">
                     <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded font-black">VOLATILITY: NORMAL</span>
                     <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2 py-1 rounded font-black">LIQUIDITY: PEAK</span>
                  </div>
               </div>
            </div>
          </div>
          <div className="w-80 shrink-0 border-l border-[#1e2329]">
            <SignalPanel signals={signals} activeType={marketType} broker={broker} settings={settings} activeStrategyId={activeStrategyId} onSelectStrategy={setActiveStrategyId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;


import React, { useState, useEffect } from 'react';
import { 
  Menu, Activity, LayoutDashboard, Settings, LogOut, Zap, 
  ShieldCheck, Database, Book, Layers, TrendingUp, Radiation, Filter,
  Brain, Calculator, Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle, Loader2, X,
  FlaskConical, Wifi
} from 'lucide-react';
import { ALL_ASSETS, AI_STRATEGIES } from './constants';
import { Candle, Signal, MarketType, MarketPair, BrokerAccount, UserSettings, User, SystemState, Timeframe, JournalEntry, LiveSituation } from './types';
import { generateInitialCandles, updateLastCandle } from './services/marketSimulator';
import { analyzeMarket, getMarketSituationHUD } from './services/geminiService';
import { authService } from './services/authService';
import CandleChart from './components/CandleChart';
import SignalPanel from './components/SignalPanel';
import SettingsPanel from './components/SettingsPanel';
import AdminPortal from './components/AdminPortal';
import JournalPanel from './components/JournalPanel';
import HeatmapPanel from './components/HeatmapPanel';
import SubscriptionPortal from './components/SubscriptionPortal';
import BridgePanel from './components/BridgePanel';
import AnalysisPanel from './components/AnalysisPanel';
import StrategyLab from './components/StrategyLab';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [startupStep, setStartupStep] = useState('Initializing Core...');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [activeView, setActiveView] = useState<'TERMINAL' | 'SETTINGS' | 'JOURNAL' | 'HEATMAP' | 'BRIDGE' | 'ANALYSIS' | 'LAB'>('TERMINAL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [showPaywall, setShowPaywall] = useState(false);

  const [systemState, setSystemState] = useState<SystemState>({
    aiModulesEnabled: true, forexSignalsEnabled: true, binarySignalsEnabled: true,
    confidenceThreshold: 70, maintenanceMode: false, rolloutPercentage: 100, killSwitchActive: false
  });

  const [selectedPair, setSelectedPair] = useState<MarketPair>(ALL_ASSETS[0]);
  const [marketType, setMarketType] = useState<MarketType>('FOREX');
  const [timeframe, setTimeframe] = useState<Timeframe>('H1');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [liveSituation, setLiveSituation] = useState<LiveSituation | undefined>();
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [activeStrategyId, setActiveStrategyId] = useState<string>(AI_STRATEGIES[0].id);

  const [broker, setBroker] = useState<BrokerAccount>({
    connected: false, platform: 'NONE', brokerName: '', balance: 10000, equity: 10000, leverage: 100, currency: 'USD', accountNumber: '---', dailyLoss: 0, consecutiveLosses: 0
  });

  const [settings, setSettings] = useState<UserSettings>({
    riskPercent: 1.0, dailyLossLimit: 1000, maxConsecutiveLosses: 4, personality: 'BALANCED', learningMode: 'BEGINNER',
    toggles: { newsFilter: true, aiConfirmation: true, sessionFilter: true, psychologicalGuard: true, autoLot: true }
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const steps = [
        'Syncing Local Data...',
        'Establishing Global Node Link...',
        'Verifying Neural Integrity...',
        'Ready'
      ];
      for (const step of steps) {
        setStartupStep(step);
        await new Promise(r => setTimeout(r, 600));
      }
      const activeUser = await authService.verifySession();
      if (activeUser) setUser(activeUser);
      setIsAuthLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const newCandles = generateInitialCandles(selectedPair.price);
    setCandles(newCandles);
    const refreshHUD = async () => {
      const situation = await getMarketSituationHUD(selectedPair.symbol, newCandles);
      setLiveSituation(situation);
    };
    refreshHUD();
  }, [selectedPair, timeframe]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCandles(prev => {
        if (prev.length === 0) return prev;
        const updated = updateLastCandle(prev[prev.length - 1]);
        return [...prev.slice(0, -1), updated];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthSubmitting(true);
    try {
      if (authMode === 'LOGIN') {
        const res = await authService.login(authForm.email, authForm.password);
        setUser(res.user);
      } else {
        const res = await authService.signup(authForm.name, authForm.email, authForm.password);
        setUser(res.user);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Identity verification failed.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setActiveView('TERMINAL');
  };

  const handleGenerateSignal = async () => {
    if (!user) return;
    if (user.tier === 'BASIC') { setShowPaywall(true); return; }
    if (systemState.killSwitchActive) return; 
    if (broker.dailyLoss >= settings.dailyLossLimit) return; 

    setIsAnalyzing(true);
    const result = await analyzeMarket(selectedPair.symbol, candles, marketType, settings.personality);
    if (result.type) {
       const newSignal = { ...result, timeframe, strategyId: activeStrategyId } as Signal;
       setSignals(prev => [newSignal, ...prev].slice(0, 30));
    }
    setIsAnalyzing(false);
  };

  const handleSelectView = (view: typeof activeView) => {
    setActiveView(view);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen bg-[#0b0e11] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Activity className="text-blue-500 animate-spin-slow" size={64} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Wifi size={24} className="text-blue-500/50" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">{startupStep}</p>
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-blue-600 animate-pulse w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isAdminPortal) return <AdminPortal systemState={systemState} onUpdateSystem={(u) => setSystemState(s => ({...s, ...u}))} onExit={() => setIsAdminPortal(false)} />;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="w-full max-w-lg bg-[#161a1e] border border-white/5 p-6 sm:p-12 rounded-[40px] shadow-2xl relative z-10 space-y-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center space-y-3">
             <Activity className="text-blue-500 size-16 mx-auto mb-4 animate-spin-slow" />
             <h1 className="text-4xl sm:text-6xl font-black tracking-tighter text-white uppercase leading-none">Alpha<span className="text-blue-500">Trade</span></h1>
             <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] block">Institutional Neural Architecture</p>
          </div>
          <div className="flex bg-[#0b0e11] p-1.5 rounded-2xl border border-white/5">
             <button onClick={() => { setAuthMode('LOGIN'); setAuthError(''); }} className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${authMode === 'LOGIN' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-600 hover:text-white'}`}>Logon</button>
             <button onClick={() => { setAuthMode('SIGNUP'); setAuthError(''); }} className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${authMode === 'SIGNUP' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-600 hover:text-white'}`}>Init</button>
          </div>
          <form onSubmit={handleAuthAction} className="space-y-5">
            {authMode === 'SIGNUP' && (
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest ml-1">Identity</label>
                <div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800" size={18} /><input required type="text" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} placeholder="Operator Name" className="w-full bg-[#0b0e11] border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none transition-all placeholder:text-gray-900" /></div>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest ml-1">Access Email</label>
              <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800" size={18} /><input required type="email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} placeholder="trader@nexus.io" className="w-full bg-[#0b0e11] border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none transition-all placeholder:text-gray-900" /></div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-gray-700 uppercase tracking-widest ml-1">Passphrase</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800" size={18} /><input required type="password" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} placeholder="••••••••" className="w-full bg-[#0b0e11] border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none transition-all placeholder:text-gray-900" /></div>
            </div>
            {authError && <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in shake"><AlertCircle className="text-red-500 shrink-0" size={18} /><p className="text-[10px] font-black text-red-500 uppercase leading-none">{authError}</p></div>}
            <button disabled={isAuthSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-[24px] font-black text-white text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3">{isAuthSubmitting ? <Loader2 className="animate-spin" size={20} /> : (authMode === 'LOGIN' ? <LogIn size={20}/> : <UserPlus size={20}/>)}{isAuthSubmitting ? "Linking..." : (authMode === 'LOGIN' ? "Establish Link" : "Activate Protocol")}</button>
          </form>
          <div className="flex justify-center gap-6"><button onClick={() => setIsAdminPortal(true)} className="text-[10px] text-gray-700 font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"><Radiation size={14}/> Command Node</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0b0e11] text-[#eaecef] overflow-hidden relative">
      {showPaywall && <SubscriptionPortal user={user} onSuccess={(tier) => { setUser({...user, tier}); setShowPaywall(false); }} onCancel={() => setShowPaywall(false)} />}
      
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[40]" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-[50] ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 w-72 lg:w-20'} shrink-0 bg-[#161a1e] border-r border-white/5 transition-all duration-300 flex flex-col shadow-2xl`}>
        <div className="p-8 h-20 border-b border-white/5 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-blue-500 shrink-0" size={28} />
            {(isSidebarOpen || window.innerWidth < 1024) && <h1 className="font-black text-2xl tracking-tighter text-white uppercase">AlphaTrade</h1>}
          </div>
          {window.innerWidth < 1024 && (
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-white p-2"><X size={24}/></button>
          )}
        </div>
        <nav className="p-5 space-y-1.5 overflow-y-auto custom-scrollbar flex-1">
          <button onClick={() => handleSelectView('TERMINAL')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeView === 'TERMINAL' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}>
            <LayoutDashboard size={22} /> {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[11px] font-black uppercase tracking-widest">Terminal</span>}
          </button>
          <button onClick={() => handleSelectView('LAB')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeView === 'LAB' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}>
            <FlaskConical size={22} /> {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[11px] font-black uppercase tracking-widest">Strategy Lab</span>}
          </button>
          <button onClick={() => handleSelectView('ANALYSIS')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeView === 'ANALYSIS' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}>
            <Brain size={22} /> {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[11px] font-black uppercase tracking-widest">Neural Lab</span>}
          </button>
          <button onClick={() => handleSelectView('HEATMAP')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeView === 'HEATMAP' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}>
            <Layers size={22} /> {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[11px] font-black uppercase tracking-widest">Heatmap</span>}
          </button>
          <button onClick={() => handleSelectView('JOURNAL')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeView === 'JOURNAL' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}>
            <Book size={22} /> {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[11px] font-black uppercase tracking-widest">Journal</span>}
          </button>
          <button onClick={() => handleSelectView('BRIDGE')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeView === 'BRIDGE' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}>
            <Database size={22} /> {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[11px] font-black uppercase tracking-widest">Broker Hub</span>}
          </button>
          <button onClick={() => handleSelectView('SETTINGS')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${activeView === 'SETTINGS' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}>
            <Settings size={22} /> {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[11px] font-black uppercase tracking-widest">Prefs</span>}
          </button>
          
          <div className="pt-8">
             <div className="flex justify-between items-center px-4 mb-5">
                {(isSidebarOpen || window.innerWidth < 1024) && <p className="text-[11px] font-black text-gray-700 uppercase tracking-widest">Neural Watchlist</p>}
                <Filter size={14} className="text-gray-700" />
             </div>
             <div className="space-y-1.5 max-h-[35vh] overflow-y-auto custom-scrollbar">
                {ALL_ASSETS.map(pair => (
                  <button key={pair.symbol} onClick={() => { setSelectedPair(pair); handleSelectView('TERMINAL'); }} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${selectedPair.symbol === pair.symbol && activeView === 'TERMINAL' ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' : 'hover:bg-white/5 text-gray-600'}`}>
                    <span className="text-[11px] font-black">{pair.symbol}</span>
                    {(isSidebarOpen || window.innerWidth < 1024) && <span className={`text-[10px] font-bold ${pair.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>{pair.change >= 0 ? '+' : ''}{pair.change.toFixed(2)}%</span>}
                  </button>
                ))}
             </div>
          </div>
        </nav>
        <div className="p-6 border-t border-white/5 bg-black/20">
           <button onClick={() => setShowPaywall(true)} className="w-full mb-4 p-4 bg-[#0b0e11] rounded-2xl flex items-center gap-4 border border-white/5 hover:border-blue-500/30 transition-all shadow-xl">
              <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shrink-0 shadow-lg shadow-blue-600/20">{user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}</div>
              {(isSidebarOpen || window.innerWidth < 1024) && (
                <div className="text-left overflow-hidden">
                  <p className="text-[10px] font-black text-white truncate w-32 uppercase tracking-widest">{user.name || 'Nexus Operator'}</p>
                  <p className="text-[9px] font-bold text-gray-700 uppercase tracking-tighter">{user.tier} Node Active</p>
                </div>
              )}
           </button>
           <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 text-gray-700 hover:text-red-500 transition-all font-black uppercase text-[11px] tracking-[0.2em]">
              <LogOut size={22} /> {(isSidebarOpen || window.innerWidth < 1024) && "Shutdown"}
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-[#161a1e] border-b border-white/5 flex items-center justify-between px-6 sm:px-10 shadow-2xl z-20">
           <div className="flex items-center gap-4 sm:gap-8">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 text-gray-500 hover:text-white transition-all bg-[#0b0e11] rounded-xl border border-white/5"><Menu size={22}/></button>
              <div className="flex bg-[#0b0e11] p-1.5 rounded-2xl border border-white/5 shadow-inner max-w-[150px] sm:max-w-none overflow-x-auto no-scrollbar">
                 {['FOREX', 'BINARY', 'INDICES', 'COMMODITIES', 'CRYPTO'].map(cat => (
                   <button key={cat} onClick={() => setMarketType(cat as MarketType)} className={`px-4 sm:px-8 py-2.5 rounded-xl text-[10px] sm:text-[11px] font-black tracking-widest transition-all whitespace-nowrap ${marketType === cat ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-700 hover:text-gray-300'}`}>{cat}</button>
                 ))}
              </div>
           </div>

           <div className="flex items-center gap-4 sm:gap-8">
              {systemState.killSwitchActive ? (
                <div className="px-5 sm:px-10 py-3 bg-red-600 rounded-2xl font-black text-[10px] sm:text-xs text-white uppercase flex items-center gap-3 animate-pulse border-2 border-red-500 shadow-2xl shadow-red-600/20">
                   <Radiation size={18}/> TERMINAL HALTED
                </div>
              ) : (
                <button 
                  onClick={handleGenerateSignal} 
                  disabled={isAnalyzing || (broker.dailyLoss >= settings.dailyLossLimit)} 
                  className={`px-6 sm:px-12 py-3.5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] flex items-center gap-3 shadow-2xl transition-all active:scale-95 ${isAnalyzing ? 'bg-blue-600/50 cursor-not-allowed opacity-70' : (broker.dailyLoss >= settings.dailyLossLimit) ? 'bg-red-600 shadow-red-600/20 text-white' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 text-white'}`}
                >
                   {isAnalyzing ? <Activity size={18} className="animate-spin" /> : <Zap size={18} />}
                   <span className="hidden sm:inline">{isAnalyzing ? "Processing Neural Link..." : (broker.dailyLoss >= settings.dailyLossLimit) ? "RISK LOCKED" : "Generate Analysis"}</span>
                   <span className="sm:hidden">{isAnalyzing ? "..." : (broker.dailyLoss >= settings.dailyLossLimit) ? "LOCKED" : "RUN"}</span>
                </button>
              )}
           </div>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
             {activeView === 'TERMINAL' ? (
               <>
                 <div className="flex-1 min-h-[400px] sm:min-h-[500px] relative">
                    <CandleChart 
                      candles={candles} 
                      symbol={selectedPair.symbol} 
                      timeframe={timeframe} 
                      onTimeframeChange={setTimeframe} 
                      signals={signals} 
                      liveSituation={liveSituation}
                    />
                 </div>
                 <div className="h-64 sm:h-80 shrink-0 bg-[#161a1e] border-t border-white/5 p-6 sm:p-10 flex flex-col sm:flex-row gap-6 sm:gap-10 overflow-y-auto sm:overflow-x-auto">
                    <div className="min-w-0 sm:min-w-[500px] flex-1 bg-[#0b0e11] rounded-[40px] border border-white/5 p-6 sm:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                       <div className="flex justify-between items-center mb-4">
                          <p className="text-[11px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-3"><TrendingUp size={16}/> Profit Progression</p>
                          <span className="text-[10px] text-emerald-500 font-black uppercase tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded-lg">Accuracy: 88.4%</span>
                       </div>
                       <div className="flex items-end gap-1.5 h-16 sm:h-32">
                          {[25, 45, 55, 40, 65, 85, 75, 95, 110, 100].map((h, i) => (
                            <div key={i} className="flex-1 bg-blue-600/10 border-t-4 border-blue-500 rounded-t-xl transition-all duration-1000 group-hover:bg-blue-600/30" style={{ height: `${(h/110)*100}%` }} />
                          ))}
                       </div>
                    </div>
                    <div className="w-full sm:w-[450px] shrink-0 bg-[#0b0e11] rounded-[40px] border border-white/5 p-8 sm:p-12 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                       <div className="absolute -top-10 -right-10 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                          <Brain size={180} />
                       </div>
                       <div className="space-y-2">
                          <p className="text-[11px] font-black text-gray-700 uppercase tracking-widest">Drawdown Cap</p>
                          <p className="text-3xl sm:text-5xl font-black text-white tracking-tighter mono">${broker.dailyLoss.toFixed(2)} <span className="text-gray-800 text-xl sm:text-2xl">/ ${settings.dailyLossLimit}</span></p>
                       </div>
                       <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mt-6 shadow-inner">
                          <div className={`h-full bg-blue-600 transition-all duration-1000 shadow-[0_0_15px_rgba(37,99,235,0.5)]`} style={{ width: `${Math.min(100, (broker.dailyLoss / settings.dailyLossLimit) * 100)}%` }} />
                       </div>
                    </div>
                 </div>
               </>
             ) : activeView === 'SETTINGS' ? (
               <SettingsPanel settings={settings} setSettings={setSettings} />
             ) : activeView === 'JOURNAL' ? (
               <JournalPanel journal={journal} setJournal={setJournal} />
             ) : activeView === 'HEATMAP' ? (
               <HeatmapPanel onSelectPair={(p) => { setSelectedPair(p); handleSelectView('TERMINAL'); }} />
             ) : activeView === 'BRIDGE' ? (
               <BridgePanel broker={broker} setBroker={setBroker} />
             ) : activeView === 'ANALYSIS' ? (
               <AnalysisPanel symbol={selectedPair.symbol} candles={candles} />
             ) : activeView === 'LAB' ? (
               <StrategyLab symbol={selectedPair.symbol} candles={candles} />
             ) : null}
          </div>

          {activeView === 'TERMINAL' && (
            <div className="w-full lg:w-[420px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 h-[450px] lg:h-full flex flex-col bg-[#161a1e] shadow-2xl">
               <SignalPanel 
                 signals={signals} 
                 activeType={marketType} 
                 broker={broker} 
                 settings={settings} 
                 onSelectStrategy={setActiveStrategyId} 
                 activeStrategyId={activeStrategyId}
                 onMarkTrade={(s) => {
                    const win = Math.random() > 0.25; // High win rate sim
                    const pnl = win ? 220 : -100;
                    setJournal(prev => [{
                      id: Math.random().toString(36).substr(2, 9),
                      timestamp: Date.now(),
                      pair: s.pair,
                      type: s.type,
                      result: win ? 'WIN' : 'LOSS',
                      pnl,
                      emotion: 'CALM',
                      aiFeedback: "Signal execution within predicted liquidity parameters. High accuracy node confirmation.",
                      signalHash: s.hash
                    }, ...prev]);
                    setBroker(b => ({
                      ...b, 
                      balance: b.balance + pnl, 
                      dailyLoss: pnl < 0 ? b.dailyLoss + Math.abs(pnl) : b.dailyLoss,
                      consecutiveLosses: pnl < 0 ? b.consecutiveLosses + 1 : 0
                    }));
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

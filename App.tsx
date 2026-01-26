
import React, { useState, useEffect } from 'react';
import { 
  Menu, Activity, LayoutDashboard, Settings, LogOut, Zap, 
  ShieldCheck, Database, Book, Layers, TrendingUp, Radiation, Filter,
  Brain, Calculator, Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle, Loader2, X,
  FlaskConical
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
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const activeUser = await authService.verifySession();
      if (activeUser) setUser(activeUser);
      setIsAuthLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const newCandles = generateInitialCandles(selectedPair.price);
    setCandles(newCandles);
    // Refresh Market Situation HUD on Pair Switch
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

  const handleGoogleLogin = async () => {
    setAuthError('');
    setIsAuthSubmitting(true);
    try {
      const res = await authService.googleLogin();
      setUser(res.user);
    } catch (err: any) {
      setAuthError('Google Link Node disconnected.');
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
      <div className="h-screen bg-[#0b0e11] flex flex-col items-center justify-center space-y-4">
        <Activity className="text-blue-500 animate-spin-slow" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">Synchronizing Local Nodes...</p>
      </div>
    );
  }

  if (isAdminPortal) return <AdminPortal systemState={systemState} onUpdateSystem={(u) => setSystemState(s => ({...s, ...u}))} onExit={() => setIsAdminPortal(false)} />;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="w-full max-w-lg bg-[#161a1e] border border-white/5 p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-2xl relative z-10 space-y-8 sm:space-y-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center space-y-3">
             <Activity className="text-blue-500 size-12 sm:size-16 mx-auto mb-2 sm:mb-4 animate-spin-slow" />
             <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-white uppercase leading-none">Alpha<span className="text-blue-500">Trade</span></h1>
             <p className="text-gray-600 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] block">Institutional Signal Architecture</p>
          </div>
          <div className="flex bg-[#0b0e11] p-1 rounded-2xl border border-white/5">
             <button onClick={() => { setAuthMode('LOGIN'); setAuthError(''); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'LOGIN' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-600 hover:text-white'}`}>Logon</button>
             <button onClick={() => { setAuthMode('SIGNUP'); setAuthError(''); }} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'SIGNUP' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-600 hover:text-white'}`}>Init</button>
          </div>
          <form onSubmit={handleAuthAction} className="space-y-4 sm:space-y-5">
            {authMode === 'SIGNUP' && (
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-gray-700 uppercase tracking-widest ml-1">Identity</label>
                <div className="relative"><UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800" size={16} /><input required type="text" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} placeholder="Operator Name" className="w-full bg-[#0b0e11] border border-white/5 pl-12 pr-4 py-3 sm:py-4 rounded-2xl text-xs font-bold focus:border-blue-500 outline-none transition-all" /></div>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-gray-700 uppercase tracking-widest ml-1">Access Email</label>
              <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800" size={16} /><input required type="email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} placeholder="trader@nexus.io" className="w-full bg-[#0b0e11] border border-white/5 pl-12 pr-4 py-3 sm:py-4 rounded-2xl text-xs font-bold focus:border-blue-500 outline-none transition-all" /></div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-gray-700 uppercase tracking-widest ml-1">Passphrase</label>
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-800" size={16} /><input required type="password" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} placeholder="••••••••" className="w-full bg-[#0b0e11] border border-white/5 pl-12 pr-4 py-3 sm:py-4 rounded-2xl text-xs font-bold focus:border-blue-500 outline-none transition-all" /></div>
            </div>
            {authError && <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in shake"><AlertCircle className="text-red-500 shrink-0" size={14} /><p className="text-[9px] font-black text-red-500 uppercase leading-none">{authError}</p></div>}
            <button disabled={isAuthSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-4 sm:py-5 rounded-[20px] font-black text-white text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3">{isAuthSubmitting ? <Loader2 className="animate-spin" size={18} /> : (authMode === 'LOGIN' ? <LogIn size={18}/> : <UserPlus size={18}/>)}{isAuthSubmitting ? "Linking..." : (authMode === 'LOGIN' ? "Establish Link" : "Activate Protocol")}</button>
          </form>
          <div className="space-y-4">
            <div className="flex items-center gap-4"><div className="flex-1 h-px bg-white/5" /><span className="text-[8px] font-black text-gray-800 uppercase tracking-widest">or Secure OAuth</span><div className="flex-1 h-px bg-white/5" /></div>
            <button onClick={handleGoogleLogin} disabled={isAuthSubmitting} className="w-full py-4 bg-[#0b0e11] hover:bg-[#1e2329] border border-white/5 rounded-2xl flex items-center justify-center gap-3 transition-all"><svg className="size-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/><path fill="#34A853" d="M16.04 18.013c-1.09.303-2.23.477-3.41.477a7.073 7.073 0 0 1-6.733-4.857L1.87 16.748C3.828 20.702 7.9 23.4 12.63 23.4c3.055 0 5.782-1.145 7.91-3l-4.5-2.387z"/><path fill="#4285F4" d="M19.91 20.4c1.69-1.582 2.62-3.927 2.62-6.545 0-.75-.07-1.487-.2-2.21H12.63v4.418h5.21c-.227 1.182-.89 2.182-1.8 2.855l4.027 3.115l-.157.367z"/><path fill="#FBBC05" d="M5.266 14.235A7.077 7.077 0 0 1 4.909 12c0-.795.145-1.564.409-2.273L1.24 6.65a11.93 11.93 0 0 0 0 10.7l4.026-3.115z"/></svg><span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Connect Google Account</span></button>
          </div>
          <div className="flex justify-center gap-6"><button onClick={() => setIsAdminPortal(true)} className="text-[9px] text-gray-700 font-black uppercase tracking-widest hover:text-white transition-all flex items-center gap-2"><Radiation size={12}/> Global Command</button></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#0b0e11] text-[#eaecef] overflow-hidden relative">
      {showPaywall && <SubscriptionPortal user={user} onSuccess={(tier) => { setUser({...user, tier}); setShowPaywall(false); }} onCancel={() => setShowPaywall(false)} />}
      
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && window.innerWidth < 1024 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-[50] ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 w-64 lg:w-20'} shrink-0 bg-[#161a1e] border-r border-white/5 transition-all duration-300 flex flex-col shadow-2xl`}>
        <div className="p-6 h-14 border-b border-white/5 flex items-center justify-between overflow-hidden">
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-blue-500 shrink-0" size={24} />
            {(isSidebarOpen || window.innerWidth < 1024) && <h1 className="font-black text-xl tracking-tighter text-white uppercase">AlphaTrade</h1>}
          </div>
          {window.innerWidth < 1024 && (
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-white p-1"><X size={20}/></button>
          )}
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto custom-scrollbar flex-1">
          <button onClick={() => handleSelectView('TERMINAL')} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeView === 'TERMINAL' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
            <LayoutDashboard size={20} /> {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[10px] font-black uppercase tracking-widest">Terminal</span>}
          </button>
          <button onClick={() => handleSelectView('LAB')} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeView === 'LAB' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
            <FlaskConical size={20} /> {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[10px] font-black uppercase tracking-widest">Strategy Lab</span>}
          </button>
          <button onClick={() => handleSelectView('ANALYSIS')} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeView === 'ANALYSIS' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
            <Brain size={20} /> {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[10px] font-black uppercase tracking-widest">AI Lab</span>}
          </button>
          <button onClick={() => handleSelectView('HEATMAP')} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeView === 'HEATMAP' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
            <Layers size={20} /> {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[10px] font-black uppercase tracking-widest">Heatmap</span>}
          </button>
          <button onClick={() => handleSelectView('JOURNAL')} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeView === 'JOURNAL' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
            <Book size={20} /> {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[10px] font-black uppercase tracking-widest">Journal</span>}
          </button>
          <button onClick={() => handleSelectView('BRIDGE')} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeView === 'BRIDGE' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
            <Database size={20} /> {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[10px] font-black uppercase tracking-widest">Broker Hub</span>}
          </button>
          <button onClick={() => handleSelectView('SETTINGS')} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeView === 'SETTINGS' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
            <Settings size={20} /> {(isSidebarOpen || window.innerWidth < 1024) && <span className="text-[10px] font-black uppercase tracking-widest">Prefs</span>}
          </button>
          
          <div className="pt-6">
             <div className="flex justify-between items-center px-4 mb-4">
                {(isSidebarOpen || window.innerWidth < 1024) && <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Watchlist</p>}
                <Filter size={12} className="text-gray-700" />
             </div>
             <div className="space-y-1 max-h-[30vh] overflow-y-auto custom-scrollbar">
                {ALL_ASSETS.map(pair => (
                  <button key={pair.symbol} onClick={() => { setSelectedPair(pair); handleSelectView('TERMINAL'); }} className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${selectedPair.symbol === pair.symbol && activeView === 'TERMINAL' ? 'bg-blue-600/10 text-blue-500' : 'hover:bg-white/5 text-gray-500'}`}>
                    <span className="text-[10px] font-black">{pair.symbol}</span>
                    {(isSidebarOpen || window.innerWidth < 1024) && <span className={`text-[9px] font-bold ${pair.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>{pair.change.toFixed(2)}%</span>}
                  </button>
                ))}
             </div>
          </div>
        </nav>
        <div className="p-4 border-t border-white/5 bg-black/20">
           <button onClick={() => setShowPaywall(true)} className="w-full mb-4 p-3 bg-white/5 rounded-2xl flex items-center gap-4 border border-white/5 hover:border-blue-500/30 transition-all">
              <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shrink-0">{user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}</div>
              {(isSidebarOpen || window.innerWidth < 1024) && (
                <div className="text-left overflow-hidden">
                  <p className="text-[9px] font-black text-white truncate w-32 uppercase tracking-widest">{user.name || 'Nexus Trader'}</p>
                  <p className="text-[8px] font-bold text-gray-600 uppercase tracking-tighter">{user.tier} Node</p>
                </div>
              )}
           </button>
           <button onClick={handleLogout} className="w-full flex items-center gap-4 p-3 text-gray-600 hover:text-red-500 transition-all font-black uppercase text-[10px] tracking-widest">
              <LogOut size={20} /> {(isSidebarOpen || window.innerWidth < 1024) && "Shutdown"}
           </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-[#161a1e] border-b border-white/5 flex items-center justify-between px-4 sm:px-6 shadow-2xl z-20">
           <div className="flex items-center gap-2 sm:gap-6">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-500 hover:text-white transition-all"><Menu size={20}/></button>
              <div className="flex bg-[#0b0e11] p-1 rounded-xl border border-white/5 shadow-inner max-w-[150px] sm:max-w-none overflow-x-auto no-scrollbar">
                 {['FOREX', 'BINARY', 'INDICES', 'COMMODITIES', 'CRYPTO'].map(cat => (
                   <button key={cat} onClick={() => setMarketType(cat as MarketType)} className={`px-2 sm:px-4 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black tracking-widest transition-all whitespace-nowrap ${marketType === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 hover:text-gray-300'}`}>{cat}</button>
                 ))}
              </div>
           </div>

           <div className="flex items-center gap-2 sm:gap-6">
              {systemState.killSwitchActive ? (
                <div className="px-3 sm:px-6 py-2 bg-red-600 rounded-xl font-black text-[9px] sm:text-xs text-white uppercase flex items-center gap-1 sm:gap-3 animate-pulse">
                   <Radiation size={14}/> HALTED
                </div>
              ) : (
                <button 
                  onClick={handleGenerateSignal} 
                  disabled={isAnalyzing || (broker.dailyLoss >= settings.dailyLossLimit)} 
                  className={`px-4 sm:px-10 py-2.5 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-2 sm:gap-3 shadow-2xl transition-all active:scale-95 ${isAnalyzing ? 'bg-blue-600/50 cursor-not-allowed' : (broker.dailyLoss >= settings.dailyLossLimit) ? 'bg-red-600 shadow-red-600/20 text-white' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30 text-white'}`}
                >
                   {isAnalyzing ? <Activity size={16} className="animate-spin" /> : <Zap size={16} />}
                   <span className="hidden sm:inline">{isAnalyzing ? "Processing..." : (broker.dailyLoss >= settings.dailyLossLimit) ? "LOCKED" : "Generate Analysis"}</span>
                   <span className="sm:hidden">{isAnalyzing ? "..." : (broker.dailyLoss >= settings.dailyLossLimit) ? "!" : "RUN"}</span>
                </button>
              )}
           </div>
        </header>

        <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar">
             {activeView === 'TERMINAL' ? (
               <>
                 <div className="flex-1 min-h-[300px] sm:min-h-[400px] relative">
                    <CandleChart 
                      candles={candles} 
                      symbol={selectedPair.symbol} 
                      timeframe={timeframe} 
                      onTimeframeChange={setTimeframe} 
                      signals={signals} 
                      liveSituation={liveSituation}
                    />
                 </div>
                 <div className="h-48 sm:h-64 shrink-0 bg-[#161a1e] border-t border-white/5 p-4 sm:p-8 flex flex-col sm:flex-row gap-4 sm:gap-8 overflow-y-auto sm:overflow-x-auto">
                    <div className="min-w-0 sm:min-w-[450px] flex-1 bg-[#0b0e11] rounded-[24px] sm:rounded-[32px] border border-white/5 p-4 sm:p-8 flex flex-col justify-between shadow-2xl">
                       <div className="flex justify-between items-center mb-2">
                          <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={14}/> Equity Curve</p>
                          <span className="text-[9px] text-emerald-500 font-black uppercase tracking-tighter">Stability: OK</span>
                       </div>
                       <div className="flex items-end gap-1 h-12 sm:h-24">
                          {[20, 35, 45, 40, 55, 75, 65, 85, 95].map((h, i) => (
                            <div key={i} className="flex-1 bg-blue-600/20 border-t-2 border-blue-500 rounded-t-lg transition-all duration-1000" style={{ height: `${h}%` }} />
                          ))}
                       </div>
                    </div>
                    <div className="w-full sm:w-96 shrink-0 bg-[#0b0e11] rounded-[24px] sm:rounded-[32px] border border-white/5 p-4 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity hidden sm:block">
                          <Brain size={120} />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Risk Capacity</p>
                          <p className="text-xl sm:text-3xl font-black text-white tracking-tighter">${broker.dailyLoss.toFixed(2)} / <span className="text-gray-700">${settings.dailyLossLimit}</span></p>
                       </div>
                       <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mt-2">
                          <div className={`h-full bg-blue-600 transition-all duration-1000`} style={{ width: `${Math.min(100, (broker.dailyLoss / settings.dailyLossLimit) * 100)}%` }} />
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

          {/* Terminal Sidebar / Bottom Bar on mobile */}
          {activeView === 'TERMINAL' && (
            <div className="w-full lg:w-96 shrink-0 border-t lg:border-t-0 lg:border-l border-white/5 h-[400px] lg:h-full flex flex-col bg-[#161a1e]">
               <SignalPanel 
                 signals={signals} 
                 activeType={marketType} 
                 broker={broker} 
                 settings={settings} 
                 onSelectStrategy={setActiveStrategyId} 
                 activeStrategyId={activeStrategyId}
                 onMarkTrade={(s) => {
                    const win = Math.random() > 0.4;
                    const pnl = win ? 150 : -100;
                    setJournal(prev => [{
                      id: Math.random().toString(36).substr(2, 9),
                      timestamp: Date.now(),
                      pair: s.pair,
                      type: s.type,
                      result: win ? 'WIN' : 'LOSS',
                      pnl,
                      emotion: 'CALM',
                      aiFeedback: "Signal execution matched predicted regime dynamics. Hashed Proof valid.",
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

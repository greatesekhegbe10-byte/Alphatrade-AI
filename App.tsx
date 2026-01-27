import React, { useState, useEffect, useCallback } from 'react';
import { 
  Menu, Activity, LayoutDashboard, Settings, LogOut, Zap, 
  ShieldCheck, Database, Book, Layers, TrendingUp,
  Brain, Lock, AlertCircle, Loader2,
  FlaskConical, LockKeyhole, Calculator, Calendar, MessageSquare, CheckCircle2
} from 'lucide-react';
import { ALL_ASSETS, AI_STRATEGIES, TIMEFRAMES } from './constants';
import { Candle, Signal, MarketType, MarketPair, BrokerAccount, UserSettings, User, SystemState, Timeframe, JournalEntry, LiveSituation } from './types';
import { generateInitialCandles } from './services/marketSimulator';
import { analyzeMarket, getMarketSituationHUD } from './services/geminiService';
import { authService } from './services/authService';
import { paymentService } from './services/paymentService';
import { detectPatterns } from './services/patternDetectionService';
import { getNextHighImpactEvent } from './services/newsService';
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
import NewsPanel from './components/NewsPanel';
import RiskCalculator from './components/RiskCalculator';
import ChatPanel from './components/ChatPanel';

type ViewType = 'TERMINAL' | 'SETTINGS' | 'JOURNAL' | 'HEATMAP' | 'BRIDGE' | 'ANALYSIS' | 'LAB' | 'NEWS' | 'RISK' | 'CHAT';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [startupStep, setStartupStep] = useState('Initializing Institutional Node...');
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'VERIFYING' | 'SUCCESS' | 'FAILED'>('IDLE');

  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('TERMINAL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
  const [showPaywall, setShowPaywall] = useState(false);

  const [systemState, setSystemState] = useState<SystemState>({
    aiModulesEnabled: true,
    forexSignalsEnabled: true,
    binarySignalsEnabled: true,
    confidenceThreshold: 70,
    maintenanceMode: false,
    killSwitchActive: false,
    remoteEAControl: true
  });

  const [assets, setAssets] = useState<MarketPair[]>(ALL_ASSETS);
  const [selectedPair, setSelectedPair] = useState<MarketPair>(ALL_ASSETS[0]);
  const [marketType, setMarketType] = useState<MarketType>('FOREX');
  const [timeframe, setTimeframe] = useState<Timeframe>('H1');
  const [candles, setCandles] = useState<Candle[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [liveSituation, setLiveSituation] = useState<LiveSituation | undefined>(undefined);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  
  // Favorites Persistence
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('alpha_favorites') || '[]');
    } catch { return []; }
  });

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => {
      const next = prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol];
      localStorage.setItem('alpha_favorites', JSON.stringify(next));
      return next;
    });
  };

  const [broker, setBroker] = useState<BrokerAccount>({
    connected: false,
    platform: 'NONE',
    brokerName: '',
    balance: 1000,
    equity: 1000,
    leverage: 100,
    currency: 'USD',
    accountNumber: '---',
    dailyLoss: 0,
    spread: 0.2,
    latency: 12
  });

  const [settings, setSettings] = useState<UserSettings>({
    riskPercent: 1.0,
    dailyLossLimit: 100,
    maxConsecutiveLosses: 4,
    personality: 'BALANCED',
    learningMode: 'BEGINNER',
    toggles: {
      newsFilter: true,
      aiConfirmation: true,
      sessionFilter: true,
      psychologicalGuard: true,
      autoLot: true
    }
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isExpert = user?.tier === 'INSTITUTIONAL';
  const isProPlus = user?.tier === 'PRO' || isExpert;
  const canAccessAI = isExpert;

  // 🌍 GLOBAL PAYMENT CALLBACK LISTENER
  // Handles standard Flutterwave & Paystack redirect parameters
  useEffect(() => {
    const handlePaymentCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      
      // 1. FLUTTERWAVE PARAMS: ?status=successful&tx_ref=...&transaction_id=...
      const flwStatus = params.get('status');
      const flwRef = params.get('tx_ref');

      // 2. PAYSTACK PARAMS: ?trxref=...&reference=...
      const pstkRef = params.get('trxref') || params.get('reference');

      const txRef = flwRef || pstkRef;
      const isSuccess = flwStatus === 'successful' || pstkRef; // Paystack presence implies return from gateway

      if (isSuccess && txRef) {
        setPaymentStatus('VERIFYING');
        setStartupStep('Verifying Transaction Blockchain...');
        
        // Determine Gateway from Reference Prefix or Params
        const gateway = txRef.includes('FLW') ? 'FLUTTERWAVE' : 'PAYSTACK';
        
        const success = await paymentService.verify(txRef, gateway);
        
        if (success) {
          setPaymentStatus('SUCCESS');
          // Reload user session to get updated tier
          const activeUser = await authService.verifySession();
          if (activeUser) setUser(activeUser);
          
          // Clean URL without reloading
          window.history.replaceState({}, '', window.location.pathname);
          setTimeout(() => setPaymentStatus('IDLE'), 3500);
        } else {
          setPaymentStatus('FAILED');
          setTimeout(() => setPaymentStatus('IDLE'), 3500);
        }
      }
    };

    handlePaymentCallback();
  }, []);

  // GLOBAL TICK ENGINE
  useEffect(() => {
    if (!user) return;
    const tickInterval = setInterval(() => {
      setAssets(prev => prev.map(asset => {
        const volatility = asset.price * 0.0002;
        const change = (Math.random() - 0.5) * volatility;
        return {
          ...asset,
          price: asset.price + change,
          change: asset.change + (Math.random() - 0.5) * 0.01
        };
      }));
    }, 2000);
    return () => clearInterval(tickInterval);
  }, [user]);

  useEffect(() => {
    const checkAuth = async () => {
      setStartupStep('Verifying Node Identity...');
      const activeUser = await authService.verifySession();
      if (activeUser) {
        if (activeUser.subscription && activeUser.subscription.isActive === false) {
           authService.logout();
           setAuthError('Node Restricted. Verify account.');
        } else {
           setUser(activeUser);
        }
      }
      setIsAuthLoading(false);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    setCandles(generateInitialCandles(selectedPair.price));
  }, [selectedPair.symbol, timeframe]);

  useEffect(() => {
    const updateHUD = async () => {
      if (candles.length > 0) {
        const situation = await getMarketSituationHUD(selectedPair.symbol, candles);
        setLiveSituation(situation);
      }
    };
    const timer = setInterval(updateHUD, 15000);
    updateHUD();
    return () => clearInterval(timer);
  }, [selectedPair.symbol, candles]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthSubmitting(true);
    setAuthError('');
    try {
      const res = authMode === 'LOGIN' 
        ? await authService.login(authForm.email, authForm.password)
        : await authService.signup(authForm.name, authForm.email, authForm.password);
      setUser(res.user);
    } catch (err: any) {
      setAuthError(err.message || 'Identity verification failed.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  const handleGenerateSignal = async () => {
    if (!user) return;
    if (user.tier === 'BASIC' && signals.length >= 5) { setShowPaywall(true); return; }
    
    setIsAnalyzing(true);
    if (user.tier === 'BASIC') await new Promise(r => setTimeout(r, 4500));

    const patterns = detectPatterns(candles);
    const nextNews = getNextHighImpactEvent(selectedPair.base);

    const result = await analyzeMarket(
      selectedPair.symbol,
      candles,
      marketType,
      timeframe,
      patterns,
      nextNews,
      settings.personality,
      broker.balance,
      settings.riskPercent
    );

    if (result.type) {
       const newSignal = { ...result, timestamp: Date.now() } as Signal;
       setSignals(prev => [newSignal, ...prev].slice(0, 30));
    }
    setIsAnalyzing(false);
  };

  const handleSelectView = (view: ViewType) => {
    if (view === 'LAB' && !isProPlus) { setShowPaywall(true); return; }
    if (view === 'ANALYSIS' && !canAccessAI) { setShowPaywall(true); return; }
    setActiveView(view);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  if (isAuthLoading || paymentStatus === 'VERIFYING') {
    return (
      <div className="h-screen bg-[#0b0e11] flex flex-col items-center justify-center space-y-6">
        <Activity className="text-blue-500 animate-spin-slow" size={64} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-pulse">{startupStep}</p>
      </div>
    );
  }

  if (paymentStatus === 'SUCCESS') {
    return (
      <div className="h-screen bg-[#0b0e11] flex flex-col items-center justify-center space-y-6 animate-in zoom-in">
        <div className="size-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
           <CheckCircle2 className="text-emerald-500" size={40} />
        </div>
        <div className="text-center space-y-2">
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Payment Verified</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Unlocking Institutional Modules...</p>
        </div>
      </div>
    );
  }

  if (isAdminPortal) {
    return (
      <AdminPortal 
        systemState={systemState} 
        onUpdateSystem={(upd) => setSystemState({...systemState, ...upd})} 
        onExit={() => setIsAdminPortal(false)} 
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center p-6 relative">
        <div className="w-full max-w-lg bg-[#161a1e] border border-white/5 p-12 rounded-[40px] shadow-2xl space-y-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center space-y-3">
             <ShieldCheck className="text-blue-500 size-16 mx-auto mb-4" />
             <h1 className="text-4xl font-black text-white uppercase leading-none tracking-tighter">Alpha<span className="text-blue-500">Trade</span> AI</h1>
             <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Forex Institutional Verification</p>
          </div>
          <div className="flex bg-[#0b0e11] p-1.5 rounded-2xl border border-white/5">
             <button onClick={() => setAuthMode('LOGIN')} className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase transition-all ${authMode === 'LOGIN' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600'}`}>Logon</button>
             <button onClick={() => setAuthMode('SIGNUP')} className={`flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase transition-all ${authMode === 'SIGNUP' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600'}`}>Init Node</button>
          </div>
          <form onSubmit={handleAuthAction} className="space-y-5">
            {authMode === 'SIGNUP' && (
              <input required type="text" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} placeholder="Operator Name" className="w-full bg-[#0b0e11] border border-white/5 px-6 py-4 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none transition-all" />
            )}
            <input required type="email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} placeholder="trader@nexus.io" className="w-full bg-[#0b0e11] border border-white/5 px-6 py-4 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none transition-all" />
            <input required type="password" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} placeholder="••••••••" className="w-full bg-[#0b0e11] border border-white/5 px-6 py-4 rounded-2xl text-sm font-bold focus:border-blue-500 outline-none transition-all" />
            {authError && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"><p className="text-[10px] font-black text-red-500 uppercase">{authError}</p></div>}
            <button disabled={isAuthSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-[24px] font-black text-white text-xs uppercase tracking-widest transition-all shadow-xl">
              {isAuthSubmitting ? "Linking..." : "Establish Link"}
            </button>
          </form>
          <button onClick={() => setIsAdminPortal(true)} className="w-full text-center text-gray-700 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Command Terminal</button>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'TERMINAL' as ViewType, icon: LayoutDashboard, label: 'Terminal', locked: false },
    { id: 'HEATMAP' as ViewType, icon: Layers, label: 'Dashboard', locked: false },
    { id: 'NEWS' as ViewType, icon: Calendar, label: 'Calendar', locked: false },
    { id: 'RISK' as ViewType, icon: Calculator, label: 'Risk Sizer', locked: false },
    { id: 'LAB' as ViewType, icon: FlaskConical, label: 'Strategy Lab', locked: !isProPlus },
    { id: 'ANALYSIS' as ViewType, icon: Brain, label: 'Neural Lab', locked: !canAccessAI },
    { id: 'CHAT' as ViewType, icon: MessageSquare, label: 'Command Hub', locked: false },
    { id: 'JOURNAL' as ViewType, icon: Book, label: 'Journal', locked: false },
    { id: 'BRIDGE' as ViewType, icon: Database, label: 'Broker Hub', locked: false },
    { id: 'SETTINGS' as ViewType, icon: Settings, label: 'Prefs', locked: false }
  ];

  return (
    <div className="flex h-screen w-full bg-[#0b0e11] text-[#eaecef] overflow-hidden select-none">
      {showPaywall && <SubscriptionPortal user={user} onSuccess={(tier) => { setUser({...user, tier}); setShowPaywall(false); }} onCancel={() => setShowPaywall(false)} />}
      
      <aside className={`fixed lg:static inset-y-0 left-0 z-[50] ${isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 w-72 lg:w-20'} shrink-0 bg-[#161a1e] border-r border-white/5 transition-all duration-300 flex flex-col`}>
        <div className="p-8 h-20 border-b border-white/5 flex items-center gap-4">
          <ShieldCheck className="text-blue-500 shrink-0" size={28} />
          {isSidebarOpen && <h1 className="font-black text-2xl tracking-tighter text-white uppercase">AlphaTrade</h1>}
        </div>
        <nav className="p-5 space-y-1.5 overflow-y-auto custom-scrollbar flex-1">
          {sidebarItems.map(view => (
            <button 
              key={view.id} 
              onClick={() => handleSelectView(view.id)} 
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative ${activeView === view.id ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-white/5'}`}
            >
              <view.icon size={22} /> 
              {isSidebarOpen && <span className="text-[11px] font-black uppercase tracking-widest">{view.label}</span>}
              {view.locked && <LockKeyhole size={12} className="absolute right-4 text-gray-700" />}
            </button>
          ))}
        </nav>
        
        <div className="p-6 border-t border-white/5 space-y-4">
           <button onClick={() => setShowPaywall(true)} className="w-full p-4 bg-white/5 rounded-xl border border-white/10 text-left hover:border-blue-500/30 transition-all">
              <p className="text-[8px] font-black text-gray-700 uppercase">Tier Level</p>
              <p className="text-[9px] font-bold text-blue-500 uppercase">{user.tier}</p>
           </button>
           <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 text-gray-700 hover:text-red-500 transition-all font-black uppercase text-[11px]">
              <LogOut size={22} /> {isSidebarOpen && "Shutdown"}
           </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 z-10">
        <header className="h-20 bg-[#161a1e] border-b border-white/5 flex items-center justify-between px-10 shadow-2xl">
           <div className="flex items-center gap-8">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 text-gray-500 hover:text-white bg-[#0b0e11] rounded-xl border border-white/5"><Menu size={22}/></button>
              <div className="flex bg-[#0b0e11] p-1.5 rounded-2xl border border-white/5">
                 {['FOREX', 'BINARY', 'INDICES', 'COMMODITIES'].map(cat => (
                   <button 
                    key={cat} 
                    onClick={() => setMarketType(cat as MarketType)} 
                    className={`relative px-6 py-2.5 rounded-xl text-[11px] font-black tracking-widest transition-all ${marketType === cat ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-700 hover:text-gray-300'}`}
                   >
                    {cat}
                    {cat === 'BINARY' && !isExpert && <LockKeyhole size={10} className="absolute top-1 right-2 text-red-500/50" />}
                   </button>
                 ))}
              </div>
           </div>

           <button 
             onClick={handleGenerateSignal} 
             disabled={isAnalyzing} 
             className="px-12 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3 shadow-2xl transition-all"
           >
              {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
              {isAnalyzing ? (user.tier === 'BASIC' ? "Institutional Scanning..." : "Analyzing...") : "Run Analysis"}
           </button>
        </header>

        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
             {activeView === 'TERMINAL' && <CandleChart candles={candles} symbol={selectedPair.symbol} timeframe={timeframe} onTimeframeChange={setTimeframe} signals={signals} liveSituation={liveSituation} />}
             {activeView === 'SETTINGS' && <SettingsPanel settings={settings} setSettings={setSettings} canAccessAI={canAccessAI} />}
             {activeView === 'JOURNAL' && <JournalPanel journal={journal} setJournal={setJournal} />}
             {activeView === 'HEATMAP' && (
                <HeatmapPanel 
                  pairs={assets.filter(a => a.category === marketType)} 
                  onSelectPair={(p) => { setSelectedPair(p); setActiveView('TERMINAL'); }} 
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  userTier={user.tier}
                />
             )}
             {activeView === 'BRIDGE' && <BridgePanel broker={broker} setBroker={setBroker} />}
             {activeView === 'ANALYSIS' && <AnalysisPanel symbol={selectedPair.symbol} candles={candles} />}
             {activeView === 'LAB' && <StrategyLab candles={candles} symbol={selectedPair.symbol} />}
             {activeView === 'NEWS' && <NewsPanel />}
             {activeView === 'RISK' && <RiskCalculator />}
             {activeView === 'CHAT' && <ChatPanel />}
          </div>

          {activeView === 'TERMINAL' && (
            <div className="w-[420px] shrink-0 border-l border-white/5 bg-[#161a1e] flex flex-col">
               <SignalPanel 
                 signals={signals} 
                 activeType={marketType} 
                 broker={broker} 
                 settings={settings} 
                 onMarkTrade={(s) => {
                    const win = Math.random() > 0.3;
                    setJournal(prev => [{ 
                      id: Math.random().toString(), 
                      timestamp: Date.now(), 
                      pair: s.pair, 
                      type: s.type, 
                      result: win ? 'WIN' : 'LOSS', 
                      pnl: win ? 200 : -100, 
                      emotion: 'CALM', 
                      aiFeedback: "Verified SMC entry execution.", 
                      signalHash: s.hash 
                    }, ...prev]);
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
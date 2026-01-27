import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, Activity, Cpu, 
  Zap, LogOut, Fingerprint, Settings2,
  Users, CreditCard, CheckCircle, XCircle, Search, RefreshCw, Globe,
  TrendingUp, Clock, AlertTriangle, AlertCircle
} from 'lucide-react';
import { SystemState, User, Transaction, SubscriptionTier } from '../types';
import { authService } from '../services/authService';
import { paymentService } from '../services/paymentService';

interface Props {
  systemState: SystemState;
  onUpdateSystem: (updates: Partial<SystemState>) => void;
  onExit: () => void;
}

const AdminPortal: React.FC<Props> = ({ systemState, onUpdateSystem, onExit }) => {
  const [elevatedStep, setElevatedStep] = useState<'LOGIN' | 'PASSCODE' | 'COMMAND'>('LOGIN');
  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'USERS' | 'PAYMENTS'>('SYSTEM');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (elevatedStep === 'COMMAND') {
      refreshData();
    }
  }, [elevatedStep, activeTab]);

  const refreshData = () => {
    setAllUsers(authService.getAllUsers());
    setTransactions(paymentService.getAllTransactions().sort((a, b) => b.timestamp - a.timestamp));
  };

  const handleInitialAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await authService.login(email, pass);
      if (res && res.user.role === 'ADMIN') {
        setElevatedStep('PASSCODE');
      } else {
        setError('Unauthorized Administrator Access.');
      }
    } catch (err: any) {
      setError(err.message || 'Identity verification failed.');
    }
  };

  const handlePasscodeAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (authService.verifyAdminPasscode(passcode)) {
      setElevatedStep('COMMAND');
    } else {
      setError('Invalid Access Token.');
      setPasscode('');
    }
  };

  const handleTierUpdate = (userId: string, tier: SubscriptionTier) => {
    authService.updateUserSubscription(userId, tier);
    refreshData();
  };

  const toggleUserStatus = (userId: string, currentStatus: boolean) => {
    authService.updateUserSubscription(userId, allUsers.find(u => u.id === userId)?.tier || 'BASIC', !currentStatus);
    refreshData();
  };

  if (elevatedStep === 'LOGIN') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-blue-900/30 p-10 rounded-3xl shadow-2xl space-y-8 animate-in zoom-in-95 duration-500">
          <div className="text-center space-y-2">
            <Lock size={40} className="mx-auto text-blue-500 mb-2" />
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Overseer Auth</h2>
          </div>
          <form onSubmit={handleInitialAuth} className="space-y-4">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin ID" className="w-full bg-[#050505] border border-blue-900/20 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all text-sm font-bold" />
            <input type="password" required value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Master Key" className="w-full bg-[#050505] border border-blue-900/20 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all text-sm font-bold" />
            {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{error}</p>}
            <button type="submit" className="w-full bg-blue-700 hover:bg-blue-600 py-4 rounded-xl font-black text-white transition-all text-xs uppercase tracking-[0.2em]">Request Entrance</button>
          </form>
          <button onClick={onExit} className="w-full text-center text-gray-700 text-[10px] hover:text-white transition-all font-black uppercase tracking-widest">Shutdown</button>
        </div>
      </div>
    );
  }

  if (elevatedStep === 'PASSCODE') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-red-900/30 p-10 rounded-3xl shadow-2xl space-y-8">
          <div className="text-center space-y-2">
            <Fingerprint size={48} className="mx-auto text-red-500 mb-2" />
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Neural 2FA</h2>
          </div>
          <form onSubmit={handlePasscodeAuth} className="space-y-6">
            <input type="password" required value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="000000" className="w-full bg-[#050505] border border-red-900/20 p-5 rounded-xl text-center text-4xl tracking-widest text-red-500 outline-none font-black" autoFocus />
            {error && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest">{error}</p>}
            <button type="submit" className="w-full bg-red-700 hover:bg-red-600 py-4 rounded-xl font-black text-white transition-all text-xs uppercase tracking-[0.2em]">Open Command Node</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 flex flex-col">
      <header className="h-20 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-6 lg:px-10 shrink-0 shadow-2xl z-50 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-6 lg:gap-12 min-w-max">
          <div className="flex items-center gap-4">
            <ShieldCheck className="text-blue-500" size={32} />
            <h1 className="font-black text-white tracking-tighter text-2xl uppercase hidden sm:block">Master Node</h1>
          </div>
          <div className="flex bg-[#050505] p-1 rounded-2xl border border-white/5">
            {[
              { id: 'SYSTEM', label: 'NETWORK', icon: Cpu },
              { id: 'USERS', label: 'OPERATORS', icon: Users },
              { id: 'PAYMENTS', label: 'LEDGER', icon: CreditCard }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-4 lg:px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-white'}`}
              >
                <tab.icon size={14}/> {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 lg:gap-6 min-w-max ml-4">
           <button onClick={onExit} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-gray-600 hover:text-red-500 border border-white/5 font-black text-[10px] uppercase transition-all">
            <LogOut size={16} /> Close Hub
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar">
        {activeTab === 'SYSTEM' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#0a0a0a] p-8 rounded-[40px] border border-white/5 space-y-6 shadow-2xl">
               <div className="flex items-center gap-3 text-blue-500">
                  <TrendingUp size={24} />
                  <h3 className="font-black text-white uppercase tracking-tighter">Live Performance</h3>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/5 pb-4">
                     <span className="text-[10px] font-black text-gray-500 uppercase">Gross Revenue</span>
                     <span className="text-2xl font-black text-emerald-500 mono">${transactions.filter(t => t.status === 'SUCCESS').reduce((acc, t) => acc + (t.currency === 'USD' ? t.amount : t.amount / 1650), 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="flex justify-between items-end">
                     <span className="text-[10px] font-black text-gray-500 uppercase">Active Operators</span>
                     <span className="text-2xl font-black text-blue-500 mono">{allUsers.length}</span>
                  </div>
               </div>
            </div>
            
            <div className="md:col-span-2 bg-[#0a0a0a] p-8 rounded-[40px] border border-white/5 space-y-8 shadow-2xl">
               <h3 className="font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <Settings2 size={24} className="text-purple-500" /> Neural Control
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
                       <span>AI Threshold</span>
                       <span className="text-blue-500">{systemState.confidenceThreshold}%</span>
                    </label>
                    <input type="range" min="50" max="95" value={systemState.confidenceThreshold} onChange={(e) => onUpdateSystem({ confidenceThreshold: parseInt(e.target.value) })} className="w-full h-2 bg-[#050505] rounded-lg appearance-none cursor-pointer accent-blue-500" />
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-4 bg-[#050505] rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2">
                         <AlertTriangle className="text-red-500" size={16} />
                         <span className="text-[9px] font-black text-gray-500 uppercase">Emergency Protocol</span>
                      </div>
                      <button 
                        onClick={() => onUpdateSystem({ killSwitchActive: !systemState.killSwitchActive })} 
                        className={`w-12 h-6 rounded-full relative transition-all ${systemState.killSwitchActive ? 'bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-gray-800'}`}
                      >
                        <div className={`absolute top-1 size-4 bg-white rounded-full transition-all ${systemState.killSwitchActive ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-8">
            <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
              <h3 className="text-xl font-black text-white uppercase flex items-center gap-3">
                 <Users className="text-blue-500" /> Operator Registry
              </h3>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                <input 
                  type="text" 
                  placeholder="Scan Operator ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#050505] border border-white/10 pl-12 pr-4 py-3 rounded-2xl text-xs font-bold focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {allUsers.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                <div key={u.id} className="bg-[#0a0a0a] border border-white/5 p-6 rounded-[32px] flex flex-col md:flex-row justify-between items-center gap-6 hover:border-blue-500/30 transition-all group">
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="size-16 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-xl">
                       {u.name?.[0].toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-lg font-black text-white uppercase tracking-tighter">{u.name}</p>
                      <p className="text-[10px] text-gray-600 font-bold mono">{u.email}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${u.tier === 'INSTITUTIONAL' ? 'bg-red-500/10 text-red-500' : u.tier === 'PRO' ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                          {u.tier} NODE
                        </span>
                        <span className="text-[8px] text-gray-700 font-black uppercase">HWID: {u.hardwareId.slice(0, 10)}...</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
                    <div className="flex items-center gap-2 bg-[#050505] p-1.5 rounded-2xl border border-white/5">
                      {(['BASIC', 'PRO', 'INSTITUTIONAL'] as SubscriptionTier[]).map(t => (
                        <button 
                          key={t}
                          onClick={() => handleTierUpdate(u.id, t)}
                          className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${u.tier === t ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-700 hover:text-white'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => toggleUserStatus(u.id, u.subscription?.isActive ?? true)}
                      className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase transition-all flex items-center gap-2 ${u.subscription?.isActive !== false ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}
                    >
                      {u.subscription?.isActive !== false ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                      {u.subscription?.isActive !== false ? 'ACTIVE' : 'DEACTIVATED'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'PAYMENTS' && (
          <div className="space-y-8">
            <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 flex justify-between items-center">
              <h3 className="text-xl font-black text-white uppercase flex items-center gap-3">
                 <CreditCard className="text-emerald-500" /> Financial Ledger
              </h3>
              <button onClick={refreshData} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all"><RefreshCw size={18}/></button>
            </div>

            <div className="overflow-x-auto rounded-[32px] border border-white/5 bg-[#0a0a0a] shadow-2xl">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-[#050505] border-b border-white/5">
                    <th className="px-6 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">Gateway</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">Operator</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">Target Node</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">Sync Time</th>
                    <th className="px-6 py-5 text-[10px] font-black text-gray-600 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.length === 0 ? (
                    <tr>
                       <td colSpan={6} className="px-6 py-20 text-center opacity-20 italic text-sm">Awaiting initial financial handshake logs...</td>
                    </tr>
                  ) : (
                    transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${tx.gateway === 'FLUTTERWAVE' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                <Globe size={14}/>
                              </div>
                              <span className="text-[10px] font-black text-white uppercase">{tx.gateway}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-[10px] font-black text-gray-300">{tx.userEmail}</p>
                          <p className="text-[8px] text-gray-700 mono">Ref: {tx.reference}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-black text-emerald-500 mono">{tx.amount.toLocaleString()} {tx.currency}</p>
                          {tx.currency === 'NGN' && (
                             <p className="text-[8px] text-gray-600 font-bold">~${(tx.amount / 1650).toFixed(2)} USD</p>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-[8px] font-black px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-lg uppercase">{tx.tier}</span>
                        </td>
                        <td className="px-6 py-5 text-[10px] text-gray-500">
                          <div className="flex items-center gap-2">
                            <Clock size={12}/> {new Date(tx.timestamp).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`flex items-center gap-2 ${tx.status === 'SUCCESS' ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {tx.status === 'SUCCESS' ? <CheckCircle size={14}/> : <RefreshCw size={14} className="animate-spin"/>}
                            <span className="text-[10px] font-black uppercase tracking-widest">{tx.status}</span>
                            {tx.verificationSource && (
                               <span className="text-[7px] text-gray-700 border border-gray-800 px-1 rounded">{tx.verificationSource}</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPortal;

import React, { useState } from 'react';
import { 
  ShieldCheck, Zap, CreditCard, Check, Loader2, Lock, 
  ArrowRight, Globe, AlertCircle, ExternalLink, RefreshCw, 
  XCircle, RotateCcw 
} from 'lucide-react';
import { User, SubscriptionTier, PaymentGateway, Transaction } from '../types';
import { paymentService } from '../services/paymentService';

interface Props {
  user: User;
  onSuccess: (tier: SubscriptionTier) => void;
  onCancel: () => void;
}

const PLANS = [
  { id: 'PRO' as SubscriptionTier, name: 'Pro Intelligence', price: 49, features: ['AI Manipulation Guard', 'MT5 Bridge Sync', 'Advanced SMC Logic', 'Priority Signal Node'] },
  { id: 'INSTITUTIONAL' as SubscriptionTier, name: 'Institutional', price: 199, features: ['Global Order Block Feed', 'Admin Direct Channel', '10ms Execution Port', 'Strategy Lab Access'] }
];

const SubscriptionPortal: React.FC<Props> = ({ user, onSuccess, onCancel }) => {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('PRO');
  const [gateway, setGateway] = useState<PaymentGateway>('PAYSTACK');
  const [stage, setStage] = useState<'IDLE' | 'INITIATING' | 'AWAITING_PAYMENT' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [activeRef, setActiveRef] = useState<string>('');
  const [authUrl, setAuthUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const activePlan = PLANS.find(p => p.id === selectedTier)!;

  const handleProcessPayment = async () => {
    setStage('INITIATING');
    setErrorMessage('');
    
    try {
      const response = await paymentService.initialize(user, gateway, selectedTier, activePlan.price);
      
      setActiveRef(response.reference);
      setAuthUrl(response.authUrl);
      
      // CRITICAL: Ensure we use the full absolute URL for window.open
      // If window.open fails (popup blocker), we fall back to location.assign
      const checkoutWindow = window.open(response.authUrl, '_blank', 'noopener,noreferrer');
      
      if (!checkoutWindow) {
        // Fallback to current window redirect if popup is blocked
        window.location.assign(response.authUrl);
      }

      setStage('AWAITING_PAYMENT');
    } catch (e: any) {
      setErrorMessage(e.message || "Financial handshake timed out.");
      setStage('ERROR');
    }
  };

  const handleManualVerify = async () => {
    setStage('VERIFYING');
    setErrorMessage('');
    
    try {
      const tx = await paymentService.verify(activeRef, user);
      if (tx && tx.status === 'SUCCESS') {
        setStage('SUCCESS');
        setTimeout(() => onSuccess(selectedTier), 1500);
      } else {
        setErrorMessage("Gateway has not confirmed payment yet. Check your mobile app.");
        setStage('ERROR');
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Ledger verification rejected.");
      setStage('ERROR');
    }
  };

  const handleRetry = () => {
    setStage('IDLE');
    setErrorMessage('');
    setActiveRef('');
    setAuthUrl('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b0e11]/98 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-[#161a1e] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[650px]">
        
        {/* Left Panel: Plan Configuration */}
        <div className="flex-1 p-8 md:p-12 space-y-8 border-b md:border-b-0 md:border-r border-white/5">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3 tracking-tighter uppercase">
                <Zap className="text-blue-500" size={32} /> Activation Hub
              </h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">Securely provision institutional trading logic to your account node.</p>
            </div>
            <button onClick={onCancel} className="p-2 text-gray-700 hover:text-white transition-colors">
              <XCircle size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {PLANS.map(plan => (
              <button 
                key={plan.id}
                disabled={stage !== 'IDLE'}
                onClick={() => setSelectedTier(plan.id)}
                className={`w-full p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden group ${selectedTier === plan.id ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.1)]' : 'bg-[#0b0e11] border-white/5 hover:border-white/10 opacity-50 hover:opacity-100'}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedTier === plan.id ? 'text-blue-500' : 'text-gray-500'}`}>{plan.id} ARCHITECTURE</span>
                    <h4 className="text-white font-black text-lg">{plan.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white">${plan.price}</span>
                    <span className="text-[10px] text-gray-600 block uppercase font-bold">Initial Provision</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                      <Check size={12} className="text-blue-500" /> {f}
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
          
          <div className="pt-6 border-t border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-3 text-[10px] text-gray-600 uppercase font-black tracking-widest">
               <ShieldCheck size={18} className="text-emerald-500"/> AES-256 INFRASTRUCTURE
             </div>
             <p className="text-[10px] text-gray-700 font-bold uppercase tracking-tighter">Linked Identity: {user.email}</p>
          </div>
        </div>

        {/* Right Panel: Transaction Processor */}
        <div className="w-full md:w-[420px] bg-[#0b0e11] p-10 flex flex-col justify-between relative overflow-hidden">
          
          {/* Global Stage Overlay */}
          {(stage !== 'IDLE') && (
            <div className="absolute inset-0 z-50 bg-[#0b0e11] flex flex-col items-center justify-center p-10 text-center space-y-8 animate-in fade-in duration-300">
               {stage === 'SUCCESS' ? (
                 <div className="size-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.4)] animate-in zoom-in">
                    <Check size={48} className="text-white" />
                 </div>
               ) : stage === 'ERROR' ? (
                 <div className="size-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center animate-in shake">
                    <AlertCircle size={48} className="text-red-500" />
                 </div>
               ) : (
                 <div className="relative">
                   <div className="size-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <Lock size={20} className="text-blue-500/50" />
                   </div>
                 </div>
               )}

               <div className="space-y-3">
                  <h3 className="text-xl font-black text-white tracking-tighter uppercase">
                    {stage === 'INITIATING' && 'Securing Link...'}
                    {stage === 'AWAITING_PAYMENT' && 'Checkout Active'}
                    {stage === 'VERIFYING' && 'Auditing Ledger...'}
                    {stage === 'SUCCESS' && 'Verified'}
                    {stage === 'ERROR' && 'Alert'}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                    {stage === 'AWAITING_PAYMENT' && `Please complete the payment in the external window.`}
                    {stage === 'ERROR' && errorMessage}
                    {stage !== 'AWAITING_PAYMENT' && stage !== 'ERROR' && `NODE_REF: ${activeRef}`}
                  </p>
               </div>

               {stage === 'AWAITING_PAYMENT' && (
                 <div className="w-full space-y-4">
                    <button onClick={handleManualVerify} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-white text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all">
                      <ShieldCheck size={18} /> Confirm Payment
                    </button>
                    <a href={authUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase hover:text-white transition-colors">
                      <ExternalLink size={12}/> Resume Checkout
                    </a>
                 </div>
               )}

               {(stage === 'ERROR') && (
                 <button onClick={handleRetry} className="w-full py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                    <RotateCcw size={14}/> Request New Reference
                 </button>
               )}
            </div>
          )}

          <div className="space-y-10">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest px-1">Infrastructure Gateway</p>
              <div className="space-y-3">
                <button 
                  onClick={() => setGateway('PAYSTACK')}
                  className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${gateway === 'PAYSTACK' ? 'bg-blue-600/5 border-blue-500 text-white' : 'bg-transparent border-white/5 text-gray-600 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-xl flex items-center justify-center transition-all ${gateway === 'PAYSTACK' ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-white/5'}`}><CreditCard size={24} className={gateway === 'PAYSTACK' ? 'text-white' : 'text-gray-700'} /></div>
                    <div className="text-left">
                      <span className="text-base font-black block leading-none">Paystack</span>
                      <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] mt-1 block">NGN NODE</span>
                    </div>
                  </div>
                  {gateway === 'PAYSTACK' && <Check size={20} className="text-blue-500" />}
                </button>
                <button 
                  onClick={() => setGateway('FLUTTERWAVE')}
                  className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${gateway === 'FLUTTERWAVE' ? 'bg-orange-600/5 border-orange-500 text-white' : 'bg-transparent border-white/5 text-gray-600 hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`size-12 rounded-xl flex items-center justify-center transition-all ${gateway === 'FLUTTERWAVE' ? 'bg-orange-600 shadow-lg shadow-orange-600/30' : 'bg-white/5'}`}><Globe size={24} className={gateway === 'FLUTTERWAVE' ? 'text-white' : 'text-gray-700'} /></div>
                    <div className="text-left">
                      <span className="text-base font-black block leading-none">Flutterwave</span>
                      <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] mt-1 block">GLOBAL USD NODE</span>
                    </div>
                  </div>
                  {gateway === 'FLUTTERWAVE' && <Check size={20} className="text-orange-500" />}
                </button>
              </div>
            </div>

            <div className="p-8 bg-[#161a1e] rounded-3xl border border-white/5 space-y-4 shadow-inner">
               <div className="flex justify-between items-center text-2xl font-black text-white tracking-tighter">
                  <span className="text-gray-700 uppercase text-[11px] tracking-widest font-black">Provisioning</span>
                  <span className="text-blue-500">${activePlan.price}.00</span>
               </div>
               <div className="flex justify-between items-center text-[10px] text-gray-700 font-bold uppercase tracking-widest">
                  <span>Provider Fee</span>
                  <span className="mono">0.00%</span>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <button onClick={handleProcessPayment} className="w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20">
              Establish External Link <ArrowRight size={18} />
            </button>
            <p className="text-[9px] text-gray-800 font-bold text-center uppercase tracking-widest leading-none">Security Protocol ACTIVE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPortal;

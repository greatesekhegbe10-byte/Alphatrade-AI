
import React, { useState } from 'react';
import { 
  ShieldCheck, Zap, CreditCard, Check, Loader2, Lock, 
  ArrowRight, Globe, AlertCircle, RefreshCw, XCircle, RotateCcw,
  ExternalLink, CheckCircle2
} from 'lucide-react';
import { User, SubscriptionTier, PaymentGateway } from '../types';
import { paymentService } from '../services/paymentService';

interface Props {
  user: User;
  onSuccess: (tier: SubscriptionTier) => void;
  onCancel: () => void;
}

const PLANS = [
  { id: 'PRO' as SubscriptionTier, name: 'Pro Intelligence', price: 49, features: ['AI Manipulation Guard', 'MT5 Bridge Sync', 'Advanced SMC Logic'] },
  { id: 'INSTITUTIONAL' as SubscriptionTier, name: 'Institutional', price: 199, features: ['Global Order Block Feed', 'Admin Direct Channel', '10ms Execution Port'] }
];

const SubscriptionPortal: React.FC<Props> = ({ user, onSuccess, onCancel }) => {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('PRO');
  const [gateway, setGateway] = useState<PaymentGateway>('PAYSTACK');
  const [stage, setStage] = useState<'IDLE' | 'INITIATING' | 'REDIRECTING' | 'SIMULATED_SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const activePlan = PLANS.find(p => p.id === selectedTier)!;

  const handleProcessPayment = async () => {
    setStage('INITIATING');
    setErrorMessage('');
    
    try {
      const response = await paymentService.initialize(user, gateway, selectedTier, activePlan.price);
      
      // If we are in simulation, show a success dialog instead of breaking the browser
      if (response.authUrl.includes('demo-')) {
        console.log("[SIMULATION] Bypassing actual redirect for demo environment.");
        setTimeout(() => {
          setStage('SIMULATED_SUCCESS');
        }, 1200);
      } else {
        setStage('REDIRECTING');
        setTimeout(() => {
          window.location.assign(response.authUrl);
        }, 800);
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Financial handshake failed.");
      setStage('ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b0e11]/98 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="w-full max-w-5xl bg-[#161a1e] border border-white/5 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.2)] flex flex-col md:flex-row min-h-[600px]">
        
        <div className="flex-1 p-8 md:p-12 space-y-10 border-r border-white/5">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-4 tracking-tighter uppercase leading-none">
                <Zap className="text-blue-500" size={32} /> Tier Upgrade
              </h2>
              <p className="text-gray-500 text-sm font-medium">Elevate your node to institutional standards.</p>
            </div>
            <button onClick={onCancel} className="p-2 text-gray-700 hover:text-white transition-colors">
              <XCircle size={24} />
            </button>
          </div>

          <div className="space-y-4">
            {PLANS.map(plan => (
              <button 
                key={plan.id}
                onClick={() => setSelectedTier(plan.id)}
                className={`w-full p-8 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${selectedTier === plan.id ? 'bg-blue-600/10 border-blue-500' : 'bg-[#0b0e11] border-white/5 opacity-40 hover:opacity-100'}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedTier === plan.id ? 'text-blue-500' : 'text-gray-500'}`}>{plan.id} NODE</span>
                    <h4 className="text-white font-black text-xl mt-1">{plan.name}</h4>
                  </div>
                  <span className="text-3xl font-black text-white">${plan.price}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {plan.features.map(f => (
                    <div key={f} className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                      <Check size={14} className="text-blue-500" /> {f}
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full md:w-[420px] bg-[#0b0e11] p-10 flex flex-col justify-between relative">
          
          {stage !== 'IDLE' && (
            <div className="absolute inset-0 z-[60] bg-[#0b0e11] flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
               {stage === 'INITIATING' ? (
                 <>
                   <Loader2 className="animate-spin text-blue-500" size={64} />
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Securing Link</h3>
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Authenticating via AES-256 Tunnel...</p>
                 </>
               ) : stage === 'REDIRECTING' ? (
                 <>
                   <RefreshCw className="animate-spin text-emerald-500" size={64} />
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Handshake OK</h3>
                   <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em]">Handoff to Secure Gateway...</p>
                 </>
               ) : stage === 'SIMULATED_SUCCESS' ? (
                 <>
                   <div className="p-6 bg-emerald-500/10 rounded-full">
                     <CheckCircle2 className="text-emerald-500" size={64} />
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter text-emerald-500">Demo Success</h3>
                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.1em] leading-relaxed">
                       Handshake completed via Simulation Bridge.<br/>
                       In production, this redirects to the gateway.
                     </p>
                   </div>
                   <button 
                     onClick={() => onSuccess(selectedTier)}
                     className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all"
                   >
                     Provision Node Now
                   </button>
                 </>
               ) : (
                 <>
                   <AlertCircle className="text-red-500" size={64} />
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Link Failure</h3>
                   <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                      <p className="text-[10px] text-red-400 font-bold leading-relaxed">{errorMessage}</p>
                   </div>
                   <button onClick={() => setStage('IDLE')} className="w-full py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-3">
                      <RotateCcw size={16}/> Retry Sync
                   </button>
                 </>
               )}
            </div>
          )}

          <div className="space-y-10">
            <p className="text-[11px] font-black text-gray-700 uppercase tracking-[0.3em]">Select Channel</p>
            <div className="space-y-4">
              <button 
                onClick={() => setGateway('PAYSTACK')}
                className={`w-full p-8 rounded-3xl border-2 transition-all flex items-center gap-6 ${gateway === 'PAYSTACK' ? 'bg-blue-600/5 border-blue-500 text-white shadow-lg shadow-blue-600/10' : 'bg-transparent border-white/5 text-gray-600'}`}
              >
                <CreditCard size={32} className={gateway === 'PAYSTACK' ? 'text-blue-500' : 'text-gray-700'} />
                <div className="text-left">
                  <span className="text-lg font-black block leading-none">Paystack</span>
                  <span className="text-[10px] font-bold text-gray-600 uppercase mt-2 block">Direct Bank & Card</span>
                </div>
              </button>
              
              <button 
                onClick={() => setGateway('FLUTTERWAVE')}
                className={`w-full p-8 rounded-3xl border-2 transition-all flex items-center gap-6 ${gateway === 'FLUTTERWAVE' ? 'bg-orange-600/5 border-orange-500 text-white shadow-lg shadow-orange-600/10' : 'bg-transparent border-white/5 text-gray-600'}`}
              >
                <Globe size={32} className={gateway === 'FLUTTERWAVE' ? 'text-orange-500' : 'text-gray-700'} />
                <div className="text-left">
                  <span className="text-lg font-black block leading-none">Flutterwave</span>
                  <span className="text-[10px] font-bold text-gray-600 uppercase mt-2 block">Global USD Settlement</span>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
              <Lock className="text-gray-700" size={16} />
              <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest leading-tight">
                256-Bit SSL Encryption<br/>Verified Transaction Port
              </p>
            </div>
            
            <button 
              onClick={handleProcessPayment} 
              className="w-full py-7 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-500 text-white shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95"
            >
              Initialize Node <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPortal;

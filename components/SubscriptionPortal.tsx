import React, { useState } from 'react';
import { 
  ShieldCheck, Zap, CreditCard, Check, Loader2, Lock, 
  ArrowRight, Globe, AlertCircle, RefreshCw, XCircle, RotateCcw
} from 'lucide-react';
import { User, SubscriptionTier, PaymentGateway } from '../types';
import { paymentService } from '../services/paymentService';

interface Props {
  user: User;
  onSuccess: (tier: SubscriptionTier) => void;
  onCancel: () => void;
}

const PLANS = [
  { id: 'PRO' as SubscriptionTier, name: 'Pro Intelligence', price: 49, features: ['Full Forex Signals', 'MT5 Bridge Sync', 'Candlestick Detection', 'News Filtering'] },
  { id: 'INSTITUTIONAL' as SubscriptionTier, name: 'Institutional Expert', price: 199, features: ['AI Confirmations', 'Binary Options', 'Strategy Marketplace', 'Priority Alerts'] }
];

const FX_RATE = 1650;

const SubscriptionPortal: React.FC<Props> = ({ user, onSuccess, onCancel }) => {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('PRO');
  const [gateway, setGateway] = useState<PaymentGateway>('FLUTTERWAVE');
  const [stage, setStage] = useState<'IDLE' | 'INITIATING' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const activePlan = PLANS.find(p => p.id === selectedTier)!;

  const handleProcessPayment = async () => {
    setStage('INITIATING');
    setErrorMessage('');
    
    // SECURE PROXY CALL
    const response = await paymentService.initialize(
      user, 
      gateway, 
      selectedTier, 
      activePlan.price
    );
    
    if (response.success && response.checkout_url) {
      // Redirect Browser to Official Hosted Page (or Simulation)
      window.location.assign(response.checkout_url);
    } else {
      setErrorMessage(response.error || "Gateway Handshake Failed. Verify Node Integrity.");
      setStage('ERROR');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b0e11]/98 backdrop-blur-3xl animate-in fade-in duration-500 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#161a1e] border border-white/5 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(37,99,235,0.2)] flex flex-col md:flex-row min-h-[600px] my-auto">
        
        {/* Left: Tiers (Scrollable on Mobile) */}
        <div className="flex-1 p-8 md:p-12 space-y-10 border-b md:border-b-0 md:border-r border-white/5">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-4 tracking-tighter uppercase leading-none">
                <ShieldCheck className="text-blue-500" size={32} /> Tier Activation
              </h2>
              <p className="text-gray-500 text-sm font-medium">Elevate your node capability to Pro or Expert.</p>
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
                className={`w-full p-8 rounded-3xl border-2 transition-all text-left relative overflow-hidden group ${selectedTier === plan.id ? 'bg-blue-600/10 border-blue-500 shadow-xl' : 'bg-[#0b0e11] border-white/5 opacity-40 hover:opacity-100'}`}
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedTier === plan.id ? 'text-blue-500' : 'text-gray-500'}`}>{plan.id} LEVEL</span>
                    <h4 className="text-white font-black text-xl mt-1">{plan.name}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-white block">${plan.price}</span>
                    <span className="text-[10px] font-bold text-gray-600 uppercase">Per Cycle</span>
                  </div>
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

        {/* Right: Handshake Node */}
        <div className="w-full md:w-[420px] bg-[#0b0e11] p-10 flex flex-col justify-between relative">
          
          {stage !== 'IDLE' && (
            <div className="absolute inset-0 z-[60] bg-[#0b0e11] flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
               {stage === 'INITIATING' ? (
                 <>
                   <Loader2 className="animate-spin text-blue-500" size={64} />
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Establishing Link</h3>
                   <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Negotiating Official {gateway} Node...</p>
                 </>
               ) : (
                 <>
                   <AlertCircle className="text-red-500" size={64} />
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Handshake Error</h3>
                   <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                      <p className="text-[10px] text-red-400 font-bold leading-relaxed italic">{errorMessage}</p>
                   </div>
                   <button onClick={() => setStage('IDLE')} className="w-full py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase rounded-2xl flex items-center justify-center gap-3">
                      <RotateCcw size={16}/> Retry Sync
                   </button>
                 </>
               )}
            </div>
          )}

          <div className="space-y-10">
            <p className="text-[11px] font-black text-gray-700 uppercase tracking-[0.3em]">Select Gateway</p>
            <div className="space-y-4">
              <button 
                onClick={() => setGateway('FLUTTERWAVE')}
                className={`w-full p-8 rounded-3xl border-2 transition-all flex items-center gap-6 ${gateway === 'FLUTTERWAVE' ? 'bg-orange-600/5 border-orange-500 text-white shadow-lg' : 'bg-transparent border-white/5 text-gray-600'}`}
              >
                <Globe size={32} className={gateway === 'FLUTTERWAVE' ? 'text-orange-500' : 'text-gray-700'} />
                <div className="text-left">
                  <span className="text-lg font-black block leading-none">Flutterwave</span>
                  <span className="text-[10px] font-bold text-gray-600 uppercase mt-2 block">Direct USD Handshake</span>
                </div>
              </button>

              <button 
                onClick={() => setGateway('PAYSTACK')}
                className={`w-full p-8 rounded-3xl border-2 transition-all flex items-center gap-6 ${gateway === 'PAYSTACK' ? 'bg-blue-600/5 border-blue-500 text-white shadow-lg' : 'bg-transparent border-white/5 text-gray-600'}`}
              >
                <CreditCard size={32} className={gateway === 'PAYSTACK' ? 'text-blue-500' : 'text-gray-700'} />
                <div className="text-left">
                  <span className="text-lg font-black block leading-none">Paystack</span>
                  <span className="text-[10px] font-bold text-gray-600 uppercase mt-2 block">NGN (Rate: {FX_RATE})</span>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-6 mt-8">
            <div className="p-6 bg-white/5 rounded-[32px] border border-white/5 space-y-2">
               <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Settlement Amount</p>
                  <p className="text-[8px] font-black text-blue-500 uppercase">{gateway === 'PAYSTACK' ? 'CONVERTED' : 'STANDARD'}</p>
               </div>
               <div className="flex items-baseline justify-between">
                  <p className="text-3xl font-black text-white">
                    {gateway === 'FLUTTERWAVE' ? `$${activePlan.price}` : `₦${(activePlan.price * FX_RATE).toLocaleString()}`}
                  </p>
                  <p className="text-[10px] font-bold text-gray-700 uppercase">Verified</p>
               </div>
            </div>
            
            <button 
              onClick={handleProcessPayment} 
              className="w-full py-7 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] bg-blue-600 hover:bg-blue-500 text-white shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95"
            >
              Secure Activation <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPortal;
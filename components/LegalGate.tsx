
import React from 'react';
import { ShieldAlert, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  onAccept: () => void;
}

const LegalGate: React.FC<Props> = ({ onAccept }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-[#0b0e11] flex items-center justify-center p-6 backdrop-blur-3xl">
      <div className="max-w-xl w-full bg-[#161a1e] border border-red-500/20 rounded-[40px] p-10 space-y-8 shadow-[0_0_100px_rgba(239,68,68,0.1)]">
        <div className="text-center space-y-4">
           <div className="size-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
              <ShieldAlert className="text-red-500" size={40} />
           </div>
           <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Legal Compliance Node</h2>
           <p className="text-gray-500 text-sm font-medium">Mandatory Financial Risk Disclosure v1.02</p>
        </div>

        <div className="bg-[#0b0e11] p-6 rounded-3xl border border-white/5 space-y-4 max-h-64 overflow-y-auto custom-scrollbar">
           <div className="space-y-4 text-xs text-gray-400 font-medium leading-relaxed">
              <p className="flex items-start gap-3">
                 <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={14} />
                 <span><strong>Risk Disclosure:</strong> Trading Forex and Binary Options involves significant risk of loss and is not suitable for all investors. You may lose your entire initial deposit.</span>
              </p>
              <p className="flex items-start gap-3">
                 <ShieldCheck className="text-blue-500 shrink-0 mt-0.5" size={14} />
                 <span><strong>Non-Financial Advice:</strong> AlphaTrade AI signals are for educational and informational purposes only. No signal constitutes financial, legal, or tax advice.</span>
              </p>
              <p className="flex items-start gap-3">
                 <Check className="text-green-500 shrink-0 mt-0.5" size={14} />
                 <span><strong>Piracy Protection:</strong> This software is node-locked to your hardware identity. Re-distribution or unauthorized copying is strictly prohibited and monitored.</span>
              </p>
           </div>
        </div>

        <div className="space-y-4">
           <p className="text-[10px] text-gray-600 font-bold text-center uppercase tracking-widest">By clicking "Establish Secure Link", you agree to all terms of use.</p>
           <button 
             onClick={onAccept}
             className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95"
           >
             Establish Secure Link
           </button>
        </div>
      </div>
    </div>
  );
};

export default LegalGate;

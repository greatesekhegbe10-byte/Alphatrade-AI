
import React, { useState } from 'react';
import { Calculator, Shield, Target, TrendingUp, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

const RiskCalculator: React.FC = () => {
  const [balance, setBalance] = useState(1000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [slPips, setSlPips] = useState(20);
  const [pipValue, setPipValue] = useState(10); // Standard lot default

  const riskAmount = (balance * riskPercent) / 100;
  const lotSize = riskAmount / (slPips * pipValue);

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto bg-[#0b0e11] animate-in fade-in duration-500">
      <div className="space-y-1">
        <h2 className="text-3xl font-black flex items-center gap-3 uppercase tracking-tighter">
          <Calculator className="text-blue-500" size={32} /> Position Sizer
        </h2>
        <p className="text-gray-500 text-sm font-medium">Precision risk management node for professional execution.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#161a1e] border border-white/5 p-10 rounded-[40px] space-y-10 shadow-2xl">
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Account Balance (USD)</label>
                <input 
                  type="number" value={balance} onChange={(e) => setBalance(Number(e.target.value))}
                  className="w-full bg-[#0b0e11] border border-white/5 p-5 rounded-3xl text-xl font-black text-white mono outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Risk %</label>
                    <input 
                      type="number" step="0.1" value={riskPercent} onChange={(e) => setRiskPercent(Number(e.target.value))}
                      className="w-full bg-[#0b0e11] border border-white/5 p-5 rounded-3xl text-xl font-black text-white mono outline-none focus:border-blue-500 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest px-1">Stop Loss (Pips)</label>
                    <input 
                      type="number" value={slPips} onChange={(e) => setSlPips(Number(e.target.value))}
                      className="w-full bg-[#0b0e11] border border-white/5 p-5 rounded-3xl text-xl font-black text-white mono outline-none focus:border-blue-500 transition-all"
                    />
                 </div>
              </div>
           </div>

           <div className="p-8 bg-blue-500/5 border border-blue-500/10 rounded-[32px] space-y-4">
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2"><Shield size={14}/> Risk Summary</p>
              <div className="flex justify-between items-end">
                 <div>
                    <p className="text-[11px] font-black text-gray-600 uppercase">Cash at Risk</p>
                    <p className="text-3xl font-black text-red-500">${riskAmount.toFixed(2)}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[11px] font-black text-gray-600 uppercase">Recommended Lot</p>
                    <p className="text-3xl font-black text-emerald-500">{lotSize.toFixed(2)}</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-6">
           <div className="bg-[#161a1e] border border-white/5 p-8 rounded-[40px] shadow-2xl space-y-6">
              <h3 className="font-black text-white flex items-center gap-3 text-lg">
                <Layers size={20} className="text-purple-500" /> Contract Sizes
              </h3>
              <div className="space-y-3">
                 {[
                   { label: 'Standard Lot', val: '1.00', units: '100,000' },
                   { label: 'Mini Lot', val: '0.10', units: '10,000' },
                   { label: 'Micro Lot', val: '0.01', units: '1,000' }
                 ].map((c, i) => (
                   <div key={i} className="flex justify-between items-center p-4 bg-[#0b0e11] rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black text-gray-400 uppercase">{c.label}</span>
                      <div className="text-right">
                         <p className="text-sm font-black text-white mono">{c.val}</p>
                         <p className="text-[8px] text-gray-700 uppercase font-black">{c.units} Units</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
           
           <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[40px] flex items-center gap-6">
              <ShieldCheck className="text-emerald-500" size={40} />
              <p className="text-xs text-gray-500 font-medium leading-relaxed italic">"Risk management is the only holy grail in trading. Never exceed your established per-trade node limit."</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RiskCalculator;

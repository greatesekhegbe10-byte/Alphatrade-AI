
import React from 'react';
import { JournalEntry } from '../types';
import { Book, History, Plus, TrendingUp, TrendingDown, Clock, Smile, Frown, Brain } from 'lucide-react';

interface Props {
  journal: JournalEntry[];
  setJournal: React.Dispatch<React.SetStateAction<JournalEntry[]>>;
}

const JournalPanel: React.FC<Props> = ({ journal, setJournal }) => {
  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto bg-[#0b0e11] animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-3xl font-black flex items-center gap-3">
            <Book className="text-blue-500" size={32} /> Trade Journal
          </h2>
          <p className="text-gray-500 text-sm">Document your trading psychology and results for AI refinement.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-all">
          <Plus size={16}/> LOG MANUAL TRADE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#161a1e] p-5 rounded-2xl border border-[#1e2329] space-y-1">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Win Rate</p>
          <p className="text-3xl font-black text-green-500">68.4%</p>
        </div>
        <div className="bg-[#161a1e] p-5 rounded-2xl border border-[#1e2329] space-y-1">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total P/L</p>
          <p className="text-3xl font-black text-blue-400">+$2,450</p>
        </div>
        <div className="bg-[#161a1e] p-5 rounded-2xl border border-[#1e2329] space-y-1">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Avg RR</p>
          <p className="text-3xl font-black text-gray-200">1:2.1</p>
        </div>
        <div className="bg-[#161a1e] p-5 rounded-2xl border border-[#1e2329] space-y-1">
          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">AI Accuracy</p>
          <p className="text-3xl font-black text-emerald-500">82%</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-500 mb-2 px-2">
           <History size={16} />
           <span className="text-[10px] font-black uppercase tracking-widest">Execution History</span>
        </div>
        
        {journal.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#161a1e] rounded-3xl border border-dashed border-[#2b2f36] space-y-4">
            <Book size={40} className="text-gray-700 opacity-20" />
            <p className="text-gray-500 text-sm font-bold">No trades recorded in this session.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {journal.map(entry => (
              <div key={entry.id} className="bg-[#161a1e] border border-[#1e2329] rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group">
                <div className="flex flex-wrap md:flex-nowrap">
                  <div className={`w-2 shrink-0 ${entry.result === 'WIN' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-[10px] text-gray-600 font-black uppercase">{new Date(entry.timestamp).toLocaleString()}</p>
                          <h3 className="text-lg font-black">{entry.pair}</h3>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${entry.type.includes('BUY') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{entry.type}</span>
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${entry.result === 'WIN' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{entry.result}</span>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-black ${entry.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {entry.pnl >= 0 ? '+' : '-'}${Math.abs(entry.pnl).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1 justify-end text-gray-500 mt-1">
                           <Smile size={12}/> <span className="text-[10px] font-bold">{entry.emotion}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#0b0e11] p-4 rounded-xl border border-white/5 space-y-2">
                       <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                         <Brain size={12}/> AI Review & Feedback
                       </p>
                       <p className="text-xs text-gray-400 italic">"{entry.aiFeedback}"</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalPanel;

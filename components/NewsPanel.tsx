import React from 'react';
import { Calendar, Clock, Globe, AlertCircle, Info } from 'lucide-react';
import { MOCK_NEWS_EVENTS } from '../services/newsService';

const NewsPanel: React.FC = () => {
  return (
    <div className="p-4 sm:p-8 space-y-8 h-full overflow-y-auto bg-[#0b0e11] animate-in fade-in duration-500 pb-24">
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-3 uppercase tracking-tighter">
          <Calendar className="text-blue-500" size={32} /> Economic Calendar
        </h2>
        <p className="text-gray-500 text-sm font-medium">Real-time fundamental data streams for Global Markets.</p>
      </div>

      <div className="space-y-4 pb-12">
        {MOCK_NEWS_EVENTS.map(event => (
          <div key={event.id} className="bg-[#161a1e] border border-white/5 rounded-[32px] p-6 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-blue-500/20 transition-all">
            <div className="flex items-center gap-6 flex-1 w-full md:w-auto">
               <div className={`size-14 rounded-[20px] flex items-center justify-center font-black text-xs border shrink-0 ${event.impact === 'HIGH' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                  {event.impact === 'HIGH' ? '!!!' : '!!'}
               </div>
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-2">
                    <Globe size={12}/> {event.currency} • {new Date(event.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </p>
                 <h4 className="text-white font-black text-lg uppercase tracking-tight">{event.title}</h4>
               </div>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
              <div className="flex-1 md:w-24 bg-[#0b0e11] p-3 rounded-2xl border border-white/5 text-center">
                 <p className="text-[8px] font-black text-gray-700 uppercase">Forecast</p>
                 <p className="text-sm font-black text-white mono">{event.forecast || 'N/A'}</p>
              </div>
              <div className="flex-1 md:w-24 bg-[#0b0e11] p-3 rounded-2xl border border-white/5 text-center">
                 <p className="text-[8px] font-black text-gray-700 uppercase">Previous</p>
                 <p className="text-sm font-black text-gray-500 mono">{event.previous || 'N/A'}</p>
              </div>
              {event.impact === 'HIGH' && (
                <div className="hidden sm:flex items-center justify-center px-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                   <AlertCircle size={20} className="text-red-500 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsPanel;
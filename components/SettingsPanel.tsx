
import React from 'react';
import { Shield, Bell, Moon, Sun, Monitor, Save, User, BookOpen } from 'lucide-react';
import { UserSettings, TradingPersonality, LearningMode } from '../types';

interface Props {
  settings: UserSettings;
  setSettings: (s: UserSettings) => void;
}

const SettingsPanel: React.FC<Props> = ({ settings, setSettings }) => {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 h-full overflow-y-auto">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">User Preferences</h2>
        <p className="text-gray-500 text-sm">Configure your AI analysis and personality profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Trading Profile */}
        <section className="bg-[#161a1e] p-6 rounded-xl border border-[#1e2329] space-y-6">
          <div className="flex items-center gap-3">
            <User className="text-blue-500" />
            <h3 className="font-bold">Trading Personality</h3>
          </div>
          <div className="space-y-3">
            {(['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'] as TradingPersonality[]).map(p => (
              <button 
                key={p}
                onClick={() => setSettings({ ...settings, personality: p })}
                className={`w-full text-left p-3 rounded border transition-all ${
                  settings.personality === p ? 'bg-blue-600/10 border-blue-500 text-blue-400' : 'bg-[#0b0e11] border-[#2b2f36] text-gray-500'
                }`}
              >
                <p className="text-xs font-bold">{p}</p>
                <p className="text-[10px] opacity-70">
                  {p === 'CONSERVATIVE' && "High accuracy, few signals. Avoids all high-impact news."}
                  {p === 'BALANCED' && "Standard risk-to-reward. Optimal for intraday trading."}
                  {p === 'AGGRESSIVE' && "Scaps during high volatility. Includes momentum breakouts."}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Learning Mode */}
        <section className="bg-[#161a1e] p-6 rounded-xl border border-[#1e2329] space-y-6">
          <div className="flex items-center gap-3">
            <BookOpen className="text-emerald-500" />
            <h3 className="font-bold">Learning Mode</h3>
          </div>
          <div className="flex bg-[#0b0e11] p-1 rounded-lg border border-[#2b2f36]">
            {(['BEGINNER', 'PRO'] as LearningMode[]).map(m => (
              <button 
                key={m}
                onClick={() => setSettings({ ...settings, learningMode: m })}
                className={`flex-1 py-2 rounded text-xs font-bold transition-all ${
                  settings.learningMode === m ? 'bg-[#1e2329] text-white shadow-lg' : 'text-gray-500'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-gray-500">
            {settings.learningMode === 'BEGINNER' 
              ? "Beginner mode provides extra technical explanations and risk definitions with every signal." 
              : "Pro mode offers a clean, minimal interface focused on raw data and speed."}
          </p>
        </section>
      </div>

      <div className="flex justify-end pt-4">
        <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-500 transition-all">
          <Save size={18} /> Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, User, Cpu, Loader2 } from 'lucide-react';
import { ChatMessage } from '../types';
import { getChatResponse } from '../services/geminiService';

const ChatPanel: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'AI', text: 'Alpha Node Online. How can I assist your analysis today?', timestamp: Date.now() }
  ]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userText = input;
    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'USER', text: userText, timestamp: Date.now() };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await getChatResponse(userText);
      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        sender: 'AI', 
        text: responseText, 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        sender: 'AI', 
        text: "Connection to neural mainframe unstable. Retrying handshake...", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col bg-[#0b0e11] animate-in fade-in duration-500">
      <div className="space-y-1 mb-8">
        <h2 className="text-3xl font-black flex items-center gap-3 uppercase tracking-tighter">
          <MessageSquare className="text-blue-500" size={32} /> Command Hub
        </h2>
        <p className="text-gray-500 text-sm font-medium">Real-time operator node communication.</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar pb-6 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] flex items-start gap-4 ${msg.sender === 'USER' ? 'flex-row-reverse' : ''}`}>
              <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 border ${msg.sender === 'AI' ? 'bg-blue-600/10 border-blue-500/20 text-blue-500' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                {msg.sender === 'AI' ? <Cpu size={20}/> : <User size={20}/>}
              </div>
              <div className={`p-5 rounded-[24px] text-[13px] font-medium leading-relaxed ${msg.sender === 'USER' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#161a1e] text-gray-300 border border-white/5 rounded-tl-none shadow-xl'}`}>
                 {msg.text}
                 <p className="text-[8px] opacity-40 mt-2 font-black uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="max-w-[80%] flex items-start gap-4">
                <div className="size-10 rounded-2xl flex items-center justify-center shrink-0 border bg-blue-600/10 border-blue-500/20 text-blue-500">
                  <Cpu size={20}/>
                </div>
                <div className="p-4 rounded-[24px] bg-[#161a1e] border border-white/5 rounded-tl-none shadow-xl flex items-center gap-2">
                   <Loader2 size={16} className="animate-spin text-blue-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Processing...</span>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex gap-3 bg-[#161a1e] p-2 rounded-[32px] border border-white/5 shadow-2xl">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Transmit command to Alpha Node..."
          disabled={isLoading}
          className="flex-1 bg-transparent border-none pl-6 pr-4 py-4 text-sm font-bold text-white outline-none placeholder:text-gray-700 disabled:opacity-50"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="size-14 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 rounded-full flex items-center justify-center text-white transition-all shadow-xl active:scale-90"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
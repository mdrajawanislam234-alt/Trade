
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Trade } from '../types';
import { Brain, Sparkles, MessageSquare, Send, RefreshCcw, TrendingUp, AlertCircle, Trophy } from 'lucide-react';

interface AIAnalystProps {
  trades: Trade[];
}

const AIAnalyst: React.FC<AIAnalystProps> = ({ trades }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, analysis]);

  const generateReview = async () => {
    setLoading(true);
    setAnalysis('');
    
    try {
      // Filter trades for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const last7DaysTrades = trades.filter(t => new Date(t.date) >= sevenDaysAgo);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const tradeSummary = last7DaysTrades.map(t => ({
        symbol: t.symbol,
        pnl: t.pnl,
        status: t.status,
        strategy: t.strategy,
        notes: t.notes,
        emotion: t.emotionScale,
        direction: t.direction
      }));

      const prompt = `As an Elite Hedge Fund Performance Coach and Trading Psychologist, review my trading performance for the LAST 7 DAYS.
      
      Performance Data: ${JSON.stringify(tradeSummary)}
      
      Please provide a structured response in Markdown:
      1. **7-Day Executive Summary**: How did I do overall? (Be direct).
      2. **The "Truth" (Mistakes Identified)**: Analyze my notes and emotion scales. Did I revenge trade? Was my R:R poor? Did I hesitate? Point out specific flaws.
      3. **Performance Verdict & Motivation**: 
         - If my P&L is negative or performance is poor: Provide a powerful, empathetic motivational message to prevent a spiral. Remind me that losses are tuition for market wisdom.
         - If performance is good: Remind me to stay humble and stick to the process.
      4. **The "Drill" for Next Week**: One specific, actionable exercise to fix my biggest mistake.
      
      Note: Use a professional yet supportive tone. If I've had many losses, be a mentor, not just an analyst.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });

      setAnalysis(response.text || "I couldn't generate an analysis. Please try again.");
    } catch (error) {
      console.error("AI Analysis Error:", error);
      setAnalysis("Error: Failed to connect to the AI coach. Please ensure your API Key is valid.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const context = trades.slice(-10).map(t => `${t.symbol}: ${t.status} ($${t.pnl})`).join(', ');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Context: My recent trades are [${context}]. Question: ${userMsg}`,
      });

      setChatHistory(prev => [...prev, { role: 'ai', text: response.text || "I'm not sure how to answer that." }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "Sorry, I'm having trouble thinking right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
      {/* Left Panel: 7-Day Performance Review */}
      <div className="bg-[#151921] border border-[#2d3748] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#2d3748] flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Brain className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white uppercase text-sm tracking-widest">7-Day Alpha Coach</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase tracking-tighter border border-indigo-500/30">New Engine</span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Psychology & Error Analysis</p>
            </div>
          </div>
          <button 
            onClick={generateReview}
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 border border-indigo-400/20 active:scale-95"
          >
            {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {analysis ? 'Reset Review' : 'Analyze Week'}
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          {!analysis && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
              <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center border border-slate-700 shadow-inner">
                <Brain className="w-10 h-10 text-slate-500" />
              </div>
              <div className="max-w-xs">
                <p className="text-white text-xs font-black uppercase tracking-widest mb-2">Performance Mentor Offline</p>
                <p className="text-slate-400 text-[11px] leading-relaxed">Let's audit your last 7 days. I'll identify your trading errors and help you find the motivation to keep going.</p>
              </div>
            </div>
          )}

          {loading && !analysis && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-500/20 animate-pulse"></div>
                 <div className="h-2.5 bg-slate-800 rounded-full w-48 animate-pulse"></div>
              </div>
              <div className="space-y-3 pl-11">
                <div className="h-2 bg-slate-800 rounded-full w-full animate-pulse"></div>
                <div className="h-2 bg-slate-800 rounded-full w-5/6 animate-pulse"></div>
                <div className="h-2 bg-slate-800 rounded-full w-4/6 animate-pulse"></div>
              </div>
              <div className="h-32 bg-slate-800/30 rounded-2xl border border-slate-700/50 animate-pulse"></div>
            </div>
          )}

          {analysis && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="bg-[#0b0e14]/80 backdrop-blur-sm rounded-2xl p-6 border border-[#2d3748] shadow-2xl space-y-6">
                 {/* Motivation Header */}
                 <div className="flex items-start gap-4 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10 mb-4">
                    <Trophy className="w-8 h-8 text-indigo-400 shrink-0 mt-1" />
                    <div>
                       <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Mentor's Perspective</h4>
                       <p className="text-[11px] text-slate-300 italic leading-relaxed">"The goal is not to be perfect. The goal is to be consistently disciplined. Let's look at what we can fix."</p>
                    </div>
                 </div>

                 <div className="prose prose-invert prose-sm max-w-none text-slate-300">
                   {analysis.split('\n').map((line, i) => {
                     const isHeader = line.startsWith('###') || line.startsWith('**');
                     return (
                        <p key={i} className={`mb-3 leading-relaxed text-[13px] ${isHeader ? 'text-white font-black uppercase tracking-wider mt-6 first:mt-0' : 'text-slate-400'}`}>
                          {line.replace(/###|\*\*/g, '')}
                        </p>
                     );
                   })}
                 </div>
                 
                 <div className="pt-6 border-t border-[#2d3748] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Always verify AI advice with your own strategy.</span>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Coach Chat */}
      <div className="bg-[#151921] border border-[#2d3748] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-[#2d3748] bg-gradient-to-r from-[#00E396]/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00E396]/20 rounded-lg">
              <MessageSquare className="w-5 h-5 text-[#00E396]" />
            </div>
            <div>
              <h3 className="font-bold text-white uppercase text-sm tracking-widest">Strategy Chat</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">On-Demand Coaching</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#0b0e14]">
          {chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 italic text-slate-500 text-[11px] px-10 leading-loose">
              <p className="uppercase font-black tracking-widest mb-4 not-italic opacity-50">Operational Queries</p>
              "Ask me about specific setups, risk management, or psychological hurdles you're facing today."
            </div>
          )}
          {chatHistory.map((chat, i) => (
            <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-1 duration-300`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] shadow-lg ${
                chat.role === 'user' 
                ? 'bg-[#8B5CF6] text-white font-bold' 
                : 'bg-[#151921] border border-[#2d3748] text-slate-200'
              }`}>
                {chat.text}
              </div>
            </div>
          ))}
          {loading && chatHistory[chatHistory.length-1]?.role === 'user' && (
            <div className="flex justify-start">
              <div className="bg-[#1a202c] border border-slate-700 p-3 rounded-2xl text-slate-200">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#1a202c]/50 border-t border-[#2d3748]">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex gap-2"
          >
            <input 
              type="text" 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Talk to your coach..." 
              className="flex-1 bg-[#0b0e14] border border-[#2d3748] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#00E396] transition-all placeholder:text-slate-600 font-bold uppercase tracking-wider"
            />
            <button 
              type="submit"
              disabled={!chatMessage.trim() || loading}
              className="p-3.5 bg-[#00E396] text-slate-950 rounded-xl hover:bg-[#00c985] disabled:bg-slate-700 disabled:text-slate-500 transition-all shadow-lg shadow-[#00E396]/20 active:scale-90"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAnalyst;

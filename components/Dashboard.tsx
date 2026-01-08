
import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, 
  CartesianGrid, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell 
} from 'recharts';
import { Trade } from '../types';
import { getPerformanceMetrics, getEquityCurve } from '../utils/calculations';
import Heatmap from './Heatmap';
import { Info, TrendingUp, Filter, Calendar, ChevronDown, Download, Activity, Target, Zap, Clock, ExternalLink } from 'lucide-react';

interface DashboardProps {
  trades: Trade[];
}

const Dashboard: React.FC<DashboardProps> = ({ trades }) => {
  const metrics = useMemo(() => getPerformanceMetrics(trades), [trades]);
  const equityData = useMemo(() => getEquityCurve(trades).slice(-30), [trades]);

  const radarData = [
    { subject: 'Win %', A: metrics.winRate, fullMark: 100 },
    { subject: 'P. Factor', A: Math.min(metrics.profitFactor * 20, 100), fullMark: 100 },
    { subject: 'Avg R:R', A: Math.min(metrics.avgRR * 25, 100), fullMark: 100 },
    { subject: 'Consistency', A: 85, fullMark: 100 },
    { subject: 'Risk Mgmt', A: 92, fullMark: 100 },
  ];

  const dailyPnlData = useMemo(() => {
    const last14Days = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayTrades = trades.filter(t => t.date === dateStr);
      return {
        date: dateStr.split('-').slice(1).join('/'),
        pnl: dayTrades.reduce((acc, t) => acc + t.pnl, 0)
      };
    });
    return last14Days;
  }, [trades]);

  return (
    <div className="space-y-6">
      {/* 5-Column Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Net P&L */}
        <div className="bg-[#151921] border border-[#2d3748] rounded-2xl p-4 flex flex-col justify-between h-32 relative group overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net P&L</span>
              <Info size={12} className="text-slate-600 cursor-help" />
            </div>
            <ExternalLink size={14} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="z-10">
            <div className="text-2xl font-black font-mono text-white tracking-tight">${metrics.totalPnl.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase mt-1 flex items-center gap-2">
              <span className="text-[#00E396]">{metrics.totalTrades} Trades</span>
              <div className="w-1 h-1 rounded-full bg-slate-700"></div>
              <span>${(metrics.totalPnl / (metrics.totalTrades || 1)).toFixed(2)} Avg</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E396]/5 blur-3xl -mr-12 -mt-12 pointer-events-none"></div>
        </div>

        {/* Card 2: Trade Expectancy */}
        <div className="bg-[#151921] border border-[#2d3748] rounded-2xl p-4 flex flex-col justify-between h-32">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trade Expectancy</span>
            <Info size={12} className="text-slate-600" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white tracking-tight">${(metrics.totalPnl / (metrics.totalTrades || 1)).toFixed(2)}</div>
            <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Portfolio expectancy score</div>
          </div>
        </div>

        {/* Card 3: Profit Factor Gauge */}
        <div className="bg-[#151921] border border-[#2d3748] rounded-2xl p-4 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Profit Factor</span>
              <Info size={12} className="text-slate-600" />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black font-mono text-white">{metrics.profitFactor.toFixed(2)}</div>
            <div className="relative w-12 h-12 transform rotate-180">
              <svg className="w-full h-full" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#2d3748" strokeWidth="4" />
                <circle cx="20" cy="20" r="16" fill="none" stroke="#00E396" strokeWidth="4" 
                  strokeDasharray={`${Math.min(metrics.profitFactor / 3, 1) * 50} 100`} strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 4: Win Rate Donut */}
        <div className="bg-[#151921] border border-[#2d3748] rounded-2xl p-4 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Win %</span>
              <div className="flex items-center gap-1 ml-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-[#00E396]"></span>
                 <span className="text-[8px] text-slate-600">{trades.filter(t => t.status === 'WIN').length}</span>
                 <span className="w-1.5 h-1.5 rounded-full bg-[#FF4560] ml-1"></span>
                 <span className="text-[8px] text-slate-600">{trades.filter(t => t.status === 'LOSS').length}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black font-mono text-white">{metrics.winRate.toFixed(1)}%</div>
            <div className="relative w-12 h-12">
               <svg className="w-full h-full transform -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#2d3748" strokeWidth="3" />
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#8B5CF6" strokeWidth="3" 
                    strokeDasharray={`${metrics.winRate} 100`} strokeLinecap="round" />
               </svg>
            </div>
          </div>
        </div>

        {/* Card 5: Avg Win/Loss Bar */}
        <div className="bg-[#151921] border border-[#2d3748] rounded-2xl p-4 flex flex-col justify-between h-32">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg win/loss trade</span>
            <Info size={12} className="text-slate-600" />
          </div>
          <div>
            <div className="text-2xl font-black font-mono text-white">2.4 <span className="text-[10px] text-slate-500 uppercase">Ratio</span></div>
            <div className="mt-2 h-1.5 flex rounded-full overflow-hidden bg-slate-800">
              <div className="h-full bg-[#00E396]" style={{ width: '65%' }}></div>
              <div className="h-full bg-[#FF4560]" style={{ width: '35%' }}></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[8px] font-bold text-[#00E396]">$34.82</span>
              <span className="text-[8px] font-bold text-[#FF4560]">$51.32</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Middle Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Zella Score Radar */}
        <div className="lg:col-span-4 bg-[#151921] border border-[#2d3748] rounded-2xl p-6 flex flex-col h-[400px]">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
               <Zap size={14} className="text-purple-400" /> Alpha Edge Score
             </h3>
             <div className="text-2xl font-black font-mono text-[#00E396]">81</div>
           </div>
           
           <div className="flex-1 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                 <PolarGrid stroke="#2d3748" />
                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                 <Radar name="Score" dataKey="A" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
               </RadarChart>
             </ResponsiveContainer>
           </div>
           
           <div className="mt-4 flex items-center justify-center gap-8 text-[10px] font-bold uppercase text-slate-500">
             <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Current</div>
             <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-slate-700"></span> Baseline</div>
           </div>
        </div>

        {/* Performance Charts */}
        <div className="lg:col-span-8 grid grid-cols-1 gap-6">
           {/* Cumulative Chart */}
           <div className="bg-[#151921] border border-[#2d3748] rounded-2xl p-6 flex flex-col h-[188px]">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Daily Net Cumulative P&L</h3>
                 <Info size={12} className="text-slate-600" />
              </div>
              <div className="flex-1">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityData}>
                       <defs>
                          <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#00E396" stopOpacity={0.2}/>
                             <stop offset="95%" stopColor="#00E396" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis dataKey="date" hide />
                       <YAxis hide domain={['auto', 'auto']} />
                       <Area type="monotone" dataKey="balance" stroke="#00E396" strokeWidth={2} fill="url(#curveGrad)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Bar Chart */}
           <div className="bg-[#151921] border border-[#2d3748] rounded-2xl p-6 flex flex-col h-[188px]">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Net Daily P&L</h3>
                 <Info size={12} className="text-slate-600" />
              </div>
              <div className="flex-1">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyPnlData}>
                       <XAxis dataKey="date" hide />
                       <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                          {dailyPnlData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#00E396' : '#FF4560'} />
                          ))}
                       </Bar>
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>

      {/* Bottom Grid: Full Width Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
        <div className="lg:col-span-12 h-[500px]">
          <Heatmap trades={trades} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

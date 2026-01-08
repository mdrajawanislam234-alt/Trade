
import React, { useMemo } from 'react';
import { Trade } from '../types';
import { getPeriodMetrics } from '../utils/calculations';
import { TrendingUp, Target, BarChart, Shield, Zap, Info, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ReportsProps {
  trades: Trade[];
}

const Reports: React.FC<ReportsProps> = ({ trades }) => {
  const metrics30 = useMemo(() => getPeriodMetrics(trades, 30), [trades]);
  const metrics90 = useMemo(() => getPeriodMetrics(trades, 90), [trades]);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-[0.2em]">Institutional Performance</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-2">Comparative Analytics Engine</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <div className="px-4 py-2 bg-[#151921] border border-[#2d3748] rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400">Live Feed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 30 Day Report */}
        <PeriodCard title="Last 30 Days" metrics={metrics30} color="text-[#00E396]" accent="bg-[#00E396]/10" />
        
        {/* 90 Day Report */}
        <PeriodCard title="Last 90 Days" metrics={metrics90} color="text-indigo-400" accent="bg-indigo-400/10" />
      </div>

      {/* Comparison Insights */}
      <div className="bg-[#151921] border border-[#2d3748] rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-500/20 rounded-lg">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-xs font-black text-white uppercase tracking-widest">Momentum Differential</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
           <InsightItem 
             label="Net Velocity" 
             value={metrics30.totalPnl > metrics90.totalPnl / 3 ? 'Accelerating' : 'Decelerating'} 
             diff={((metrics30.totalPnl / (metrics90.totalPnl || 1)) * 100).toFixed(0) + '% contribution'}
           />
           <InsightItem 
             label="Efficiency Delta" 
             value={metrics30.profitFactor > metrics90.profitFactor ? 'Rising' : 'Falling'} 
             diff={`${(metrics30.profitFactor - metrics90.profitFactor).toFixed(2)} PF points`}
           />
           <InsightItem 
             label="Risk Consistency" 
             value={metrics30.winRate > metrics90.winRate ? 'Optimizing' : 'Deviating'} 
             diff={`${(metrics30.winRate - metrics90.winRate).toFixed(1)}% WR shift`}
           />
        </div>
      </div>
    </div>
  );
};

const PeriodCard = ({ title, metrics, color, accent }: { title: string, metrics: any, color: string, accent: string }) => (
  <div className="bg-[#151921] border border-[#2d3748] rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all hover:border-[#4a5568]">
    <div className={`p-8 border-b border-[#2d3748] flex justify-between items-center ${accent}`}>
      <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">{title}</h3>
      <div className="text-2xl font-black font-mono text-white">
        ${metrics.totalPnl.toLocaleString(undefined, { minimumFractionDigits: 0 })}
      </div>
    </div>
    
    <div className="p-8 grid grid-cols-2 gap-8">
      <MetricItem icon={<TrendingUp size={16} />} label="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} subValue={`${metrics.totalTrades} Executions`} />
      <MetricItem icon={<Shield size={16} />} label="Profit Factor" value={metrics.profitFactor.toFixed(2)} subValue="Risk efficiency" />
      <MetricItem icon={<Target size={16} />} label="Avg R:R" value={metrics.avgRR.toFixed(2)} subValue="Reward per unit risk" />
      <MetricItem icon={<BarChart size={16} />} label="Drawdown" value={`${metrics.maxDrawdown.toFixed(1)}%`} subValue="Peak to trough" />
    </div>

    <div className="px-8 pb-8 mt-auto">
       <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
         <div className={`h-full ${color.replace('text', 'bg')}`} style={{ width: `${Math.min(metrics.winRate, 100)}%` }}></div>
       </div>
       <div className="flex justify-between mt-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
         <span>Consistency Scale</span>
         <span>{metrics.winRate.toFixed(0)}% Alpha</span>
       </div>
    </div>
  </div>
);

const MetricItem = ({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue: string }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 rounded-xl bg-[#0b0e14] border border-[#2d3748] flex items-center justify-center text-slate-500 shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-white font-mono leading-none">{value}</p>
      <p className="text-[8px] font-bold text-slate-600 uppercase mt-1.5">{subValue}</p>
    </div>
  </div>
);

const InsightItem = ({ label, value, diff }: { label: string, value: string, diff: string }) => (
  <div>
    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">{label}</p>
    <div className="flex items-baseline gap-3">
      <h4 className="text-xl font-black text-white uppercase tracking-tight">{value}</h4>
      {value.includes('Accelerating') || value.includes('Rising') || value.includes('Optimizing') ? (
        <ArrowUpRight size={14} className="text-[#00E396]" />
      ) : (
        <ArrowDownRight size={14} className="text-[#FF4560]" />
      )}
    </div>
    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">{diff}</p>
  </div>
);

export default Reports;

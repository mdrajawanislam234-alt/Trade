
import React from 'react';
import { Trade, TradeDirection } from '../types';
import { ChevronRight, Trash2, Calendar, Target, Activity } from 'lucide-react';

interface TradeListProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
}

const TradeList: React.FC<TradeListProps> = ({ trades, onEdit, onDelete }) => {
  const sortedTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div className="bg-[#151921] border border-[#2d3748] rounded-2xl shadow-lg overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-[#2d3748] flex justify-between items-center bg-[#151921]/50 backdrop-blur-md">
        <div>
           <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] leading-none">Trade History Archive</h3>
           <p className="text-[9px] text-slate-500 mt-2 uppercase font-bold tracking-widest">Master Ledger • {trades.length} Records</p>
        </div>
        <div className="flex gap-2">
          <button className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5 transition-all">Filter</button>
          <button className="text-[10px] font-black text-[#00E396] hover:bg-[#00E396]/10 uppercase tracking-widest bg-[#00E396]/5 px-4 py-2 rounded-xl border border-[#00E396]/20 transition-all">Export CSV</button>
        </div>
      </div>
      
      <div className="overflow-x-auto w-full custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="text-slate-500 text-[9px] uppercase tracking-[0.2em] border-b border-[#2d3748] bg-[#0b0e14]/50">
              <th className="px-6 py-5 font-black">Execution Date</th>
              <th className="px-6 py-5 font-black">Asset & Direction</th>
              <th className="px-6 py-5 font-black">Entry / Exit</th>
              <th className="px-6 py-5 font-black">Position Size</th>
              <th className="px-6 py-5 font-black">Strategy & Logic</th>
              <th className="px-6 py-5 font-black">Net P&L ($)</th>
              <th className="px-6 py-5 font-black">ROI %</th>
              <th className="px-6 py-5 font-black text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d3748]/30">
            {sortedTrades.map(trade => (
              <tr 
                key={trade.id} 
                className="hover:bg-white/[0.02] active:bg-white/[0.04] transition-colors group cursor-pointer"
                onClick={() => onEdit(trade)}
              >
                <td className="px-6 py-5">
                  <div className="text-[10px] text-slate-200 flex items-center gap-2 font-black uppercase">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {new Date(trade.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1.5">
                    <div className="font-mono font-black text-xs text-white tracking-wider">{trade.symbol}</div>
                    <div className="flex">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-md border ${trade.direction === TradeDirection.LONG ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                        {trade.direction}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Entry</span>
                        <span className="font-mono font-bold text-[11px] text-slate-300">{trade.entryPrice.toLocaleString()}</span>
                      </div>
                      <ChevronRight size={10} className="text-slate-700 mt-2" />
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Exit</span>
                        <span className="font-mono font-bold text-[11px] text-slate-300">{trade.exitPrice.toLocaleString()}</span>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex flex-col">
                      <span className="font-mono font-black text-xs text-slate-200">{trade.size.toLocaleString()}</span>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Volume Units</span>
                   </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-1">
                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                       <Target size={12} /> {trade.strategy}
                    </div>
                    <div className="text-[9px] text-slate-500 font-medium truncate max-w-[150px] leading-tight">
                      {trade.notes || "No log notes entered."}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className={`font-mono font-black text-sm ${trade.status === 'WIN' ? 'text-[#00E396]' : trade.status === 'LOSS' ? 'text-[#FF4560]' : 'text-slate-400'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-2">
                     <div className={`w-1 h-3 rounded-full ${trade.roi >= 0 ? 'bg-[#00E396]' : 'bg-[#FF4560]'}`}></div>
                     <span className="font-mono text-xs font-black text-slate-300">
                       {trade.roi.toFixed(2)}%
                     </span>
                   </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center gap-4 justify-end">
                    <button 
                      onClick={(e) => handleDelete(e, trade.id)}
                      className="p-2.5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg group-hover:bg-[#8B5CF6]/20 transition-all">
                       <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {trades.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-24 text-center">
                   <div className="flex flex-col items-center gap-4 opacity-30">
                      <Activity className="w-12 h-12" />
                      <div className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Ledger Empty</div>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeList;

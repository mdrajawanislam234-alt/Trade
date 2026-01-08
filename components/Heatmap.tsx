
import React, { useMemo, useState } from 'react';
import { Trade } from '../types';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface HeatmapProps {
  trades: Trade[];
}

const Heatmap: React.FC<HeatmapProps> = ({ trades }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const weeks: any[][] = [];
    let currentWeek: any[] = [];
    
    // Padding for first week
    for (let i = 0; i < firstDayOfMonth; i++) {
      currentWeek.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTrades = trades.filter(t => t.date === dateStr);
      
      const netPnl = dayTrades.reduce((acc, t) => acc + t.pnl, 0);
      const count = dayTrades.length;

      currentWeek.push({
        day,
        dateStr,
        netPnl,
        count,
        status: count === 0 ? 'empty' : netPnl > 0 ? 'win' : netPnl < 0 ? 'loss' : 'breakeven'
      });
      
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  }, [trades, currentDate]);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <div className="bg-[#151921] border border-[#2d3748] rounded-2xl flex flex-col h-full shadow-2xl relative overflow-hidden">
      {/* Calendar Header */}
      <div className="p-4 border-b border-[#2d3748] flex items-center justify-between bg-[#151921]/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex gap-1 bg-black/40 rounded-lg p-1 border border-white/5">
            <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white">
              <ChevronRight size={16} />
            </button>
          </div>
          <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{monthName} {year}</span>
        </div>
        <Info size={16} className="text-slate-600" />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-[#2d3748]/30">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 flex-1 min-h-[420px]">
          {calendarData.flat().map((day, idx) => (
            <div 
              key={idx} 
              className={`border-b border-r border-[#2d3748]/30 relative transition-all group overflow-hidden ${
                !day ? 'bg-[#0b0e14]/10' : 'hover:bg-white/[0.02]'
              }`}
            >
              {day && (
                <>
                  <span className="absolute top-2 right-3 text-[10px] font-mono font-bold text-slate-700 group-hover:text-slate-400 transition-colors">
                    {String(day.day).padStart(2, '0')}
                  </span>
                  
                  {day.count > 0 && (
                    <div className={`absolute inset-[3px] rounded-lg flex flex-col items-center justify-center pointer-events-none transition-all shadow-lg ${
                      day.status === 'win' ? 'bg-[#00E396]/20 border border-[#00E396]/30' : 
                      day.status === 'loss' ? 'bg-[#FF4560]/20 border border-[#FF4560]/30' : 
                      'bg-slate-800/40 border border-slate-700/50'
                    }`}>
                      <div className={`text-[11px] font-black font-mono leading-none ${day.netPnl >= 0 ? 'text-[#00E396]' : 'text-[#FF4560]'}`}>
                        ${Math.abs(day.netPnl) >= 1000 ? (day.netPnl / 1000).toFixed(1) + 'K' : day.netPnl.toFixed(0)}
                      </div>
                      <div className="text-[7px] font-black text-slate-500 uppercase mt-1 opacity-80">
                        {day.count} {day.count === 1 ? 'trade' : 'trades'}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Heatmap;

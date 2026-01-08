
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, trend }) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-[#00E396]';
    if (trend === 'down') return 'text-[#FF4560]';
    return 'text-white';
  };

  return (
    <div className="bg-[#151921] border border-[#2d3748] rounded-xl p-3 sm:p-5 shadow-lg flex flex-col justify-between hover:border-[#4a5568] transition-all active:scale-[0.98]">
      <span className="text-slate-400 text-[9px] sm:text-xs font-semibold uppercase tracking-wider truncate">{label}</span>
      <div className="mt-1.5 sm:mt-2 flex items-baseline gap-1.5 overflow-hidden">
        <span className={`text-base sm:text-xl lg:text-2xl font-bold font-mono truncate ${getTrendColor()}`}>
          {value}
        </span>
        {subValue && (
          <span className="text-slate-500 text-[10px] sm:text-sm truncate">{subValue}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
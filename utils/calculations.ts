
import { Trade, PerformanceMetrics, EquityPoint, TradeDirection } from '../types';
import { INITIAL_BALANCE } from '../constants';

export const calculateTradeMetrics = (
  entry: number, 
  exit: number, 
  size: number, 
  direction: TradeDirection
) => {
  const pnl = direction === TradeDirection.LONG 
    ? (exit - entry) * size 
    : (entry - exit) * size;
  
  const roi = (pnl / (entry * size)) * 100;
  
  // Simplified R:R for the demo - usually requires Stop Loss input
  const rrRatio = pnl > 0 ? (pnl / Math.abs(pnl * 0.5)) : 0; 

  const status = pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'BREAKEVEN';

  return { pnl, roi, rrRatio, status };
};

export const getPerformanceMetrics = (trades: Trade[]): PerformanceMetrics => {
  if (trades.length === 0) {
    return {
      totalPnl: 0,
      winRate: 0,
      profitFactor: 0,
      avgRR: 0,
      currentStreak: 0,
      maxDrawdown: 0,
      totalTrades: 0
    };
  }

  const totalPnl = trades.reduce((acc, t) => acc + t.pnl, 0);
  const wins = trades.filter(t => t.status === 'WIN');
  const losses = trades.filter(t => t.status === 'LOSS');
  
  const winRate = (wins.length / trades.length) * 100;
  
  const grossProfit = wins.reduce((acc, t) => acc + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((acc, t) => acc + t.pnl, 0));
  const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
  
  const avgRR = trades.length > 0 ? trades.reduce((acc, t) => acc + t.rrRatio, 0) / trades.length : 0;

  // Streak calculation
  let currentStreak = 0;
  for (let i = trades.length - 1; i >= 0; i--) {
    if (trades[i].status === 'WIN') currentStreak++;
    else if (trades[i].status === 'LOSS') break;
  }

  // Drawdown
  let peak = INITIAL_BALANCE;
  let balance = INITIAL_BALANCE;
  let maxDD = 0;
  
  trades.forEach(t => {
    balance += t.pnl;
    if (balance > peak) peak = balance;
    const dd = ((peak - balance) / peak) * 100;
    if (dd > maxDD) maxDD = dd;
  });

  return {
    totalPnl,
    winRate,
    profitFactor,
    avgRR,
    currentStreak,
    maxDrawdown: maxDD,
    totalTrades: trades.length
  };
};

export const getPeriodMetrics = (trades: Trade[], days: number) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  
  const periodTrades = trades.filter(t => new Date(t.date) >= cutoff);
  return getPerformanceMetrics(periodTrades);
};

export const getEquityCurve = (trades: Trade[]): EquityPoint[] => {
  let currentBalance = INITIAL_BALANCE;
  const points: EquityPoint[] = [{ date: 'Start', balance: currentBalance }];
  
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  sortedTrades.forEach(t => {
    currentBalance += t.pnl;
    points.push({
      date: t.date,
      balance: currentBalance
    });
  });
  
  return points;
};

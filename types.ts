
export enum TradeDirection {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export interface Trade {
  id: string;
  symbol: string;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  size: number;
  pnl: number;
  roi: number;
  rrRatio: number;
  date: string;
  strategy: string;
  emotionScale: number;
  notes: string;
  status: 'WIN' | 'LOSS' | 'BREAKEVEN';
  entryScreenshot?: string;
  exitScreenshot?: string;
}

export interface PerformanceMetrics {
  totalPnl: number;
  winRate: number;
  profitFactor: number;
  avgRR: number;
  currentStreak: number;
  maxDrawdown: number;
  totalTrades: number;
}

export interface EquityPoint {
  date: string;
  balance: number;
}


export enum TradeType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export interface OHLC {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: TradeType;
  openPrice: number;
  lotSize: number;
  tp?: number;
  sl?: number;
  timestamp: number;
  status: 'OPEN' | 'CLOSED';
  closePrice?: number;
  profit?: number;
}

export interface MarketState {
  symbol: string;
  price: number;
  change24h: number;
  history: OHLC[];
  bias: number; 
  counterTradeEnabled: boolean;
}

export interface UserAccount {
  balance: number;
  equity: number;
  marginUsed: number;
  freeMargin: number;
}

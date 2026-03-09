
import { OHLC } from '../types';

/**
 * Generates the next candle based on current price, admin bias, and user volume bias.
 * If users buy heavily, bias shifts negative. If they sell, bias shifts positive.
 */
export const generateNextCandle = (
  lastClose: number, 
  adminBias: number, 
  buyVolume: number, 
  sellVolume: number,
  counterTradeEnabled: boolean
): OHLC => {
  // 1-minute volatility is higher than ticks
  const volatility = 0.0012; 
  
  // Counter-Trade logic: 
  // If buyVolume > sellVolume, we push price DOWN (negative bias)
  let userBias = 0;
  if (counterTradeEnabled) {
    const volumeDiff = buyVolume - sellVolume;
    // Stronger effect for counter-trading
    userBias = -volumeDiff * 0.0008; 
  }

  const totalBias = adminBias + userBias;
  
  // Base movement: random + bias
  const baseMovement = (Math.random() - 0.5) * volatility + totalBias;
  
  const open = lastClose;
  const close = Math.max(0.0001, open + baseMovement);
  
  // Realistic wicks for a 1-minute candle
  const high = Math.max(open, close) + Math.random() * (volatility * 0.4);
  const low = Math.min(open, close) - Math.random() * (volatility * 0.4);

  // Time stamp for the "1m" bar
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    time: timeString,
    open,
    high,
    low,
    close
  };
};

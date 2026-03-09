
import React from 'react';
import { Trade, TradeType } from '../types';
import { X, ArrowUpRight, ArrowDownRight, History } from 'lucide-react';

interface TradeHistoryProps {
  trades: Trade[];
  currentPrice: number;
  onClose?: (id: string) => void;
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ trades, currentPrice, onClose }) => {
  if (trades.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-[11px] text-slate-600 font-bold uppercase tracking-widest italic opacity-50">
        No active orders
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto select-none">
      <table className="w-full text-left text-[11px] font-mono border-collapse">
        <thead className="bg-[#2a2a2a] text-slate-500 sticky top-0">
          <tr className="border-b border-[#3c3c3c]">
            <th className="px-4 py-1.5 font-normal">Ticket</th>
            <th className="px-4 py-1.5 font-normal">Time</th>
            <th className="px-4 py-1.5 font-normal">Type</th>
            <th className="px-4 py-1.5 font-normal">Volume</th>
            <th className="px-4 py-1.5 font-normal">Symbol</th>
            <th className="px-4 py-1.5 font-normal">Price</th>
            <th className="px-4 py-1.5 font-normal">S/L</th>
            <th className="px-4 py-1.5 font-normal">T/P</th>
            <th className="px-4 py-1.5 font-normal text-right">Price</th>
            <th className="px-4 py-1.5 font-normal text-right">Profit</th>
            {onClose && <th className="px-4 py-1.5 text-center"></th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#2a2a2a]">
          {trades.map((trade) => {
            const isBuy = trade.type === TradeType.BUY;
            const livePrice = trade.status === 'OPEN' ? currentPrice : trade.closePrice || 0;
            const diff = isBuy ? livePrice - trade.openPrice : trade.openPrice - livePrice;
            const pl = trade.status === 'OPEN' ? diff * trade.lotSize * 1000 : (trade.profit || 0);

            return (
              <tr key={trade.id} className="hover:bg-[#2a2a2a] text-white">
                <td className="px-4 py-1.5 opacity-60">#{trade.id}</td>
                <td className="px-4 py-1.5 opacity-60">{new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                <td className={`px-4 py-1.5 font-bold ${isBuy ? 'text-blue-500' : 'text-red-500'}`}>{trade.type.toLowerCase()}</td>
                <td className="px-4 py-1.5 font-bold">{trade.lotSize.toFixed(2)}</td>
                <td className="px-4 py-1.5">{trade.symbol}</td>
                <td className="px-4 py-1.5">{trade.openPrice.toFixed(5)}</td>
                <td className="px-4 py-1.5 opacity-30">0.00000</td>
                <td className="px-4 py-1.5 opacity-30">0.00000</td>
                <td className="px-4 py-1.5 text-right font-bold">{livePrice.toFixed(5)}</td>
                <td className={`px-4 py-1.5 text-right font-bold ${pl >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                  {pl.toFixed(2)}
                </td>
                {onClose && (
                  <td className="px-4 py-1.5 text-center">
                    <button onClick={() => onClose(trade.id)} className="p-0.5 hover:text-red-500 text-slate-600 transition-colors">
                      <X size={12} strokeWidth={3} />
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TradeHistory;


import React, { useState } from 'react';
import { TradeType } from '../types';
import { MousePointer2, Percent, TrendingDown, TrendingUp } from 'lucide-react';

interface OrderFormProps {
  price: number;
  onPlaceTrade: (type: TradeType, lotSize: number, sl?: number, tp?: number) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ price, onPlaceTrade }) => {
  const [lotSize, setLotSize] = useState(0.1);
  const [sl, setSl] = useState<string>('');
  const [tp, setTp] = useState<string>('');

  const handleTrade = (type: TradeType) => {
    onPlaceTrade(type, lotSize, sl ? parseFloat(sl) : undefined, tp ? parseFloat(tp) : undefined);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <MousePointer2 className="w-4 h-4 text-indigo-400" /> Execution
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Lot Size</label>
          <div className="relative">
            <input 
              type="number" 
              value={lotSize} 
              onChange={(e) => setLotSize(parseFloat(e.target.value))}
              step="0.01"
              min="0.01"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Stop Loss</label>
            <input 
              type="number" 
              placeholder="None"
              value={sl}
              onChange={(e) => setSl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">Take Profit</label>
            <input 
              type="number" 
              placeholder="None"
              value={tp}
              onChange={(e) => setTp(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex flex-col gap-3">
        <button 
          onClick={() => handleTrade(TradeType.BUY)}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all group"
        >
          <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
          BUY
        </button>
        <button 
          onClick={() => handleTrade(TradeType.SELL)}
          className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all group"
        >
          <TrendingDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
          SELL
        </button>
      </div>

      <div className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
        Market execution @ {price.toFixed(5)}
      </div>
    </div>
  );
};

export default OrderForm;

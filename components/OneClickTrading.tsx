
import React, { useState } from 'react';
import { TradeType } from '../types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface OneClickTradingProps {
  price: number;
  onTrade: (type: TradeType, lotSize: number) => void;
}

const OneClickTrading: React.FC<OneClickTradingProps> = ({ price, onTrade }) => {
  const [lotSize, setLotSize] = useState(0.10);

  const adjustLot = (val: number) => {
    setLotSize(prev => Math.max(0.01, parseFloat((prev + val).toFixed(2))));
  };

  return (
    <div className="absolute top-4 left-4 z-10 flex bg-[#1c1c1c]/90 border border-[#3c3c3c] rounded-sm overflow-hidden shadow-2xl backdrop-blur-sm select-none">
      <button 
        onClick={() => onTrade(TradeType.SELL, lotSize)}
        className="flex flex-col items-center justify-center px-4 py-2 hover:bg-red-900/40 border-r border-[#3c3c3c] transition-colors group"
      >
        <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Sell</span>
        <span className="text-sm font-mono font-bold text-white group-active:scale-95 transition-transform">{(price - 0.00005).toFixed(5)}</span>
      </button>
      
      <div className="flex flex-col items-center justify-center bg-[#2a2a2a] px-2 min-w-[60px] relative">
        <button onClick={() => adjustLot(0.01)} className="absolute top-0 right-1 text-slate-500 hover:text-white"><ChevronUp size={10} /></button>
        <input 
          type="number" 
          value={lotSize.toFixed(2)} 
          readOnly
          className="bg-transparent text-center text-[11px] font-mono font-bold text-white w-full outline-none"
        />
        <button onClick={() => adjustLot(-0.01)} className="absolute bottom-0 right-1 text-slate-500 hover:text-white"><ChevronDown size={10} /></button>
      </div>

      <button 
        onClick={() => onTrade(TradeType.BUY, lotSize)}
        className="flex flex-col items-center justify-center px-4 py-2 hover:bg-green-900/40 transition-colors group"
      >
        <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Buy</span>
        <span className="text-sm font-mono font-bold text-white group-active:scale-95 transition-transform">{(price + 0.00005).toFixed(5)}</span>
      </button>
    </div>
  );
};

export default OneClickTrading;

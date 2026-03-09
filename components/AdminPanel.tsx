
import React, { useState, useEffect } from 'react';
import { MarketState, Trade, TradeType } from '../types';
import { Shield, Zap, Target, Eye, Users, AlertCircle, RefreshCcw, ToggleLeft, ToggleRight, Radio } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AdminPanelProps {
  market: MarketState;
  trades: Trade[];
  onUpdateBias: (bias: number) => void;
  onToggleCounterTrade: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ market, trades, onUpdateBias, onToggleCounterTrade }) => {
  const [aiInsight, setAiInsight] = useState<string>("Analyzing MT5 session...");

  const buyVolume = trades.filter(t => t.status === 'OPEN' && t.type === TradeType.BUY).reduce((acc, t) => acc + t.lotSize, 0);
  const sellVolume = trades.filter(t => t.status === 'OPEN' && t.type === TradeType.SELL).reduce((acc, t) => acc + t.lotSize, 0);
  const totalVolume = buyVolume + sellVolume;
  const buyPercentage = totalVolume > 0 ? (buyVolume / totalVolume) * 100 : 50;

  useEffect(() => {
    const fetchInsight = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `MT5 Terminal Report. Symbol: STCUSD. Retail Longs: ${buyPercentage.toFixed(1)}%. Counter-Trade: ${market.counterTradeEnabled ? 'ON' : 'OFF'}. Recommendation for market maker?`;
        const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
        setAiInsight(response.text || "Stabilize volatility.");
      } catch (e) { setAiInsight("Local mode active."); }
    };
    fetchInsight();
  }, [buyVolume, sellVolume, market.counterTradeEnabled]);

  return (
    <div className="h-full flex flex-col p-4 bg-[#1c1c1c] space-y-4 text-[11px] select-none">
      <div className="flex items-center justify-between border-b border-[#3c3c3c] pb-2">
         <div className="flex items-center gap-2 font-bold text-red-500 uppercase tracking-tighter">
           <Shield size={14} /> Brokerage Terminal Management
         </div>
         <button 
           onClick={onToggleCounterTrade}
           className={`flex items-center gap-1.5 px-3 py-1 rounded border ${market.counterTradeEnabled ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-[#3c3c3c] text-slate-500'}`}
         >
           {market.counterTradeEnabled ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
           Auto Counter-Trade: {market.counterTradeEnabled ? 'ON' : 'OFF'}
         </button>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1">
        <div className="bg-[#2a2a2a] p-3 rounded border border-[#3c3c3c] flex flex-col space-y-3">
          <div className="font-bold flex items-center gap-1.5 text-slate-400 uppercase"><Target size={12} /> Force Market Bias</div>
          <input 
            type="range" min="-0.008" max="0.008" step="0.0001" value={market.bias} 
            onChange={(e) => onUpdateBias(parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-red-600"
          />
          <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
            <span className="text-red-500">Bearish</span>
            <span className="text-white">{(market.bias * 1000).toFixed(2)} pips</span>
            <span className="text-green-500">Bullish</span>
          </div>
        </div>

        <div className="bg-[#2a2a2a] p-3 rounded border border-[#3c3c3c] flex flex-col space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-slate-400 uppercase"><Users size={12} /> Sentiment Analyzer</div>
          <div className="flex items-center h-4 bg-slate-800 rounded overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${buyPercentage}%` }} />
            <div className="h-full bg-red-500" style={{ width: `${100 - buyPercentage}%` }} />
          </div>
          <div className="flex justify-between font-mono">
            <span className="text-blue-500">B: {buyVolume.toFixed(2)}L ({buyPercentage.toFixed(1)}%)</span>
            <span className="text-red-500">S: {sellVolume.toFixed(2)}L</span>
          </div>
        </div>

        <div className="bg-[#2a2a2a] p-3 rounded border border-[#3c3c3c] flex flex-col">
          <div className="font-bold flex items-center gap-1.5 text-slate-400 uppercase"><Zap size={12} /> Strategy AI</div>
          <p className="mt-1 text-slate-500 leading-tight italic font-medium">"{aiInsight}"</p>
        </div>
      </div>
      
      <div className="bg-red-900/10 border border-red-500/20 p-2 rounded text-[10px] text-red-400/80 flex gap-2 items-center">
        <AlertCircle size={12} className="shrink-0" />
        System is currently generating synthetic volume to counter retail sentiment.
      </div>
    </div>
  );
};

export default AdminPanel;

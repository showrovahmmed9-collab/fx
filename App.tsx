
import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, TrendingUp, ShieldAlert, History, Wallet, Settings, Clock, Monitor, Layers, List, BarChart2, Activity, Zap } from 'lucide-react';
import TradingChart from './components/TradingChart';
import TradeHistory from './components/TradeHistory';
import AdminPanel from './components/AdminPanel';
import OneClickTrading from './components/OneClickTrading';
import { Trade, MarketState, UserAccount, TradeType, OHLC } from './types';
import { generateNextCandle } from './services/marketEngine';

const App: React.FC = () => {
  const [activeToolboxTab, setActiveToolboxTab] = useState<'trade' | 'history' | 'admin'>('trade');
  const [market, setMarket] = useState<MarketState>({
    symbol: 'STCUSD',
    price: 0.75420,
    change24h: 12.4,
    history: Array.from({ length: 50 }, (_, i) => {
      const base = 0.75 + (i * 0.0001);
      return {
        time: new Date(Date.now() - (50 - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        open: base,
        high: base + 0.002,
        low: base - 0.001,
        close: base + 0.001
      };
    }),
    bias: 0,
    counterTradeEnabled: true
  });

  const [account, setAccount] = useState<UserAccount>({
    balance: 10000,
    equity: 10000,
    marginUsed: 0,
    freeMargin: 10000
  });

  const [trades, setTrades] = useState<Trade[]>([]);
  const tradesRef = useRef(trades);

  useEffect(() => {
    tradesRef.current = trades;
  }, [trades]);

  // Market Engine: MT5 1m Ticks simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setMarket(prev => {
        const buyVol = tradesRef.current.filter(t => t.status === 'OPEN' && t.type === TradeType.BUY).reduce((a, b) => a + b.lotSize, 0);
        const sellVol = tradesRef.current.filter(t => t.status === 'OPEN' && t.type === TradeType.SELL).reduce((a, b) => a + b.lotSize, 0);
        
        const nextCandle = generateNextCandle(
          prev.price, 
          prev.bias, 
          buyVol, 
          sellVol, 
          prev.counterTradeEnabled
        );

        const newHistory = [...prev.history.slice(1), nextCandle];
        return { ...prev, price: nextCandle.close, history: newHistory };
      });
    }, 2000); // Faster updates for interactive feel
    return () => clearInterval(interval);
  }, []);

  // Equity calculation
  useEffect(() => {
    const openTrades = trades.filter(t => t.status === 'OPEN');
    let totalPl = 0;
    openTrades.forEach(trade => {
      const diff = trade.type === TradeType.BUY ? market.price - trade.openPrice : trade.openPrice - market.price;
      totalPl += diff * trade.lotSize * 1000;
    });
    setAccount(prev => ({
      ...prev,
      equity: prev.balance + totalPl,
      freeMargin: prev.balance + totalPl - prev.marginUsed
    }));
  }, [market.price, trades]);

  const placeTrade = (type: TradeType, lotSize: number) => {
    const newTrade: Trade = {
      id: Math.floor(1000000 + Math.random() * 9000000).toString(),
      symbol: market.symbol,
      type,
      openPrice: market.price,
      lotSize,
      timestamp: Date.now(),
      status: 'OPEN'
    };
    setTrades(prev => [newTrade, ...prev]);
  };

  const closeTrade = (id: string) => {
    setTrades(prev => prev.map(t => {
      if (t.id === id && t.status === 'OPEN') {
        const diff = t.type === TradeType.BUY ? market.price - t.openPrice : t.openPrice - market.price;
        const profit = diff * t.lotSize * 1000;
        setAccount(acc => ({ ...acc, balance: acc.balance + profit }));
        return { ...t, status: 'CLOSED', closePrice: market.price, profit };
      }
      return t;
    }));
  };

  // Added missing updateBias function to handle admin bias overrides
  const updateBias = (bias: number) => {
    setMarket(prev => ({ ...prev, bias }));
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#1c1c1c] text-[#d1d1d1] font-sans overflow-hidden border-t-2 border-[#3c3c3c]">
      {/* Top Toolbar (MT5 Style) */}
      <div className="h-10 bg-[#2a2a2a] border-b border-[#3c3c3c] flex items-center px-2 space-x-1 select-none">
        <div className="flex space-x-2 mr-4 border-r border-[#3c3c3c] pr-4 ml-2">
          <span className="text-[11px] hover:bg-[#3d3d3d] px-2 py-1 rounded cursor-default">File</span>
          <span className="text-[11px] hover:bg-[#3d3d3d] px-2 py-1 rounded cursor-default">View</span>
          <span className="text-[11px] hover:bg-[#3d3d3d] px-2 py-1 rounded cursor-default">Insert</span>
          <span className="text-[11px] hover:bg-[#3d3d3d] px-2 py-1 rounded cursor-default">Charts</span>
          <span className="text-[11px] hover:bg-[#3d3d3d] px-2 py-1 rounded cursor-default font-bold text-blue-400">Tools</span>
        </div>
        <button className="p-1.5 hover:bg-[#3d3d3d] rounded text-slate-400"><Monitor size={14} /></button>
        <button className="p-1.5 hover:bg-[#3d3d3d] rounded text-slate-400"><Layers size={14} /></button>
        <button className="p-1.5 hover:bg-[#3d3d3d] rounded text-slate-400"><BarChart2 size={14} /></button>
        <button className="p-1.5 hover:bg-[#3d3d3d] rounded text-blue-500 font-bold ml-auto flex items-center gap-1 bg-[#3d3d3d] px-2 py-0.5 rounded text-[11px]">
          <Zap size={12} /> Algo Trading
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Market Watch & Navigator) */}
        <aside className="w-64 bg-[#212121] border-r border-[#3c3c3c] flex flex-col">
          <div className="flex-1 flex flex-col min-h-0">
             <div className="bg-[#2a2a2a] px-3 py-1.5 border-b border-[#3c3c3c] flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Market Watch</span>
                <List size={12} />
             </div>
             <div className="flex-1 overflow-y-auto">
               <table className="w-full text-[11px] font-mono">
                 <thead>
                   <tr className="bg-[#2a2a2a] text-slate-500 text-left">
                     <th className="px-2 py-1 font-normal">Symbol</th>
                     <th className="px-2 py-1 font-normal">Bid</th>
                     <th className="px-2 py-1 font-normal">Ask</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-[#2a2a2a]">
                   <tr className="bg-[#2a2a2a] text-white">
                     <td className="px-2 py-2 font-bold">{market.symbol}</td>
                     <td className="px-2 py-2 text-red-500">{(market.price - 0.0001).toFixed(5)}</td>
                     <td className="px-2 py-2 text-green-500">{(market.price + 0.0001).toFixed(5)}</td>
                   </tr>
                   {['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'BTCUSD'].map(s => (
                     <tr key={s} className="text-slate-500 hover:bg-[#2a2a2a] cursor-pointer">
                        <td className="px-2 py-2">{s}</td>
                        <td className="px-2 py-2">1.09241</td>
                        <td className="px-2 py-2 text-red-400">1.09255</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
          <div className="h-1/3 border-t border-[#3c3c3c] flex flex-col bg-[#1c1c1c]">
             <div className="bg-[#2a2a2a] px-3 py-1.5 border-b border-[#3c3c3c] flex items-center gap-2">
                <Monitor size={12} className="text-blue-500" />
                <span className="text-[11px] font-bold text-slate-400">Navigator</span>
             </div>
             <div className="p-3 space-y-2 text-[11px] overflow-y-auto">
                <div className="flex items-center gap-2"><BarChart2 size={12} /> Accounts</div>
                <div className="flex items-center gap-2 text-blue-400 pl-4">MT5 Terminal: {account.balance.toFixed(0)}</div>
                <div className="flex items-center gap-2"><Activity size={12} /> Indicators</div>
                <div className="flex items-center gap-2"><Zap size={12} /> Expert Advisors</div>
             </div>
          </div>
        </aside>

        {/* Main Chart Area */}
        <main className="flex-1 flex flex-col relative bg-[#000]">
          {/* Chart Header */}
          <div className="h-8 bg-[#2a2a2a] border-b border-[#3c3c3c] flex items-center px-4 justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-[11px] font-bold">{market.symbol}, M1</span>
              <div className="flex space-x-1">
                {['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'].map(p => (
                  <span key={p} className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer ${p === 'M1' ? 'bg-blue-600 text-white' : 'hover:bg-[#3c3c3c] text-slate-500'}`}>{p}</span>
                ))}
              </div>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              STC Network Core Server 4.10
            </div>
          </div>

          <div className="flex-1 relative">
            <TradingChart data={market.history} />
            {/* One Click Trading Overlay */}
            <OneClickTrading price={market.price} onTrade={placeTrade} />
          </div>

          {/* Bottom Toolbox (Terminal) */}
          <div className="h-64 bg-[#1c1c1c] border-t border-[#3c3c3c] flex flex-col shadow-2xl z-20">
             <div className="bg-[#2a2a2a] flex items-center border-b border-[#3c3c3c]">
                <button 
                  onClick={() => setActiveToolboxTab('trade')}
                  className={`px-4 py-2 text-[11px] font-bold border-r border-[#3c3c3c] ${activeToolboxTab === 'trade' ? 'bg-[#1c1c1c] text-blue-400 border-t-2 border-t-blue-500' : 'hover:bg-[#3d3d3d]'}`}
                >
                  Trade
                </button>
                <button 
                  onClick={() => setActiveToolboxTab('history')}
                  className={`px-4 py-2 text-[11px] font-bold border-r border-[#3c3c3c] ${activeToolboxTab === 'history' ? 'bg-[#1c1c1c] text-blue-400 border-t-2 border-t-blue-500' : 'hover:bg-[#3d3d3d]'}`}
                >
                  History
                </button>
                <button 
                  onClick={() => setActiveToolboxTab('admin')}
                  className={`px-4 py-2 text-[11px] font-bold border-r border-[#3c3c3c] ${activeToolboxTab === 'admin' ? 'bg-[#1c1c1c] text-red-400 border-t-2 border-t-red-500' : 'hover:bg-[#3d3d3d]'}`}
                >
                  STC Master Control
                </button>
                <div className="flex-1"></div>
             </div>
             
             <div className="flex-1 overflow-auto bg-[#1c1c1c]">
                {activeToolboxTab === 'trade' && (
                  <div className="flex flex-col h-full">
                    <TradeHistory trades={trades.filter(t => t.status === 'OPEN')} currentPrice={market.price} onClose={closeTrade} />
                    <div className="mt-auto bg-[#2a2a2a] px-4 py-1 flex items-center gap-6 text-[11px] font-bold border-t border-[#3c3c3c]">
                       <div>Balance: <span className="font-mono text-blue-400">{account.balance.toFixed(2)} USD</span></div>
                       <div>Equity: <span className="font-mono text-blue-400">{account.equity.toFixed(2)} USD</span></div>
                       <div>Margin: <span className="font-mono text-blue-400">0.00 USD</span></div>
                       <div>Free Margin: <span className="font-mono text-blue-400">{account.freeMargin.toFixed(2)} USD</span></div>
                    </div>
                  </div>
                )}
                {activeToolboxTab === 'history' && (
                  <TradeHistory trades={trades.filter(t => t.status === 'CLOSED')} currentPrice={market.price} />
                )}
                {activeToolboxTab === 'admin' && (
                  <AdminPanel 
                    market={market} 
                    trades={trades} 
                    onUpdateBias={updateBias} 
                    onToggleCounterTrade={() => setMarket(p => ({ ...p, counterTradeEnabled: !p.counterTradeEnabled }))} 
                  />
                )}
             </div>
          </div>
        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-6 bg-[#2a2a2a] border-t border-[#3c3c3c] flex items-center px-4 justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Connected</span>
          <span>STC Global Real 1</span>
        </div>
        <div className="flex items-center gap-4 font-mono">
          <span>0.00 / 128 ms</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-3 px-4 py-2 rounded transition-all ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-[#3d3d3d]'}`}>
    <div className="w-4">{icon}</div>
    <span className="font-bold text-[11px] uppercase">{label}</span>
  </button>
);

export default App;

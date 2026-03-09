
import React from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { OHLC } from '../types';

interface TradingChartProps {
  data: OHLC[];
}

const TradingChart: React.FC<TradingChartProps> = ({ data }) => {
  const chartData = data.map(d => ({
    time: d.time,
    body: [d.open, d.close],
    wick: [d.low, d.high],
    isGreen: d.close >= d.open,
    raw: d,
    price: d.close
  }));

  const prices = data.flatMap(d => [d.low, d.high]);
  const minPrice = Math.min(...prices) * 0.9997;
  const maxPrice = Math.max(...prices) * 1.0003;
  const currentPrice = data[data.length - 1]?.close || 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload.raw as OHLC;
      return (
        <div className="bg-[#1c1c1c] border border-[#3c3c3c] p-2 rounded shadow-2xl text-[10px] font-mono text-white">
          <p className="border-b border-[#3c3c3c] mb-1 pb-1 opacity-50">{d.time}</p>
          <p>O: {d.open.toFixed(5)}</p>
          <p>H: {d.high.toFixed(5)}</p>
          <p>L: {d.low.toFixed(5)}</p>
          <p>C: {d.close.toFixed(5)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-black">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 60, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={true} horizontal={true} stroke="#1a1a1a" />
          <XAxis 
            dataKey="time" 
            tick={{ fill: '#444', fontSize: 10 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis 
            domain={[minPrice, maxPrice]} 
            orientation="right"
            tick={{ fill: '#444', fontSize: 10 }}
            axisLine={{ stroke: '#333' }}
            tickLine={false}
            tickFormatter={(val) => val.toFixed(5)}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#333', strokeDasharray: '3 3' }} />
          
          <ReferenceLine y={currentPrice} stroke={currentPrice >= data[data.length-1]?.open ? '#22c55e' : '#ef4444'} strokeDasharray="3 3" label={{ position: 'right', value: currentPrice.toFixed(5), fill: '#fff', fontSize: 10, backgroundColor: '#000', padding: 2 }} />

          {/* Wick */}
          <Bar dataKey="wick" barSize={1}>
            {chartData.map((entry, index) => (
              <Cell key={`wick-${index}`} fill={entry.isGreen ? '#22c55e' : '#ef4444'} opacity={0.6} />
            ))}
          </Bar>
          
          {/* Body */}
          <Bar dataKey="body" barSize={8}>
            {chartData.map((entry, index) => (
              <Cell key={`body-${index}`} fill={entry.isGreen ? '#22c55e' : '#ef4444'} />
            ))}
          </Bar>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TradingChart;

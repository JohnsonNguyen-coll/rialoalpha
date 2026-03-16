"use client";

import React, { useMemo } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';

interface PnLData {
    name: string;
    pnl: number;
}

interface PnLChartProps {
    strategies: any[];
}

export default function PnLChart({ strategies }: PnLChartProps) {
    const data: PnLData[] = useMemo(() => {
        if (!Array.isArray(strategies)) return [];
        
        return strategies.map(s => {
            const totalPnL = s.trades?.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0) || 0;
            return {
                name: `Robot_${s.id.substring(0, 4)} (${s.tokenSymbol})`,
                pnl: parseFloat(totalPnL.toFixed(2))
            };
        }).sort((a, b) => b.pnl - a.pnl);
    }, [strategies]);

    if (data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-gray-400 font-bold border-[3px] border-dashed border-gray-200 rounded-[2rem]">
                No performance data yet! Let's trade!
            </div>
        );
    }

    return (
        <div className="h-[350px] w-full mt-6 bg-white rounded-3xl border-[3px] border-[#1a1a1a] p-6 shadow-[8px_8px_0px_#1a1a1a]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={(props) => {
                            const { x, y, payload } = props;
                            return (
                                <g transform={`translate(${x},${y})`}>
                                    <text x={0} y={0} dy={16} textAnchor="end" fill="#1a1a1a" fontSize={10} fontWeight="900" transform="rotate(-35)">
                                        {payload.value}
                                    </text>
                                </g>
                            );
                        }}
                    />
                    <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#1a1a1a', fontSize: 10, fontWeight: '900' }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            background: '#fff', 
                            border: '3px solid #1a1a1a', 
                            borderRadius: '1.5rem',
                            fontWeight: '900',
                            boxShadow: '4px 4px 0px #1a1a1a'
                        }}
                        cursor={{ fill: '#f8fafc' }}
                    />
                    <ReferenceLine y={0} stroke="#1a1a1a" strokeWidth={2} />
                    <Bar dataKey="pnl" radius={[8, 8, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10B981' : '#EF4444'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

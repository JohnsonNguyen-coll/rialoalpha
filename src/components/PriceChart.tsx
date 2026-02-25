"use client";

import React, { useEffect, useState } from 'react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface PricePoint {
    timestamp: string;
    price: number;
}

export default function PriceChart({ symbol }: { symbol: string }) {
    const [data, setData] = useState<PricePoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/prices/${symbol}`);
                const history = await res.json();

                const formatted = history.map((h: any) => ({
                    timestamp: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    price: h.price
                }));

                setData(formatted);
            } catch (error) {
                console.error('Chart error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
        const interval = setInterval(fetchHistory, 30000);
        return () => clearInterval(interval);
    }, [symbol]);

    if (loading && data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-primary font-black animate-pulse">
                Fetching Data Sticks...
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-gray-400 font-bold">
                No data points yet! Keep waiting!
            </div>
        )
    }

    return (
        <div className="h-[300px] w-full mt-6 bg-white/30 rounded-3xl border-[3px] border-[#1a1a1a] p-4 overflow-hidden shadow-[inner_0_2px_10px_rgba(0,0,0,0.05)]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#1a1a1a" strokeOpacity={0.1} />
                    <XAxis
                        dataKey="timestamp"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#1a1a1a', fontSize: 10, fontWeight: 'bold' }}
                        minTickGap={40}
                    />
                    <YAxis
                        hide
                        domain={['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{
                            background: '#fff',
                            border: '3px solid #1a1a1a',
                            borderRadius: '1.5rem',
                            fontSize: '14px',
                            fontWeight: '900',
                            boxShadow: '4px 4px 0px #1a1a1a'
                        }}
                        itemStyle={{ color: '#8B5CF6' }}
                        cursor={{ stroke: '#1a1a1a', strokeWidth: 2, strokeDasharray: '4 4' }}
                    />
                    <Area
                        type="stepAfter"
                        dataKey="price"
                        stroke="#8B5CF6"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}


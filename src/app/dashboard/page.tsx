"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Activity,
    Settings,
    TrendingDown,
    TrendingUp,
    Play,
    Square,
    Terminal,
    RefreshCw,
    Plus,
    ShieldCheck,
    Zap,
    BarChart3,
    Bot,
    LayoutDashboard,
    Wallet,
    History,
    Info,
    Cpu,
    ArrowRight,
    Layers,
    ChevronDown,
    LineChart as ChartIcon,
    Star,
    Sparkles,
    Smile,
    Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PriceChart from '@/components/PriceChart';

// Types
interface LogEntry {
    id: string;
    time: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'ai';
}

export default function Dashboard() {
    const [rules, setRules] = useState<any[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [ticking, setTicking] = useState(false);
    const [prices, setPrices] = useState<any>({});
    const [activeTab, setActiveTab] = useState('terminal');

    // Form state
    const [tokenSymbol, setTokenSymbol] = useState('SOL');
    const [targetDrop, setTargetDrop] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedChartSymbol, setSelectedChartSymbol] = useState('SOL');
    const [showAssetDropdown, setShowAssetDropdown] = useState(false);

    const tokens = ['SOL', 'ETH', 'BTC', 'BNB', 'ADA', 'DOT', 'LINK', 'POL', 'XRP', 'AVAX'];

    const fetchData = async () => {
        try {
            const [rulesRes, logsRes] = await Promise.all([
                fetch('/api/strategies'),
                fetch('/api/logs')
            ]);
            const rulesData = await rulesRes.json();
            const logsData = await logsRes.json();

            setRules(Array.isArray(rulesData) ? rulesData : []);
            const logsArray = Array.isArray(logsData) ? logsData : [];
            setLogs(logsArray.map((l: any) => ({
                id: l.id,
                time: new Date(l.timestamp).toLocaleTimeString(),
                message: l.message,
                type: l.type === 'ai_thought' ? 'ai' : l.type
            })));
        } catch (error: any) {
            const msg = error?.message || String(error);
            console.error('Error fetching data:', msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        runTick(); // Call on mount to get initial prices
        const interval = setInterval(() => {
            fetchData();
            runTick();
        }, 300000); // 5 minutes refresh
        return () => clearInterval(interval);
    }, []);

    const handleCreateAgent = async () => {
        if (!targetDrop || !amount) return;
        try {
            await fetch('/api/strategies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tokenSymbol, targetDrop, amount }),
            });
            setTargetDrop('');
            setAmount('');
            fetchData();
        } catch (err: any) {
            const msg = err?.message || String(err);
            console.error('Error creating agent:', msg);
        }
    };

    const runTick = async () => {
        if (ticking) return;
        setTicking(true);
        try {
            const res = await fetch('/api/agent/tick');
            const data = await res.json();
            if (data.prices) setPrices(data.prices);
            fetchData();
        } catch (error) {
            console.error('Tick error:', error);
        } finally {
            setTicking(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#fdf6ff] cartoon-grid">
            {/* Playful Sidebar */}
            <aside className="w-80 p-6 hidden xl:flex flex-col sticky top-0 h-screen z-20">
                <div className="bubbly-card h-full flex flex-col p-6 bg-white overflow-hidden relative">
                    {/* Decorative blobs inside sidebar background */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-1" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl -z-1" />

                    <div className="mb-10 flex justify-center">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-[#8B5CF6] border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] group-hover:rotate-12 transition-transform">
                                <img src="/logo.png" alt="Rialo Logo" className="w-full h-full object-cover rounded-xl" />
                            </div>
                            <span className="text-2xl font-black tracking-tight text-[#1a1a1a] font-cartoon">Rialo</span>
                        </Link>
                    </div>

                    <nav className="flex-1 space-y-4">
                        {[
                            { id: 'terminal', icon: <LayoutDashboard className="w-5 h-5" />, label: "Control Center", color: "bg-[#FFD700]" },
                            { id: 'fleet', icon: <Bot className="w-5 h-5" />, label: "Robot Army", color: "bg-[#33D1FF]" },
                            { id: 'vault', icon: <Wallet className="w-5 h-5" />, label: "Piggy Bank", color: "bg-[#FF7EB9]" },
                            { id: 'archive', icon: <History className="w-5 h-5" />, label: "Time Machine", color: "bg-[#10B981]" },
                        ].map((item, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-[3px] transition-all font-black text-sm relative group overflow-hidden ${activeTab === item.id
                                    ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-[6px_6px_0px_rgba(0,0,0,0.1)]'
                                    : 'bg-white text-[#1a1a1a] border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_#1a1a1a]'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg border-[2px] border-[#1a1a1a] ${activeTab === item.id ? 'bg-white/20' : item.color}`}>
                                    {item.icon}
                                </div>
                                {item.label}
                                {activeTab === item.id && (
                                    <motion.div layoutId="activeTab" className="absolute right-4">
                                        <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                    </motion.div>
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto">
                        <div className="bg-[#f0f9ff] p-5 rounded-3xl border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] relative overflow-hidden group hover:rotate-2 transition-transform">
                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                <Smile className="w-5 h-5 text-blue-500 fill-blue-200" />
                                <span className="text-xs font-black text-blue-600">Pro Tip!</span>
                            </div>
                            <p className="text-[11px] text-[#555] font-bold leading-relaxed relative z-10">This is a sandbox, so feel free to play around! No real money involved yet! 🚀</p>
                            <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none group-hover:scale-150 transition-transform">
                                <Star className="w-12 h-12 fill-current" />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-screen relative z-10">
                <div className="flex-1 p-6 md:p-10 max-w-[1400px] w-full mx-auto">
                    {/* Top Header - Bubbly Style */}
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#1a1a1a] font-cartoon drop-shadow-[2px_2px_0px_white]">The Workshop</h2>
                                <div className="px-4 py-1.5 bg-[#10B981] text-white text-xs font-black rounded-full border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] animate-pulse">LIVE & FUN</div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border-[3px] border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a]">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                                    <span className="text-[11px] font-black text-[#1a1a1a]">Magic Node #01</span>
                                </div>
                                <div className="text-xs font-black text-gray-500 flex items-center gap-1">
                                    <Heart className="w-4 h-4 text-pink-500 fill-pink-500" /> 100% HAPPY
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end px-6 py-3 bg-white border-[3px] border-[#1a1a1a] rounded-2xl shadow-[4px_4px_0px_#1a1a1a]">
                                <span className="text-[10px] font-black text-gray-400 mb-0.5">SPEEDY LEVEL</span>
                                <span className="text-xl font-black text-[#1a1a1a] font-cartoon">42ms! ⚡</span>
                            </div>
                            <button
                                onClick={runTick}
                                disabled={ticking}
                                className="w-16 h-16 bg-[#FFD700] rounded-2xl border-[4px] border-[#1a1a1a] shadow-[6px_6px_0px_#1a1a1a] flex items-center justify-center group active:scale-95 transition-all"
                            >
                                <RefreshCw className={`w-8 h-8 text-[#1a1a1a] ${ticking ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                            </button>
                        </div>
                    </header>

                    {activeTab === 'terminal' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                            {/* Left Section (Agents & Logic) */}
                            <div className="lg:col-span-8 space-y-10 flex flex-col">
                                {/* Deployment Card - Bubbly & Colorful */}
                                <section className={`bubbly-card p-10 bg-white relative ${showAssetDropdown ? 'z-50' : 'z-20'}`}>
                                    {/* Playful top-right label */}
                                    <div className="absolute -top-5 -right-5 bg-[#FF7EB9] text-white px-6 py-2 rounded-2xl border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] font-black text-sm rotate-6">
                                        NEW FRIEND!
                                    </div>

                                    <div className="flex justify-between items-center mb-10">
                                        <h3 className="text-3xl font-black text-[#1a1a1a] font-cartoon flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6] flex items-center justify-center border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a]">
                                                <Plus className="w-8 h-8 text-white" />
                                            </div>
                                            Hire a Robot Buddy
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-[#1a1a1a] ml-2">Which Token?</label>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowAssetDropdown(!showAssetDropdown)}
                                                    className="w-full bg-[#f8fafc] border-[3px] border-[#1a1a1a] rounded-2xl px-6 py-5 focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-20 transition-all font-black text-lg text-[#1a1a1a] flex justify-between items-center group relative z-[101]"
                                                >
                                                    <span className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-[#1a1a1a] flex items-center justify-center text-xs">
                                                            {tokenSymbol.charAt(0)}
                                                        </div>
                                                        {tokenSymbol}
                                                    </span>
                                                    <ChevronDown className={`w-6 h-6 text-gray-400 group-hover:text-[#1a1a1a] transition-all ${showAssetDropdown ? 'rotate-180' : ''}`} />
                                                </button>

                                                <AnimatePresence>
                                                    {showAssetDropdown && (
                                                        <>
                                                            <div className="fixed inset-0 z-[99]" onClick={() => setShowAssetDropdown(false)} />
                                                            <motion.div
                                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                className="absolute top-full left-0 right-0 mt-3 p-4 bg-white border-[3px] border-[#1a1a1a] rounded-[2rem] shadow-[10px_10px_0px_#1a1a1a] z-[120] max-h-[350px] overflow-y-auto custom-scrollbar"
                                                            >
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    {tokens.map(sym => (
                                                                        <button
                                                                            key={sym}
                                                                            onClick={() => {
                                                                                setTokenSymbol(sym);
                                                                                setShowAssetDropdown(false);
                                                                            }}
                                                                            className={`p-4 rounded-xl font-black text-sm transition-all border-[2px] ${tokenSymbol === sym ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-gray-50 text-[#1a1a1a] border-transparent hover:border-[#1a1a1a]'}`}
                                                                        >
                                                                            {sym}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-[#1a1a1a] ml-2">When to Buy? (Drop %)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={targetDrop}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (parseFloat(val) < 0) return;
                                                        setTargetDrop(val);
                                                    }}
                                                    placeholder="5.0"
                                                    className="w-full bg-[#f8fafc] border-[3px] border-[#1a1a1a] rounded-2xl px-6 py-5 focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-20 transition-all font-black text-lg text-[#1a1a1a]"
                                                />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-black">% Drop</div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-sm font-black text-[#1a1a1a] ml-2">Budget (USD)</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={amount}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (parseFloat(val) < 0) return;
                                                        setAmount(val);
                                                    }}
                                                    placeholder="1000"
                                                    className="w-full bg-[#f8fafc] border-[3px] border-[#1a1a1a] rounded-2xl px-6 py-5 focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-20 transition-all font-black text-lg text-[#1a1a1a]"
                                                />
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-black">$ USD</div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleCreateAgent}
                                        className="bubbly-button w-full mt-4 bg-[#FFD700] text-[#1a1a1a] text-xl font-black py-6 rounded-3xl flex items-center justify-center gap-4 transition-all hover:bg-[#FFC000] active:scale-[0.98]"
                                    >
                                        Let's Build It! 🛠️
                                        <ArrowRight className="w-8 h-8 transition-transform group-hover:translate-x-2" />
                                    </button>
                                </section>

                                {/* Live Telemetry / Chart - Cartoon Styled */}
                                <section className="bubbly-card p-8 bg-white overflow-hidden relative z-10">
                                    {/* Decorative floating shapes in card */}
                                    <div className="absolute top-10 right-10 opacity-10 rotate-12 -z-1">
                                        <ChartIcon size={120} />
                                    </div>

                                    <div className="flex justify-between items-center mb-8 relative z-10">
                                        <h3 className="text-2xl font-black text-[#1a1a1a] font-cartoon flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-[#33D1FF] flex items-center justify-center border-[3px] border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a]">
                                                <ChartIcon className="w-6 h-6 text-[#1a1a1a]" />
                                            </div>
                                            Magic Price Chart: {selectedChartSymbol}
                                        </h3>
                                        <div className="flex gap-3">
                                            {['SOL', 'ETH', 'BTC'].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setSelectedChartSymbol(s)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-black border-[3px] transition-all ${selectedChartSymbol === s ? 'bg-[#33D1FF] border-[#1a1a1a] text-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] -translate-y-1' : 'bg-white border-[#1a1a1a] text-gray-400 hover:text-[#1a1a1a]'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        <PriceChart symbol={selectedChartSymbol} />
                                    </div>
                                </section>

                                {/* Fleet Status (Mini) */}
                                <section className="bubbly-card bg-white overflow-hidden relative">
                                    <div className="p-8 border-b-[3px] border-[#1a1a1a] bg-[#fdf6ff] flex justify-between items-center">
                                        <h3 className="text-xl font-black text-[#1a1a1a] font-cartoon flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-[#10B981] flex items-center justify-center border-[3px] border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a]">
                                                <Bot className="w-6 h-6 text-[#1a1a1a]" />
                                            </div>
                                            Your Active Bots
                                        </h3>
                                        <div className="flex gap-2">
                                            <div className="text-xs font-black text-[#10B981] bg-[#10B981]/10 px-4 py-2 rounded-xl border-[2px] border-[#10B981]">WORKING: {(Array.isArray(rules) ? rules : []).filter(r => r.status === 'active').length}</div>
                                        </div>
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left">
                                            <thead className="text-xs font-black text-[#1a1a1a] bg-[#f8fafc] border-b-[3px] border-[#1a1a1a]">
                                                <tr>
                                                    <th className="py-5 px-10">Name</th>
                                                    <th className="py-5 px-10">What it does</th>
                                                    <th className="py-5 px-10 text-center">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y-[3px] divide-[#1a1a1a]/5">
                                                {(Array.isArray(rules) ? rules : []).filter(r => r.status === 'active').map((rule) => (
                                                    <tr key={rule.id} className="group hover:bg-[#fff7ed] transition-all">
                                                        <td className="py-6 px-10">
                                                            <div className="flex flex-col">
                                                                <span className="font-cartoon text-lg text-[#1a1a1a] group-hover:text-primary transition-colors">Robot_{rule.id.substring(0, 4)}</span>
                                                                <span className="text-xs text-gray-400 font-black">{rule.tokenSymbol} Fan</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-10">
                                                            <div className="bg-white/50 border-[2px] border-dashed border-gray-200 p-3 rounded-2xl">
                                                                <span className="text-[#1a1a1a] font-black block text-sm">Hunt for -{rule.targetDrop}% Dip</span>
                                                                <span className="text-gray-400 text-[10px] font-bold">Using {rule.amount} USDC</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-6 px-10">
                                                            <div className="flex justify-center">
                                                                <div className="w-8 h-8 rounded-full bg-[#10B981] border-[3px] border-[#1a1a1a] shadow-[2px_2px_0px_#1a1a1a] flex items-center justify-center animate-bounce">
                                                                    <Zap className="w-4 h-4 text-white fill-white" />
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {(Array.isArray(rules) ? rules : []).filter(r => r.status === 'active').length === 0 && (
                                                    <tr>
                                                        <td colSpan={3} className="py-20 text-center">
                                                            <div className="flex flex-col items-center gap-4">
                                                                <Smile size={60} className="text-gray-200" />
                                                                <p className="text-lg text-gray-300 font-black font-cartoon">No bots working yet!</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </div>

                            {/* Right Section (Analytics) */}
                            <div className="lg:col-span-4">
                                {/* Market Feed - Bubbly Cards */}
                                <section className="space-y-8">
                                    <div className="flex items-center gap-4 ml-2">
                                        <div className="w-10 h-10 rounded-xl bg-[#FFD700] border-[3px] border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] flex items-center justify-center">
                                            <Sparkles className="w-6 h-6 text-[#1a1a1a]" />
                                        </div>
                                        <h3 className="text-3xl font-black text-[#1a1a1a] font-cartoon">Price Stickers</h3>
                                    </div>
                                    <div className="relative group/scroll">
                                        {/* Top Mask */}
                                        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#fdf6ff] to-transparent z-10 pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity rounded-t-[2.5rem]"></div>

                                        <div className="overflow-y-auto max-h-[1150px] custom-scrollbar p-6 -m-4">
                                            <div className="grid grid-cols-1 gap-6 pb-12">
                                                {tokens.map((sym) => (
                                                    <motion.div
                                                        key={sym}
                                                        whileHover={{ y: -5, x: -2 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setSelectedChartSymbol(sym)}
                                                        className={`bubbly-card p-6 border-[3px] transition-all cursor-pointer relative group ${selectedChartSymbol === sym ? '!bg-primary -translate-y-2 shadow-[8px_8px_0px_#1a1a1a]' : 'bg-white border-[#1a1a1a] hover:shadow-[6px_6px_0px_#1a1a1a]'}`}
                                                    >
                                                        <div className="flex justify-between items-center mb-6 relative z-10">
                                                            <div className="flex items-center gap-4">
                                                                <div className={`w-12 h-12 rounded-2xl border-[3px] border-[#1a1a1a] flex items-center justify-center shadow-[3px_3px_0px_#1a1a1a] ${selectedChartSymbol === sym ? 'bg-white' : 'bg-[#f8fafc] group-hover:bg-primary/10'}`}>
                                                                    <Zap className={`w-6 h-6 ${selectedChartSymbol === sym ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} />
                                                                </div>
                                                                <span className={`text-2xl font-black font-cartoon ${selectedChartSymbol === sym ? 'text-white' : 'text-[#1a1a1a]'}`}>{sym}</span>
                                                            </div>
                                                            <div className={`text-sm font-black px-3 py-1 rounded-full border-[2px] border-[#1a1a1a] ${prices[sym]?.change >= 0 ? (selectedChartSymbol === sym ? 'bg-white text-primary' : 'bg-success text-white') : (selectedChartSymbol === sym ? 'bg-white text-error' : 'bg-error text-white')}`}>
                                                                {prices[sym]?.change >= 0 ? '🚀' : '🎈'} {Math.abs(prices[sym]?.change || 0).toFixed(2)}%
                                                            </div>
                                                        </div>
                                                        <div className="flex items-baseline justify-between relative z-10">
                                                            <span className={`text-3xl font-black font-cartoon ${selectedChartSymbol === sym ? 'text-white' : 'text-[#1a1a1a]'}`}>
                                                                ${prices[sym]?.current ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(prices[sym].current) : '0.00'}
                                                            </span>
                                                        </div>

                                                        {/* Decorative background letter */}
                                                        <div className={`absolute -bottom-2 -right-1 text-7xl font-black select-none pointer-events-none group-hover:scale-110 transition-transform ${selectedChartSymbol === sym ? 'text-white opacity-20' : 'text-[#1a1a1a] opacity-5'}`}>
                                                            {sym.charAt(0)}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bottom Mask */}
                                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#fdf6ff] to-transparent z-10 pointer-events-none opacity-0 group-hover/scroll:opacity-100 transition-opacity"></div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {activeTab === 'fleet' && (
                        <div className="space-y-10">
                            <section className="bubbly-card bg-white overflow-hidden relative">
                                <div className="p-8 border-b-[3px] border-[#1a1a1a] flex justify-between items-center bg-[#f0f9ff]">
                                    <h3 className="text-2xl font-black text-[#1a1a1a] font-cartoon flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#33D1FF] flex items-center justify-center border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a]">
                                            <ShieldCheck className="w-8 h-8 text-[#1a1a1a]" />
                                        </div>
                                        Robot Army Barracks
                                    </h3>
                                    <div className="flex gap-4">
                                        <div className="text-xs font-black text-[#555] bg-white border-[2px] border-[#1a1a1a] px-4 py-2 rounded-xl shadow-[2px_2px_0px_#1a1a1a]">Active: {(Array.isArray(rules) ? rules : []).filter(r => r.status === 'active').length}</div>
                                        <div className="text-xs font-black text-[#555] bg-white border-[2px] border-[#1a1a1a] px-4 py-2 rounded-xl shadow-[2px_2px_0px_#1a1a1a]">Done: {(Array.isArray(rules) ? rules : []).filter(r => r.status === 'active' || r.status === 'completed').filter(r => r.status === 'completed').length}</div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto custom-scrollbar">
                                    <table className="w-full text-left">
                                        <thead className="text-sm font-black text-[#1a1a1a] bg-[#f8fafc] border-b-[3px] border-[#1a1a1a]">
                                            <tr>
                                                <th className="py-6 px-10">Robot ID</th>
                                                <th className="py-6 px-10">Mission Logic</th>
                                                <th className="py-6 px-10 text-center">Mood</th>
                                                <th className="py-6 px-10 text-right">Missions Done</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y-[3px] divide-[#1a1a1a]/5">
                                            {rules.map((rule) => (
                                                <tr key={rule.id} className="group hover:bg-[#f0fdf4] transition-all">
                                                    <td className="py-8 px-10">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-white border-[3px] border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] flex items-center justify-center font-black text-md text-primary">
                                                                {rule.tokenSymbol.substring(0, 1)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-cartoon text-lg text-[#1a1a1a]">Robot_{rule.id.substring(0, 8)}</span>
                                                                <span className="text-xs text-gray-400 font-black">{rule.tokenSymbol} Specialist</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-8 px-10">
                                                        <div className="inline-block px-4 py-2 bg-white border-[2px] border-[#1a1a1a] rounded-xl shadow-[2px_2px_0px_#1a1a1a]">
                                                            <span className="text-[#1a1a1a] font-black block text-sm">Dip Hunter V3</span>
                                                            <span className="text-primary block text-[10px] font-black">Trigger: -{rule.targetDrop}%</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-8 px-10">
                                                        <div className="flex justify-center">
                                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black border-[3px] border-[#1a1a1a] shadow-[3px_3px_0px_#1a1a1a] ${rule.status === 'active' ? 'bg-[#33D1FF] text-white' : 'bg-[#10B981] text-white'}`}>
                                                                {rule.status === 'active' ? 'WORKING' : 'FINISHED'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-8 px-10 text-right font-cartoon text-xl text-[#1a1a1a]">
                                                        {rule.trades?.length || 0}
                                                    </td>
                                                </tr>
                                            ))}
                                            {rules.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="py-20 text-center font-cartoon text-gray-300 text-xl">
                                                        No robots recruited yet!
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'vault' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                {
                                    title: "Available Candy",
                                    amount: `$${((Array.isArray(rules) ? rules : []).filter(r => r.status === 'active').reduce((sum, r) => sum + Number(r.amount), 0)).toLocaleString()}`,
                                    unit: "ALREADY IN USE",
                                    color: "bg-[#FFD700]",
                                    icon: <Star className="w-8 h-8" />,
                                    trend: null
                                },
                                {
                                    title: "Stashed Away",
                                    amount: "$0.00",
                                    unit: "TOTAL PROFIT",
                                    color: "bg-[#FF7EB9]",
                                    icon: <Heart className="w-8 h-8" />,
                                    trend: null
                                },
                                {
                                    title: "Risk Meter",
                                    amount: rules.filter(r => r.status === 'active').length > 0 ? "Active" : "Stable",
                                    unit: "CURRENT STATE",
                                    color: "bg-[#10B981]",
                                    icon: <ShieldCheck className="w-8 h-8" />,
                                    trend: null
                                }
                            ].map((card, i) => (
                                <div key={i} className="bubbly-card p-10 bg-white relative overflow-hidden group hover:-translate-y-2 transition-transform">
                                    <div className={`absolute top-0 right-0 w-32 h-32 ${card.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 -z-1 transition-transform group-hover:scale-150`} />
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className={`p-4 rounded-2xl border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] ${card.color}`}>
                                            {card.icon}
                                        </div>
                                        <span className="text-sm font-black text-gray-400 uppercase tracking-widest">{card.title}</span>
                                    </div>
                                    <h4 className="text-4xl font-black text-[#1a1a1a] font-cartoon mb-2">{card.amount}</h4>
                                    <div className="flex justify-between items-center text-xs font-black text-gray-400">
                                        <span>{card.unit}</span>
                                        {card.trend && (
                                            <div className="flex items-center gap-1 text-green-500">
                                                <Sparkles className="w-3 h-3" /> {card.trend}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <section className="md:col-span-3 bubbly-card bg-white overflow-hidden relative">
                                <div className="p-8 border-b-[3px] border-[#1a1a1a] bg-[#f8fafc] flex justify-between items-center sm:flex-row flex-col gap-4">
                                    <h3 className="text-2xl font-black text-[#1a1a1a] font-cartoon">The Treasure Chest</h3>
                                    <button className="bubbly-button bg-success text-white flex items-center gap-2 text-sm py-2 px-6 hover:bg-[#059669]">
                                        <Plus className="w-4 h-4" /> Deposit Assets
                                    </button>
                                </div>
                                <div className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {['SOL', 'ETH', 'BTC', 'USDC'].map(asset => (
                                        <div key={asset} className="p-8 bg-[#fdf6ff] border-[3px] border-[#1a1a1a] rounded-3xl flex flex-col items-center gap-4 group hover:bg-[#8B5CF6]/5 transition-colors">
                                            <div className="w-16 h-16 rounded-2xl bg-white border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] flex items-center justify-center group-hover:rotate-6 transition-transform">
                                                <Zap className="w-8 h-8 text-primary" />
                                            </div>
                                            <div className="text-center">
                                                <div className="font-cartoon text-2xl text-[#1a1a1a]">{asset}</div>
                                                <div className="font-black text-xs text-gray-400 uppercase">
                                                    Balance: {asset === 'USDC' ? '10,000.00' : '0.00'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'archive' && (
                        <div className="space-y-10">
                            <section className="bubbly-card bg-white overflow-hidden relative">
                                <div className="p-8 border-b-[3px] border-[#1a1a1a] bg-[#fdf6ff] flex justify-between items-center">
                                    <h3 className="text-2xl font-black text-[#1a1a1a] font-cartoon">Mission Log Archive</h3>
                                    <button className="px-6 py-2 bg-white border-[3px] border-[#1a1a1a] rounded-xl text-xs font-black text-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">Reset Telescope</button>
                                </div>
                                <div className="p-24 text-center space-y-6">
                                    <div className="w-24 h-24 bg-[#f8fafc] border-[3px] border-[#1a1a1a] rounded-full flex items-center justify-center mx-auto shadow-[6px_6px_0px_#1a1a1a]">
                                        <History className="w-12 h-12 text-gray-300" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-gray-300 font-cartoon text-3xl">Dusty Shelves...</h4>
                                        <p className="text-sm text-gray-400 font-black max-w-sm mx-auto">No old robot missions found yet! Recruit some friends to see their history here!</p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* Simple Footer for Dashboard */}
                    <footer className="mt-20 py-10 border-t-[3px] border-[#1a1a1a] flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-sm font-black text-gray-400">
                            RIALO v0.1.0 • PURE MAGIC 🪄
                        </div>

                        <div className="bubbly-card px-8 py-4 bg-[#FF7EB9] flex items-center gap-4 hover:rotate-2 transition-transform cursor-pointer">
                            <div className="w-4 h-4 rounded-full bg-white border-2 border-[#1a1a1a] animate-ping" />
                            <span className="text-sm font-black text-white">
                                Built with love by <span className="underline decoration-2">Elias</span>
                            </span>
                        </div>

                        <div className="flex gap-10">
                            <span className="flex items-center gap-2 text-xs font-black text-gray-500">
                                <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full border-2 border-[#1a1a1a]" /> INTERNET: OK
                            </span>
                            <span className="flex items-center gap-2 text-xs font-black text-gray-500">
                                <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full border-2 border-[#1a1a1a]" /> SECURE: YES
                            </span>
                        </div>
                    </footer>
                </div>
            </main>
        </div>
    );
}

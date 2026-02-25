"use client";

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Shield,
    BarChart3,
    ChevronRight,
    Bot,
    Cpu,
    Globe,
    Lock,
    ArrowRight,
    Layers,
    Terminal as TerminalIcon,
    Code2,
    Play,
    Star,
    Heart,
    Smile
} from 'lucide-react';

export default function LandingPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0, scale: 0.95 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 100, damping: 15 }
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden cartoon-grid bg-[#fdf6ff]">
            {/* Playful Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="blob" style={{ top: '10%', left: '10%', background: 'linear-gradient(135deg, #FF7EB9 0%, #FFD700 100%)' }} />
                <div className="blob" style={{ bottom: '20%', right: '5%', background: 'linear-gradient(135deg, #8B5CF6 0%, #33D1FF 100%)', transform: 'scale(1.2)' }} />
                <div className="blob" style={{ top: '40%', right: '20%', background: 'linear-gradient(135deg, #10B981 0%, #F59E0B 100%)', opacity: 0.1 }} />
            </div>

            {/* Navigation */}
            <nav className="flex justify-between items-center px-6 md:px-12 py-6 max-w-7xl mx-auto fixed top-4 left-0 right-0 z-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a]"
                >
                    <div className="w-8 h-8 overflow-hidden flex items-center justify-center rounded-xl bg-primary">
                        <img src="/logo.png" alt="Rialo Logo" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[#1a1a1a] font-cartoon">Rialo</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hidden lg:flex items-center gap-6 bg-white/80 backdrop-blur-md px-8 py-3 rounded-2xl border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] text-sm font-bold text-[#1a1a1a]"
                >
                    <a href="#features" className="hover:text-primary transition-all">Smarty Pants</a>
                    <a href="#vision" className="hover:text-primary transition-all">The Plan</a>
                    <a href="#infrastructure" className="hover:text-primary transition-all">Engine Room</a>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <Link href="/dashboard" className="bubbly-button bg-[#FFD700] text-[#1a1a1a] hover:bg-[#FFC000]">
                        Let's Go! <ArrowRight className="inline-block w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </nav>


            {/* Hero Section */}
            <section className="pt-40 pb-32 px-6 max-w-7xl mx-auto relative z-10 text-center">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <motion.div
                        variants={itemVariants}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-[3px] border-[#1a1a1a] text-[#1a1a1a] text-xs font-black mb-8 shadow-[4px_4px_0px_#1a1a1a]"
                    >
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-pulse" />
                        AI MAGIC IS HERE!
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 animate-pulse" />
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-8xl font-black tracking-tight leading-[1] text-[#1a1a1a] mb-8 font-cartoon"
                    >
                        Trading made <br />
                        <span className="text-primary underline decoration-[#FFD700] decoration-8 underline-offset-8">Super Easy.</span>
                    </motion.h1>

                    <div className="max-w-3xl mx-auto relative mb-16">
                        <motion.p
                            variants={itemVariants}
                            className="text-lg md:text-xl text-[#333] font-bold leading-relaxed mb-12 bg-white/50 backdrop-blur-sm p-6 rounded-3xl border-[3px] border-[#1a1a1a] border-dashed"
                        >
                            Your very own AI buddy for the blockchain! Rialo handles all the boring stuff while you enjoy the ride. It's smart, fun, and really, really fast!
                        </motion.p>

                        {/* Floating elements near text */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-10 -left-10 hidden md:block"
                        >
                            <Smile className="w-12 h-12 text-blue-500" />
                        </motion.div>
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute -bottom-5 -right-5 hidden md:block"
                        >
                            <Heart className="w-12 h-12 text-pink-500 fill-pink-500" />
                        </motion.div>
                    </div>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link
                            href="/dashboard"
                            className="px-10 py-5 bg-primary text-white font-black rounded-3xl hover:bg-primary-hover border-[4px] border-[#1a1a1a] shadow-[8px_8px_0px_#1a1a1a] transition-all hover:-translate-y-1 hover:-translate-x-1 active:translate-x-1 active:translate-y-1 text-xl flex items-center justify-center gap-3 group"
                        >
                            <Play className="w-6 h-6 fill-current" />
                            Launch Your Agent!
                        </Link>
                        <a
                            href="#features"
                            className="px-10 py-5 bg-white text-[#1a1a1a] font-black rounded-3xl hover:bg-gray-50 border-[4px] border-[#1a1a1a] shadow-[8px_8px_0px_#1a1a1a] transition-all hover:-translate-y-1 hover:-translate-x-1 active:translate-x-1 active:translate-y-1 text-xl flex items-center justify-center"
                        >
                            How it works?
                        </a>
                    </motion.div>
                </motion.div>
            </section>

            {/* Feature Cards with Cartoon Aesthetics */}
            <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <Layers className="w-10 h-10 text-[#1a1a1a]" />,
                            color: "bg-[#FF7EB9]",
                            title: "Smart Stacks",
                            desc: "Everything fits together like Lego bricks! Build your strategy piece by piece."
                        },
                        {
                            icon: <Bot className="w-10 h-10 text-[#1a1a1a]" />,
                            color: "bg-[#33D1FF]",
                            title: "AI bestie",
                            desc: "An AI that actually explains things to you! No more techno-babble, just clear logic."
                        },
                        {
                            icon: <Code2 className="w-10 h-10 text-[#1a1a1a]" />,
                            color: "bg-[#10B981]",
                            title: "Free Spirit",
                            desc: "Open source and open minded! Connect anything to everything. The sky's the limit!"
                        }
                    ].map((f, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 1 : -1 }}
                            className="bubbly-card p-10 flex flex-col items-center text-center group"
                        >
                            <div className={`mb-8 p-6 ${f.color} rounded-[2rem] border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] group-hover:animate-bounce`}>
                                {f.icon}
                            </div>
                            <h3 className="text-3xl font-black mb-4 text-[#1a1a1a] font-cartoon">{f.title}</h3>
                            <p className="text-[#444] font-bold leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Interactive Section */}
            <section id="vision" className="py-24 px-6 max-w-7xl mx-auto">
                <div className="bg-[#8B5CF6] rounded-[4rem] border-[5px] border-[#1a1a1a] shadow-[15px_15px_0px_#FFD700] p-12 md:p-24 relative overflow-hidden text-center">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 cartoon-grid" />

                    <motion.div
                        whileInView={{ opacity: 1, scale: 1 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="relative z-10"
                    >
                        <h2 className="text-5xl md:text-8xl font-black text-white mb-10 font-cartoon drop-shadow-[4px_4px_0px_#1a1a1a]">
                            Wanna play?
                        </h2>
                        <p className="text-white/90 text-2xl font-bold mb-12 max-w-2xl mx-auto">
                            Step into the future of autonomous commerce. It's safe, it's cute, and it's super powerful!
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-4 bg-[#FFD700] text-[#1a1a1a] px-12 py-6 rounded-3xl font-black text-2xl hover:bg-white border-[4px] border-[#1a1a1a] shadow-[8px_8px_0px_#1a1a1a] transition-all active:scale-95"
                        >
                            Start Now! <TerminalIcon className="w-8 h-8" />
                        </Link>
                    </motion.div>

                    <div className="mt-20 flex flex-wrap justify-center gap-6 relative z-10">
                        {["ETH", "SOL", "BTC", "USDC", "RIALO"].map((token, i) => (
                            <motion.span
                                key={token}
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
                                className="px-6 py-3 rounded-2xl bg-white border-[3px] border-[#1a1a1a] text-sm font-black text-primary shadow-[4px_4px_0px_#1a1a1a]"
                            >
                                {token}_ready
                            </motion.span>
                        ))}
                    </div>
                </div>
            </section>

            <footer id="infrastructure" className="pt-24 pb-12 px-6 bg-white border-t-[5px] border-[#1a1a1a]">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                        <div className="col-span-1 md:col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <img src="/logo.png" alt="Rialo Logo" className="w-10 h-10 object-contain" />
                                <span className="text-3xl font-black tracking-tight text-[#1a1a1a] font-cartoon">Rialo</span>
                            </div>
                            <p className="text-[#555] font-bold max-w-sm text-lg">
                                Making the complex world of blockchain simple and beautiful for everyone!
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-xl font-black text-[#1a1a1a] font-cartoon">Magic</h4>
                            <ul className="space-y-4 text-md font-bold text-[#666]">
                                <li><a href="#" className="hover:text-primary transition-colors underline decoration-dashed">Tutorials</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors underline decoration-dashed">API Stuff</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors underline decoration-dashed">Secret Sauce</a></li>
                            </ul>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-xl font-black text-[#1a1a1a] font-cartoon">Friends</h4>
                            <ul className="space-y-4 text-md font-bold text-[#666]">
                                <li><a href="#" className="hover:text-primary transition-colors underline decoration-dashed">Birdie (X)</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors underline decoration-dashed">Chat (Discord)</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors underline decoration-dashed">The Lab</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center border-t-[3px] border-[#1a1a1a] pt-12 gap-8">
                        <div className="text-sm font-black text-[#888]">
                            © 2026 Rialo Alpha Protocol • Made with ❤️
                        </div>

                        <div className="bg-[#FF7EB9] px-6 py-3 rounded-2xl border-[3px] border-[#1a1a1a] shadow-[4px_4px_0px_#1a1a1a] flex items-center gap-3 hover:rotate-2 transition-transform cursor-pointer">
                            <Smile className="w-5 h-5 text-white fill-white" />
                            <span className="text-sm font-black text-white">
                                Built by <span className="underline decoration-2">Elias</span>
                            </span>
                        </div>

                        <div className="flex gap-8 text-sm font-black text-[#888]">
                            <a href="#" className="hover:text-[#1a1a1a]">Cookies</a>
                            <a href="#" className="hover:text-[#1a1a1a]">Secrets</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import axios from 'axios';
import { getAIReasoning } from '@/lib/ai';
import { checkAndAwardBadges } from '@/lib/badges';

// Map symbols to CoinGecko IDs
const SYMBOL_MAP: Record<string, string> = {
    'SOL': 'solana',
    'ETH': 'ethereum',
    'BTC': 'bitcoin',
    'BNB': 'binancecoin',
    'ADA': 'cardano',
    'DOT': 'polkadot',
    'LINK': 'chainlink',
    'POL': 'polygon-ecosystem-token',
    'XRP': 'ripple',
    'AVAX': 'avalanche-2',
};

export async function GET() {
    try {
        const cmcKey = process.env.CMC_API_KEY;
        let prices: any = {};
        const useMock = !cmcKey || cmcKey === 'your_cmc_api_key_here';

        if (useMock) {
            console.warn('CMC_API_KEY is missing or placeholder. Using mock data for demo.');
            prices = {
                'SOL': { current: 145.20, change: 5.4, high24h: 150.00, low24h: 140.00 },
                'ETH': { current: 3240.50, change: -1.2, high24h: 3300.00, low24h: 3200.00 },
                'BTC': { current: 65200.00, change: 2.1, high24h: 66000.00, low24h: 64000.00 },
                'BNB': { current: 580.00, change: 0.8, high24h: 590.00, low24h: 575.00 },
                'ADA': { current: 0.45, change: -3.5, high24h: 0.48, low24h: 0.44 },
                'DOT': { current: 7.20, change: 1.5, high24h: 7.50, low24h: 7.00 },
                'LINK': { current: 18.50, change: 4.2, high24h: 19.00, low24h: 17.50 },
                'POL': { current: 0.75, change: -0.5, high24h: 0.78, low24h: 0.74 },
                'XRP': { current: 0.62, change: 1.2, high24h: 0.64, low24h: 0.61 },
                'AVAX': { current: 38.40, change: -2.3, high24h: 40.00, low24h: 37.50 }
            };
        } else {
            // 1. Fetch Prices from CMC
            try {
                const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest', {
                    params: {
                        symbol: Object.keys(SYMBOL_MAP).join(','),
                        convert: 'USD'
                    },
                    headers: {
                        'X-CMC_PRO_API_KEY': cmcKey
                    },
                    timeout: 10000
                });

                if (response.data && response.data.data) {
                    const cmcData = response.data.data;
                    Object.keys(SYMBOL_MAP).forEach(sym => {
                        const token = Array.isArray(cmcData[sym]) ? cmcData[sym][0] : cmcData[sym];
                        if (token && token.quote?.USD) {
                            const quote = token.quote.USD;
                            prices[sym] = {
                                current: quote.price,
                                high24h: quote.price, // Fallback as CMC simple quote doesn't provide 24h high/low directly in this endpoint
                                change: quote.percent_change_24h || 0,
                                low24h: quote.price
                            };
                        }
                    });
                }
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error('CMC API fetch failed, falling back to mocks:', msg);
                prices = {
                    'SOL': { current: 145.20, change: 5.4, high24h: 150.00, low24h: 140.00 },
                    'ETH': { current: 3240.50, change: -1.2, high24h: 3300.00, low24h: 3200.00 },
                    'BTC': { current: 65200.00, change: 2.1, high24h: 66000.00, low24h: 64000.00 },
                    'BNB': { current: 580.00, change: 0.8, high24h: 590.00, low24h: 575.00 },
                    'ADA': { current: 0.45, change: -3.5, high24h: 0.48, low24h: 0.44 },
                    'DOT': { current: 7.20, change: 1.5, high24h: 7.50, low24h: 7.00 },
                    'LINK': { current: 18.50, change: 4.2, high24h: 19.00, low24h: 17.50 },
                    'POL': { current: 0.75, change: -0.5, high24h: 0.78, low24h: 0.74 },
                    'XRP': { current: 0.62, change: 1.2, high24h: 0.64, low24h: 0.61 },
                    'AVAX': { current: 38.40, change: -2.3, high24h: 40.00, low24h: 37.50 }
                };
            }
        }

        // Save to DB and prepare prices object
        const savePromises = Object.keys(prices).map(async (sym) => {
            const data = prices[sym];
            return prisma.priceData.create({
                data: {
                    tokenSymbol: sym,
                    price: Number(data.current),
                    high24h: Number(data.high24h),
                    low24h: Number(data.low24h)
                }
            });
        });

        await Promise.all(savePromises);

        // 2. Get all active strategies with their last AI thought
        const activeStrategies = await prisma.strategy.findMany({
            where: { status: 'active' },
            include: {
                logs: {
                    where: { type: 'ai_thought' },
                    orderBy: { timestamp: 'desc' },
                    take: 1
                }
            }
        });

        if (activeStrategies.length === 0) {
            return NextResponse.json({ timestamp: new Date().toISOString(), prices, results: [] });
        }

        // Fetch "Previous Price" for each token to determine if we need to update reasoning (Caching logic)
        const uniqueSymbols = [...new Set(activeStrategies.map(s => s.tokenSymbol))];
        const previousPricesList = await Promise.all(
            uniqueSymbols.map(sym =>
                prisma.priceData.findFirst({
                    where: { tokenSymbol: sym },
                    orderBy: { timestamp: 'desc' },
                    skip: 1 // Skip the price we just saved
                })
            )
        );
        const prevPriceMap: Record<string, number> = {};
        previousPricesList.forEach(p => { if (p) prevPriceMap[p.tokenSymbol] = p.price; });

        const aiInputs = [];
        const finalAIAnalyses: Record<string, { decision: string; advice: string }> = {};

        for (const strategy of activeStrategies) {
            const marketData = prices[strategy.tokenSymbol];
            if (!marketData) continue;

            const currentPrice = marketData.current;
            const currentDrop = ((marketData.high24h - marketData.current) / marketData.high24h) * 100;
            const lastThought = strategy.logs[0];
            const prevPrice = prevPriceMap[strategy.tokenSymbol];

            // CACHING LOGIC: If price moved < 0.5% and target hasn't been hit, reuse old advice
            let needsAI = true;
            if (lastThought && prevPrice && currentDrop < strategy.targetDrop) {
                const priceDiff = Math.abs((currentPrice - prevPrice) / prevPrice) * 100;
                if (priceDiff < 0.5) {
                    needsAI = false;
                    finalAIAnalyses[strategy.id] = { decision: "MONITOR", advice: lastThought.message };
                }
            }

            if (needsAI) {
                aiInputs.push({
                    id: strategy.id,
                    token: strategy.tokenSymbol,
                    currentPrice: marketData.current,
                    high24h: marketData.high24h,
                    dropPercentage: currentDrop,
                    targetDrop: strategy.targetDrop
                });
            }
        }

        // 3. Call Batched AI Reasoning
        if (aiInputs.length > 0) {
            const batchedResults = await getAIReasoning(aiInputs);
            batchedResults.forEach(res => {
                finalAIAnalyses[res.id] = { decision: res.decision, advice: res.advice };
            });
        }

        const results = [];

        // 4. Process all strategies with their (new or cached) reasoning
        for (const strategy of activeStrategies) {
            const analysis = finalAIAnalyses[strategy.id];
            if (!analysis) continue;

            const marketData = prices[strategy.tokenSymbol];
            const currentDrop = ((marketData.high24h - marketData.current) / marketData.high24h) * 100;

            let shouldExecute = analysis.decision === "EXECUTE" && currentDrop >= strategy.targetDrop;

            // Log AI Thought to DB (only if it's NEW - check if it's different from last or if we actually called AI)
            // To keep it simple, we'll log it if we had to call AI (aiInputs contains this strategy)
            const wasAiCalled = aiInputs.some(input => input.id === strategy.id);
            if (wasAiCalled) {
                await prisma.log.create({
                    data: {
                        strategyId: strategy.id,
                        message: analysis.advice,
                        type: 'ai_thought'
                    }
                });
            }

            // 5. Execute Trade if triggered and AI agrees
            if (shouldExecute) {
                const amountBought = strategy.amount / marketData.current;

                await prisma.$transaction(async (tx) => {
                    await tx.trade.create({
                        data: {
                            strategyId: strategy.id,
                            executionPrice: marketData.current,
                            amountBought: amountBought
                        }
                    });
                    await tx.strategy.update({
                        where: { id: strategy.id },
                        data: { status: 'completed' }
                    });
                    await tx.log.create({
                        data: {
                            strategyId: strategy.id,
                            message: `SIMULATED BUY: Agent executed purchase of ${amountBought.toFixed(4)} ${strategy.tokenSymbol} @ $${marketData.current}.`,
                            type: 'success'
                        }
                    });
                });

                // Check and award badges after trade
                await checkAndAwardBadges(strategy.id);

                results.push({ strategyId: strategy.id, status: 'executed' });
            } else {
                results.push({ strategyId: strategy.id, status: 'monitored' });
            }
        }

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            prices,
            results
        });
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Tick error:', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

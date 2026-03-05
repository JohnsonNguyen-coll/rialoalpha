import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
import axios from 'axios';
import { getAIReasoning } from '@/lib/ai';

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

        // 2. Get all active strategies
        const activeStrategies = await prisma.strategy.findMany({
            where: { status: 'active' }
        });

        const results = [];

        for (const strategy of activeStrategies) {
            const marketData = prices[strategy.tokenSymbol];
            if (!marketData) continue;

            const currentDrop = ((marketData.high24h - marketData.current) / marketData.high24h) * 100;

            // --- AI REASONING LAYER ---
            const aiReason = await getAIReasoning({
                token: strategy.tokenSymbol,
                currentPrice: marketData.current,
                high24h: marketData.high24h,
                dropPercentage: currentDrop,
                targetDrop: strategy.targetDrop
            });

            let shouldExecute = aiReason.decision === "EXECUTE" && currentDrop >= strategy.targetDrop;

            // Log AI Thought to DB
            await prisma.log.create({
                data: {
                    strategyId: strategy.id,
                    message: aiReason.advice,
                    type: 'ai_thought'
                }
            });

            // 3. Execute Trade if triggered and AI agrees
            if (shouldExecute) {
                const amountBought = strategy.amount / marketData.current;

                await prisma.$transaction([
                    prisma.trade.create({
                        data: {
                            strategyId: strategy.id,
                            executionPrice: marketData.current,
                            amountBought: amountBought
                        }
                    }),
                    prisma.strategy.update({
                        where: { id: strategy.id },
                        data: { status: 'completed' }
                    }),
                    prisma.log.create({
                        data: {
                            strategyId: strategy.id,
                            message: `SIMULATED BUY: Agent executed purchase of ${amountBought.toFixed(4)} ${strategy.tokenSymbol} @ $${marketData.current}.`,
                            type: 'success'
                        }
                    })
                ]);

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

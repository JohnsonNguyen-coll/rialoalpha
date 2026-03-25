import { NextResponse } from 'next/server';
import axios from 'axios';

// Map symbols to CoinGecko IDs for historical data
const GECKO_ID_MAP: Record<string, string> = {
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

export async function POST(req: Request) {
    try {
        const { tokenSymbol, targetDrop, takeProfit, amount, days = 30 } = await req.json();

        const geckoId = GECKO_ID_MAP[tokenSymbol] || tokenSymbol.toLowerCase();

        // 1. Fetch historical prices (hourly for 30 days or daily for more)
        const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart`, {
            params: {
                vs_currency: 'usd',
                days: days,
                interval: days <= 90 ? 'hourly' : 'daily'
            }
        });

        const prices: [number, number][] = response.data.prices; // [timestamp, price]
        
        if (!prices || prices.length === 0) {
            throw new Error('No price data found for this token.');
        }

        // 2. Simulation Logic
        let currentStatus: 'active' | 'holding' = 'active';
        let buyPrice = 0;
        let totalPnl = 0;
        let tradeCount = 0;
        const trades = [];
        let rollingHigh = prices[0][1];
        let lastHighTimestamp = prices[0][0];

        // 24 hours in milliseconds
        const MS_PER_DAY = 24 * 60 * 60 * 1000;

        for (let i = 0; i < prices.length; i++) {
            const [timestamp, currentPrice] = prices[i];

            // Update rolling 24h high
            // We look back at the last 24 entries (if hourly) or approximate
            // For simplicity in backtest, we'll use a sliding window of the last 24 hours
            let windowHigh = 0;
            let j = i;
            while (j >= 0 && timestamp - prices[j][0] <= MS_PER_DAY) {
                if (prices[j][1] > windowHigh) windowHigh = prices[j][1];
                j--;
            }
            rollingHigh = windowHigh;

            if (currentStatus === 'active') {
                const dropPct = ((rollingHigh - currentPrice) / rollingHigh) * 100;

                if (dropPct >= Number(targetDrop)) {
                    currentStatus = 'holding';
                    buyPrice = currentPrice;
                    trades.push({
                        type: 'BUY',
                        price: buyPrice,
                        timestamp: new Date(timestamp).toISOString(),
                        drop: dropPct.toFixed(2)
                    });
                }
            } else if (currentStatus === 'holding') {
                const profitPct = ((currentPrice - buyPrice) / buyPrice) * 100;

                if (profitPct >= Number(takeProfit)) {
                    const profitAmount = (amount * profitPct) / 100;
                    totalPnl += profitAmount;
                    tradeCount++;
                    trades.push({
                        type: 'SELL',
                        price: currentPrice,
                        timestamp: new Date(timestamp).toISOString(),
                        profit: profitPct.toFixed(2),
                        pnl: profitAmount.toFixed(2)
                    });
                    currentStatus = 'active';
                    // After selling, we reset rolling high to current to avoid immediate re-buy if drop is still valid
                    rollingHigh = currentPrice;
                }
            }
        }

        // If still holding at the end, calculate unrealized PnL
        let unrealizedPnl = 0;
        if (currentStatus === 'holding') {
            const finalPrice = prices[prices.length - 1][1];
            unrealizedPnl = (amount * (finalPrice - buyPrice)) / buyPrice;
        }

        const totalReturnPct = (totalPnl / amount) * 100;

        return NextResponse.json({
            tokenSymbol,
            period: `${days} days`,
            initialAmount: amount,
            totalTrades: tradeCount,
            totalProfit: totalPnl.toFixed(2),
            returnPercentage: totalReturnPct.toFixed(2),
            unrealizedPnl: unrealizedPnl.toFixed(2),
            trades: trades,
            chartData: prices.map(p => ({ time: p[0], price: p[1] }))
        });

    } catch (error: any) {
        console.error('Backtest error:', error?.message);
        return NextResponse.json({ error: error?.message || 'Failed to run backtest' }, { status: 500 });
    }
}

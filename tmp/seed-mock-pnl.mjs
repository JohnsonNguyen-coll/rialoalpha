import { prisma } from './src/lib/prisma.js'; // Adjust path if needed, but let's use a script that can import ts

async function seed() {
    console.log('🌱 Seeding mock data...');

    // 1. Clear existing data
    await prisma.trade.deleteMany();
    await prisma.log.deleteMany();
    await prisma.strategy.deleteMany();

    // 2. Create Strategies
    const s1 = await prisma.strategy.create({
        data: {
            tokenSymbol: 'SOL',
            targetDrop: 5,
            amount: 1000,
            status: 'active',
        }
    });

    const s2 = await prisma.strategy.create({
        data: {
            tokenSymbol: 'ETH',
            targetDrop: 3,
            amount: 2000,
            status: 'active',
        }
    });

    const s3 = await prisma.strategy.create({
        data: {
            tokenSymbol: 'BTC',
            targetDrop: 2,
            amount: 5000,
            status: 'completed',
        }
    });

    // 3. Create Mock Trades with PnL
    // For s1: -20 USD loss
    await prisma.trade.create({
        data: {
            strategyId: s1.id,
            executionPrice: 150.5,
            amountBought: 6.64, // ~1000/150.5
            timestamp: new Date(Date.now() - 86400000 * 2),
            pnl: -20.5
        }
    });

    // For s2: +150 USD profit
    await prisma.trade.create({
        data: {
            strategyId: s2.id,
            executionPrice: 2400,
            amountBought: 0.833,
            timestamp: new Date(Date.now() - 86400000),
            pnl: 155.2
        }
    });

    // For s3: +450 USD profit
    await prisma.trade.create({
        data: {
            strategyId: s3.id,
            executionPrice: 65000,
            amountBought: 0.076,
            timestamp: new Date(Date.now() - 3600000 * 5),
            pnl: 450.0
        }
    });

    console.log('✅ Mock data seeded successfully!');
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

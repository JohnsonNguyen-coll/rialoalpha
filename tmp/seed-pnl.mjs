import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

const adapter = new PrismaLibSql({ url, authToken })
const prisma = new PrismaClient({ adapter })

async function seed() {
    console.log('🌱 Seeding mock data with PnL...');

    try {
        // 1. Clear existing data
        // await prisma.trade.deleteMany();
        // await prisma.log.deleteMany();
        // await prisma.strategy.deleteMany();

        // 2. Create Strategies
        const s1 = await prisma.strategy.create({
            data: {
                tokenSymbol: 'SOL',
                targetDrop: 5.5,
                amount: 1000,
                status: 'active',
            }
        });
        console.log('Created Strategy 1');

        const s2 = await prisma.strategy.create({
            data: {
                tokenSymbol: 'ETH',
                targetDrop: 3.2,
                amount: 2500,
                status: 'active',
            }
        });
        console.log('Created Strategy 2');

        // Note: Trade table might not have PnL yet via db push, so we'll skip the pnl field if it fails
        try {
            await prisma.trade.create({
                data: {
                    strategyId: s1.id,
                    executionPrice: 145.2,
                    amountBought: 6.88,
                    timestamp: new Date(Date.now() - 86400000 * 3),
                    pnl: -45.5 // If this fails, then db push didn't happen correctly
                }
            });
            console.log('Created Trade for SOL with PnL');
        } catch (e) {
            console.warn('⚠️ Trade creation with PnL failed. Falling back to no PnL create.');
            await prisma.trade.create({
                data: {
                    strategyId: s1.id,
                    executionPrice: 145.2,
                    amountBought: 6.88,
                    timestamp: new Date(Date.now() - 86400000 * 3),
                }
            });
            console.log('Created Trade for SOL (no pnl field)');
        }

        console.log('✅ Mock data seeded successfully!');
    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

seed();

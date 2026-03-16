import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import dotenv from 'dotenv'

// 1. Tải môi trường từ .env.local
dotenv.config({ path: './.env.local' });
const url = process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
console.log("DATABASE_URL =", process.env.DATABASE_URL);
console.log("TURSO_AUTH_TOKEN =", process.env.TURSO_AUTH_TOKEN ? "FOUND" : "MISSING");
if (!url || !authToken) {
    console.error('❌ Thiếu TURSO_DATABASE_URL hoặc TURSO_AUTH_TOKEN trong .env.local');
    process.exit(1);
}

// 2. Khởi tạo LibSQL Client và Prisma Adapter
const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});
// Chúng ta truyền url vào datasource để Prisma không báo lỗi 'undefined'
const prisma = new PrismaClient({
    adapter
});

async function seed() {
    console.log('🌱 Đang tạo dữ liệu mẫu PnL cho Robot Army...');

    try {
        // Xóa dữ liệu cũ để làm mới bảng Leaderboard
        console.log('🧹 Đang dọn dẹp dữ liệu cũ trên Turso...');
        await prisma.trade.deleteMany();
        await prisma.log.deleteMany();
        await prisma.strategy.deleteMany();

        const robots = [
            { symbol: 'SOL', drop: 5.5, amount: 1200, status: 'active' },
            { symbol: 'ETH', drop: 3.2, amount: 2500, status: 'active' },
            { symbol: 'BTC', drop: 2.0, amount: 5000, status: 'completed' },
            { symbol: 'LINK', drop: 8.0, amount: 1000, status: 'active' }
        ];

        console.log('🤖 Đang triệu hồi Robot...');
        const createdStrategies = [];
        for (const r of robots) {
            const s = await prisma.strategy.create({
                data: {
                    tokenSymbol: r.symbol,
                    targetDrop: r.drop,
                    amount: r.amount,
                    status: r.status
                }
            });
            createdStrategies.push(s);
        }

        console.log('📈 Đang nhập kết quả giao dịch (PnL)...');

        // Robot SOL: Lãi đậm
        await prisma.trade.create({
            data: {
                strategyId: createdStrategies[0].id,
                executionPrice: 145.5,
                amountBought: 8.24,
                pnl: 320.50,
                timestamp: new Date(Date.now() - 86400000 * 2)
            }
        });

        // Robot ETH: Lãi khá
        await prisma.trade.create({
            data: {
                strategyId: createdStrategies[1].id,
                executionPrice: 2400.0,
                amountBought: 1.04,
                pnl: 185.00,
                timestamp: new Date(Date.now() - 86400000 * 1)
            }
        });

        // Robot BTC: Cá mập (2 lệnh)
        await prisma.trade.create({
            data: {
                strategyId: createdStrategies[2].id,
                executionPrice: 62000.0,
                amountBought: 0.08,
                pnl: 450.20,
                timestamp: new Date(Date.now() - 86400000 * 4)
            }
        });
        await prisma.trade.create({
            data: {
                strategyId: createdStrategies[2].id,
                executionPrice: 64000.0,
                amountBought: 0.078,
                pnl: 610.80,
                timestamp: new Date(Date.now() - 86400000 * 2)
            }
        });

        // Robot LINK: Đang lỗ nhẹ
        await prisma.trade.create({
            data: {
                strategyId: createdStrategies[3].id,
                executionPrice: 19.5,
                amountBought: 51.2,
                pnl: -45.60,
                timestamp: new Date(Date.now() - 3600000 * 6)
            }
        });

        console.log('✅ Đã xong! Check Leaderboard ngay đi bạn.');

    } catch (error) {
        console.error('❌ Lỗi khi seed dữ liệu:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const strategies = await prisma.strategy.findMany({
            include: {
                trades: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json(strategies);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch strategies' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { tokenSymbol, targetDrop, amount } = body;

        const strategy = await prisma.strategy.create({
            data: {
                tokenSymbol,
                targetDrop: parseFloat(targetDrop),
                amount: parseFloat(amount),
                status: 'active',
            },
        });

        // Create initial log
        await prisma.log.create({
            data: {
                strategyId: strategy.id,
                message: `Agent initialized for ${tokenSymbol} with ${targetDrop}% target drop.`,
                type: 'info',
            },
        });

        return NextResponse.json(strategy);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create strategy' }, { status: 500 });
    }
}

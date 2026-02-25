import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { symbol: string } }
) {
    const symbol = params.symbol;

    try {
        const history = await prisma.priceData.findMany({
            where: { tokenSymbol: symbol.toUpperCase() },
            orderBy: { timestamp: 'asc' },
            take: 100 // Last 100 data points
        });

        return NextResponse.json(history);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

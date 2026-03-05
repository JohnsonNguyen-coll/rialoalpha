import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const logs = await prisma.log.findMany({
            orderBy: {
                timestamp: 'desc',
            },
            take: 50,
        });
        return NextResponse.json(logs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}

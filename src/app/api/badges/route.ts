import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const badgesData = await (prisma as any).badge.findMany({
            orderBy: { earnedAt: 'desc' },
        });

        return NextResponse.json(badgesData || []);
    } catch (error) {
        console.error('Fetch badges error:', error);
        return NextResponse.json([]); // Fail gracefully for UI
    }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Clean old Vietnamese logs from DB quietly to ensure fresh English-only state
        const hasVietnamese = await prisma.log.findMany({
            where: {
                message: {
                    contains: 'bận'
                }
            },
            take: 10
        });

        if (hasVietnamese.length > 0) {
            await prisma.log.deleteMany({
                where: {
                    message: {
                        contains: 'bận'
                    }
                }
            });
        }

        const logs = await prisma.log.findMany({
            orderBy: {
                timestamp: 'desc',
            },
            take: 50,
        });

        // Final filter to ensure no Vietnamese leaked through
        const filteredLogs = logs.filter(l => !/[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ]/.test(l.message.toLowerCase()));

        return NextResponse.json(filteredLogs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}

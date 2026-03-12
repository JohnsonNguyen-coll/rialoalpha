import { prisma } from './prisma';

export const BADGE_TYPES = {
    FIRST_TRADE: 'first_trade',
    TREASURE_HUNTER: 'treasure_hunter',
    DIAMOND_HANDS: 'diamond_hands',
};

export const BADGE_DETAILS: Record<string, { name: string; description: string }> = {
    [BADGE_TYPES.FIRST_TRADE]: {
        name: 'First Mission Accomplished',
        description: 'You deployed your first robot and successfully bought the dip!',
    },
    [BADGE_TYPES.TREASURE_HUNTER]: {
        name: 'Treasure Hunter',
        description: 'Patience is a virtue! You caught a massive dip of 10% or more.',
    },
    [BADGE_TYPES.DIAMOND_HANDS]: {
        name: 'Diamond Hands',
        description: 'You held your position through the storm and came out stronger.',
    },
};

export async function checkAndAwardBadges(strategyId: string) {
    const strategy = await prisma.strategy.findUnique({
        where: { id: strategyId },
        include: { trades: true }
    });

    if (!strategy || strategy.status !== 'completed') return [];

    const earnedBadges = [];

    // 1. First Trade Badge
    const totalFinishedStrategies = await prisma.strategy.count({
        where: { status: 'completed' }
    });

    if (totalFinishedStrategies === 1) {
        const alreadyHas = await (prisma as any).badge.findFirst({
            where: { type: BADGE_TYPES.FIRST_TRADE }
        });
        if (!alreadyHas) {
            const badge = await (prisma as any).badge.create({
                data: {
                    type: BADGE_TYPES.FIRST_TRADE,
                    name: BADGE_DETAILS[BADGE_TYPES.FIRST_TRADE].name,
                    description: BADGE_DETAILS[BADGE_TYPES.FIRST_TRADE].description,
                }
            });
            earnedBadges.push(badge);
        }
    }

    // 2. Treasure Hunter (Target Drop >= 10%)
    if (strategy.targetDrop >= 10) {
        const alreadyHas = await (prisma as any).badge.findFirst({
            where: { type: BADGE_TYPES.TREASURE_HUNTER }
        });
        if (!alreadyHas) {
            const badge = await (prisma as any).badge.create({
                data: {
                    type: BADGE_TYPES.TREASURE_HUNTER,
                    name: BADGE_DETAILS[BADGE_TYPES.TREASURE_HUNTER].name,
                    description: BADGE_DETAILS[BADGE_TYPES.TREASURE_HUNTER].description,
                }
            });
            earnedBadges.push(badge);
        }
    }

    // 3. Diamond Hands (Successfully completed 5 missions)
    const totalCompleted = await prisma.strategy.count({
        where: { status: 'completed' }
    });

    if (totalCompleted >= 5) {
        const alreadyHas = await (prisma as any).badge.findFirst({
            where: { type: BADGE_TYPES.DIAMOND_HANDS }
        });
        if (!alreadyHas) {
            const badge = await (prisma as any).badge.create({
                data: {
                    type: BADGE_TYPES.DIAMOND_HANDS,
                    name: BADGE_DETAILS[BADGE_TYPES.DIAMOND_HANDS].name,
                    description: BADGE_DETAILS[BADGE_TYPES.DIAMOND_HANDS].description,
                }
            });
            earnedBadges.push(badge);
        }
    }

    return earnedBadges;
}

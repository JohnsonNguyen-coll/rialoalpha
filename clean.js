const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
    try {
        const deleted = await prisma.log.deleteMany({
            where: {
                type: 'ai_thought'
            }
        });
        console.log('CLEANED ' + deleted.count + ' LOGS');
    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}
clean();

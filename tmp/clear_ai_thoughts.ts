import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
    const result = await prisma.log.deleteMany({
        where: {
            type: 'ai_thought'
        }
    })
    console.log(`Successfully cleared ${result.count} old AI thoughts to ensure everything is in English.`)
}
main()

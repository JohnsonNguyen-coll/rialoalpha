import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const vietnameseLogs = await prisma.log.findMany({
        where: {
            message: {
                contains: 'đang bận'
            }
        }
    })

    console.log(`Found ${vietnameseLogs.length} Vietnamese logs.`)

    if (vietnameseLogs.length > 0) {
        const deleted = await prisma.log.deleteMany({
            where: {
                message: {
                    contains: 'đang bận'
                }
            }
        })
        console.log(`Deleted ${deleted.count} Vietnamese logs.`)
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

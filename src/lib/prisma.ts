import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const createPrismaClient = () => {
    const url = process.env.TURSO_DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    if (!url || !authToken) {
        throw new Error(`❌ Missing env vars`)
    }

    const adapter = new PrismaLibSql({ url, authToken })
    return new PrismaClient({ adapter })
}

export const prisma = createPrismaClient()
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { createClient } from '@libsql/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const isProduction = process.env.NODE_ENV === 'production'

const getAdapter = () => {
    if (isProduction) {
        // Kết nối tới Turso trong môi trường Production
        const libsql = createClient({
            url: process.env.DATABASE_URL!,
            authToken: process.env.DATABASE_AUTH_TOKEN,
        })
        return new PrismaLibSQL(libsql)
    } else {
        // Sử dụng SQLite local khi phát triển
        const dbUrl = process.env.DATABASE_URL || 'file:./dev.db'
        const dbPath = dbUrl.replace('file:', '')
        return new PrismaBetterSqlite3({ url: dbPath })
    }
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({ adapter: getAdapter() })

if (!isProduction) globalForPrisma.prisma = prisma


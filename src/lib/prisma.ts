import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { createClient } from '@libsql/client'
import path from 'path'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const isProduction = process.env.NODE_ENV === 'production'

const getAdapter = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    // Dùng Turso Cloud nếu ở Production HOẶC nếu không có DATABASE_URL local
    if (process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN && (isProduction || !process.env.DATABASE_URL)) {
        const libsql = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        })
        return new PrismaLibSql(libsql as any)
    }

    // Fallback: SQLite local
    let dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
        throw new Error(
            'No database configured. Set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN, or DATABASE_URL.'
        )
    }

    // Gỡ bỏ dấu ngoặc kép nếu có
    dbUrl = dbUrl.replace(/^["'](.+)["']$/, '$1')

    // Xử lý đúng file path cho better-sqlite3 (sử dụng absolute path)
    const dbPath = dbUrl.startsWith('file:')
        ? path.resolve(dbUrl.replace('file:', ''))
        : path.resolve(dbUrl)

    return new PrismaBetterSqlite3({ url: dbPath })
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({ adapter: getAdapter() })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


console.log('=== PRISMA ENV DEBUG ===')
console.log('TURSO_DATABASE_URL:', JSON.stringify(process.env.TURSO_DATABASE_URL))
console.log('TURSO_AUTH_TOKEN:', JSON.stringify(process.env.TURSO_AUTH_TOKEN))
console.log('========================')
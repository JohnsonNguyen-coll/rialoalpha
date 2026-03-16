import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import dotenv from 'dotenv'
import path from 'path'

const envPath = 'd:/PythonTool/RialoAlpha/.env.local';
dotenv.config({ path: envPath })

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

console.log('Using URL:', url ? 'FOUND' : 'MISSING');

if (!url || !authToken) {
    console.error('Missing env vars');
    process.exit(1);
}

const adapter = new PrismaLibSql(createClient({ url, authToken }))
const prisma = new PrismaClient({ adapter })

async function check() {
    try {
        const count = await prisma.strategy.count();
        console.log(`Current strategy count: ${count}`);
        const all = await prisma.strategy.findMany();
        console.log(`Strategies:`, all.map(s => `${s.tokenSymbol} (${s.status})`));
    } catch (e) {
        console.error("Error checking DB:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();

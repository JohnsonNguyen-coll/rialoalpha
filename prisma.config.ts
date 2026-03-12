import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import path from 'node:path'
import type { PrismaConfig } from 'prisma'

export default {
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL,
  }
} satisfies PrismaConfig
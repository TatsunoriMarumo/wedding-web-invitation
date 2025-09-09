// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// globalThis を型付けして "prisma" を許可
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

// 本番は毎回新規、開発はホットリロード対策で使い回し
export const prisma =
  process.env.NODE_ENV === 'production'
    ? new PrismaClient()
    : (globalForPrisma.prisma ??= new PrismaClient())

export default prisma

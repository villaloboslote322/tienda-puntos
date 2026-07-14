import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const client = await prisma.cliente.findUnique({
  where: { dni: '22222222' }
});

console.log('Client:', client);
console.log('Cumpleaños:', client?.cumpleaños);
await prisma.$disconnect();

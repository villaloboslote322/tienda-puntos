import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcryptjs from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcryptjs.hash('password123', 10);
  
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      nombre: 'Admin Test',
      rol: 'admin',
      activo: true,
    },
  });
  console.log('Admin created:', admin);

  const regla = await prisma.reglaPuntos.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      nombre: 'Regla por defecto',
      descripcion: '1 punto cada $1000',
      montoBase: 1000,
      puntosOtorgados: 1,
      activa: true,
    },
  });
  console.log('Rule created:', regla);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

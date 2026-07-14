import 'dotenv/config';
import prisma from './src/config/database';
import bcryptjs from 'bcryptjs';

async function main() {
  // Clear existing data
  await prisma.usuario.deleteMany();
  await prisma.cliente.deleteMany();

  // Create test admin user
  const hashedPassword = await bcryptjs.hash('password123', 10);
  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@test.com',
      password: hashedPassword,
      nombre: 'Admin Test',
      rol: 'admin',
    },
  });

  console.log('Created admin:', admin);

  // Create test cliente
  const cliente = await prisma.cliente.create({
    data: {
      nombre: 'Juan Perez',
      whatsapp: '+5491234567890',
      dni: '12345678',
      email: 'juan@test.com',
      estado: 'activo',
    },
  });

  console.log('Created cliente:', cliente);

  console.log('Seed complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

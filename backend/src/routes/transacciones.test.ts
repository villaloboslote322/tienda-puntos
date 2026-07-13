import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import prisma from '../config/database';
import bcryptjs from 'bcryptjs';

describe('Transacciones Routes', () => {
  let adminToken: string;
  let clienteId: string;
  let reglaId: string;
  let adminId: string;
  const testEmail = `admin-transacciones-${Date.now()}@test.com`;
  const testWhatsapp = `+549${Date.now().toString().slice(-10)}`;

  beforeAll(async () => {
    // Create admin
    const hashedPassword = await bcryptjs.hash('password123', 10);
    const admin = await prisma.usuario.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        nombre: 'Admin Transacciones Test',
        rol: 'admin',
      },
    });
    adminId = admin.id;

    // Get token by logging in
    const loginResponse = await request(app)
      .post('/api/auth/admin/login')
      .send({
        email: testEmail,
        password: 'password123',
      });

    adminToken = loginResponse.body.token;

    // Create cliente
    const cliente = await prisma.cliente.create({
      data: {
        nombre: 'Cliente Test Transacciones',
        whatsapp: testWhatsapp,
        dni: `dni-${Date.now()}`,
      },
    });
    clienteId = cliente.id;

    // Create active rule
    const regla = await prisma.reglaPuntos.create({
      data: {
        nombre: 'Test Rule Transacciones',
        montoBase: 10000,
        puntosOtorgados: 10,
        activa: true,
      },
    });
    reglaId = regla.id;
  });

  afterAll(async () => {
    await prisma.transaccion.deleteMany({ where: { clienteId } });
    if (clienteId) await prisma.cliente.delete({ where: { id: clienteId } });
    if (reglaId) await prisma.reglaPuntos.delete({ where: { id: reglaId } });
    if (adminId) await prisma.usuario.delete({ where: { id: adminId } });
  });

  it('POST /api/transacciones - assign points successfully', async () => {
    const response = await request(app)
      .post('/api/transacciones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        clienteId,
        montoCompra: 10000,
        descripcion: 'Test purchase',
      });

    expect(response.status).toBe(201);
    expect(response.body.clienteId).toBe(clienteId);
    expect(response.body.puntosAsignados).toBe(10);
    expect(response.body.puntosDespues).toBe(10);
    expect(response.body.tipo).toBe('compra');
  });

  it('POST /api/transacciones - missing clienteId', async () => {
    const response = await request(app)
      .post('/api/transacciones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        montoCompra: 10000,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('clienteId');
  });

  it('POST /api/transacciones - invalid montoCompra', async () => {
    const response = await request(app)
      .post('/api/transacciones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        clienteId,
        montoCompra: 0,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('montoCompra');
  });

  it('POST /api/transacciones - non-existent cliente', async () => {
    const response = await request(app)
      .post('/api/transacciones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        clienteId: 'invalid-cliente-id',
        montoCompra: 10000,
      });

    expect(response.status).toBe(500); // Service throws error
  });

  it('GET /api/transacciones - list all transactions', async () => {
    const response = await request(app)
      .get('/api/transacciones')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /api/transacciones?clienteId={id} - filter by cliente', async () => {
    const response = await request(app)
      .get(`/api/transacciones?clienteId=${clienteId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    if (response.body.length > 0) {
      expect(response.body[0].clienteId).toBe(clienteId);
    }
  });

  it('GET /api/transacciones/:id - get single transaction', async () => {
    // First create a transaction
    const createResponse = await request(app)
      .post('/api/transacciones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        clienteId,
        montoCompra: 5000,
        descripcion: 'Test single get',
      });

    const transaccionId = createResponse.body.id;

    // Then retrieve it
    const response = await request(app)
      .get(`/api/transacciones/${transaccionId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(transaccionId);
    expect(response.body.clienteId).toBe(clienteId);
  });

  it('GET /api/transacciones/:id - non-existent transaction', async () => {
    const response = await request(app)
      .get('/api/transacciones/invalid-id')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.error).toContain('not found');
  });

  it('POST /api/transacciones - requires admin role', async () => {
    // Try without auth header
    const response = await request(app)
      .post('/api/transacciones')
      .send({
        clienteId,
        montoCompra: 10000,
      });

    expect(response.status).toBe(401);
  });

  it('GET /api/transacciones - requires admin role', async () => {
    // Try without auth header
    const response = await request(app)
      .get('/api/transacciones');

    expect(response.status).toBe(401);
  });
});

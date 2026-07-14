import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import prisma from '../config/database';
import bcryptjs from 'bcryptjs';

describe('Clientes Routes', () => {
  let adminToken: string;
  let clienteId: string;
  let adminId: string;
  const testEmail = `admin-${Date.now()}@test.com`;
  const testWhatsapp = `+549${Date.now().toString().slice(-10)}`;

  beforeAll(async () => {
    // Create admin with unique email
    const hashedPassword = await bcryptjs.hash('password123', 10);
    const admin = await prisma.usuario.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        nombre: 'Test Admin',
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
  });

  afterAll(async () => {
    await prisma.transaccion.deleteMany();
    if (clienteId) await prisma.cliente.delete({ where: { id: clienteId } });
    if (adminId) await prisma.usuario.delete({ where: { id: adminId } });
  });

  it('POST /api/clientes - create cliente', async () => {
    const response = await request(app)
      .post('/api/clientes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Test Cliente',
        whatsapp: testWhatsapp,
        dni: `dni-${Date.now()}`,
      });

    expect(response.status).toBe(201);
    expect(response.body.nombre).toBe('Test Cliente');
    clienteId = response.body.id;
  });

  it('GET /api/clientes/{id} - get cliente', async () => {
    const response = await request(app)
      .get(`/api/clientes/${clienteId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(clienteId);
  });

  it('GET /api/clientes - search clientes', async () => {
    const response = await request(app)
      .get('/api/clientes?search=Test')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('PUT /api/clientes/{id} - update cliente', async () => {
    const response = await request(app)
      .put(`/api/clientes/${clienteId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Updated Name' });

    expect(response.status).toBe(200);
    expect(response.body.nombre).toBe('Updated Name');
  });

  it('GET /api/clientes/{id}/historial - get history', async () => {
    const response = await request(app)
      .get(`/api/clientes/${clienteId}/historial`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import prisma from '../config/database';
import { signToken } from '../config/jwt';
import bcryptjs from 'bcryptjs';

describe('Reglas Routes', () => {
  let adminToken: string;
  let reglaId: string;
  let reglaId2: string;
  let adminId: string;

  beforeAll(async () => {
    const hashedPassword = await bcryptjs.hash('password123', 10);
    const admin = await prisma.usuario.create({
      data: {
        email: 'admin@reglas.test',
        password: hashedPassword,
        nombre: 'Admin Test',
        rol: 'admin',
      },
    });
    adminId = admin.id;
    adminToken = signToken({
      userId: admin.id,
      email: admin.email,
      rol: 'admin',
    });
  });

  afterAll(async () => {
    if (reglaId) {
      try {
        await prisma.reglaPuntos.delete({ where: { id: reglaId } });
      } catch (e) {
        // Already deleted or doesn't exist
      }
    }
    if (reglaId2) {
      try {
        await prisma.reglaPuntos.delete({ where: { id: reglaId2 } });
      } catch (e) {
        // Already deleted or doesn't exist
      }
    }
    try {
      await prisma.usuario.delete({ where: { id: adminId } });
    } catch (e) {
      // Already deleted
    }
    await prisma.$disconnect();
  });

  it('POST /api/admin/reglas - create rule', async () => {
    const response = await request(app)
      .post('/api/admin/reglas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Test Rule',
        descripcion: 'A test rule for points',
        montoBase: 10000,
        puntosOtorgados: 10,
      });

    expect(response.status).toBe(201);
    expect(response.body.nombre).toBe('Test Rule');
    expect(response.body.descripcion).toBe('A test rule for points');
    expect(response.body.montoBase).toBe(10000);
    expect(response.body.puntosOtorgados).toBe(10);
    expect(response.body.activa).toBe(false);
    expect(response.body.id).toBeDefined();
    reglaId = response.body.id;
  });

  it('POST /api/admin/reglas - create second rule', async () => {
    const response = await request(app)
      .post('/api/admin/reglas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Test Rule 2',
        montoBase: 5000,
        puntosOtorgados: 5,
      });

    expect(response.status).toBe(201);
    expect(response.body.nombre).toBe('Test Rule 2');
    expect(response.body.activa).toBe(false);
    reglaId2 = response.body.id;
  });

  it('GET /api/admin/reglas - list rules', async () => {
    const response = await request(app)
      .get('/api/admin/reglas')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/admin/reglas/:id - get single rule', async () => {
    const response = await request(app)
      .get(`/api/admin/reglas/${reglaId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(reglaId);
    expect(response.body.nombre).toBe('Test Rule');
  });

  it('PUT /api/admin/reglas/:id - update rule', async () => {
    const response = await request(app)
      .put(`/api/admin/reglas/${reglaId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'Updated Test Rule',
        puntosOtorgados: 15,
      });

    expect(response.status).toBe(200);
    expect(response.body.nombre).toBe('Updated Test Rule');
    expect(response.body.puntosOtorgados).toBe(15);
    expect(response.body.montoBase).toBe(10000);
  });

  it('POST /api/admin/reglas/:id/activar - activate rule', async () => {
    const response = await request(app)
      .post(`/api/admin/reglas/${reglaId}/activar`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(reglaId);
    expect(response.body.activa).toBe(true);
  });

  it('GET /api/admin/reglas/activa/actual - get active rule', async () => {
    const response = await request(app)
      .get('/api/admin/reglas/activa/actual')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(reglaId);
    expect(response.body.activa).toBe(true);
  });

  it('POST /api/admin/reglas/:id/activar - deactivates other rules', async () => {
    // Activate second rule
    const response = await request(app)
      .post(`/api/admin/reglas/${reglaId2}/activar`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(reglaId2);
    expect(response.body.activa).toBe(true);

    // Check first rule is now inactive
    const firstRuleCheck = await request(app)
      .get(`/api/admin/reglas/${reglaId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(firstRuleCheck.status).toBe(200);
    expect(firstRuleCheck.body.activa).toBe(false);
  });

  it('DELETE /api/admin/reglas/:id - deactivate rule', async () => {
    const response = await request(app)
      .delete(`/api/admin/reglas/${reglaId2}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(reglaId2);
    expect(response.body.activa).toBe(false);
  });

  it('POST /api/admin/reglas - rejects invalid data', async () => {
    const response = await request(app)
      .post('/api/admin/reglas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre: 'A', // Too short
        montoBase: -5000, // Negative
        puntosOtorgados: 5,
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation error');
  });

  it('POST /api/admin/reglas - requires auth', async () => {
    const response = await request(app)
      .post('/api/admin/reglas')
      .send({
        nombre: 'Test Rule',
        montoBase: 10000,
        puntosOtorgados: 10,
      });

    expect(response.status).toBe(401);
  });
});

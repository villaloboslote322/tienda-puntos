import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import prisma from '../config/database';
import { signToken } from '../config/jwt';
import bcryptjs from 'bcryptjs';
// Re-export for use within describe blocks
export { signToken };

describe('Premios and Canjes Routes', () => {
  let adminToken: string;
  let clienteToken: string;
  let adminId: string;
  let clienteId: string;
  let premioId: string;
  let premioId2: string;
  let canjeId: string;

  beforeAll(async () => {
    // Create admin user
    const hashedPassword = await bcryptjs.hash('password123', 10);
    const admin = await prisma.usuario.create({
      data: {
        email: 'admin@canjes.test',
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

    // Create cliente user
    const cliente = await prisma.cliente.create({
      data: {
        nombre: 'Test Cliente',
        whatsapp: '+5491234567890',
        dni: '12345678',
        puntosActuales: 100,
        estado: 'activo',
      },
    });
    clienteId = cliente.id;
    clienteToken = signToken({
      userId: cliente.id,
      email: 'cliente@test.com',
      rol: 'cliente',
    });
  });

  afterAll(async () => {
    // Clean up canjes
    if (canjeId) {
      try {
        await prisma.canje.delete({ where: { id: canjeId } });
      } catch (e) {
        // Already deleted or doesn't exist
      }
    }

    // Clean up premios
    if (premioId) {
      try {
        await prisma.premio.delete({ where: { id: premioId } });
      } catch (e) {
        // Already deleted or doesn't exist
      }
    }

    if (premioId2) {
      try {
        await prisma.premio.delete({ where: { id: premioId2 } });
      } catch (e) {
        // Already deleted or doesn't exist
      }
    }

    // Clean up users
    try {
      await prisma.usuario.delete({ where: { id: adminId } });
    } catch (e) {
      // Already deleted
    }

    try {
      await prisma.cliente.delete({ where: { id: clienteId } });
    } catch (e) {
      // Already deleted
    }

    // Clean up any transacciones created during tests
    try {
      await prisma.transaccion.deleteMany({
        where: {
          clienteId: clienteId,
        },
      });
    } catch (e) {
      // No transacciones to delete
    }

    await prisma.$disconnect();
  });

  // ==================== PREMIOS TESTS ====================

  describe('Premios CRUD', () => {
    it('POST /api/premios - create prize (admin only)', async () => {
      const response = await request(app)
        .post('/api/premios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Test Prize',
          descripcion: 'A test prize for testing',
          puntosRequeridos: 50,
          valor: 100,
          cantidad: 10,
        });

      expect(response.status).toBe(201);
      expect(response.body.nombre).toBe('Test Prize');
      expect(response.body.descripcion).toBe('A test prize for testing');
      expect(response.body.puntosRequeridos).toBe(50);
      expect(response.body.valor).toBe(100);
      expect(response.body.cantidad).toBe(10);
      expect(response.body.activo).toBe(true);
      expect(response.body.id).toBeDefined();
      premioId = response.body.id;
    });

    it('POST /api/premios - create second prize', async () => {
      const response = await request(app)
        .post('/api/premios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Premium Prize',
          puntosRequeridos: 150,
          valor: 300,
        });

      expect(response.status).toBe(201);
      expect(response.body.nombre).toBe('Premium Prize');
      expect(response.body.activo).toBe(true);
      premioId2 = response.body.id;
    });

    it('POST /api/premios - unauthorized without admin role', async () => {
      const response = await request(app)
        .post('/api/premios')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          nombre: 'Unauthorized Prize',
          puntosRequeridos: 50,
          valor: 100,
        });

      expect(response.status).toBe(403);
    });

    it('POST /api/premios - fails without auth token', async () => {
      const response = await request(app)
        .post('/api/premios')
        .send({
          nombre: 'No Auth Prize',
          puntosRequeridos: 50,
          valor: 100,
        });

      expect(response.status).toBe(401);
    });

    it('GET /api/premios - list active prizes (public)', async () => {
      const response = await request(app).get('/api/premios');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      expect(response.body.some((p: any) => p.id === premioId)).toBe(true);
    });

    it('GET /api/premios/:id - get single prize', async () => {
      const response = await request(app).get(`/api/premios/${premioId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(premioId);
      expect(response.body.nombre).toBe('Test Prize');
    });

    it('GET /api/premios/:id - returns 404 for non-existent prize', async () => {
      const response = await request(app).get('/api/premios/non-existent-id');

      expect(response.status).toBe(404);
    });

    it('PUT /api/premios/:id - update prize (admin only)', async () => {
      const response = await request(app)
        .put(`/api/premios/${premioId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Updated Prize',
          puntosRequeridos: 75,
          valor: 150,
        });

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Updated Prize');
      expect(response.body.puntosRequeridos).toBe(75);
      expect(response.body.valor).toBe(150);
      expect(response.body.activo).toBe(true);
    });

    it('DELETE /api/premios/:id - deactivate prize (admin only)', async () => {
      const response = await request(app)
        .delete(`/api/premios/${premioId2}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(premioId2);
      expect(response.body.activo).toBe(false);
    });

    it('GET /api/premios - deactivated prize not in list', async () => {
      const response = await request(app).get('/api/premios');

      expect(response.status).toBe(200);
      const deactivated = response.body.find((p: any) => p.id === premioId2);
      expect(deactivated).toBeUndefined();
    });
  });

  // ==================== CANJES TESTS ====================

  describe('Canjes Redemption', () => {
    it('POST /api/clientes/canjes - request redemption with sufficient points', async () => {
      const response = await request(app)
        .post('/api/clientes/canjes')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          premioId: premioId,
        });

      expect(response.status).toBe(201);
      expect(response.body.clienteId).toBe(clienteId);
      expect(response.body.premioId).toBe(premioId);
      expect(response.body.estado).toBe('pendiente');
      expect(response.body.id).toBeDefined();
      canjeId = response.body.id;
    });

    it('POST /api/clientes/canjes - points are deducted on canje', async () => {
      // Get cliente to check updated points
      const clienteResponse = await request(app)
        .get(`/api/clientes/${clienteId}`)
        .set('Authorization', `Bearer ${clienteToken}`);

      // Should have 100 - 75 = 25 points remaining
      expect(clienteResponse.body.puntosActuales).toBe(25);
    });

    it('GET /api/clientes/canjes - list my redemptions', async () => {
      const response = await request(app)
        .get('/api/clientes/canjes')
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body.some((c: any) => c.id === canjeId)).toBe(true);
    });

    it('POST /api/clientes/canjes - fails with insufficient points', async () => {
      const response = await request(app)
        .post('/api/clientes/canjes')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({
          premioId: premioId2, // Requires 150 points but cliente only has 25
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Insufficient points');
    });

    it('GET /api/admin/canjes - admin view pending', async () => {
      const response = await request(app)
        .get('/api/admin/canjes/admin/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((c: any) => c.id === canjeId)).toBe(true);
    });

    it('POST /api/admin/canjes/:id/completar - admin completes canje', async () => {
      const response = await request(app)
        .post(`/api/admin/canjes/${canjeId}/completar`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(canjeId);
      expect(response.body.estado).toBe('completado');
    });

    it('POST /api/admin/canjes/:id/completar - completed canje not in pending', async () => {
      const response = await request(app)
        .get('/api/admin/canjes/admin/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.some((c: any) => c.id === canjeId)).toBe(false);
    });

    it('DELETE /api/admin/canjes/:id - admin cancels canje and refunds points', async () => {
      // Create a new cliente with enough points for this test
      const newCliente = await prisma.cliente.create({
        data: {
          nombre: 'Cancel Test Cliente',
          whatsapp: '+5491234567892',
          dni: '12345679',
          puntosActuales: 100,
          estado: 'activo',
        },
      });

      const newClienteToken = signToken({
        userId: newCliente.id,
        email: 'cancel@test.com',
        rol: 'cliente',
      });

      // Create another canje first
      const createResponse = await request(app)
        .post('/api/clientes/canjes')
        .set('Authorization', `Bearer ${newClienteToken}`)
        .send({
          premioId: premioId,
        });

      const newCanjeId = createResponse.body.id;

      // Get points before cancellation (should be 100 - 75 = 25)
      const beforeCancellation = await request(app)
        .get(`/api/clientes/${newCliente.id}`)
        .set('Authorization', `Bearer ${newClienteToken}`);
      const pointsBefore = beforeCancellation.body.puntosActuales;

      // Cancel the canje
      const cancelResponse = await request(app)
        .delete(`/api/admin/canjes/${newCanjeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(cancelResponse.status).toBe(200);
      expect(cancelResponse.body.id).toBe(newCanjeId);
      expect(cancelResponse.body.estado).toBe('cancelado');

      // Check points were refunded
      const afterCancellation = await request(app)
        .get(`/api/clientes/${newCliente.id}`)
        .set('Authorization', `Bearer ${newClienteToken}`);
      expect(afterCancellation.body.puntosActuales).toBe(pointsBefore + 75);

      // Cleanup
      try {
        await prisma.canje.delete({ where: { id: newCanjeId } });
        await prisma.transaccion.deleteMany({
          where: { clienteId: newCliente.id },
        });
        await prisma.cliente.delete({ where: { id: newCliente.id } });
      } catch (e) {
        // Cleanup errors ignored
      }
    });

    it('POST /api/clientes/canjes - fails without auth token', async () => {
      const response = await request(app)
        .post('/api/clientes/canjes')
        .send({
          premioId: premioId,
        });

      expect(response.status).toBe(401);
    });

    it('POST /api/admin/canjes/:id/completar - admin only', async () => {
      // Try to complete as non-admin
      const response = await request(app)
        .post(`/api/admin/canjes/${canjeId}/completar`)
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(response.status).toBe(403);
    });
  });

  // ==================== INTEGRATION TESTS ====================

  describe('Full Flow Integration', () => {
    it('Complete flow: create prize -> cliente requests canje -> admin completes', async () => {
      // Create a new cliente with enough points
      const newCliente = await prisma.cliente.create({
        data: {
          nombre: 'Integration Test Cliente',
          whatsapp: '+5491234567891',
          dni: '87654321',
          puntosActuales: 200,
          estado: 'activo',
        },
      });

      const newClienteToken = signToken({
        userId: newCliente.id,
        email: 'integration@test.com',
        rol: 'cliente',
      });

      // Create a new prize
      const premioResponse = await request(app)
        .post('/api/premios')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nombre: 'Integration Prize',
          puntosRequeridos: 100,
          valor: 200,
        });

      const newPremioId = premioResponse.body.id;

      // Cliente requests canje
      const canjeResponse = await request(app)
        .post('/api/clientes/canjes')
        .set('Authorization', `Bearer ${newClienteToken}`)
        .send({
          premioId: newPremioId,
        });

      expect(canjeResponse.status).toBe(201);
      const newCanjeId = canjeResponse.body.id;

      // Verify points deducted
      const clienteCheck1 = await request(app)
        .get(`/api/clientes/${newCliente.id}`)
        .set('Authorization', `Bearer ${newClienteToken}`);
      expect(clienteCheck1.body.puntosActuales).toBe(100);

      // Admin completes canje
      const completeResponse = await request(app)
        .post(`/api/admin/canjes/${newCanjeId}/completar`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(completeResponse.status).toBe(200);
      expect(completeResponse.body.estado).toBe('completado');

      // Cleanup
      try {
        await prisma.canje.delete({ where: { id: newCanjeId } });
        await prisma.premio.delete({ where: { id: newPremioId } });
        await prisma.transaccion.deleteMany({
          where: { clienteId: newCliente.id },
        });
        await prisma.cliente.delete({ where: { id: newCliente.id } });
      } catch (e) {
        // Cleanup errors ignored
      }
    });
  });
});

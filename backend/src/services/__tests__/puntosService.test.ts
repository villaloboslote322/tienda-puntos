import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { puntosService } from '../puntosService';
import { clienteService } from '../clienteService';
import prisma from '../../config/database';

describe('PuntosService', () => {
  let clienteId: string;
  let reglaId: string;

  beforeAll(async () => {
    // Create test cliente
    const cliente = await clienteService.registroCliente({
      nombre: 'Test User',
      whatsapp: '+1234567890',
      dni: '12345678',
    });
    clienteId = cliente.id;

    // Create test regla
    const regla = await prisma.reglaPuntos.create({
      data: {
        nombre: 'Test Rule',
        montoBase: 10000,
        puntosOtorgados: 10,
        activa: true,
      },
    });
    reglaId = regla.id;
  });

  afterAll(async () => {
    await prisma.transaccion.deleteMany({ where: { clienteId } });
    await prisma.cliente.delete({ where: { id: clienteId } });
    await prisma.reglaPuntos.delete({ where: { id: reglaId } });
  });

  it('calcularPuntos - basic calculation', () => {
    const regla = { montoBase: 10000, puntosOtorgados: 10 };
    const puntos = puntosService.calcularPuntos(10000, regla);
    expect(puntos).toBe(10);
  });

  it('calcularPuntos - fractional points', () => {
    const regla = { montoBase: 10000, puntosOtorgados: 10 };
    const puntos = puntosService.calcularPuntos(5000, regla);
    expect(puntos).toBe(5);
  });

  it('asignarPuntos - success', async () => {
    const transaccion = await puntosService.asignarPuntos(
      clienteId,
      10000,
      'Test purchase'
    );
    expect(transaccion.puntosAsignados).toBe(10);
    expect(transaccion.puntosAntes).toBe(0);
    expect(transaccion.puntosDespues).toBe(10);
  });

  it('obtenerHistorialPuntos', async () => {
    await puntosService.asignarPuntos(clienteId, 10000);
    const historial = await puntosService.obtenerHistorialPuntos(clienteId);
    expect(historial.length).toBeGreaterThan(0);
  });
});

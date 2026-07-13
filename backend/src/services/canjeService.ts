import prisma from '../config/database';
import { clienteService } from './clienteService';
import { premioService } from './premioService';
import logger from '../utils/logger';

export class CanjeService {
  async solicitarCanje(clienteId: string, premioId: string) {
    try {
      // Get cliente and verify points
      const cliente = await clienteService.buscarCliente(clienteId);
      if (!cliente) {
        throw new Error('Cliente not found');
      }

      // Get premio
      const premio = await premioService.obtenerPremio(premioId);
      if (!premio) {
        throw new Error('Prize not found');
      }

      // Verify cliente has enough points
      if (cliente.puntosActuales < premio.puntosRequeridos) {
        throw new Error('Insufficient points');
      }

      // Create canje
      const canje = await prisma.canje.create({
        data: {
          clienteId,
          premioId,
          estado: 'pendiente',
        },
      });

      // Deduct points via transaction
      const transaccion = await prisma.transaccion.create({
        data: {
          clienteId,
          tipo: 'canje',
          puntosAsignados: -premio.puntosRequeridos,
          puntosAntes: cliente.puntosActuales,
          puntosDespues: cliente.puntosActuales - premio.puntosRequeridos,
          descripcion: `Canje: ${premio.nombre}`,
        },
      });

      // Update cliente points
      await clienteService.actualizarPuntos(clienteId, transaccion.puntosDespues);

      logger.info(`Canje requested: ${canje.id}, cliente: ${clienteId}, premio: ${premioId}`);
      return canje;
    } catch (error) {
      logger.error(`Error requesting canje: ${error}`);
      throw error;
    }
  }

  async completarCanje(canjeId: string) {
    const canje = await prisma.canje.update({
      where: { id: canjeId },
      data: { estado: 'completado' },
    });
    logger.info(`Canje completed: ${canjeId}`);
    return canje;
  }

  async cancelarCanje(canjeId: string) {
    const canje = await prisma.canje.findUnique({ where: { id: canjeId } });
    if (!canje) throw new Error('Canje not found');

    // Get premio to refund points
    const premio = await premioService.obtenerPremio(canje.premioId);
    if (premio) {
      const cliente = await clienteService.buscarCliente(canje.clienteId);
      if (cliente) {
        // Create refund transaction
        await prisma.transaccion.create({
          data: {
            clienteId: canje.clienteId,
            tipo: 'ajuste',
            puntosAsignados: premio.puntosRequeridos,
            puntosAntes: cliente.puntosActuales,
            puntosDespues: cliente.puntosActuales + premio.puntosRequeridos,
            descripcion: `Refund: ${premio.nombre}`,
          },
        });

        // Restore points
        await clienteService.actualizarPuntos(
          canje.clienteId,
          cliente.puntosActuales + premio.puntosRequeridos
        );
      }
    }

    // Mark canje as cancelled
    const result = await prisma.canje.update({
      where: { id: canjeId },
      data: { estado: 'cancelado' },
    });

    logger.info(`Canje cancelled: ${canjeId}`);
    return result;
  }

  async listarPendientes() {
    return await prisma.canje.findMany({
      where: { estado: 'pendiente' },
      include: { cliente: true, premio: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async listarClienteCanjes(clienteId: string) {
    return await prisma.canje.findMany({
      where: { clienteId },
      include: { premio: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const canjeService = new CanjeService();

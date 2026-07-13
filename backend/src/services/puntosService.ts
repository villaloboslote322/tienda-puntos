import prisma from '../config/database';
import { clienteService } from './clienteService';
import logger from '../utils/logger';

export class PuntosService {
  async obtenerReglaActiva() {
    const regla = await prisma.reglaPuntos.findFirst({
      where: { activa: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!regla) {
      throw new Error('No active points rule found');
    }
    return regla;
  }

  calcularPuntos(monto: number, regla: any): number {
    // Formula: (monto / montoBase) * puntosOtorgados
    const puntos = Math.floor((monto / regla.montoBase) * regla.puntosOtorgados);
    return Math.max(puntos, 0);
  }

  async asignarPuntos(
    clienteId: string,
    monto: number,
    descripcion = ''
  ): Promise<any> {
    try {
      // Get cliente
      const cliente = await clienteService.buscarCliente(clienteId);
      if (!cliente) {
        throw new Error(`Cliente ${clienteId} not found`);
      }

      // Get active rule
      const regla = await this.obtenerReglaActiva();

      // Calculate points
      const puntosAsignados = this.calcularPuntos(monto, regla);
      const puntosAntes = cliente.puntosActuales;
      const puntosDespues = puntosAntes + puntosAsignados;

      // Create transaction
      const transaccion = await prisma.transaccion.create({
        data: {
          clienteId,
          tipo: 'compra',
          monto,
          puntosAsignados,
          puntosAntes,
          puntosDespues,
          descripcion,
        },
      });

      // Update cliente points
      await clienteService.actualizarPuntos(clienteId, puntosDespues);

      logger.info(
        `Points assigned to cliente ${clienteId}: +${puntosAsignados}`
      );
      return transaccion;
    } catch (error) {
      logger.error(`Error assigning points: ${error}`);
      throw error;
    }
  }

  async obtenerHistorialPuntos(clienteId: string) {
    return await prisma.transaccion.findMany({
      where: { clienteId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async obtenerTotalPuntosAsignados(clienteId: string): Promise<number> {
    const result = await prisma.transaccion.aggregate({
      where: {
        clienteId,
        tipo: { in: ['compra', 'bonus'] },
      },
      _sum: {
        puntosAsignados: true,
      },
    });
    return result._sum.puntosAsignados || 0;
  }
}

export const puntosService = new PuntosService();

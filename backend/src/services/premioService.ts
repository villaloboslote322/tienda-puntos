import prisma from '../config/database';
import { Premio } from '../models/types';
import logger from '../utils/logger';

export class PremioService {
  async crearPremio(datos: {
    nombre: string;
    descripcion?: string;
    puntosRequeridos: number;
    valor: number;
    cantidad?: number;
  }): Promise<Premio> {
    const premio = await prisma.premio.create({
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        puntosRequeridos: datos.puntosRequeridos,
        valor: datos.valor,
        cantidad: datos.cantidad,
        activo: true,
      },
    });
    logger.info(`Prize created: ${premio.id}`);
    return premio as Premio;
  }

  async actualizarPremio(
    id: string,
    datos: Partial<{
      nombre: string;
      descripcion: string;
      puntosRequeridos: number;
      valor: number;
      cantidad: number;
    }>
  ): Promise<Premio> {
    const premio = await prisma.premio.update({
      where: { id },
      data: datos,
    });
    logger.info(`Prize updated: ${id}`);
    return premio as Premio;
  }

  async listarActivos(): Promise<Premio[]> {
    const premios = await prisma.premio.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'desc' },
    });
    return premios as Premio[];
  }

  async obtenerPremio(id: string): Promise<Premio | null> {
    const premio = await prisma.premio.findUnique({
      where: { id },
    });
    return premio as Premio | null;
  }

  async desactivarPremio(id: string): Promise<Premio> {
    const premio = await prisma.premio.update({
      where: { id },
      data: { activo: false },
    });
    logger.info(`Prize deactivated: ${id}`);
    return premio as Premio;
  }

  async listarTodos(): Promise<Premio[]> {
    const premios = await prisma.premio.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return premios as Premio[];
  }
}

export const premioService = new PremioService();

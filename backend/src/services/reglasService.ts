import prisma from '../config/database';
import { ReglaPuntos } from '../models/types';
import logger from '../utils/logger';

export class ReglasService {
  async crearRegla(datos: {
    nombre: string;
    descripcion?: string;
    montoBase: number;
    puntosOtorgados: number;
  }): Promise<ReglaPuntos> {
    const regla = await prisma.reglaPuntos.create({
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        montoBase: datos.montoBase,
        puntosOtorgados: datos.puntosOtorgados,
        activa: false,
      },
    });
    logger.info(`Rule created: ${regla.id}`);
    return regla as ReglaPuntos;
  }

  async actualizarRegla(
    id: string,
    datos: Partial<{
      nombre: string;
      descripcion: string;
      montoBase: number;
      puntosOtorgados: number;
    }>
  ): Promise<ReglaPuntos> {
    const regla = await prisma.reglaPuntos.update({
      where: { id },
      data: datos,
    });
    logger.info(`Rule updated: ${id}`);
    return regla as ReglaPuntos;
  }

  async activarRegla(id: string): Promise<ReglaPuntos> {
    // First deactivate all other rules
    await prisma.reglaPuntos.updateMany({
      where: { activa: true },
      data: { activa: false },
    });

    // Then activate the requested rule
    const regla = await prisma.reglaPuntos.update({
      where: { id },
      data: { activa: true },
    });

    logger.info(`Rule activated: ${id}`);
    return regla as ReglaPuntos;
  }

  async desactivarRegla(id: string): Promise<ReglaPuntos> {
    const regla = await prisma.reglaPuntos.update({
      where: { id },
      data: { activa: false },
    });
    logger.info(`Rule deactivated: ${id}`);
    return regla as ReglaPuntos;
  }

  async obtenerActiva(): Promise<ReglaPuntos | null> {
    const regla = await prisma.reglaPuntos.findFirst({
      where: { activa: true },
      orderBy: { createdAt: 'desc' },
    });
    return regla as ReglaPuntos | null;
  }

  async obtenerRegla(id: string): Promise<ReglaPuntos | null> {
    const regla = await prisma.reglaPuntos.findUnique({
      where: { id },
    });
    return regla as ReglaPuntos | null;
  }

  async listarReglas(): Promise<ReglaPuntos[]> {
    const reglas = await prisma.reglaPuntos.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return reglas as ReglaPuntos[];
  }
}

export const reglasService = new ReglasService();

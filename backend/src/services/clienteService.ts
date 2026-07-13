import prisma from '../config/database';
import { Cliente } from '../models/types';
import logger from '../utils/logger';

export class ClienteService {
  async registroCliente(datos: {
    nombre: string;
    whatsapp: string;
    dni: string;
    email?: string;
    cumpleaños?: Date;
  }): Promise<Cliente> {
    const cliente = await prisma.cliente.create({
      data: {
        nombre: datos.nombre,
        whatsapp: datos.whatsapp,
        dni: datos.dni,
        email: datos.email,
        cumpleaños: datos.cumpleaños,
        puntosActuales: 0,
        estado: 'activo',
      },
    });
    logger.info(`Cliente registered: ${cliente.id}`);
    return cliente as Cliente;
  }

  async buscarCliente(id: string): Promise<Cliente | null> {
    const result = await prisma.cliente.findUnique({
      where: { id },
    });
    return result as Cliente | null;
  }

  async buscarClientePorWhatsapp(whatsapp: string): Promise<Cliente | null> {
    const result = await prisma.cliente.findUnique({
      where: { whatsapp },
    });
    return result as Cliente | null;
  }

  async buscarClientePorDni(dni: string): Promise<Cliente | null> {
    const result = await prisma.cliente.findUnique({
      where: { dni },
    });
    return result as Cliente | null;
  }

  async actualizarCliente(
    id: string,
    datos: Partial<{
      nombre: string;
      email: string;
      cumpleaños: Date;
      estado: string;
    }>
  ): Promise<Cliente> {
    const cliente = await prisma.cliente.update({
      where: { id },
      data: datos,
    });
    logger.info(`Cliente updated: ${id}`);
    return cliente as Cliente;
  }

  async listarClientes(limit = 100, offset = 0): Promise<Cliente[]> {
    const result = await prisma.cliente.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
    return result as Cliente[];
  }

  async buscarClientesPorNombre(nombre: string): Promise<Cliente[]> {
    const result = await prisma.cliente.findMany({
      where: {
        nombre: {
          contains: nombre,
        },
      },
    });
    return result as Cliente[];
  }

  async actualizarPuntos(
    clienteId: string,
    nuevoPuntos: number
  ): Promise<Cliente> {
    const result = await prisma.cliente.update({
      where: { id: clienteId },
      data: { puntosActuales: nuevoPuntos },
    });
    return result as Cliente;
  }
}

export const clienteService = new ClienteService();

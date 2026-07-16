import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger';

export class UsuariosService {
  async crearAdmin(datos: {
    email: string;
    nombre: string;
    password: string;
  }) {
    // Verificar si el usuario ya existe
    const existente = await prisma.usuario.findUnique({
      where: { email: datos.email },
    });

    if (existente) {
      throw new Error(`Usuario con email ${datos.email} ya existe`);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(datos.password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        email: datos.email,
        nombre: datos.nombre,
        password: hashedPassword,
        rol: 'admin',
        activo: true,
      },
    });

    logger.info(`New admin user created: ${usuario.email}`);
    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rol: usuario.rol,
      activo: usuario.activo,
      createdAt: usuario.createdAt,
    };
  }

  async actualizarPerfil(
    usuarioId: string,
    datos: {
      nombre?: string;
      passwordActual?: string;
      passwordNueva?: string;
    }
  ) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Si cambio de contraseña, validar la actual
    if (datos.passwordNueva) {
      if (!datos.passwordActual) {
        throw new Error('Debes proporcionar la contraseña actual');
      }

      const validPassword = await bcrypt.compare(
        datos.passwordActual,
        usuario.password
      );

      if (!validPassword) {
        throw new Error('Contraseña actual incorrecta');
      }
    }

    const updateData: any = {};
    if (datos.nombre) updateData.nombre = datos.nombre;
    if (datos.passwordNueva) {
      updateData.password = await bcrypt.hash(datos.passwordNueva, 10);
    }

    const actualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: updateData,
    });

    logger.info(`User profile updated: ${actualizado.email}`);
    return {
      id: actualizado.id,
      email: actualizado.email,
      nombre: actualizado.nombre,
      rol: actualizado.rol,
      activo: actualizado.activo,
    };
  }

  async listarUsuarios() {
    const usuarios = await prisma.usuario.findMany({
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return usuarios;
  }

  async desactivarUsuario(usuarioId: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // No permitir desactivar al último admin
    const adminCount = await prisma.usuario.count({
      where: { rol: 'admin', activo: true },
    });

    if (adminCount === 1 && usuario.rol === 'admin') {
      throw new Error('No puedes desactivar el último administrador');
    }

    const desactivado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { activo: false },
    });

    logger.info(`User deactivated: ${desactivado.email}`);
    return {
      id: desactivado.id,
      email: desactivado.email,
      nombre: desactivado.nombre,
      activo: desactivado.activo,
    };
  }

  async activarUsuario(usuarioId: string) {
    const usuario = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { activo: true },
    });

    logger.info(`User activated: ${usuario.email}`);
    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      activo: usuario.activo,
    };
  }

  async cambiarPasswordAdmin(usuarioId: string, passwordNueva: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const hashedPassword = await bcrypt.hash(passwordNueva, 10);

    const actualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: { password: hashedPassword },
    });

    logger.info(`Password changed for user: ${actualizado.email}`);
    return {
      id: actualizado.id,
      email: actualizado.email,
      nombre: actualizado.nombre,
      activo: actualizado.activo,
    };
  }
}

export const usuariosService = new UsuariosService();

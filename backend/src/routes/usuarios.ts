import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { usuariosService } from '../services/usuariosService';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const router = Router();

const crearAdminSchema = z.object({
  email: z.string().email(),
  nombre: z.string().min(2),
  password: z.string().min(6),
});

const actualizarPerfilSchema = z.object({
  nombre: z.string().min(2).optional(),
  passwordActual: z.string().optional(),
  passwordNueva: z.string().min(6).optional(),
});

// POST /api/usuarios/crear-admin - create new admin (admin only)
router.post(
  '/crear-admin',
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const datos = crearAdminSchema.parse(req.body);
      const usuario = await usuariosService.crearAdmin(datos);
      res.status(201).json(usuario);
    } catch (error: any) {
      next(new AppError(400, error.message));
    }
  }
);

// GET /api/usuarios/listar - list all users (admin only)
router.get(
  '/listar',
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const usuarios = await usuariosService.listarUsuarios();
      res.json(usuarios);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/usuarios/perfil - update current user profile
router.put(
  '/perfil',
  authMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const datos = actualizarPerfilSchema.parse(req.body);
      const usuarioId = (req as any).usuarioId;
      const usuario = await usuariosService.actualizarPerfil(usuarioId, datos);
      res.json(usuario);
    } catch (error: any) {
      next(new AppError(400, error.message));
    }
  }
);

// PUT /api/usuarios/:id/desactivar - deactivate user (admin only)
router.put(
  '/:id/desactivar',
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const usuario = await usuariosService.desactivarUsuario(id);
      res.json(usuario);
    } catch (error: any) {
      next(new AppError(400, error.message));
    }
  }
);

// PUT /api/usuarios/:id/activar - activate user (admin only)
router.put(
  '/:id/activar',
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const usuario = await usuariosService.activarUsuario(id);
      res.json(usuario);
    } catch (error: any) {
      next(new AppError(400, error.message));
    }
  }
);

export default router;

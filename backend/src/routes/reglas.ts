import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { reglasService } from '../services/reglasService';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const router = Router();

const reglaSchema = z.object({
  nombre: z.string().min(2),
  descripcion: z.string().optional(),
  montoBase: z.number().positive(),
  puntosOtorgados: z.number().positive(),
});

// POST /api/admin/reglas - create rule
router.post(
  '/',
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const datos = reglaSchema.parse(req.body);
      const regla = await reglasService.crearRegla(datos);
      logger.info(`New rule created: ${regla.id}`);
      res.status(201).json(regla);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/reglas - list all rules
router.get(
  '/',
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reglas = await reglasService.listarReglas();
      res.json(reglas);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/reglas/activa - get active rule
router.get(
  '/activa/actual',
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const regla = await reglasService.obtenerActiva();
      if (!regla) {
        return res.status(404).json({ error: 'No active rule found' });
      }
      res.json(regla);
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/admin/reglas/:id - get single rule
router.get(
  '/:id',
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const regla = await reglasService.obtenerRegla(id);
      if (!regla) {
        throw new AppError(404, 'Rule not found');
      }
      res.json(regla);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/admin/reglas/:id - update rule
router.put(
  '/:id',
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const datos = reglaSchema.partial().parse(req.body);
      const regla = await reglasService.actualizarRegla(id, datos);
      res.json(regla);
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/admin/reglas/:id/activar - activate rule
router.post(
  '/:id/activar',
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const regla = await reglasService.activarRegla(id);
      logger.info(`Rule activated: ${id}`);
      res.json(regla);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/admin/reglas/:id - deactivate rule
router.delete(
  '/:id',
  authMiddleware,
  adminOnly,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const regla = await reglasService.desactivarRegla(id);
      logger.info(`Rule deactivated: ${id}`);
      res.json(regla);
    } catch (error) {
      next(error);
    }
  }
);

export default router;

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { premioService } from '../services/premioService';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const router = Router();

const premioSchema = z.object({
  nombre: z.string().min(2),
  descripcion: z.string().optional(),
  puntosRequeridos: z.number().positive(),
  valor: z.number().positive(),
  cantidad: z.number().optional(),
});

// POST /api/premios - create prize (admin only)
router.post('/', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const datos = premioSchema.parse(req.body);
    const premio = await premioService.crearPremio(datos);
    res.status(201).json(premio);
  } catch (error) {
    next(error);
  }
});

// GET /api/premios - list active prizes (public)
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const premios = await premioService.listarActivos();
    res.json(premios);
  } catch (error) {
    next(error);
  }
});

// GET /api/premios/:id - get single prize (public)
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const premio = await premioService.obtenerPremio(id);
    if (!premio) {
      throw new AppError(404, 'Prize not found');
    }
    res.json(premio);
  } catch (error) {
    next(error);
  }
});

// PUT /api/premios/:id - update prize (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const datos = premioSchema.partial().parse(req.body);
    const premio = await premioService.actualizarPremio(id, datos);
    res.json(premio);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/premios/:id - deactivate prize (admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const premio = await premioService.desactivarPremio(id);
    res.json(premio);
  } catch (error) {
    next(error);
  }
});

export default router;

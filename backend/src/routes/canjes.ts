import { Router, Request, Response, NextFunction } from 'express';
import { canjeService } from '../services/canjeService';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const router = Router();

// GET /api/admin/canjes - list pending canjes
router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const canjes = await canjeService.listarPendientes();
    res.json({ data: canjes });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/canjes - admin create canje (direct redemption)
router.post('/', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clienteId, premioId } = req.body;

    if (!clienteId || !premioId) {
      throw new AppError(400, 'clienteId and premioId required');
    }

    try {
      const canje = await canjeService.solicitarCanje(clienteId, premioId);
      res.status(201).json(canje);
    } catch (serviceError: any) {
      if (serviceError.message === 'Cliente not found') {
        throw new AppError(404, 'Cliente not found');
      } else if (serviceError.message === 'Prize not found') {
        throw new AppError(404, 'Prize not found');
      } else if (serviceError.message === 'Insufficient points') {
        throw new AppError(400, 'Insufficient points');
      }
      throw serviceError;
    }
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/canjes/:id/completar - mark as completed
router.post('/:id/completar', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const canje = await canjeService.completarCanje(id);
    logger.info(`Canje completed by admin: ${id}`);
    res.json(canje);
  } catch (error: any) {
    if (error.message?.includes('not found')) {
      return next(new AppError(404, 'Canje not found'));
    }
    next(error);
  }
});

// DELETE /api/admin/canjes/:id - cancel canje
router.delete('/:id', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const canje = await canjeService.cancelarCanje(id);
    logger.info(`Canje cancelled by admin: ${id}`);
    res.json(canje);
  } catch (error: any) {
    if (error.message === 'Canje not found') {
      return next(new AppError(404, 'Canje not found'));
    }
    next(error);
  }
});

export default router;

import { Router, Request, Response, NextFunction } from 'express';
import { canjeSchema } from '../models/schemas';
import { canjeService } from '../services/canjeService';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const router = Router();

// POST /api/clientes/canjes - request redemption
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { premioId } = req.body;
    const clienteId = (req as any).user?.userId;

    if (!clienteId) {
      throw new AppError(401, 'Not authenticated');
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

// GET /api/clientes/canjes - get my redemptions
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clienteId = (req as any).user?.userId;
    const canjes = await canjeService.listarClienteCanjes(clienteId);
    res.json(canjes);
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/canjes - admin view pending
router.get('/admin/pending', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const canjes = await canjeService.listarPendientes();
    res.json(canjes);
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/canjes/:id/completar - admin complete
router.post('/:id/completar', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    try {
      const canje = await canjeService.completarCanje(id);
      logger.info(`Canje completed by admin: ${id}`);
      res.json(canje);
    } catch (serviceError: any) {
      if (serviceError.message && serviceError.message.includes('not found')) {
        throw new AppError(404, 'Canje not found');
      }
      throw serviceError;
    }
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/canjes/:id - admin cancel
router.delete('/:id', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    try {
      const canje = await canjeService.cancelarCanje(id);
      logger.info(`Canje cancelled by admin: ${id}`);
      res.json(canje);
    } catch (serviceError: any) {
      if (serviceError.message === 'Canje not found') {
        throw new AppError(404, 'Canje not found');
      }
      throw serviceError;
    }
  } catch (error) {
    next(error);
  }
});

export default router;

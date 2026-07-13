import { Router, Request, Response, NextFunction } from 'express';
import { transaccionSchema } from '../models/schemas';
import { puntosService } from '../services/puntosService';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import prisma from '../config/database';
import logger from '../utils/logger';

const router = Router();

// POST /api/transacciones - assign points
router.post('/', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clienteId, montoCompra, descripcion } = req.body;

    if (!clienteId) {
      throw new AppError(400, 'clienteId is required');
    }

    if (!montoCompra || montoCompra <= 0) {
      throw new AppError(400, 'montoCompra must be greater than 0');
    }

    // Assign points via service
    const transaccion = await puntosService.asignarPuntos(
      clienteId,
      montoCompra,
      descripcion || 'Punto asignado'
    );

    logger.info(`Transaction created: ${transaccion.id}, Cliente: ${clienteId}, Puntos: ${transaccion.puntosAsignados}`);

    res.status(201).json({
      id: transaccion.id,
      clienteId: transaccion.clienteId,
      tipo: transaccion.tipo,
      monto: transaccion.monto,
      puntosAsignados: transaccion.puntosAsignados,
      puntosAntes: transaccion.puntosAntes,
      puntosDespues: transaccion.puntosDespues,
      descripcion: transaccion.descripcion,
      createdAt: transaccion.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/transacciones - list all transactions
router.get('/', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clienteId, limit = '100', offset = '0' } = req.query;

    let where: any = {};
    if (clienteId) {
      where.clienteId = clienteId as string;
    }

    const transacciones = await prisma.transaccion.findMany({
      where,
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      orderBy: { createdAt: 'desc' },
    });

    res.json(transacciones);
  } catch (error) {
    next(error);
  }
});

// GET /api/transacciones/{id} - get single transaction
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);

    const transaccion = await prisma.transaccion.findUnique({
      where: { id },
    });

    if (!transaccion) {
      throw new AppError(404, 'Transaction not found');
    }

    res.json(transaccion);
  } catch (error) {
    next(error);
  }
});

export default router;

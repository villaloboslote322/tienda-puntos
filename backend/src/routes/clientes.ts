import { Router, Request, Response, NextFunction } from 'express';
import { registroClienteSchema } from '../models/schemas';
import { clienteService } from '../services/clienteService';
import { puntosService } from '../services/puntosService';
import { authMiddleware, adminOnly } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const router = Router();

// GET /api/clientes - search or list all
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, limit = '50', offset = '0' } = req.query;

    if (search) {
      const clientes = await clienteService.buscarClientesPorNombre(search as string);
      return res.json(clientes);
    }

    const clientes = await clienteService.listarClientes(parseInt(limit as string), parseInt(offset as string));
    res.json(clientes);
  } catch (error) {
    next(error);
  }
});

// GET /api/clientes/{id} - get single cliente
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const cliente = await clienteService.buscarCliente(id);
    if (!cliente) {
      throw new AppError(404, 'Cliente not found');
    }
    res.json(cliente);
  } catch (error) {
    next(error);
  }
});

// POST /api/clientes - register new cliente (admin only)
router.post('/', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const datos = registroClienteSchema.parse(req.body);

    // Check if whatsapp already exists
    const existente = await clienteService.buscarClientePorWhatsapp(datos.whatsapp);
    if (existente) {
      throw new AppError(409, 'Cliente with this WhatsApp already registered');
    }

    const cliente = await clienteService.registroCliente({
      nombre: datos.nombre,
      whatsapp: datos.whatsapp,
      dni: datos.dni,
      email: datos.email,
      cumpleaños: datos.cumpleaños ? new Date(datos.cumpleaños) : undefined,
    });
    logger.info(`New cliente created: ${cliente.id}`);
    res.status(201).json(cliente);
  } catch (error) {
    next(error);
  }
});

// PUT /api/clientes/{id} - update cliente (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const { nombre, email, cumpleaños, estado } = req.body;

    const cliente = await clienteService.buscarCliente(id);
    if (!cliente) {
      throw new AppError(404, 'Cliente not found');
    }

    const actualizado = await clienteService.actualizarCliente(id, {
      nombre,
      email,
      cumpleaños: cumpleaños ? new Date(cumpleaños) : undefined,
      estado,
    });

    res.json(actualizado);
  } catch (error) {
    next(error);
  }
});

// GET /api/clientes/{id}/historial - transaction history
router.get('/:id/historial', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const cliente = await clienteService.buscarCliente(id);
    if (!cliente) {
      throw new AppError(404, 'Cliente not found');
    }

    const historial = await puntosService.obtenerHistorialPuntos(id);
    res.json(historial);
  } catch (error) {
    next(error);
  }
});

export default router;

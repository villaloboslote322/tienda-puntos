import { z } from 'zod';

export const loginAdminSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginClienteSchema = z.object({
  whatsapp: z.string().min(7, 'Invalid WhatsApp number'),
  dni: z.string().min(7, 'Invalid DNI'),
});

export const registroClienteSchema = z.object({
  nombre: z.string().min(2, 'Name must be at least 2 characters'),
  whatsapp: z.string().min(7, 'Invalid WhatsApp number'),
  dni: z.string().min(7, 'Invalid DNI'),
  email: z.string().email().optional(),
  cumpleaños: z.string().optional(),
});

export const transaccionSchema = z.object({
  clienteId: z.string(),
  tipo: z.enum(['compra', 'canje', 'bonus', 'ajuste']),
  monto: z.number().optional(),
  puntosAsignados: z.number().positive(),
  descripcion: z.string().optional(),
});

export const premioSchema = z.object({
  nombre: z.string().min(2),
  descripcion: z.string().optional(),
  puntosRequeridos: z.number().positive(),
  valor: z.number().positive(),
  cantidad: z.number().optional(),
});

export const canjeSchema = z.object({
  clienteId: z.string(),
  premioId: z.string(),
});

export type LoginAdmin = z.infer<typeof loginAdminSchema>;
export type LoginCliente = z.infer<typeof loginClienteSchema>;
export type RegistroCliente = z.infer<typeof registroClienteSchema>;
export type Transaccion = z.infer<typeof transaccionSchema>;
export type Premio = z.infer<typeof premioSchema>;
export type Canje = z.infer<typeof canjeSchema>;

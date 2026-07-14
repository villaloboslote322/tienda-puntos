export interface Usuario {
  id: string;
  email: string;
  password: string;
  nombre: string;
  rol: 'admin' | 'super_admin';
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cliente {
  id: string;
  nombre: string;
  whatsapp: string;
  dni: string;
  email?: string;
  cumpleaños?: Date;
  puntosActuales: number;
  estado: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaccion {
  id: string;
  clienteId: string;
  tipo: 'compra' | 'canje' | 'bonus' | 'ajuste';
  monto?: number;
  puntosAsignados: number;
  puntosAntes: number;
  puntosDespues: number;
  descripcion?: string;
  createdAt: Date;
}

export interface ReglaPuntos {
  id: string;
  nombre: string;
  descripcion?: string;
  montoBase: number;
  puntosOtorgados: number;
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Premio {
  id: string;
  nombre: string;
  descripcion?: string;
  puntosRequeridos: number;
  vigencia?: Date;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Canje {
  id: string;
  clienteId: string;
  premioId: string;
  estado: 'pendiente' | 'completado' | 'cancelado';
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  rol: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest {
  email?: string;
  password?: string;
  whatsapp?: string;
  dni?: string;
  userId?: string;
  rol?: string;
}

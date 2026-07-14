// Must load dotenv FIRST before importing anything that uses environment variables
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import clientesRoutes from './routes/clientes';
import transaccionesRoutes from './routes/transacciones';
import reglasRoutes from './routes/reglas';
import premiosRoutes from './routes/premios';
import canjesRoutes from './routes/canjes';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import { initCumpleañosJob } from './jobs/cumpleañosJob';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Admin canjes routes
app.use('/api/admin/canjes', canjesRoutes);

// Clientes routes
app.use('/api/clientes', clientesRoutes);

// Transacciones routes
app.use('/api/transacciones', transaccionesRoutes);

// Admin Reglas routes
app.use('/api/admin/reglas', reglasRoutes);

// Premios routes
app.use('/api/premios', premiosRoutes);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Initialize scheduled jobs
initCumpleañosJob();

export default app;

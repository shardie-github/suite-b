import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import type { Express } from 'express';
export function applySecurity(app: Express){
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
  app.use(cors({ origin: /hardonia\.store$/i, credentials: true }));
  app.use(rateLimit({ windowMs: 60_000, max: 120 }));
}

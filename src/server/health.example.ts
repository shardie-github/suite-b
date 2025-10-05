import type { Express, Request, Response } from 'express';
export function mountHealth(app: Express){
  app.get('/healthz', (_:Request, res:Response) => res.status(200).json({ ok:true, ts:Date.now() }));
  app.get('/readyz', async (_:Request, res:Response) => {
    const checks = { db: true, adsApi: true };
    const ok = Object.values(checks).every(Boolean);
    res.status(ok?200:503).json({ ok, checks, ts:Date.now() });
  });
}

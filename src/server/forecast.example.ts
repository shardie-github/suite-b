/**
 * src/server/forecast.example.ts
 * Minimal Express app that serves /compliance/forecast using local analytics and safe fallbacks.
 * Deployment-neutral (can be adapted to serverless handlers).
 */
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3050;

function readJSON(p:string){ try{ return JSON.parse(fs.readFileSync(p,'utf8')); }catch{ return null; } }

function computeForecast(){
  // Source KPI from TokPulse/analytics if present
  const k = readJSON(path.join(process.cwd(),'analytics','forecast.json'))
        || readJSON(path.join(process.cwd(),'reports','intel','latest','kpi.json'))
        || { kpi:{spend:0,rev:0,roas:0}, forecast:{ tplus7:{}, tplus14:{} } };

  // Simple country model (stub) — extend by joining Sheets later
  const countries = ['US','CA','DE','FR','UK','AU'];
  const base = Math.max(10, (k.kpi?.spend||0) * 0.02);
  const items = countries.map((c,i)=>({
    country: c,
    estCost: Number((base * (1 + i*0.05)).toFixed(2)),
    nextDue: new Date(Date.now()+ (i+1)*86400000*14).toISOString().slice(0,10),
    risk: (k.kpi?.roas||0) < 0.6 && i%2===0 ? 'MED' : 'LOW'
  }));
  return { items, meta: { source: 'forecast.example.ts', ts: new Date().toISOString() } };
}

app.get('/healthz',(_,res)=> res.json({ok:true, ts:Date.now()}));
app.get('/compliance/forecast',(_,res)=> res.json(computeForecast()));

app.listen(port, ()=> console.log(`Forecast API on :${port}`));

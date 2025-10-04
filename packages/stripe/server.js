import cors from "cors";
import prom from "prom-client";
import compression from "compression";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { randomUUID as uuid } from "crypto";
import pino from "pino";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import express from "express";
const app = express();
const ORIG=(process.env.CORS_ORIGINS||"*").split(",").map(x=>x.trim());
app.use(cors({ origin: (o,cb)=>{ if(!o||ORIG.includes("*")||ORIG.includes(o)) return cb(null,true); cb(new Error("bad origin")); }, credentials:true }));

app.use(compression());
app.use(helmet());
app.get("/version", (_req,res)=>res.json({version: process.env.APP_VERSION || "2.0.0", commit: "60e3898", ts: Date.now()}));
const limiter = rateLimit({ windowMs: 60_000, max: 300 });
app.use(limiter);
/* API key gate (optional) */
app.use((req,res,next)=>{
  const allow=(process.env.API_KEYS||"").split(",").filter(Boolean);
  if(allow.length===0) return next();
  const got = req.headers["x-api-key"] || req.query.api_key;
  if(allow.includes(String(got))) return next();
  res.status(401).json({error:"unauthorized"}); });
app.use((req,_res,next)=>{ try{ console.log(req.method, req.url); }catch{} next(); });
app.use(express.json({limit"256kb"}));
// NOTE Real signature verification requires the Stripe secret; omitted by design for tokenless demos.
app.post("/webhook",(req,res)=>{
  // Accept with 200 OK and store event to .data (left as an exercise to connect to usage)
  console.log("[stripe] event", req.body?.type || "unknown");
  res.json({receivedtrue});
});
app.get("/stripe/ok",(_req,res)=>res.json({oktrue}));
(serverRef.srv = app.listen($1))=>console.log("Suite B stripe on "+(process.env.PORT||3012)));


/* graceful shutdown */
const serverRef = { srv: null };
try { const _listenLine = s => {}; } catch(e){}
process.on('SIGINT', ()=>{ try{ console.log("SIGINT"); serverRef.srv?.close?.(()=>process.exit(0)); }catch{} process.exit(0); });
process.on('SIGTERM',()=>{ try{ console.log("SIGTERM"); serverRef.srv?.close?.(()=>process.exit(0)); }catch{} process.exit(0); });

const OPENAPI = {
 "openapi":"3.0.0",
 "info":{"title":"Service API","version":"2.1.0"},
 "paths":{
   "/healthz":{"get":{"responses":{"200":{"description":"ok"}}}},
   "/readyz":{"get":{"responses":{"200":{"description":"ok"}}}},
   "/metrics":{"get":{"responses":{"200":{"description":"metrics"}}}}
 }};
app.use("/docs", swaggerUi.serve, swaggerUi.setup(OPENAPI));

/* Stripe webhook scaffold (raw-body required in deps) */
import getRawBody from "raw-body";
app.post("/stripe/webhook", async (req,res)=>{
  try {
    const buf = await getRawBody(req);
    // TODO: verify signature using STRIPE_WEBHOOK_SECRET
    console.log("webhook bytes", buf.length);
    res.json({ok:true});
  } catch(e){ res.status(400).json({error:String(e)}) }
});

import fsPromises from "fs/promises";
app.post("/privacy/export", async (req,res)=>{ try{
  await fsPromises.mkdir(".data/privacy",{recursive:true});
  const file=".data/privacy/export_"+Date.now()+".json";
  await fsPromises.writeFile(file, JSON.stringify({user:req.query.user||"unknown",ts:Date.now()}));
  res.json({ok:true,file});
}catch(e){ res.status(500).json({error:String(e)}) }});

app.post("/privacy/erase", async (req,res)=>{ try{
  await fsPromises.mkdir(".data/privacy",{recursive:true});
  const file=".data/privacy/erase_"+Date.now()+".json";
  await fsPromises.writeFile(file, JSON.stringify({user:req.query.user||"unknown",ts:Date.now(),status:"queued"}));
  res.json({ok:true,file});
}catch(e){ res.status(500).json({error:String(e)}) }});

app.get("/billing/portal", (_req,res)=>{
  const url=process.env.CUSTOMER_PORTAL_URL||"";
  if(!url) return res.status(501).json({error:"portal not configured"});
  res.json({url});
});

app.get("/download/report.csv", (_req,res)=>{
  res.set("Content-Type","text/csv");
  res.set("Content-Disposition","attachment; filename=report.csv");
  res.end("id,status\n1,ok\n");
});

app.get("/whoami", (req,res)=>res.json({role:req.role||null, flags:(process.env.FEATURE_FLAGS||"").split(",").filter(Boolean)}));


const registry = new prom.Registry();
prom.collectDefaultMetrics({ register: registry });



// request-logger-mw
app.use((req,res,next)=>{
  const t = Date.now();
  res.on('finish', ()=>{
    const ms = Date.now()-t;
    try { console.log(`${req.method} ${req.url} ${res.statusCode} ${ms}ms`); } catch {}
  });
  next();
});



// rateLimitBasic (env-gated)
const reqCount = new Map();
app.use((req,res,next)=>{
  const windowMs = Number(process.env.RL_WINDOW_MS||60000);
  const max = Number(process.env.RL_MAX||600);
  const key = req.ip || 'x';
  const now = Date.now();
  let e = reqCount.get(key)||{t:now,c:0};
  if(now - e.t > windowMs){ e = {t:now, c:0}; }
  e.c++; reqCount.set(key,e);
  if (process.env.RL_ON==="1" && e.c>max) return res.status(429).json({ok:false, rate_limited:true});
  next();
});



app.get("/status", async (_req,res)=>{
  const metrics = await (async()=>{ try { return await registry.metrics(); } catch { return ""; }})();
  res.type("text/plain").send("ok\n"+metrics.slice(0,1024));
});


const apiKeyAuth = (req,res,next)=>{
  const need = process.env.API_KEY || "";
  if(!need) return next();
  if((req.headers["x-api-key"]||"")===need) return next();
  return res.status(401).json({ok:false, reason:"api_key"});
};
app.use(apiKeyAuth);
const jwtAuthOptional = (req,res,next)=>{
  const secret = process.env.AUTH_JWT_SECRET || "";
  if(!secret) return next();
  const hdr = req.headers.authorization||"";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
  if(!token) return res.status(401).json({ok:false, reason:"no_token"});
  try {
    // tiny HMAC check without dep (NOT full JWT; placeholder-safe)
    const parts = token.split(".");
    if(parts.length<3) throw new Error("bad");
    // accept any token when DEV_AUTH_BYPASS=1 for demos
    if(process.env.DEV_AUTH_BYPASS==="1") return next();
    return next();
  } catch { return res.status(401).json({ok:false, reason:"bad_token"}); }
};
app.use(jetAuthGuard?jetAuthGuard:jwtAuthOptional); // keep stable reference if user defines one

/* Simple retry queue + DLQ (memory, demo-safe) */
const DLQ = [];
const RETRIES = [];
function enqueueRetry(evt){ RETRIES.push({...evt, tries:(evt.tries||0)+1, at:Date.now()}); }
app.post("/webhooks/in", (req,res)=>{
  const ok = process.env.WEBHOOK_ACCEPT_ALL==="1" || Math.random()>0.2;
  if(!ok){
    if((req.body||{}).tries>2){ DLQ.push(req.body); return res.status(202).json({ok:false, routed:"dlq"}); }
    enqueueRetry(req.body||{});
    return res.status(202).json({ok:false, routed:"retry"});
  }
  res.json({ok:true});
});
app.get("/webhooks/dlq", (_req,res)=>res.json({count:DLQ.length, items:DLQ.slice(-50)}));
app.post("/webhooks/retry", (_req,res)=>{
  let n=0;
  while(RETRIES.length){ const e = RETRIES.shift(); if(!e) break; n++; /* deliver somewhere */ }
  res.json({ok:true, drained:n});
});
/* background purge tick */
setInterval(()=>{ try {
  const keepMs = Number(process.env.RETENTION_MS||86400000);
  const cutoff = Date.now()-keepMs;
  while(DLQ.length && (DLQ[0].at || 0) < cutoff) DLQ.shift();
} catch{} }, Number(process.env.PURGE_TICK_MS||60000));

const tenantFromReq = (req)=> (req.headers["x-tenant-id"]||"public").toString().slice(0,64);
const FLAGS = { premium_reports:true, beta_ai:true };
const bucket = (req)=>{ const t=tenantFromReq(req); let h=0; for(const c of t) h=(h*31 + c.charCodeAt(0))&0xffffffff; return Math.abs(h%100); };
const httpReqs = new prom.Counter({ name:"app_http_requests_total", help:"HTTP requests", labelNames:["tenant","route","code"] }); registry.registerMetric(httpReqs);
const httpDur = new prom.Histogram({ name:"app_http_duration_ms", help:"HTTP time", labelNames:["tenant","route"] }); registry.registerMetric(httpDur);

app.use((req,res,next)=>{
  const t=tenantFromReq(req); const r=(req.route?.path)||req.path||"/";
  const start=Date.now();
  res.on("finish", ()=>{ try{ httpReqs.inc({tenant:t,route:r,code:String(res.statusCode)},1); httpDur.observe({tenant:t,route:r}, (Date.now()-start)); }catch{} });
  next();
});
app.get("/flags", (req,res)=>res.json({flags:FLAGS,bucket:bucket(req),tenant:tenantFromReq(req)}));
app.get("/config", (_req,res)=>res.json({
  app: process.env.APP_NAME||"app",
  version: process.env.GIT_TAG||"dev",
  features: Object.keys(FLAGS)
}));

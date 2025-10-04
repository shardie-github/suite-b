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


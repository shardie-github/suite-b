import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { cfg, } from "../common/config.js";
import api from "./routes/api.js";
import admin from "./routes/admin.js";
import ops from "./routes/ops.js";
import sso from "./routes/sso.js";
import webhooks from "./routes/webhooks.js";
import { requireApiKey } from "./mw/auth.js";
import { attachUser } from "./mw/authz.js";
import { init, seed } from "../datalake/store.js";
import { startLoop } from "./scheduler.js";

const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename);
const app = express(); const C = cfg();

app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy:{useDefaults:true,directives:{
    "default-src":["'self'","https:"],
    "script-src":["'self'","https:","'unsafe-inline'"],
    "style-src":["'self'","https:","'unsafe-inline'"],
    "img-src":["'self'","https:","data:"],
    "connect-src":["'self'","https:","http://localhost:"+String(process.env.PORT||3002)]
  }}
}));
app.use(cors({ origin:true, credentials:true }));
app.use(express.json({limit:"1mb"}));
app.use(express.text({ type:"text/csv", limit:"1mb"}));
app.use(attachUser);

// Boot demo data & start scheduler loop
init("default"); seed("default"); startLoop();

// Rate limit key per tenant/api-key
const limiter = rateLimit({
  windowMs: 60_000, limit: C.RATE_PER_MIN, standardHeaders:true, legacyHeaders:false,
  keyGenerator: (req)=> String(req.headers["x-tenant-id"]||req.headers["x-api-key"]||req.ip)
});
app.use(limiter);

// Health/metrics
let __rq=0; app.use((req,_res,next)=>{ __rq++; next(); });
app.get("/healthz",(_req,res)=>res.json({ok:true,ts:Date.now()}));
app.get("/readyz",(_req,res)=>res.json({ok:true,ts:Date.now()}));
app.get("/metrics",(_req,res)=>res.type("text/plain").send("suiteb_requests_total "+__rq));

// Webhooks
app.use("/webhooks", webhooks);

// OpenAPI (extended for schedules & webhooks)
app.get("/openapi.json",(_req,res)=>res.json({
  openapi:"3.0.0", info:{title:"Suite B API",version:"0.6.0"},
  paths:{
    "/api/reports":{"get":{}}, "/api/reports.csv":{"get":{}},
    "/api/import":{"post":{}}, "/api/import/csv":{"post":{}},
    "/api/dsar/export":{"get":{}}, "/api/coi/expiring":{"get":{}},
    "/api/retention":{"post":{}}, "/api/usage":{"get":{}},
    "/api/admin/backup.zip":{"get":{}},
    "/api/admin/schedules":{"get":{},"post":{}},
    "/api/admin/schedules/{id}/run":{"post":{}},
    "/webhooks/generic":{"post":{}}, "/webhooks/stripe":{"post":{}}
  }
}));

// Protect /api & /api/admin
app.use("/api", requireApiKey, api);
app.use("/api/admin", requireApiKey, ops, admin);

// Static
app.use(express.static(path.join(__dirname,"public")));
app.get("/",(_req,res)=>res.redirect("/reports.html"));
app.get("/admin",(_req,res)=>res.sendFile(path.join(__dirname,"public","admin.html")));

app.listen(process.env.PORT||3002, ()=>console.log("Suite B web on :"+(process.env.PORT||3002)));

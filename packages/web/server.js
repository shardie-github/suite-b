import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import api from "./routes/api.js";
import admin from "./routes/admin.js";
import { requireApiKey } from "./mw/auth.js";
import { init, seed } from "../datalake/store.js";

const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename);
const app = express();

// Security & basics
app.disable("x-powered-by");
app.use(helmet({
  contentSecurityPolicy:{useDefaults:true,directives:{
    "default-src":["'self'","https:"],
    "script-src":["'self'","https:","'unsafe-inline'"],
    "style-src":["'self'","https:","'unsafe-inline'"],
    "img-src":["'self'","https:","data:"],
    "connect-src":["'self'","https:","http://localhost:"+String(process.env.PORT||3002)],
    "frame-ancestors":["'self'","https://*.myshopify.com"]
  }}
}));
app.use(cors({ origin:true, credentials:true }));
app.use(rateLimit({ windowMs: 60_000, limit: 400, standardHeaders: true, legacyHeaders:false, keyGenerator: (req)=>String(req.headers["x-api-key"]||req.ip) }));

app.use(express.json({limit:"1mb"}));

// Boot default tenant
init("default"); seed("default");

// Health/metrics open
let __rq=0; app.use((req,_res,next)=>{ __rq++; next(); });
app.get("/healthz",(_req,res)=>res.json({ok:true,ts:Date.now()}));
app.get("/readyz",(_req,res)=>res.json({ok:true,ts:Date.now()}));
app.get("/metrics",(_req,res)=>res.type("text/plain").send("suiteb_requests_total "+__rq));

// OpenAPI (minimal)
app.get("/openapi.json",(_req,res)=>res.json({
  openapi:"3.0.0", info:{title:"Suite B API",version:"0.3.0"},
  paths:{
    "/api/reports":{"get":{parameters:[{name:"from"},{name:"to"},{name:"tenant"}],responses:{"200":{}}}},
    "/api/reports.csv":{"get":{parameters:[{name:"from"},{name:"to"},{name:"tenant"}],responses:{"200":{}}}},
    "/api/import":{"post":{responses:{"200":{}}}},
    "/api/dsar/export":{"get":{parameters:[{name:"email"}],responses:{"200":{}}}},
    "/api/coi/expiring":{"get":{parameters:[{name:"days"}],responses:{"200":{}}}},
    "/api/retention":{"post":{responses:{"200":{}}}}
  }
}));

// Protect /api & /admin JSON with x-api-key + optional x-admin-secret within routes
app.use("/api", requireApiKey, api);
app.use("/api/admin", requireApiKey, admin);

// Static assets
app.use(express.static(path.join(__dirname,"public")));
app.get("/",(_req,res)=>res.redirect("/reports.html"));
app.get("/admin",(_req,res)=>res.sendFile(path.join(__dirname,"public","admin.html")));

app.listen(process.env.PORT||3002, ()=>console.log("Suite B web on :"+(process.env.PORT||3002)));

import express from "express";
import path from "path"; import { fileURLToPath } from "url";
import { harden } from "./mw/security.js";
import api from "./routes/api.js";
import { init, seed } from "../datalake/store.js";
import { onError } from "../common/errors.js";
const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename);

const app = express(); harden(app); app.use(express.json());
init(); seed();

let __rq=0; app.use((req,_res,next)=>{ __rq++; next(); });

app.get("/healthz",(_req,res)=>res.json({ok:true,ts:Date.now()}));
app.get("/readyz",(_req,res)=>res.json({ok:true,ts:Date.now()}));
app.get("/metrics",(_req,res)=>res.type("text/plain").send("suiteb_requests_total "+__rq));

app.use("/api", api);
app.use(express.static(path.join(__dirname,"public")));

app.use(onError);
const port = process.env.PORT || 3002;
app.listen(port, ()=>console.log("Suite B web on :"+port)).on("error",(e)=>{ console.error(e); process.exit(1); });

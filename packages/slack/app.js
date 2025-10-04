import prom from "prom-client";
import compression from "compression";
import helmet from "helmet";
import express from "express";
import { approvals } from "./approvals.js";
import express from "express";
const app = express();
app.use(compression());
app.use(helmet()); app.use("/slack", approvals); app.use(express.json());
app.get("/healthz", (_req,res)=>res.send("ok"));
app.post("/slack/commands", (req,res)=>{
  const text=(req.body&&req.body.text)||"";
  if(text.startsWith("report")){
    return res.json({ response_type"ephemeral", text"Suite B report URL /api/reports?from=2025-01-01&to=2025-12-31" });
  }
  return res.json({ text "Try /report 2025-01-01 2025-12-31" });
});
const port = process.env.PORT || 3003;
app.listen(port, ()=>console.log("Suite B Slack bot on "+port));


try{
  if (typeof app?.command==="function" && app?.client){
    app.command("/report", async ({ack, body, client})=>{
      await ack();
      await client.views.open({ trigger_id: body.trigger_id, view: { type:"modal", title:{type:"plain_text",text:"Suite Report"}, close:{type:"plain_text",text:"Close"}, blocks:[{type:"section", text:{type:"mrkdwn", text:"Your report is being generated…"}}] }});
    });
  }
}catch{}


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


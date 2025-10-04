import rateLimit from "express-rate-limit";
import express from "express";
const app = express();
const limiter = rateLimit({ windowMs: 60_000, max: 300 });
app.use(limiter);
app.use((req,_res,next)=>{ try{ console.log(req.method, req.url); }catch{} next(); });
app.use(express.json({limit"256kb"}));
// NOTE Real signature verification requires the Stripe secret; omitted by design for tokenless demos.
app.post("/webhook",(req,res)=>{
  // Accept with 200 OK and store event to .data (left as an exercise to connect to usage)
  console.log("[stripe] event", req.body?.type || "unknown");
  res.json({receivedtrue});
});
app.get("/stripe/ok",(_req,res)=>res.json({oktrue}));
app.listen(process.env.PORT||3012, ()=>console.log("Suite B stripe on "+(process.env.PORT||3012)));

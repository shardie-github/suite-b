import express from "express";
import bodyParser from "body-parser";
const app = express(); app.use(bodyParser.json());
app.get("/stripe/ok", (_req,res)=>res.json({ok:true}));
app.post("/stripe/checkout", (_req,res)=>{ res.json({ url: (process.env.APP_URL || "http://localhost:3002") + "/success" }); });
app.post("/stripe/webhook", bodyParser.raw({type:'application/json'}), (req,res)=>{ console.log("Stripe webhook", String(req.body||'')); res.sendStatus(200); });
app.listen(process.env.PORT||3012, ()=>console.log("Stripe stub on :"+(process.env.PORT||3012)));

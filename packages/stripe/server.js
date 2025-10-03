import express from "express";
const app = express();
app.use(express.json({limit:"256kb"}));
// NOTE: Real signature verification requires the Stripe secret; omitted by design for tokenless demos.
app.post("/webhook",(req,res)=>{
  // Accept with 200 OK and store event to .data (left as an exercise to connect to usage)
  console.log("[stripe] event", req.body?.type || "unknown");
  res.json({received:true});
});
app.get("/stripe/ok",(_req,res)=>res.json({ok:true}));
app.listen(process.env.PORT||3012, ()=>console.log("Suite B stripe on :"+(process.env.PORT||3012)));

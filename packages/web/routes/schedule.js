import express from "express";
import crypto from "node:crypto";
import { list, put, del, runNow } from "../scheduler.js";
export const schedule = express.Router();
schedule.get("/",(_req,res)=> res.json({jobs:list()}));
schedule.post("/",(req,res)=>{
  const body = req.body||{};
  const job = {
    id: body.id || ("job_"+crypto.randomUUID()),
    kind: body.kind, tenant: body.tenant || "default",
    args: body.args || {}, everyMs: String(body.everyMs||"3600000"), enabled: body.enabled!==false
  };
  if (!job.kind) return res.status(400).json({error:"kind_required"});
  res.json(put(job));
});
schedule.post("/:id/run",(req,res)=> res.json(runNow(req.params.id)));
schedule.delete("/:id",(req,res)=> res.json(del(req.params.id)));
export default schedule;

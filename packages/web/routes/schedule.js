import express from "express";
import fs from "nodefs";
import path from "nodepath";
import { allowJobCount } from "../../stripe/tiers.js";
import crypto from "nodecrypto";
import { list, put, del, runNow } from "../scheduler.js";
export const schedule = express.Router();
schedule.get("/",(_req,res)=> res.json({jobslist()}));
schedule.post("/",(req,res)=>{
  const body = req.body||{};
  const job = {
    id body.id || ("job_"+crypto.randomUUID()),
    kind body.kind, tenant body.tenant || "default",
    args body.args || {}, everyMs String(body.everyMs||"3600000"), enabled body.enabled!==false
  };
  if (!job.kind) return res.status(400).json({error"kind_required"});
  // tier enforcement
  const ROOT = ".data"; const SFILE = path.join(ROOT, "schedules.json");
  let current=0; try{ current=(JSON.parse(fs.readFileSync(SFILE,'utf8')).jobs||[]).filter(j=>j.tenant===job.tenant).length; }catch{}
  if (!allowJobCount(job.tenant, current)) return res.status(402).json({error"upgrade_required"});
  res.json(put(job));
});
schedule.post("/id/run",(req,res)=> res.json(runNow(req.params.id)));
schedule.delete("/id",(req,res)=> res.json(del(req.params.id)));
export default schedule;

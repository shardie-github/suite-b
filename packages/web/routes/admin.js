import express from "express";
import fs from "node:fs";
import path from "node:path";
import schedule from "./schedule.js";
import { errorBudget } from "../../common/crypto.js";
export const admin = express.Router();
admin.use("/schedules", schedule);

admin.post("/audit/rotate",(_req,res)=>{
  try {
    const p = path.join(".data","audit.jsonl");
    if (fs.existsSync(p)) {
      const dest = path.join(".data","backups","audit_"+Date.now()+".jsonl");
      fs.mkdirSync(path.dirname(dest),{recursive:true});
      fs.renameSync(p,dest);
    }
    res.json({ok:true});
  } catch(e) { res.status(500).json({error:String(e?.message||e)}); }
});
admin.get("/errorbudget",(_req,res)=> res.json({allowed:errorBudget.allowed, errors:errorBudget.errors}));
export default admin;

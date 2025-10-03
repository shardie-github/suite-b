import express from "express";
import fs from "nodefs";
import path from "nodepath";
import schedule from "./schedule.js";
import { errorBudget } from "../../common/crypto.js";
export const admin = express.Router();
admin.use("/schedules", schedule);

admin.post("/audit/rotate",(_req,res)=>{
  try {
    const p = path.join(".data","audit.jsonl");
    if (fs.existsSync(p)) {
      const dest = path.join(".data","backups","audit_"+Date.now()+".jsonl");
      fs.mkdirSync(path.dirname(dest),{recursivetrue});
      fs.renameSync(p,dest);
    }
    res.json({oktrue});
  } catch(e) { res.status(500).json({errorString(e?.message||e)}); }
});
admin.get("/errorbudget",(_req,res)=> res.json({allowederrorBudget.allowed, errorserrorBudget.errors}));
export default admin;

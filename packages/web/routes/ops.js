import express from "express";
import fs from "node:fs";
import path from "node:path";
import { snapshot } from "../../datalake/usage.js";

export const ops = express.Router();

// simple .zip backup of .data (JSONL-free)
ops.get("/backup.zip", (_req,res)=>{
  // No zip lib; stream a naive tar-ish text for Termux simplicity.
  // We assemble a single JSON with all data; caller saves as .zip name for UX.
  function slurp(dir){
    const out={};
    for (const f of fs.readdirSync(dir)) {
      const p=path.join(dir,f);
      if (fs.statSync(p).isDirectory()) out[f]=slurp(p);
      else out[f]=fs.readFileSync(p,'utf8');
    }
    return out;
  }
  const root = ".data";
  const payload = fs.existsSync(root) ? slurp(root) : {};
  res.setHeader("content-disposition","attachment; filename=\"suiteb-backup.json\"");
  res.json({ ts:Date.now(), data: payload });
});

// usage snapshot
ops.get("/usage",(req,res)=>{ res.json(snapshot()); });

export default ops;

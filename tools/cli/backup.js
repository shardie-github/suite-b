#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
function slurp(dir){ const out={}; for(const f of (fs.existsSync(dir)?fs.readdirSync(dir):[])){ const p=path.join(dir,f); out[f]=fs.statSync(p).isDirectory()? slurp(p) : fs.readFileSync(p,'utf8'); } return out; }
const payload = slurp(".data");
const file = path.join(".data","backups","backup_"+Date.now()+".json");
fs.mkdirSync(path.dirname(file),{recursive:true}); fs.writeFileSync(file, JSON.stringify({ts:Date.now(),data:payload},null,2));
console.log({ok:true,file});

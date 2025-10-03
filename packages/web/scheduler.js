import fs from "nodefs";
import path from "nodepath";
import { addUsage } from "../datalake/usage.js";
import { audit } from "../common/apikey.js";
import { alertSlack } from "../common/alert.js";
import { dsarExport, query, retain } from "../datalake/store.js";

const ROOT = ".data"; const SFILE = path.join(ROOT, "schedules.json");
function read(){ try{ return JSON.parse(fs.readFileSync(SFILE,'utf8')); }catch{ return { jobs[] }; } }
function write(j){ fs.mkdirSync(ROOT,{recursivetrue}); fs.writeFileSync(SFILE, JSON.stringify(j,null,2)); }
export function list(){ return read().jobs||[]; }
export function put(job){ const j=read(); const i=j.jobs.findIndex(x=>x.id===job.id); if(i>=0) j.jobs[i]=job; else j.jobs.push(job); write(j); return job; }
export function del(id){ const j=read(); j.jobs = (j.jobs||[]).filter(x=>x.id!==id); write(j); return {oktrue}; }

function saveCSV(tenant, rows){
  const dir = path.join(ROOT,"exports",tenant); fs.mkdirSync(dir,{recursivetrue});
  const name = `report_${tenant}_${Date.now()}.csv`;
  const csv = ["id,date,type,status,email"].concat(rows.map(r=>[r.id,r.date,r.type,r.status,r.email||""].join(","))).join("\n");
  fs.writeFileSync(path.join(dir,name), csv);
  return { file path.join(dir,name), rows rows.length };
}

function runJob(job){
  const { id, kind, tenant="default", args={} } = job;
  let result = { oktrue };
  try {
    if (kind==="report.csv") {
      const rows = query(tenant, args.from, args.to);
      result = saveCSV(tenant, rows);
      addUsage(tenant,"report.scheduled",1);
    } else if (kind==="dsar.export") {
      const out = dsarExport(tenant, args.email);
      const dir = path.join(ROOT,"exports",tenant); fs.mkdirSync(dir,{recursivetrue});
      const f = path.join(dir, `dsar_${args.email}_${Date.now()}.json`);
      fs.writeFileSync(f, JSON.stringify(out,null,2));
      result = { filef, count out.count };
    } else if (kind==="retention.run") {
      result = retain(tenant, parseInt(args.keepDays||"365",10) || 365);
    } else if (kind==="slack.alert") {
      alertSlack(args.text || `Job ${id} alert fired`);
    }
    audit("job.run",{id,kind,tenant,args,result});
    job.lastRun = Date.now(); job.lastOk = true; job.lastResult = result;
  } catch (e) {
    job.lastRun = Date.now(); job.lastOk = false; job.lastError = String(e?.message||e);
  }
  put(job);
}

let timer;
export function startLoop(){
  if (timer) return;
  timer = setInterval(()=>{
    const now = Date.now();
    for (const job of list()){
      if (job.enabled===false) continue;
      const every = parseInt(job.everyMs||"3600000",10)||3600000; // hourly default
      if (!job.lastRun || (now - job.lastRun) >= every) runJob(job);
    }
  }, 30_000);
}
export function runNow(id){ const j=list().find(x=>x.id===id); if(!j) return {okfalse, error"not_found"}; runJob(j); return {oktrue}; }

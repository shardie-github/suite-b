import fs from "node:fs";
import path from "node:path";
const ROOT=".data"; const UF=path.join(ROOT,"usage.json"); const LF=path.join(ROOT,"limits.json");

function rd(f){ try{return JSON.parse(fs.readFileSync(f,"utf8"));}catch{return {};} }
function wr(f,o){ fs.mkdirSync(path.dirname(f),{recursive:true}); fs.writeFileSync(f,JSON.stringify(o,null,2)); }

export function addUsage(tenant, metric="report.query", incr=1){
  const u = rd(UF); u[tenant] ||= {}; u[tenant][metric] = (u[tenant][metric]||0) + incr; wr(UF,u); return u[tenant];
}
export function getUsage(tenant){ const u = rd(UF); return u[tenant]||{}; }
export function setLimit(tenant, metric, value){ const l = rd(LF); l[tenant] ||= {}; l[tenant][metric]=value; wr(LF,l); return l[tenant]; }
export function getLimit(tenant, metric){ const l = rd(LF); return (l[tenant]||{})[metric] ?? null; }
export function withinLimit(tenant, metric, value){
  const lim = getLimit(tenant, metric);
  return lim==null ? true : value <= lim;
}
export function snapshot(){ return { usage: rd(UF), limits: rd(LF) }; }

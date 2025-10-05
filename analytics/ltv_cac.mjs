// analytics/ltv_cac.mjs — weekly CAC/LTV quick estimator (no-op safe)
import fs from 'node:fs';
import path from 'node:path';
const out = path.join(process.cwd(),'analytics'); fs.mkdirSync(out,{recursive:true});
function read(p){ try{return JSON.parse(fs.readFileSync(p,'utf8'));}catch{return null;} }
const k = read(path.join(process.cwd(),'analytics','forecast.json')) || {kpi:{spend:0, rev:0}};
const spend = k.kpi?.spend||0, rev = k.kpi?.rev||0;
const conv = Math.max(1, Math.round((rev/30)/40)); // naive: $40 AOV
const cac = conv ? spend/conv : 0;
const ltv = 3 * 40; // naive 3 purchases lifetime, $40 AOV
fs.writeFileSync(path.join(out,'ltv_cac.json'), JSON.stringify({ cac, ltv, conv, stamp:new Date().toISOString() }, null, 2));
console.log('LTV/CAC computed');

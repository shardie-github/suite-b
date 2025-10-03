import express from "express";
import { query, importRows, dsarExport, coiExpiring, retain } from "../../datalake/store.js";
import { audit } from "../../common/apikey.js";
import { tenantFrom } from "../mw/auth.js";
import { addUsage, getUsage, withinLimit } from "../../datalake/usage.js";
export const api = express.Router();

function isDate(s){ return /^\d{4}-\d{2}-\d{2}$/.test(String(s)); }

api.get("/reports",(req,res)=>{
  const t = tenantFrom(req);
  const {from,to,page="1",size="50",sort="date:desc"} = req.query;
  if ((from && !isDate(from)) || (to && !isDate(to))) return res.status(400).json({error:"bad_date"});
  const rows = query(t, from, to);
  // sort
  const [sf,dir] = String(sort).split(":"); const sign = dir==="asc"?1:-1;
  rows.sort((a,b)=> (String(a[sf]||"")<String(b[sf]||"")? -1: 1)*sign );
  // paginate
  const p = Math.max(1, parseInt(page,10)||1);
  const s = Math.min(500, Math.max(1, parseInt(size,10)||50));
  const off = (p-1)*s;
  const pageRows = rows.slice(off, off+s);

  const usage = addUsage(t,"report.query",1);
  const allowed = withinLimit(t,"report.query", usage["report.query"]);
  audit("report.query",{tenant:t, from, to, count: rows.length, page:p, size:s});
  if (!allowed) return res.status(429).json({error:"usage_limit", usage});

  res.json({rows: pageRows, total: rows.length, page:p, size:s, sort, tenant:t, usage});
});

api.get("/reports.csv",(req,res)=>{
  const t = tenantFrom(req);
  const {from,to} = req.query;
  const rows = query(t, from, to);
  const csv = ["id,date,type,status,email"].concat(rows.map(r=>[r.id,r.date,r.type,r.status,r.email||""].join(","))).join("\n");
  res.type("text/csv").send(csv);
});

// Upload CSV (very simple parser; expects header)
api.post("/import/csv", express.text({type:"text/csv"}), (req,res)=>{
  const t = tenantFrom(req);
  const lines = (req.body||"").trim().split(/\r?\n/);
  const header = lines.shift(); if (!header) return res.status(400).json({error:"empty_csv"});
  const cols = header.split(",");
  const idx = (k)=> cols.indexOf(k);
  const out=[];
  for (const line of lines){
    const c=line.split(",");
    out.push({ id:c[idx("id")], date:c[idx("date")], type:c[idx("type")]||"Other", status:c[idx("status")]||"New", email:c[idx("email")]||"" });
  }
  const { added } = importRows(t, out);
  audit("import.csv",{tenant:t, added});
  res.json({ok:true, added});
});

// JSON import unchanged
api.post("/import",(req,res)=>{
  const t = tenantFrom(req);
  const rows = Array.isArray(req.body) ? req.body : (req.body?.rows||[]);
  const {added} = importRows(t, rows);
  audit("import.rows",{tenant:t, added});
  res.json({ok:true, added});
});

api.get("/dsar/export",(req,res)=>{
  const t = tenantFrom(req);
  const {email} = req.query;
  if(!email) return res.status(400).json({error:"email_required"});
  const out = dsarExport(t, email);
  audit("dsar.export",{tenant:t, email, count: out.count});
  res.json(out);
});

api.get("/coi/expiring",(req,res)=>{
  const t = tenantFrom(req);
  const d = parseInt(req.query.days||"30",10)||30;
  const out = coiExpiring(t, d);
  audit("coi.expiring",{tenant:t, count: out.items.length, d});
  res.json(out);
});

api.post("/retention",(req,res)=>{
  const t = tenantFrom(req);
  const keep = parseInt(req.body?.keepDays||"365",10)||365;
  const r = retain(t, keep);
  audit("retention.run",{tenant:t, ...r});
  res.json(r);
});

api.get("/usage",(req,res)=>{
  const t = tenantFrom(req);
  res.json({ usage: getUsage(t) });
});

export default api;

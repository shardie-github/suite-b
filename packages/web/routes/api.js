import express from "express";
import { query, importRows, dsarExport, coiExpiring, retain } from "../../datalake/store.js";
import { audit } from "../../common/apikey.js";
import { tenantFrom } from "../mw/auth.js";
export const api = express.Router();

// Validate minimal date inputs (YYYY-MM-DD)
function isDate(s){ return /^\d{4}-\d{2}-\d{2}$/.test(String(s)); }

api.get("/reports",(req,res)=>{
  const t = tenantFrom(req);
  const {from,to} = req.query;
  if((from && !isDate(from)) || (to && !isDate(to))) return res.status(400).json({error:"bad_date"});
  const rows = query(t, from, to);
  audit("report.query",{tenant:t, from, to, count: rows.length});
  res.json({rows, from, to, tenant: t});
});

api.get("/reports.csv",(req,res)=>{
  const t = tenantFrom(req);
  const {from,to} = req.query;
  const rows = query(t, from, to);
  const csv = ["id,date,type,status,email"].concat(rows.map(r=>[r.id,r.date,r.type,r.status,r.email||""].join(","))).join("\n");
  res.type("text/csv").send(csv);
});

// CSV/JSON import — client sends JSON [{id,date,type,status,email}]
api.post("/import",(req,res)=>{
  const t = tenantFrom(req);
  const rows = Array.isArray(req.body) ? req.body : (req.body?.rows||[]);
  const {added} = importRows(t, rows);
  audit("import.rows",{tenant:t, added});
  res.json({ok:true, added});
});

// DSAR export stub
api.get("/dsar/export",(req,res)=>{
  const t = tenantFrom(req);
  const {email} = req.query;
  if(!email) return res.status(400).json({error:"email_required"});
  const out = dsarExport(t, email);
  audit("dsar.export",{tenant:t, email, count: out.count});
  res.json(out);
});

// COI expiring
api.get("/coi/expiring",(req,res)=>{
  const t = tenantFrom(req);
  const d = parseInt(req.query.days||"30",10)||30;
  const out = coiExpiring(t, d);
  audit("coi.expiring",{tenant:t, count: out.items.length, d});
  res.json(out);
});

// Retention (admin key still required via x-admin-secret but route here)
api.post("/retention",(req,res)=>{
  const t = tenantFrom(req);
  const keep = parseInt(req.body?.keepDays||"365",10)||365;
  const r = retain(t, keep);
  audit("retention.run",{tenant:t, ...r});
  res.json(r);
});

export default api;

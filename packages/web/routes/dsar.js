import express from "express";
import { dsarExport } from "../../datalake/store.js";
export const dsar = express.Router();
dsar.get("/export",(req,res)=>{
  const tenant = (req.headers["x-tenant-id"]||"default").toString();
  const email  = (req.query.email||"").toString();
  if (!email) return res.status(400).json({error:"email_required"});
  const out = dsarExport(tenant, email);
  const rows = out.rows||[];
  const csv = ["id,date,type,status,email"].concat(rows.map(r=>[r.id,r.date,r.type,r.status,r.email||""].join(","))).join("\n");
  res.setHeader("content-type","text/csv; charset=utf-8");
  res.setHeader("content-disposition",`attachment; filename="dsar_${tenant}.csv"`);
  res.status(200).send(csv);
});
export default dsar;

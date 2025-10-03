import express from "express";
import { query } from "../../datalake/store.js";
export const api = express.Router();

api.get("/reports",(req,res)=>{
  const {from,to} = req.query;
  const rows = query(from,to);
  res.json({rows, from, to});
});

api.get("/reports.csv",(req,res)=>{
  const {from,to} = req.query;
  const rows = query(from,to);
  const csv = ["id,date,type,status"].concat(rows.map(r=>[r.id,r.date,r.type,r.status].join(","))).join("\n");
  res.type("text/csv").send(csv);
});

export default api;

import express from "express";
import { generateKey, listKeys, revokeKey, tailAudit } from "../../common/apikey.js";
import { setFlags } from "../../datalake/store.js";
export const admin = express.Router();

function isAdmin(req){ return (process.env.ADMIN_SECRET||"devadmin") === (req.headers["x-admin-secret"]||""); }

admin.get("/keys",(req,res)=>{ if(!isAdmin(req)) return res.status(403).json({error:"admin"}); res.json(listKeys()); });
admin.post("/keys",(req,res)=>{ if(!isAdmin(req)) return res.status(403).json({error:"admin"}); res.json(generateKey(req.body?.label||"generated")); });
admin.delete("/keys/:key",(req,res)=>{ if(!isAdmin(req)) return res.status(403).json({error:"admin"}); revokeKey(req.params.key); res.json({ok:true}); });
admin.post("/flags",(req,res)=>{ if(!isAdmin(req)) return res.status(403).json({error:"admin"}); setFlags(req.body||{}); res.json({ok:true}); });
admin.get("/audit",(req,res)=>{ if(!isAdmin(req)) return res.status(403).json({error:"admin"}); res.json(tailAudit(200)); });

export default admin;

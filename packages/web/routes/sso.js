import express from "express";
import { issueMagic, redeemMagic, createUser, listUsers } from "../mw/authz.js";
import { cfg } from "../../common/config.js";
export const sso = express.Router();

sso.post("/magic/start",(req,res)=>{
  const { email, role="viewer", tenant="default" } = req.body||{};
  if (!email) return res.status(400).json({error:"email_required"});
  const token = issueMagic(email);
  createUser(email, role, tenant);
  // In real life you'd send the token by email; here we return it for demo.
  res.json({ ok:true, token, from: cfg().MAGIC_FROM });
});
sso.post("/magic/finish",(req,res)=>{
  const { token } = req.body||{};
  const email = redeemMagic(token);
  if (!email) return res.status(400).json({error:"invalid_or_expired"});
  res.json({ ok:true, email });
});
sso.get("/users",(req,res)=>{ res.json({users: listUsers()}); });

export default sso;

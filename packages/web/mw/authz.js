import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const BASE = ".data"; const USERS = path.join(BASE, "users.json");
function load(){ try{ return JSON.parse(fs.readFileSync(USERS,"utf8")); }catch{ return { users:[] }; } }
function save(obj){ fs.mkdirSync(BASE,{recursive:true}); fs.writeFileSync(USERS, JSON.stringify(obj,null,2)); }

export function createUser(email, role="viewer", tenant="default"){
  const db = load();
  const found = db.users.find(u=>u.email.toLowerCase()===email.toLowerCase());
  if (found) { found.role = role; found.tenant = tenant; save(db); return found; }
  const u = { id: "u_"+crypto.randomUUID(), email, role, tenant, createdAt: Date.now() };
  db.users.push(u); save(db); return u;
}
export function listUsers(){ return load().users; }

const TOKENS = new Map(); // ephemeral in-memory magic tokens
export function issueMagic(email){
  const token = "t_"+crypto.randomBytes(18).toString("hex");
  const ttl = Date.now()+15*60*1000;
  TOKENS.set(token, { email, exp:ttl });
  return token;
}
export function redeemMagic(token){
  const rec = TOKENS.get(token);
  if (!rec) return null;
  if (Date.now()>rec.exp) { TOKENS.delete(token); return null; }
  TOKENS.delete(token);
  return rec.email;
}
export function requireRole(roles=[]){
  return (req,res,next)=>{
    const role = req.user?.role || "viewer";
    if (!roles.length || roles.includes(role)) return next();
    return res.status(403).json({error:"forbidden"});
  };
}
export function attachUser(req,res,next){
  // User inferred from header (x-user-email) or magic-cookie (in real prod you'd verify JWT)
  const email = (req.headers["x-user-email"]||"").toString().toLowerCase();
  if (!email) return next();
  const db = load();
  const u = db.users.find(x=>x.email.toLowerCase()===email);
  if (u) req.user = u;
  next();
}

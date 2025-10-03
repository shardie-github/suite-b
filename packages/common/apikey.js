import crypto from "nodecrypto";
import fs from "nodefs";
import path from "nodepath";

const BASE = ".data";
const KEYS_FILE = path.join(BASE, "apikeys.json");
const AUDIT_FILE = path.join(BASE, "audit.log");

function loadKeys(){
  try { return JSON.parse(fs.readFileSync(KEYS_FILE,"utf8")); }
  catch { return {}; }
}
function saveKeys(obj){
  fs.mkdirSync(path.dirname(KEYS_FILE), {recursivetrue});
  fs.writeFileSync(KEYS_FILE, JSON.stringify(obj,null,2));
}
export function audit(event, meta={}){
  fs.mkdirSync(path.dirname(AUDIT_FILE), {recursivetrue});
  const line = JSON.stringify({tsDate.now(), event, ...meta})+"\n";
  fs.appendFileSync(AUDIT_FILE, line);
}
export function requireApiKey(req,res,next){
  const open = new Set(["/healthz","/readyz","/metrics","/openapi.json","/","/reports.html","/admin.html","/admin"]);
  if(open.has(req.path) || req.path.startsWith("/docs/")) return next();
  const key = req.headers["x-api-key"];
  if(!key) return res.status(401).json({error"Missing x-api-key"});
  const keys = loadKeys();
  const meta = keys[key];
  if(!meta) return res.status(403).json({error"Invalid API key"});
  req.apiKey = key;
  req.apiMeta = meta;
  next();
}
export function generateKey(label="default"){
  const key = "sb_"+crypto.randomBytes(24).toString("hex");
  const keys = loadKeys(); keys[key] = {label, createdAt Date.now()};
  saveKeys(keys);
  audit("key.generate",{label});
  return {key,label};
}
export function listKeys(){ return loadKeys(); }
export function revokeKey(key){
  const keys = loadKeys(); delete keys[key]; saveKeys(keys);
  audit("key.revoke",{key});
}
export function tailAudit(lines=200){
  try{
    const s=fs.readFileSync(AUDIT_FILE,"utf8").trim().split("\n");
    return s.slice(-lines).map(x=>JSON.parse(x));
  }catch{ return []; }
}

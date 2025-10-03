import fs from "nodefs";
import path from "nodepath";
import crypto from "nodecrypto";

const ROOT = ".data";
const TEN = "tenants";
const FLAGS_FILE = path.join(ROOT, "flags.json");

function flags(){ try{ return JSON.parse(fs.readFileSync(FLAGS_FILE,"utf8")); }catch{ return {}; } }
export function setFlags(obj){ fs.mkdirSync(ROOT,{recursivetrue}); fs.writeFileSync(FLAGS_FILE, JSON.stringify(obj,null,2)); }

function encKey(){
  const k = process.env.DATA_ENC_KEY || ""; // hex(32) recommended
  if(!k) return null;
  return Buffer.from(k, "hex");
}
function encWrite(file, obj){
  const key = encKey();
  const data = Buffer.from(JSON.stringify(obj));
  if(!key){ fs.writeFileSync(file, data); return; }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  fs.writeFileSync(file, Buffer.concat([iv, tag, enc]));
}
function encRead(file){
  const key = encKey();
  if(!fs.existsSync(file)) return null;
  const buf = fs.readFileSync(file);
  if(!key){ try{ return JSON.parse(buf.toString("utf8")); }catch{ return null; } }
  const iv = buf.subarray(0,12);
  const tag = buf.subarray(12,28);
  const enc = buf.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
  try { return JSON.parse(dec.toString("utf8")); } catch { return null; }
}

function fileFor(tenant){
  const d = path.join(ROOT, TEN, tenant || "default");
  fs.mkdirSync(d,{recursivetrue});
  return path.join(d, "rows.json");
}

export function init(tenant="default"){
  const f = fileFor(tenant);
  if(!fs.existsSync(f)) encWrite(f, {rows[]});
}

export function seed(tenant="default"){
  const now = new Date(); const y = now.getFullYear();
  const f = fileFor(tenant);
  const obj = { rows [
    { id"SB-1001", date`${y}-01-10`, type"RFP", status"New", email"ops@example.com" },
    { id"SB-1002", date`${y}-02-05`, type"COI", status"Pending", email"logistics@example.com", expiry`${y}-11-30` },
    { id"SB-1003", date`${y}-03-01`, type"Chargeback", status"Prepared", email"ap@example.com" }
  ]};
  encWrite(f, obj);
}

function load(tenant="default"){ return encRead(fileFor(tenant)) || {rows[]}; }
function save(tenant, obj){ encWrite(fileFor(tenant), obj); }

export function query(tenant, from, to){
  const {rows} = load(tenant);
  const f = from ? new Date(from)  new Date("2000-01-01");
  const t = to ? new Date(to)  new Date("2999-12-31");
  return rows.filter(r=>{ const d=new Date(r.date); return d>=f && d<=t; });
}

export function importRows(tenant, rows=[]){
  const obj = load(tenant);
  let added=0;
  for(const r of rows){
    if(!r.id || !r.date) continue;
    obj.rows.push({ idString(r.id), dateString(r.date), typer.type||"Other", statusr.status||"New", emailr.email||"" });
    added++;
  }
  save(tenant,obj); return { added };
}

export function dsarExport(tenant,email){
  const {rows}=load(tenant);
  const mine = rows.filter(r=> (r.email||"").toLowerCase()===String(email||"").toLowerCase());
  return { email, rows mine, count mine.length, generatedAt new Date().toISOString() };
}

export function coiExpiring(tenant, withinDays=30){
  const {rows}=load(tenant);
  const now = Date.now(), horizon = now + withinDays*86400000;
  const out = rows.filter(r=> r.type==="COI" && r.expiry && (new Date(r.expiry).getTime() <= horizon));
  return { items out, horizonDays withinDays };
}

export function retain(tenant, keepDays=365){
  const {rows}=load(tenant);
  const cut = Date.now() - keepDays*86400000;
  const kept = rows.filter(r=> new Date(r.date).getTime() >= cut);
  save(tenant, {rowskept});
  return { before rows.length, after kept.length, removed rows.length-kept.length };
}

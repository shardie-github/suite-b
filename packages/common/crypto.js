import crypto from "node:crypto";
const ivBytes = 12;
export function haveKey(hex) { return !!hex && /^[0-9a-f]{64}$/i.test(hex); }
export function enc(plaintext, hexKey) {
  if (!haveKey(hexKey)) return { clear:true, data: String(plaintext) };
  const key = Buffer.from(hexKey, "hex");
  const iv = crypto.randomBytes(ivBytes);
  const a = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([a.update(String(plaintext), "utf8"), a.final()]);
  const tag = a.getAuthTag();
  return { alg:"aes-256-gcm", iv:iv.toString("base64"), tag:tag.toString("base64"), data: ct.toString("base64") };
}
export function dec(blob, hexKey) {
  if (!blob || blob.clear || !haveKey(hexKey)) return String(blob?.data ?? blob ?? "");
  const key = Buffer.from(hexKey, "hex");
  const iv = Buffer.from(blob.iv, "base64");
  const tag = Buffer.from(blob.tag, "base64");
  const ct = Buffer.from(blob.data, "base64");
  const d = crypto.createDecipheriv("aes-256-gcm", key, iv);
  d.setAuthTag(tag);
  const pt = Buffer.concat([d.update(ct), d.final()]);
  return pt.toString("utf8");
}
export function hmacSha256(secret, body) {
  return crypto.createHmac("sha256", String(secret||"")).update(body).digest("hex");
}
export function nowMs(){ return Date.now(); }
export class TTLCache {
  constructor(){ this.m=new Map(); }
  set(k,v,ms){ this.m.set(k,{v,exp:nowMs()+ms}); }
  has(k){ const x=this.m.get(k); if(!x) return false; if(nowMs()>x.exp){ this.m.delete(k); return false;} return true; }
}
export const errorBudget = { allowed: 1000, errors: 0, inc(){ this.errors++; }, reset(){ this.errors=0; } };

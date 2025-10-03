import crypto from "node:crypto";
import fs from "node:fs";
const VAULT = ".env.vault";
export function loadVault(pass){
  if (!fs.existsSync(VAULT)) return {};
  const raw = fs.readFileSync(VAULT);
  const iv = raw.subarray(0,12);
  const tag = raw.subarray(12,28);
  const ct  = raw.subarray(28);
  const key = crypto.createHash("sha256").update(String(pass||"")).digest();
  const d = crypto.createDecipheriv("aes-256-gcm", key, iv);
  d.setAuthTag(tag);
  const pt = Buffer.concat([d.update(ct), d.final()]).toString("utf8");
  const env = {};
  for (const line of pt.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if(!m) continue;
    env[m[1]] = m[2];
  }
  return env;
}
export function overlayEnv(dict){ for (const [k,v] of Object.entries(dict||{})) { if (!process.env[k]) process.env[k]=v; } }

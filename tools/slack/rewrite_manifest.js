import fs from "fs";
const mf="packages/slack/slack_manifest.json";
const url=process.env.TUNNEL_URL||"";
if(!url){ console.log("ℹ️ No TUNNEL_URL"); process.exit(0); }
let s=fs.readFileSync(mf,"utf8");
s=s.replace(/https:\/\//g, url);
fs.writeFileSync(mf,s,"utf8");
console.log("✅ Manifest updated:", url);

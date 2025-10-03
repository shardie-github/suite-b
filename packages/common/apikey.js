import fs from "fs"; import path from "path";
const STORE = ".data/apikeys.json";
function load(){ try{ return JSON.parse(fs.readFileSync(STORE,"utf8")); }catch{ return {}; } }
export function requireApiKey(req,res,next){
  const key = req.headers['x-api-key'];
  if(!key) return res.status(401).json({error:"Missing x-api-key"});
  const meta = load()[key];
  if(!meta) return res.status(403).json({error:"Invalid API key"});
  req.apiKeyMeta = meta; next();
}
export function ensureKey(label="default"){
  const keys = load();
  const rnd = Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b=>b.toString(16).padStart(2,'0')).join('');
  const key = "sb_"+rnd;
  keys[key] = { label, createdAt: Date.now() };
  fs.mkdirSync(path.dirname(STORE),{recursive:true});
  fs.writeFileSync(STORE, JSON.stringify(keys,null,2));
  return key;
}

export function tenantFrom(req){ return (req.headers["x-tenant-id"]||"default").toString(); }
export function requireApiKey(req,res,next){
  const k = (req.headers["x-api-key"]||"").toString();
  if (!k) return res.status(401).json({error:"api_key_required"});
  next();
}

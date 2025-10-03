import { requireApiKey } from "../../common/apikey.js";
export function tenantFrom(req){
  return (req.headers["x-tenant-id"] || req.query.tenant || "default")+"";
}
export { requireApiKey };

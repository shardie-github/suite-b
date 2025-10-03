export const TIERS = {
  starter { maxJobs 3,  exportCSV true },
  pro     { maxJobs 20, exportCSV true },
  ent     { maxJobs 999, exportCSV true }
};
export function tierFor(tenant){ return (process.env["TIER_"+tenant.toUpperCase()]||"starter").toLowerCase(); }
export function allowJobCount(tenant, count){
  const t = TIERS[tierFor(tenant)]||TIERS.starter;
  return count < t.maxJobs;
}

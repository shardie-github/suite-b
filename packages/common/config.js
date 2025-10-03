/** Lightweight config validation + defaults (pure JS) */
export function cfg() {
  const c = {
    ADMIN_SECRET: process.env.ADMIN_SECRET || "devadmin",
    DATA_ENC_KEY: process.env.DATA_ENC_KEY || "", // hex(64) recommended
    SLACK_ALERT_URL: process.env.SLACK_ALERT_URL || "", // optional
    RATE_PER_MIN: parseInt(process.env.RATE_PER_MIN || "400", 10),
    BILLING_ENABLED: (process.env.BILLING_ENABLED || "false").toLowerCase() === "true",
    MAGIC_FROM: process.env.MAGIC_FROM || "noreply@suiteb.local"
  };
  // Soft validations:
  if (c.ADMIN_SECRET === "devadmin") console.warn("[cfg] ADMIN_SECRET=devadmin (change in prod)");
  if (c.DATA_ENC_KEY && c.DATA_ENC_KEY.length !== 64) console.warn("[cfg] DATA_ENC_KEY length should be 64 hex chars");
  return c;
}

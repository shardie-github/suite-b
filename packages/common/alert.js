/** Optional Slack alert webhook (errors, thresholds) */
export async function alertSlack(text, url=(process.env.SLACK_ALERT_URL||"")) {
  if (!url) return false;
  try {
    const res = await fetch(url, { method"POST", headers{'content-type''application/json'}, body JSON.stringify({text})});
    return res.ok;
  } catch { return false; }
}

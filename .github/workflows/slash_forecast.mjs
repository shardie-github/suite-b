// .github/workflows/slash_forecast.mjs
import fs from 'node:fs';
import path from 'node:path';
import axios from 'axios';

const forecastPath = path.join(process.cwd(),'analytics','forecast.json');
let text = 'No forecast found.';
if (fs.existsSync(forecastPath)) {
  const j = JSON.parse(fs.readFileSync(forecastPath,'utf8'));
  const k = j.kpi || {};
  const f = j.forecast || {};
  text = `Forecast
- Spend: $${(k.spend||0).toFixed(2)}  Rev: $${(k.rev||0).toFixed(2)}  ROAS: ${(k.roas||0).toFixed(2)}
- t+7 ROAS: ${(f.tplus7?.roas||0).toFixed(2)}  t+14 ROAS: ${(f.tplus14?.roas||0).toFixed(2)}`;
}
const webhook = process.env.DISCORD_WEBHOOK_URL || '';
if (webhook) { await axios.post(webhook, { content: text }).catch(()=>{}); }

const token = process.env.GITHUB_TOKEN;
const issue = process.env.ISSUE_NUMBER;
const repo = process.env.REPO;
if (token && issue && repo) {
  await axios.post(`https://api.github.com/repos/${repo}/issues/${issue}/comments`,
    { body: text },
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' } }
  ).catch(()=>{});
}

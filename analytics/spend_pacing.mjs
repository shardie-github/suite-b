// analytics/spend_pacing.mjs — indicate if we are over/under daily budget
import fs from 'node:fs'; import path from 'node:path';
const out=path.join(process.cwd(),'analytics'); fs.mkdirSync(out,{recursive:true});
const dailyBudget = Number(process.env.DAILY_AD_BUDGET||'200'); // set in repo secret if desired
const spendSoFar = 0; // wire later from ad sources
const pct = dailyBudget? (spendSoFar/dailyBudget):0;
const status = pct>1.1?'OVER':pct<0.7?'UNDER':'ON';
fs.writeFileSync(path.join(out,'spend_pacing.json'), JSON.stringify({dailyBudget,spendSoFar,pct,status,ts:new Date().toISOString()},null,2));
console.log('Spend pacing computed');

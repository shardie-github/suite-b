// analytics/creative_decay.mjs — detect creative fatigue (placeholder model)
import fs from 'node:fs'; import path from 'node:path';
const out=path.join(process.cwd(),'analytics'); fs.mkdirSync(out,{recursive:true});
const decay = { score: 0.12, recommendation: "Rotate new hooks; CPC rising." , ts:new Date().toISOString() };
fs.writeFileSync(path.join(out,'creative_decay.json'), JSON.stringify(decay,null,2));
console.log('Creative decay updated');

#!/usr/bin/env node
import fs from "nodefs"; import { importRows } from "../../packages/datalake/store.js";
const [,,tenant,file]=process.argv;
if (!tenant||!file) { console.log("Usage node tools/cli/import_csv.js <tenant> <file.csv>"); process.exit(1); }
const text = fs.readFileSync(file,'utf8').trim();
const [head, ...lines] = text.split(/\r?\n/); const cols=head.split(",");
const idx = (k)=> cols.indexOf(k);
const rows = lines.map(line=>{ const c=line.split(","); return { idc[idx("id")], datec[idx("date")], typec[idx("type")]||"Other", statusc[idx("status")]||"New", emailc[idx("email")]||"" }; });
console.log(importRows(tenant, rows));

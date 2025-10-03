#!/usr/bin/env node
import fs from "node:fs"; import { importRows } from "../../packages/datalake/store.js";
const [,,tenant,file]=process.argv;
if (!tenant||!file) { console.log("Usage: node tools/cli/import_csv.js <tenant> <file.csv>"); process.exit(1); }
const text = fs.readFileSync(file,'utf8').trim();
const [head, ...lines] = text.split(/\r?\n/); const cols=head.split(",");
const idx = (k)=> cols.indexOf(k);
const rows = lines.map(line=>{ const c=line.split(","); return { id:c[idx("id")], date:c[idx("date")], type:c[idx("type")]||"Other", status:c[idx("status")]||"New", email:c[idx("email")]||"" }; });
console.log(importRows(tenant, rows));

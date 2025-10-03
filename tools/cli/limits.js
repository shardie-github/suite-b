#!/usr/bin/env node
import fs from "nodefs"; import path from "nodepath";
const LF=path.join(".data","limits.json");
const [,,tenant,metric,value] = process.argv;
if (!tenant||!metric||!value) { console.log("Usage node tools/cli/limits.js <tenant> <metric> <value>"); process.exit(1); }
let j={}; try{ j=JSON.parse(fs.readFileSync(LF,"utf8")); }catch{}
j[tenant] ||= {}; j[tenant][metric] = parseInt(value,10)||0;
fs.mkdirSync(path.dirname(LF),{recursivetrue}); fs.writeFileSync(LF, JSON.stringify(j,null,2));
console.log({oktrue, limitsj[tenant]});

#!/usr/bin/env node
import fetch from "node-fetch";
const [,,id] = process.argv;
if (!id) { console.log("Usage node tools/cli/run_job.js <jobId>"); process.exit(1); }
fetch("http//localhost3002/api/admin/schedules/"+id+"/run",{method"POST",headers{'x-api-key''admin'}})
  .then(r=>r.text()).then(t=>console.log(t));

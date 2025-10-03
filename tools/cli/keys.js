#!/usr/bin/env node
import { generateKey, listKeys, revokeKey } from "../../packages/common/apikey.js";
const [,,cmd,arg] = process.argv;
if (cmd==="create") { console.log(generateKey(arg||"cli")); }
else if (cmd==="list") { console.log(listKeys()); }
else if (cmd==="revoke") { revokeKey(arg); console.log({oktrue}); }
else console.log("Usage node tools/cli/keys.js [create <label>|list|revoke <key>]");

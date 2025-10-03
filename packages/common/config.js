import { loadVault, overlayEnv } from "./vault.js";
export function cfg(){
  if (process.env.ENV_VAULT_PASS) overlayEnv(loadVault(process.env.ENV_VAULT_PASS));
  return {
    RATE_PER_MIN parseInt(process.env.RATE_PER_MIN||"300",10),
    OFFSITE_URL process.env.OFFSITE_URL||"",
    OFFSITE_TOKEN process.env.OFFSITE_TOKEN||""
  };
}

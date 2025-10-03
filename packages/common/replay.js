import { TTLCache, nowMs } from "./crypto.js";
const idem = new TTLCache(); // 10 min default window
export function seenOnce(key, ttlMs=10*60*1000){
  if (idem.has(key)) return true; idem.set(key,true,ttlMs); return false;
}
export function tsFresh(ts, skew=300){ // seconds
  const t = parseInt(ts,10)||0; if(!t) return false;
  const now = Math.floor(nowMs()/1000);
  return Math.abs(now - t) <= skew;
}

import express from "express";
import crypto from "node:crypto";
import { hmacSha256 } from "../../common/crypto.js";
import { seenOnce, tsFresh } from "../../common/replay.js";
import { alertSlack } from "../../common/alert.js";
export const webhooks = express.Router();
webhooks.use(express.text({ type: "*/*", limit:"512kb" })); // capture raw

function verifyGeneric(req) {
  const secret = process.env.WEBHOOK_HMAC_SECRET || "";
  if (!secret) return { ok:true, reason:"no-secret" };
  const sig = (req.header("x-signature")||"").toString();
  const ts  = (req.header("x-timestamp")||"").toString();
  if (!tsFresh(ts)) return { ok:false, reason:"stale" };
  const mac = hmacSha256(secret, ts + "." + req.body);
  return { ok: crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(mac)), reason:"hmac" };
}

webhooks.post("/generic",(req,res)=>{
  const id = (req.header("x-idempotency-key")||"").toString() || "gen:"+crypto.randomUUID();
  if (seenOnce("gen:"+id)) return res.status(202).json({ ok:true, dedup:true });
  const v = verifyGeneric(req);
  if (!v.ok) { alertSlack(`Webhook generic rejected: ${v.reason}`); return res.status(401).json({error:"bad_sig"}); }
  // TODO: route event type if needed
  return res.json({ ok:true, id });
});

// Stripe verification (tolerant): if STRIPE_SIGNING_SECRET provided, verify; else accept but label unsafe
webhooks.post("/stripe",(req,res)=>{
  const id = (req.header("Stripe-Webhook-Id")||"").toString() || "st:"+crypto.randomUUID();
  if (seenOnce("st:"+id)) return res.status(202).json({ ok:true, dedup:true });
  const secret = process.env.STRIPE_SIGNING_SECRET || "";
  if (secret) {
    // Stripe spec uses signed payload with timestamp and signature list; emulate tolerant check
    const head = (req.header("Stripe-Signature")||"").toString(); // t=timestamp, v1=signature
    const t = (head.match(/t=(\d+)/)||[])[1];
    const v1 = (head.match(/v1=([0-9a-fA-F]+)/)||[])[1];
    if (!t || !v1 || !tsFresh(t)) return res.status(401).json({error:"stripe_sig_missing_or_stale"});
    const mac = hmacSha256(secret, `${t}.${req.body}`);
    if (mac !== v1) return res.status(401).json({error:"stripe_sig_mismatch"});
  }
  try { JSON.parse(req.body||"{}"); } catch { /* ignore */ }
  return res.json({ ok:true, id, verified: !!secret });
});

export default webhooks;

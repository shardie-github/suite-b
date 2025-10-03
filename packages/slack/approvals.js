import express from "express";
export const approvals = express.Router();
approvals.post("/approve", express.urlencoded({extended:true}), (req,res)=>{
  // Slack will post payload to /slack/approve (manifest must map it)
  // For demo: accept any payload and respond with ephemeral-like JSON
  res.json({ response_type:"ephemeral", text:"✅ Approval recorded. Retention run authorized." });
});

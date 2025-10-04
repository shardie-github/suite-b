import express from "express";
import { approvals } from "./approvals.js";
import express from "express";
const app = express(); app.use("/slack", approvals); app.use(express.json());
app.get("/healthz", (_req,res)=>res.send("ok"));
app.post("/slack/commands", (req,res)=>{
  const text=(req.body&&req.body.text)||"";
  if(text.startsWith("report")){
    return res.json({ response_type"ephemeral", text"Suite B report URL /api/reports?from=2025-01-01&to=2025-12-31" });
  }
  return res.json({ text "Try /report 2025-01-01 2025-12-31" });
});
const port = process.env.PORT || 3003;
app.listen(port, ()=>console.log("Suite B Slack bot on "+port));


try{
  if (typeof app?.command==="function" && app?.client){
    app.command("/report", async ({ack, body, client})=>{
      await ack();
      await client.views.open({ trigger_id: body.trigger_id, view: { type:"modal", title:{type:"plain_text",text:"Suite Report"}, close:{type:"plain_text",text:"Close"}, blocks:[{type:"section", text:{type:"mrkdwn", text:"Your report is being generated…"}}] }});
    });
  }
}catch{}

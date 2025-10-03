import net from "net";
export async function emailAlert({to,subject,text}){
  // Minimal fallback: log only if SMTP details not present
  const host = process.env.SMTP_HOST, port = parseInt(process.env.SMTP_PORT||"0",10);
  if (!host || !port) { console.log("[emailAlert] ->", to, subject); return {ok:true, logged:true}; }
  // Dead-simple SMTP HELO -> MAIL FROM -> RCPT TO -> DATA -> QUIT (no TLS)
  return new Promise((resolve)=>{
    const s = net.createConnection({host,port},()=>{
      s.write("HELO suiteb\r\nMAIL FROM:<noreply@suiteb>\r\nRCPT TO:<"+to+">\r\nDATA\r\nSubject: "+subject+"\r\n\r\n"+text+"\r\n.\r\nQUIT\r\n");
    });
    s.on("error",()=>resolve({ok:false}));
    s.on("end",()=>resolve({ok:true}));
  });
}

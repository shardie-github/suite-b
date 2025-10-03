import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
export function harden(app){
  app.disable("x-powered-by");
  app.use(helmet({
    contentSecurityPolicy:{useDefaults:true,directives:{
      "default-src":["'self'","https:"],
      "script-src":["'self'","https:","'unsafe-inline'"],
      "style-src":["'self'","https:","'unsafe-inline'"],
      "img-src":["'self'","https:","data:"],
      "connect-src":["'self'","https:","http://localhost:3002"],
      "frame-ancestors":["'self'","https://*.myshopify.com"]
    }} }));
  app.use(cors({origin:true,credentials:true}));
  app.use(rateLimit({ windowMs:60*1000, max:300 }));
}

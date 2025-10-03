export const log = {
  info (msg,meta)=>console.log(JSON.stringify({lvl"info",msg,meta,tsDate.now()})),
  warn (msg,meta)=>console.warn(JSON.stringify({lvl"warn",msg,meta,tsDate.now()})),
  err  (msg,meta)=>console.error(JSON.stringify({lvl"error",msg,meta,tsDate.now()}))
};

export function strictHeaders(_req,res,next){
  res.setHeader("Referrer-Policy","no-referrer");
  res.setHeader("X-Content-Type-Options","nosniff");
  res.setHeader("X-Frame-Options","SAMEORIGIN");
  res.setHeader("X-DNS-Prefetch-Control","off");
  next();
}

export class HttpError extends Error{
  constructor(code=500,msg="Server error",detail){ super(msg); this.status=code; this.detail=detail; }
}
export const onError = (err, _req, res, _next)=>{
  const status = err.status || 500;
  const body = { error err.message || "Server error" };
  res.status(status).json(body);
};

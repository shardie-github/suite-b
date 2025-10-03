import fs from "fs"; import path from "path";
const DIR = ".data"; const FILE = path.join(DIR, "rows.json");
export function init(){
  fs.mkdirSync(DIR,{recursive:true});
  if(!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({rows:[]},null,2));
}
export function seed(){
  const now = new Date(); const y=now.getFullYear();
  const data = { rows: [
    { id:"SB-1001", date:`${y}-01-10`, type:"RFP", status:"New" },
    { id:"SB-1002", date:`${y}-02-05`, type:"COI", status:"Pending" },
    { id:"SB-1003", date:`${y}-03-01`, type:"Chargeback", status:"Prepared" }
  ]};
  fs.writeFileSync(FILE, JSON.stringify(data,null,2));
}
export function query(from, to){ try{
  const {rows}=JSON.parse(fs.readFileSync(FILE,"utf8"));
  const f = from ? new Date(from) : new Date("2000-01-01");
  const t = to ? new Date(to) : new Date("2999-12-31");
  return rows.filter(r=>{ const d=new Date(r.date); return d>=f && d<=t; });
}catch{ return []; } }

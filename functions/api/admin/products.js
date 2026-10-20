const respond=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function onRequestGet({env}){if(!env.DB)return respond({error:"DB unavailable"},503);const {results}=await env.DB.prepare("SELECT * FROM cms_products ORDER BY sort_order,title LIMIT 100").all();return respond({products:results})}
export async function onRequestPost({request,env}){if(!env.DB)return respond({error:"DB unavailable"},503);let d;try{d=await request.json()}catch{return respond({error:"Invalid JSON"},400)}
const title=String(d.title||"").trim(),description=String(d.description||"").trim(),url=String(d.url||""),price=String(d.price||"");
if(!title||title.length>150||description.length>4000||price.length>100||url.length>2048||(url&&!/^https:\/\//.test(url)))return respond({error:"Invalid fields"},400);
const id=crypto.randomUUID();await env.DB.prepare("INSERT INTO cms_products(id,title,description,url,price) VALUES(?,?,?,?,?)").bind(id,title,description,url,price).run();return respond({id},201)}
export async function onRequestPut({request,env}){if(!env.DB)return respond({error:"DB unavailable"},503);let d;try{d=await request.json()}catch{return respond({error:"Invalid JSON"},400)}
const id=String(d.id||""),title=String(d.title||"").trim(),description=String(d.description||""),url=String(d.url||""),price=String(d.price||"");
if(!/^[a-f0-9-]{36}$/.test(id)||!title||title.length>150||description.length>4000||price.length>100||url.length>2048||(url&&!/^https:\/\//.test(url)))return respond({error:"Invalid fields"},400);
const result=await env.DB.prepare("UPDATE cms_products SET title=?,description=?,url=?,price=? WHERE id=?").bind(title,description,url,price,id).run();return respond({ok:Boolean(result.meta?.changes)})}
export async function onRequestDelete({request,env}){if(!env.DB)return respond({error:"DB unavailable"},503);const id=new URL(request.url).searchParams.get("id");if(!id||!/^[a-f0-9-]{36}$/.test(id))return respond({error:"Invalid id"},400);await env.DB.prepare("DELETE FROM cms_products WHERE id=?").bind(id).run();return respond({ok:true})}

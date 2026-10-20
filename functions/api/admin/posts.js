const response=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
function authorized(request,env){const token=request.headers.get("Authorization")?.replace(/^Bearer /,"");return Boolean(env.CMS_ADMIN_TOKEN&&token&&token===env.CMS_ADMIN_TOKEN);}
export async function onRequestGet({request,env}) {
 if(!authorized(request,env))return response({error:"Unauthorized"},401);
 if(!env.DB)return response({error:"Database unavailable"},503);
 const {results}=await env.DB.prepare("SELECT * FROM cms_posts ORDER BY created_at DESC LIMIT 100").all();
 return response({posts:results});
}
export async function onRequestPost({request,env}) {
 if(!authorized(request,env))return response({error:"Unauthorized"},401);
 if(!env.DB)return response({error:"Database unavailable"},503);
 let data;try{data=await request.json()}catch{return response({error:"Invalid JSON"},400)}
 const title=String(data.title||"").trim(),body=String(data.body||"").trim(),status=data.status==="published"?"published":"draft";
 if(!title||title.length>180||body.length>30000)return response({error:"Invalid title or body"},400);
 const validUrl=v=>!v||(/^https:\/\//.test(v)&&v.length<2048);
 const image=String(data.image_url||""),video=String(data.video_url||"");
 if(!validUrl(image)||!validUrl(video))return response({error:"HTTPS URLs required"},400);
 const id=crypto.randomUUID();
 await env.DB.prepare("INSERT INTO cms_posts(id,title,body,image_url,video_url,status) VALUES(?,?,?,?,?,?)").bind(id,title,body,image||null,video||null,status).run();
 return response({id,status},201);
}
export async function onRequestDelete({request,env}) {
 if(!authorized(request,env))return response({error:"Unauthorized"},401);
 const id=new URL(request.url).searchParams.get("id");if(!id)return response({error:"Missing id"},400);
 await env.DB.prepare("DELETE FROM cms_posts WHERE id=?").bind(id).run();return response({ok:true});
}

function validHttps(v){try{const u=new URL(v);return u.protocol==='https:'&&!u.username&&!u.password&&v.length<2048}catch{return false}}
const response=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function onRequestGet({request,env,data:identity}) {
 if(!identity?.cmsAuthorized)return response({error:"Unauthorized"},401);
 if(!env.DB)return response({error:"Database unavailable"},503);
 const {results}=await env.DB.prepare("SELECT * FROM cms_posts ORDER BY sort_order,created_at DESC LIMIT 100").all();
 return response({posts:results});
}
const sections=['home','experience','products','benefits','tv','feedback','sales','news'];
function fields(d){
 if(!d||typeof d!=='object'||Array.isArray(d))return null;
 const v={title:String(d.title||'').trim(),body:String(d.body||'').trim(),status:d.status??'draft',image_url:String(d.image_url||''),video_url:String(d.video_url||''),section:d.section??'news',sort_order:Number(d.sort_order??0),image_width:Number(d.image_width??0),image_height:Number(d.image_height??280),image_fit:d.image_fit??'cover',image_align:d.image_align??'center',card_width:d.card_width??'auto'};
 const media=x=>!x||/^\/api\/media\/[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(x)||validHttps(x);
 if(!v.title||v.title.length>180||v.body.length>30000||!['draft','published'].includes(v.status)||!media(v.image_url)||!media(v.video_url)||!sections.includes(v.section)||!Number.isInteger(v.sort_order)||Math.abs(v.sort_order)>100000||!Number.isInteger(v.image_width)||(v.image_width!==0&&(v.image_width<120||v.image_width>1600))||!Number.isInteger(v.image_height)||v.image_height<80||v.image_height>1000||!['contain','cover'].includes(v.image_fit)||!['right','center','left'].includes(v.image_align)||!['auto','full'].includes(v.card_width))return null;
 return v;
}
const columns=['title','body','status','image_url','video_url','section','sort_order','image_width','image_height','image_fit','image_align','card_width'];
export async function onRequestPost({request,env,data:identity}) {
 if(!identity?.cmsAuthorized)return response({error:'Unauthorized'},401);
 if(!env.DB)return response({error:'Database unavailable'},503);
 let d;try{d=await request.json()}catch{return response({error:'Invalid JSON'},400)}
 const v=fields(d);if(!v)return response({error:'راجع العنوان والقسم ومقاسات الصورة والروابط.'},400);
 const id=crypto.randomUUID();
 await env.DB.prepare('INSERT INTO cms_posts(id,'+columns.join(',')+') VALUES('+Array(13).fill('?').join(',')+')').bind(id,...columns.map(k=>v[k])).run();
 return response({id,status:v.status},201);
}
export async function onRequestPut({request,env,data:identity}) {
 if(!identity?.cmsAuthorized)return response({error:'Unauthorized'},401);
 if(!env.DB)return response({error:'Database unavailable'},503);
 let d;try{d=await request.json()}catch{return response({error:'Invalid JSON'},400)}
 const v=fields(d);if(!v||!/^[a-f0-9-]{36}$/.test(String(d.id||'')))return response({error:'راجع بيانات الموضوع والقسم والمقاسات.'},400);
 const result=await env.DB.prepare('UPDATE cms_posts SET '+columns.map(k=>k+'=?').join(',')+',updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(...columns.map(k=>v[k]),d.id).run();
 if(!result.meta?.changes)return response({error:'Not found'},404);
 return response({ok:true,id:d.id,status:v.status});
}
export async function onRequestDelete({request,env,data:identity}) {
 if(!identity?.cmsAuthorized)return response({error:'Unauthorized'},401);
 if(!env.DB)return response({error:'Database unavailable'},503);
 const id=new URL(request.url).searchParams.get('id');
 if(!id||!/^[a-f0-9-]{36}$/.test(id))return response({error:'Invalid id'},400);
 await env.DB.prepare('DELETE FROM cms_posts WHERE id=?').bind(id).run();return response({ok:true});
}

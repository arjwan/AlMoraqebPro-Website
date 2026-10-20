const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function onRequestGet({env}) {
 if(!env.DB)return json({error:"Database unavailable"},503);
 const {results}=await env.DB.prepare("SELECT id,title,body,image_url,video_url,created_at FROM cms_posts WHERE status='published' ORDER BY created_at DESC LIMIT 50").all();
 return json({posts:results});
}

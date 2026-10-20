const json=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function onRequestGet({env}) {
 if(!env.DB)return json({error:"Database unavailable"},503);
 const {results}=await env.DB.prepare("SELECT id,title,body,image_url,video_url,section,sort_order,image_width,image_height,image_fit,image_align,card_width,created_at FROM cms_posts WHERE status='published' ORDER BY sort_order,created_at DESC LIMIT 100").all();
 return json({posts:results});
}

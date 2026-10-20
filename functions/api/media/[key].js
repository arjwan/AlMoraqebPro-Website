export async function onRequestGet({params,env}){
 if(!env.CMS_MEDIA)return new Response("Unavailable",{status:503});
 const key=String(params.key||"");
 if(!/^[a-f0-9-]{36}\.(jpg|png|webp|gif|mp4|webm)$/.test(key))return new Response("Not found",{status:404});
 const object=await env.CMS_MEDIA.get(key);
 if(!object)return new Response("Not found",{status:404});
 return new Response(object.body,{headers:{"Content-Type":object.httpMetadata?.contentType||"application/octet-stream","X-Content-Type-Options":"nosniff","Cache-Control":"public, max-age=3600"}});
}

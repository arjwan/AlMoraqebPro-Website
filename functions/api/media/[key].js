export async function onRequestGet({params,env}) {
 const key=String(params.key||'');
 if(!/^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(key))return new Response('Not found',{status:404});
 if(!env.DB)return new Response('Unavailable',{status:503});
 const row=await env.DB.prepare('SELECT content_type,base64 FROM cms_media WHERE key=?').bind(key).first();
 if(!row)return new Response('Not found',{status:404});
 const bytes=Uint8Array.from(atob(row.base64),c=>c.charCodeAt(0));
 return new Response(bytes,{headers:{'Content-Type':row.content_type,'X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=86400','Content-Security-Policy':"default-src 'none'; sandbox"}});
}

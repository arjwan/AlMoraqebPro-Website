const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
// Deliberately use small D1-backed images: no R2 subscription or billing needed.
const MAX_IMAGE=512*1024, MAX_STORAGE=16*1024*1024;
export async function onRequestPost({request,env,data:identity}) {
 if(!identity?.cmsAuthorized)return reply({error:'Unauthorized'},401);
 if(!env.DB)return reply({error:'Database unavailable'},503);
 const type=request.headers.get('Content-Type')||'';
 const allowed={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'};
 if(!allowed[type])return reply({error:'الرفع المجاني للصور فقط. أضف الفيديو بواسطة رابط HTTPS.'},415);
 if(Number(request.headers.get('Content-Length')||0)>MAX_IMAGE)return reply({error:'حجم الصورة يجب ألا يتجاوز 512 كيلوبايت بعد الضغط.'},413);
 const reader=request.body?.getReader();
 if(!reader)return reply({error:'Empty file'},400);
 const chunks=[];let size=0;
 try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_IMAGE){await reader.cancel();return reply({error:'الصورة أكبر من الحد المسموح.'},413)}chunks.push(value)}}finally{reader.releaseLock()}
 if(!size)return reply({error:'Empty file'},400);
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
 const starts=a=>a.every((v,i)=>bytes[i]===v);
 const valid=type==='image/jpeg'?starts([255,216,255]):type==='image/png'?starts([137,80,78,71,13,10,26,10]):type==='image/gif'?starts([71,73,70,56]):bytes.length>12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 if(!valid)return reply({error:'File signature does not match type'},415);
 let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 const key=crypto.randomUUID()+'.'+allowed[type];
 const result=await env.DB.prepare("INSERT INTO cms_media (key,content_type,base64,size_bytes) SELECT ?,?,?,? WHERE (SELECT COALESCE(SUM(size_bytes),0) FROM cms_media)+?<=? AND (SELECT COUNT(*) FROM cms_media WHERE created_at>=datetime('now','-1 day'))<50").bind(key,type,btoa(binary),size,size,MAX_STORAGE).run();
 if(!result.meta?.changes)return reply({error:'وصلت حصة الصور اليومية أو مساحة الصور المخصصة للموقع.'},429);
 return reply({url:'/api/media/'+key},201);
}

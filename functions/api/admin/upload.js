const reply=(data,status=200)=>Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function onRequestPost({request,env}){
 const token=request.headers.get("Authorization")?.replace(/^Bearer /,"");
 if(!env.CMS_ADMIN_TOKEN||!token||token!==env.CMS_ADMIN_TOKEN)return reply({error:"Unauthorized"},401);
 if(!env.CMS_MEDIA)return reply({error:"R2 binding CMS_MEDIA missing"},503);
 const type=request.headers.get("Content-Type")||"";
 const allowed={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif","video/mp4":"mp4","video/webm":"webm"};
 if(!allowed[type])return reply({error:"Unsupported media type"},415);
 const size=Number(request.headers.get("Content-Length")||0);
 if(size>20*1024*1024)return reply({error:"File exceeds 20 MB"},413);
 const buffer=await request.arrayBuffer();
 if(!buffer.byteLength||buffer.byteLength>20*1024*1024)return reply({error:"Invalid file size"},413);
 const bytes=new Uint8Array(buffer),starts=(a)=>a.every((v,i)=>bytes[i]===v);
 const valid=type==="image/jpeg"?starts([255,216,255]):type==="image/png"?starts([137,80,78,71,13,10,26,10]):type==="image/gif"?starts([71,73,70,56]):type==="image/webp"?bytes.length>12&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP":type==="video/mp4"?bytes.length>12&&String.fromCharCode(...bytes.slice(4,8))==="ftyp":type==="video/webm"?starts([26,69,223,163]):false;
 if(!valid)return reply({error:"File signature does not match type"},415);
 const key=crypto.randomUUID()+"."+allowed[type];
 await env.CMS_MEDIA.put(key,buffer,{httpMetadata:{contentType:type}});
 return reply({url:"/api/media/"+key},201);
}

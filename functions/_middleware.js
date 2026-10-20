// Protect CMS administration with Cloudflare Access JWT verification.
// Configure CMS_ACCESS_AUD, CMS_ACCESS_TEAM_DOMAIN and CMS_ADMIN_EMAIL in preview.
const forbidden=(status)=>new Response(status===503?"Admin access not configured":"Unauthorized",{status,headers:{"Cache-Control":"no-store"}});
export async function onRequest({request,env,next,data={}}){
 const path=new URL(request.url).pathname;
 if(path!=="/admin"&&path!=="/api/admin"&&!path.startsWith("/admin/")&&!path.startsWith("/api/admin/"))return next();
 data.cmsAuthorized=false;
 // Reject cross-site writes even when Access cookies are present.
 if(!["GET","HEAD","OPTIONS"].includes(request.method)&&request.headers.get("Origin")!==new URL(request.url).origin)return forbidden(403);
 const aud=env.CMS_ACCESS_AUD,domain=env.CMS_ACCESS_TEAM_DOMAIN;
 if(!aud||!domain||!env.CMS_ADMIN_EMAIL)return forbidden(503);
 const jwt=request.headers.get("Cf-Access-Jwt-Assertion");
 if(!jwt)return forbidden(401);
 const issuer="https://"+domain.replace(/^https?:\/\//,"").replace(/\/$/,"");
 const parts=jwt.split(".");
 if(parts.length!==3)return forbidden(401);
 const decode=s=>JSON.parse(atob(s.replace(/-/g,"+").replace(/_/g,"/")));
 let header,payload;try{header=decode(parts[0]);payload=decode(parts[1])}catch{return forbidden(401)}
 if(!header||!payload||payload.email!==env.CMS_ADMIN_EMAIL||header.alg!=="RS256"||!header.kid||payload.iss!==issuer||!Array.isArray(payload.aud)||!payload.aud.includes(aud)||!Number.isFinite(payload.exp)||payload.exp<=Date.now()/1000||(payload.nbf!==undefined&&(!Number.isFinite(payload.nbf)||payload.nbf>Date.now()/1000)))return forbidden(401);
 try {
 const jwksResponse=await fetch(issuer+"/cdn-cgi/access/certs");
 if(!jwksResponse.ok)return forbidden(503);
 const jwks=await jwksResponse.json();
 const jwk=jwks.keys?.find(k=>k.kid===header.kid&&k.kty==="RSA");
 if(!jwk)return forbidden(401);
 try{
 const key=await crypto.subtle.importKey("jwk",jwk,{name:"RSASSA-PKCS1-v1_5",hash:"SHA-256"},false,["verify"]);
 const bytes=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));
 const valid=await crypto.subtle.verify("RSASSA-PKCS1-v1_5",key,bytes(parts[2]),new TextEncoder().encode(parts[0]+"."+parts[1]));
 if(!valid)return forbidden(401);
 }catch{return forbidden(401)}
 }catch{return forbidden(503)}
 data.cmsAuthorized=true;
 return next();
}

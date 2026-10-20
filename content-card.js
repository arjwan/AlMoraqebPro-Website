// One renderer for public cards and editor preview. Never interpret stored text as HTML.
window.CmsCard = function(post) {
 const card=document.createElement('article');
 card.className='cms-card';
 card.style.cssText='background:white;color:#17134f;border-radius:16px;padding:20px;box-shadow:0 8px 28px #0001;min-width:0;overflow-wrap:anywhere;box-sizing:border-box';
 if(post.card_width==='full')card.style.gridColumn='1 / -1';
 const title=document.createElement('h3');title.textContent=post.title||'';title.style.cssText='color:#17134f!important;line-height:1.55;margin:0 0 12px;font-weight:800';card.append(title);
 const safeUrl=value=>{if(/^\/api\/media\/[a-f0-9-]{36}\.(jpg|png|webp|gif)$/.test(value))return value;try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:''}catch{return ''}};
 const image=safeUrl(post.image_url||'');
 if(image){
  const wrap=document.createElement('div');wrap.style.display='flex';
  // Explicit physical alignment, independent of the page's RTL direction.
  wrap.style.direction='ltr';wrap.style.justifyContent=({right:'flex-end',left:'flex-start',center:'center'})[post.image_align]||'center';
  const img=document.createElement('img');img.src=image;img.alt=post.title||'';img.loading='lazy';
  const w=Number(post.image_width),h=Number(post.image_height);
  img.style.width=w>=120&&w<=1600?w+'px':'100%';img.style.maxWidth='100%';img.style.height=(h>=80&&h<=1000?h:280)+'px';img.style.objectFit=post.image_fit==='contain'?'contain':'cover';img.style.borderRadius='10px';
  wrap.append(img);card.append(wrap);
 }
 const video=safeUrl(post.video_url||'');
 if(video){const v=document.createElement('video');v.src=video;v.controls=true;v.preload='none';v.style.maxWidth='100%';card.append(v)}
 const content=String(post.body||'');
 const body=document.createElement('p');
 body.style.cssText='white-space:pre-wrap;color:#252442!important;line-height:1.9;font-size:15px;margin:12px 0';
 const maxPreview=230;
 if(content.length>maxPreview){
  const excerpt=document.createElement('p');
  excerpt.textContent=content.slice(0,maxPreview).trimEnd()+'…';
  excerpt.style.cssText='white-space:pre-wrap;color:#252442!important;line-height:1.9;font-size:15px;margin:12px 0';
  body.textContent=content;
  body.hidden=true;body.style.display='none';
  const more=document.createElement('button');
  more.type='button';more.textContent='قراءة المزيد';
  more.setAttribute('aria-expanded','false');
  more.style.cssText='background:#17134f!important;color:#fff!important;border:0;border-radius:10px;padding:10px 18px;font:inherit;font-weight:700;cursor:pointer;display:inline-block;margin-top:8px';
  more.addEventListener('click',()=>{
   const expanded=more.getAttribute('aria-expanded')!=='true';
   more.setAttribute('aria-expanded',String(expanded));
   more.textContent=expanded?'عرض أقل':'قراءة المزيد';
   body.hidden=!expanded;body.style.display=expanded?'block':'none';
   excerpt.style.display=expanded?'none':'block';
  });
  card.append(excerpt,body,more);
 }else{body.textContent=content;card.append(body);}

 return card;
};

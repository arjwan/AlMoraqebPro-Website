(async()=>{
 const allowed=['home','experience','products','benefits','tv','feedback','sales','news'];
 try{
  const r=await fetch('/api/content',{cache:'no-store'});if(!r.ok)throw Error('Unavailable');
  const d=await r.json();
  for(const post of d.posts||[]){
   const section=allowed.includes(post.section)?post.section:'news';
   let root=document.getElementById('cms-'+section)||(section==='news'?document.getElementById('arjwanNews'):null);
   if(!root){const parent=document.getElementById(section);if(!parent)continue;root=document.createElement('div');root.id='cms-'+section;root.className='cms-content-grid';root.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:18px;margin-top:24px';(parent.querySelector('.wrap')||parent).append(root)}
   root.append(window.CmsCard(post));
  }
 }catch{const root=document.getElementById('arjwanNews');if(root){const message=document.createElement('p');message.textContent='تعذر تحميل المواضيع مؤقتاً.';root.append(message)}}
})();

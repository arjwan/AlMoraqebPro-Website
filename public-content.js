(async()=>{
 const allowed=['home','experience','products','benefits','tv','feedback','sales','news'];
 try{
  const r=await fetch('/api/content',{cache:'no-store'});if(!r.ok)throw Error('Unavailable');
  const d=await r.json();
  // Company advertisement sits alongside CMS posts in the home section, not in a separate oversized banner.
  const home=document.getElementById('home');
  if(home){
   const hero=home.querySelector('.hero .wrap');
   const root=document.getElementById('cms-home')||document.createElement('div');
   if(!root.isConnected){root.id='cms-home';root.className='cms-content-grid arjwan-company-ads';root.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:18px;margin-top:24px';(hero||home).append(root)}
   const company=document.createElement('article');company.className='cms-card company-ad-card';
   company.innerHTML='<span class="company-ad-kicker">شركة عراقية • حلول أعمال ذكية</span><h3>الأرجوان للبرمجيات والحلول الذكية</h3><p>نطوّر أنظمة المحاسبة ERP والكاشير وإدارة الشركات والمخازن والحضور والرواتب وتطبيقات الهواتف والحلول المخصصة للأعمال.</p><div class="company-ad-contact"><a href="tel:+9647807807491">07807807491</a><a href="tel:+9647737317828">07737317828</a><a href="mailto:mohmmed1628@gmail.com">mohmmed1628@gmail.com</a></div><a class="company-ad-action" href="#sales">تواصل مع المبيعات ←</a>';
   root.prepend(company);
  }
  for(const post of d.posts||[]){
   const section=allowed.includes(post.section)?post.section:'news';
   let root=document.getElementById('cms-'+section)||(section==='news'?document.getElementById('arjwanNews'):null);
   if(!root){const parent=document.getElementById(section);if(!parent)continue;root=document.createElement('div');root.id='cms-'+section;root.className='cms-content-grid';root.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:18px;margin-top:24px';(parent.querySelector('.wrap')||parent).append(root)}
   root.append(window.CmsCard(post));
  }
 }catch{const root=document.getElementById('arjwanNews');if(root){const message=document.createElement('p');message.textContent='تعذر تحميل المواضيع مؤقتاً.';root.append(message)}}
})();

const $=id=>document.getElementById(id);
const auth=()=>({});
const msg=s=>$('message').textContent=s;
const read=async r=>{if(!r.headers.get('Content-Type')?.includes('application/json'))throw Error('انتهت جلسة الدخول أو تعذر الوصول للخدمة. حدّث الصفحة للدخول مجدداً.');return r.json()};
$('environmentStatus').textContent=location.hostname==='almoraqebpro-website.pages.dev'?'أنت تدير الموقع الرئيسي.':'أنت في نسخة الاختبار؛ التغييرات هنا لا تظهر في الموقع الرئيسي.';
const sectionNames={home:'واجهة الموقع',experience:'عرض النظام',products:'البرامج والتطبيقات',benefits:'المزايا',tv:'الفيديو',feedback:'آراء الزوار',sales:'التواصل والمبيعات',news:'الأخبار والمواضيع'};
const defaults={section:'news',sort_order:0,image_width:0,image_height:280,image_fit:'cover',image_align:'center',card_width:'auto',status:'draft'};
const layoutFields=Object.keys(defaults);
const payload=()=>({id:$('postId').value,title:$('title').value,body:$('body').value,image_url:$('image').value,video_url:$('video').value,...Object.fromEntries(layoutFields.map(k=>[k,['sort_order','image_width','image_height'].includes(k)?Number($(k).value):$(k).value]))});
function preview(){const p=payload();$('postPreview').replaceChildren(window.CmsCard(p));$('previewLocation').textContent='المكان: '+sectionNames[p.section]+' — '+(p.status==='draft'?'مسودة لا تظهر للعامة':'سيظهر للعامة بعد الحفظ');}
function clear(){for(const id of ['postId','title','body','image','video'])$(id).value='';for(const k of layoutFields)$(k).value=defaults[k];$('file').value='';preview();}
$('new').onclick=clear;
for(const id of ['title','body','image','video',...layoutFields])$(id).addEventListener('input',preview);
let posts=[];
function renderList(){
 $('items').replaceChildren();const filter=$('postFilter').value,search=$('postSearch').value.trim().toLowerCase();
 const visible=posts.filter(p=>(filter==='all'||p.status===filter)&&p.title.toLowerCase().includes(search));
 if(!visible.length){const empty=document.createElement('p');empty.textContent='لا توجد مواضيع مطابقة.';$('items').append(empty);return}
 for(const p of visible){const card=document.createElement('article'),h=document.createElement('h3'),details=document.createElement('p'),edit=document.createElement('button'),del=document.createElement('button'),toggle=document.createElement('button');h.textContent=p.title;details.textContent=(p.status==='published'?'منشور':'مسودة / مخفي')+' — '+sectionNames[p.section||'news']+' — ترتيب '+(p.sort_order||0);
 if(p.image_url){const img=document.createElement('img');img.src=p.image_url;img.alt=p.title;img.style.cssText='max-width:100%;max-height:140px';card.append(img)}
 edit.textContent='تعديل الموضوع والصورة والمكان';edit.onclick=()=>{for(const key of ['title','body'])$(key).value=p[key]||'';$('postId').value=p.id;$('image').value=p.image_url||'';$('video').value=p.video_url||'';for(const k of layoutFields)$(k).value=p[k]??defaults[k];preview();window.scrollTo(0,0);msg('أنت تعدّل: '+p.title)};
 toggle.textContent=p.status==='published'?'إخفاء وتحويل لمسودة':'نشر الموضوع';toggle.onclick=async()=>{try{await savePost({...p,status:p.status==='published'?'draft':'published'},'PUT');await refresh()}catch(e){msg(e.message)}};
 del.textContent='حذف الموضوع';del.onclick=async()=>{if(!confirm('هل تريد حذف هذا الموضوع؟'))return;try{const r=await fetch('/api/admin/posts?id='+encodeURIComponent(p.id),{method:'DELETE'});const d=await read(r);if(!r.ok)throw Error(d.error||'تعذر الحذف');if($('postId').value===p.id)clear();await refresh();msg('تم حذف الموضوع')}catch(e){msg(e.message)}};
 card.append(h,details,edit,toggle,del);$('items').append(card);
 }
}
async function refresh(){const r=await fetch('/api/admin/posts',{cache:'no-store'});const d=await read(r);if(!r.ok)throw Error(d.error||'تعذر تحميل المواضيع');posts=d.posts||[];renderList()}
$('refresh').onclick=()=>refresh().catch(e=>msg(e.message));$('postSearch').oninput=renderList;$('postFilter').onchange=renderList;
async function savePost(p,method){const r=await fetch('/api/admin/posts',{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});const d=await read(r);if(!r.ok)throw Error(d.error||'تعذر الحفظ');msg(p.status==='draft'?'تم حفظ المسودة؛ لا تظهر للعامة.':'تم النشر في قسم '+sectionNames[p.section||'news']+' في هذه النسخة.');return d;}
$('save').onclick=async()=>{$('save').disabled=true;try{const p=payload();const d=await savePost(p,p.id?'PUT':'POST');$('postId').value=d.id;await refresh();preview()}catch(e){msg(e.message)}finally{$('save').disabled=false}};
async function compressedImage(file){
 if(!file.type.startsWith('image/'))throw Error('اختر صورة؛ أضف الفيديو بواسطة رابط HTTPS.');
 if(file.size>20*1024*1024)throw Error('اختر صورة أصغر من 20 ميغابايت.');
 const bitmap=await createImageBitmap(file);try{const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);for(const quality of [.85,.65,.45]){const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',quality));if(blob&&blob.size<=512*1024)return blob}throw Error('الصورة كبيرة؛ اختر صورة بأبعاد أقل.')}finally{bitmap.close()}
}
$('upload').onclick=async()=>{const file=$('file').files?.[0];if(!file){msg('اختر صورة أولاً');return}$('upload').disabled=true;msg('جاري ضغط الصورة ورفعها...');try{const blob=await compressedImage(file);const r=await fetch('/api/admin/upload',{method:'POST',headers:{'Content-Type':blob.type},body:blob});const d=await read(r);if(!r.ok)throw Error(d.error||'فشل الرفع');$('image').value=d.url;preview();msg('تم رفع الصورة. اضغط حفظ لربطها بالموضوع.')}catch(e){msg(e.message)}finally{$('upload').disabled=false}};
const resetProduct=()=>{for(const id of ["productId","productTitle","productDescription","productPrice","productUrl"])$(id).value=""};
$("clearProduct").onclick=resetProduct;
$("saveProduct").onclick=async()=>{const id=$("productId").value;const data={id,title:$("productTitle").value,description:$("productDescription").value,price:$("productPrice").value,url:$("productUrl").value};try{const r=await fetch("/api/admin/products",{method:id?"PUT":"POST",headers:{"Content-Type":"application/json",...auth()},body:JSON.stringify(data)});const d=await read(r);msg(r.ok?"تم حفظ البرنامج":d.error||"تعذر الحفظ");if(r.ok){resetProduct();$("refreshProducts").click()}}catch(e){msg(e.message||"تعذر الاتصال")}};
$("refreshProducts").onclick=async()=>{try{const r=await fetch("/api/admin/products",{headers:auth()});const d=await read(r);$("products").replaceChildren();if(!r.ok){msg(d.error||"تعذر تحميل البرامج");return}for(const p of d.products){const a=document.createElement("article"),h=document.createElement("h3"),desc=document.createElement("p"),edit=document.createElement("button"),del=document.createElement("button");h.textContent=p.title;desc.textContent=p.description+" — "+p.price;edit.textContent="تعديل";edit.onclick=()=>{for(const [field,key] of [["productId","id"],["productTitle","title"],["productDescription","description"],["productPrice","price"],["productUrl","url"]])$(field).value=p[key]||"";window.scrollTo(0,0)};del.textContent="حذف";del.onclick=async()=>{if(!confirm("حذف البرنامج؟"))return;const response=await fetch("/api/admin/products?id="+encodeURIComponent(p.id),{method:"DELETE",headers:auth()});msg(response.ok?"تم الحذف":"تعذر الحذف");if(response.ok)$("refreshProducts").click()};a.append(h,desc,edit,del);$("products").append(a)}}catch(e){msg(e.message||"تعذر الاتصال")}};


preview();
$('refresh').click();
$('refreshProducts').click();

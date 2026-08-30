const ads=[
{kick:'للدوائر الحكومية والمؤسسات الكبيرة',title:'تريد تتخلص من الفضائيين والوهميين وتعرف كل التفاصيل؟',text:'المراقب برو هو الحل: حضور، مواقع، سجلات وتدقيق يساعد الإدارة تعرف شنو يصير على أرض الواقع.'},
{kick:'موظفين هواي • مواقع هواي • إيفادات هواي',title:'أشّر إيفاد الموظف وخليه يبصم من المكان المسموح',text:'تتابع موقع تسجيله حسب سياسة الشركة ومواقعها المعتمدة بدل الاتصالات والتخمين.'},
{kick:'شركات التوصيل والخدمات والعمل الميداني',title:'موظفينك ما عدهم مقر ثابت؟ خلي بداية العمل مرتبطة بالموقع والوقت',text:'ضيف المواقع المعتمدة والشفتات وخلي النظام يتحقق من التسجيل حسب قواعد الشركة.'},
{kick:'خبرة عملية في إدارة الموارد البشرية',title:'من مشاكل الإدارة اليومية وُلد المراقب برو كحل شامل',text:'المدير يرتاح من المتابعة اليدوية، والإيفاد هم يحتاج تسجيل صحيح؛ مو مجرد كلام بالموبايل.'},
{kick:'لا ختلات ولا طلعات قبل الوقت',title:'«بصمتي ما تشتغل» ما تبقى عذر دائم',text:'البصمة من تلفون الموظف وفق الوقت والموقع والصلاحية، مع تسجيل الحالات المرفوضة للمراجعة.'}
];
let adIndex=0; const title=document.getElementById('adTitle'),text=document.getElementById('adText'),kick=document.getElementById('adKicker'),num=document.getElementById('adNo'),dots=document.getElementById('adDots');
ads.forEach((_,i)=>{const d=document.createElement('i');dots.appendChild(d)});
function showAd(i){const a=ads[i];num.textContent=String(i+1).padStart(2,'0');kick.textContent=a.kick;title.textContent=a.title;text.textContent=a.text;[...dots.children].forEach((d,x)=>d.classList.toggle('active',x===i));}
showAd(0);setInterval(()=>{adIndex=(adIndex+1)%ads.length;showAd(adIndex)},6500);
const features=[
['💰','توفير المال والوقت','تقليل الحاجة لجهاز بصمة تقليدي مكلف وما يرتبط به من شراء وتركيب وصيانة وأعطال.'],
['👥','التخلص من ازدحام البصمة','كل موظف يستخدم هاتفه وفق قواعد الشركة بدل التجمع أمام جهاز واحد.'],
['📍','الموقع والوقت والشفت','التحقق من الموقع المعتمد والوقت والشفت والصلاحيات قبل قبول التسجيل.'],
['🏢','كل مواقع الشركة','يمكن السماح للموظف بالتسجيل في أكثر من موقع تابع للشركة عندما تسمح مهمته بذلك.'],
['✈️','الإيفاد','ربط الإيفاد بفترة وموقع وشروط حضور واضحة بدل الاعتماد على الاتصال الشفهي.'],
['🔁','الموظف البديل','تسجيل البديل وربطه بالموظف الأصلي والفترة مع الحفاظ على سجل العملية.'],
['🏖️','الإجازة','حالة الإجازة تدخل ضمن قواعد التحقق ولا تتحول البصمة إلى نجاح لمجرد وجود الموظف بالموقع.'],
['📢','الإشعارات','إرسال تنبيه لموظف واحد أو مجموعة أو جميع الموظفين دفعة واحدة.'],
['🔊','رسائل كتابية وصوتية','إيصال البلاغات والتعليمات بنفس الوقت إلى الموظفين وتقليل المكالمات المتكررة.'],
['📱','الخدمات الذاتية','الإجازات والسلف والطلبات والمتابعة من الهاتف لتقليل مراجعات الموظفين للإدارة.'],
['🛡️','حماية البيانات','صلاحيات، تحقق من العمليات الحساسة، سجلات تدقيق، نسخ احتياطية ومزامنة وتقليل التعديل غير المصرح به.'],
['🔌','Offline والمزامنة','العمليات المسموح بها يمكن الاحتفاظ بها محليًا ثم مزامنتها عند عودة الاتصال وفق قواعد التحقق.'],
['⛑️','السلامة المهنية','إرشادات للسلامة المهنية والدفاع المدني والإسعافات الأولية تكون مرجعًا سريعًا للموظف.'],
['🔐','مقاومة التحايل','تحقق متعدد الطبقات مصمم لاكتشاف ومنع محاولات التحايل والطلبات غير المستوفية للشروط.'],
['©️','حقوق الملكية الفكرية','الاسم والتصميم والمحتوى والبرمجيات والمنطق التشغيلي حقوق محفوظة ولا تمنح نسخة العرض حق النسخ أو إعادة التوزيع.']
];
document.getElementById('featureScroll').innerHTML=features.map(x=>`<div class="mini-feature"><b>${x[0]} ${x[1]}</b><p>${x[2]}</p></div>`).join('');
document.getElementById('year').textContent=new Date().getFullYear();
const modal=document.getElementById('employeeModal');document.getElementById('employeeDemoBtn').onclick=()=>{modal.hidden=false;renderEmployees()};document.querySelector('[data-close]').onclick=()=>modal.hidden=true;modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true});
function employees(){try{return JSON.parse(sessionStorage.getItem('demoEmployees')||'[]')}catch{return[]}}
function renderEmployees(){const rows=employees();document.getElementById('employeeList').innerHTML=rows.length?rows.map(x=>`<div class="emp-row"><b>${x.name}</b> — ${x.role} • ${x.site} • ${x.shift}</div>`).join(''):'<p>لا يوجد موظفون مضافون في هذه الجلسة.</p>'}
document.getElementById('employeeForm').onsubmit=e=>{e.preventDefault();const rows=employees();rows.push({name:empName.value.trim(),role:empRole.value.trim(),site:empSite.value.trim(),shift:empShift.value.trim()});sessionStorage.setItem('demoEmployees',JSON.stringify(rows));e.target.reset();renderEmployees()};
document.getElementById('feedbackForm').onsubmit=e=>{e.preventDefault();sessionStorage.setItem('demoFeedback',JSON.stringify({rating:rating.value,favorite:favorite.value,comment:comment.value,at:new Date().toISOString()}));feedbackStatus.textContent='✅ تم حفظ رأيك داخل جلسة التجربة الحالية.'};
document.getElementById('adminDemoBtn').onclick=()=>demoScreen.scrollIntoView({behavior:'smooth',block:'center'});
document.getElementById('tvDemoBtn').onclick=()=>document.getElementById('tv').scrollIntoView({behavior:'smooth'});
document.querySelectorAll('[data-tv]').forEach(b=>b.onclick=()=>{tvVideo.src=b.dataset.tv;tvVideo.play().catch(()=>{})});
document.getElementById('fullscreenBtn').onclick=()=>document.getElementById('tvScreen').requestFullscreen?.();

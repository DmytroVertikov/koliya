const {SUPABASE_URL:U,SUPABASE_ANON_KEY:K}=window.CFG;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeUrl=u=>/^https?:\/\//i.test(u)?u:"#";
// Формат варианта: "019: Киев 19:06 > Хелм 05:00||IC 12010: Хелм 06:22 > Варшава 09:43"
function parseDsl(s){return s.split("||").map(p=>{const m=p.match(/^([^:]+):(.+)$/);if(!m)throw new Error("Нет «номер поезда:» в части: "+p);
const st=m[2].split(">").map(x=>{x=x.trim();const t=x.match(/^(.+)\s(\d{1,2}:\d{2})$/);if(!t)throw new Error("Нет времени у станции: «"+x+"»");return[t[1].trim(),t[2]]});
if(st.length<2)throw new Error("В поезде "+m[1]+" меньше двух станций");return{train:m[1].trim(),st}})}
// Время в пути и сдвиг по суткам: идём по всем станциям, при «скачке назад» добавляем сутки
function trip(L){let prev=null,add=0,first=0,abs=0;
for(const l of L)for(const s of l.st){const[h,m]=s[1].split(":");let v=+h*60+ +m+add;
if(prev===null)first=v;else if(v<prev){add+=1440;v+=1440}prev=abs=v}
return{min:abs-first,days:Math.floor(abs/1440)}}
const durFmt=m=>{const h=Math.floor(m/60),r=m%60;return(h?h+" ч":"")+(h&&r?" ":"")+(r?r+" мин":"")||"0 мин"};
function legHtml(l,i){return`${i?`<div class="swap">🔁 Пересадка: ${esc(l.st[0][0])}</div>`:""}<div class="leg"><h4>🚆 Поезд ${esc(l.train)}</h4><ul class="tl">${l.st.map(a=>`<li><span>${esc(a[0])}</span><time>${esc(a[1])}</time></li>`).join("")}</ul></div>`}
function optHtml(o){let L;try{L=parseDsl(o.dsl)}catch(e){return""}
const f=L[0].st[0],t=L[L.length-1].st.slice(-1)[0],tr=trip(L),ch=L.length-1;
return`<article class="opt"><div class="board"><div class="pt"><time>${esc(f[1])}</time><span>${esc(f[0])}</span></div><div class="mid"><span class="dur">${durFmt(tr.min)}</span><i class="line"></i><span class="tag${ch?" x":""}">${ch?(ch===1?"1 пересадка":ch+" пересадки"):"без пересадки"}</span></div><div class="pt end"><time>${esc(t[1])}</time><span>${esc(t[0])}</span></div></div><div class="perf"></div><div class="body">${L.map(legHtml).join("")}${o.note?`<div class="note">ℹ️ ${esc(o.note)}</div>`:""}</div></article>`}
// Оптическое выравнивание: название станции встаёт под видимый край первой/последней цифры.
// Учитываем боковые поля и цифры, и самой буквы; у «1» флажок выступает влево, поэтому равняемся по её ножке.
function alignBoards(){const c=(alignBoards.c=alignBoards.c||document.createElement("canvas").getContext("2d"));
const ink=(el,end)=>{const cs=getComputedStyle(el);c.font=cs.fontWeight+" "+cs.fontSize+" "+cs.fontFamily;const m=c.measureText(el.textContent.trim());
return{v:end?Math.max(0,m.width-m.actualBoundingBoxRight):Math.max(0,-m.actualBoundingBoxLeft),fs:parseFloat(cs.fontSize)}};
document.querySelectorAll(".pt").forEach(p=>{const t=p.querySelector("time"),s=p.querySelector("span");if(!t||!s)return;
const end=p.classList.contains("end"),a=ink(t,end),b=ink(s,end);
let v=a.v-b.v;if(!end&&t.textContent.trim()[0]==="1")v+=a.fs*.08;v=Math.max(0,v);
s.style.padding=end?"0 "+v+"px 0 0":"0 0 0 "+v+"px"})}
(()=>{const run=()=>alignBoards(),app=document.getElementById("app");
addEventListener("resize",run);
if(document.fonts){document.fonts.ready.then(run);document.fonts.addEventListener("loadingdone",run)}
if(app)new MutationObserver(run).observe(app,{childList:true})})();

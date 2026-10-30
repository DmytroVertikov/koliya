const {SUPABASE_URL:U,SUPABASE_ANON_KEY:K}=window.CFG;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeUrl=u=>/^https?:\/\//i.test(u)?u:"#";
// Формат варианта: "019: Киев 19:06 > Хелм 05:00||IC 12010: Хелм 06:22 > Варшава 09:43"
function parseDsl(s){return s.split("||").map(p=>{const m=p.match(/^([^:]+):(.+)$/);if(!m)throw new Error("Нет «номер поезда:» в части: "+p);
const st=m[2].split(">").map(x=>{x=x.trim();const t=x.match(/^(.+)\s(\d{1,2}:\d{2})$/);if(!t)throw new Error("Нет времени у станции: «"+x+"»");return[t[1].trim(),t[2]]});
if(st.length<2)throw new Error("В поезде "+m[1]+" меньше двух станций");return{train:m[1].trim(),st}})}
function legHtml(l,i){return`${i?`<div class="swap">🔁 Пересадка: ${esc(l.st[0][0])}</div>`:""}<div class="leg"><h4>Поезд ${esc(l.train)}</h4><ul class="tl">${l.st.map(a=>`<li><span>${esc(a[0])}</span><time>${esc(a[1])}</time></li>`).join("")}</ul></div>`}
function optHtml(o){let L;try{L=parseDsl(o.dsl)}catch(e){return""}
const f=L[0].st[0],t=L[L.length-1].st.slice(-1)[0];
return`<article class="opt"><div class="head"><b>${esc(f[0])} → ${esc(t[0])}</b><span class="tag">${L.length>1?"с пересадкой":"без пересадки"}</span></div><div class="note" style="margin:2px 0 0">Отправление ${esc(f[1])} · прибытие ${esc(t[1])}</div>${L.map(legHtml).join("")}${o.note?`<div class="note">ℹ️ ${esc(o.note)}</div>`:""}</article>`}

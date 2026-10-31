/* Колія: общий код сайта и админки.
   Формат варианта маршрута (одна строка в базе):
   @ Киев 19:29 > Варшава 10:24 ; 14 ч 55 мин ; 1 пересадка || 019: Киев 19:29 > Хелм 05:00 || IC 12010: *Хелм 06:34 > Люблин 07:44 > *Варшава Центральная 10:15
   · «@ …» шапка карточки, задаётся вручную: откуда > куда ; в пути (необязательно) ; плашка (необязательно)
   · дальше поезда через «||»; станции через «>»; звёздочка * перед станцией = выделить крупным шрифтом
   · старый формат без «@» тоже работает: шапка берётся из первой и последней станции, выделены первая и последняя */
const U=((window.CFG&&CFG.SUPABASE_URL)||"").replace(/\/$/,""),K=(window.CFG&&CFG.SUPABASE_ANON_KEY)||"";
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeUrl=u=>{u=String(u||"").trim();return/^https?:\/\//i.test(u)?u:"#"};

const toMin=t=>{const m=String(t||"").match(/(\d{1,2}):(\d{2})/);return m?(+m[1])*60+(+m[2]):null};
function autoDur(a,b){const x=toMin(a),y=toMin(b);if(x==null||y==null)return"";const d=((y-x)%1440+1440)%1440,h=Math.floor(d/60),m=d%60;return(h?h+" ч":"")+(h&&m?" ":"")+(m?m+" мин":"")||"0 мин"}
const autoTag=n=>n<1?"без пересадок":n==1?"1 пересадка":n<5?n+" пересадки":n+" пересадок";

function splitStop(x){x=String(x).trim();let hl=false;if(x[0]==="*"){hl=true;x=x.slice(1).trim()}
  const m=x.match(/^([\s\S]*?)\s*(\d{1,2}:\d{2}[\s\S]*)$/);return m?{name:m[1].trim(),time:m[2].trim(),hl}:{name:x,time:"",hl}}

function deriveHead(legs){const f=legs[0]&&legs[0].stops[0],l=legs.length&&legs[legs.length-1].stops[legs[legs.length-1].stops.length-1];
  return{from:f?f.name:"",ft:f?f.time:"",to:l?l.name:"",tt:l?l.time:"",dur:"",tag:""}}

function parseOption(dsl){
  const parts=String(dsl||"").split("||").map(s=>s.trim()).filter(Boolean);let head=null;
  if(parts.length&&parts[0][0]==="@"){const h=parts.shift().slice(1).split(";"),r=h[0].split(">"),a=splitStop(r[0]||""),b=splitStop(r[1]||"");
    head={from:a.name,ft:a.time,to:b.name,tt:b.time,dur:(h[1]||"").trim(),tag:(h[2]||"").trim()}}
  const legs=parts.map(p=>{const m=p.match(/^([^>]*?):\s([\s\S]*)$/),stops=(m?m[2]:p).split(">").map(splitStop);
    if(!head&&!stops.some(s=>s.hl))stops.forEach((s,i)=>s.hl=i===0||i===stops.length-1);
    return{train:m?m[1].trim():"",stops}});
  return{head,legs}}

function serializeOption(o){const j=(n,t)=>((n||"").trim()+" "+(t||"").trim()).trim(),h=o.head||{};
  const hs="@ "+j(h.from,h.ft)+" > "+j(h.to,h.tt)+((h.dur||h.tag)?" ; "+(h.dur||"").trim():"")+(h.tag?" ; "+h.tag.trim():"");
  return[hs].concat((o.legs||[]).map(L=>(L.train||"").trim()+": "+L.stops.map(s=>(s.hl?"*":"")+j(s.name,s.time)).join(" > "))).join("||")}

function validateOption(o){const e=[],h=o.head||{},bad=/[>|*;]/,tm=/^\d{1,2}:\d{2}/;
  if(!(h.from||"").trim())e.push("Шапка: укажите, откуда");if(!(h.to||"").trim())e.push("Шапка: укажите, куда");
  if(bad.test((h.from||"")+(h.to||"")))e.push("Шапка: в названиях нельзя > | * ;");
  if(!tm.test((h.ft||"").trim()))e.push("Шапка: время отправления вида 19:29");if(!tm.test((h.tt||"").trim()))e.push("Шапка: время прибытия вида 10:24");
  if(/[|;]/.test((h.dur||"")+(h.tag||"")))e.push("Шапка: в «в пути» и плашке нельзя | ;");
  if(!(o.legs||[]).length)e.push("Добавьте хотя бы один поезд");
  (o.legs||[]).forEach((L,i)=>{const n="Поезд "+(i+1)+": ";
    if(!(L.train||"").trim())e.push(n+"укажите номер поезда");
    if(/[:>|*;]/.test(L.train||""))e.push(n+"в номере нельзя : > | * ;");
    if(L.stops.length<2)e.push(n+"нужно минимум 2 станции");
    L.stops.forEach((s,k)=>{if(!s.name.trim())e.push(n+"станция "+(k+1)+" без названия");
      if(bad.test(s.name))e.push(n+"в названии станции нельзя > | * ;");
      if(!tm.test(s.time.trim()))e.push(n+"станция "+(k+1)+": время вида 19:06")})});
  return e}

/* совместимость со старым кодом */
function parseDsl(t){const p=parseOption(t);if(!p.legs.length)throw new Error("Пустой маршрут");
  return p.legs.map(L=>({train:L.train,st:L.stops.map(s=>[s.name,s.time])}))}

function optHtml(o){let p;try{p=parseOption(o.dsl)}catch(e){return""}
  const legs=p.legs;if(!legs.length)return"";
  const h=p.head||deriveHead(legs),n=legs.length-1,dur=h.dur||autoDur(h.ft,h.tt),tag=h.tag||autoTag(n);
  const board=`<div class="board"><div class="pt"><time>${esc(h.ft)}</time><span>${esc(h.from)}</span></div><div class="mid">${dur?`<span class="dur">${esc(dur)}</span>`:""}<span class="line"></span><span class="tag${n>0?" x":""}">${esc(tag)}</span></div><div class="pt end"><time>${esc(h.tt)}</time><span>${esc(h.to)}</span></div></div>`;
  const body=legs.map((L,i)=>{let sw="";
    if(i){const a=legs[i-1].stops[legs[i-1].stops.length-1].name,b=L.stops[0].name;sw=`<div class="swap">🔁 Пересадка: ${esc(a)}${b&&b!==a?" → "+esc(b):""}</div>`}
    return sw+`<div class="leg"><h4>🚆 Поезд ${esc(L.train)}</h4><ul class="tl">${L.stops.map(s=>`<li class="${s.hl?"h":"m"}"><span>${esc(s.name)}</span><time>${esc(s.time)}</time></li>`).join("")}</ul></div>`}).join("");
  return`<article class="opt">${board}<div class="perf"></div><div class="body">${body}${o.note?`<div class="note">${esc(o.note)}</div>`:""}</div></article>`}

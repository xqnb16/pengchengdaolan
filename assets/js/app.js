/* 汉韵彭城 v3 · 核心：长卷、交通、集章、详情 */
(()=>{
const $=(q,el=document)=>el.querySelector(q),$$=(q,el=document)=>[...el.querySelectorAll(q)];
const S=window.SITES,R=window.ROUTES,O=window.ORDER,A=window.ALL||O;
const get=id=>S.find(s=>s.id===id);
const art=k=>`assets/img/art/${k}.webp`, ip=k=>`assets/img/ip/${k}.webp`;
const NMAP=new Set(['gs','wm','hlw','hbs','xmt','bwg','sz','yls','ylh']);
const WECHAT=document.documentElement.classList.contains('wechat-mobile');
const darkTheme=()=>document.documentElement.classList.contains('theme-obsidian');
const artThemed=(k,dark=darkTheme())=>dark&&NMAP.has(k)?`assets/img/night/${k}_night.webp`:art(k);
const sceneCover=(k,dark=darkTheme())=>WECHAT&&NMAP.has(k)
 ?`assets/img/wechat/${k}${dark?'_night':''}.webp`:artThemed(k,dark);
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* ---------- 事件 & 印章 ---------- */
const bus={};const on=(e,f)=>(bus[e]=bus[e]||[]).push(f);const emit=(e,d)=>(bus[e]||[]).forEach(f=>f(d));
let stamps=[];try{stamps=JSON.parse(localStorage.getItem('xz3_stamps')||'[]').filter(get)}catch(e){}
function stamp(id){if(stamps.includes(id))return false;stamps.push(id);try{localStorage.setItem('xz3_stamps',JSON.stringify(stamps))}catch(e){}
 refresh();emit('stamp',id);return true}
function refresh(){markStops();emit('refresh')}
/* ---------- 坐标（WGS→GCJ，用于高德） ---------- */
function gcj(lat,lng){const a=6378245,ee=.00669342162296594323,PI=Math.PI;
 const tl=(x,y)=>{let r=-100+2*x+3*y+.2*y*y+.1*x*y+.2*Math.sqrt(Math.abs(x));r+=(20*Math.sin(6*x*PI)+20*Math.sin(2*x*PI))*2/3;r+=(20*Math.sin(y*PI)+40*Math.sin(y/3*PI))*2/3;r+=(160*Math.sin(y/12*PI)+320*Math.sin(y*PI/30))*2/3;return r};
 const tg=(x,y)=>{let r=300+x+2*y+.1*x*x+.1*x*y+.1*Math.sqrt(Math.abs(x));r+=(20*Math.sin(6*x*PI)+20*Math.sin(2*x*PI))*2/3;r+=(20*Math.sin(x*PI)+40*Math.sin(x/3*PI))*2/3;r+=(150*Math.sin(x/12*PI)+300*Math.sin(x/30*PI))*2/3;return r};
 let dLat=tl(lng-105,lat-35),dLng=tg(lng-105,lat-35);const rad=lat/180*PI;let m=Math.sin(rad);m=1-ee*m*m;const sq=Math.sqrt(m);
 dLat=dLat*180/((a*(1-ee))/(m*sq)*PI);dLng=dLng*180/(a/sq*Math.cos(rad)*PI);return [lat+dLat,lng+dLng]}
const amapTo=id=>{const s=get(id);if(!s){const h=HUBS.find(x=>x[0]===id);return `https://uri.amap.com/search?keyword=${encodeURIComponent(h[1])}&city=320300&callnative=1`}
 const [la,ln]=gcj(s.lat,s.lng);return `https://uri.amap.com/navigation?to=${ln.toFixed(5)},${la.toFixed(5)},${encodeURIComponent(s.n)}&mode=bus&coordinate=gaode&callnative=1`};
/* ---------- 交通网络 ---------- */
const NAME=id=>get(id)?get(id).n:(HUBS.find(h=>h[0]===id)||[])[1]||STNS[id]||id;
const adj={};EDGES.forEach(e=>{(adj[e[0]]=adj[e[0]]||[]).push({to:e[1],e,fw:1});(adj[e[1]]=adj[e[1]]||[]).push({to:e[0],e,fw:0})});
function path(a,b){if(a===b)return {legs:[],min:0};const d={},pv={},done=new Set();d[a]=0;
 while(true){let u=null;for(const k in d)if(!done.has(k)&&(u===null||d[k]<d[u]))u=k;if(u===null||u===b)break;done.add(u);
  (adj[u]||[]).forEach(x=>{const prevMode=pv[u]?pv[u].e[2]:null;const c=d[u]+x.e[3]+(prevMode&&prevMode!==x.e[2]?4:1);if(d[x.to]===undefined||c<d[x.to]){d[x.to]=c;pv[x.to]={from:u,e:x.e,fw:x.fw}}})}
 if(d[b]===undefined)return null;const legs=[];let c=b;while(c!==a){const p=pv[c];legs.unshift({from:p.from,to:c,mode:p.e[2],min:p.e[3],txt:p.fw?p.e[4]:p.e[5]});c=p.from}
 return {legs,min:legs.reduce((s,l)=>s+l.min,0)}}
const MC={'地铁':['#3B5B78','铁'],'公交':['#3F6B5A','公'],'步行':['#B8863B','步'],'打车':['#5E5449','车']};
const modes=p=>[...new Set(p.legs.map(l=>l.mode))].join('+');
/* ---------- 导航高亮 ---------- */
const nav=$('#nav');addEventListener('scroll',()=>nav.classList.toggle('solid',scrollY>40),{passive:true});nav.classList.toggle('solid',scrollY>40);
const secIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const id=e.target.id;$$('.links a,.tabbar a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+id));emit('section',id)}}),{rootMargin:'-45% 0px -50% 0px'});
['top','scroll','sites','sanjue','fy','go','about'].forEach(id=>{const el=document.getElementById(id);el&&secIO.observe(el)});

/* =========================================================
   长卷（仅在存在 #scroll 时启用，空灵精简版零报错跳过）
   ========================================================= */
const sec=$('#scroll'),track=$('#track'),scX=track?(()=>{const w=document.createElement('div');w.className='sc-x';w.id='scX';track.before(w);w.appendChild(track);return w})():null,flyer=$('#flyer'),card=$('#scCard'),bar=$('#scBar');
let L={},route=-1,curI=-2;
function layout(){}
function markStops(){}
function goStop(){}
if(sec&&track&&bar&&card){
$('#scRoutes').innerHTML=`<button class="chip" aria-pressed="true" data-r="-1">全部九景</button>`+R.map((r,i)=>`<button class="chip" aria-pressed="false" data-r="${i}">${r.n}</button>`).join('');
$$('#scRoutes .chip').forEach(b=>b.onclick=()=>{route=+b.dataset.r;$$('#scRoutes .chip').forEach(x=>x.setAttribute('aria-pressed',x===b));applyRoute();const r=R[route];if(r)goStop(O.indexOf(r.ids[0]));emit('route',route)});
layout=function(){
 const vw=innerWidth,vh=Math.min(innerHeight,940),mob=vw<720;
 const th=Math.max(320,vh-(mob?360:270));
 const S2=mob?vw*.86:Math.max(420,Math.min(580,vw*.42));
 const intro=mob?vw*.9:Math.min(vw*.48,540),outro=mob?vw:Math.max(vw*.46,480);
 const W=intro+O.length*S2+outro;
 L={vw,vh,th,S:S2,intro,W,cx:O.map((_,i)=>intro+S2*(i+.5)),mob,K:mob?1:1.65};
 track.style.width=W+'px';sec.style.height=(mob?vh:Math.round((W-vw)/L.K+vh))+'px';sec.classList.toggle('mobx',mob);if(!mob)scX.scrollLeft=0;
 const vg=Math.min(S2*(mob?.92:.78),th*1.12);
 track.innerHTML=`<svg class="sc-bg" width="${W}" height="${th}" viewBox="0 0 ${W} ${th}" aria-hidden="true">${bgSVG()}</svg>
 <div class="intro-panel" style="width:${intro}px"><div class="row"><div class="big">彭城<em>七里</em></div><div class="meta"><span class="sc-coord">34°15′N · 117°11′E · NORTH TO SOUTH</span><b>一幅从北到南的汉风手卷</b>从城西北龟山汉墓启程，越故黄河，沿彭城七里中轴一路向南，东折狮子山，止于云龙山水。<span class="sc-cue-line">${mob?'← 向左滑动展开':'向下滚动 · 展开长卷 →'}</span></div></div></div>
 ${O.map((id,i)=>{const s=get(id);return `<div class="stop" data-id="${id}" data-i="${i}" style="left:${L.cx[i]-S2/2}px;width:${S2}px;--vw:${vg}px" role="button" tabindex="0" aria-label="${s.n}"><div class="stop-frame"><div class="vg" style="background-image:url(${art(s.cover)})"></div><div class="stop-meta"><span class="stop-no">${String(i+1).padStart(2,'0')} / ${s.era.split(' · ')[0]}</span><strong>${s.n}</strong><em>${s.line}</em></div></div><div class="vlabel">${s.n}</div></div>`}).join('')}
 <div class="outro-panel" style="left:${intro+O.length*S2}px;width:${outro}px"><span class="sc-coord">END OF SCROLL · 卷尾</span><h3>长卷至此 · 步入彭城</h3><p>九处古迹皆已入画。继续向下细读三篇风物，或挑数处拼成一日路引。</p><a class="outro-lnk" href="#go">前往交通路引 →</a></div>`;
 $$('.stop',track).forEach(el=>{const go=()=>{const i=+el.dataset.i;if(i===curI)openDetail(el.dataset.id);else goStop(i)};el.onclick=go;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}});
 bar.innerHTML=`<div class="rail"></div><div class="fill" id="scFill"></div>`+O.map((id,i)=>`<button data-i="${i}" style="left:${(i+.5)/O.length*100}%" aria-label="跳到${get(id).n}"><span>${String(i+1).padStart(2,'0')}</span><em aria-hidden="true">${get(id).n}</em></button>`).join('');
 $$('button',bar).forEach(b=>b.onclick=()=>goStop(+b.dataset.i));
 applyRoute();markStops();curI=-2;update();
};
function bgSVG(){const {th,S,cx,W,intro}=L;let s='';const x=i=>cx[i];
 let mtn=`M0 ${th-26}`;const seg=20;const sw=W/seg;
 for(let k=0;k<=seg;k++){const px=k*sw,py=th-26-th*(0.10+0.09*Math.abs(Math.sin(k*1.25+0.5)));mtn+=k?` Q ${(px-sw*0.5).toFixed(0)} ${(py-14).toFixed(0)} ${px.toFixed(0)} ${py.toFixed(0)}`:` L0 ${py.toFixed(0)}`}
 mtn+=` L${W} ${th-26} Z`;
 s+=`<path d="${mtn}" fill="rgba(26,25,24,.028)"/>`;
 s+=`<line x1="0" y1="${th-26}" x2="${W}" y2="${th-26}" stroke="rgba(26,25,24,.14)" stroke-width="1"/>`;
 const rx=(x(0)+x(1))/2;
 s+=`<path d="M${rx-10} 18 C ${rx+20} ${th*.32}, ${rx-22} ${th*.64}, ${rx+6} ${th-26}" fill="none" stroke="rgba(58,100,84,.42)" stroke-width="1.5"/>
 <path d="M${rx+3} 18 C ${rx+32} ${th*.32}, ${rx-9} ${th*.64}, ${rx+18} ${th-26}" fill="none" stroke="rgba(58,100,84,.22)" stroke-width="1" stroke-dasharray="4 6"/>
 <text x="${rx+24}" y="${th*.18}" font-family="var(--serif)" font-size="11.5" font-weight="600" fill="#3A6454" letter-spacing="5" style="writing-mode:vertical-rl">故黄河水轴</text>`;
 for(let i=0;i<O.length;i++){
  s+=`<line x1="${x(i)}" y1="22" x2="${x(i)}" y2="${th-26}" stroke="rgba(26,25,24,.045)" stroke-width="1" stroke-dasharray="2 6"/>`;
  if(i<O.length-1){const p=path(O[i],O[i+1]);if(p){const mx=(x(i)+x(i+1))/2;
   s+=`<circle cx="${mx}" cy="${th-26}" r="2.5" fill="#9E2A22"/><text x="${mx}" y="${th-9}" text-anchor="middle" font-size="10.5" font-weight="500" letter-spacing="1.2" fill="#8A867E">${modes(p)} · 约${p.min}分</text>`}}
 }
 s+=`<line x1="${x(1)}" y1="${th-26}" x2="${x(6)}" y2="${th-26}" stroke="#9E2A22" stroke-width="1.5" opacity=".72"/>
 <text x="${(x(1)+x(6))/2}" y="18" text-anchor="middle" font-family="var(--serif)" font-size="11" font-weight="600" letter-spacing="5" fill="#9E2A22" opacity=".68">彭城七里文脉轴 · 北起故黄河 · 南抵云龙山</text>`;
 s+=`<g id="rpath"></g>`;return s}
function applyRoute(){const r=R[route];
 $$('.stop',track).forEach(el=>{const id=el.dataset.id,k=r?r.ids.indexOf(id):-1;el.classList.toggle('dim',!!r&&k<0);$('.rnum',el)?.remove();if(k>=0)$('.vlabel',el)?.insertAdjacentHTML('afterbegin',`<span class="rnum">${k+1}</span>`)});
 $$('button',bar).forEach(b=>b.classList.toggle('dim',!!r&&!r.ids.includes(O[+b.dataset.i])));
 const g=$('#rpath',track);if(!g)return;if(!r){g.innerHTML='';return}
 const y=L.th*.22;let d='';r.ids.forEach((id,k)=>{const X=L.cx[O.indexOf(id)];if(!k)d=`M${X} ${y}`;else{const P=L.cx[O.indexOf(r.ids[k-1])];d+=` Q${(P+X)/2} ${y-L.th*.16} ${X} ${y}`}});
 g.innerHTML=`<path d="${d}" fill="none" stroke="#B23A2E" stroke-width="3" stroke-dasharray="10 8" stroke-linecap="round"/>`;curI=-2;update()}
markStops=function(){$$('.stop',track).forEach(el=>{$('.got',el)?.remove();if(stamps.includes(el.dataset.id))el.insertAdjacentHTML('beforeend','<span class="got">已盖章</span>')})};
function txOf(){if(L.mob)return Math.max(0,Math.min(L.W-L.vw,scX.scrollLeft));const top=sec.getBoundingClientRect().top;return Math.max(0,Math.min(L.W-L.vw,-top*L.K))}
goStop=function(i){i=Math.max(0,Math.min(O.length-1,i));const tx=Math.max(0,Math.min(L.W-L.vw,L.cx[i]-L.vw/2));if(L.mob){scX.scrollTo({left:tx,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});return}scrollTo({top:sec.offsetTop+Math.ceil(tx/L.K),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})};
function update(){const tx=txOf();track.style.transform=L.mob?'none':`translate3d(${-tx}px,0,0)`;
 const c=tx+L.vw/2;const raw=(c-L.intro)/L.S;let i=Math.round(raw-.5);const inRange=c>L.intro-L.S*.2&&c<L.intro+O.length*L.S+L.S*.2;i=Math.max(0,Math.min(O.length-1,i));
 $('#scFill').style.width=Math.min(100,Math.max(0,(raw/O.length)*100))+'%';
 const ni=inRange?i:-1;if(ni!==curI){curI=ni;renderCard()}}
function renderCard(){$$('.stop',track).forEach(el=>el.classList.toggle('cur',+el.dataset.i===curI));$$('button',bar).forEach(b=>b.classList.toggle('on',+b.dataset.i===curI));
 if(curI<0){card.classList.add('off');emit('stop',null);return}card.classList.remove('off');
 const id=O[curI],s=get(id),r=R[route];let k=`第 ${curI+1} / ${O.length} 站 · ${s.tag}`,nxt=O[curI+1],prv=O[curI-1];
 if(r&&r.ids.includes(id)){const j=r.ids.indexOf(id);k=`${r.n} · 第 ${j+1} / ${r.ids.length} 站`;nxt=r.ids[j+1];prv=r.ids[j-1]}
 const p=nxt?path(id,nxt):null;
 card.innerHTML=`<div class="cl"><div class="k">${k}</div><h3>${s.n}<small>${s.line}</small></h3>
 ${p?`<div class="leg">下一站 <b>${get(nxt).n}</b>：${modes(p)}，约 ${p.min} 分钟</div>`:''}</div>
 <div class="cr"><div class="nav2"><button aria-label="上一站" ${prv?'':'disabled style="opacity:.3"'} data-g="${prv||''}">‹</button><button aria-label="下一站" ${nxt?'':'disabled style="opacity:.3"'} data-g="${nxt||''}">›</button></div>
 <div class="acts"><button class="btn small" data-d="${id}">入画观展 →</button>${GAMES.includes(id)?`<button class="btn small red" data-p="${id}">去玩：${s.game[0]}</button>`:''}</div></div>`;
 card.classList.remove('cswap');void card.offsetWidth;card.classList.add('cswap');
 $$('[data-g]',card).forEach(b=>b.onclick=()=>b.dataset.g&&goStop(O.indexOf(b.dataset.g)));
 $('[data-d]',card).onclick=()=>openDetail(id);$('[data-p]',card)&&($('[data-p]',card).onclick=()=>goPlay(id));emit('stop',id)}
let lastTx=0,vel=0,mood='',t0=performance.now(),still=0;
function fly(t){const tx=txOf();vel=vel*.85+(tx-lastTx)*.15;lastTx=tx;
 const atEnd=tx>=L.W-L.vw-2;let m=Math.abs(vel)>1.2?'zq_hype':(atEnd?'zq_love':'zq_joy');if(m!==mood){mood=m;flyer.src=ip(m)}
 if(!L.mob){const fr=$('#scFill')?.getBoundingClientRect(),pr=flyer.offsetParent?.getBoundingClientRect();if(fr&&pr&&fr.width>=0)flyer.style.left=(fr.right-pr.left)+'px'}card.classList.toggle('pre',tx<L.intro*.55);
 const y=Math.sin(t/600)*8,rot=Math.max(-14,Math.min(14,vel*.6));flyer.style.transform=`translateY(${y}px) rotate(${rot}deg) scaleX(${vel<-1?-1:1})`;
 if(secVisible)requestAnimationFrame(fly)}
let secVisible=false;new IntersectionObserver(es=>{secVisible=es[0].isIntersecting;if(secVisible)requestAnimationFrame(fly)}).observe(sec);
addEventListener('scroll',update,{passive:true});scX.addEventListener('scroll',update,{passive:true});
let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{if(Math.abs(innerWidth-L.vw)>40||Math.abs(innerHeight-L.vh)>120)layout()},150)});
addEventListener('keydown',e=>{if(!secVisible||document.activeElement.closest('input,select,textarea,.gpanel'))return;if(!$('#detail').hidden)return;const r=sec.getBoundingClientRect();if(r.top>0||r.bottom<innerHeight)return;
 if(e.key==='ArrowRight'){e.preventDefault();goStop(curI+1)}if(e.key==='ArrowLeft'){e.preventDefault();goStop(curI-1)}});
}

/* =========================================================
   交通
   ========================================================= */
const opts=(sel,list)=>list.map(([v,t])=>`<option value="${v}"${v===sel?' selected':''}>${t}</option>`).join('');
const PLACES=[...HUBS.map(h=>[h[0],h[1]]),...A.map(id=>[id,get(id).n])];
let pf='east',pt='hbs';
function renderPlanner(){$('#from').innerHTML=opts(pf,PLACES);$('#to').innerHTML=opts(pt,PLACES);
 const p=path(pf,pt);const tk=$('#ticket');
 if(pf===pt||!p){tk.innerHTML=`<li class="pt"><span class="dot">!</span><div><b>起点和终点一样</b><small>换一个终点试试。</small></div></li>`;$('#tfoot').innerHTML='';return}
 let h=`<li class="pt"><span class="dot">起</span><div><b>${NAME(pf)}</b><small>出发</small></div></li>`;
 p.legs.forEach((l,i)=>{const [c,g]=MC[l.mode];h+=`<li class="leg" style="--c:${c}"><span class="dot">${g}</span><div><b>${l.mode}</b><small>${l.txt}</small></div><span class="min">约${l.min}分</span></li>`;
  const last=i===p.legs.length-1;h+=`<li class="pt${last?' end':''}"><span class="dot">${last?'终':'·'}</span><div><b>${NAME(l.to)}</b><small>${last?'到达':(STNS[l.to]?'换乘 / 出站':'途经')}</small></div></li>`});
 tk.innerHTML=h;
 $('#tfoot').innerHTML=`<span class="sum">全程约 ${p.min} 分钟</span><span style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><button class="btn small red" id="tStartMap" type="button">▶ 站内逐步引导</button>${get(pt)?`<button class="btn small ghost dark" data-d="${pt}">看${get(pt).n}</button>`:''}<a class="pc-ext-amap" href="${amapTo(pt)}" target="_blank" rel="noopener">高德外链 ↗</a></span>`;
 $('#tStartMap',$('#tfoot'))?.addEventListener('click',()=>window.XZ_MAP&&window.XZ_MAP.startTour());
 $('[data-d]',$('#tfoot'))?.addEventListener('click',e=>openDetail(e.currentTarget.dataset.d))}
$('#from').onchange=e=>{pf=e.target.value;renderPlanner();emit('plan',[pf,pt])};$('#to').onchange=e=>{pt=e.target.value;renderPlanner();emit('plan',[pf,pt])};
$('#swap').onclick=()=>{[pf,pt]=[pt,pf];renderPlanner();emit('plan',[pf,pt])};
function planTo(id,from){pt=id;if(from)pf=from;else if(pf===id)pf='east';renderPlanner();emit('plan',[pf,pt]);if(window.XZ_MAP){window.XZ_MAP.guideTo(id,pf)}else{document.getElementById('go').scrollIntoView({behavior:'smooth'})}}
/* 拼行程（首次访问默认预置「两汉一日精华线」，消除右栏空洞，支持自由增删清空） */
let bl=['bwg','xmt','hbs','hlw'],bf='east';try{const v=JSON.parse(localStorage.getItem('xz3_trip')||'null');if(v&&Array.isArray(v.l)){bl=v.l.filter(get);bf=v.f||'east'}}catch(e){}
function saveTrip(){try{localStorage.setItem('xz3_trip',JSON.stringify({l:bl,f:bf}))}catch(e){}}
function renderBuilder(){
 $('#bPool').innerHTML=A.map(id=>`<button class="chip${bl.includes(id)?' in':''}" data-id="${id}" aria-pressed="${bl.includes(id)}">${bl.includes(id)?'✓ ':'+ '}${get(id).n}</button>`).join('');
 $('#bFrom').innerHTML=opts(bf,[['none','第一站'],...HUBS.map(h=>[h[0],h[1]])]);
 let tot=0,h='';const seq=bf==='none'?bl:[bf,...bl];
 if(!bl.length)h=`<li class="empty">还没有景点，先从上面挑几个吧。</li>`;
 bl.forEach((id,i)=>{const prev=bf==='none'?bl[i-1]:seq[i];const p=prev?path(prev,id):null;if(p)tot+=p.min;
  h+=`<li><span class="n">${i+1}</span><b>${get(id).n}</b><span class="ops"><button data-u="${i}" aria-label="上移">↑</button><button data-dn="${i}" aria-label="下移">↓</button><button data-x="${i}" aria-label="移除">×</button></span>${p?`<span class="lg">从${NAME(prev)}：<b>${modes(p)}</b> 约${p.min}分 · ${p.legs.map(l=>l.txt).join('；')}</span>`:''}</li>`});
 $('#bList').innerHTML=h;
 const stay=bl.reduce((s,id)=>s+({'约1小时':60,'约1.5小时':90,'约2小时':120,'半天':180}[get(id).time]||60),0);
 $('#bSum').innerHTML=bl.length?`路上约 ${tot} 分钟 + 游览约 ${Math.round(stay/30)/2} 小时，合计约 ${Math.round((tot+stay)/30)/2} 小时。${bl.length>4?'<br><span style="color:var(--red)">景点有点多，建议分两天。</span>':''}`:'';
 $$('#bPool .chip').forEach(b=>b.onclick=()=>{const id=b.dataset.id;bl=bl.includes(id)?bl.filter(x=>x!==id):[...bl,id];saveTrip();renderBuilder();emit('trip',bl)});
 $$('[data-u]').forEach(b=>b.onclick=()=>{const i=+b.dataset.u;if(i>0){[bl[i-1],bl[i]]=[bl[i],bl[i-1]];saveTrip();renderBuilder()}});
 $$('[data-dn]').forEach(b=>b.onclick=()=>{const i=+b.dataset.dn;if(i<bl.length-1){[bl[i+1],bl[i]]=[bl[i],bl[i+1]];saveTrip();renderBuilder()}});
 $$('[data-x]').forEach(b=>b.onclick=()=>{bl.splice(+b.dataset.x,1);saveTrip();renderBuilder()});
 $('#bFrom').onchange=e=>{bf=e.target.value;saveTrip();renderBuilder()}}
$('#bSort').onclick=()=>{if(bl.length<2)return;let rest=[...bl],cur=bf==='none'?rest.shift():bf,out=bf==='none'?[cur]:[];
 while(rest.length){rest.sort((a,b)=>path(cur,a).min-path(cur,b).min);cur=rest.shift();out.push(cur)}bl=out;saveTrip();renderBuilder()};
$('#bClear').onclick=()=>{bl=[];saveTrip();renderBuilder()};
$('#bGuideMap')?.addEventListener('click',()=>{if(!bl.length)return;const tab=$('#goTabs button[data-gtab="plan"]');if(tab)tab.click();window.XZ_MAP&&window.XZ_MAP.loadMulti(bf,bl,true)});
function addTrip(id){if(!bl.includes(id)){bl.push(id);saveTrip();renderBuilder();emit('trip',bl)}}
/* 地铁示意图（国风矿物色系：朱砂红 / 靛青蓝 / 石青绿） */
(function(){const l1=['路窝','杏山子','韩山','工农路','人民广场','苏堤路','徐医附院','彭城广场','民主北路','徐州火车站','子房山','铜山路','黄山垅','庆丰路','医科大学','乔家湖','金龙湖','徐州东站'];
 const Y=230,x0=40,dx=1120/17;let s='';const st=(x,y,n,an,lx,ly,hl)=>`<circle cx="${x}" cy="${y}" r="${hl?8:5.5}" fill="#FBF8F1" stroke="#1E1915" stroke-width="${hl?3:2}"/><text x="${lx}" y="${ly}" text-anchor="${an}" font-size="${hl?14:12}" font-weight="${hl?800:500}">${n}</text>`;
 s+=`<path d="M${x0} ${Y} H${x0+dx*17}" stroke="#B23A2E" stroke-width="6.5" stroke-linecap="round"/>`;const P=x0+dx*7,Q=x0+dx*9;
 s+=`<path d="M${P} 40 V${Y} V300 V345 L540 390 L600 430 H780" fill="none" stroke="#3B5B78" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>`;
 s+=`<path d="M${Q} 160 V${Y} V300 V400 L600 430 V495" fill="none" stroke="#3F6B5A" stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round"/>`;
 l1.forEach((n,i)=>{const x=x0+dx*i;if(i===7||i===9)return;s+=st(x,Y,n,'middle',x,Y-16,i===17)});
 s+=st(P,Y,'彭城广场','end',P-12,Y+28,1)+st(Q,Y,'徐州火车站','start',Q+12,Y+28,1);
 ['庆云桥','九龙湖','奔腾大道','九里山','李沃','客运北站'].forEach((n,i)=>{const y=190-i*30;s+=st(P,y,n,'end',P-12,y+4)});
 s+=st(P,300,'户部山','start',P+12,304,1)+st(P,345,'师大云龙校区','start',P+12,349)+st(540,390,'中心医院','start',554,394)+st(600,430,'淮塔','end',588,446);
 s+=st(Q,190,'白云山','start',Q+12,194)+st(Q,160,'下淀','start',Q+12,164)+st(Q,300,'天桥','start',Q+12,304)+st(Q,345,'和平大桥','start',Q+12,349);
 s+=`<text x="790" y="435" font-size="12" fill="#3B5B78">科技城 … 新城区东</text><text x="612" y="500" font-size="12" fill="#3F6B5A">矿大文昌校区 … 高新区南</text>`;
 const tag=(x,y,t,a)=>`<text x="${x}" y="${y}" text-anchor="${a||'end'}" font-size="12.5" font-weight="700" fill="#B23A2E">${t}</text>`;
 s+=tag(P-12,304,'戏马台 · 户部山 · 回龙窝 →')+tag(P-12,Y+48,'文庙街区：出站沿彭城路北行')+tag(x0+dx*17,Y+28,'高铁站','middle');
 s+=`<g font-size="13" font-weight="700"><rect x="40" y="440" width="16" height="5" rx="1" fill="#B23A2E"/><text x="62" y="447">1号线</text><rect x="122" y="440" width="16" height="5" rx="1" fill="#3B5B78"/><text x="144" y="447">2号线</text><rect x="204" y="440" width="16" height="5" rx="1" fill="#3F6B5A"/><text x="226" y="447">3号线</text></g><text x="40" y="472" font-size="12" fill="#7D7971">示意图：站序依据徐州地铁官网线路数据，2、3号线仅展示核心换乘段。</text>`;
 $('#metro').innerHTML=`<svg viewBox="0 0 1200 500" role="img" aria-label="徐州地铁1、2、3号线示意图" font-family="var(--sans)" fill="#1E1915">${s}</svg>`})();

/* =========================================================
   集章册
   ========================================================= */
function renderPass(){return;
 $('#pgrid').innerHTML=O.map(id=>{const s=get(id),g=stamps.includes(id);return `<a class="pst${g?' got':''}" href="#site-${id}" aria-label="${s.n}${g?' 已盖章':' 未盖章'}"><span class="sg">${s.g}</span>${s.n.replace('古民居','').replace('街区','')}</a>`}).join('');
 const n=stamps.length;$('#preward').innerHTML=n>=O.length?`<div class="duo2"><img src="${ip('zq_love')}" alt=""><img src="${ip('bh_love')}" alt=""></div><h4>彭城通关！</h4><p>九枚印章都集齐了。朱雀和白虎谢谢你陪它们逛完彭城。</p><button class="btn small ghost dark" id="reset">清空印章重新玩</button>`
 :`<div class="duo2"><img src="${ip(n?'zq_proud':'zq_ask')}" alt=""><img src="${ip(n?'bh_joy':'bh_peek')}" alt=""></div><h4>已集 ${n} / ${O.length}</h4><div class="meter"><i style="width:${n/O.length*100}%"></i></div><p>${n?'还差 '+(O.length-n)+' 枚，点空的格子去那个景点看看。':'点任意一格，从那个景点开始。'}</p>`;
 $('#reset')&&($('#reset').onclick=()=>{if(confirm('确定清空全部印章吗？')){stamps=[];try{localStorage.removeItem('xz3_stamps')}catch(e){}refresh()}})}

/* =========================================================
   详情 & 灯箱
   ========================================================= */
/* ---------- v5 开放状态 ---------- */
function nowCN(){const p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Shanghai',hour12:false,weekday:'short',hour:'2-digit',minute:'2-digit',month:'numeric'}).formatToParts(new Date());const g=t=>(p.find(x=>x.type===t)||{}).value;
 return {d:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(g('weekday')),m:+g('month'),t:(+g('hour')%24)*60+(+g('minute'))}}
const tm=v=>{const [h,m]=v.split(':');return (+h)*60+(+m)};
function status(id){const h=(get(id)||{}).hrs;if(!h)return null;if(h.all)return {c:'ok',t:'全天开放'};
 const n=nowCN();let {o,c,e}=h;if(h.w&&(n.m<4||n.m>10))({o,c,e}=h.w);const sx=h.street?' · 古街区全天可逛':'';
 if(!h.d.includes(n.d))return {c:'off',t:'今日闭馆'+(h.mon?'（法定节假日除外）':'')};
 if(n.t<tm(o))return {c:'soon',t:`未开门 · ${o} 开放${sx}`};
 if(n.t>=tm(e))return {c:'off',t:`${n.t>=tm(c)?'今日已结束开放':'已停止入园'}${sx}`};
 return {c:tm(e)-n.t<=60?'soon':'ok',t:`开放中 · ${e} 停止入园`}}
const stPill=id=>{const s=status(id);if(!s){const x=get(id);return x&&x.info?`<span class="st unk"><i></i>开放时间以景区公告为准</span>`:''}return `<span class="st ${s.c}"><i></i>${s.t}</span>`};
/* ---------- v5 详情页 ---------- */
const D=$('#detail');let lastFocus=null,curD=null;
const TOC=[['d-story','故事'],['d-culture','文化'],['d-tl','年表'],['d-food','美食'],['d-go','怎么到'],['d-rub','拓印'],['d-src','出处']];
const LV={a:'官方 / 原典',b:'公开信息整理',c:'说法不一 · 请现场确认'};
function infoBar(s){const f=s.info;if(!f)return'';const warn=f.off&&!/^无/.test(f.off);
 return `<section class="i5" aria-label="开放信息"><div><small>开放时间</small><b>${f.open}</b></div><div><small>门票</small><b>${f.tix}</b></div><div><small>预约</small><b>${f.book}</b></div><div${warn?' class="warn"':''}><small>闭馆日</small><b>${f.off}</b></div>
 <p class="src"><span class="lv ${f.lv}">${LV[f.lv]}</span>来源：${f.src} · 2026年10月整理 · 节假日可能调整，以官方公告为准</p></section>`}
function mustList(s){if(!s.must)return'';
 return `<div class="must"><div class="mh"><h3>看展清单</h3><p>${s.must.length} 件值得专门去找的馆藏。尺寸、出土地与编号来自徐州博物馆官网“典藏”栏目，配图为依馆藏图重绘的插画。</p></div><ol>${s.must.map((m,i)=>`<li>${m[0]?`<img src="${art(m[0])}" alt="" loading="lazy">`:`<span class="no">${String(i+1).padStart(2,'0')}</span>`}<div><b>${m[1]}</b><small>${m[2]}</small><small>出土：${m[3]} · 编号 ${m[4]}</small></div></li>`).join('')}</ol></div>`}
function storyOf(s){if(s.story)return s.story;const F=[[.5,.5,1],[.38,.48,1.4],[.62,.55,1.4],[.5,.45,1.15]];
 return s.tl.map((t,i)=>({k:t[0],t:'',d:t[1],f:F[i%4]}))}
function openDetail(id,push=true){const s=get(id);if(!s)return;if(D.hidden)lastFocus=document.activeElement;curD=id;
 const i=A.indexOf(id),nx=get(A[(i+1)%A.length]),pv=get(A[(i+A.length-1)%A.length]);
 const g=s.gallery.map(x=>({src:art(x[0]),t:x[1],d:x[2],kind:'paint',st:'钢笔淡彩',nat:x[3]}));const c=s.col||[];const by=k=>c.find(x=>x.kind===k);
 const seq=[g[0],by('rub'),by('cut'),by('wood'),by('stamp'),g[1],g[2],g[3]];
 const SL=[[1,3,33,-1.5],[37,0,29,1.5],[69,2,26,-2.5],[2,46,30,2],[36,40,18,-3],[57,46,24,-1],[72,60,24,2.5],[24,74,22,-2]];
 const list=[];let items='';
 seq.forEach((it,k)=>{if(!it)return;const [l,t,w,r]=SL[k];const n=list.push(it)-1;
  items+=`<figure class="ci ${it.kind}" style="left:${l}%;top:${t}%;width:${w}%;--r:${r}deg;--d:${k*60}ms" data-k="${n}" tabindex="0" role="button" aria-label="放大查看${it.t}"><div class="im"><img src="${it.src}" alt="${it.t}" loading="lazy"${it.kind=='rub'?' onload="window.XZfit&&XZfit(this)"':''}></div><figcaption><div class="ci-hd"><b>${it.t}</b><span>${it.st}</span></div>${it.d?`<p class="ci-desc">${it.d}</p>`:''}${it.rel?`<small class="ci-rel">${it.rel}</small>`:''}</figcaption></figure>`});
 const ST=storyOf(s),p=path('east',id);
 const tun=s.tunnel?`<section class="tun" id="d-tun" aria-label="提灯走甬道"><div class="tun-in" id="tunIn"><img src="${art(s.tunnel.img)}" alt="龟山汉墓甬道插画">${s.tunnel.caps.map(c=>`<p class="tcap" style="left:${c[0]*100}%;top:${c[1]*100}%" data-x="${c[0]}" data-y="${c[1]}">${c[2]}</p>`).join('')}<div class="dark"></div></div><p class="thint">移动鼠标或手指，提灯照亮甬道</p></section>`:'';
 const infoBlock = s.info ? `<section class="i5" aria-label="开放与游览信息">
  <div><small>开放时间</small><b>${s.info.open}</b></div>
  <div><small>门票与预约</small><b>${s.info.tix} · ${s.info.book}</b></div>
  <div><small>建议停留</small><b>${s.time}</b></div>
  <div${s.info.off&&!/^无/.test(s.info.off)?' class="warn"':''}><small>闭馆日</small><b>${s.info.off}</b></div>
  <div class="i5-go"><small>${s.go.m}到达</small><b>${s.go.l}</b><span class="i5-tip">${s.go.tip}</span></div>
  <p class="src"><span class="lv ${s.info.lv}">${LV[s.info.lv]}</span>来源：${s.info.src} · 2026年10月整理 · 节假日可能调整，以官方公告为准</p>
 </section>` : '';
 D.innerHTML=`<div class="v5bar"><button id="dClose" class="bk" aria-label="返回">‹ <span>返回</span></button><b class="bt">${s.n}</b><nav class="d-toc" aria-label="本页目录">${TOC.map(([k,t])=>`<button data-t="${k}">${t}</button>`).join('')}</nav><button class="bnav" type="button" data-map-guide="${id}">地图引导 →</button></div>
 <article class="dv5">
 <section class="dv5-hero" aria-label="${s.n}概览">
  <header class="h5"><p class="eye">${s.tag} · ${s.era}</p><h1>${s.n}</h1><p class="sub">${s.line}</p><p class="h5-lead">${s.lead}</p><div class="h5act">${stPill(id)}<button class="pcbtn" type="button" data-pc="${id}">生成明信片</button><button class="pcbtn" type="button" data-trip-top="${id}">+ 加入行程</button></div></header>
  <figure class="h5img"><img src="${artThemed(s.cover)}" alt="${s.n}插画"></figure>
 </section>
 ${infoBlock}
 <section class="story-wrap" id="d-story" aria-label="${s.n}的故事">
  <header class="sh"><p class="eye">01 · 循迹细读</p><h2>走进${s.n}的时空脉络</h2><p>点击或滑动右侧任一历史切片，左侧画幅同步聚焦对应景致与建筑细部。</p></header>
  <div class="story"><div class="stk"><div class="frame"><div class="cam" id="cam"><img class="ia on" src="${artThemed(ST[0].img||s.cover)}" alt=""><img class="ib" alt=""></div><div class="spin" id="spin"><i></i><span></span></div></div><div class="sdots">${ST.map((_,k)=>`<button data-s="${k}" aria-label="第${k+1}段"></button>`).join('')}</div></div>
  <div class="steps">${ST.map((x,k)=>`<div class="step" data-s="${k}" tabindex="0" role="button"><div class="sc"><p class="eye">${String(k+1).padStart(2,'0')} · ${x.k}</p>${x.t?`<h3>${x.t}</h3>`:''}<p>${x.d}</p></div></div>`).join('')}</div></div>
 </section>
 ${tun}${window.V6?V6.moment(s):''}
 <section class="d5" id="d-culture"><header class="sh"><p class="eye">02 · 文化图录</p><h2>${s.culture.t}</h2><p>${s.culture.d}</p></header><div class="board">${items}</div>${mustList(s)}</section>
 <section class="d5" id="d-tl"><header class="sh"><p class="eye">03 · 历史年表</p><h2>时间里的${s.n}</h2></header><ol class="tl5">${s.tl.map(t=>`<li><b>${t[0]}</b><p>${t[1]}</p></li>`).join('')}</ol></section>
 <section class="d5" id="d-food"><header class="sh"><p class="eye">04 · 风物寻味</p><h2>逛累了，来一口</h2></header><div class="f5"><img src="${art('food_'+s.food.k)}" alt="${s.food.n}插画" loading="lazy"><div><small>附近可尝</small><h3>${s.food.n}</h3><p>${s.food.d}</p></div></div></section>
 <section class="d5" id="d-go"><header class="sh"><p class="eye">05 · 行旅路引</p><h2>从徐州东站出发</h2><p>全程约 ${p?p.min:'—'} 分钟（估算），出发前用导航确认实时信息。</p></header>
  <div class="g5"><ol>${p?p.legs.map(l=>{const [cc,gg]=MC[l.mode];return `<li style="--c:${cc}"><span class="m">${gg}</span><div><b>${l.mode} · 约${l.min}分</b><p>${l.txt}</p><small>到 ${NAME(l.to)}</small></div></li>`}).join(''):''}</ol>
  <div class="acts"><button class="b5 pri" type="button" data-map-guide="${id}">站内地图逐步引导 →</button><button class="b5" data-plan="${id}">换个起点规划</button><button class="b5" data-trip="${id}">加入我的行程</button><a class="pc-ext-amap" href="${amapTo(id)}" target="_blank" rel="noopener">室外高德 ↗</a></div></div></section>
 ${window.V6?V6.srcSec(s):''}
 <nav class="dnext" aria-label="上一站下一站"><a href="#site-${pv.id}"><img src="${artThemed(pv.cover)}" alt=""><span><small>上一站</small><b>${pv.n}</b></span></a><a href="#site-${nx.id}"><img src="${artThemed(nx.cover)}" alt=""><span><small>下一站</small><b>${nx.n}</b></span></a></nav>
 </article>`;
 D.hidden=false;D.scrollTop=0;document.body.style.overflow='hidden';document.body.classList.add('ed-detail-open');
 $('#dClose').onclick=closeDetail;
 $('[data-plan]',D).onclick=()=>{closeDetail();planTo(id,'east')};
 $$('[data-map-guide]',D).forEach(b=>b.onclick=()=>{closeDetail();planTo(id,'east')});
 $('[data-trip]',D).onclick=e=>{addTrip(id);e.currentTarget.textContent='已加入行程 ✓'};
 const tt=$('[data-trip-top]',D);if(tt)tt.onclick=e=>{addTrip(id);e.currentTarget.textContent='✓ 已加入行程'};
 $$('.board figure',D).forEach(f=>{const o=()=>openLB(list,+f.dataset.k);f.onclick=o;f.onkeydown=e=>{if(e.key==='Enter')o()}});
 const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{root:D,threshold:.12});$$('.ci,.tl5 li,.f5,.g5,.sh,.i5,.intro5,.must',D).forEach(el=>io.observe(el));
 detailInit(s,ST);window.V6&&V6.afterDetail(D,s);
 if(push&&location.hash!=='#site-'+id)history.pushState(null,'','#site-'+id);$('#dClose').focus({preventScroll:true});emit('detail',id)}

/* v5 背景纹样：汉代云气纹 + 景点专属线稿 */
const CLP=['<path d="M20 140 C90 140 120 80 175 78 C228 76 238 132 200 138 C172 142 166 108 190 104"/><path d="M30 152 C100 154 130 96 178 92 C214 90 222 122 204 126"/><path d="M175 78 C210 40 290 30 330 62 C362 88 348 124 318 118 C296 113 302 88 322 92"/><path d="M250 44 C268 20 300 12 318 26"/><path d="M330 62 C350 52 372 54 388 66"/><path d="M98 120 C108 98 130 92 142 104 C150 112 144 124 134 120"/>',
'<path d="M10 120 C60 60 130 130 170 100 C200 78 186 46 160 52 C140 57 146 82 164 78"/><path d="M170 100 C220 70 260 110 300 88 C330 72 360 70 380 90"/><path d="M300 88 C310 60 340 48 358 62 C370 72 362 88 350 84"/><path d="M22 134 C70 86 132 146 178 114"/><path d="M200 118 C240 98 270 130 310 110"/>',
'<path d="M190 150 C150 150 110 120 120 82 C128 52 170 46 184 70 C194 88 178 104 164 96"/><path d="M120 82 C80 70 50 90 40 120 C34 140 50 152 64 144"/><path d="M184 70 C200 40 250 30 280 50 C304 66 300 96 278 98 C262 99 258 82 270 78"/><path d="M280 50 C310 36 350 44 370 66"/><path d="M200 160 C240 162 300 150 340 120"/>'];
window.XZ_CLP=CLP;
const cloud=(v,cls,st,k)=>`<i class="dk cl ${cls||''}" style="${st}" data-k="${k}" aria-hidden="true"><svg viewBox="0 0 400 170" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${CLP[v]}</svg></i>`;
const motif=(id,cls,st,k)=>`<i class="dk mo ${cls||''}" style="${st}" data-k="${k}" aria-hidden="true"><img src="assets/motif/${id}.webp" alt="" loading="lazy"></i>`;
const DL=x=>`left:calc(50% - 50vw + ${x}vw)`,DR=x=>`right:calc(50% - 50vw + ${x}vw)`;
function decorate(root,id){const put=(sel,html)=>{const el=$(sel,root);if(el)el.insertAdjacentHTML('afterbegin',html)};
 put('.h5',cloud(0,'',`${DL(2)};top:-10px;width:min(24vw,360px)`,.18)+cloud(2,'',`${DR(3)};top:150px;width:min(20vw,300px)`,.1));
 put('.story',motif(id,'big',`${DR(4)};top:-40px;width:min(30vw,460px)`,.14)+cloud(1,'mh',`${DL(1)};top:55%;width:min(18vw,280px)`,.22));
 put('#d-culture',cloud(0,'fl',`${DR(2)};top:-20px;width:min(24vw,360px)`,.16)+cloud(2,'mh',`${DL(0)};bottom:12%;width:min(16vw,240px)`,.2));
 put('#d-tl',motif(id,'fl mh',`${DR(5)};top:10px;width:min(24vw,360px)`,.12));
 put('#d-food',cloud(1,'',`${DL(2)};top:0;width:min(22vw,320px)`,.18));
 put('#d-go',cloud(2,'fl',`${DR(2)};top:30%;width:min(22vw,320px)`,.16)+motif(id,'sm mh',`${DL(3)};bottom:-60px;width:min(18vw,260px)`,.1));
 return $$('.dk',root)}
function parallax(list){const vh=innerHeight;list.forEach(el=>{const p=el.parentElement.getBoundingClientRect(),c=p.top+el.offsetTop+el.offsetHeight/2;if(c<-vh||c>vh*2)return;el.style.transform=`translate3d(0,${((c-vh/2)*+el.dataset.k).toFixed(1)}px,0)`})}

/* 首页背景云气纹 */
(()=>{const put=(sel,h)=>{const el=$(sel);if(el){el.style.position='relative';el.insertAdjacentHTML('afterbegin',h)}};
 put('#sites',cloud(0,'fl',`${DR(3)};top:60px;width:min(26vw,380px)`,.15)+cloud(2,'mh',`${DL(1)};bottom:8%;width:min(18vw,260px)`,.2));
 put('#go',cloud(1,'',`${DR(2)};top:40px;width:min(24vw,340px)`,.15));
 const H=$$('#sites>.dk,#go>.dk');let rq=0;addEventListener('scroll',()=>{if(!rq)rq=requestAnimationFrame(()=>{rq=0;parallax(H)})},{passive:true});parallax(H)})();
function detailInit(s,ST){const nav=$('.d-toc',D),bs=$$('button',nav),bar=$('.v5bar',D),DK=decorate(D,s.id);
 const top=el=>el.getBoundingClientRect().top-D.getBoundingClientRect().top+D.scrollTop;
 bs.forEach(b=>b.onclick=()=>{const el=document.getElementById(b.dataset.t);if(el)D.scrollTo({top:top(el)-70,behavior:'smooth'})});
 const cam=$('#cam'),ia=$('.ia',cam),ib=$('.ib',cam),spin=$('#spin'),steps=$$('.step',D),dots=$$('.sdots button',D);let cur=-1,front=ia,curImg=ST[0].img||s.cover;
 dots.forEach(d=>d.onclick=()=>{setStep(+d.dataset.s);window.XZ_CUE&&XZ_CUE(392,1.2)});
 steps.forEach(st=>{st.onclick=()=>{setStep(+st.dataset.s);window.XZ_CUE&&XZ_CUE(392,1.2)};st.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();setStep(+st.dataset.s);window.XZ_CUE&&XZ_CUE(392,1.2)}}});
 function setStep(k){if(k===cur)return;cur=k;const x=ST[k],im0=x.img||s.cover,cv=window.V6?V6.conv(im0,!!x.fit):(a,b)=>[a,b];let [fx,fy,fk]=x.f||[.5,.5,1];[fx,fy]=cv(fx,fy);
  steps.forEach((el,j)=>el.classList.toggle('on',j===k));dots.forEach((el,j)=>el.classList.toggle('on',j===k));
  const im=im0;if(im!==curImg){curImg=im;const back=front===ia?ib:ia;back.src=artThemed(im);back.classList.toggle('fit',!!x.fit);back.classList.add('on');front.classList.remove('on');front=back}else front.classList.toggle('fit',!!x.fit);
  const m=(1-1/fk)/2,sx=Math.max(-m,Math.min(m,.5-fx)),sy=Math.max(-m,Math.min(m,.5-fy));
  cam.style.transform=`scale(${fk}) translate(${(sx*100).toFixed(2)}%,${(sy*100).toFixed(2)}%)`;
  if(x.p){const [qx,qy]=cv(x.p[0],x.p[1]),px=.5+(qx-.5+sx)*fk,py=.5+(qy-.5+sy)*fk;spin.style.left=px*100+'%';spin.style.top=py*100+'%';$('span',spin).textContent=x.p[2];spin.classList.add('on')}else spin.classList.remove('on')}
 setStep(0);
 /* 提灯 */
 const T=$('#tunIn');if(T){const caps=$$('.tcap',T);let auto=true;
  const light=(x,y)=>{T.style.setProperty('--x',x*100+'%');T.style.setProperty('--y',y*100+'%');const r=T.getBoundingClientRect();
   caps.forEach(c=>{const dx=(x-c.dataset.x)*r.width,dy=(y-c.dataset.y)*r.height;c.classList.toggle('lit',Math.hypot(dx,dy)<Math.max(120,r.width*.14))})};
  const mv=e=>{auto=false;const r=T.getBoundingClientRect(),pt=e.touches?e.touches[0]:e;light((pt.clientX-r.left)/r.width,(pt.clientY-r.top)/r.height)};
  T.addEventListener('pointermove',mv);T.addEventListener('touchmove',mv,{passive:true});T.addEventListener('pointerleave',()=>auto=true);
  T._auto=()=>{if(!auto)return;const r=T.getBoundingClientRect(),q=Math.max(0,Math.min(1,(innerHeight*.75-r.top)/(r.height+innerHeight*.3)));light(.25+q*.5,.25+q*.5)};light(.25,.25)}
 let raf=0;const upd=()=>{raf=0;let k=-1;TOC.forEach(([id],j)=>{const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<innerHeight*.4)k=j});
  if(D.scrollTop+D.clientHeight>=D.scrollHeight-4)k=TOC.length-1;
  bs.forEach((b,j)=>{b.classList.toggle('on',j===k);j===k?b.setAttribute('aria-current','true'):b.removeAttribute('aria-current')});
  bar.classList.toggle('solid',D.scrollTop>40);
  const on=bs[k];if(on&&innerWidth<=720){const r=on.getBoundingClientRect(),nr=nav.getBoundingClientRect();if(r.left<nr.left||r.right>nr.right)nav.scrollTo({left:on.offsetLeft-16,behavior:'smooth'})}
  let sk=0;steps.forEach((el,j)=>{if(el.getBoundingClientRect().top<innerHeight*.55)sk=j});setStep(sk);
  T&&T._auto();parallax(DK)};
 D.onscroll=()=>{if(!raf)raf=requestAnimationFrame(upd)};upd()}
function closeDetail(){if(D.hidden)return;D.hidden=true;document.body.style.overflow='';document.body.classList.remove('ed-detail-open');curD=null;if(location.hash.startsWith('#site-'))history.pushState(null,'',location.pathname+location.search);lastFocus&&lastFocus.focus&&lastFocus.focus()}
const LB=$('#lb');let lbS,lbK;
function openLB(L2,k){lbS=L2;lbK=k;const g=L2[k];LB.innerHTML=`<div class="lbb"><button id="lbX" aria-label="关闭">×</button></div><button class="side prev" aria-label="上一张">‹</button><img src="${g.src}" alt="${g.t}"><div class="cap"><b>${g.t}</b><small>${g.st||''}${g.nat?` · <em class="nat">${g.nat}</em>`:''}</small>${g.d}${g.rel?`<span class="rel">与景点：${g.rel}</span>`:''}</div><button class="side next" aria-label="下一张">›</button>`;LB.hidden=false;
 $('#lbX').onclick=()=>LB.hidden=true;$('.prev',LB).onclick=()=>openLB(L2,(k+L2.length-1)%L2.length);$('.next',LB).onclick=()=>openLB(L2,(k+1)%L2.length);$('#lbX').focus()}
LB.onclick=e=>{if(e.target===LB)LB.hidden=true};
addEventListener('keydown',e=>{if(e.key==='Escape'){if(!LB.hidden)LB.hidden=true;else closeDetail()}if(!LB.hidden&&e.key==='ArrowRight')openLB(lbS,(lbK+1)%lbS.length);if(!LB.hidden&&e.key==='ArrowLeft')openLB(lbS,(lbK+lbS.length-1)%lbS.length)});
function goPlay(id){if(!GAMES.includes(id)){openDetail(id);return}closeDetail();emit('play',id);document.getElementById('play').scrollIntoView({behavior:'smooth'})}
function route_(){const h=location.hash;if(h.startsWith('#site-'))openDetail(h.slice(6),false);else{closeDetail();if(h.startsWith('#play-')){const id=h.slice(6);if(get(id))setTimeout(()=>goPlay(id),60)}}}
addEventListener('popstate',route_);addEventListener('hashchange',route_);
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#play-"]');if(a){e.preventDefault();goPlay(a.getAttribute('href').slice(6))}});

window.XZ={status,addTrip,get,art,sceneCover,ip,esc,on,emit,stamp,has:id=>stamps.includes(id),stamps:()=>stamps.slice(),openDetail,closeDetail,goPlay,goStop:id=>{const scEl=document.getElementById('scroll');if(scEl){scEl.scrollIntoView();setTimeout(()=>goStop(O.indexOf(id)),50)}else{const lm=document.getElementById('landmark-'+id)||document.getElementById('sites');lm&&lm.scrollIntoView({behavior:'smooth'})}},planTo,path,NAME,modes,amapTo,openLB,decorate,parallax,cloud,stPill,curStop:()=>curI>=0?O[curI]:null};
const FEAT={gs:['✦ 提灯走甬道',''],bwg:['✦ 玉衣放大镜',''],sz:['✦ 隔空拓印','jade'],xmt:['✦ 隔空拓印','jade'],hbs:['✦ 隔空拓印','jade'],hlw:['✦ 隔空拓印','jade'],wm:['✦ 隔空拓印','jade'],yls:['✦ 隔空拓印','jade'],ylh:['✦ 隔空拓印','jade']};
const CN_NUM=['壹','贰','叁','肆','伍','陆','柒','捌','玖'];
const EN_CODE={xmt:'XIMATAI',gs:'GUISHAN TOMB',sz:'SHIZISHAN',bwg:'XUZHOU MUSEUM',hbs:'HUBUSHAN',hlw:'HUILONGWO',wm:'WENMIAO',yls:'YUNLONG HILL',ylh:'YUNLONG LAKE'};
const AMB_TINT={
 xmt:'rgba(208, 92, 62, 0.26)',
 gs:'rgba(116, 158, 168, 0.24)',
 sz:'rgba(206, 152, 82, 0.25)',
 bwg:'rgba(146, 182, 162, 0.24)',
 hbs:'rgba(196, 146, 86, 0.24)',
 hlw:'rgba(214, 154, 88, 0.26)',
 wm:'rgba(198, 114, 78, 0.24)',
 yls:'rgba(118, 162, 152, 0.24)',
 ylh:'rgba(104, 148, 198, 0.26)'
};
function renderSites(){const g=$('#sgrid');if(!g)return;
 const list=window.ALL||O;
 g.innerHTML=list.map((id,i)=>{
  const s=get(id),ft=FEAT[id];
  const no=String(i+1).padStart(2,'0');
  const cover=sceneCover(s.cover);
  const loading=WECHAT||i>=2?'lazy':'eager';
  return `<article class="iz-scene iz-folio" id="landmark-${id}" style="--iz-idx:${i+1};--folio-tint:${AMB_TINT[id]||'rgba(198, 162, 102, 0.22)'}" data-id="${id}" data-amb="assets/img/night/${id}_night.webp" data-hud-no="${no}" data-hud-name="${CN_NUM[i]} · ${s.n}" data-amb-side="left" data-amb-tint="${AMB_TINT[id]||'rgba(198, 162, 102, 0.22)'}">
   ${WECHAT?'':`<div class="iz-folio-bg" aria-hidden="true">
    <img src="${cover}" alt="" loading="${loading}" decoding="async">
    <i class="iz-folio-aura"></i>
    <i class="iz-folio-veil"></i>
   </div>`}
   <div class="iz-folio-in">
    <span class="iz-vert-tag" aria-hidden="true">${no} · ${EN_CODE[id]||id.toUpperCase()}</span>
    <div class="iz-copy">
     <div class="iz-num-row"><span class="iz-cn">${CN_NUM[i]}</span><small class="iz-era">${s.era}</small></div>
     <h3 class="serif"><a href="#site-${id}" class="iz-mask"><i class="iz-line-in">${s.n}</i></a></h3>
     <p class="iz-sub">${s.line}</p>
     <p class="iz-lead">${s.lead}</p>
     <div class="iz-foot">
      <a class="iz-enter" href="#site-${id}">入画观展 <i>→</i></a>
      ${ft?`<span class="iz-feat">${ft[0]}</span>`:''}
     </div>
    </div>
    <a class="iz-stage" href="#site-${id}" aria-label="入画观展：${s.n}">
     <figure class="iz-main"><img src="${cover}" alt="${s.n}手绘" loading="${loading}" decoding="async"></figure>
    </a>
   </div>
  </article>`;
 }).join('');
}
renderSites();setInterval(()=>{
 // 仅定时更新开放状态无需重建整套空灵画幅，避免闪烁
},60000);
layout();renderPlanner();renderBuilder();renderPass();setTimeout(route_,0);
})();

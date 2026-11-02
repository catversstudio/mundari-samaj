/* Mundari Samaj v4 — feature loader (Articles / News / Stories / Gallery).
   A faithful port of the uploaded zip's app.js: same JSON paths, same
   rendering and the same honesty rule (only status==="published" records
   render; unverified articles show the Editorial note). Changes vs the
   zip: the menu handler is gone (the v3 header has its own toggle script),
   every DOM binding is null-guarded, the homepage story/gallery grids now
   also filter to published records, and rendered classes carry the fx-
   prefix used by features.css / the homepage styles. */
const paths={articles:"content/articles.json",news:"content/news.json",stories:"content/stories.json",gallery:"content/gallery.json"};
const $=s=>document.querySelector(s);
const esc=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function load(k){try{let r=await fetch(paths[k]);return r.ok?await r.json():[]}catch(e){return[]}}
const published=x=>x.status==="published";
function art(t){return `<div class="fx-card-art" data-tone="${esc(t||"sage")}"></div>`}
function card(x){return `<article class="fx-content-card">${art(x.tone)}<div class="fx-card-body"><span class="fx-tag">${esc(x.category)} · ${esc(x.readTime)}</span><h3>${esc(x.title)}</h3><p>${esc(x.excerpt)}</p><div class="fx-card-foot"><span>${esc(x.date)}</span><a href="article.html?id=${encodeURIComponent(x.id)}">Read article ↗</a></div></div></article>`}
function detail(x,k,el){let b=Array.isArray(x.body)?x.body.map(v=>v.type==="h2"?`<h2>${esc(v.text)}</h2>`:`<p>${esc(v.text)}</p>`).join(""):`<p>${esc(x.body)}</p>`;el.innerHTML=`<article class="fx-article-layout"><a href="${k}.html">← Back</a><p class="section-kicker">${esc(x.category)} · ${esc(x.date)}</p><h1>${esc(x.title)}</h1><p class="fx-lead">${esc(x.excerpt)}</p><p class="fx-meta">By ${esc(x.author||x.contributor||"Mundari Samaj")} · ${esc(x.readTime||"")}</p>${x.verified===false?'<div class="fx-notice"><b>Editorial note:</b> Introductory material. Check community-specific claims with reliable sources and relevant knowledge holders.</div>':""}<div class="fx-body-copy">${b}</div></article>`}
async function home(){
  const grid=$("#article-grid");if(!grid)return;
  let [a,n,s,g]=await Promise.all(["articles","news","stories","gallery"].map(load));
  let f="all";
  function show(){let list=a.filter(x=>published(x)&&(f==="all"||x.category===f));grid.innerHTML=list.slice(0,3).map(card).join("");const c=$("#article-count");if(c)c.textContent=list.length+" articles"}
  show();
  const flt=$("#article-filters");
  if(flt)flt.onclick=e=>{let b=e.target.closest("[data-filter]");if(!b)return;f=b.dataset.filter;document.querySelectorAll(".fx-chip").forEach(x=>x.classList.toggle("active",x===b));show()};
  const nl=$("#news-list");
  if(nl)nl.innerHTML=n.filter(published).map(x=>`<article class="fx-news-item"><div class="fx-news-date">${esc(x.date)}<br>${esc(x.category)}</div><div><h3>${esc(x.title)}</h3><p>${esc(x.excerpt)}</p></div><a href="news.html?id=${x.id}">↗</a></article>`).join("");
  const sg=$("#story-grid");
  if(sg)sg.innerHTML=s.filter(published).slice(0,2).map(x=>`<article class="fx-story-card"><span class="fx-tag">${esc(x.place)}</span><h3>${esc(x.title)}</h3><p>${esc(x.excerpt)}</p></article>`).join("");
  const gg=$("#gallery-grid");
  if(gg)gg.innerHTML=g.filter(published).map(x=>`<div class="fx-gallery-tile"><b>${esc(x.title)}</b></div>`).join("");
  const gs=$("#global-search"),sb=$("#search-button"),sr=$("#search-results");
  if(gs&&sb&&sr){
    let run=()=>{let q=gs.value.toLowerCase().trim();let all=[...a.map(x=>({...x,t:"Article",u:"article.html"})),...n.map(x=>({...x,t:"News",u:"news.html"})),...s.map(x=>({...x,t:"Story",u:"stories.html"}))].filter(x=>published(x)&&q&&(x.title+" "+x.excerpt+" "+x.category).toLowerCase().includes(q));sr.innerHTML=all.map(x=>`<a href="${x.u}?id=${x.id}"><b>${esc(x.title)}</b> — ${x.t}</a>`).join("")||(q?"<p>No results found.</p>":"")};
    sb.onclick=run;gs.onkeydown=e=>{if(e.key==="Enter")run()};
  }
}
async function listing(k){
  const el=$("#page-list");if(!el)return;
  let d=await load(k),id=new URLSearchParams(location.search).get("id");
  if(id){let x=d.find(y=>y.id===id);if(x)detail(x,k,el);else el.innerHTML='<div class="fx-empty-state">Content not found.</div>';return}
  d=d.filter(published);
  if(k==="news"){el.innerHTML=d.map(x=>`<article class="fx-news-item"><div class="fx-news-date">${esc(x.date)}</div><div><h3>${esc(x.title)}</h3><p>${esc(x.excerpt)}</p></div><a href="news.html?id=${x.id}">↗</a></article>`).join("")}
  else if(k==="gallery"){el.innerHTML='<div class="fx-gallery-grid">'+d.map(x=>`<div class="fx-gallery-tile"><b>${esc(x.title)}</b></div>`).join("")+"</div>"}
  else if(k==="stories"){el.innerHTML='<div class="fx-card-grid">'+d.map(x=>`<article class="fx-content-card"><div class="fx-card-body"><span class="fx-tag">${esc(x.place)}</span><h3>${esc(x.title)}</h3><p>${esc(x.excerpt)}</p><a href="stories.html?id=${x.id}">Read story →</a></div></article>`).join("")+"</div>"}
  else el.innerHTML='<div class="fx-card-grid">'+d.map(card).join("")+"</div>";
}
document.addEventListener("DOMContentLoaded",()=>{if($("#article-grid"))home();if(document.body.dataset.page)listing(document.body.dataset.page)});

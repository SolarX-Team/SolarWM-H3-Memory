'use strict';
const zh=document.documentElement.lang==='zh';
const sections=[...document.querySelectorAll('.article-section,.toc-anchor')];
document.querySelectorAll('.toc a.sub').forEach(a=>{const h=document.getElementById(a.hash.slice(1));if(h)a.textContent=h.textContent.trim();});
const toc=document.getElementById('contents'),toggle=document.querySelector('.toc-btn');
function closeToc(){toc.classList.remove('open');toggle.setAttribute('aria-expanded','false');}
toggle.addEventListener('click',()=>{const open=!toc.classList.contains('open');toc.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));});
toc.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeToc));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeToc();});
document.addEventListener('click',e=>{if(!toc.contains(e.target)&&!toggle.contains(e.target))closeToc();});
let scheduled=false;
function updateSection(){
 // Native fragment scrolling combines root scroll-padding with the target's
 // scroll-margin. Use that same boundary, allowing for subpixel rounding.
 const padding=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;
 let current=sections[0];
 for(const section of sections){
  const margin=parseFloat(getComputedStyle(section).scrollMarginTop)||0;
  if(section.getBoundingClientRect().top<=padding+margin+2)current=section;
 }
 // A parent heading and its first subsection can both fall inside their
 // offsets. Prefer the linked heading while it is at its anchor position.
 const target=sections.find(section=>'#'+section.id===window.location.hash);
 const targetMargin=target?(parseFloat(getComputedStyle(target).scrollMarginTop)||0):0;
 if(target&&Math.abs(target.getBoundingClientRect().top-padding-targetMargin)<=2)current=target;
 else if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-2)current=sections[sections.length-1];
 document.querySelectorAll('.toc a').forEach(a=>{
  const active=a.hash==='#'+(current.dataset.toc||current.id);
  a.classList.toggle('active',active);
  if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');
 });
 document.querySelectorAll('a[data-language]').forEach(a=>{a.href=(a.dataset.language==='en'?'en.html':'index.html')+(window.scrollY>200?'#'+current.id:'');});
 scheduled=false;
}
function scheduleSectionUpdate(){if(!scheduled){scheduled=true;requestAnimationFrame(updateSection);}}
addEventListener('scroll',scheduleSectionUpdate,{passive:true});
addEventListener('resize',scheduleSectionUpdate);
addEventListener('hashchange',scheduleSectionUpdate);
addEventListener('load',scheduleSectionUpdate);
updateSection();
// Hover reveals the authors; keyboard focus also keeps their links accessible.
const authorGroup=document.querySelector('.author-fold');
const authorRest=authorGroup.querySelector('.author-rest');
let authorHover=false,authorKeyboard=false;
function syncAuthors(){
 const expanded=authorHover||authorKeyboard;
 authorRest.hidden=!expanded;
 authorGroup.querySelector('.author-etal').hidden=expanded;
}
authorGroup.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){authorHover=true;syncAuthors();}});
authorGroup.addEventListener('pointerleave',()=>{authorHover=false;syncAuthors();});
authorGroup.addEventListener('focusin',e=>{if(e.target.matches(':focus-visible')){authorKeyboard=true;syncAuthors();}});
authorGroup.addEventListener('focusout',e=>{if(!authorGroup.contains(e.relatedTarget)){authorKeyboard=false;syncAuthors();}});
syncAuthors();
const copyCitation=document.querySelector('.copy-citation');
copyCitation.addEventListener('click',async()=>{
 const status=document.querySelector('.citation-status');
 try {await navigator.clipboard.writeText(document.getElementById('citation-code').textContent);status.textContent=zh?'已复制 BibTeX':'BibTeX copied';}
 catch {status.textContent=zh?'请选中下方文本复制，或下载 .bib 文件。':'Select the text to copy, or download the .bib file.';}
});
const frameDialog=document.querySelector('.frame-dialog');
const frameImage=frameDialog.querySelector('.frame-dialog-image');
const frameCaption=document.getElementById('frame-dialog-caption');
document.querySelectorAll('.frame-zoom').forEach(button=>button.addEventListener('click',()=>{
 frameImage.src=button.dataset.frame;frameImage.alt=button.dataset.caption;
 frameCaption.textContent=button.dataset.caption;frameDialog.showModal();
}));
frameDialog.querySelector('.frame-dialog-close').addEventListener('click',()=>frameDialog.close());
frameDialog.addEventListener('click',e=>{if(e.target===frameDialog){const r=frameDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)frameDialog.close();}});
// Independent galleries retain selection and pause media when switching cases.
document.querySelectorAll('.case-gallery').forEach(gallery=>{
 const tabs=[...gallery.querySelectorAll('[role="tab"]')];
 function select(tab){
  tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;const panel=document.getElementById(t.getAttribute('aria-controls'));panel.hidden=!active;if(!active)panel.querySelectorAll('video').forEach(v=>v.pause());});
 }
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let index;if(e.key==='ArrowRight')index=(i+1)%tabs.length;else if(e.key==='ArrowLeft')index=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();select(tabs[index]);tabs[index].focus();});});
 gallery.querySelectorAll('.seek-frame').forEach(button=>button.addEventListener('click',()=>{const v=button.closest('.case-panel').querySelector('video');const seek=()=>{v.pause();v.currentTime=Number(button.dataset.time)+.001;v.scrollIntoView({behavior:'smooth',block:'center'});};if(v.readyState>=1)seek();else{v.addEventListener('loadedmetadata',seek,{once:true});v.load();}}));
});
const leaderboardExpand=document.querySelector('.leaderboard-expand');
if(leaderboardExpand)leaderboardExpand.addEventListener('click',()=>{const open=leaderboardExpand.getAttribute('aria-expanded')!=='true';leaderboardExpand.setAttribute('aria-expanded',String(open));document.querySelectorAll('[data-extra-row]').forEach(row=>row.hidden=!open);leaderboardExpand.textContent=zh?(open?'收起榜单':'展开其余 20 个模型'):(open?'Show fewer models':'Show 20 more models');});
document.querySelectorAll('.data-clip video').forEach(video=>{const label=video.parentElement.querySelector('.data-phase');video.addEventListener('timeupdate',()=>{const query=video.currentTime>=85/24;label.textContent=query?'Query':'History';label.classList.toggle('is-query',query);});});

// Revisit-data block: the view-angle curve doubles as a scrubber for the clip above it.
document.querySelectorAll('.rv-track').forEach(track=>{
 const video=track.closest('.rv-figure').querySelector('video'),head=track.querySelector('.rv-playhead'),plot=track.querySelector('.rv-plot'),duration=Number(track.dataset.duration);
 const draw=()=>{const f=Math.min(1,video.currentTime/duration);head.style.left=(f*100)+'%';track.setAttribute('aria-valuenow',video.currentTime.toFixed(1));};
 const seek=t=>{const go=()=>{video.currentTime=Math.max(0,Math.min(duration-.05,t));draw();};if(video.readyState>=1)go();else{video.addEventListener('loadedmetadata',go,{once:true});video.load();}};
 video.addEventListener('timeupdate',draw);video.addEventListener('seeked',draw);
 track.addEventListener('click',e=>{const r=plot.getBoundingClientRect();seek((e.clientX-r.left)/r.width*duration);});
 track.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();seek(video.currentTime+(e.key==='ArrowRight'?2:-2));}});
});
// Native controls show the shortened video; the caption tracks source rollout time.
document.querySelectorAll('.rollout-figure').forEach(figure=>{
 const video=figure.querySelector('video'),output=figure.querySelector('.rollout-source-time');
 const update=()=>{const seconds=Math.min(180,Math.floor(video.currentTime*Number(video.dataset.sourceSpeed)+1e-6));output.textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');};
 video.addEventListener('timeupdate',update);video.addEventListener('seeked',update);video.addEventListener('ended',update);
});

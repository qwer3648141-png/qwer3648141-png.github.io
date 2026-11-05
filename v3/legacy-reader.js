"use strict";
/* Read-only legacy lesson viewer. Do not mutate or reset original progress. */
(function(){
 const bank=window.ENJP_MIGRATED,Audio=window.ENJP_Audio;
 if(!bank||!Audio)return;
 const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
 const add=(p,...items)=>{p.append(...items);return p};
 const rubyPattern=/<ruby>([^<]*)<rt>([^<]*)<\/rt><\/ruby>/g;
 function annotated(html){
   return String(html||"").replace(rubyPattern,(_,surface,reading)=>/^[一-龯々]+$/.test(surface)&&/^[ぁ-ゖー]+$/.test(reading)?surface+"（"+reading+"）":surface).replace(/<[^>]*>/g,"").replaceAll("&nbsp;"," ");
 }
 const ruby=t=>Audio.makeRuby(annotated(t));
 const safe=t=>Audio.spokenJapanese(annotated(t))?annotated(t):null;
 function wordRuby(word,reading){
   if(/^[一-龯々]+$/.test(word)&&/^[ぁ-ゖー]+$/.test(reading))return word+"（"+reading+"）";
   const m=String(word).match(/^([一-龯々]+)([ぁ-ゖー]+)$/);
   if(m&&reading.endsWith(m[2]))return m[1]+"（"+reading.slice(0,-m[2].length)+"）"+m[2];
   return word;
 }
 function speak(row,status,label,text,lang){
   const button=el("button","play",label);button.type="button";
   if(!text){button.disabled=true;button.textContent="🔇 語音待校對";button.title="未取得可驗證的完整假名讀音"}
   else button.addEventListener("click",()=>Audio.play(text,lang,button,status));
   row.append(button);return button;
 }
 function header(n,id,kind){
   const div=el("div","quest-topline");
   div.append(el("span","quest-overline",kind+" / "+String(n+1).padStart(3,"0")));
   const tags=el("div","quest-tags");
   tags.append(el("span","quest-tier","舊版原始教材"),el("span","quest-state",id));
   div.append(tags);return div;
 }
 function identity(meaning,term,reading,meta){
   const box=el("div","quest-identity");
   box.append(el("span","quest-subhead","CORE VOCAB / 主要詞彙"));
   const word=el("div","word-main");word.append(term);box.append(word);
   if(reading)box.append(el("div","quest-reading",reading));
   if(meta)box.append(el("div","legacy-meta",meta));
   box.append(el("p","quest-meaning",meaning));
   return box;
 }
 function phraseExpand(target,rows){
   if(!rows||!rows.length)return;
   const panel=el("details","quest-breakdown");
   panel.append(el("summary","","▸ 查看詞彙搭配與延伸（"+rows.length+" 組）"));
   const grid=el("div","legacy-phrase-grid");
   rows.forEach(r=>{
     const block=el("div","legacy-phrase");
     if(r.en)block.append(el("p","",r.en));
     if(r.jp)block.append(add(el("p","legacy-phrase-jp"),ruby(r.jp)));
     if(r.cn)block.append(el("small","",r.cn));
     grid.append(block);
   });
   panel.append(grid);target.append(panel);
 }
 function example(target,lang,source){
   const box=el("div","quest-sentence");box.append(el("span","sentence-label",lang==="jp"?"日本語":"ENGLISH"));
   box.append(lang==="jp"?ruby(source):document.createTextNode(source||""));
   target.append(box);
 }
 function card(type,item,mode,i){
   const card=el("article","quest-card legacy-card");
   card.append(header(i,item.topic||item.lv||item.level||"",type.toUpperCase()));
   const core=el("div","quest-core"),right=el("div","quest-mission"),status=el("p","audio-status","");
   status.setAttribute("role","status");
   let left;
   const controls=el("div","audio-row");
   if(type==="vocab"){
     const isJP=mode==="jp";
     left=identity(item.cn,isJP?ruby(item.jp_ruby||item.jp):document.createTextNode(item.en),
       isJP?item.jp:item.kk?"KK｜"+item.kk:"",isJP?item.en+" · "+(item.pos||""):item.jp);
     right.append(el("span","quest-subhead","CONTEXT / 原版情境例句"));
     if(mode!=="jp")example(right,"en",item.ex_en);
     if(mode!=="en")example(right,"jp",item.ex_jp_ruby||item.ex_jp);
     right.append(el("p","quest-translation","中文｜"+item.ex_cn));
     phraseExpand(right,(item.phrase_details||[]).map(p=>({en:p.en,jp:p.jp_ruby||p.jp,cn:p.cn})));
     if(mode!=="jp"){
       speak(controls,status,"🔊 EN 單字",item.en,"en");
       speak(controls,status,"🔊 EN 例句",item.ex_en,"en");
     }
     if(mode!=="en"){
       speak(controls,status,"🔊 JP 單字",safe(item.jp_ruby||item.jp),"jp");
       speak(controls,status,"🔊 JP 例句",safe(item.ex_jp_ruby||item.ex_jp),"jp");
     }
   }else if(type==="grammar"){
     left=identity(item.m,ruby(item.f),item.p||"",item.x||"");
     right.append(el("span","quest-subhead","GRAMMAR / 正式文法例句"));
     example(right,"jp",item.j);
     right.append(el("p","quest-translation","中文｜"+item.c));
     phraseExpand(right,(item.chunks||[]).map(x=>({jp:x[0],en:x[1]})));
     speak(controls,status,"🔊 例句",safe(item.j),"jp");
   }else{
     left=identity(item.meaning,ruby(wordRuby(item.word,item.reading)),"読み｜"+item.reading,
       item.kind==="verb"?(item.type==="godan"?"第一類・五段":item.type==="ichidan"?"第二類・一段":"第三類・不規則"):(item.type==="i"?"い形容詞":"な形容詞"));
     right.append(el("span","quest-subhead","CONTEXT / 常用搭配短語"));
     (item.collocations||[]).forEach((x,j)=>{
       example(right,"jp",x);
       right.append(el("p","quest-translation","中文｜"+(item.collocationCn?.[j]||"")));
     });
     speak(controls,status,"🔊 單字",item.reading,"jp");
     right.append(el("p","legacy-note","搭配短語的振假名與語音尚待校對，不會擅自猜讀。"));
   }
   core.append(left,right);
   const foot=el("div","quest-footer");foot.append(controls,status);
   card.append(core,foot);return card;
 }
 function render(root,key,mode){
   const data=bank.sections[key];if(!data)return false;
   const all=data.items,size=12;
   const holder=el("section","legacy-deck");
   const intro=el("div","legacy-intro");
   intro.append(el("strong","",data.title+" · "+all.length+" 筆"),
     el("p","","原版教材完整搬入，包含詞義、例句及原有延伸片語。舊資料的部分日文標音仍需逐筆複核。"));
   const toolbar=el("div","legacy-toolbar");
   const label=el("label","","搜尋本節教材");
   const searchBox=el("input","legacy-filter");
   searchBox.type="search";searchBox.placeholder="搜尋英文、日文、中文、文法…";
   searchBox.setAttribute("aria-label","搜尋本節教材");
   toolbar.append(label,searchBox);
   const counter=el("div","legacy-count"),list=el("div","lesson-list game-lessons"),pager=el("nav","legacy-pager");
   pager.setAttribute("aria-label","教材頁碼");
   holder.append(intro,toolbar,counter,list,pager);root.append(holder);
   let page=0,query="";
   function getRows(){
     if(!query)return all;
     return all.filter(v=>(data.kind==="vocab"?[v.en,v.jp,v.cn,v.ex_cn,v.topic]:
       data.kind==="grammar"?[v.f,v.lv,v.m,v.p,v.c,v.x]:
       [v.word,v.reading,v.meaning,...(v.collocations||[]),...(v.collocationCn||[])])
       .some(t=>String(t||"").toLowerCase().includes(query)));
   }
   function draw(){
     const rows=getRows(),pages=Math.max(1,Math.ceil(rows.length/size));
     page=Math.min(Math.max(0,page),pages-1);const start=page*size;
     counter.textContent="目前顯示 "+(rows.length?start+1:0)+"–"+Math.min(rows.length,start+size)+" / "+rows.length+" 筆";
     list.replaceChildren();
     rows.slice(start,start+size).forEach(v=>list.append(card(data.kind,v,mode,all.indexOf(v))));
     if(!rows.length)list.append(el("p","legacy-note","查無結果，請換一個關鍵字。"));
     pager.replaceChildren();
     if(pages>1){
       const back=el("button","play alt","← 上一頁");back.type="button";back.disabled=page===0;
       const next=el("button","play alt","下一頁 →");next.type="button";next.disabled=page===pages-1;
       back.addEventListener("click",()=>{page--;Audio.stop();draw();holder.scrollIntoView({behavior:"smooth",block:"start"})});
       next.addEventListener("click",()=>{page++;Audio.stop();draw();holder.scrollIntoView({behavior:"smooth",block:"start"})});
       pager.append(back,el("strong","",String(page+1)+" / "+pages+" 頁"),next);
     }
   }
   searchBox.addEventListener("input",()=>{query=searchBox.value.toLowerCase().trim();page=0;Audio.stop();draw()});
   draw();return true;
 }
 window.ENJP_LegacyReader={render,annotated,wordRuby};
})();

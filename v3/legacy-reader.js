"use strict";
/* Read-only legacy lesson viewer. Do not mutate or reset original progress. */
(function(){
 const bank=window.ENJP_MIGRATED,Audio=window.ENJP_Audio,Forms=window.ENJP_Inflections;
 const verbExamples=window.ENJP_VERB_FORM_EXAMPLES||{};
 if(!bank||!Audio)return;
 const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
 const add=(p,...items)=>{p.append(...items);return p};
 const rubyPattern=/<ruby>([^<]*)<rt>([^<]*)<\/rt><\/ruby>/g;
 // Exact known corrections for incorrectly truncated readings in the original data.
 const verifiedCorrections={
   "今日|きょ":"きょう","今日|き":"きょう",
   "預金|うよきん":"よきん","禁止|きん":"きんし",
   "手続|んてつづ":"てつづ"
 };
 function annotated(html){
   // Two reviewed fixes in the imported source; leave original data files untouched.
   const source=String(html||"");
   if(source==="<ruby>十 分どころか、一時間待ちました<rt>じゅっぷんどころか、いちじかんまちました</rt></ruby>"){
     return "十分（じゅっぷん）どころか、一時間（いちじかん）待（ま）ちました";
   }
   return source.replace(rubyPattern,(_,surface,reading)=>{
     const fixed=verifiedCorrections[surface+"|"+reading]||reading;
     if(Forms){const aligned=Forms.annotation(surface,fixed);if(aligned!==surface)return aligned}
     return /^[一-龯々]+$/.test(surface)&&/^[ぁ-ゖー]+$/.test(fixed)?surface+"（"+fixed+"）":surface;
   }).replace(/<[^>]*>/g,"").replaceAll("&nbsp;"," ")
     .replace(/二つ(?!（)/g,"二（ふた）つ");
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

 function formPanel(item,i,status){
   if(!Forms)return null;
   const rows=item.kind==="verb"?Forms.verbForms(item):Forms.adjectiveForms(item);
   if(!rows||!rows.length)return null;
   const panel=el("details","conjugation-panel");
   panel.open=i===0;
   const name=item.kind==="verb"?"動詞活用 · "+rows.length+" 種變化":"形容詞活用 · "+rows.length+" 種變化";
   const summary=el("summary","","⚔️ "+name+"｜點擊展開學習");
   const hint=el("p","conjugation-rule",item.kind==="verb"?
     Forms.rule[item.type]||"依原版詞性分類呈現變化。":
     item.type==="i"?"い形容詞：い→くない／かった／く。注意「いい」會變成「よ」。":
     "な形容詞：連接名詞要加「な」，過去形用「だった」，副詞形用「に」。");
   panel.append(summary,hint);
   if(item.kind==="verb")panel.append(el("p","vf-context-note","每種變化都可展開 4 個完整例句。下方是同一種變化形式的示範，使用的動詞不一定是目前這個單字；請把它們和上面的變化結果一起比較。"));
   const grid=el("div","conjugation-grid");
   rows.forEach(row=>{
     const cell=el("div","conjugation-cell");
     const top=el("div","conjugation-row-head");
     top.append(el("strong","",row.key));
     const audio=el("button","conjugation-audio","🔊");
     audio.type="button";
     audio.setAttribute("aria-label","朗讀 "+row.key+" "+row.reading);
     audio.addEventListener("click",()=>Audio.play(row.reading,"jp",audio,status));
     top.append(audio);
     const expression=el("div","conjugation-word");
     expression.append(Audio.makeRuby(Forms.annotation(row.word,row.reading)));
     cell.append(top,expression,el("p","conjugation-help",row.hint||""));
     if(item.kind==="verb"&&Array.isArray(verbExamples[row.key])&&verbExamples[row.key].length){
       const details=el("details","vf-examples");
       details.append(el("summary","","📚 4 個"+row.key+"情境例句"));
       // Build the four samples only after opening this form, keeping pages with many verbs responsive.
       let populated=false;
       details.addEventListener("toggle",()=>{
         if(!details.open||populated)return;
         populated=true;
         const box=el("div","vf-example-list");
         for(const [ja,zh]of verbExamples[row.key]){
           const sample=el("div","vf-example");
           const sentence=el("p","vf-japanese");
           sentence.append(Audio.makeRuby(ja));
           sample.append(sentence,el("p","vf-chinese",zh));
           const button=el("button","vf-audio","🔊 播放這句");
           button.type="button";
           const voiceStatus=el("span","vf-audio-status","");
           voiceStatus.setAttribute("role","status");
           if(!Audio.spokenJapanese(ja)){
             button.disabled=true;button.title="這句尚未具備可驗證的完整漢字讀音";
           }else button.addEventListener("click",()=>Audio.play(ja,"jp",button,voiceStatus));
           sample.append(button,voiceStatus);box.append(sample);
         }
         details.append(box);
       });
       cell.append(details);
     }
     grid.append(cell);
   });
   panel.append(grid);
   const eligible=rows.filter(r=>r.key!=="辭書形"&&r.key!=="基本形");
   if(eligible.length){
     const quiz=el("section","conjugation-challenge");
     quiz.append(el("h4","","⚡ 活用小挑戰｜自己寫出變化形"));
     quiz.append(el("p","challenge-hint","輸入漢字或平假名均可。這是本次畫面的練習，不會修改舊版進度。"));
     const question=el("p","challenge-question");
     const row=el("div","challenge-controls");
     const input=el("input","challenge-input");
     input.type="text";input.autocomplete="off";
     input.setAttribute("lang","ja");input.setAttribute("aria-label","輸入正確的日文變化形");
     input.placeholder="在這裡輸入日文…";
     const check=el("button","quest-mark challenge-submit","確認答案"),next=el("button","quest-mark challenge-next","下一題");
     check.type="button";next.type="button";next.disabled=true;
     const feedback=el("div","challenge-result","");
     feedback.setAttribute("role","status");
     const tally=el("p","challenge-tally","本次練習：0 / 0 題");
     quiz.append(question,row,feedback,tally);
     row.append(input,check,next);
     let active=null,answered=false,correct=0,attempted=0;
     const norm=text=>String(text||"").normalize("NFKC").replace(/[ァ-ヶ]/g,ch=>String.fromCharCode(ch.charCodeAt(0)-96)).replace(/\s/g,"");
     function newQuestion(){
       const pool=eligible.filter(x=>x!==active);
       active=(pool.length?pool:eligible)[Math.floor(Math.random()*(pool.length||eligible.length))];
       answered=false;input.value="";feedback.replaceChildren();
       question.textContent="請寫出「"+item.word+"」的【"+active.key+"】";
       question.dataset.key=active.key;
       check.disabled=false;next.disabled=true;
     }
     function submit(){
       if(answered)return;
       const reply=norm(input.value);
       if(!reply){feedback.textContent="請先輸入答案。";return}
       answered=true;attempted++;
       const ok=reply===norm(active.word)||reply===norm(active.reading);
       if(ok)correct++;
       feedback.replaceChildren(el("strong",ok?"✓ 答對了！":"✕ 答錯了，正確答案："));
       const answer=el("span","challenge-answer");
       answer.append(Audio.makeRuby(Forms.annotation(active.word,active.reading)));
       feedback.append(answer,el("span","challenge-reading","｜讀音："+active.reading));
       feedback.dataset.result=ok?"correct":"wrong";
       tally.textContent="本次練習："+correct+" / "+attempted+" 題";
       check.disabled=true;next.disabled=false;
     }
     check.addEventListener("click",submit);
     next.addEventListener("click",()=>{if(answered)newQuestion()});
     input.addEventListener("keydown",event=>{if(event.key==="Enter"&&!event.isComposing)submit()});
     newQuestion();
     panel.append(quiz);
   }
   return panel;
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
     left=identity(item.meaning,ruby(Forms?Forms.annotation(item.word,item.reading):wordRuby(item.word,item.reading)),"読み｜"+item.reading,
       item.kind==="verb"?(item.type==="godan"?"第一類・五段":item.type==="ichidan"?"第二類・一段":"第三類・不規則"):(item.type==="i"?"い形容詞":"な形容詞"));
     right.append(el("span","quest-subhead","CONTEXT / 常用搭配短語"));
     (item.collocations||[]).forEach((x,j)=>{
       example(right,"jp",x);
       right.append(el("p","quest-translation","中文｜"+(item.collocationCn?.[j]||"")));
     });
     speak(controls,status,"🔊 單字",item.reading,"jp");
     const forms=formPanel(item,i,status);
     if(forms)right.append(forms);
     right.append(el("p","legacy-note","變化形式使用原始讀音推導；搭配短語的完整振假名與發音仍需逐筆校對。"));
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

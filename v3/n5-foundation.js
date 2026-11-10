"use strict";
/* ENJP Ocean N5 complete foundations and upgrades for the two original N4/N3 previews.
 * Dedicated study key, never touches legacy five-star history or ENJP N4N3 wrong-answer storage.
 */
(function(){
 const D=window.ENJP_FOUNDATION_LESSONS;
 const K=window.ENJP_FOUNDATION_KANA;
 const A=window.ENJP_Audio;
 if(!D||!A)return;
 const KEY="enjpFoundationLessonsV1";
 const el=(tag,cls,text)=>{
   const n=document.createElement(tag);
   if(cls)n.className=cls;
   if(text!==undefined)n.textContent=String(text);
   return n;
 };
 const append=(node,...items)=>{node.append(...items);return node};
 let store={wrong:{},best:{}},writable=true,warning="";
 try{
   const raw=localStorage.getItem(KEY);
   if(raw){
     const value=JSON.parse(raw);
     if(!value||typeof value!=="object"||!value.wrong||typeof value.wrong!=="object"||Array.isArray(value.wrong)
        ||!value.best||typeof value.best!=="object"||Array.isArray(value.best))throw Error("bad format");
     store=value;
   }
 }catch{
   writable=false;
   warning="已有的本專區學習紀錄無法讀取，為保護資料不會自動覆寫。課程仍可使用。";
 }
 function save(){
   if(!writable)return;
   try{localStorage.setItem(KEY,JSON.stringify(store))}
   catch{writable=false;warning="目前無法儲存這次的學習進度；本次練習仍可繼續。"}
 }
 function speak(holder,ja,label="🔊 日文朗讀"){
   const row=el("div","nl-audio"),b=el("button","nl-sound",label),status=el("span","nl-status","");
   b.type="button";status.setAttribute("role","status");
   if(!A.spokenJapanese(ja)){
     b.disabled=true;
     b.title="此句有讀音未完成標註的漢字";
     status.textContent="此句日文語音待校對";
   }else b.addEventListener("click",()=>A.play(ja,"jp",b,status));
   row.append(b,status);holder.append(row);return b;
 }
 function japanese(holder,ja,cls="nl-jp"){
   const p=el("p",cls);
   p.append(A.makeRuby(ja));holder.append(p);
 }
 function chart(holder,type){
   const dataset=K?.[type];if(!dataset)return;
   const box=el("section","nf-kana-module");
   box.append(el("h3","nl-heading",type==="hira"?"📘 平假名完整發音表":"📗 片假名完整發音表"),
     el("p","nl-context","點擊各個假名即可朗讀。先把清音讀熟，再學濁音、半濁音與拗音。"));
   const headings=[["basic","46 個清音與基本字母"],["voiced","濁音 20 個"],["semiVoiced","半濁音 5 個"],["combined","拗音 33 組"]];
   for(const [key,name]of headings){
     const items=dataset[key]||[];
     if(!items.length)continue;
     const details=el("details","nf-kana-group");
     details.open=key==="basic";
     details.append(el("summary","",name+" · 點擊展開"));
     const grid=el("div","nf-kana-grid");
     for(const record of items){
       const b=el("button","nf-kana-item"),phonetic=el("small","",record.romaji);
       b.type="button";
       b.setAttribute("aria-label",record.kana+"，羅馬字 "+record.romaji+"，播放發音");
       b.append(el("strong","",record.kana),phonetic);
       const status=el("span","nf-kana-status","");
       status.setAttribute("role","status");
       if(!A.spokenJapanese(record.kana))b.disabled=true;
       else b.addEventListener("click",()=>A.play(record.kana,"jp",b,status));
       const cell=el("div","nf-kana-cell");
       cell.append(b,status);grid.append(cell);
     }
     details.append(grid);box.append(details);
   }
   holder.append(box);
 }
 function cards(holder,lesson){
   const section=el("section","nl-units");
   section.append(el("h3","nl-heading","📖 完整重點與例句"));
   const grid=el("div","nl-grid");
   lesson.units.forEach((unit,i)=>{
     const card=el("article","nl-card");
     card.append(el("span","nl-index","重點 "+String(i+1).padStart(2,"0")),
       el("h4","",unit.title),el("p","nl-form",unit.form),
       el("p","nl-explain",unit.note));
     const addPair=(parent,[ja,zh])=>{
       const box=el("div","nl-example");
       japanese(box,ja);box.append(el("p","nl-zh",zh));speak(box,ja);
       parent.append(box);
     };
     unit.examples.slice(0,2).forEach(pair=>addPair(card,pair));
     if(unit.examples.length>2){
       const detail=el("details","nl-more-examples");
       detail.append(el("summary","","＋ 另外 "+(unit.examples.length-2)+" 個情境例句"));
       const rest=el("div","nl-more-list");
       unit.examples.slice(2).forEach(pair=>addPair(rest,pair));
       detail.append(rest);card.append(detail);
     }
     grid.append(card);
   });
   section.append(grid);holder.append(section);
 }
 function scene(holder,lesson){
   const entry=lesson.scene;if(!entry)return;
   const panel=el("section","nl-scene");
   const listening=entry.mode==="listening",reading=entry.mode==="reading";
   panel.append(el("h3","nl-heading",(listening?"🎧 ":reading?"📗 ":"🗣️ ")+entry.title),
     el("p","nl-context",entry.context));
   if(listening)panel.append(el("p","nl-caution","先聽合成日語，再解題並核對逐句稿；語音是裝置 TTS，並非真人或 JLPT 官方音檔。"));
   speak(panel,entry.lines.map(l=>l.ja).join(" "), "▶ 播放整段（日文）");
   const transcript=el("div","nl-transcript");
   for(const item of entry.lines){
     const row=el("div","nl-line"),speaker=el("span","nl-speaker",item.who),
       body=el("div","nl-line-body");
     japanese(body,item.ja);
     body.append(el("p","nl-zh",item.zh));speak(body,item.ja,"🔊 這句");
     row.append(speaker,body);transcript.append(row);
   }
   if(listening){
     transcript.hidden=true;
     const toggle=el("button","nl-secondary","顯示逐句稿與中文");
     toggle.type="button";toggle.setAttribute("aria-expanded","false");
     toggle.addEventListener("click",()=>{
       transcript.hidden=!transcript.hidden;
       toggle.setAttribute("aria-expanded",String(!transcript.hidden));
       toggle.textContent=transcript.hidden?"顯示逐句稿與中文":"隱藏逐句稿再練習";
     });
     panel.append(toggle);
   }
   panel.append(transcript);
   holder.append(panel);
 }
 function practice(holder,lesson,id){
   const panel=el("section","nl-quiz");
   panel.append(el("h3","nl-heading","🎯 理解確認與錯題練習"),
     el("p","nl-context","每題有中文解析；答錯會記錄在本專區，不修改原版課程的五星進度。"));
   if(warning)panel.append(el("p","nl-warning",warning));
   const actions=el("div","nl-quiz-actions"),
     start=el("button","nl-primary","完整練習"),
     retry=el("button","nl-secondary","只練本章錯題");
   start.type="button";retry.type="button";
   actions.append(start,retry);
   const tally=el("p","nl-count"),question=el("p","nl-question"),
     choices=el("div","nl-choices"),result=el("div","nl-feedback"),
     next=el("button","nl-primary","下一題 →");
   tally.setAttribute("aria-live","polite");
   result.setAttribute("role","status");
   next.type="button";
   panel.append(actions,tally,question,choices,result,next);holder.append(panel);
   let indices=[],position=0,correct=0,answered=false,done=false;
   const key=n=>id+":"+n;
   function draw(){
     answered=false;done=false;choices.replaceChildren();result.replaceChildren();
     const q=lesson.quiz[indices[position]];
     question.textContent=q.question;
     tally.textContent="第 "+(position+1)+" / "+indices.length+" 題 · 已答對 "+correct+" 題";
     const shuffled=[...q.options];
     for(let i=shuffled.length-1;i>0;i--){
       const j=Math.floor(Math.random()*(i+1));
       [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
     }
     for(const option of shuffled){
       const b=el("button","nl-choice",option);b.type="button";
       b.addEventListener("click",()=>{
         if(answered)return;
         answered=true;
         const right=option===q.answer;
         if(right)correct++;
         store.wrong[key(indices[position])]=!right;
         save();
         for(const other of choices.children){
           other.disabled=true;
           if(other.textContent===q.answer)other.classList.add("correct");
           else if(other.textContent===option)other.classList.add("incorrect");
         }
         result.replaceChildren(el("strong","",right?"✅ 答對！":"正確答案："+q.answer),
           el("p","",q.why));
         if(warning)result.append(el("p","",warning));
         tally.textContent="第 "+(position+1)+" / "+indices.length+" 題 · 已答對 "+correct+" 題";
         next.disabled=false;
       });
       choices.append(b);
     }
     next.disabled=true;
     next.textContent=position===indices.length-1?"查看結果":"下一題 →";
   }
   function run(missedOnly=false){
     indices=lesson.quiz.map((_,i)=>i).filter(i=>!missedOnly||store.wrong[key(i)]===true);
     position=0;correct=0;answered=false;done=false;
     if(!indices.length){
       tally.textContent="本章目前沒有錯題";
       question.textContent="可以先完成完整練習。";
       choices.replaceChildren();result.replaceChildren();next.disabled=true;return;
     }
     draw();
   }
   start.addEventListener("click",()=>run());
   retry.addEventListener("click",()=>run(true));
   next.addEventListener("click",()=>{
     if(!answered||done)return;
     if(position<indices.length-1){position++;draw();return;}
     done=true;
     if(indices.length===lesson.quiz.length)
       store.best[id]=Math.max(Number(store.best[id])||0,correct);
     save();
     tally.textContent="完成 "+indices.length+" 題 · 答對 "+correct+" 題";
     question.textContent=correct===indices.length?"太好了，這次全部答對！":"不錯，答錯的題目可以再複習一次。";
     choices.replaceChildren();result.replaceChildren();next.disabled=true;
   });
   run();
 }
 function render(root,id){
   const lesson=D[id];if(!lesson)return false;
   const grade=id.startsWith("jp-n5-")||!id.includes("-n")?"JLPT N5":id.startsWith("jp-n4-")?"JLPT N4":"JLPT N3";
   const wrap=el("section","nl-lesson nf-foundation");
   wrap.append(el("span","nl-kicker",grade+" · 完整自學單元"),
     el("h2","nl-title",lesson.goal),
     el("p","nl-intro","依序學習規則、例句、音檔與理解測驗；延伸例句可以自由展開。"));
   if(lesson.kana)chart(wrap,lesson.kana);
   cards(wrap,lesson);
   scene(wrap,lesson);
   practice(wrap,lesson,id);
   root.append(wrap);return true;
 }
 window.ENJP_Foundation={
   has:id=>Object.prototype.hasOwnProperty.call(D,id),
   render,keys:Object.keys(D),storageKey:KEY
 };
})();

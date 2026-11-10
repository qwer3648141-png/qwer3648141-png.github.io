"use strict";
/* N4/N3 formerly planned lessons — fully authored study cards and practice.
   Does not mutate original ENJP learning keys or merge the stable main branch. */
(function(){
 const D=window.ENJP_N4N3_LESSONS,Audio=window.ENJP_Audio;
 if(!D||!Audio||!window.ENJP_COURSES)return;
 const KEY="enjpN4N3LessonProgressV1";
 const el=(tag,cls,value)=>{
   const n=document.createElement(tag);
   if(cls)n.className=cls;
   if(value!==undefined)n.textContent=String(value);
   return n;
 };
 const append=(p,...items)=>{p.append(...items);return p};
 const T=(ja)=>Audio.makeRuby(ja);
 let saveAllowed=true,savingError="";
 let progress={wrong:{},best:{}};
 try{
   const raw=localStorage.getItem(KEY);
   if(raw!==null){
     const parsed=JSON.parse(raw);
     if(!parsed||typeof parsed!=="object"||!parsed.wrong||typeof parsed.wrong!=="object"||
        !parsed.best||typeof parsed.best!=="object"||Array.isArray(parsed.wrong)||Array.isArray(parsed.best)){
       throw Error("invalid saved progress");
     }
     progress=parsed;
   }
 }catch{
   saveAllowed=false;
   savingError="本課既有練習紀錄無法讀取，為保護資料不會自動覆寫。課程和當次測驗仍可操作。";
 }
 function save(){
   if(!saveAllowed)return;
   try{localStorage.setItem(KEY,JSON.stringify(progress));}
   catch{saveAllowed=false;savingError="目前無法儲存此課新增紀錄；請確認瀏覽器網站資料設定。";}
 }
 function speak(parent,ja,label="🔊 朗讀"){
   const row=el("div","nl-audio"),btn=el("button","nl-sound",label),status=el("span","nl-status","");
   btn.type="button";status.setAttribute("role","status");
   const safe=Audio.spokenJapanese(ja);
   if(!safe){
     btn.disabled=true;btn.title="部分漢字未完整標註讀音，暫不啟用朗讀";
     status.textContent="這段文字的日文讀音待校對";
   }else btn.addEventListener("click",()=>Audio.play(ja,"jp",btn,status));
   row.append(btn,status);parent.append(row);
   return btn;
 }
 function japanese(parent,ja,className="nl-jp"){
   const p=el("p",className);
   p.append(T(ja));parent.append(p);return p;
 }
 function unitCards(parent,lesson,lessonId){
   const section=el("section","nl-units");
   section.append(el("h3","nl-heading","📖 核心教材與實用例句"));
   const cards=el("div","nl-grid");
   lesson.units.forEach((unit,index)=>{
     const card=el("article","nl-card");
     card.append(el("span","nl-index","重點 "+String(index+1).padStart(2,"0")),
       el("h4","",unit.title),el("p","nl-form",unit.form),
       el("p","nl-explain",unit.explain));
     function addExample(target,ja,zh){
       const example=el("div","nl-example");
       japanese(example,ja);
       example.append(el("p","nl-zh",zh));
       speak(example,ja);
       target.append(example);
     }
     unit.examples.forEach(([ja,zh])=>addExample(card,ja,zh));
     const more=window.ENJP_N4N3_EXTRA_EXAMPLES?.[lessonId]?.[index]||[];
     if(more.length){
       const details=el("details","nl-more-examples");
       details.append(el("summary","","＋ 再看 "+more.length+" 句不同情境例句"));
       const holder=el("div","nl-more-list");
       for(const [ja,zh] of more)addExample(holder,ja,zh);
       details.append(holder);
       card.append(details);
     }
     cards.append(card);
   });
   section.append(cards);parent.append(section);
 }
 function sceneLesson(parent,lesson){
   const scene=lesson.scene;
   if(!scene)return;
   const panel=el("section","nl-scene");
   panel.append(el("h3","nl-heading",(scene.listening?"🎧 ":"🗣️ ")+scene.title),
     el("p","nl-context",scene.context));
   if(scene.listening){
     panel.append(el("p","nl-caution","聽力使用你裝置的日文合成語音，不是日本真人錄音，也不是官方 JLPT 題目。"));
     speak(panel,scene.lines.map(x=>x.ja).join(" "), "▶ 播放整段（日文）");
   }else if(scene.reading){
     panel.append(el("p","nl-caution","先自行閱讀，再做理解題；必要時可按逐句朗讀核對讀音。"));
   }else speak(panel,scene.lines.map(x=>x.ja).join(" "), "▶ 播放整段對話");
   const transcript=el("div","nl-transcript");
   for(const x of scene.lines){
     const line=el("div","nl-line");
     line.append(el("span","nl-speaker",x.speaker));
     const body=el("div","nl-line-body");
     japanese(body,x.ja);
     body.append(el("p","nl-zh",x.zh));
     speak(body,x.ja,"🔊 這句");
     line.append(body);transcript.append(line);
   }
   if(scene.listening){
     transcript.hidden=true;
     const reveal=el("button","nl-secondary","顯示日文逐句稿與中文");
     reveal.type="button";
     reveal.setAttribute("aria-expanded","false");
     reveal.addEventListener("click",()=>{
       transcript.hidden=!transcript.hidden;
       reveal.setAttribute("aria-expanded",String(!transcript.hidden));
       reveal.textContent=transcript.hidden?"顯示日文逐句稿與中文":"隱藏逐句稿，再聽一次";
     });
     panel.append(reveal);
   }
   panel.append(transcript);
   parent.append(panel);
 }
 function quiz(parent,lesson,id){
   const root=el("section","nl-quiz");
   root.append(el("h3","nl-heading","🎯 理解與情境練習"),
     el("p","nl-context","每題提供中文解析；答錯會加入本專區的獨立錯題複習，不會更動原版五星與其他紀錄。"));
   if(savingError)root.append(el("p","nl-warning",savingError));
   const buttons=el("div","nl-quiz-actions"),start=el("button","nl-primary","開始完整練習"),
     retry=el("button","nl-secondary","只練本章錯題");
   start.type="button";retry.type="button";
   buttons.append(start,retry);root.append(buttons);
   const count=el("p","nl-count"),question=el("div","nl-question"),choices=el("div","nl-choices"),
      feedback=el("div","nl-feedback"),next=el("button","nl-primary","下一題 →");
   count.setAttribute("aria-live","polite");feedback.setAttribute("role","status");next.type="button";
   root.append(count,question,choices,feedback,next);parent.append(root);
   let indices=[],pos=0,score=0,locked=false,finished=false;
   const k=i=>id+":"+i;
   const draw=()=>{
     locked=false;finished=false;
     next.disabled=true;choices.replaceChildren();feedback.replaceChildren();
     const idx=indices[pos],q=lesson.quiz[idx];
     count.textContent="第 "+(pos+1)+" / "+indices.length+" 題｜本輪答對 "+score+" 題";
     question.replaceChildren(el("strong","",q.prompt));
     const shuffled=[...q.choices];
     for(let i=shuffled.length-1;i>0;i--){
       const j=Math.floor(Math.random()*(i+1));
       [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
     }
     for(const option of shuffled){
       const b=el("button","nl-choice",option);b.type="button";
       b.addEventListener("click",()=>{
         if(locked)return;
         locked=true;
         const correct=option===q.answer;
         if(correct)score++;
         progress.wrong[k(idx)]=!correct;
         save();
         for(const button of choices.children){
           button.disabled=true;
           if(button.textContent===q.answer)button.classList.add("correct");
           else if(button.textContent===option)button.classList.add("incorrect");
         }
         feedback.replaceChildren(el("strong","",correct?"✅ 答對了":"答案："+q.answer),
           el("p","",q.why));
         if(savingError)feedback.append(el("p","",savingError));
         count.textContent="第 "+(pos+1)+" / "+indices.length+" 題｜本輪答對 "+score+" 題";
         next.disabled=false;next.textContent=pos===indices.length-1?"查看成績":"下一題 →";
       });
       choices.append(b);
     }
   };
   const run=(mistakesOnly=false)=>{
     indices=lesson.quiz.map((_,i)=>i).filter(i=>!mistakesOnly||progress.wrong[k(i)]===true);
     pos=0;score=0;locked=false;finished=false;
     if(!indices.length){
       count.textContent="本章目前沒有錯題。";
       question.textContent="可以先做一次完整練習，之後再回來複習。";
       choices.replaceChildren();feedback.replaceChildren();next.disabled=true;return;
     }
     draw();
   };
   start.addEventListener("click",()=>run());
   retry.addEventListener("click",()=>run(true));
   next.addEventListener("click",()=>{
     if(!locked||finished)return;
     if(pos<indices.length-1){pos++;draw();return;}
     finished=true;
     const previous=Number(progress.best[id])||0;
     if(indices.length===lesson.quiz.length)progress.best[id]=Math.max(previous,score);
     save();
     count.textContent="本輪完成 "+indices.length+" 題｜答對 "+score+" 題。";
     question.textContent=score===indices.length?"這輪全對！可練下一章。":"有些觀念還需要再看一次，已保留本輪錯題。";
     choices.replaceChildren();feedback.replaceChildren();
     if(savingError)feedback.append(el("p","nl-warning",savingError));
     next.disabled=true;
   });
   run();
 }
 function render(root,id){
   const lesson=D[id];
   if(!lesson)return false;
   const wrap=el("section","nl-lesson");
   const level=id.startsWith("jp-n4-")?"JLPT N4":"JLPT N3";
   wrap.append(el("span","nl-kicker",level+" · 已完成的自學教材"),
     el("h2","nl-title",lesson.goal),
     el("p","nl-intro","學習順序：理解規則 → 查看日文例句與中文 → 聽日文 → 做情境題。"));
   unitCards(wrap,lesson,id);
   sceneLesson(wrap,lesson);
   quiz(wrap,lesson,id);
   root.append(wrap);return true;
 }
 window.ENJP_N4N3_Complete={
   render,has:id=>Boolean(D[id]),count:Object.keys(D).length,
   keys:Object.keys(D),storageKey:KEY
 };
})();

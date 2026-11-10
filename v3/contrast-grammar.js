"use strict";
/* ENJP Ocean: five comparison-led Japanese grammar lessons, separate from legacy progress. */
(function(){
 const D=window.ENJP_CONTRAST_GRAMMAR,C=window.ENJP_COURSES,Audio=window.ENJP_Audio;
 if(!Array.isArray(D)||!C?.jp?.N4||!C?.jp?.N3||!Audio)return;
 const PREFIX="jp-contrast-",STORE_KEY="enjpContrastGrammarWrongV1";
 for(const level of ["N4","N3"]){
   C.jp[level].push({
     id:"contrast-"+level.toLowerCase(),
     title:"🧠 易混淆文法｜情境問法精講",
     summary:"5 大主題、32 種句型、64 個例句、25 題情境練習",
     sections:D.map(t=>({id:PREFIX+t.id,title:(t.level==="N3"?"N3｜":"N4｜")+t.title}))
   });
 }
 const elem=(tag,cls,txt)=>{
   const n=document.createElement(tag);
   if(cls)n.className=cls;
   if(txt!==undefined)n.textContent=String(txt);
   return n;
 };
 const add=(target,...nodes)=>{target.append(...nodes);return target};
 const ruby=ja=>Audio.makeRuby(ja);
 let wrong=new Set(),storable=true,warning="";
 try{
   const raw=localStorage.getItem(STORE_KEY);
   if(raw!==null){
     const a=JSON.parse(raw);
     if(!Array.isArray(a)||a.some(v=>typeof v!=="string"))throw Error("invalid format");
     wrong=new Set(a);
   }
 }catch{
   storable=false;
   warning="舊的錯題資料無法讀取，本頁不會覆寫它；你仍可正常閱讀並練習。";
 }
 const save=()=>{
   if(!storable)return;
   try{localStorage.setItem(STORE_KEY,JSON.stringify([...wrong]));}
   catch{storable=false;warning="瀏覽器目前不能儲存新增錯題，教材與測驗仍可使用。";}
 };
 function speak(parent,ja){
   const row=elem("div","cg-audio"),button=elem("button","cg-speak","🔊 日文朗讀"),status=elem("span","cg-status","");
   button.type="button";status.setAttribute("role","status");
   if(!Audio.spokenJapanese(ja)){
     button.disabled=true;
     button.title="讀音資料尚未通過語音檢查";
   }else button.addEventListener("click",()=>Audio.play(ja,"jp",button,status));
   row.append(button,status);parent.append(row);
 }
 function japanese(parent,ja){
   const p=elem("p","cg-ja");p.append(ruby(ja));parent.append(p);return p;
 }
 function patterns(root,topic){
   const grid=elem("div","cg-patterns");
   topic.patterns.forEach((item,index)=>{
     const card=elem("article","cg-pattern");
     card.append(elem("span","cg-kicker","句型 "+String(index+1).padStart(2,"0")),
       elem("h3","",item.form),elem("strong","cg-meaning",item.meaning),
       elem("p","cg-rule","接續："+item.rule),
       elem("p","cg-note",item.note));
     for(const [ja,zh]of item.examples){
       const ex=elem("div","cg-example");
       japanese(ex,ja);ex.append(elem("p","cg-zh",zh));speak(ex,ja);card.append(ex);
     }
     grid.append(card);
   });
   root.append(grid);
 }
 function comparison(root,topic){
   const c=elem("section","cg-compare");
   c.append(elem("h3","","⚖️ "+topic.comparison.title),
     elem("p","cg-sub","同一個情境切換問法，觀察語氣、視角或前提如何改變。"));
   for(const [form,ja,note]of topic.comparison.rows){
     const row=elem("div","cg-compare-row");
     row.append(elem("strong","cg-compare-form",form));
     const detail=elem("div","cg-compare-main");
     japanese(detail,ja);detail.append(elem("p","cg-zh",note));speak(detail,ja);
     row.append(detail);c.append(row);
   }
   root.append(c);
 }
 function quiz(root,topic){
   const shell=elem("section","cg-quiz");
   shell.append(elem("h3","","🎯 情境判斷練習"));
   const intro=elem("p","cg-sub","先判斷語氣、視角與情境；答錯的題目會存入本課獨立錯題清單。");
   shell.append(intro);
   if(warning)shell.append(elem("p","cg-warning",warning));
   const counter=elem("p","cg-count"),question=elem("p","cg-question"),choices=elem("div","cg-choices"),
      feedback=elem("div","cg-feedback"),next=elem("button","cg-next","下一題 →"),
      controls=elem("div","cg-actions"),start=elem("button","cg-next","重新開始 5 題"),
      retryWrong=elem("button","cg-secondary","只練本主題錯題");
   next.type="button";start.type="button";retryWrong.type="button";
   feedback.setAttribute("role","status");
   let indices=[],position=0,correct=0,locked=false;
   const keyFor=i=>topic.id+":"+i;
   function draw(){
     const i=indices[position],item=topic.quiz[i];
     locked=false;feedback.replaceChildren();choices.replaceChildren();
     question.textContent=item.ask;
     counter.textContent="第 "+(position+1)+" / "+indices.length+" 題 · 答對 "+correct+" 題";
     item.choices.forEach(label=>{
       const b=elem("button","cg-choice",label);b.type="button";
       b.addEventListener("click",()=>{
         if(locked)return;locked=true;
         const ok=label===item.correct;
         if(ok){correct++;wrong.delete(keyFor(i));}else wrong.add(keyFor(i));
         save();
         for(const button of choices.children){
           button.disabled=true;
           if(button.textContent===item.correct)button.classList.add("correct");
           else if(button.textContent===label)button.classList.add("incorrect");
         }
         feedback.append(elem("strong","",ok?"✅ 答對！":"正確答案："+item.correct),
           elem("p","",item.why));
         if(warning)feedback.append(elem("p","",warning));
         counter.textContent="第 "+(position+1)+" / "+indices.length+" 題 · 答對 "+correct+" 題";
         next.disabled=false;
       });
       choices.append(b);
     });
     next.textContent=position===indices.length-1?"查看成績":"下一題 →";
     next.disabled=true;
   }
   function play(onlyWrong=false){
     indices=topic.quiz.map((_,i)=>i).filter(i=>!onlyWrong||wrong.has(keyFor(i)));
     if(!indices.length){
       counter.textContent="目前沒有這個主題的錯題。";
       question.textContent="你可以先完成一次完整練習。";
       choices.replaceChildren();feedback.replaceChildren();next.disabled=true;
       return;
     }
     position=0;correct=0;draw();
   }
   next.addEventListener("click",()=>{
     if(!locked)return;
     if(position+1<indices.length){position++;draw();return}
     counter.textContent="完成 "+indices.length+" 題，答對 "+correct+" 題。";
     question.textContent=correct===indices.length?"本輪全對！":"錯題已記錄，可針對弱點再練習。";
     choices.replaceChildren();feedback.replaceChildren();next.disabled=true;
   });
   start.addEventListener("click",()=>play());
   retryWrong.addEventListener("click",()=>play(true));
   controls.append(start,retryWrong);
   shell.append(controls,counter,question,choices,feedback,next);root.append(shell);
   play();
 }
 function render(root,id){
   if(!id?.startsWith(PREFIX))return false;
   const topic=D.find(t=>id===PREFIX+t.id);
   if(!topic)return false;
   const wrap=elem("section","cg-lesson");
   wrap.append(elem("span","cg-kicker","ENJP Ocean · 相似文法精講"),
     elem("h2","",topic.title),elem("p","cg-sub",topic.intro));
   const nav=elem("nav","cg-nav");
   nav.setAttribute("aria-label","易混淆文法主題");
   for(const t of D){
     const b=elem("button","cg-navbtn"+(t.id===topic.id?" active":""),t.title);
     b.type="button";
     b.addEventListener("click",()=>window.ENJP_3?.goToSection?.(PREFIX+t.id));
     nav.append(b);
   }
   wrap.append(nav);
   patterns(wrap,topic);comparison(wrap,topic);quiz(wrap,topic);
   root.append(wrap);return true;
 }
 window.ENJP_ContrastGrammar={render,topics:D.map(t=>t.id),count:D.reduce((n,t)=>n+t.patterns.length*2,0)};
})();

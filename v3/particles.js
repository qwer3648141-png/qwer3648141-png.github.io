"use strict";
/* ENJP Ocean 3.8: context-first double-particle lessons; does not write progress. */
(function(){
 const D=window.ENJP_PARTICLE_DATA,C=window.ENJP_COURSES,A=window.ENJP_Audio;
 if(!D||!C?.jp?.N4||!C?.jp?.N3||!A)return;
 const ROOT="jp-particle",groupMap=Object.fromEntries(D.groups.map(g=>[g.id,g]));
 const versions={
   N4:{prefix:"jp-n4-particle-",chapter:"08｜助詞組合：には・では・にも・でも",ids:D.groups.map(g=>g.id)},
   N3:{prefix:"jp-n3-particle-",chapter:"07｜助詞深化：對比、追加與語氣",ids:["towa","karawa","madewa","yoriwa","demo","tomo","mademo","yorimo"]}
 };
 for(const [level,v]of Object.entries(versions)){
   const sections=[
     {id:v.prefix+"overview",title:"🧭 總覽｜は・も怎麼改變意思"},
     ...v.ids.map(id=>({id:v.prefix+id,title:"📘 "+groupMap[id].form+"｜"+groupMap[id].title})),
     {id:v.prefix+"comparison",title:"⚖️ 7 組對照｜は vs. も"},
     {id:v.prefix+"quiz",title:"⚡ 18 題情境應用測驗"}
   ];
   C.jp[level].push({id:ROOT+"-"+level,title:v.chapter,
     summary:"70 個句子、14 組助詞、7 組對照與 18 題判斷；中文／振假名／朗讀",sections});
 }
 const el=(tag,cls,text)=>{
   const node=document.createElement(tag);
   if(cls)node.className=cls;
   if(text!==undefined)node.textContent=String(text);
   return node;
 };
 const add=(p,...children)=>{p.append(...children);return p};
 function ruby(t){const line=el("span","pr-ruby");line.append(A.makeRuby(t));return line}
 function audio(p,t){
   const b=el("button","pr-speak","🔊 日文朗讀"),status=el("span","pr-tts-state","");
   b.type="button";status.setAttribute("role","status");
   if(!A.spokenJapanese(t)){b.disabled=true;b.title="這句缺少完整標音，暫停朗讀"}
   else b.addEventListener("click",()=>A.play(t,"jp",b,status));
   p.append(add(el("div","pr-speak-row"),b,status));
 }
 function example(item,i){
   const card=el("article","pr-example");
   card.append(el("span","pr-num",String(i+1).padStart(2,"0")));
   const sentence=el("p","pr-jp");sentence.append(ruby(item[0]));
   card.append(sentence,el("p","pr-zh",item[1]),el("p","pr-tip","✦ "+item[2]));
   audio(card,item[0]);return card;
 }
 function examples(parent,title,rows){
   parent.append(el("h3","pr-heading",title));
   const grid=el("div","pr-examples");rows.forEach((x,i)=>grid.append(example(x,i)));parent.append(grid);
 }
 function head(parent,title,description){
   parent.append(add(el("div","pr-intro"),el("h3","",title),el("p","",description)));
 }
 function navigate(level,key){
   const prefix=versions[level].prefix;
   return window.ENJP_3?.goToSection?.(prefix+key);
 }
 function nav(parent,level,current){
   const links=[["overview","🧭 核心觀念"],["niwa","には"],["dewa","では"],["demo","でも"],["comparison","⚖️ 對照"],["quiz","⚡ 測驗"]];
   const row=el("nav","pr-navigation");
   row.setAttribute("aria-label","助詞組合快捷選單");
   for(const [id,text]of links){
     if(!["overview","comparison","quiz"].includes(id)&&!versions[level].ids.includes(id))continue;
     const b=el("button","pr-nav-item"+(id===current?" selected":""),text);
     b.type="button";b.addEventListener("click",()=>navigate(level,id));row.append(b);
   }
   parent.append(row);
 }
 function overview(parent,level){
   head(parent,"第一個助詞標示關係，第二個助詞改變說話視角",
     "像「に＋は→には」與「に＋も→にも」，不是硬把兩個中文意思相加。は常突出主題或對比；も常表示也包含、甚至；有些固定用法必須個別理解。");
   const strip=el("div","pr-mechanism");
   for(const [symbol,title,desc]of [["に／で／へ／と／から／まで","第一層：關係","對象、位置、方向、共同對象、來源、界限"],["＋ は","第二層：主題／對比","把前面的成分提出來談；不一定每次都有強烈反駁"],["＋ も","第二層：追加／強調","除了原有範圍之外，也包含這個；特定用法另有含義"]]){
     strip.append(add(el("article","pr-mechanism-card"),
       el("strong","",symbol),el("span","",title),el("p","",desc)));
   }
   parent.append(strip);
   parent.append(add(el("div","pr-warning"),
     el("strong","","重要限制：をは、がは通常不說"),
     el("p","","本を読みます → 本は読みます；日本語が好きです → 日本語は好きです。を／が通常被は取代，不是兩個助詞隨意疊加。"),
     el("p","","另外：でも、とは、までも有特別語義；よりも中的も也不能直接翻成「也」。")));
   const browse=el("div","pr-browse");
   parent.append(el("h3","pr-heading","點選一組開始學｜每組 5 句＋中文＋朗讀"));
   for(const group of D.groups){
     const b=el("button","pr-browse-item");
     b.type="button";b.disabled=!versions[level].ids.includes(group.id);
     b.append(el("strong","",group.form),el("small","",group.title),
       el("span","",group.level+" · 5 句"));
     b.addEventListener("click",()=>navigate(level,group.id));browse.append(b);
   }
   parent.append(browse);
   if(level==="N3")parent.append(el("p","pr-warning","N3 精修版挑選較具語氣差異的 8 組；全部 14 組請到 N4『助詞組合』複習。"));
 }
 function groupLesson(parent,g,level){
   head(parent,g.form+"｜"+g.title,g.rule);
   parent.append(add(el("div","pr-rule"),
     el("strong","","基本接續"),el("p","",g.pattern),
     el("small","","注意："+g.caution)));
   examples(parent,"5 個真實情境例句",g.examples);
   const pair=el("button","pr-secondary","↔ 看相近助詞的句子對照");pair.type="button";
   pair.addEventListener("click",()=>navigate(level,"comparison"));parent.append(pair);
 }
 function compare(parent){
   head(parent,"同一句話換成 は／も，語氣差在哪？",
     "不是所有助詞都能單純互換：例如「までは」與「までも」語義不同，下方會直接標出。");
   for(let i=0;i<D.comparisons.length;i++){
     const [title,ja,zh,jb,zb,explain]=D.comparisons[i];
     const panel=el("section","pr-compare");
     panel.append(el("h3","pr-heading",String(i+1).padStart(2,"0")+" · "+title));
     const grid=el("div","pr-compare-grid");
     for(const [form,sent,meaning]of [["は",ja,zh],["も",jb,zb]]){
       const card=el("article","pr-compare-card");
       card.append(el("span","pr-compare-label","＋ "+form));
       const jp=el("p","pr-jp");jp.append(ruby(sent));
       card.append(jp,el("p","pr-zh",meaning));
       audio(card,sent);grid.append(card);
     }
     panel.append(grid,el("p","pr-tip",explain));parent.append(panel);
   }
 }
 function quiz(parent){
   head(parent,"18 題情境練習｜一題一題找正確助詞",
     "不只背日文形式，請先看中文情境，再判斷『主題／對比／也包含／甚至／比較』。答題不會覆蓋舊版學習進度。");
   const area=el("section","pr-quiz");
   let index=0,score=0,answered=false;
   const progress=el("p","pr-progress"),question=el("p","pr-question"),
     choices=el("div","pr-options"),feedback=el("div","pr-feedback"),
     next=el("button","pr-next","下一題 →");
   feedback.setAttribute("role","status");next.type="button";
   function draw(){
     answered=false;
     const [text,correct,possible]=D.quiz[index];
     progress.textContent="第 "+(index+1)+"／"+D.quiz.length+" 題 · 目前答對 "+score+" 題";
     question.replaceChildren(ruby(text));choices.replaceChildren();feedback.replaceChildren();
     for(const choice of possible){
       const btn=el("button","pr-option",choice);btn.type="button";
       btn.addEventListener("click",()=>answer(choice));choices.append(btn);
     }
     next.textContent=index===D.quiz.length-1?"查看成績":"下一題 →";next.disabled=true;
   }
   function answer(choice){
     if(answered)return;answered=true;
     const [text,correct,opts,explain]=D.quiz[index],right=choice===correct;
     if(right)score++;
     for(const btn of choices.children){
       btn.disabled=true;
       if(btn.textContent===correct)btn.classList.add("correct");
       else if(btn.textContent===choice)btn.classList.add("wrong");
     }
     feedback.append(el("strong","",right?"✅ 正確！":"❌ 正解是："+correct),
       el("p","",explain));
     progress.textContent="第 "+(index+1)+"／"+D.quiz.length+" 題 · 目前答對 "+score+" 題";
     next.disabled=false;
   }
   next.addEventListener("click",()=>{
     if(!answered)return;
     if(index===D.quiz.length-1){
       area.replaceChildren();
       area.append(el("h3","pr-heading","完成！"+score+"／"+D.quiz.length+" 題"),
         el("p","pr-tip",score===D.quiz.length?"全部答對！試著用自己的生活情境造句吧。":"建議回到『對照』檢查哪些語氣容易搞混。"));
       const again=el("button","pr-next","重新挑戰");
       again.type="button";again.addEventListener("click",()=>{
         index=0;score=0;area.replaceChildren(progress,question,choices,feedback,next);draw();
       });area.append(again);
     }else{index++;draw()}
   });
   area.append(progress,question,choices,feedback,next);parent.append(area);draw();
 }
 function render(parent,id){
   const level=Object.keys(versions).find(l=>id?.startsWith(versions[l].prefix));
   if(!level)return false;
   const key=id.slice(versions[level].prefix.length);
   if(!["overview","comparison","quiz",...versions[level].ids].includes(key))return false;
   const body=el("section","pr-course");
   body.append(el("span","pr-overline","日本語 · "+level+" · 助詞組合特別課程"),
     el("h2","pr-title","には・では・へは・とは…"),
     el("p","pr-summary","14 組用法｜70 個例句｜7 組は／も對照｜18 題情境測驗"));
   nav(body,level,key);
   if(key==="overview")overview(body,level);
   else if(key==="comparison")compare(body);
   else if(key==="quiz")quiz(body);
   else groupLesson(body,groupMap[key],level);
   parent.append(body);
   return true;
 }
 window.ENJP_Particles={render,groups:D.groups,quiz:D.quiz,comparisons:D.comparisons};
})();
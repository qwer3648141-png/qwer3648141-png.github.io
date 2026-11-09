"use strict";
/* ENJP Ocean 3.8 — double-particle mastery course.
   Read-only study surfaces: uses the existing shared audio service; never writes progress. */
(function(){
 const D=window.ENJP_PARTICLE_DATA,P=window.ENJP_PARTICLE_PRACTICE,C=window.ENJP_COURSES,Audio=window.ENJP_Audio;
 if(!D?.groups?.length||!P?.pairs?.length||!C?.jp?.N4||!Audio)return;
 const ROOT="jp-particle-";
 // Compare the original 13 single-vs-double examples plus 7 carefully authored は-vs-も pairs.
 const extendedPairs=(D.comparisons||[]).map(([name,ja,zh,jb,zb,note],i)=>({
   id:"focus-wa-mo-"+i,name:"は ⇄ も｜"+name,left:[ja,zh],right:[jb,zb],note
 }));
 const comparisonPairs=[...P.pairs,...extendedPairs];
 const groupIds=D.groups.map(g=>g.id);
 const guide=[
  ["overview","🧭 先懂原理｜助詞為什麼能疊加？"],
  ...D.groups.slice(0,7).map(g=>[g.id,"は系列｜"+g.form+" · "+g.title]),
  ...D.groups.slice(7).map(g=>[g.id,"も系列｜"+g.form+" · "+g.title]),
  ["compare","⚖️ 20 組助詞差異對照"],
  ["pitfalls","🚧 特殊用法與常見陷阱"],
  ["quiz","🎯 24 題情境挑戰"]
 ];
 const secs=ids=>ids.map(id=>({id:ROOT+id,title:guide.find(g=>g[0]===id)[1]}));
 const titles1=["overview",...D.groups.slice(0,7).map(g=>g.id)],
       titles2=D.groups.slice(7).map(g=>g.id);
 C.jp.N4.push(
  {id:"particle-wa",title:"08｜助詞組合 · は系列",summary:"位置、方向、來源與比較｜主題／對比",sections:secs(titles1)},
  {id:"particle-mo",title:"09｜助詞組合 · も系列",summary:"也、甚至、追加與比較｜不要死背「也」",sections:secs(titles2)},
  {id:"particle-challenge",title:"10｜助詞深度對照與練習",summary:"同句比較、特殊用法、24 題混合測驗",sections:secs(["compare","pitfalls","quiz"])}
 );
 // N3 students can reach the same completed material directly without duplicating the data.
 if(C.jp.N3)C.jp.N3.push({
   id:"particle-review-n3",title:"07｜N3 助詞語氣精修",
   summary:"進階 8 組助詞、20 組語意比較、24 題混合情境練習",
   sections:secs(["overview","towa","karawa","madewa","yoriwa","demo","tomo","mademo","yorimo","compare","pitfalls","quiz"])
 });
 const el=(tag,cls,text)=>{
   const n=document.createElement(tag);if(cls)n.className=cls;
   if(text!==undefined)n.textContent=String(text);
   return n;
 };
 const add=(p,...n)=>{p.append(...n);return p};
 const jump=id=>window.ENJP_3?.goToSection?.(ROOT+id);
 function ruby(annotated){return Audio.makeRuby(annotated)}
 function sentence(text){return add(el("p","pc-japanese"),ruby(text))}
 function speak(parent,annotated){
   const row=el("div","pc-speech");
   const button=el("button","pc-play","🔊 朗讀"),status=el("span","pc-status","");
   status.setAttribute("role","status");button.type="button";
   if(!Audio.spokenJapanese(annotated)){
     button.disabled=true;button.title="例句的漢字尚未具備完整讀音，暫停播放";
   }else button.addEventListener("click",()=>Audio.play(annotated,"jp",button,status));
   row.append(button,status);parent.append(row);
 }
 function example(entry,n){
   const [jp,cn,note]=entry;
   const card=el("article","pc-example");
   card.append(el("span","pc-index",String(n+1).padStart(2,"0")));
   card.append(sentence(jp),el("p","pc-translation",cn));
   if(note)card.append(el("p","pc-usage","✦ "+note));
   speak(card,jp);
   return card;
 }
 function examples(root,rows){
   const grid=el("div","pc-examples");
   rows.forEach((r,i)=>grid.append(example(r,i)));root.append(grid);
 }
 function routeButton(id,title){
   const b=el("button","pc-route",title);b.type="button";
   b.addEventListener("click",()=>jump(id));return b;
 }
 function introduction(root){
   root.append(add(el("div","pc-hero"),
     el("h3","","助詞不只是「接起來」，而是兩層不同工作"),
     el("p","","前面的 に／で／へ／と／から／まで／より 指出句子中的關係；後面的 は 提出話題或對比，も則常表示追加、包含或強調。")));
   const layout=el("div","pc-formula");
   layout.append(add(el("div","pc-formula-unit"),el("strong","","に／で／へ／と…"),el("span","","地點・對象・方向・來源")),
     el("div","pc-symbol","+"),
     add(el("div","pc-formula-unit"),el("strong","","は ／ も"),el("span","","主題／對比・追加／強調")),
     el("div","pc-symbol","→"),
     add(el("div","pc-formula-unit"),el("strong","","には ／ にも…"),el("span","","關係保留，語氣改變")));
   root.append(layout);
   const note=el("div","pc-alert");
   note.append(el("strong","","先分辨三種情況"),
     el("p","","① に／で＋は：把對象或場合提出來談。 ② に／で＋も：表示另一個也包括。 ③ ではない、誰でも、二人とも、とは何か等，還有各自特別的用法。"));
   root.append(note);
   root.append(el("h3","pc-h3","一個情境，就能看懂微妙差異"));
   examples(root,[
     ["図書館（としょかん）で勉強（べんきょう）します。","我在圖書館學習。","中性陳述動作發生的地點。"],
     ["図書館（としょかん）では勉強（べんきょう）します。","在圖書館的話，我會學習。","把圖書館提出來，與其他地方可能形成對比。"],
     ["図書館（としょかん）でも勉強（べんきょう）します。","我在圖書館也會學習。","圖書館也是學習地點之一。"]
   ]);
   const start=el("div","pc-jump-grid");
   start.append(routeButton("niwa","開始：には／は系列"),routeButton("nimo","開始：にも／も系列"),
     routeButton("compare","前往 13 組對比"),routeButton("quiz","直接做 24 題練習"));
   root.append(start);
 }
 function groupLesson(root,key){
   const g=D.groups.find(x=>x.id===key);if(!g)return false;
   const panel=el("div","pc-summary");
   panel.append(add(el("div","pc-summary-top"),
       el("span","pc-level",g.level),
       el("strong","pc-expression",g.form)),
     el("h3","",g.title),el("p","pc-description",g.rule));
   const details=el("div","pc-rule");
   details.append(el("strong","","句型提示"),
     el("p","",g.pattern),el("small","",g.caution));
   root.append(panel,details,el("h3","pc-h3","五個生活、旅行與工作例句"));
   examples(root,g.examples);
   const related=D.groups.filter(x=>x.base===g.base&&x.id!==g.id);
   if(related.length){
     const r=related[0];
     root.append(add(el("div","pc-next"),
       el("p","","同一個前置助詞，換後面的「は／も」會怎樣？"),
       routeButton(r.id,"切換比較："+g.form+" ⇄ "+r.form)));
   }
   root.append(routeButton("compare","查看全部 20 組並排對照"));
   return true;
 }
 function contrastLesson(root){
   root.append(add(el("div","pc-hero"),
     el("h3","","⚖️ 同一句話，為什麼換個助詞就變了？"),
     el("p","","前 13 組比較原本助詞與加上 は／も 後的語氣；後 7 組直接比較 は 和 も。不能硬翻譯，先找話題和追加的對象。")));
   const search=el("input","pc-search");
   search.type="search";search.placeholder="搜尋 に、で、も、中文情境…";
   search.setAttribute("aria-label","搜尋助詞對照");root.append(search);
   const count=el("p","pc-count"),holder=el("div","pc-contrasts");
   root.append(count,holder);
   function draw(){
     const q=String(search.value||"").trim().toLocaleLowerCase();
     const all=comparisonPairs.filter(x=>!q||[x.name,x.note,...x.left,...x.right].join(" ").toLocaleLowerCase().includes(q));
     count.textContent="顯示 "+all.length+" / "+comparisonPairs.length+" 組對照";
     holder.replaceChildren();
     all.forEach((x,i)=>{
       const d=el("details","pc-comparison");d.open=i<2&&!q;
       d.append(el("summary","",x.name));
       const cols=el("div","pc-comparison-cols");
       [["基本句",x.left],["換助詞後",x.right]].forEach(([tag,row])=>{
         const card=el("div","pc-side");
         card.append(el("span","pc-side-tag",tag),sentence(row[0]),
           el("p","pc-translation",row[1]));speak(card,row[0]);cols.append(card);
       });
       d.append(cols,el("p","pc-comparison-note","重點："+x.note));
       holder.append(d);
     });
     if(!all.length)holder.append(el("p","pc-count","沒有符合的對照，試試較短的關鍵字。"));
   }
   search.addEventListener("input",draw);draw();
 }
 function pitfallsLesson(root){
   root.append(add(el("div","pc-hero"),
     el("h3","","🚧 別看到兩個假名，就套同一個公式"),
     el("p","","「は／も」可以和不少助詞結合，但不是所有排列都合法，更不是所有雙字形式都只有一種意思。")));
   P.extras.forEach((topic,i)=>{
     const d=el("details","pc-pitfall");d.open=i===0;
     d.append(el("summary","",topic.title),
       el("p","pc-description",topic.text));
     examples(d,topic.examples.map(([jp,cn])=>[jp,cn,"此例對應本節特別用法"]));
     root.append(d);
   });
 }
 function quizLesson(root){
   root.append(add(el("div","pc-hero"),
     el("h3","","🎯 24 題助詞選擇挑戰"),
     el("p","","判斷主題／對比、追加、比較與特殊形式。完成後有解析與分數；不修改舊版學習進度。")));
   const outer=el("section","pc-quiz");
   const progress=el("p","pc-quiz-progress"),question=el("p","pc-quiz-question"),
     answers=el("div","pc-options"),feedback=el("div","pc-feedback"),next=el("button","pc-next-button","下一題 →");
   feedback.setAttribute("role","status");next.type="button";
   let index=0,score=0,locked=false,wrong=[];
   function present(){
     locked=false;
     const item=P.quiz[index];
     progress.textContent="第 "+(index+1)+" / "+P.quiz.length+" 題 · 答對 "+score+" 題";
     question.replaceChildren(ruby(item[0]));
     answers.replaceChildren();feedback.replaceChildren();
     item[2].forEach(option=>{
       const b=el("button","pc-answer",option);b.type="button";
       b.addEventListener("click",()=>choose(option));answers.append(b);
     });
     next.disabled=true;next.textContent=index===P.quiz.length-1?"看總成績":"下一題 →";
   }
   function choose(chosen){
     if(locked)return;locked=true;
     const item=P.quiz[index],ok=chosen===item[1];
     if(ok)score++;else wrong.push({index,correct:item[1],chosen});
     for(const b of answers.children){
       b.disabled=true;if(b.textContent===item[1])b.classList.add("right");
       else if(b.textContent===chosen)b.classList.add("incorrect");
     }
     feedback.append(el("strong","",ok?"✓ 答對！":"✕ 正確答案："+item[1]),el("p","",item[3]));
     progress.textContent="第 "+(index+1)+" / "+P.quiz.length+" 題 · 答對 "+score+" 題";
     next.disabled=false;
   }
   next.addEventListener("click",()=>{
     if(!locked)return;
     if(index<P.quiz.length-1){index++;present();return}
     outer.replaceChildren();
     outer.append(el("h3","pc-h3","挑戰完成｜"+score+" / "+P.quiz.length+" 題"),
       el("p","pc-description",wrong.length?"這次有 "+wrong.length+" 題需要再練習。建議回到對照專區，觀察差別。":"全部答對，主題、對比和追加的差異已掌握！"));
     if(wrong.length){
       const list=el("div","pc-mistakes");
       wrong.forEach(x=>{
         const row=P.quiz[x.index],d=el("details","pc-mistake");
         d.append(el("summary","","第 "+(x.index+1)+" 題｜你的答案："+x.chosen+"｜正解："+x.correct),
           add(el("p","pc-quiz-question"),ruby(row[0])),el("p","pc-description",row[3]));
         list.append(d);
       });outer.append(list);
     }
     const restart=el("button","pc-next-button","重新挑戰全部 24 題");
     restart.type="button";restart.addEventListener("click",()=>{
       index=0;score=0;wrong=[];outer.replaceChildren(progress,question,answers,feedback,next);present();
     });outer.append(restart);
   });
   outer.append(progress,question,answers,feedback,next);root.append(outer);present();
 }
 function render(root,sectionId){
   if(!sectionId?.startsWith(ROOT))return false;
   const id=sectionId.slice(ROOT.length);
   if(!guide.some(x=>x[0]===id))return false;
   const wrap=el("section","pc-course");
   wrap.append(el("span","pc-kicker","N4–N3｜助詞的組合與語氣"),
     el("h2","pc-title","には・では・へは・とは…"),
     el("p","pc-subtitle","14 組助詞｜大量實際例句｜20 組句型對照｜24 題小挑戰"));
   const header=el("nav","pc-tabs");header.setAttribute("aria-label","助詞組合學習分頁");
   [["overview","原理"],["niwa","は系列"],["nimo","も系列"],["compare","句子對照"],["pitfalls","易混淆"],["quiz","測驗"]]
     .forEach(([key,title])=>{
       const b=routeButton(key,title);
       b.className="pc-tab"+(id===key?" active":"");header.append(b);
     });
   wrap.append(header);
   if(id==="overview")introduction(wrap);
   else if(groupIds.includes(id))groupLesson(wrap,id);
   else if(id==="compare")contrastLesson(wrap);
   else if(id==="pitfalls")pitfallsLesson(wrap);
   else if(id==="quiz")quizLesson(wrap);
   root.append(wrap);return true;
 }
 const count=D.groups.reduce((s,g)=>s+g.examples.length,0)+comparisonPairs.length*2+
   P.extras.reduce((s,x)=>s+x.examples.length,0);
 window.ENJP_Particles={render,root:ROOT,groups:D.groups,pairs:comparisonPairs,quiz:P.quiz,
   count,sections:guide.length};
})();
"use strict";
/* ENJP Ocean: N5–N3 sentence connector academy with explicit POS/form matrices,
 * original bilingual examples, safe Japanese audio, per-lesson quiz and assembly practice.
 * Separate storage; never changes previous lesson, vocabulary or original-site progress.
 */
(function(){
 const lessons=window.ENJP_CONNECTION_LESSONS,course=window.ENJP_COURSES,Audio=window.ENJP_Audio;
 if(!Array.isArray(lessons)||!course?.jp?.N5||!Audio)return;
 const POS=["動詞","い形容詞","な形容詞","名詞"],STORE="enjpSentenceConnectorQuizV1";
 const map={},levels=["N5","N4","N3"];
 for(const lesson of lessons){
   if(map[lesson.id])throw Error("duplicate connective lesson "+lesson.id);
   if(!levels.includes(lesson.level))throw Error("unknown connective level "+lesson.id);
   map[lesson.id]=lesson;
 }
 for(const level of levels){
   const sections=lessons.filter(t=>t.level===level).map(t=>({id:t.id,title:t.title}));
   if(!sections.length)continue;
   course.jp[level].push({
     id:"sentence-connectors-"+level.toLowerCase(),
     title:level==="N5"?"07｜🔗 句子連接教室・基礎":level==="N4"?"07｜🔗 句子連接教室・應用":"07｜🔗 句子連接教室・進階",
     summary:level==="N5"?"從單字到多個形容詞、て形與先後動作":level==="N4"?"列舉、同時、否定、轉折及原因":"不只……也……與附加資訊",
     sections
   });
 }
 const node=(tag,cls,content)=>{
   const e=document.createElement(tag);
   if(cls)e.className=cls;
   if(content!==undefined)e.textContent=String(content);
   return e;
 };
 const add=(parent,...children)=>{parent.append(...children);return parent};
 const japanese=(host,ja,cls="sc-ja")=>{
   const p=node("p",cls);p.append(Audio.makeRuby(ja));host.append(p);return p;
 };
 const button=(label,cls="sc-secondary")=>{
   const b=node("button",cls,label);b.type="button";return b;
 };
 const speak=(host,ja,label="🔊 日文朗讀")=>{
   const row=node("div","sc-speech"),b=button(label,"sc-speak"),status=node("span","sc-voice-status","");
   status.setAttribute("role","status");
   if(!Audio.spokenJapanese(ja)){
     b.disabled=true;b.title="此例句尚未校對完整漢字讀音";
     status.textContent="讀音未完成，暫停朗讀";
   }else b.addEventListener("click",()=>Audio.play(ja,"jp",b,status));
   row.append(b,status);host.append(row);return b;
 };
 let storable=true,storageWarning="",saved={version:1,wrong:{},best:{},assembly:{}};
 try{
   const data=localStorage.getItem(STORE);
   if(data){
     const state=JSON.parse(data);
     if(!state||typeof state!=="object"||Array.isArray(state)||
       !state.wrong||typeof state.wrong!=="object"||Array.isArray(state.wrong)||
       !state.best||typeof state.best!=="object"||Array.isArray(state.best))throw Error("invalid local history");
     saved={version:1,wrong:state.wrong,best:state.best,assembly:state.assembly&&typeof state.assembly==="object"&&!Array.isArray(state.assembly)?state.assembly:{}};
   }
 }catch(e){
   storable=false;
   storageWarning="此專區原有的複習紀錄無法讀取，為避免覆寫，暫時不保存新成績。仍可正常閱讀與練習。";
 }
 function store(){
   if(!storable)return;
   try{localStorage.setItem(STORE,JSON.stringify(saved))}
   catch(e){storable=false;storageWarning="目前無法儲存進度，請確認裝置的網站資料權限。"}
 }
 function rulePanel(root,t){
   const area=node("section","sc-section");
   area.append(node("h3","sc-heading","① 文法接續公式"),
     node("p","sc-lead","先辨認詞性和型態；若該詞性不能直接接續，會明確標示不適用。"));
   const scroller=node("div","sc-table-scroll"),table=node("table","sc-rules");
   const head=node("thead");
   head.append(add(node("tr"),...["詞性","所需型態","接續公式與示範"].map(x=>node("th","",x))));
   table.append(head);
   const body=node("tbody");
   t.rules.forEach((rule,i)=>{
     const tr=node("tr"),pos=POS[i],invalid=rule.formula==="不能直接接續";
     if(invalid)tr.className="sc-not-applicable";
     const label=node("td","sc-rule-pos",pos);
     const shape=node("td","",invalid?"不適用":rule.shape);
     const detail=node("td","sc-rule-detail");
     detail.append(node("strong","",invalid?"不可直接接續":rule.formula));
     if(!invalid&&rule.sample!=="—")japanese(detail,rule.sample,"sc-sample");
     if(rule.note)detail.append(node("small","sc-rule-note",rule.note));
     tr.append(label,shape,detail);body.append(tr);
   });
   table.append(body);scroller.append(table);area.append(scroller);
   root.append(area);
 }
 function changes(root,t){
   const area=node("section","sc-section");
   area.append(node("h3","sc-heading","② 形態變化對照"));
   const grid=node("div","sc-changes");
   for(const x of t.changes){
     const item=node("div","sc-change");
     japanese(item,x.from,"sc-from");
     item.append(node("span","sc-arrow","→"));
     japanese(item,x.to,"sc-to");
     item.append(node("small","sc-change-note",x.tip));
     grid.append(item);
   }
   area.append(grid);root.append(area);
 }
 function exampleCard(x,index){
   const card=node("article","sc-example");
   card.append(node("span","sc-num","例句 "+String(index+1).padStart(2,"0")+"｜"+x.focus));
   japanese(card,x.ja);
   card.append(node("p","sc-chinese",x.zh));
   speak(card,x.ja);
   return card;
 }
 function examples(root,t){
   const area=node("section","sc-section");
   area.append(node("h3","sc-heading","③ 不同情境例句與朗讀"));
   const grid=node("div","sc-examples");
   t.examples.slice(0,3).forEach((x,i)=>grid.append(exampleCard(x,i)));
   area.append(grid);
   if(t.examples.length>3){
     const more=node("details","sc-more");
     more.append(node("summary","","＋ 展開其他 "+(t.examples.length-3)+" 個不同情境例句"));
     const extra=node("div","sc-examples");
     t.examples.slice(3).forEach((x,i)=>extra.append(exampleCard(x,i+3)));
     more.append(extra);area.append(more);
   }
   root.append(area);
 }
 function comparison(root,t){
   const area=node("section","sc-section");
   area.append(node("h3","sc-heading","④ 易混淆文法比較"),
     node("p","sc-lead",t.comparison.title));
   const grid=node("div","sc-comparisons");
   for(const x of t.comparison.rows){
     const card=node("div","sc-contrast-card");
     card.append(node("strong","sc-contrast-type",x.kind));
     japanese(card,x.ja);
     card.append(node("p","sc-chinese",x.zh),node("p","sc-context",x.note));
     speak(card,x.ja,"🔊 比較例句");
     grid.append(card);
   }
   area.append(grid);
   if(t.notes.length){
     const details=node("details","sc-notes");
     details.append(node("summary","","⚠️ 常見誤區與語感補充"));
     const list=node("ul");
     for(const hint of t.notes)list.append(node("li","",hint));
     details.append(list);area.append(details);
   }
   root.append(area);
 }
 function assembly(root,t){
   const area=node("section","sc-assembly");
   area.append(node("h3","sc-heading","⑤ 句子組裝挑戰"),
     node("p","sc-lead",t.builder.prompt),
     node("p","sc-context",t.builder.zh));
   const bank=node("div","sc-bank"),
     selected=node("div","sc-selected"),
     status=node("p","sc-answer-feedback","");
   status.setAttribute("role","status");
   const expected=t.builder.parts;
   let picks=[];
   const reset=()=>{picks=[];draw()};
   function draw(){
     bank.replaceChildren();selected.replaceChildren();status.replaceChildren();
     const order=expected.map((_,i)=>i);
     // Stable pseudo-shuffle per re-render? Use one local scramble of positions instead.
     for(const index of order.filter(i=>!picks.includes(i)).reverse()){
       const part=button("＋ "+expected[index],"sc-token");
       part.addEventListener("click",()=>{picks.push(index);draw()});
       bank.append(part);
     }
     if(!picks.length)selected.append(node("p","sc-context","點選下方片段，組成正確的日文句子。"));
     for(const [n,index] of picks.entries()){
       const part=button((n+1)+". "+expected[index],"sc-token sc-picked");
       part.title="點一下移除這個片段";
       part.addEventListener("click",()=>{picks.splice(n,1);draw()});
       selected.append(part);
     }
     check.disabled=picks.length!==expected.length;
   }
   const actions=node("div","sc-actions"),check=button("檢查組裝","sc-primary"),clear=button("重新排列","sc-secondary");
   check.addEventListener("click",()=>{
     if(picks.length!==expected.length)return;
     if(picks.every((x,i)=>x===i)){
       status.textContent="✅ 正確！你已經把句子連成完整敘述。";
       saved.assembly[t.id]=true;store();
       const ja=expected.join("");
       const result=node("div","sc-built");
       japanese(result,ja);
       speak(result,ja,"🔊 朗讀完整句子");
       status.append(result);
     }else status.textContent="❌ 順序還不正確，請調整片段後再檢查。";
   });
   clear.addEventListener("click",reset);
   actions.append(check,clear);
   area.append(selected,bank,actions,status);
   draw();root.append(area);
 }
 function quizzes(root,t){
   const area=node("section","sc-quiz");
   area.append(node("h3","sc-heading","⑥ 文法理解測驗與錯題複習"),
     node("p","sc-lead","每題判斷接續型態與語意，立即提供中文解析；錯題會記錄在本專區。"));
   const actions=node("div","sc-actions"),
     all=button("開始本課測驗","sc-primary"),
     mistakes=button("只練本課錯題","sc-secondary");
   const qBox=node("div","sc-quiz-body");
   actions.append(all,mistakes);area.append(actions,qBox);
   if(storageWarning)area.append(node("p","sc-warning",storageWarning));
   const key=n=>t.id+":"+n;
   let indices=[],at=0,score=0,answered=false;
   function draw(){
     answered=false;qBox.replaceChildren();
     const idx=indices[at],q=t.quiz[idx];
     qBox.append(node("p","sc-kicker","第 "+(at+1)+"／"+indices.length+" 題 · 目前答對 "+score+" 題"),
       node("p","sc-question",q.question));
     const grid=node("div","sc-answers");
     const alternatives=q.options.map((v,i)=>({v,i}));
     // Alternate the correct position deterministically instead of always putting it first.
     const offset=(at+idx)%alternatives.length;
     const rotated=alternatives.slice(offset).concat(alternatives.slice(0,offset));
     const explanation=node("div","sc-feedback");
     explanation.setAttribute("role","status");
     const next=button(at===indices.length-1?"查看結果":"下一題 →","sc-primary");
     next.disabled=true;
     for(const {v} of rotated){
       const option=button(v,"sc-answer");
       option.addEventListener("click",()=>{
         if(answered)return;
         answered=true;
         const correct=v===q.answer;
         if(correct)score++;
         saved.wrong[key(idx)]=!correct;
         store();
         for(const btn of grid.children){
           btn.disabled=true;
           if(btn.textContent===q.answer)btn.className+=" sc-correct";
           else if(btn.textContent===v)btn.className+=" sc-incorrect";
         }
         explanation.append(node("strong","",correct?"✅ 答對！":"正確答案："+q.answer),
           node("p","",q.why));
         if(storageWarning)explanation.append(node("p","sc-warning",storageWarning));
         next.disabled=false;
       });
       grid.append(option);
     }
     next.addEventListener("click",()=>{
       if(!answered)return;
       at++;
       if(at<indices.length)draw();
       else{
         if(indices.length===t.quiz.length)saved.best[t.id]=Math.max(Number(saved.best[t.id])||0,score);
         store();qBox.replaceChildren();
         qBox.append(node("h4","sc-result","本回合完成：答對 "+score+"／"+indices.length+" 題"),
           node("p","sc-context","可以繼續選擇「只練本課錯題」，或回去重看接續公式與例句。"));
       }
     });
     qBox.append(grid,explanation,next);
   }
   const start=wrongOnly=>{
     indices=t.quiz.map((_,i)=>i).filter(i=>!wrongOnly||saved.wrong[key(i)]===true);
     at=0;score=0;answered=false;
     if(!indices.length){
       qBox.replaceChildren(node("p","sc-context",wrongOnly?"目前沒有錯題，試試完整測驗！":"本課暫無題目。"));return;
     }
     draw();
   };
   all.addEventListener("click",()=>start(false));
   mistakes.addEventListener("click",()=>start(true));
   start(false);
   root.append(area);
 }
 function render(root,id){
   const t=map[id];if(!t)return false;
   const wrap=node("div","sc-course");
   wrap.append(node("span","sc-kicker","JLPT "+t.level+"｜🔗 句子連接教室"),
     node("h2","sc-title",t.title),
     node("strong","sc-meaning",t.meaning),
     node("p","sc-intro",t.goal));
   rulePanel(wrap,t);
   changes(wrap,t);
   examples(wrap,t);
   comparison(wrap,t);
   assembly(wrap,t);
   quizzes(wrap,t);
   root.append(wrap);return true;
 }
 window.ENJP_ConnectionLesson={
   has:id=>Object.prototype.hasOwnProperty.call(map,id),
   get:id=>map[id]||null,
   render,keys:Object.keys(map),storageKey:STORE,levels
 };
})();

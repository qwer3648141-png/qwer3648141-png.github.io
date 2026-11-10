"use strict";
/*
 * ENJP Ocean 4.1 — thematic N5/N4/N3 vocabulary and adaptive quiz.
 * Vocabulary levels are pedagogical estimates, NOT an official JLPT list.
 * The old 30-chapter JP/EN paired bank and its progress are not modified.
 * Append new vocabulary to the ends of existing themes: stable IDs matter.
 */
(function(){
 const raw=window.ENJP_CURATED_VOCAB_BATCHES||[];
 const audio=window.ENJP_Audio;
 if(!audio)return;
 const REVIEW_KEY="enjpCuratedVocabReviewV1";
 const LEVELS=["N5","N4","N3"];
 const el=(tag,cls,content)=>{
   const node=document.createElement(tag);
   if(cls)node.className=cls;
   if(content!==undefined)node.textContent=String(content);
   return node;
 };
 const push=(node,...children)=>{node.append(...children);return node};
 const shuffle=items=>{
   const a=items.slice();
   for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
   return a;
 };
 const formatDay=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
 const today=()=>formatDay(new Date());
 const afterDays=days=>{const n=new Date();n.setHours(12,0,0,0);n.setDate(n.getDate()+days);return formatDay(n)};
 const spacedIntervals=[1,2,4,7,14,30,60,90];
 const themes=[],sections={},chapters={N5:[],N4:[],N3:[]},words=[],wordById={};
 for(const item of raw){
   if(!LEVELS.includes(item.level)||!Array.isArray(item.rows)||!item.rows.length)continue;
   const id="curated-vocab-"+item.level.toLowerCase()+"-"+item.slug;
   if(sections[id])throw Error("Duplicate curated vocabulary topic "+id);
   const prepared=item.rows.map((r,index)=>{
     const idWord="cv-"+item.level.toLowerCase()+"-"+item.slug+"-"+String(index+1).padStart(3,"0");
     if(wordById[idWord])throw Error("Duplicate word ID "+idWord);
     const w={id:idWord,level:item.level,topicId:id,term:r[0],reading:r[1],zh:r[2],example:r[3],translation:r[4]};
     wordById[idWord]=w;words.push(w);
     return w;
   });
   const topic={id,level:item.level,slug:item.slug,title:item.title,description:item.description,words:prepared};
   themes.push(topic);sections[id]=topic;
   const group=chapters[item.level];
   group.push({id:"curated-vocab-group-"+item.level.toLowerCase()+"-"+item.slug,
     title:String(group.length+1).padStart(2,"0")+"｜"+item.title,
     summary:item.description+" · "+prepared.length+" 字",
     sections:[{id,title:"📗 "+item.title+"（"+prepared.length+" 字）"}]});
 }
 let writable=true,storageNote="",progress={version:1,cards:{}};
 try{
   const rawSaved=window.localStorage?.getItem(REVIEW_KEY);
   if(rawSaved){
     const parsed=JSON.parse(rawSaved);
     if(!parsed||typeof parsed!=="object"||Array.isArray(parsed)||!parsed.cards||typeof parsed.cards!=="object"||Array.isArray(parsed.cards))throw Error("Invalid progress");
     progress=parsed;
   }
 }catch(e){
   writable=false;storageNote="既有單字複習紀錄無法讀取，已停止寫入以避免覆蓋；仍可照常練習本次題目。";
 }
 const save=()=>{
   if(!writable)return;
   try{window.localStorage?.setItem(REVIEW_KEY,JSON.stringify(progress))}
   catch(e){writable=false;storageNote="瀏覽器目前無法保存新進度；請檢查網站資料權限。"}
 };
 const reviewOf=w=>progress.cards[w.id]||null;
 function recordAnswer(w,correct){
   const current=reviewOf(w)||{seen:0,correct:0,wrong:0,streak:0,firstDay:today()};
   const streak=correct?Math.min(100,(Number(current.streak)||0)+1):0;
   const next=correct?afterDays(spacedIntervals[Math.min(streak-1,spacedIntervals.length-1)]):today();
   progress.cards[w.id]={
     ...current,seen:(Number(current.seen)||0)+1,
     correct:(Number(current.correct)||0)+(correct?1:0),
     wrong:(Number(current.wrong)||0)+(correct?0:1),
     streak,next,lastDay:today(),lastCorrect:!!correct,
     firstDay:current.firstDay||today()
   };
   save();
 }
 const isDue=w=>{const row=reviewOf(w);return !!row&&typeof row.next==="string"&&row.next<=today()};
 const isWeak=w=>{const row=reviewOf(w);return !!row&&(Number(row.wrong)||0)>0&&(Number(row.streak)||0)<3};
 const isNew=w=>!reviewOf(w);
 function stats(source){
   const rows=source||words;
   return {total:rows.length,newWords:rows.filter(isNew).length,due:rows.filter(isDue).length,
     weak:rows.filter(isWeak).length,learnedToday:rows.filter(w=>reviewOf(w)?.firstDay===today()).length,
     strong:rows.filter(w=>(reviewOf(w)?.streak||0)>=3).length};
 }
 const annotate=w=>{
   const anno=window.ENJP_Inflections?.annotation?.(w.term,w.reading);
   if(typeof anno==="string"&&anno!==w.term)return anno;
   if(!/[一-龯々]/.test(w.term))return w.term;
   if(/^[一-龯々]+$/.test(w.term))return w.term+"（"+w.reading+"）";
   return w.term;
 };
 const japanese=(where,annotated,className)=>{
   const p=el("p",className||"cv-japanese");
   p.append(audio.makeRuby(annotated));where.append(p);return p;
 };
 function voice(where,source,text="🔊 朗讀"){
   const row=el("div","cv-speech"),button=el("button","cv-voice",text),status=el("span","cv-voice-status","");
   button.type="button";status.setAttribute("role","status");
   if(!audio.spokenJapanese(source)){button.disabled=true;button.title="此句尚未具備完整讀音標註";}
   else button.addEventListener("click",()=>audio.play(source,"jp",button,status));
   row.append(button,status);where.append(row);return button;
 }
 const summary=(root,rows)=>{
   const s=stats(rows);
   const panel=el("div","cv-stats");
   for(const [number,label]of [[s.total,"本區單字"],[s.newWords,"尚未抽考"],[s.due,"今日到期"],[s.weak,"待加強"]]){
     const item=el("div","cv-stat");
     item.append(el("strong","",number),el("small","",label));panel.append(item);
   }
   root.append(panel);
   return s;
 };
 function selectSmart(pool,source="smart"){
   const fresh=shuffle(pool.filter(isNew)),due=shuffle(pool.filter(isDue)),weak=shuffle(pool.filter(isWeak)),
     seen=shuffle(pool.filter(w=>!isNew(w)));
   let combined=[];
   if(source==="due")combined=due;
   else if(source==="weak")combined=weak;
   else if(source==="new")combined=fresh;
   else if(source==="topic")combined=shuffle(pool);
   else{
     // Prefer due material; retain room for new cards. Never repeat a word in the same first round.
     combined=due.slice(0,6).concat(weak.slice(0,2),fresh.slice(0,6),seen);
   }
   const unique=new Set();
   const result=[];
   for(const w of combined){if(unique.has(w.id))continue;unique.add(w.id);result.push(w);if(result.length===10)break}
   if(source==="smart"&&result.length<10){
     for(const w of shuffle(pool)){if(!unique.has(w.id)){result.push(w);unique.add(w.id)}if(result.length===10)break}
   }
   return result;
 }
 function choicesFor(w,kind){
   const values=kind==="zhToJp"?"term":"zh";
   const candidates=shuffle(words.filter(v=>v.id!==w.id&&v.level===w.level&&v[values]!==w[values]));
   const preferred=candidates.filter(v=>v.topicId===w.topicId);
   const result=[w],used=new Set([w[values]]);
   for(const option of preferred.concat(candidates)){
     if(used.has(option[values]))continue;
     result.push(option);used.add(option[values]);
     if(result.length===4)break;
   }
   return shuffle(result);
 }
 function countStats(root,title,rows){
   root.append(el("h2","cv-title",title));
   summary(root,rows);
   if(storageNote)root.append(el("p","cv-warning",storageNote));
 }
 function renderQuestion(parent,entry,index,total,onCorrect,onNext,forceListening=false){
   const box=el("section","cv-question-panel");
   const word=entry.word,kind=forceListening?"listen":entry.kind;
   box.append(el("p","cv-step","第 "+(index+1)+" / "+total+" 題"+(entry.retry?" · 錯題再試":"")),
     el("span","cv-question-kicker",kind==="zhToJp"?"看中文選日文":kind==="listen"?"只聽聲音選意思":"看日文選中文"));
   if(kind==="zhToJp")box.append(el("h3","cv-question-text",word.zh));
   else if(kind==="listen"){
     const prompt=el("div","cv-audio-prompt");
     prompt.append(el("p","","先點播放，不顯示單字，看你能否聽出意思。"));
     voice(prompt,word.reading,"🔊 播放題目");
     box.append(prompt);
   }else{
     const prompt=el("div","cv-word-prompt");
     japanese(prompt,annotate(word),"cv-word-prompt-text");box.append(prompt);
   }
   const options=el("div","cv-options"),feedback=el("div","cv-feedback"),next=el("button","cv-primary","下一題 →");
   next.type="button";next.disabled=true;feedback.setAttribute("role","status");
   const others=choicesFor(word,kind==="zhToJp"?"zhToJp":"jpToZh");
   let answered=false;
   for(const candidate of others){
     const button=el("button","cv-option");button.type="button";
     if(kind==="zhToJp")button.append(audio.makeRuby(annotate(candidate)));
     else button.textContent=candidate.zh;
     button.addEventListener("click",()=>{
       if(answered)return;
       answered=true;
       const correct=candidate.id===word.id;
       onCorrect(word,correct,entry);
       for(const child of options.children){
         child.disabled=true;
         if(child.dataset.id===word.id)child.classList.add("is-correct");
         else if(child.dataset.id===candidate.id)child.classList.add("is-wrong");
       }
       feedback.append(el("strong","",correct?"✅ 答對！":"❌ 正確答案："+word.zh));
       const reveal=el("div","cv-reveal");
       japanese(reveal,annotate(word),"cv-japanese");
       reveal.append(el("p","cv-translation","中文："+word.zh));
       japanese(reveal,word.example,"cv-example-ja");
       reveal.append(el("p","cv-translation",word.translation));
       voice(reveal,word.example,"🔊 聽完整例句");
       feedback.append(reveal);
       next.disabled=false;
     });
     button.dataset.id=candidate.id;
     options.append(button);
   }
   next.addEventListener("click",()=>{if(answered)onNext()});
   box.append(options,feedback,next);
   parent.append(box);
 }
 function createQuiz(host,pool,{source="smart",listening=false,title="智慧抽考",onBack=()=>{}}={}){
   const selected=selectSmart(pool,source);
   const panel=el("section","cv-quiz");
   panel.append(el("h2","cv-title","🎯 "+title),
     el("p","cv-help","每回合最多 10 個不同單字；答錯會在本回合尾聲再出現一次，答題結果會安排下一次複習。"));
   const back=el("button","cv-secondary","← 回到單字庫");
   back.type="button";back.addEventListener("click",()=>{audio.stop();onBack()});
   panel.append(back);
   if(!selected.length){
     panel.append(el("p","cv-empty",source==="due"?"目前沒有到期的單字，可以練新字或任選主題。":source==="weak"?"目前沒有需要加強的錯題。":"這個範圍目前沒有可抽考的單字。"));
     host.replaceChildren(panel);return;
   }
   const queue=selected.map((word,i)=>({word,kind:listening?"listen":i%3===0?"zhToJp":"jpToZh",retry:false}));
   const size=selected.length;
   const view=el("div","cv-quiz-body");
   panel.append(view);
   host.replaceChildren(panel);
   let at=0,score=0,firstPassScore=0,wrongRetried=new Set();
   const draw=()=>{
     view.replaceChildren();
     if(at>=queue.length){
       view.append(el("h3","cv-finish","完成！首次作答答對 "+firstPassScore+" / "+size+" 題"),
         el("p","cv-help","這一輪共回答 "+at+" 次（含錯題複習）。下一次複習日期已依結果安排；答錯的字可以到「錯題衝刺」再練。"));
       const restart=el("button","cv-primary","再練一回 10 題");
       restart.type="button";restart.addEventListener("click",()=>createQuiz(host,pool,{source,listening,title,onBack}));
       view.append(restart);
       return;
     }
     const entry=queue[at];
     const progress=el("div","cv-progress");
     progress.append(el("div","cv-progress-track"));
     progress.firstChild.append(el("span","cv-progress-fill"));
     progress.firstChild.firstChild.style.width=String(Math.round(100*at/Math.max(1,queue.length)))+"%";
     view.append(progress);
     renderQuestion(view,entry,at,queue.length,(word,correct,item)=>{
       score++;
       recordAnswer(word,correct);
       if(!item.retry&&correct)firstPassScore++;
       // One retry at the end for an incorrect first attempt, never an infinite chain.
       if(!correct&&!item.retry&&!wrongRetried.has(word.id)){
         wrongRetried.add(word.id);queue.push({word,kind:listening?"listen":"zhToJp",retry:true});
       }
     },()=>{at++;draw()},listening);
   };
   draw();
 }
 function wordCard(word){
   const card=el("article","cv-word-card");
   const head=el("div","cv-card-head");
   const identity=el("div","cv-identity");
   japanese(identity,annotate(word),"cv-word");
   identity.append(el("p","cv-reading",word.reading));
   head.append(identity);
   const review=reviewOf(word),status=el("span","cv-status",
     !review?"未抽考":isDue(word)?"到期複習":review.streak>=3?"熟練":"學習中");
   head.append(status);card.append(head);
   card.append(el("p","cv-meaning",word.zh));
   voice(card,word.reading,"🔊 單字");
   const ex=el("div","cv-example");
   japanese(ex,word.example,"cv-example-ja");
   ex.append(el("p","cv-translation",word.translation));
   voice(ex,word.example,"🔊 例句");
   card.append(ex);
   return card;
 }
 function topicView(host,topic){
   const shell=el("section","cv-topic");
   const renderListing=()=>{
     shell.replaceChildren();
     shell.append(el("div","cv-eyebrow",topic.level+" · 生活情境主題"),
       el("h2","cv-title",topic.title),
       el("p","cv-help",topic.description));
     summary(shell,topic.words);
     if(storageNote)shell.append(el("p","cv-warning",storageNote));
     const actions=el("div","cv-actions");
     const quiz=el("button","cv-primary","🎯 本主題抽考 10 題"),
       listen=el("button","cv-secondary","🎧 本主題聽力考");
     quiz.type="button";listen.type="button";
     quiz.addEventListener("click",()=>createQuiz(shell,topic.words,{source:"topic",title:topic.title+" · 主題抽考",onBack:renderListing}));
     listen.addEventListener("click",()=>createQuiz(shell,topic.words,{source:"topic",listening:true,title:topic.title+" · 聽力抽考",onBack:renderListing}));
     actions.append(quiz,listen);shell.append(actions);
     const label=el("label","cv-search-label","搜尋本主題的日文、讀音或中文");
     const input=el("input","cv-search");
     input.type="search";input.placeholder="輸入單字、假名、中文意思…";
     input.setAttribute("aria-label","搜尋本主題單字");
     shell.append(label,input);
     const count=el("p","cv-help"),list=el("div","cv-word-grid"),pager=el("nav","cv-pagination");
     pager.setAttribute("aria-label","單字頁碼");
     shell.append(count,list,pager);
     let page=0,search="";
     const draw=()=>{
       const match=topic.words.filter(w=>[w.term,w.reading,w.zh,w.translation].some(x=>String(x).toLocaleLowerCase().includes(search)));
       const pages=Math.max(1,Math.ceil(match.length/12));page=Math.min(page,pages-1);
       list.replaceChildren();
       for(const w of match.slice(page*12,(page+1)*12))list.append(wordCard(w));
       count.textContent="目前顯示 "+(match.length?1+page*12:0)+"–"+Math.min(match.length,(page+1)*12)+" / "+match.length+" 個單字";
       pager.replaceChildren();
       if(pages>1){
         const prev=el("button","cv-secondary","← 上一頁"),next=el("button","cv-secondary","下一頁 →");
         prev.type="button";next.type="button";prev.disabled=page===0;next.disabled=page===pages-1;
         prev.addEventListener("click",()=>{page--;audio.stop();draw()});
         next.addEventListener("click",()=>{page++;audio.stop();draw()});
         pager.append(prev,el("span","",String(page+1)+" / "+pages),next);
       }
       if(!match.length)list.append(el("p","cv-empty","找不到相符的單字，請試其他關鍵字。"));
     };
     input.addEventListener("input",()=>{search=input.value.trim().toLocaleLowerCase();page=0;draw()});
     draw();
   };
   host.append(shell);renderListing();return true;
 }
 function homeView(host,level){
   const scope=level==="all"?words:words.filter(w=>w.level===level);
   const shell=el("section","cv-home");
   const home=()=>{
     shell.replaceChildren();
     countStats(shell,"📚 N5～N3 主題單字 · 第一批",scope);
     shell.append(el("p","cv-help","先選左側主題閱讀，再用智慧抽考複習。新單字與到期錯題會優先出題；三個等級可自由切換。"));
     const guide=el("p","cv-help","複習間隔依答題結果安排：1／2／4／7／14／30 天等；答錯會回到今日並列入待加強。每天可做多回合，不用連續打卡。");
     shell.append(guide);
     const buttons=el("div","cv-actions cv-actions-home");
     for(const [source,label,listening] of [["smart","🧠 智慧混合 10 題",false],["new","🌱 練 10 個新字",false],["due","📅 到期複習",false],["weak","🎯 錯題衝刺",false],["smart","🎧 聽力抽考",true]]){
       const b=el("button",source==="smart"&&!listening?"cv-primary":"cv-secondary",label);
       b.type="button";b.addEventListener("click",()=>createQuiz(shell,scope,{source,listening,title:label,onBack:home}));
       buttons.append(b);
     }
     shell.append(buttons);
     const topicGrid=el("div","cv-theme-grid");
     for(const topic of themes.filter(t=>level==="all"||t.level===level)){
       const b=el("button","cv-theme");
       b.type="button";
       b.append(el("span","cv-theme-grade",topic.level),
         el("strong","",topic.title),el("small","",topic.words.length+" 個單字｜"+topic.description));
       b.addEventListener("click",()=>{
         window.ENJP_3?.state&&(window.ENJP_3.state.sectionId=topic.id);
         window.ENJP_3?.renderReader?.();
       });
       topicGrid.append(b);
     }
     shell.append(el("h3","cv-home-subtitle","按主題選擇單字課程"),topicGrid);
   };
   host.append(shell);home();return true;
 }
 window.ENJP_CuratedVocab={
   chapters,topics:themes,words,sections,reviewKey:REVIEW_KEY,stats,selectSmart,recordAnswer,
   home:homeView,render:(root,id)=>sections[id]?topicView(root,sections[id]):false,
   has:id=>Boolean(sections[id])
 };
})();

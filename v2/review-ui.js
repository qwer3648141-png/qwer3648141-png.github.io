/* ENJP V2 batch review UI; uses the existing lesson bank and scoring functions. */
(function(){
"use strict";
const core=window.ENJP_V2_REVIEW,batch=window.ENJP_V2_BATCH;
const KEY="enjpV2ReviewDetailedV1";
if(!core||!batch){console.warn("ENJP V2 review dependencies unavailable");return;}
let panel=null,session=null,kind="all",limit=10;
const $=id=>document.getElementById(id);
function localDay(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")}
function read(){
 const raw=localStorage.getItem(KEY);
 if(!raw)return {};
 const data=JSON.parse(raw);
 if(!data||typeof data!=="object"||Array.isArray(data))throw Error("Review storage is invalid");
 return data;
}
function catalogue(){
 const words=typeof LEX_WORDS==="function"?LEX_WORDS():[];
 const grammar=typeof grammarBank!=="undefined"?grammarBank:[];
 const oldLex=typeof lexState!=="undefined"?lexState.items:{};
 const oldGrammar=typeof store!=="undefined"?store.grammar:{};
 return batch.items({day:localDay(),words,grammar,legacyLex:oldLex,legacyGrammar:oldGrammar,detailed:read(),forms:v=>v.kind==="adj"?lexAdjForms(v):lexVerbForms(v)});
}
function showInfo(message){$("v2ReviewInfo").textContent=message}
function overview(){
 try{
  const x=catalogue();
  $("v2ReviewStats").textContent="到期 "+batch.select(x.due,{kind,limit:100}).length+" 題（最多顯示 100 題）｜可探索新題 "+batch.select(x.fresh,{kind,limit:100}).length+" 題（最多顯示 100 題）";
  showInfo("可補複習多天累積的到期題。舊紀錄保留，新版另記錄每種變化與題型。");
  $("v2ReviewStartDue").disabled=!x.due.some(t=>kind==="all"||kind===t.kind);
  $("v2ReviewStartFresh").disabled=!x.fresh.some(t=>kind==="all"||kind===t.kind);
 }catch(e){showInfo("無法讀取複習資料；已停止操作，避免覆蓋原有紀錄。");$("v2ReviewStartDue").disabled=true;$("v2ReviewStartFresh").disabled=true}
}
function esc(text){return String(text).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function question(){
 const box=$("v2ReviewQuestion"),q=session?.items[session.index];
 if(!q){
  box.hidden=false;
  $("v2ReviewProgress").textContent="完成 "+session.correct+" / "+session.items.length+" 題";
  $("v2ReviewPrompt").textContent="🎉 這一批複習完成了！";
  $("v2ReviewDetail").textContent="可回到上方重新選擇到期題或新題。";
  $("v2ReviewInput").hidden=true;$("v2ReviewOptions").hidden=true;
  $("v2ReviewActions").hidden=true;$("v2ReviewFeedback").textContent="";
  overview();return;
 }
 session.answered=false;
 box.hidden=false;$("v2ReviewActions").hidden=false;
 $("v2ReviewProgress").textContent=(session.index+1)+" / "+session.items.length+" · "+q.level+" · "+({verb:"動詞",adj:"形容詞",grammar:"文法"}[q.kind]||"");
 $("v2ReviewFeedback").textContent="想好再作答；看答案會記錄為不熟。";
 $("v2ReviewNext").hidden=true;$("v2ReviewInput").value="";
 $("v2ReviewCheck").disabled=false;$("v2ReviewReveal").disabled=false;
 $("v2ReviewDetail").textContent=q.kind==="grammar"?(q.skill==="meaning"?"選出正確的中文意思":"依照中文意思選出正確文法"):"請輸入「"+q.skill+"」的日文變化";
 const prompt=$("v2ReviewPrompt");prompt.replaceChildren();
 if(q.kind==="grammar")prompt.textContent=q.skill==="meaning"?q.source.f:q.source.m;
 else if(typeof jpRubySurface==="function"&&q.source.reading)prompt.innerHTML=jpRubySurface(q.source.word,q.source.reading);
 else prompt.textContent=q.source.word;
 const options=$("v2ReviewOptions"),input=$("v2ReviewInput");options.replaceChildren();
 if(q.kind==="grammar"){
  options.hidden=false;input.hidden=true;
  const source=grammarBank.filter(g=>g.lv===q.source.lv&&g.f!==q.source.f);
  const alt=source.sort(()=>Math.random()-.5).slice(0,3).map(g=>q.skill==="meaning"?g.m:g.f);
  const choices=[q.answer,...alt].sort(()=>Math.random()-.5);
  choices.forEach(value=>{const b=document.createElement("button");b.type="button";b.className="v2-review-choice";b.textContent=value;b.onclick=()=>submit(value,false);options.append(b)});
  $("v2ReviewCheck").hidden=true;
 }else{
  options.hidden=true;input.hidden=false;$("v2ReviewCheck").hidden=false;
 }
}
function normalize(v){return String(v??"").trim().replace(/[\s　。、．・]/g,"").toLowerCase()}
function isCorrect(q,value){
 if(normalize(value)===normalize(q.answer))return true;
 if(q.kind==="grammar")return false;
 try{
  if(q.kind==="verb"&&typeof vlReadingForms==="function"){
   const forms=vlReadingForms(q.source);
   if(forms[q.skill]&&normalize(value)===normalize(forms[q.skill]))return true;
  }
  if(q.kind==="adj"&&q.source.reading){
   const forms=lexAdjForms({...q.source,word:q.source.reading});
   if(forms[q.skill]&&normalize(value)===normalize(forms[q.skill]))return true;
  }
 }catch(_){}return false;
}
function submit(value,reveal){
 const q=session?.items[session.index];
 if(!q||session.answered)return;
 const correct=!reveal&&isCorrect(q,value);
 try{
  const old=read(),next={...old};
  next[q.key]=core.grade(old[q.key],{day:localDay(),correct,type:q.kind==="grammar"?"choice":"input",revealed:reveal});
  localStorage.setItem(KEY,JSON.stringify(next));
 }catch(e){showInfo("無法儲存細項學習紀錄，已取消這題計分。請檢查瀏覽器儲存空間。");return;}
 session.answered=true;if(correct)session.correct++;
 if(q.kind==="grammar"&&typeof markGrammar==="function")markGrammar(q.source,correct);
 else if(typeof lexMark==="function")lexMark(q.source,correct);
 $("v2ReviewFeedback").textContent=(correct?"✅ 正確！":"💡 正確答案："+q.answer)+(q.kind==="grammar"?"｜"+q.source.m:"｜"+q.meaning);
 $("v2ReviewNext").hidden=false;$("v2ReviewCheck").disabled=true;$("v2ReviewReveal").disabled=true;
 $("v2ReviewOptions").querySelectorAll("button").forEach(b=>{b.disabled=true;if(normalize(b.textContent)===normalize(q.answer))b.classList.add("correct")});
}
function start(source){
 let rows;try{const x=catalogue();rows=x[source]}catch(e){showInfo("學習紀錄讀取失敗，沒有開始測驗。");return;}
 if(source==="fresh")rows=[...rows].sort(()=>Math.random()-.5);
 const selected=batch.select(rows,{kind,limit});
 if(!selected.length){showInfo("目前沒有符合篩選的題目，可以更換分類或改選新題。");return;}
 session={items:selected,index:0,correct:0,answered:false};question();
}
function open(){
 if(!panel)return;panel.hidden=false;overview();panel.scrollIntoView({behavior:"smooth",block:"start"});
}
function close(){if(panel)panel.hidden=true}
function init(){
 const shelf=$("v2ModeShelf");if(!shelf||$("v2ReviewPanel"))return;
 panel=document.createElement("section");panel.id="v2ReviewPanel";panel.className="v2-review-panel";panel.hidden=true;
 panel.innerHTML='<div class="v2-review-header"><div><span class="v2-review-kicker">ENJP OCEAN · SMART REVIEW</span><h2>🧠 智慧錯題與批次複習</h2><p>跨日到期題、動詞變化與文法分開記錄</p></div><button type="button" id="v2ReviewClose">關閉 ✕</button></div>'+
 '<div class="v2-review-toolbar"><label>題目分類<select id="v2ReviewKind"><option value="all">全部</option><option value="verb">動詞</option><option value="adj">形容詞</option><option value="grammar">N5～N3 文法</option></select></label><label>練習題數<select id="v2ReviewLimit"><option>10</option><option>20</option><option>30</option><option>50</option></select></label></div>'+
 '<p id="v2ReviewStats" class="v2-review-stats"></p><p id="v2ReviewInfo" class="v2-review-info" role="status"></p>'+
 '<div class="v2-review-start"><button type="button" id="v2ReviewStartDue">開始到期複習</button><button type="button" id="v2ReviewStartFresh">探索新題目</button></div>'+
 '<div id="v2ReviewQuestion" class="v2-review-question" hidden><p id="v2ReviewProgress"></p><div id="v2ReviewPrompt" class="v2-review-prompt"></div><p id="v2ReviewDetail"></p><input id="v2ReviewInput" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" lang="ja" placeholder="輸入日文變化" aria-label="請輸入答案"><div id="v2ReviewOptions" class="v2-review-options" hidden></div><div id="v2ReviewActions"><button type="button" id="v2ReviewCheck">檢查答案</button><button type="button" id="v2ReviewReveal">看答案（記為不熟）</button><button type="button" id="v2ReviewNext" hidden>下一題 →</button></div><p id="v2ReviewFeedback" role="status"></p></div>';
 shelf.insertAdjacentElement("afterend",panel);
 $("v2ReviewClose").onclick=close;
 $("v2ReviewKind").onchange=e=>{kind=e.target.value;overview()};
 $("v2ReviewLimit").onchange=e=>{limit=Number(e.target.value)||10;overview()};
 $("v2ReviewStartDue").onclick=()=>start("due");
 $("v2ReviewStartFresh").onclick=()=>start("fresh");
 $("v2ReviewCheck").onclick=()=>submit($("v2ReviewInput").value,false);
 $("v2ReviewInput").onkeydown=e=>{if(e.key==="Enter")submit(e.target.value,false)};
 $("v2ReviewReveal").onclick=()=>submit("",true);
 $("v2ReviewNext").onclick=()=>{session.index++;question()};
 window.ENJP_V2_REVIEW_UI=Object.freeze({open,close,readProgress:read});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

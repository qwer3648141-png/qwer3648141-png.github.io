/* ENJP Ocean 2.0 — additive batch review panel (development branch only).
   Legacy records remain intact; detailed progress is stored separately. */
(function(){
"use strict";
const core=window.ENJP_V2_REVIEW,batch=window.ENJP_V2_BATCH;
if(!core||!batch)return;
const KEY="enjpV2ReviewProgress";
let pane=null,queue=[],position=0,answered=false,correctCount=0,sessionTotal=0,sourceMode="due";
function localDay(){
 const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
}
function read(){try{const raw=JSON.parse(localStorage.getItem(KEY)||"{}");return raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{}}catch(_){return {}}}
function materials(){
 return {day:localDay(),words:typeof LEX_WORDS==="function"?LEX_WORDS():[],
 grammar:typeof grammarBank!=="undefined"?grammarBank:[],
 forms:v=>v.kind==="verb"?lexVerbForms(v):lexAdjForms(v),
 legacyLex:typeof lexState!=="undefined"?lexState.items:{},
 legacyGrammar:typeof store!=="undefined"?store.grammar:{},detailed:read()};
}
function node(sel){return pane.querySelector(sel)}
function announce(t){node("[data-review-message]").textContent=t}
function setVisible(sel,show){node(sel).hidden=!show}
function stats(){
 const data=batch.items(materials()),kind=node("[data-review-kind]").value;
 const due=data.due.filter(t=>kind==="all"||t.kind===kind),known=Object.keys(read()).length;
 node("[data-review-summary]").textContent="待複習 "+due.length+" 項｜2.0 細項紀錄 "+known+" 項（舊資料會自動納入待複習判斷）";
 node("[data-review-start]").disabled=due.length===0;
 node("[data-review-start]").textContent=due.length?"開始到期複習":"目前沒有到期內容";
 node("[data-review-fresh]").disabled=!data.fresh.some(t=>kind==="all"||t.kind===kind);
}
function open(){
 if(!pane)return;
 pane.hidden=false;
 stats();
 pane.scrollIntoView({behavior:"smooth",block:"start"});
}
function escapeText(s){return String(s==null?"":s)}
function displayQuestion(t){
 node("[data-review-step]").textContent="第 "+(position+1)+" / "+sessionTotal+" 題";
 node("[data-review-kind-tag]").textContent=(t.kind==="grammar"?"文法":t.kind==="verb"?"動詞":"形容詞")+" · "+t.level;
 const prompt=node("[data-review-prompt]"),hint=node("[data-review-hint]");
 prompt.textContent="";hint.textContent="";
 setVisible("[data-review-inputbox]",false);
 const choiceBox=node("[data-review-options]");choiceBox.replaceChildren();
 if(t.kind==="grammar"){
  prompt.textContent=t.skill==="meaning"?t.id:t.meaning;
  hint.textContent=t.skill==="meaning"?"請選出文法的中文意思":"請選出正確的日文文法形式";
  const options=materials().grammar.filter(g=>g.lv===t.level);
  const getLabel=g=>t.skill==="meaning"?g.m:g.f;
  const right=t.answer;
  const wrong=[...new Set(options.map(getLabel).filter(s=>s!==right))].sort(()=>Math.random()-.5).slice(0,3);
  const choices=[right,...wrong].sort(()=>Math.random()-.5);
  for(const choice of choices){
   const button=document.createElement("button");
   button.type="button";button.className="v2-review-option";button.textContent=choice;
   button.addEventListener("click",()=>submit(choice,false));
   choiceBox.appendChild(button);
  }
 }else{
  const text=t.source.word||t.id,reading=t.source.reading||"";
  if(typeof jpRubySurface==="function"&&reading){prompt.innerHTML=jpRubySurface(text,reading)}
  else prompt.textContent=text;
  hint.textContent=t.meaning+"｜請輸入「"+t.skill+"」";
  setVisible("[data-review-inputbox]",true);
  node("[data-review-answer]").value="";node("[data-review-answer]").disabled=false;
  node("[data-review-check]").disabled=false;
 }
 setVisible("[data-review-next]",false);
 node("[data-review-feedback]").textContent="";
 node("[data-review-reveal]").disabled=false;
 node("[data-review-audio]").hidden=t.kind==="grammar";
}
function start(mode){
 const data=batch.items(materials()),kind=node("[data-review-kind]").value;
 const limit=Number(node("[data-review-count]").value)||10;
 const pool=mode==="due"?data.due:data.fresh;
 queue=batch.select(pool,{kind,limit});
 if(mode!=="due")queue=queue.sort(()=>Math.random()-.5);
 if(!queue.length){stats();announce(mode==="due"?"此類別目前沒有到期題目":"此類別暫時沒有新的練習內容");return}
 sourceMode=mode;position=0;correctCount=0;sessionTotal=queue.length;answered=false;
 setVisible("[data-review-session]",true);
 announce(mode==="due"?"進行到期複習中":"進行自由練習中");
 displayQuestion(queue[position]);
}
function normalize(s){
 return escapeText(s).normalize("NFKC").replace(/[\s\u3000。．]/g,"").trim();
}
function submit(value,reveal){
 if(answered||!queue[position])return;
 const t=queue[position],correct=!reveal&&normalize(value)===normalize(t.answer);
 const detailed=read(),day=localDay();
 let next;
 try{
  next=core.grade(detailed[t.key],{day,correct:reveal?true:correct,revealed:!!reveal,type:t.kind==="grammar"?"choice":"input"});
  const replacement={...detailed,[t.key]:next};
  localStorage.setItem(KEY,JSON.stringify(replacement));
 }catch(e){announce("無法儲存作答紀錄，已停止計分。請確認瀏覽器儲存設定。");return}
 answered=true;
 if(correct)correctCount++;
 if(!reveal){
  try{
   if(t.kind==="grammar"&&typeof markGrammar==="function")markGrammar(t.source,correct);
   else if(t.kind!=="grammar"&&typeof lexMark==="function")lexMark(t.source,correct);
  }catch(e){console.warn("ENJP V2 legacy score bridge failed",e)}
 }
 node("[data-review-feedback]").textContent=reveal?"答案："+t.answer+"（揭曉不增加熟練度）":(correct?"✅ 正確！":"❌ 正確答案："+t.answer);
 setVisible("[data-review-next]",true);
 node("[data-review-reveal]").disabled=true;
 node("[data-review-check]").disabled=true;
 node("[data-review-answer]").disabled=true;
 node("[data-review-options]").querySelectorAll("button").forEach(b=>b.disabled=true);
 stats();
}
function next(){
 if(!answered)return;
 position++;
 if(position>=queue.length){
  setVisible("[data-review-session]",false);
  announce("本輪完成："+correctCount+" / "+sessionTotal+" 題答對。錯題會保留在待複習清單。");
  stats();return;
 }
 answered=false;displayQuestion(queue[position]);
}
function init(){
 const shelf=document.getElementById("v2ModeShelf");
 if(!shelf||document.getElementById("v2ReviewHub"))return;
 pane=document.createElement("section");pane.id="v2ReviewHub";pane.hidden=true;
 pane.innerHTML=`<div class="v2-review-head"><div><p class="v2-review-kicker">ENJP OCEAN · SMART REVIEW</p><h2>🧠 智慧錯題與批次複習</h2><p>累積數天的到期單字、動詞變化與文法一次整理，不改寫你原本的資料。</p></div><button type="button" data-review-close aria-label="收合複習中心">收合</button></div>
 <div class="v2-review-controls"><label>題目類別<select data-review-kind><option value="all">全部</option><option value="verb">動詞</option><option value="adj">形容詞</option><option value="grammar">文法</option></select></label><label>本輪題數<select data-review-count><option value="10">10 題</option><option value="20">20 題</option><option value="30">30 題</option><option value="100">最多 100 題</option></select></label></div>
 <p data-review-summary class="v2-review-summary"></p>
 <div class="v2-review-buttons"><button type="button" data-review-start>開始到期複習</button><button type="button" data-review-fresh>練習新內容</button></div>
 <p data-review-message role="status" aria-live="polite">選好題目類別就可以開始。</p>
 <div data-review-session hidden><div class="v2-review-meta"><span data-review-kind-tag></span><span data-review-step></span></div><div class="v2-review-question" data-review-prompt></div><p class="v2-review-hint" data-review-hint></p>
 <div data-review-options class="v2-review-options"></div><div data-review-inputbox hidden class="v2-review-input"><input data-review-answer type="text" inputmode="text" lang="ja" autocapitalize="off" autocomplete="off" spellcheck="false" placeholder="在這裡輸入日文答案"><button type="button" data-review-check>檢查答案</button></div>
 <p data-review-feedback class="v2-review-feedback" role="status" aria-live="polite"></p>
 <div class="v2-review-buttons"><button type="button" data-review-audio>🔊 日文單字</button><button type="button" data-review-reveal>看答案</button><button type="button" data-review-next hidden>下一題 →</button></div></div>`;
 shelf.insertAdjacentElement("afterend",pane);
 node("[data-review-kind]").addEventListener("change",stats);
 node("[data-review-count]").addEventListener("change",stats);
 node("[data-review-start]").addEventListener("click",()=>start("due"));
 node("[data-review-fresh]").addEventListener("click",()=>start("fresh"));
 node("[data-review-close]").addEventListener("click",()=>{pane.hidden=true});
 node("[data-review-check]").addEventListener("click",()=>submit(node("[data-review-answer]").value,false));
 node("[data-review-answer]").addEventListener("keydown",e=>{if(e.key==="Enter")submit(e.target.value,false)});
 node("[data-review-reveal]").addEventListener("click",()=>submit("",true));
 node("[data-review-next]").addEventListener("click",next);
 node("[data-review-audio]").addEventListener("click",()=>{const t=queue[position];if(t&&typeof speak==="function")speak(t.id,"ja-JP")});
 stats();
 window.ENJP_V2_REVIEW_HUB={open,summary:()=>batch.items(materials()).due.length};
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

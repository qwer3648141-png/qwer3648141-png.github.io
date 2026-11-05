"use strict";
/* Stable course navigation. Existing ENJP learning history remains owned by the original website. */
(function(){
  const database=window.ENJP_COURSES;
  const Audio=window.ENJP_Audio;
  if(!database||!Audio){document.body.textContent="課程模組載入失敗，請重新整理。";return}
  const $=id=>document.getElementById(id);
  const state={mode:"jp",level:"N5",sectionId:null,filter:""};
  const jpLabels={N5:"N5 基礎",N4:"N4 進階初級",N3:"N3 中級"};
  const modeTitles={jp:"日本語課程",en:"English 英文課程",dual:"EN × JP 雙語課程"};
  const el=(tag,className,text)=>{
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  };
  const append=(parent,...children)=>{parent.append(...children);return parent};
  function listChapters(){return state.mode==="jp"?database.jp[state.level]:database[state.mode]}
  function lookupSection(id){
    for(const chapter of listChapters()){
      const section=chapter.sections.find(s=>s.id===id);
      if(section)return {chapter,section};
    }
    return null;
  }
  function updateModeButtons(){
    document.querySelectorAll("[data-mode]").forEach(button=>{
      const pressed=button.dataset.mode===state.mode;
      button.setAttribute("aria-pressed",String(pressed));
    });
    document.querySelectorAll("[data-level]").forEach(button=>{
      button.setAttribute("aria-selected",String(button.dataset.level===state.level));
    });
    $("levels").hidden=state.mode!=="jp";
    $("rail-heading").textContent=modeTitles[state.mode];
    $("rail-description").textContent=state.mode==="jp"?"依程度選章。章節只會在左側展開，右邊閱讀區不移動。":"自由選擇主題，已整合教材會標註「試學」。";
    $("rail-kicker").textContent=state.mode==="jp"?"JAPANESE PATH":state.mode==="en"?"ENGLISH PATH":"BILINGUAL PATH";
    $("filter").value=state.filter;
  }
  function renderChapters(){
    const list=$("chapters");
    list.replaceChildren();
    const query=state.filter.trim().toLocaleLowerCase();
    let first=true,matched=0;
    listChapters().forEach(chapter=>{
      const showChapter=!query || (chapter.title+" "+chapter.summary).toLocaleLowerCase().includes(query);
      const sections=chapter.sections.filter(s=>showChapter||s.title.toLocaleLowerCase().includes(query));
      if(sections.length===0)return;
      matched++;
      const d=el("details","chapter");
      d.dataset.chapter=chapter.id;
      const hasCurrent=sections.some(s=>s.id===state.sectionId);
      d.open=hasCurrent||first;
      first=false;
      const summary=el("summary");
      append(summary,
        append(el("span"),el("span","chapter-name",chapter.title),el("span","chapter-desc",chapter.summary)),
        el("span","chapter-chevron"));
      d.append(summary);
      const sub=el("div","sections");
      sections.forEach(section=>{
        const available=Boolean(database.lesson[section.id]);
        const b=el("button","section");
        b.type="button";b.dataset.section=section.id;
        b.setAttribute("aria-current",String(state.sectionId===section.id));
        append(b,el("span","section-name",section.title),el("span","section-tag"+(available?" ready":""),available?"試學":"規劃中"));
        b.addEventListener("click",()=>{
          Audio.stop();state.sectionId=section.id;
          document.querySelectorAll(".section").forEach(item=>item.setAttribute("aria-current",String(item===b)));
          renderReader();
          if(window.matchMedia("(max-width:640px)").matches)$("reader").scrollIntoView({behavior:"smooth",block:"start"});
        });
        sub.append(b);
      });
      d.append(sub);
      d.addEventListener("toggle",()=>{
        if(!d.open)return;
        list.querySelectorAll("details.chapter").forEach(other=>{if(other!==d && other.open)other.open=false});
      });
      list.append(d);
    });
    if(!matched)list.append(el("p","rail-caption","找不到相關章節。試試較短的關鍵字。"));
  }
  function renderHeader(title,subtitle,trail){
    const header=el("header","reader-head");
    const path=el("div","path");
    trail.forEach((label,i)=>path.append(el("span",i===trail.length-1?"current":"",label+(i<trail.length-1?" ／":""))));
    header.append(path,el("h2","",title),el("p","",subtitle));
    return header;
  }
  function showWelcome(root){
    const chapters=listChapters(),all=chapters.flatMap(c=>c.sections);
    const ready=all.filter(s=>database.lesson[s.id]).length;
    root.append(renderHeader("從左側挑選章節開始","右邊是固定的教材閱讀區。切換章節或縮放電腦畫面時，不會把教材推到整頁最下方。",[modeTitles[state.mode],"學習總覽"]));
    const stats=el("div","info-grid");
    for(const [value,label] of [[chapters.length,"課程章節"],[all.length,"主題入口"],[ready,"已接入試學教材"]]){
      stats.append(append(el("div","info-box"),el("strong","",String(value)),el("span","",label)));
    }
    root.append(stats);
    const welcome=el("div","welcome-grid");
    for(const [title,desc] of [["01｜選課不鎖定","N5／N4／N3 與所有章節都可以自由打開；不用先取得五顆星。"],["02｜分開顯示教材","有教材的主題標「試學」；尚未整合的部分會明確標示，不假裝已完成。"],["03｜中英日各自朗讀","日文依教材標註讀音發聲，英文不混入日文聲線；下方可選裝置上的語音。"],["04｜舊版完整功能保留","配對競速、智慧挑戰、錯題進度與原始資料仍在舊版網站，這一版不覆寫它們。"]]){
      welcome.append(append(el("div","welcome-card"),el("h3","",title),el("p","",desc)));
    }
    root.append(welcome);
    root.append(makeLegacyLink());
  }
  function makeLegacyLink(){
    const a=el("a","navlink primary","開啟原版全部教材與練習 ↗");
    a.href="/";a.style.marginTop="22px";return a;
  }
  function speakButton(parent,status,label,text,type,alternate){
    const b=el("button","play"+(alternate?" alt":""),"🔊 "+label);
    b.type="button";
    b.addEventListener("click",()=>Audio.play(text,type,b,status));
    parent.append(b);
  }
  function vocabCard(entry,type){
    const card=el("section","lesson-card");
    const word=el("div");
    const headline=el("div","word-main");
    const strong=el("strong");
    if(type==="jp"){
      const show=entry.ruby || (/^[一-龯々]+$/.test(entry.term)?entry.term+"（"+entry.reading+"）":entry.term);
      strong.append(Audio.makeRuby(show));
    }else if(type==="dual"){
      strong.append(document.createTextNode(entry.en+" ／ "));
      const show=entry.ruby || (/^[一-龯々]+$/.test(entry.jp)?entry.jp+"（"+entry.reading+"）":entry.jp);
      strong.append(Audio.makeRuby(show));
    }else strong.textContent=entry.term;
    headline.append(strong);
    word.append(headline);
    if(type==="en" && entry.ipa)word.append(el("span","reading",entry.ipa));
    if(type==="jp")word.append(el("span","reading",entry.reading));
    if(type==="dual")word.append(el("span","reading","JP: "+entry.reading));
    const zh=el("div","word-zh");
    append(zh,el("small","","繁體中文"),document.createTextNode(entry.zh));
    word.append(zh);
    const right=el("div");
    const status=el("div","audio-status","");
    status.setAttribute("role","status");
    if(type==="dual"){
      const en=append(el("div","sentence"),el("span","sentence-label","ENGLISH"),document.createTextNode(entry.enExample));
      const jp=append(el("div","sentence"),el("span","sentence-label","日本語"),Audio.makeRuby(entry.jpExample));
      right.append(en,jp,el("p","translation","中文｜"+entry.translation));
      const row=el("div","audio-row");
      speakButton(row,status,"英文單字",entry.en,"en",true);
      speakButton(row,status,"日文單字",entry.reading,"jp",true);
      speakButton(row,status,"英文例句",entry.enExample,"en",false);
      speakButton(row,status,"日文例句",entry.jpExample,"jp",false);
      right.append(row,status);
    }else{
      const sentence=el("div","sentence");
      sentence.append(el("span","sentence-label",type==="jp"?"日本語":"ENGLISH"));
      if(type==="jp")sentence.append(Audio.makeRuby(entry.example));
      else sentence.append(document.createTextNode(entry.example));
      right.append(sentence,el("p","translation","中文｜"+entry.translation));
      const row=el("div","audio-row");
      speakButton(row,status,"單字",type==="jp"?entry.reading:entry.term,type,true);
      speakButton(row,status,"例句",entry.example,type,false);
      right.append(row,status);
    }
    card.append(word,right);return card;
  }
  function renderReader(){
    const root=$("reader-content");
    root.replaceChildren();
    const found=state.sectionId?lookupSection(state.sectionId):null;
    if(!found){showWelcome(root);return}
    const {chapter,section}=found;
    const lesson=database.lesson[section.id];
    root.append(renderHeader(section.title,chapter.summary,[state.mode==="jp"?jpLabels[state.level]:modeTitles[state.mode],chapter.title,section.title]));
    if(!lesson){
      const note=el("div","placeholder");
      note.append(el("h3","","此主題尚未接入 3.0 教材"),el("p","","這是新的課程規劃入口，不代表整章已完成。原有單字、文法、動詞及練習仍可從舊版網站使用，學習進度不會被重置。"));
      root.append(note,makeLegacyLink());return;
    }
    root.append(el("span","example-count","可試學 · "+lesson.items.length+" 個例子"));
    const list=el("div","lesson-list");
    lesson.items.forEach(entry=>list.append(vocabCard(entry,lesson.type)));
    root.append(list,makeLegacyLink());
  }
  function renderAll(){
    Audio.stop();
    state.sectionId=null;
    updateModeButtons();
    renderChapters();
    renderReader();
  }
  function init(){
    document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>{
      const next=b.dataset.mode;if(next===state.mode)return;
      state.mode=next;state.filter="";renderAll();
    }));
    document.querySelectorAll("[data-level]").forEach(b=>b.addEventListener("click",()=>{
      const next=b.dataset.level;if(next===state.level)return;
      state.level=next;state.filter="";renderAll();
    }));
    $("filter").addEventListener("input",e=>{state.filter=e.target.value;renderChapters()});
    Audio.init();renderAll();
  }
  window.ENJP_3={state,init,renderAll,renderReader,listChapters,lookupSection};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
})();

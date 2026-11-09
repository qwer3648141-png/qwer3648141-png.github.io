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
      d.open=hasCurrent||(!state.sectionId&&first);
      first=false;
      const summary=el("summary");
      append(summary,
        append(el("span"),el("span","chapter-name",chapter.title),el("span","chapter-desc",chapter.summary)),
        el("span","chapter-chevron"));
      d.append(summary);
      const sub=el("div","sections");
      sections.forEach(section=>{
        const imported=window.ENJP_MIGRATED?.sections?.[section.id];
        const specialGiving=section.id.startsWith("jp-n4-giving-")&&Boolean(window.ENJP_GivingReceiving);
        const specialParticle=section.id.startsWith("jp-particle-")&&Boolean(window.ENJP_Particles);
        const special=specialGiving||specialParticle;
        const available=Boolean(database.lesson[section.id]||imported||special);
        const b=el("button","section");
        b.type="button";b.dataset.section=section.id;
        b.setAttribute("aria-current",String(state.sectionId===section.id));
        append(b,el("span","section-name",section.title),el("span","section-tag"+(available?" ready":""),special?"新專題":imported?"教材庫 · "+imported.items.length:available?"試學":"規劃中"));
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
    const ready=all.filter(s=>database.lesson[s.id]||window.ENJP_MIGRATED?.sections?.[s.id]||
      (s.id.startsWith("jp-n4-giving-")&&window.ENJP_GivingReceiving)||
      (s.id.startsWith("jp-particle-")&&window.ENJP_Particles)).length;
    root.append(renderHeader("從左側挑選章節開始","右邊是固定的教材閱讀區。切換章節或縮放電腦畫面時，不會把教材推到整頁最下方。",[modeTitles[state.mode],"學習總覽"]));
    const stats=el("div","info-grid");
    for(const [value,label] of [[chapters.length,"課程章節"],[all.length,"主題入口"],[ready,"已接入教材主題"]]){
      stats.append(append(el("div","info-box"),el("strong","",String(value)),el("span","",label)));
    }
    root.append(stats);
    const migrated=window.ENJP_MIGRATED?.sections||{};
    const allIds=Object.keys(migrated);
    let shortcuts=[];
    if(state.mode==="jp"){
      if(state.level==="N4"){
        if(window.ENJP_Particles)shortcuts.push(["🧩 助詞組合精講","jp-particle-overview","14 組助詞、111 句＋24 題練習"]);
        if(window.ENJP_GivingReceiving)shortcuts.push(["🧭 授受表現","jp-n4-giving-overview","あげる・くれる・もらう"]);
      }
      const verb=allIds.find(id=>id.startsWith("legacy-lex-"+state.level+"-V"));
      const adj=allIds.find(id=>id.startsWith("legacy-lex-"+state.level+"-A"));
      shortcuts.push(
        ["📖 "+state.level+" 文法","legacy-grammar-"+state.level+"-1","句型接續、例句與中文說明"],
        ["⚔️ "+state.level+" 動詞活用",verb,"11 種變化＋輸入挑戰"],
        ["✨ "+state.level+" 形容詞",adj,"い形／な形與變化練習"],
        ["🌊 英日情境單字","legacy-vocab-jp-1","原版 30 章完整英日詞彙"]
      );
    }else{
      shortcuts=[1,10,20,30].map(n=>[
        "🗺️ Chapter "+String(n).padStart(2,"0"),
        "legacy-vocab-"+state.mode+"-"+n,
        "原版雙語單字、例句與中文翻譯"
      ]);
    }
    shortcuts=shortcuts.filter(([_,id])=>id&&(migrated[id]||
      (id.startsWith("jp-n4-giving-")&&window.ENJP_GivingReceiving)||
      (id.startsWith("jp-particle-")&&window.ENJP_Particles)));
    if(shortcuts.length){
      const quick=el("section","course-quick-start");
      quick.append(el("h3","","⚡ 快速進入正式教材"));
      quick.append(el("p","",state.mode==="jp"?"選擇你想練的日語技能，不需要按照章節解鎖。":"直接挑選你感興趣的原版情境章節。"));
      const entries=el("div","course-quick-grid");
      shortcuts.forEach(([label,id,hint])=>{
        const b=el("button","course-quick-item");
        b.type="button";
        b.append(el("strong","",label),el("small","",hint));
        b.addEventListener("click",()=>{
          Audio.stop();state.sectionId=id;
          renderChapters();renderReader();
          if(window.matchMedia("(max-width:640px)").matches)$("reader").scrollIntoView({behavior:"smooth",block:"start"});
        });
        entries.append(b);
      });
      quick.append(entries);root.append(quick);
    }
    const welcome=el("div","welcome-grid");
    for(const [title,desc] of [["01｜選課不鎖定","N5／N4／N3 與所有章節都可以自由打開；不用先取得五顆星。"],["02｜分開顯示教材","原版資料已匯入「教材庫」章節；部分朗讀及標音持續校對，其餘未完成項目會標示。"],["03｜中英日各自朗讀","日文依教材標註讀音發聲，英文不混入日文聲線；下方可選裝置上的語音。"],["04｜保留原版學習紀錄","完整舊版教材已經可從本頁閱讀；原版測驗、複習排程與學習紀錄不會被覆寫。"]]){
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
  /* V2 game-style cards. These flags are separate from the legacy website's learning records. */
  const FLAG_KEY="enjpOceanV3QuestFlagsV1";
  function loadFlags(){
    try{
      const raw=window.localStorage?.getItem(FLAG_KEY);
      const parsed=raw?JSON.parse(raw):{};
      return parsed && typeof parsed==="object" && !Array.isArray(parsed)?parsed:{};
    }catch{return {}}
  }
  const cardFlags=loadFlags();
  function flagFor(sectionId,index){
    const key=sectionId+":"+index,record=cardFlags[key];
    return record && typeof record==="object"?record:{favorite:false,weak:false,known:false};
  }
  function writeFlags(sectionId,index,value){
    cardFlags[sectionId+":"+index]={favorite:Boolean(value.favorite),weak:Boolean(value.weak),known:Boolean(value.known)};
    try{window.localStorage?.setItem(FLAG_KEY,JSON.stringify(cardFlags))}catch{} // private browsing still works in session
  }
  function sectionKnownCount(sectionId,length){
    let known=0;for(let i=0;i<length;i++)if(flagFor(sectionId,i).known)known++;
    return known;
  }
  function sectionProgress(sectionId,length){
    const strip=el("div","quest-progress");
    const top=el("div","quest-progress-top"),title=el("span","","本節技能自評進度"),numbers=el("strong","quest-progress-label");
    top.append(title,numbers);
    const track=el("div","quest-progress-track");track.setAttribute("role","progressbar");track.setAttribute("aria-label","本節已自評會的卡片比例");track.setAttribute("aria-valuemin","0");track.setAttribute("aria-valuemax",String(length));
    const fill=el("span","quest-progress-fill");track.append(fill);
    const note=el("p","quest-progress-note","依此裝置上的「我會了」標記計算；非測驗正確率，不影響原版學習紀錄。");
    strip.append(top,track,note);
    const refresh=()=>{const count=sectionKnownCount(sectionId,length);numbers.textContent=count+" / "+length;fill.style.width=(length?100*count/length:0)+"%";track.setAttribute("aria-valuenow",String(count))};
    refresh();
    return {node:strip,refresh};
  }
  function skillComparison(comparison){
    const wrap=el("section","skill-comparison");
    const head=el("div","compare-head");
    head.append(el("span","quest-overline","SKILL INTEL / 核心對照"),el("h3","",comparison.title),el("p","",comparison.intro));
    wrap.append(head);
    const grid=el("div","compare-grid");
    comparison.parts.forEach((part,i)=>{
      const pane=el("article","compare-item compare-"+i);
      pane.append(el("span","compare-index","TYPE "+(i+1)));
      pane.append(el("strong","",part.name));
      pane.append(el("span","compare-label",part.label));
      pane.append(el("p","",part.detail));
      grid.append(pane);
    });
    wrap.append(grid);return wrap;
  }
  function visualExample(sectionId,index){
    const assets=window.ENJP_IMAGE_EXAMPLES||{};
    const asset=assets[sectionId+":"+index];
    if(!asset)return null;
    const figure=el("figure","quest-visual");
    const frame=el("div","quest-visual-frame");
    const photo=el("img","quest-picture");
    photo.src=asset.src;photo.alt=asset.alt;
    photo.loading="lazy";photo.decoding="async";
    photo.setAttribute("width","330");photo.setAttribute("height","220");
    const chip=el("span","quest-visual-chip","◈ VISUAL MEMORY");
    frame.append(photo,chip);
    const caption=el("figcaption","quest-photo-credit");
    const source=el("a","",asset.credit+" · "+asset.license);
    source.href=asset.source;source.target="_blank";source.rel="noopener noreferrer";
    caption.append(source);
    photo.addEventListener("error",()=>{
      photo.hidden=true;
      frame.classList.add("visual-unavailable");
      chip.textContent="圖片暫時無法載入";
    });
    figure.append(frame,caption);
    return figure;
  }
  function vocabCard(entry,type,sectionId,index,level,refreshProgress){
    const card=el("section","quest-card");
    const flags=flagFor(sectionId,index);
    const top=el("div","quest-topline");
    const code=el("span","quest-overline","QUEST CARD / "+String(index+1).padStart(2,"0"));
    const tags=el("div","quest-tags");
    const classification=type==="jp"?(level+" · "+(entry.usage?"GRAMMAR":"JAPANESE")):type==="en"?"ENGLISH · VOCAB":"DUAL · PAIR";
    tags.append(el("span","quest-tier",classification));
    const statusTag=el("span","quest-state","未標記");
    tags.append(statusTag);top.append(code,tags);
    const core=el("div","quest-core"),left=el("div","quest-identity"),right=el("div","quest-mission");
    left.append(el("span","quest-subhead","CORE SKILL / 核心資料"));
    const headline=el("div","word-main"),strong=el("strong");
    if(type==="jp"){
      const show=entry.ruby||(/^[一-龯々]+$/.test(entry.term)?entry.term+"（"+entry.reading+"）":entry.term);
      strong.append(Audio.makeRuby(show));
    }else if(type==="dual"){
      strong.append(document.createTextNode(entry.en+" ／ "));
      const show=entry.ruby||(/^[一-龯々]+$/.test(entry.jp)?entry.jp+"（"+entry.reading+"）":entry.jp);
      strong.append(Audio.makeRuby(show));
    }else{strong.textContent=entry.term}
    headline.append(strong);left.append(headline);
    if(type==="en"&&entry.ipa)left.append(el("div","quest-reading",entry.ipa));
    if(type==="jp")left.append(el("div","quest-reading","読み｜"+entry.reading));
    if(type==="dual")left.append(el("div","quest-reading","日本語｜"+entry.reading));
    left.append(el("p","quest-meaning",entry.zh));
    const visual=visualExample(sectionId,index);
    if(visual)left.append(visual);
    if(entry.usage){
      const usage=el("div","quest-use");
      usage.append(el("span","quest-subhead","GRAMMAR FORM / 接續形式"),el("strong","",entry.usage));
      left.append(usage);
    }
    if(entry.tip)left.append(el("p","quest-tip","✦ "+entry.tip));
    const status=el("div","audio-status","");status.setAttribute("role","status");
    right.append(el("span","quest-subhead","MISSION EXAMPLE / 情境例句"));
    if(type==="dual"){
      const en=el("div","quest-sentence");en.append(el("span","sentence-label","ENGLISH"),document.createTextNode(entry.enExample));
      const jp=el("div","quest-sentence");jp.append(el("span","sentence-label","日本語"),Audio.makeRuby(entry.jpExample));
      right.append(en,jp);
    }else{
      const sentence=el("div","quest-sentence");
      sentence.append(el("span","sentence-label",type==="jp"?"日本語":"ENGLISH"));
      sentence.append(type==="jp"?Audio.makeRuby(entry.example):document.createTextNode(entry.example));
      right.append(sentence);
    }
    right.append(el("div","quest-translation","中文翻譯｜"+entry.translation));
    if(entry.breakdown?.length){
      const details=el("details","quest-breakdown");
      details.append(el("summary","","▸ 句型拆解 · 查看各部分意思"));
      const steps=el("div","quest-breakdown-grid");
      entry.breakdown.forEach(([part,translation])=>{
        const step=el("div","quest-step");
        step.append(Audio.makeRuby(part),el("small","",translation));steps.append(step);
      });
      details.append(steps);right.append(details);
    }
    core.append(left,right);
    const foot=el("div","quest-footer");
    const actions=el("div","quest-actions");
    const audioActions=el("div","audio-row");
    if(type==="dual"){
      speakButton(audioActions,status,"EN 單字",entry.en,"en",true);
      speakButton(audioActions,status,"JP 單字",entry.reading,"jp",true);
      speakButton(audioActions,status,"EN 例句",entry.enExample,"en",false);
      speakButton(audioActions,status,"JP 例句",entry.jpExample,"jp",false);
    }else{
      speakButton(audioActions,status,"單字",type==="jp"?entry.reading:entry.term,type,true);
      speakButton(audioActions,status,"例句",entry.example,type,false);
    }
    actions.append(audioActions);
    const markActions=el("div","quest-mark-actions");
    function marker(label,prop,handler){
      const button=el("button","quest-mark",label);button.type="button";
      button.addEventListener("click",()=>{handler();update();refreshProgress()});
      markActions.append(button);
      return {button,prop};
    }
    const fav=marker("☆ 收藏","favorite",()=>{flags.favorite=!flags.favorite;writeFlags(sectionId,index,flags)});
    const weak=marker("◇ 待複習","weak",()=>{flags.weak=!flags.weak;if(flags.weak)flags.known=false;writeFlags(sectionId,index,flags)});
    const known=marker("✓ 我會了","known",()=>{flags.known=!flags.known;if(flags.known)flags.weak=false;writeFlags(sectionId,index,flags)});
    const stateLine=el("div","quest-feedback");
    const update=()=>{
      const current=flagFor(sectionId,index);
      let label="未標記",status="neutral";
      if(current.weak){label="待複習";status="weak"}
      else if(current.known){label="自評已會";status="known"}
      else if(current.favorite){label="已收藏";status="fav"}
      statusTag.textContent=label;statusTag.dataset.state=status;
      for(const mark of [fav,weak,known]){
        mark.button.setAttribute("aria-pressed",String(Boolean(current[mark.prop])));
        mark.button.classList.toggle("active",Boolean(current[mark.prop]));
      }
      fav.button.textContent=current.favorite?"★ 已收藏":"☆ 收藏";
      weak.button.textContent=current.weak?"◆ 待複習":"◇ 待複習";
      known.button.textContent=current.known?"✓ 已標記會了":"✓ 我會了";
      stateLine.textContent="學習標記｜"+label+" · 此裝置保存（獨立於原版進度）";
    };
    update();
    actions.append(markActions);
    foot.append(actions,status,stateLine);
    card.append(top,core,foot);
    return card;
  }
  function renderReader(){
    const root=$("reader-content");
    root.replaceChildren();
    const found=state.sectionId?lookupSection(state.sectionId):null;
    if(!found){showWelcome(root);return}
    const {chapter,section}=found;
    const lesson=database.lesson[section.id];
    const imported=window.ENJP_MIGRATED?.sections?.[section.id];
    root.append(renderHeader(section.title,chapter.summary,[state.mode==="jp"?jpLabels[state.level]:modeTitles[state.mode],chapter.title,section.title]));
    if(window.ENJP_GivingReceiving?.render(root,section.id))return;
    if(window.ENJP_Particles?.render(root,section.id))return;
    if(imported){
      root.append(el("span","example-count","已匯入原版完整教材 · "+imported.items.length+" 筆"));
      if(!window.ENJP_LegacyReader?.render(root,section.id,state.mode)){
        root.append(el("p","legacy-note","教材載入異常。可先使用原版課程。"));
      }
      return;
    }
    if(!lesson){
      const note=el("div","placeholder");
      note.append(el("h3","","此主題尚未接入 3.0 教材"),el("p","","這是新的課程規劃入口，不代表整章已完成。原有單字、文法、動詞及練習仍可從舊版網站使用，學習進度不會被重置。"));
      root.append(note,makeLegacyLink());return;
    }
    root.append(el("span","example-count","可試學 · "+lesson.items.length+" 張技能卡"));
    if(lesson.comparison)root.append(skillComparison(lesson.comparison));
    const progress=sectionProgress(section.id,lesson.items.length);
    root.append(progress.node);
    const list=el("div","lesson-list game-lessons");
    lesson.items.forEach((entry,index)=>list.append(vocabCard(entry,lesson.type,section.id,index,state.level,progress.refresh)));
    root.append(list,makeLegacyLink());
  }
  function goToSection(id){
    if(!lookupSection(id))return false;
    Audio.stop();
    state.sectionId=id;
    renderChapters();
    renderReader();
    if(window.matchMedia("(max-width:640px)").matches)$("reader").scrollIntoView({behavior:"smooth",block:"start"});
    return true;
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
    // Allow a safe direct link to the new N4 giving/receiving lesson.
    try{
      const lessonId=decodeURIComponent(window.location?.hash?.slice(1)||"");
      const giving=lessonId.startsWith("jp-n4-giving-")&&window.ENJP_GivingReceiving;
      const particle=lessonId.startsWith("jp-particle-")&&window.ENJP_Particles;
      if(giving||particle){
        state.mode="jp";state.level="N4";updateModeButtons();goToSection(lessonId);
      }
    }catch{}
  }
  window.ENJP_3={state,init,renderAll,renderReader,goToSection,listChapters,lookupSection};
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
  else init();
})();

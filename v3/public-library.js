"use strict";
/* ENJP Ocean · Public library. Open book-style navigation over existing course IDs.
 * No personal tracking: this module neither reads nor writes localStorage.
 * All course data, exercises, audio and old URLs remain owned by existing modules.
 */
(function(){
 const C=window.ENJP_COURSES,V=window.ENJP_CuratedVocab,
   M=window.ENJP_MIGRATED?.sections||{},Core=window.ENJP_3;
 if(!C||!Core||!V)return;
 const parts={
   jp:[
     {id:"intro",title:"第一篇｜日語基礎入門",subtitle:"發音・基礎句型・文字結構",chapters:[
       ["01","日文字母與發音","平假名、片假名與正確發音"],
       ["02","基礎句型與時態","です・ます、疑問、肯定與否定"],
       ["03","詞性與句子結構","名詞、基本表達與入門教材"]]},
     {id:"grammar",title:"第二篇｜日語文法研究室",subtitle:"動詞・形容詞・助詞・比較",chapters:[
       ["04","動詞分類與活用","三類動詞、可能、受身、使役、使役受身"],
       ["05","形容詞、副詞與變化","い・な形容詞、に／く、なる／する"],
       ["06","助詞與複合助詞","は・が・を・に・で、には・では"],
       ["07","授受、借貸與請求","あげる・くれる・もらう・貸す・借りる"],
       ["08","條件、原因、目的與結果","たら・ば・ために・ように"],
       ["09","推測、傳聞、比較與程度","そうだ・らしい・みたい・どれくらい"],
       ["10","敬語與 N5～N3 文法全集","尊敬・謙讓、原版完整文法資料庫"]]},
     {id:"words",title:"第三篇｜日語主題詞彙百科",subtitle:"生活・人物・自然・工作",chapters:[
       ["11","日常生活、飲食與購物","生活、旅遊、購物與餐廳"],
       ["12","人物、身材、性格與情緒","人物外觀圖鑑、性格與感受"],
       ["13","自然、天氣、季節與環境","天氣圖鑑、雨勢、颱風與防災"],
       ["14","職場、工程與社會","公司、工作、品質與商務"],
       ["15","進階詞彙與總索引","N3～N1、擬態語、慣用表現"]]},
     {id:"application",title:"第四篇｜日語實戰應用",subtitle:"會話・聽力・閱讀",chapters:[
       ["16","生活與職場情境對話","旅行、問路、餐飲、職場"],
       ["17","聽力理解","情境聽力與逐句朗讀"],
       ["18","閱讀與文章理解","短文、閱讀與實際資訊"]]},
     {id:"practice",title:"第五篇｜測驗與自由練習",subtitle:"公開練習，不顯示個人進度",chapters:[
       ["19","基本句型與綜合測驗","N5～N3 練習與句型複習"],
       ["20","情境挑戰與比較練習","易混淆表達、情境應用"],
       ["21","補充教材與查詢工具","原有教材與其他自由練習"]]}
   ],
   en:[
     {id:"en-base",title:"第一篇｜英文基礎",subtitle:"發音・字彙・基礎表達",chapters:[["E1","英文發音與核心詞彙","基本發音、日常高頻單字"]]},
     {id:"en-grammar",title:"第二篇｜英文文法",subtitle:"文法與句型",chapters:[["E2","基本句型、時態與問句","英文句型與文法"]]},
     {id:"en-vocab",title:"第三篇｜英文主題詞彙",subtitle:"原版 30 章完整情境",chapters:[["E3","生活、旅行與商務詞彙","原版 Chapter 01–30"]]},
     {id:"en-apply",title:"第四篇｜英文實戰應用",subtitle:"對話・閱讀・聽力",chapters:[["E4","生活、職場與英文聽讀","情境對話與閱讀"]]},
     {id:"en-practice",title:"第五篇｜英文練習",subtitle:"自由閱讀及作答",chapters:[["E5","英文句型與綜合練習","所有章節開放"]]}
   ],
   dual:[
     {id:"dual-intro",title:"第一篇｜英日對照基礎",subtitle:"概念配對",chapters:[["D1","基本字彙與動詞對照","英日高頻概念"]]},
     {id:"dual-sentence",title:"第二篇｜雙語句型比較",subtitle:"語序與表達",chapters:[["D2","英日例句與常用片語","雙語句子練習"]]},
     {id:"dual-vocab",title:"第三篇｜雙語主題詞彙",subtitle:"原版 30 章情境",chapters:[["D3","生活與商務雙語詞彙","原版 Chapter 01–30"]]},
     {id:"dual-apply",title:"第四篇｜雙語情境應用",subtitle:"翻譯與聽力",chapters:[["D4","雙語會話與聽力","實際情境練習"]]},
     {id:"dual-practice",title:"第五篇｜雙語挑戰",subtitle:"配對競速・綜合挑戰",chapters:[["D5","雙語配對與挑戰","自由測驗不鎖關"]]}
   ]
 };
 const byMode={jp:[],en:[],dual:[]},byKey=new Map();
 const has=id=>Boolean(C.lesson?.[id]||M[id]||V.sections?.[id]||
   (id.startsWith("jp-n4-giving-")&&window.ENJP_GivingReceiving)||
   (id.startsWith("jp-particle-")&&window.ENJP_Particles)||
   (id.startsWith("jp-contrast-")&&window.ENJP_ContrastGrammar)||
   window.ENJP_N4N3_Complete?.has?.(id)||window.ENJP_Foundation?.has?.(id)||
   window.ENJP_ConnectionLesson?.has?.(id)||window.ENJP_VerbAtlas?.has?.(id)||
   window.ENJP_LexicalAtlas?.has?.(id)||window.ENJP_AdvancedAtlas?.has?.(id)||
   window.ENJP_WeatherAtlas?.has?.(id)||window.ENJP_AppearanceAtlas?.has?.(id)||
   window.ENJP_VoiceGrammar?.has?.(id));
 function add(mode,chapters,settings){
   for(const chapter of chapters||[])for(const section of chapter.sections||[]){
     if(!has(section.id))continue;
     const k=mode+":"+section.id;
     if(byKey.has(k))continue;
     const item={id:section.id,title:section.title||M[section.id]?.title||section.id,
       origin:chapter.title,mode,level:settings.level||null,
       vocabLang:settings.vocabLang||null,vocabLevel:settings.vocabLevel||null,
       number:settings.number||null,chapter:null,part:null};
     byKey.set(k,item);byMode[mode].push(item);
   }
 }
 for(const level of ["N5","N4","N3"])add("jp",C.jp[level],{level});
 for(const level of ["N5","N4","N3"])add("jp",V.chapters[level],{vocabLang:"jlpt",vocabLevel:level});
 add("jp",C.vocab?.jp,{vocabLang:"jp"});
 add("en",C.en,{});
 add("en",C.vocab?.en,{vocabLang:"en"});
 add("dual",C.dual,{});
 add("dual",C.vocab?.dual,{vocabLang:"dual"});
 const socialLegacy=new Set([1,2,3,4,5,7,8,9,11,12,13,15,16,17,19,20,21,22,23,24,26,27]);
 const dailyLegacy=new Set([6,10,14,18,25,28,30]);
 const p=(a,regex)=>regex.test(a.id+" "+a.title+" "+a.origin);
 function chapterOf(item){
   const id=item.id,t=item.title,origin=item.origin;
   if(item.mode!=="jp"){
     if(id.startsWith("legacy-vocab-"))return item.mode==="en"?"E3":"D3";
     if(item.mode==="en"){
       if(/en-(sounds|phonics|life|work|phrases)/.test(id))return "E1";
       if(/en-(basic|tense|questions|grammar)/.test(id))return "E2";
       if(/en-(listen|conversations|reading|sentences|restaurant|trip|office)/.test(id))return "E4";
       return "E5";
     }
     if(/dual-(daily|verbs|words)/.test(id))return "D1";
     if(/dual-(phrases|simple|office|sentence)/.test(id))return "D2";
     if(/dual-(listen|recap)/.test(id))return "D4";
     return "D5";
   }
   if(id.startsWith("legacy-vocab-jp-")){
     const n=Number(id.slice("legacy-vocab-jp-".length));
     if(n===29)return "13";
     if(dailyLegacy.has(n))return "11";
     if(socialLegacy.has(n))return "14";
     return "15";
   }
   if(id.startsWith("jp-weather-"))return "13";
   if(id.startsWith("jp-appearance-"))return "12";
   if(id==="jp-advanced-vocab-overview"||id==="jp-vocabulary-overview")return "15";
   if(id.startsWith("curated-vocab-")){
     if(/天氣|自然|季節|環境|健康|氣象|防災|weather|nature|health/.test(t+" "+origin))return "13";
     if(/人物|身體|情緒|感情|外貌|性格|person|body/.test(t+" "+origin))return "12";
     if(/職場|工作|商業|會議|社會|品質|工程|決策|溝通|office|work|problem|business|discussion/.test(t+" "+origin))return "14";
     return "11";
   }
   if(id==="jp-hira"||id==="jp-kata"||id==="jp-sound")return "01";
   if(id==="jp-basic"||id==="jp-question")return "02";
   if(id==="jp-numbers"||id==="jp-shopping"||id==="jp-meals")return "11";
   if(id.startsWith("legacy-grammar-")||id==="jp-n3-honorific")return "10";
   if(id==="jp-verb-overview"||id.startsWith("jp-voice-")||id==="jp-n3-passive"||
      /^jp-(ver[b]|masu|te|n4-(nai|ta|potential|volition))/.test(id)||
      /^legacy-lex-N[543]-V/.test(id))return "04";
   if(id==="jp-adjective-overview"||/^jp-adj/.test(id)||/^legacy-lex-N[543]-A/.test(id)||
      /^jp-link-.*(adj|adverb|easy-hard|adjective-change)/.test(id))return "05";
   if(id==="jp-particles"||id.startsWith("jp-particle-"))return "06";
   if(id.startsWith("jp-n4-giving-")||id==="jp-n3-give"||
      /jp-n4-(request|permission|duty)/.test(id)||id==="jp-contrast-requests"||
      /jp-contrast-(loan|give|borrow|receive)/.test(id))return "07";
   if(/jp-n4-(if|reason|while|plan|experience)|jp-n3-(purpose|cause|result)|jp-link-n3-/.test(id))return "08";
   if(id.startsWith("jp-contrast-")||/jp-n3-(seems|hearsay|uncertain|compare|contrast|although)|jp-n4-compare/.test(id))return "09";
   if(/jp-(n5|n4|n3)-(listen|listening)/.test(id)||/listen/i.test(t))return "17";
   if(/jp-(n5|n4|n3)-(read|reading)/.test(id)||/閱讀|短文/.test(t))return "18";
   if(/jp-n4-(travel|work)/.test(id)||/会話|會話|對話|情境/.test(t))return "16";
   if(/練習|複習|測驗|試験|挑戰/.test(t))return "19";
   if(/參考|索引|總覽|資料庫/.test(t))return "21";
   if(id.startsWith("jp-n5-"))return "03";
   return "21";
 }
 const unitById=new Map();
 for(const [mode,pp]of Object.entries(parts)){
   for(const part of pp)for(const [number,title,description]of part.chapters){
     unitById.set(mode+":"+number,{number,title,description,part:part.id,items:[]});
   }
   for(const item of byMode[mode]){
     item.chapter=chapterOf(item);
     const unit=unitById.get(mode+":"+item.chapter);
     if(!unit)throw Error("Missing chapter for "+item.id+" in "+mode);
     unit.items.push(item);item.part=unit.part;
   }
 }
 const nameOf={jp:"日本語",en:"English",dual:"EN × JP"};
 let mode="jp",view="home",activePart=null,activeChapter=null,activeItem=null,searchTerm="",lastSearch="",runtime=null;
 const el=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=String(value);return x};
 const btn=(label,cls="pl-button")=>{const x=el("button",cls,label);x.type="button";return x};
 function scrollTop(){const p=document.getElementById("public-library");if(p&&typeof p.scrollIntoView==="function")p.scrollIntoView({behavior:"smooth",block:"start"})}
 const currentParts=()=>parts[mode];
 function setView(next,{scroll=true}={}){
   view=next;
   document.body.classList.toggle("pl-reading",next==="lesson");
   if(runtime?.panel)render();
   if(scroll)scrollTop();
 }
 function route(item,{hash=true,scroll=true}={}){
   if(!item)return false;
   mode=item.mode;
   activePart=item.part;activeChapter=item.chapter;activeItem=item;
   const state=Core.state;
   state.mode=item.vocabLang?"vocab":mode;
   if(item.vocabLang){state.vocabLang=item.vocabLang;if(item.vocabLevel)state.vocabLevel=item.vocabLevel}
   else if(item.level)state.level=item.level;
   state.filter="";
   Core.renderAll();
   const ok=originalGo(item.id);
   if(!ok)return false;
   setView("lesson",{scroll:false});
   if(hash&&window.history?.pushState)window.history.pushState({pl:item.id},"","#"+encodeURIComponent(item.id));
   if(scroll){
     const reader=document.getElementById("reader");
     if(reader&&typeof reader.scrollIntoView==="function")reader.scrollIntoView({behavior:"smooth",block:"start"});
   }
   return true;
 }
 const originalGo=Core.goToSection.bind(Core);
 const byId=id=>{
   const entries=[...byMode.jp,...byMode.en,...byMode.dual].filter(x=>x.id===id);
   if(!entries.length)return null;
   return entries.find(x=>x.mode===mode)||entries.find(x=>x.vocabLang==="jlpt")||entries[0];
 };
 function header(host){
   const top=el("div","pl-top");
   const brand=el("div","pl-brand");brand.append(el("span","pl-eyebrow","PUBLIC LANGUAGE LIBRARY"),el("h1","pl-heading","🌊 ENJP Ocean"),el("p","pl-subheading","公開互動教科書｜自由閱讀、無進度限制"));
   const old=el("a","pl-old","↗ 原版網站");old.href="/";
   top.append(brand,old);host.append(top);
   const modes=el("div","pl-languages");modes.setAttribute("role","group");modes.setAttribute("aria-label","選擇學習語言");
   for(const [key,title]of [["jp","日本語"],["en","English"],["dual","EN × JP"]]){
     const x=btn(title,"pl-lang");x.setAttribute("aria-pressed",String(mode===key));
     x.addEventListener("click",()=>{mode=key;activePart=null;activeChapter=null;setView("home")});modes.append(x);
   }
   host.append(modes);
 }
 function searchBox(host){
   const form=el("form","pl-search"),label=el("label","pl-search-label","🔎 尋找文法、單字、教材");
   const input=el("input","pl-search-input");input.type="search";input.placeholder="例如：使役受身、どれくらい、スリム、酷暑日";input.value=searchTerm;input.autocomplete="off";
   input.setAttribute("aria-label","搜尋全站日英語教材和單字");
   const submit=btn("搜尋","pl-search-button");submit.type="submit";
   label.append(input);form.append(label,submit);
   form.addEventListener("submit",e=>{e.preventDefault();searchTerm=input.value.trim();lastSearch=searchTerm;setView("search")});
   host.append(form);
 }
 function breadcrumbs(host,text){
   const bar=el("div","pl-breadcrumbs"),home=btn("首頁","pl-text-button");
   home.addEventListener("click",()=>{activePart=null;activeChapter=null;setView("home")});
   bar.append(home,el("span","", "／ "+nameOf[mode]+(text?" ／ "+text:"")));
   host.append(bar);
 }
 function partCards(host){
   const grid=el("div","pl-part-grid");
   for(const [i,part]of currentParts().entries()){
     const n=part.chapters.reduce((sum,[num])=>sum+(unitById.get(mode+":"+num)?.items.length||0),0);
     const b=btn("","pl-part");
     b.append(el("span","pl-part-index",String(i+1).padStart(2,"0")),
       el("strong","",part.title),el("small","",part.subtitle),
       el("span","pl-part-count",n+" 組已收錄教材"));
     b.addEventListener("click",()=>{activePart=part.id;setView("part")});grid.append(b);
   }
   host.append(grid);
 }
 function home(host){
   host.append(el("h2","pl-view-heading","五大篇章｜選擇想學的內容"),
     el("p","pl-explain","採用『篇 → 章 → 節』分類；所有現有課程都可以自由進入。沒有個人完成度、排名與解鎖要求。"));
   partCards(host);
 }
 function partView(host){
   const part=currentParts().find(x=>x.id===activePart);
   if(!part){home(host);return}
   breadcrumbs(host,part.title);
   host.append(el("h2","pl-view-heading",part.title),el("p","pl-explain",part.subtitle));
   const list=el("div","pl-chapter-grid");
   for(const [num,title,summary]of part.chapters){
     const unit=unitById.get(mode+":"+num),b=btn("","pl-chapter");
     b.append(el("span","pl-chapter-number","第 "+num+" 章"),
       el("strong","",title),el("small","",summary),
       el("span","pl-chapter-count",unit.items.length+" 組已收錄教材"));
     b.addEventListener("click",()=>{activeChapter=num;setView("chapter")});list.append(b);
   }
   host.append(list);
 }
 function chapterView(host){
   const unit=unitById.get(mode+":"+activeChapter);
   if(!unit){setView("home");return}
   const part=currentParts().find(x=>x.id===unit.part);
   breadcrumbs(host,part?.title);
   const back=btn("← 返回本篇目錄","pl-text-button");back.addEventListener("click",()=>setView("part"));
   host.append(back,el("span","pl-eyebrow","第 "+unit.number+" 章"),
     el("h2","pl-view-heading",unit.title),el("p","pl-explain",unit.description));
   if(!unit.items.length){host.append(el("p","pl-empty","這章目前還沒有獨立教材。其他章節全部開放，也可以使用上方搜尋。"));return}
   const options=el("div","pl-filter");
   const level=el("select");level.setAttribute("aria-label","選擇教材難度");
   for(const v of ["全部難度","N5","N4","N3"]){
     const opt=el("option","",v);opt.value=v;level.append(opt);
   }
   level.value="全部難度";
   options.append(el("label","", "篩選程度"),level);host.append(options);
   const list=el("div","pl-lesson-list"),count=el("p","pl-count");
   const draw=()=>{
     list.replaceChildren();
     const entries=unit.items.filter(x=>level.value==="全部難度"||!x.level||x.level===level.value||x.vocabLevel===level.value);
     count.textContent="已收錄 "+entries.length+" 組教材（所有章節自由開放）";
     for(const [index,item]of entries.entries()){
       const b=btn("","pl-lesson");
       b.append(el("span","pl-lesson-index",unit.number+"."+(index+1)),
         el("span","pl-lesson-name",item.title),
         el("span","pl-lesson-level",item.level||item.vocabLevel||"情境"));
       b.addEventListener("click",()=>route(item));list.append(b);
     }
   };
   level.addEventListener("change",draw);draw();host.append(count,list);
 }
 function lessonBar(host){
   if(!activeItem)return;
   const unit=unitById.get(mode+":"+activeChapter);
   const crumb=el("div","pl-lesson-breadcrumb"),
     prev=btn("← 返回章節目錄","pl-text-button");
   prev.addEventListener("click",()=>setView("chapter"));
   crumb.append(prev,el("span","",unit?.number+"｜"+unit?.title));
   const controls=el("div","pl-lesson-toolbar"),items=unit?.items||[],idx=items.findIndex(x=>x.id===activeItem.id);
   const old=btn("上一節","pl-button pl-subtle"),next=btn("下一節","pl-button pl-subtle");
   old.disabled=idx<=0;next.disabled=idx<0||idx>=items.length-1;
   old.addEventListener("click",()=>route(items[idx-1]));
   next.addEventListener("click",()=>route(items[idx+1]));
   controls.append(old,next);
   const row=el("div","pl-lesson-context");row.append(crumb,controls);host.append(row);
 }
 function searchView(host){
   breadcrumbs(host,"全站搜尋");
   host.append(el("h2","pl-view-heading","搜尋文法與單字"));
   if(!lastSearch){host.append(el("p","pl-explain","可以搜尋日文漢字、假名、中文、英文，或教材名稱。"));return}
   const q=lastSearch.toLocaleLowerCase();
   const sections=[...byMode.jp,...byMode.en,...byMode.dual].filter(x=>
     [x.title,x.origin,x.id].some(s=>String(s||"").toLocaleLowerCase().includes(q))).slice(0,48);
   const lex=window.ENJP_GlobalSearch?.search?.(lastSearch)?.slice(0,25)||[];
   host.append(el("p","pl-count","「"+lastSearch+"」找到 "+sections.length+" 個教材入口，以及 "+lex.length+" 個詞彙結果（每類最多顯示指定筆數）。"));
   if(sections.length){
     host.append(el("h3","pl-section-heading","📚 教材章節"));
     const list=el("div","pl-lesson-list");
     for(const item of sections){
       const b=btn("","pl-lesson");
       b.append(el("span","pl-lesson-index",item.chapter),
         el("span","pl-lesson-name",item.title),
         el("span","pl-lesson-level",nameOf[item.mode]));
       b.addEventListener("click",()=>route(item));list.append(b);
     }
     host.append(list);
   }
   if(lex.length){
     host.append(el("h3","pl-section-heading","🔍 單字總索引"));
     const list=el("div","pl-search-words");
     for(const item of lex){
       const b=btn("","pl-search-word");
       b.append(el("strong","",item.word),el("small","",item.meaning||""),el("small","",item.sourceLabel||""));
       b.addEventListener("click",()=>{
         const target=document.getElementById("reader-content"),reader=document.getElementById("reader");
         if(!target)return;target.replaceChildren();
         window.ENJP_GlobalSearch.renderDetail(target,item);
         activeItem=null;setView("lesson",{scroll:false});
         if(reader?.scrollIntoView)reader.scrollIntoView({behavior:"smooth",block:"start"});
       });list.append(b);
     }
     host.append(list);
   }
   if(!sections.length&&!lex.length)host.append(el("p","pl-empty","沒有找到符合的結果，可以試試單字原形、較短的詞或其他中文關鍵字。"));
 }
 function practiceView(host){
   breadcrumbs(host,"自由練習");
   host.append(el("h2","pl-view-heading","📖 開放式練習教室"),
     el("p","pl-explain","不用登入、不鎖章節。測驗可立即顯示答題正確與解釋；此公共目錄不建立個人分數。"));
   const regex=/練習|測驗|抽考|競速|挑戰|講解|研究所|精講|語態|文法/;
   const entries=byMode[mode].filter(x=>regex.test(x.title)||regex.test(x.origin)).slice(0,30);
   const list=el("div","pl-lesson-list");
   for(const item of entries){
     const b=btn("","pl-lesson");b.append(el("span","pl-lesson-index",item.chapter),
       el("span","pl-lesson-name",item.title),el("span","pl-lesson-level",item.level||"自由"));
     b.addEventListener("click",()=>route(item));list.append(b);
   }
   if(!entries.length)list.append(el("p","pl-empty","請從各個章節選擇練習，或使用搜尋查找教材。"));
   host.append(list);
 }
 function footer(host){
   const nav=el("nav","pl-bottom");nav.setAttribute("aria-label","學習快速導覽");
   for(const [name,label]of [["home","首頁"],["part","目錄"],["search","搜尋"],["practice","練習"]]){
     const b=btn(label,"pl-bottom-button"),active=name==="part"?(view==="part"||view==="chapter"):view===name;
     b.setAttribute("aria-current",String(active));
     b.addEventListener("click",()=>{
       if(name==="part"){if(!activePart)activePart=currentParts()[0].id;setView("part")}
       else setView(name);
     });nav.append(b);
   }
   host.append(nav);
 }
 function render(){
   if(!runtime)return;
   const {panel}=runtime;panel.replaceChildren();
   header(panel);
   searchBox(panel);
   const main=el("div","pl-main");
   if(view==="home")home(main);
   else if(view==="part")partView(main);
   else if(view==="chapter")chapterView(main);
   else if(view==="search")searchView(main);
   else if(view==="practice")practiceView(main);
   else lessonBar(main);
   panel.append(main);
   footer(panel);
 }
 function init(){
   if(runtime)return true;
   const panel=document.getElementById("public-library");
   if(!panel||!document.getElementById("reader"))return false;
   runtime={panel};
   document.body.classList.add("pl-active");
   Core.goToSection=id=>{
     const item=byId(id);return item?route(item):originalGo(id);
   };
   const hash=decodeURIComponent(window.location?.hash?.slice(1)||"");
   const item=byId(hash||Core.state.sectionId||"");
   if(item){route(item,{hash:false,scroll:false});}
   else{view="home";render();}
   window.addEventListener("popstate",()=>{
     const next=decodeURIComponent(window.location?.hash?.slice(1)||"");
     const target=byId(next);
     if(target)route(target,{hash:false,scroll:false});
     else{activeItem=null;setView("home",{scroll:false})}
   });
   return true;
 }
 window.ENJP_PublicLibrary={parts,byMode,unitById,locate:byId,chapterOf,init,getView:()=>view,route,
   stats:()=>({jp:byMode.jp.length,en:byMode.en.length,dual:byMode.dual.length,chapters:21})};
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
 else init();
})();

"use strict";
/* ENJP Ocean 4.5 — Adjective & Vocabulary atlases.
 * Compact responsive search, categories and per-entry dialogs.
 * Legacy data is read-only; JLPT grade is never invented for the original 920
 * English/Japanese paired entries. No localStorage writes or changes to progress.
 */
(function(){
 const C=window.ENJP_COURSES,L=window.ENJP_LEGACY,V=window.ENJP_CuratedVocab;
 const advancedThemes=window.ENJP_ADVANCED_THEMES||[];
 const advancedWords=advancedThemes.flatMap(t=>t.items.map(x=>({...x,themeId:t.id,themeName:t.title})));
 const Forms=window.ENJP_Inflections,Audio=window.ENJP_Audio;
 if(!C?.jp?.N5||!L?.lexical||!L?.vocab||!V?.words||!Forms||!Audio)return;
 const IDS={adjective:"jp-adjective-overview",vocabulary:"jp-vocabulary-overview"};
 const GRADES=["all","N5","N4","N3","ungraded"];
 const TYPES={i:"い形容詞",na:"な形容詞"};
 const categoryNames={
  daily:"生活・人際",food:"餐飲・購物",travel:"旅行・交通・住宅",
  work:"工作・學習",technology:"工程・品質",business:"商業・財務",
  society:"社會・文化・制度",health:"健康・環境"
 };
 const oldTopicNames=Object.fromEntries(L.topics.filter(row=>row[1]==="adj").map(row=>[row[0],row[2]]));
 const kanaGroups=[["all","全部"],["あ","あ行"],["か","か行"],["さ","さ行"],["た","た行"],
                   ["な","な行"],["は","は行"],["ま","ま行"],["や","や行"],["ら","ら行"],["わ","わ行"]];
 const normalize=s=>String(s||"").normalize("NFKC").toLocaleLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
 const rubyText=raw=>String(raw||"").replace(/<ruby>([^<>]*)<rt>([^<>]*)<\/rt><\/ruby>/g,"$1（$2）")
  .replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&");
 const rubyReading=raw=>String(raw||"").replace(/<ruby>([^<>]*)<rt>([^<>]*)<\/rt><\/ruby>/g,"$2")
  .replace(/<[^>]*>/g,"").replace(/&nbsp;/g," ").replace(/&amp;/g,"&");
 const annotated=(word,reading)=>Forms.annotation(word,reading);
 const kanaGroup=reading=>{
   const first=normalize(reading).charAt(0);
   if("あいうえお".includes(first))return "あ";
   if("かきくけこがぎぐげご".includes(first))return "か";
   if("さしすせそざじずぜぞ".includes(first))return "さ";
   if("たちつてとだぢづでど".includes(first))return "た";
   if("なにぬねの".includes(first))return "な";
   if("はひふへほばびぶべぼぱぴぷぺぽ".includes(first))return "は";
   if("まみむめも".includes(first))return "ま";
   if("やゆよ".includes(first))return "や";
   if("らりるれろ".includes(first))return "ら";
   return "わ";
 };
 const groupForTopic=topic=>{
   const t=String(topic||"");
   if(/people|home|verbs-everyday|adjectives-everyday|school|verbs-social|adjectives-social/.test(t))return "daily";
   if(/food/.test(t))return "food";
   if(/time-travel|travel|town-services/.test(t))return "travel";
   if(/study-work|discussion|adjectives-abstract/.test(t))return "work";
   if(/problems|quality-data|verbs-reasoning/.test(t))return "technology";
   if(/health-feelings/.test(t))return "health";
   return "society";
 };
 const groupForChapter=n=>{
   n=Number(n);
   if([1,3,4,5,11,12,21,22,23,24].includes(n))return "work";
   if([10,13,18].includes(n))return "food";
   if([14,25,28].includes(n))return "travel";
   if([2,15].includes(n))return "society";
   if([29,30].includes(n))return "health";
   if([6].includes(n))return "daily";
   return "business";
 };
 const compare=(a,b)=>normalize(a.reading).localeCompare(normalize(b.reading),"ja")||
   a.word.localeCompare(b.word,"ja");
 const advancedGroup={personality:"daily",relationships:"daily",emotions:"health",thinking:"society",workstyle:"work",socialnuance:"society","emotion-verbs":"health","relationship-verbs":"daily","work-verbs":"technology","growth-verbs":"work","nuanced-feelings":"daily","quality-analysis":"technology","nuanced-adverbs":"society","reasoning-nouns":"work","emotion-precision":"health","conversation-nuance":"daily","engineering-judgment":"technology","planning-and-decisions":"work","speech-adverbs":"society","expressive-descriptions":"daily"};
 const adjectiveRows=[];
 for(const src of L.lexical.filter(x=>x.kind==="adj")){
   const word=src.type==="na"?src.word.replace(/な$/,""):src.word;
   const reading=src.type==="na"?src.reading.replace(/な$/,""):src.reading;
   adjectiveRows.push({id:"adj-legacy-"+src.topic+"-"+src.word,word,reading,level:src.level,
     type:src.type,meaning:src.meaning,topicId:src.topic,topicLabel:oldTopicNames[src.topic]||"原版形容詞",
     source:"legacy",collocations:src.collocations||[],collocationCn:src.collocationCn||[],
     original:src});
 }
 for(const src of V.words.filter(x=>x.kind==="adj")){
   const theme=V.sections[src.topicId];
   adjectiveRows.push({id:src.id,word:src.term,reading:src.reading,level:src.level,
     type:src.formType,meaning:src.zh,topicId:src.topicId,
     topicLabel:theme?.title||"新版形容詞",source:"curated",
     example:src.example,translation:src.translation});
 }
 for(const w of advancedWords.filter(x=>x.kind==="i"||x.kind==="na"))
   adjectiveRows.push({id:w.id,word:w.word,reading:w.reading,level:w.level,
     type:w.kind,meaning:w.zh,topicId:"advanced-"+w.themeId,
     topicLabel:"🌙 "+w.themeName,source:"advanced",examples:w.examples});
 const adjProblems=[],adjId=new Set(),adjTerm=new Set();
 for(const x of adjectiveRows){
   const key=x.word+"|"+x.reading;
   if(adjId.has(x.id)||adjTerm.has(key)||!TYPES[x.type]||!Forms.adjectiveForms(x.original||{word:x.word,reading:x.reading,type:x.type}))
      adjProblems.push("形容詞資料需確認："+x.word);
   adjId.add(x.id);adjTerm.add(key);
 }
 adjectiveRows.sort(compare);
 const vocabularyMap=new Map(),wordProblems=[];
 function pushVocab(row){
   const key=normalize(row.word)+"|"+normalize(row.reading);
   let cur=vocabularyMap.get(key);
   if(!cur){
     cur={key,word:row.word,reading:row.reading,level:"ungraded",
       meaning:row.meaning,sourceKinds:new Set(),records:[],category:row.category,topicLabel:row.topicLabel,
       kind:"",example:null};
     vocabularyMap.set(key,cur);
   }
   cur.records.push(row);
   cur.sourceKinds.add(row.source);
   if(row.source==="curated"||row.source==="advanced"){
     // Curated cards carry an explicitly reviewed learning grade.
     cur.level=row.level;cur.category=row.category;cur.topicLabel=row.topicLabel;
     cur.meaning=row.meaning;cur.kind=row.kind;
     if(row.source==="curated")cur.example={ja:row.example,zh:row.translation,source:"curated",isFull:true};
     cur.reading=row.reading;cur.word=row.word;
   }
 }
 for(const w of V.words){
   const theme=V.sections[w.topicId];
   pushVocab({source:"curated",id:w.id,word:w.term,reading:w.reading,level:w.level,
     meaning:w.zh,kind:w.kind,topicLabel:theme?.title||"新版主題",
     category:groupForTopic(theme?.slug),example:w.example,translation:w.translation});
 }
 for(const w of advancedWords)
   pushVocab({source:"advanced",id:w.id,word:w.word,reading:w.reading,level:w.level,
     meaning:w.zh,kind:w.kind,topicLabel:"🌙 "+w.themeName,
     category:advancedGroup[w.themeId]||"society",examples:w.examples,
     nuance:w.nuance,tone:w.tone,pattern:w.pattern});
 let originalEntries=0;
 for(const [chapter,rows]of Object.entries(L.vocab)){
   for(const [i,w]of rows.entries()){
     originalEntries++;
     if(!w.jp||!w.jp_ruby)wordProblems.push("原版缺少日文："+chapter+":"+i);
     pushVocab({source:"legacy",id:"legacy-"+chapter+"-"+i,
       word:w.jp,wordRuby:rubyText(w.jp_ruby),reading:rubyReading(w.jp_ruby),meaning:w.cn,
       level:"ungraded",topicLabel:"Chapter "+String(chapter).padStart(2,"0")+"｜"+(w.topic||"原版教材"),
       category:groupForChapter(chapter),english:w.en,kk:w.kk,
       chapter:Number(chapter),example: w.ex_jp,exampleRuby:w.ex_jp_ruby,translation:w.ex_cn});
   }
 }
 const vocabularyRows=[...vocabularyMap.values()].sort(compare);
 const levelCounts=items=>Object.fromEntries(["N5","N4","N3","N2","N1"].map(l=>[l,items.filter(w=>w.level===l).length]));
 for(const level of ["N5","N4","N3"]){
   C.jp[level].unshift({
     id:"adjective-atlas-"+level.toLowerCase(),
     title:"✨ 形容詞一覽｜N5～N3 全部分級",
     summary:"い／な形、程度、主題與五十音篩選，點擊才看變化與用法",
     sections:[{id:IDS.adjective,title:"✨ 全形容詞快速總表（"+adjectiveRows.length+"）"}]
   });
   V.chapters[level].unshift({
     id:"vocabulary-atlas-"+level.toLowerCase(),
     title:"📚 單字一覽｜新版＋原版完整詞庫",
     summary:"跨級日文搜尋、生活主題、原版30章；不替原版詞猜測 JLPT 等級",
     sections:[{id:IDS.vocabulary,title:"📚 日文單字總目錄（"+vocabularyRows.length+" 個詞條）"}]
   });
 }
 const make=(tag,cls,text)=>{
   const e=document.createElement(tag);
   if(cls)e.className=cls;
   if(text!==undefined)e.textContent=String(text);
   return e;
 };
 const add=(parent,...children)=>{parent.append(...children);return parent};
 const button=(label,cls="la-button")=>{const b=make("button",cls,label);b.type="button";return b};
 const jp=(parent,source,cls="la-ja")=>{
   const el=make("p",cls);
   el.append(Audio.makeRuby(source));parent.append(el);return el;
 };
 const say=(parent,source,label="🔊 朗讀")=>{
   const wrap=make("div","la-speech"),
     b=button(label,"la-speak"),status=make("span","la-speak-status","");
   status.setAttribute("role","status");
   if(!Audio.spokenJapanese(source)){b.disabled=true;b.title="本詞的假名讀音尚未完整校對";}
   else b.addEventListener("click",()=>Audio.play(source,"jp",b,status));
   wrap.append(b,status);parent.append(wrap);
 };
 const badge=(parent,label)=>parent.append(make("span","la-badge",label));
 function adjExamples(x){
   if(x.source==="curated")return[{ja:x.example,zh:x.translation,full:true}];
   if(x.source==="advanced")return x.examples.map(e=>({...e,full:true}));
   // Original material provides phrases, not necessarily full sentences.
   return x.collocations.map((ja,i)=>({ja,zh:x.collocationCn[i]||"",full:false}));
 }
 function legacyEntryMatch(rec){
   if(rec.source!=="legacy")return false;
   const parts=rec.word.split(/[・／/、，,]/).map(s=>s.trim()).filter(s=>s.length>1);
   return parts.some(s=>rec.example&&rec.example.includes(s));
 }
 function vocabExamples(x){
   const res=[];
   for(const rec of x.records.filter(r=>r.source==="advanced")){
     for(const ex of rec.examples||[])if(!res.some(item=>item.ja===ex.ja))
       res.push({ja:ex.ja,zh:ex.zh,source:"advanced",isFull:true});
   }
   if(x.example)res.push(x.example);
   // Only show original examples actually containing a headword or one of its
   // explicit Japanese alternatives; avoid unrelated English→Japanese glosses.
   for(const rec of x.records){
     if(rec.source!=="legacy"||!rec.example)continue;
     if(!legacyEntryMatch(rec))continue;
     if(res.some(other=>other.ja===rubyText(rec.exampleRuby)))continue;
     res.push({ja:rubyText(rec.exampleRuby||rec.example),zh:rec.translation,
       source:"legacy",isFull:true,chapter:rec.chapter});
   }
   return res;
 }
 function adjectiveDetail(root,x){
   root.append(make("span","la-kicker",x.level+" · "+TYPES[x.type]));
   jp(root,annotated(x.word,x.reading),"la-detail-term");
   root.append(make("p","la-reading",x.reading),make("p","la-meaning",x.meaning));
   say(root,x.reading,"🔊 形容詞讀音");
   root.append(make("h3","la-subheading","本詞的實際用法"));
   for(const ex of adjExamples(x)){
     const card=make("div","la-example");
     jp(card,ex.full?ex.ja:ex.ja,"la-example-ja");
     card.append(make("p","la-translation",ex.zh));
     if(ex.full)say(card,ex.ja,"🔊 例句");
     else card.append(make("small","la-note","原版搭配片語，不是完整句子；未校對全文讀音時不強制朗讀。"));
     root.append(card);
   }
   const forms=Forms.adjectiveForms(x.original||{word:x.word,reading:x.reading,type:x.type});
   const section=make("section","la-detail-section");
   section.append(make("h3","la-subheading","形容詞變化（"+forms.length+" 種）"));
   const grid=make("div","la-forms");
   for(const form of forms){
     const card=make("div","la-form");
     card.append(make("span","la-form-name",form.key));
     jp(card,annotated(form.word,form.reading),"la-form-ja");
     card.append(make("small","la-form-hint",form.hint));
     say(card,form.reading,"🔊");
     grid.append(card);
   }
   section.append(grid);root.append(section);
   const explain=x.type==="i"?"い形容詞：去掉最後的「い」接「くて」；特殊的「いい」接「よくて」。":
     "な形容詞：詞幹＋「で」連接描述；名詞前使用「な」，例如静かな部屋。";
   root.append(make("p","la-note",explain));
 }
 function vocabDetail(root,x){
   root.append(make("span","la-kicker",x.level==="ungraded"?"原版來源 · 尚未標記 JLPT 等級":x.level+" · 建議程度"));
   jp(root,x.records.some(r=>r.source==="curated"||r.source==="advanced")?annotated(x.word,x.reading):
      (x.records.find(r=>r.source==="legacy")?.wordRuby||x.word),"la-detail-term");
   root.append(make("p","la-reading",x.reading||"讀音待校"),
     make("p","la-meaning",x.meaning));
   const primary=x.records.find(r=>r.source==="legacy");
   const sound=x.records.some(r=>r.source==="curated"||r.source==="advanced")?annotated(x.word,x.reading):
     (primary?.wordRuby||x.word);
   say(root,sound,"🔊 日文單字");
   const sources=[...x.sourceKinds].map(s=>s==="curated"?"新版分級詞庫":s==="advanced"?"進階日語圖鑑":"原版30章").join("＋");
   root.append(make("p","la-note","來源："+sources+"。原版的英文字性不等於日文詞性，未校對前不強行分類。進階詞的 JLPT 程度屬教學建議。"));
   const advanced=x.records.find(r=>r.source==="advanced"&&r.nuance);
   if(advanced){
     root.append(make("h3","la-subheading","💬 進階語感與使用提醒"));
     root.append(make("p","la-note",advanced.nuance));
     if(advanced.pattern)root.append(make("p","la-note","常見搭配："+advanced.pattern));
   }
   const legacy=x.records.filter(r=>r.source==="legacy");
   if(legacy.length){
     const english=make("section","la-english");
     english.append(make("h3","la-subheading","原版英日對照"));
     for(const rec of legacy.slice(0,5)){
       const line=make("div","la-english-item");
       line.append(make("strong","",rec.english||"—"),make("span","",rec.meaning),
         make("small","","Chapter "+String(rec.chapter).padStart(2,"0")+" · "+rec.topicLabel));
       english.append(line);
     }
     if(legacy.length>5)english.append(make("p","la-note","還有 "+(legacy.length-5)+" 個原版章節出處。"));
     root.append(english);
   }
   root.append(make("h3","la-subheading","本詞專屬例句"));
   const examples=vocabExamples(x);
   if(!examples.length)root.append(make("p","la-note","此詞原版示例與日文詞頭的對應尚待校對，先不顯示可能錯置的例句。"));
   for(const ex of examples.slice(0,6)){
     const card=make("div","la-example");
     card.append(make("span","la-example-kicker",ex.source==="curated"?"新版原創例句":ex.source==="advanced"?"進階原創例句":"原版 Chapter "+String(ex.chapter).padStart(2,"0")));
     jp(card,ex.ja,"la-example-ja");
     card.append(make("p","la-translation",ex.zh));
     say(card,ex.ja,"🔊 朗讀");
     root.append(card);
   }
 }
 const sourceLabel=item=>item.sourceKinds?.has("advanced")?"🌙 進階詞彙":item.sourceKinds?.has("curated")?(item.sourceKinds.size>1?"新版＋原版":"新版分級"):"原版未分級";
 function render(host,id){
   const mode=id===IDS.adjective?"adj":id===IDS.vocabulary?"vocab":null;
   if(!mode)return false;
   const items=mode==="adj"?adjectiveRows:vocabularyRows;
   const root=make("section","la-atlas");
   root.append(make("span","la-kicker",mode==="adj"?"ADJECTIVE ATLAS · N5–N3":"VOCABULARY ATLAS · ALL SOURCES"),
     make("h2","la-title",mode==="adj"?"✨ 形容詞一覽":"📚 單字總目錄"),
     make("p","la-intro",mode==="adj"?
       "N5～N1 的い形容詞、な形容詞集中查找。按程度、類別、主題和五十音過濾，點選才看專屬用法與變化。":
       "整合新版 288 筆、進階 "+advancedWords.length+" 筆與原版 920 筆英日資料，重複詞條合併；未經判定的原版詞條仍標示未分級。"));
   const stats=make("div","la-stats");
   const statRows=mode==="adj"?
     [["全部形容詞",items.length],...["N5","N4","N3"].map(l=>[l,items.filter(x=>x.level===l).length])]:
     [["去重詞條",items.length],["新版分級",V.words.length],["原版來源",originalEntries],["進階詞彙",advancedWords.length]];
   for(const [name,n]of statRows)stats.append(add(make("div","la-stat"),make("strong","",n),make("span","",name)));
   root.append(stats);
   const selection={query:"",level:"all",type:"all",source:"all",category:"all",topic:"all",kana:"all"};
   const controls=make("div","la-controls"),
     searchField=make("label","la-field la-search-field"),
     search=make("input");
   search.type="search";search.autocomplete="off";
   search.placeholder=mode==="vocab"?"搜尋全部：汚、汚れて、よごれる…":"搜尋日文、假名或中文…";search.setAttribute("aria-label","搜尋日文、讀音或中文");
   searchField.append(make("span","",mode==="vocab"?"搜尋全站（原版、動詞及活用形）":"搜尋漢字／平假名／中文"),search);
   controls.append(searchField);
   function selectControl(title,choices,name){
     const field=make("label","la-field"),s=make("select");
     field.append(make("span","",title));
     for(const [id,text]of choices){const option=make("option","",text);option.value=id;s.append(option)}
     s.setAttribute("aria-label",title);field.append(s);controls.append(field);
     s.addEventListener("change",()=>{selection[name]=s.value;page=0;draw()});
     return s;
   }
   selectControl("學習程度",
     [["all","全部等級"],["N5","N5"],["N4","N4"],["N3","N3"],["N2","N2"],["N1","N1"],...(mode==="vocab"?[["ungraded","原版未分級"]]:[])],"level");
   if(mode==="adj")selectControl("形容詞類別",[["all","い＋な 全部"],["i","い形容詞"],["na","な形容詞"]],"type");
   else selectControl("來源",[["all","全部來源"],["curated","新版分級"],["advanced","🌙 進階詞彙"],["legacy","原版30章"]],"source");
   const categories=mode==="adj"?
     [...new Map(items.map(x=>[x.topicId,x.topicLabel])).entries()].map(([k,label])=>[k,label]):
     Object.entries(categoryNames).map(([k,v])=>[k,v]);
   selectControl("主題分類",[["all","全部主題"],...categories],"category");
   const kana=make("div","la-kana"),filterBtns=[];
   for(const [key,label]of kanaGroups){
     const btn=button(label,"la-kana-button");
     btn.setAttribute("aria-pressed",String(key==="all"));
     btn.addEventListener("click",()=>{selection.kana=key;page=0;draw()});
     filterBtns.push([key,btn]);kana.append(btn);
   }
   root.append(controls,kana);
   const counter=make("p","la-counter");
   counter.setAttribute("role","status");
   const grid=make("div","la-grid"),pager=make("div","la-pager");
   const dialog=make("dialog","la-dialog"),body=make("div","la-dialog-body");
   const close=button("✕ 關閉","la-close");
   close.setAttribute("aria-label","關閉詞彙詳情");
   function closeDialog(){
     Audio.stop();
     if(typeof dialog.close==="function"&&dialog.open)dialog.close();
     else dialog.removeAttribute("open");
   }
   close.addEventListener("click",closeDialog);
   dialog.addEventListener("click",evt=>{if(evt.target===dialog)closeDialog()});
   dialog.addEventListener("close",()=>Audio.stop());
   dialog.append(add(make("div","la-dialog-top"),close),body);
   root.append(counter,pager,grid,make("p","la-note","新分類只整理顯示方式，原本的教材、複習進度與語音設定都不會被修改。"),dialog);
   const pageSize=()=>window.matchMedia?.("(max-width:700px)")?.matches?16:36;
   let page=0;
   function filtered(){
     if(mode==="vocab"&&selection.query.trim()&&window.ENJP_GlobalSearch)return window.ENJP_GlobalSearch.search(selection.query);
     const q=normalize(selection.query.trim());
     return items.filter(x=>{
       if(selection.level!=="all"&&x.level!==selection.level)return false;
       if(mode==="adj"){
         if(selection.type!=="all"&&x.type!==selection.type)return false;
         if(selection.category!=="all"&&x.topicId!==selection.category)return false;
       }else{
         if(selection.source!=="all"&&!x.sourceKinds.has(selection.source))return false;
         if(selection.category!=="all"&&x.category!==selection.category)return false;
       }
       if(selection.kana!=="all"&&kanaGroup(x.reading)!==selection.kana)return false;
       if(q){
         const terms=[x.word,x.reading,x.meaning,x.topicLabel,
            ...(mode==="adj"?adjExamples(x).map(v=>v.zh):
               x.records.map(v=>[v.meaning,v.english||"",v.topicLabel]).flat())];
         if(!terms.some(s=>normalize(s).includes(q)))return false;
       }
       return true;
     });
   }
   function draw(){
     const rows=filtered(),size=pageSize(),pages=Math.max(1,Math.ceil(rows.length/size));
     if(page>=pages)page=pages-1;
     counter.textContent=(mode==="vocab"&&selection.query.trim()?"全站搜尋找到 ":"找到 ")+rows.length+" 個詞條 · 第 "+(page+1)+"／"+pages+" 頁（"+(window.matchMedia?.("(max-width:700px)")?.matches?"手機":"電腦")+"每頁最多 "+size+" 個）";
     grid.replaceChildren();pager.replaceChildren();
     for(const item of rows.slice(page*size,(page+1)*size)){
       const tile=button("","la-tile");
       tile.setAttribute("aria-label","查看 "+item.word+" 詳情");
       jp(tile,mode==="adj"||item.data?annotated(item.word,item.reading):
         (item.records.some(r=>r.source==="curated"||r.source==="advanced")?annotated(item.word,item.reading):
           rubyText(item.records.find(r=>r.source==="legacy")?.wordRuby||"")||item.word),"la-tile-ja");
       tile.append(make("span","la-tile-zh",item.meaning),
         make("small","la-tile-meta",mode==="adj"?
           item.level+" · "+TYPES[item.type]:(item.data?item.sourceLabel:sourceLabel(item))+(item.level==="ungraded"?" · 未分級":" · "+item.level)));
       tile.addEventListener("click",()=>{
         body.replaceChildren();
         if(mode==="adj")adjectiveDetail(body,item);
          else if(item.data)window.ENJP_GlobalSearch.renderDetail(body,item);
          else vocabDetail(body,item);
         if(typeof dialog.showModal==="function"){
           if(dialog.open)dialog.close();
           dialog.showModal();
         }else dialog.setAttribute("open","");
       });
       grid.append(tile);
     }
     if(!rows.length)grid.append(make("p","la-empty","找不到相符的詞條，試試其他讀音或取消篩選。"));
     const prev=button("← 上一頁","la-page"),next=button("下一頁 →","la-page");
     prev.disabled=page===0;next.disabled=page>=pages-1;
     prev.addEventListener("click",()=>{if(page>0){page--;draw()}});
     next.addEventListener("click",()=>{if(page<pages-1){page++;draw()}});
     pager.append(prev,make("span","la-page-count",(page+1)+" / "+pages),next);
     for(const [key,btn]of filterBtns)btn.setAttribute("aria-pressed",String(selection.kana===key));
   }
   search.addEventListener("input",()=>{selection.query=search.value;page=0;draw()});
   draw();host.append(root);return true;
 }
 window.ENJP_LexicalAtlas={
   IDS,has:id=>id===IDS.adjective||id===IDS.vocabulary,render,
   adjectiveRows,vocabularyRows,levelCounts,adjExamples,vocabExamples,
   kanaGroup,adjProblems,wordProblems,counts:{
     legacyAdjectives:L.lexical.filter(x=>x.kind==="adj").length,
     curatedAdjectives:V.words.filter(x=>x.kind==="adj").length,
     curatedVocabulary:V.words.length,
     legacyVocabulary:originalEntries,
     advancedVocabulary:advancedWords.length,
     uniqueVocabulary:vocabularyRows.length
   }
 };
})();

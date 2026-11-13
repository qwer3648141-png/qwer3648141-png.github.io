"use strict";
/* ENJP Ocean 4.4 · fast verb index.
 * The legacy 240 headwords are read-only; the 36 curated verbs have their own
 * original example. Shared generic form examples NEVER attach to a headword.
 * No localStorage is read or written by this directory.
 */
(function(){
 const C=window.ENJP_COURSES,L=window.ENJP_LEGACY,V=window.ENJP_CuratedVocab;
 const advanced=(window.ENJP_ADVANCED_THEMES||[]).flatMap(t=>t.items).filter(x=>x.kind?.startsWith("verb:"));
 const Inf=window.ENJP_Inflections,Audio=window.ENJP_Audio;
 if(!C?.jp||!Array.isArray(L?.lexical)||!Inf||!Audio)return;
 const ID="jp-verb-overview",levels=["all","N5","N4","N3","N2","N1"];
 const typeName={godan:"第一類動詞",ichidan:"第二類動詞",suru:"第三類動詞",kuru:"第三類動詞"};
 const kanaGroups=[
  ["all","全部"],["あ","あ行"],["か","か行"],["さ","さ行"],["た","た行"],
  ["な","な行"],["は","は行"],["ま","ま行"],["や","や行"],["ら","ら行"],["わ","わ行"]
 ];
 const normalize=s=>String(s||"").normalize("NFKC").toLocaleLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
 const headword=(word,reading)=>Inf.annotation(word,reading);
 const ownExamples=verb=>{
   if(verb.source==="curated")return [{ja:verb.example,zh:verb.translation,full:true}];
   if(verb.source==="advanced")return (verb.examples||[]).map(e=>({ja:e.ja,zh:e.zh,full:true}));
   return (verb.collocations||[]).map((ja,i)=>({ja,zh:verb.collocationCn?.[i]||"",full:false}))
     .filter(x=>x.ja.includes(verb.word)); // never show a phrase about another headword
 };
 const list=[],seen=new Set(),problems=[];
 function collect(entry){
   if(seen.has(entry.word)){problems.push("重複動詞："+entry.word);return}
   if(!levels.includes(entry.level)||!typeName[entry.type]||!Inf.verbForms(entry)){problems.push("不可用的詞形："+entry.word);return}
   if(entry.source==="legacy"&&ownExamples(entry).length!==(entry.collocations||[]).length){
     problems.push("舊版搭配詞未包含目前動詞："+entry.word);
   }
   seen.add(entry.word);list.push(entry);
 }
 for(const v of L.lexical.filter(x=>x.kind==="verb"))collect({
   word:v.word,reading:v.reading,level:v.level,type:v.type,meaning:v.meaning,
   collocations:v.collocations,collocationCn:v.collocationCn,source:"legacy"
 });
 for(const w of (V?.words||[]).filter(x=>x.kind==="verb"))collect({
   word:w.term,reading:w.reading,level:w.level,type:w.formType,meaning:w.zh,
   example:w.example,translation:w.translation,source:"curated"
 });
 for(const w of advanced)collect({
   word:w.word,reading:w.reading,level:w.level,type:w.kind.slice(5),meaning:w.zh,
   examples:w.examples,nuance:w.nuance,transitivity:w.transitivity,pattern:w.pattern,related:w.related,
   source:"advanced"
 });
 list.sort((a,b)=>a.reading.localeCompare(b.reading,"ja")||a.word.localeCompare(b.word,"ja"));
 for(const level of ["N5","N4","N3"])C.jp[level].unshift({
   id:"verb-atlas-"+level.toLowerCase(),title:"📖 動詞一覽｜N5～N1 全部動詞",
   summary:"全部動詞直接搜尋、N5～N1 與三類活用篩選，手機每頁 16 字",
   sections:[{id:ID,title:"⚡ 動詞總目錄（"+list.length+" 字）"}]
 });
 const element=(tag,cls,text)=>{
   const e=document.createElement(tag);
   if(cls)e.className=cls;
   if(text!==undefined)e.textContent=String(text);
   return e;
 };
 const add=(target,...nodes)=>{target.append(...nodes);return target};
 const button=(text,cls)=>{const x=element("button",cls||"va-button",text);x.type="button";return x};
 const japanese=(box,ja,cls="va-jp")=>{
   const p=element("p",cls);p.append(Audio.makeRuby(ja));box.append(p);return p;
 };
 const play=(box,reading,label="🔊")=>{
   const row=element("div","va-voice-row"),
     b=button(label,"va-audio"),status=element("span","va-voice-status","");
   status.setAttribute("role","status");
   if(!Audio.spokenJapanese(reading)){b.disabled=true;b.title="假名讀音尚未通過檢查"}
   else b.addEventListener("click",()=>Audio.play(reading,"jp",b,status));
   row.append(b,status);box.append(row);return b;
 };
 const kanaGroup=reading=>{
   const s=normalize(reading).charAt(0);
   if("あいうえお".includes(s))return "あ";
   if("かきくけこがぎぐげご".includes(s))return "か";
   if("さしすせそざじずぜぞ".includes(s))return "さ";
   if("たちつてとだぢづでど".includes(s))return "た";
   if("なにぬねの".includes(s))return "な";
   if("はひふへほばびぶべぼぱぴぷぺぽ".includes(s))return "は";
   if("まみむめも".includes(s))return "ま";
   if("やゆよ".includes(s))return "や";
   if("らりるれろ".includes(s))return "ら";
   return "わ";
 };
 function filterRows({level="all",type="all",kana="all",query=""}={}){
   const q=normalize(query.trim());
   return list.filter(x=>(level==="all"||x.level===level)&&
     (type==="all"||x.type===type||(type==="third"&&["suru","kuru"].includes(x.type)))&&
     (kana==="all"||kanaGroup(x.reading)===kana)&&
     (!q||[x.word,x.reading,x.meaning,x.level,...ownExamples(x).map(y=>y.zh)]
       .some(s=>normalize(s).includes(q))));
 }
 function detail(root,verb){
   root.replaceChildren();
   const title=element("div","va-detail-header");
   const left=element("div");
   left.append(element("span","va-kicker",verb.level+"｜"+typeName[verb.type]));
   japanese(left,headword(verb.word,verb.reading),"va-detail-word");
   left.append(element("p","va-reading",verb.reading));
   const close=button("✕ 關閉","va-close");
   close.setAttribute("aria-label","關閉動詞詳情");
   title.append(left,close);root.append(title);
   root.append(element("p","va-meaning",verb.meaning));
   play(root,verb.reading,"🔊 朗讀單字");
   if(verb.source==="advanced"){
     const note=element("section","va-section va-usage");
     note.append(element("h3","","💡 常見助詞、用法與語感"),
       element("p","va-note","自／他動詞："+verb.transitivity),
       element("p","va-note","常見搭配："+verb.pattern),
       element("p","va-note",verb.nuance));
     if(verb.related?.length)note.append(element("p","va-note","相似詞："+verb.related.join("、")));
     root.append(note);
   }
   const examples=ownExamples(verb);
   const section=element("section","va-section");
   section.append(element("h3","","📚 只顯示「"+verb.word+"」本身的"+(verb.source==="legacy"?"搭配用法":"完整例句")));
   section.append(element("p","va-note",verb.source==="legacy"?
     "原版提供兩組搭配片語（非完整句子）；不會借用其他動詞的通用示範。":
     "以下是這個動詞專屬的完整例句與繁體中文翻譯。"));
   for(const ex of examples){
     const item=element("div","va-example");
     japanese(item,ex.ja);
     item.append(element("p","va-translation",ex.zh));
     if(ex.full)play(item,ex.ja,"🔊 朗讀本句");
     section.append(item);
   }
   if(!examples.length)section.append(element("p","va-note","目前沒有經過確認的專屬例句，為避免誤導先不顯示其他動詞的例句。"));
   root.append(section);
   const forms=Inf.verbForms(verb),panel=element("section","va-section");
   panel.append(element("h3","","⚔️ "+verb.word+" 的 11 種動詞活用"),
     element("p","va-note","下列每一個變化都由「"+verb.word+"」計算，沒有套用別的動詞例句。"));
   const grid=element("div","va-forms");
   for(const form of forms){
     const cell=element("div","va-form");
     cell.append(element("span","va-form-name",form.key));
     japanese(cell,headword(form.word,form.reading),"va-form-word");
     cell.append(element("small","va-form-hint",form.hint));
     play(cell,form.reading,"🔊");
     grid.append(cell);
   }
   panel.append(grid);root.append(panel);
   close.addEventListener("click",()=>{Audio.stop();const dialog=root.parentNode;
     if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open");
   });
 }
 function render(host,id){
   if(id!==ID)return false;
   const shell=element("section","va-atlas");
   shell.append(element("div","va-kicker","N5～N1 · READ-ONLY VERB INDEX"),
     element("h2","va-title","📖 動詞一覽｜快速查字"),
     element("p","va-intro","整合原版 240 個動詞、新版 36 個與進階 "+advanced.length+" 個動詞，共 "+list.length+" 個不重複詞頭。可搜尋與篩選 N5～N1、第一／二／三類、五十音；手機每頁 16 字、電腦每頁 32 字，點擊再看 11 種活用與本詞專屬例句。"));
   const stats=element("div","va-stats");
   for(const [name,number]of [["全部動詞",list.length],...["N5","N4","N3","N2","N1"].map(l=>[l,list.filter(x=>x.level===l).length])]){
     stats.append(add(element("div","va-stat"),element("strong","",number),element("span","",name)));
   }
   shell.append(stats);
   const controls=element("div","va-controls");
   const levelLabel=element("label","va-field"),typeLabel=element("label","va-field"),searchLabel=element("label","va-field");
   levelLabel.append(element("span","","程度"),element("select"));
   typeLabel.append(element("span","","動詞類別"),element("select"));
   searchLabel.append(element("span","","輸入漢字、假名或中文"),element("input"));
   const level=levelLabel.children[1],type=typeLabel.children[1],search=searchLabel.children[1];
   for(const [val,name]of [["all","全部 N5～N1"],["N5","N5"],["N4","N4"],["N3","N3"],["N2","N2"],["N1","N1"]]){
     const opt=element("option","",name);opt.value=val;level.append(opt);
   }
   for(const [val,name]of [["all","全部類別"],["godan","第一類・五段"],["ichidan","第二類・一段"],["third","第三類・不規則"]]){
     const opt=element("option","",name);opt.value=val;type.append(opt);
   }
   search.type="search";search.placeholder="例：読む、よむ、閱讀";search.autocomplete="off";
   search.setAttribute("aria-label","動詞漢字、讀音或中文搜尋");
   controls.append(searchLabel,levelLabel,typeLabel);
   shell.append(controls);
   const kana=element("div","va-kana");
   kana.setAttribute("role","group");kana.setAttribute("aria-label","五十音首字快速篩選");
   const filterButtons=[];
   const selection={level:"all",type:"all",query:"",kana:"all"};
   const grid=element("div","va-grid"),status=element("p","va-result-status");
   status.setAttribute("role","status");
   const pages=element("div","va-pagination"),guide=element("p","va-hint",
     "點擊動詞查看本字的活用與專屬搭配；清單不顯示其他動詞的通用例句。");
   const dialog=element("dialog","va-dialog"),detailHost=element("div","va-detail");
   dialog.append(detailHost);
   dialog.addEventListener("click",evt=>{
     if(evt.target===dialog){Audio.stop();if(typeof dialog.close==="function")dialog.close();}
   });
   dialog.addEventListener("close",()=>Audio.stop());
   let page=0;
   function redraw(){
     const filtered=filterRows(selection),size=window.matchMedia?.("(max-width:700px)")?.matches?16:32,total=Math.max(1,Math.ceil(filtered.length/size));
     if(page>=total)page=total-1;
     status.textContent="找到 "+filtered.length+" 個動詞｜第 "+(page+1)+"／"+total+" 頁（本頁最多 "+size+" 字）";
     grid.replaceChildren();pages.replaceChildren();
     for(const [i,verb]of filtered.slice(page*size,(page+1)*size).entries()){
       const item=button("","va-item");
       item.setAttribute("aria-label","查看 "+verb.word+" 的變化與用法");
       japanese(item,headword(verb.word,verb.reading),"va-item-jp");
       item.append(element("span","va-item-cn",verb.meaning),element("small","va-item-type",verb.level+" · "+typeName[verb.type]));
       item.addEventListener("click",()=>{
         detail(detailHost,verb);
         if(typeof dialog.showModal==="function"){
           if(dialog.open)dialog.close();
           dialog.showModal();
         }else dialog.setAttribute("open","");
       });
       grid.append(item);
     }
     if(!filtered.length)grid.append(element("p","va-empty","沒有找到符合條件的動詞，請更換搜尋字或篩選。"));
     const prev=button("← 上一頁","va-page"),next=button("下一頁 →","va-page"),
       number=element("span","va-page-num",(page+1)+" / "+total);
     prev.disabled=page<=0;next.disabled=page>=total-1;
     prev.addEventListener("click",()=>{if(page>0){page--;redraw()}});
     next.addEventListener("click",()=>{if(page<total-1){page++;redraw()}});
     pages.append(prev,number,next);
     for(const [key,btn]of filterButtons)btn.setAttribute("aria-pressed",String(key===selection.kana));
   }
   for(const [value,label]of kanaGroups){
     const btn=button(label,"va-kana-button");
     btn.setAttribute("aria-pressed",String(value==="all"));
     btn.addEventListener("click",()=>{selection.kana=value;page=0;redraw()});
     filterButtons.push([value,btn]);kana.append(btn);
   }
   search.addEventListener("input",()=>{selection.query=search.value;page=0;redraw()});
   level.addEventListener("change",()=>{selection.level=level.value;page=0;redraw()});
   type.addEventListener("change",()=>{selection.type=type.value;page=0;redraw()});
   shell.append(kana,status,pages,grid,guide,dialog);
   redraw();host.append(shell);return true;
 }
 window.ENJP_VerbAtlas={id:ID,has:id=>id===ID,render,list,filterRows,ownExamples,kanaGroup,problems,sourceCount:{
   old:list.filter(x=>x.source==="legacy").length,new:list.filter(x=>x.source==="curated").length,advanced:list.filter(x=>x.source==="advanced").length
 }};
})();

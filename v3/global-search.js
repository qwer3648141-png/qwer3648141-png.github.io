"use strict";
/* ENJP Ocean 4.9 · shared read-only search over ALL vocabulary and inflection forms.
 * Search headwords first, then generated variants and meanings.
 * Does not change any course progress, voices or stored vocabulary.
 */
(function(){
 const Lex=window.ENJP_LexicalAtlas,Verbs=window.ENJP_VerbAtlas,
   Inf=window.ENJP_Inflections,Audio=window.ENJP_Audio;
 if(!Lex?.vocabularyRows||!Lex?.adjectiveRows||!Verbs?.list||!Inf||!Audio)return;
 const norm=s=>String(s||"").normalize("NFKC").toLowerCase()
   .replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
 const map=new Map(),entries=[];
 const sourceName=src=>src==="advanced"?"進階教材":src==="curated"?"新版分級":
   src==="legacy"?"原版教材":"全部教材";
 const verbs=new Map(Verbs.list.map(w=>[norm(w.word)+"|"+norm(w.reading),w]));
 const adjs=new Map(Lex.adjectiveRows.map(w=>[norm(w.word)+"|"+norm(w.reading),w]));
 function add(row,mode){
   const key=norm(row.word)+"|"+norm(row.reading);
   if(map.has(key))return; // merge duplicate displays; original source records stay untouched
   const source=mode==="vocabulary"?
      (row.sourceKinds.has("advanced")?"advanced":
        row.sourceKinds.has("curated")?"curated":"legacy"):(row.source||"legacy");
   const verb=verbs.get(key)||null,adj=adjs.get(key)||null;
   const vforms=verb?Inf.verbForms(verb):null;
   const aforms=adj?Inf.adjectiveForms(adj.original||
     {word:adj.word,reading:adj.reading,type:adj.type}):null;
   const forms=vforms||aforms||[];
   const extra=mode==="vocabulary"?
     row.records.flatMap(w=>[w.english||"",w.meaning||""]):[];
   const head=[norm(row.word),norm(row.reading)];
   const inflected=forms.flatMap(f=>[f.word,f.reading]).map(norm);
   const meaning=[norm(row.meaning),...extra.map(norm)];
   const item={key,word:row.word,reading:row.reading,meaning:row.meaning,
     level:row.level,mode,source,sourceLabel:sourceName(source),
     kind:verb?"verb":adj?"adj":mode==="vocabulary"?row.kind:"",data:row,
     verb,adj,forms,head,inflected,meaningTerms:meaning};
   map.set(key,item);entries.push(item);
 }
 Lex.vocabularyRows.forEach(w=>add(w,"vocabulary"));
 Lex.adjectiveRows.forEach(w=>add(w,"adjective"));
 Verbs.list.forEach(w=>add(w,"verb"));
 function search(query){
   const q=norm(query).trim();
   if(!q)return [];
   const results=[];
   for(const item of entries){
     const [surface,reading]=item.head;
     let score=99;
     if(surface===q)score=0;
     else if(reading===q)score=1;
     else if(item.inflected.includes(q))score=2;
     else if(surface.startsWith(q))score=3;
     else if(reading.startsWith(q))score=4;
     else if(item.inflected.some(s=>s.startsWith(q)))score=5;
     else if(surface.includes(q))score=6;
     else if(reading.includes(q))score=7;
     else if(item.inflected.some(s=>s.includes(q)))score=8;
     else if(item.meaningTerms.some(s=>s.includes(q)))score=9;
     if(score!==99)results.push({item,score});
   }
   results.sort((a,b)=>a.score-b.score||
      a.item.reading.localeCompare(b.item.reading,"ja")||
      a.item.word.localeCompare(b.item.word,"ja"));
   return results.map(x=>x.item);
 }
 function el(tag,cls,value){
   const n=document.createElement(tag);if(cls)n.className=cls;
   if(value!==undefined)n.textContent=String(value);
   return n;
 }
 const button=(label,cls)=>{const b=el("button",cls||"la-speak",label);b.type="button";return b};
 function ruby(host,word,reading,cls){
   const p=el("p",cls||"la-example-ja");
   p.append(Audio.makeRuby(reading===undefined?word:Inf.annotation(word,reading)));
   host.append(p);return p;
 }
 function say(host,japanese){
   const wrapper=el("div","la-speech"),b=button("🔊 朗讀","la-speak"),
     status=el("span","la-speak-status","");
   status.setAttribute("role","status");
   if(!Audio.spokenJapanese(japanese))b.disabled=true;
   else b.addEventListener("click",()=>Audio.play(japanese,"jp",b,status));
   wrapper.append(b,status);host.append(wrapper);
 }
 function renderDetail(root,item){
   root.replaceChildren();
   root.append(el("span","la-kicker",
     (item.level==="ungraded"?"原版尚未分級":item.level+" · 建議程度")+
       " · "+(item.kind==="verb"?"動詞":item.kind==="adj"?"形容詞":item.sourceLabel)));
   ruby(root,item.word,item.reading,"la-detail-term");
   root.append(el("p","la-reading",item.reading),el("p","la-meaning",item.meaning));
   say(root,item.reading);
   const advanced=item.mode==="vocabulary"?
     item.data.records.find(r=>r.source==="advanced"&&r.nuance):null;
   if(advanced){
     root.append(el("h3","la-subheading","💬 語感與常見搭配"),
       el("p","la-note",advanced.nuance));
     if(advanced.pattern)root.append(el("p","la-note","常見搭配："+advanced.pattern));
     if(advanced.transitivity)root.append(el("p","la-note","自／他動詞："+advanced.transitivity));
   }
   let examples=[];
   if(item.mode==="vocabulary")examples=Lex.vocabExamples(item.data);
   else if(item.mode==="adjective")examples=Lex.adjExamples(item.data);
   else if(item.mode==="verb")examples=Verbs.ownExamples(item.data);
   root.append(el("h3","la-subheading","此詞的專屬例句／搭配"));
   if(!examples.length)root.append(el("p","la-note","這個詞尚未有完成對應校對的例句，先不放入其他詞的句子。"));
   for(const ex of examples.slice(0,5)){
     const panel=el("div","la-example");
     ruby(panel,ex.ja,undefined,"la-example-ja");
     panel.append(el("p","la-translation",ex.zh||""));
     if(ex.full||ex.source==="curated"||ex.source==="advanced")say(panel,ex.ja);
     else panel.append(el("small","la-note","原版搭配片語，尚未逐字檢查朗讀。"));
     root.append(panel);
   }
   if(item.forms.length){
     root.append(el("h3","la-subheading",
       "變化型態（"+item.forms.length+" 種）"));
     const panel=el("div","la-forms");
     for(const form of item.forms){
       const cell=el("div","la-form");
       cell.append(el("span","la-form-name",form.key));
       ruby(cell,form.word,form.reading,"la-form-ja");
       if(form.hint)cell.append(el("small","la-form-hint",form.hint));
       say(cell,form.reading);
       panel.append(cell);
     }
     root.append(panel);
   }
 }
 window.ENJP_GlobalSearch={search,renderDetail,entries,sourceName};
})();

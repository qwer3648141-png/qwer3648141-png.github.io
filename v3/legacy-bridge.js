"use strict";
/* ENJP Ocean migration layer: indexes legacy data without mutating the original site/saves. */
(function(){
  const L=window.ENJP_LEGACY,C=window.ENJP_COURSES;
  if(!L||!C){window.ENJP_MIGRATION_ERROR="缺少教材檔案";return}
  const vocabCount=Object.values(L.vocab).reduce((sum,rows)=>sum+rows.length,0);
  if(vocabCount!==920||L.grammar.length!==200||L.lexical.length!==400){
    window.ENJP_MIGRATION_ERROR="教材匯入不完整";return;
  }
  const S=Object.create(null);
  const section=(id,title,count)=>({id,title,count,imported:true});
  const chapter=(id,title,summary,sections)=>({id,title,summary,sections});
  const titleFor=n=>{
    const x=L.catalog[String(n)];
    return (x?.icon||"📘")+" "+String(n).padStart(2,"0")+"｜"+(x?.title||L.vocab[String(n)]?.[0]?.topic||("Chapter "+n));
  };
  function attachVocabulary(target,mode){
    for(let group=0;group<6;group++){
      const a=group*5+1,b=a+4,sections=[];
      for(let n=a;n<=b;n++){
        const key="legacy-vocab-"+mode+"-"+n;
        S[key]={kind:"vocab",mode,chapter:n,items:L.vocab[String(n)],title:titleFor(n)};
        sections.push(section(key,titleFor(n),L.vocab[String(n)].length));
      }
      target.push(chapter("legacy-vocab-group-"+mode+"-"+group,"📚 完整情境單字 "+String(a).padStart(2,"0")+"–"+b,
        mode==="jp"?"跨級日文詞彙｜沿用原版英日對照資料":mode==="en"?"原版 30 章英文單字與例句":"原版 30 章英文＋日文配對教材",sections));
    }
  }
  function attachGrammar(level){
    const items=L.grammar.filter(g=>g.lv===level);
    const extra=Object.entries(L.chapterGrammar).filter(([_,g])=>String(g.lv).includes(level)).map(([n,g])=>({...g,originalChapter:n}));
    const merged=[...items,...extra];
    const sections=[];
    for(let i=0;i<merged.length;i+=10){
      const slice=merged.slice(i,i+10),start=i+1,end=i+slice.length,key="legacy-grammar-"+level+"-"+start;
      S[key]={kind:"grammar",mode:"jp",level,items:slice,title:level+" 文法 "+String(start).padStart(2,"0")+"–"+String(end).padStart(2,"0")};
      sections.push(section(key,"文法 "+String(start).padStart(2,"0")+"–"+String(end).padStart(2,"0")+"｜"+slice[0].f,slice.length));
    }
    C.jp[level].push(chapter("legacy-grammar-"+level,"📖 "+level+" 完整文法資料庫",
      "保留原版句型、中文解析、例句與常用搭配｜原始資料持續校對",sections));
  }
  function attachLexical(level,kind){
    const topics=L.topics.filter(t=>t[1]===kind);
    const sections=[];
    for(const [id,_,label] of topics){
      const items=L.lexical.filter(v=>v.topic===id&&v.kind===kind&&v.level===level);
      if(!items.length)continue;
      const key="legacy-lex-"+level+"-"+id;
      S[key]={kind:"lexical",mode:"jp",level,lexKind:kind,items,title:label};
      sections.push(section(key,label,items.length));
    }
    if(!sections.length)return;
    C.jp[level].push(chapter("legacy-"+kind+"-"+level,
      (kind==="verb"?"⚔️ ":"✨ ")+level+(kind==="verb"?" 動詞圖鑑":" 形容詞圖鑑"),
      "沿用原版單字讀音、詞性、中文與兩組搭配用法",sections));
  }
  for(const level of ["N5","N4","N3"]){
    const curated=C.jp[level].splice(0); // Preserve original navigation but prioritize real imported lessons.
    attachGrammar(level);attachLexical(level,"verb");attachLexical(level,"adj");
    attachVocabulary(C.jp[level],"jp");
    C.jp[level].push(...curated);
  }
  const englishPreview=C.en.splice(0);
  attachVocabulary(C.en,"en");
  C.en.push(...englishPreview);
  const bilingualPreview=C.dual.splice(0);
  attachVocabulary(C.dual,"dual");
  C.dual.push(...bilingualPreview);
  const summary={vocab:vocabCount,grammar:L.grammar.length,chapterGrammar:Object.keys(L.chapterGrammar).length,
    verbs:L.lexical.filter(v=>v.kind==="verb").length,
    adjectives:L.lexical.filter(v=>v.kind==="adj").length,
    sections:Object.keys(S).length};
  window.ENJP_MIGRATED={sections:S,summary};
})();

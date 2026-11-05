"use strict";
/* Formal verb and adjective conjugations migrated from the original ENJP trainer. */
(function(){
 const godan={
  "う":["い","わ","って","った","え"],"く":["き","か","いて","いた","け"],
  "ぐ":["ぎ","が","いで","いだ","げ"],"す":["し","さ","して","した","せ"],
  "つ":["ち","た","って","った","て"],"ぬ":["に","な","んで","んだ","ね"],
  "ぶ":["び","ば","んで","んだ","べ"],"む":["み","ま","んで","んだ","め"],
  "る":["り","ら","って","った","れ"]
 };
 function core(v,word){
   if(v.type==="suru"){
     const stem=word.endsWith("する")?word.slice(0,-2):word;
     return {masu:stem+"します",nai:stem+"しない",te:stem+"して",ta:stem+"した",pot:stem+"できる"};
   }
   if(v.word==="来る"&&word===v.word)return {masu:"来ます",nai:"来ない",te:"来て",ta:"来た",pot:"来られる"};
   if(v.word==="来る")return {masu:"きます",nai:"こない",te:"きて",ta:"きた",pot:"こられる"};
   if(v.word==="行く"&&word===v.word)return {masu:"行きます",nai:"行かない",te:"行って",ta:"行った",pot:"行ける"};
   if(v.word==="行く")return {masu:"いきます",nai:"いかない",te:"いって",ta:"いった",pot:"いける"};
   if(v.type==="ichidan"){
     const stem=word.slice(0,-1);
     return {masu:stem+"ます",nai:stem+"ない",te:stem+"て",ta:stem+"た",pot:stem+"られる"};
   }
   const last=word.slice(-1),stem=word.slice(0,-1),m=godan[last];
   if(!m)throw new Error("Unknown verb ending: "+word);
   return {masu:stem+m[0]+"ます",nai:stem+m[1]+"ない",te:stem+m[2],ta:stem+m[3],pot:stem+m[4]+"る"};
 }
 function verbForms(v){
   const k=core(v,v.word),r=core(v,v.reading);
   const stem=k.masu.slice(0,-2),stemR=r.masu.slice(0,-2);
   const rows=[
     ["辭書形",v.word,v.reading],
     ["ます形",k.masu,r.masu],["ません形",stem+"ません",stemR+"ません"],
     ["ました形",stem+"ました",stemR+"ました"],
     ["ませんでした形",stem+"ませんでした",stemR+"ませんでした"],
     ["ない形",k.nai,r.nai],
     ["なかった形",k.nai.slice(0,-1)+"かった",r.nai.slice(0,-1)+"かった"],
     ["て形",k.te,r.te],["た形",k.ta,r.ta],
     ["可能形",k.pot,r.pot]
   ];
   return rows.map(([label,surface,reading])=>({label,surface,reading}));
 }
 function adjForms(v){
   const conjugate=word=>{
     const raw=word.endsWith("な")?word.slice(0,-1):word;
     if(v.type==="i"){
       const stem=raw.endsWith("いい")?raw.slice(0,-2)+"よ":raw.slice(0,-1);
       return {negative:stem+"くない",past:stem+"かった",pastNegative:stem+"くなかった",adverb:stem+"く"};
     }
     return {negative:raw+"ではない",past:raw+"だった",pastNegative:raw+"ではなかった",adverb:raw+"に"};
   };
   const k=conjugate(v.word),r=conjugate(v.reading);
   return [["原形",v.word,v.reading],["否定形",k.negative,r.negative],["過去形",k.past,r.past],["過去否定形",k.pastNegative,r.pastNegative],["副詞形",k.adverb,r.adverb]]
     .map(([label,surface,reading])=>({label,surface,reading}));
 }
 function forms(item){return item.kind==="verb"?verbForms(item):item.kind==="adj"?adjForms(item):[]}
 window.ENJP_Conjugation={forms};
})();

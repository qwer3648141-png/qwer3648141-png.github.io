"use strict";
(function(){
 const changes={
 "う":["い","わ","って","った","え","お"],"く":["き","か","いて","いた","け","こ"],
 "ぐ":["ぎ","が","いで","いだ","げ","ご"],"す":["し","さ","して","した","せ","そ"],
 "つ":["ち","た","って","った","て","と"],"ぬ":["に","な","んで","んだ","ね","の"],
 "ぶ":["び","ば","んで","んだ","べ","ぼ"],"む":["み","ま","んで","んだ","め","も"],
 "る":["り","ら","って","った","れ","ろ"]
 };
 const keys=["辭書形","ます形","ません形","ました形","ませんでした形","ない形","なかった形","て形","た形","可能形","意向形"];
 const hints={
 "辭書形":"動詞原形，也是字典查詢形式。","ます形":"禮貌肯定。五段換い段；一段去る。",
 "ません形":"禮貌否定。","ました形":"禮貌過去。","ませんでした形":"禮貌過去否定。",
 "ない形":"普通否定。五段換あ段（う→わ）；一段去る。",
 "なかった形":"普通過去否定。","て形":"連接動作與文法；五段注意音便。",
 "た形":"普通過去或完成形；五段注意音便。","可能形":"表示能夠做某事。",
 "意向形":"表示意圖或提議，五段換お段＋う。"
 };
 const rule={
 godan:"第一類・五段：依最後一個假名的段位變化；行く的て／た形是行って／行った。",
 ichidan:"第二類・一段：去掉最後的る，再接變化語尾，如食べます、食べない。",
 suru:"第三類・する：します／しない／して／した，可能表達使用「ことができる」。",
 kuru:"第三類・来る：きます／こない／きて／きた，需要特別記住讀音。"
 };
 function basic(word,type,original){
   if(type==="kuru")return word==="来る"?
     {masu:"来ます",nai:"来ない",te:"来て",ta:"来た",possible:"来られる",will:"来よう"}:
     {masu:"きます",nai:"こない",te:"きて",ta:"きた",possible:"こられる",will:"こよう"};
   if(type==="suru"){
     if(!word.endsWith("する"))return null;
     const stem=word.slice(0,-2);
     return {masu:stem+"します",nai:stem+"しない",te:stem+"して",ta:stem+"した",
       possible:word+"ことができる",will:stem+"しよう"};
   }
   if(type==="ichidan"){
     if(!word.endsWith("る"))return null;
     const stem=word.slice(0,-1);
     return {masu:stem+"ます",nai:stem+"ない",te:stem+"て",ta:stem+"た",
       possible:stem+"られる",will:stem+"よう"};
   }
   if(type!=="godan")return null;
   if(original==="行く"&&(word==="行く"||word==="いく")){
     const k=word==="行く";
     return {masu:k?"行きます":"いきます",nai:k?"行かない":"いかない",
       te:k?"行って":"いって",ta:k?"行った":"いった",
       possible:k?"行ける":"いける",will:k?"行こう":"いこう"};
   }
   const r=changes[word.slice(-1)];if(!r)return null;
   const stem=word.slice(0,-1);
   return {masu:stem+r[0]+"ます",nai:stem+r[1]+"ない",te:stem+r[2],ta:stem+r[3],
     possible:stem+r[4]+"る",will:stem+r[5]+"う"};
 }
 function verbForms(item){
   const word=String(item.word||""),reading=String(item.reading||"");
   const w=basic(word,item.type,word),r=basic(reading,item.type,word);
   if(!w||!r)return null;
   const full=(b,raw)=>({
     "辭書形":raw,"ます形":b.masu,"ません形":b.masu.slice(0,-2)+"ません",
     "ました形":b.masu.slice(0,-2)+"ました","ませんでした形":b.masu.slice(0,-2)+"ませんでした",
     "ない形":b.nai,"なかった形":b.nai.slice(0,-1)+"かった",
     "て形":b.te,"た形":b.ta,"可能形":b.possible,"意向形":b.will
   });
   const all=full(w,word),kana=full(r,reading);
   return keys.map(key=>({key,word:all[key],reading:kana[key],hint:hints[key]}));
 }
 function adjectiveForms(item){
   const original=String(item.word||""),pron=String(item.reading||"");
   const word=item.type==="na"?original.replace(/な$/,""):original;
   const reading=item.type==="na"?pron.replace(/な$/,""):pron;
   if(item.type==="na")return [
     ["基本形",word+"だ",reading+"だ","普通肯定。"],["連體形",word+"な",reading+"な","修飾名詞。"],
     ["否定形",word+"ではない",reading+"ではない","不是～。"],["過去形",word+"だった",reading+"だった","過去肯定。"],
     ["過去否定",word+"ではなかった",reading+"ではなかった","過去否定。"],
     ["副詞形",word+"に",reading+"に","修飾動詞。"]
   ].map(([key,word,reading,hint])=>({key,word,reading,hint}));
   if(item.type!=="i"||!word.endsWith("い")||!reading.endsWith("い"))return null;
   const base=word.endsWith("いい")?word.slice(0,-2)+"よ":word.slice(0,-1);
   const kana=reading.endsWith("いい")?reading.slice(0,-2)+"よ":reading.slice(0,-1);
   return [
     ["基本形",word,reading,"い形容詞基本形式。"],
     ["否定形",base+"くない",kana+"くない","去い＋くない，注意いい→よくない。"],
     ["過去形",base+"かった",kana+"かった","去い＋かった。"],
     ["過去否定",base+"くなかった",kana+"くなかった","去い＋くなかった。"],
     ["副詞形",base+"く",kana+"く","去い＋く。"]
   ].map(([key,word,reading,hint])=>({key,word,reading,hint}));
 }
 function annotation(surface,reading){
   surface=String(surface||"");reading=String(reading||"");
   if(!/[一-龯々]/.test(surface)||!/^[ぁ-ゖァ-ヺー]+$/.test(reading))return surface;
   const norm=s=>s.replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
   const parts=[...surface].reduce((arr,c)=>{
     const kanji=/[一-龯々]/.test(c),last=arr[arr.length-1];
     if(last&&last.kanji===kanji)last.text+=c;else arr.push({kanji,text:c});
     return arr;
   },[]);
   const escaped=s=>[...s].map(c=>"\\^$.*+?()[]{}|".includes(c)?"\\"+c:c).join("");
   const pattern="^"+parts.map(p=>p.kanji?"(.+?)":escaped(norm(p.text))).join("")+"$";
   let match;try{match=norm(reading).match(new RegExp(pattern))}catch{return surface}
   if(!match)return surface;
   let i=1;return parts.map(p=>p.kanji?p.text+"（"+match[i++]+"）":p.text).join("");
 }
 window.ENJP_Inflections={verbForms,adjectiveForms,annotation,keys,rule};
})();
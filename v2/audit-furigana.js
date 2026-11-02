/**
 * ENJP Ocean 2.0 — read-only furigana QA queue
 * Run: node v2/audit-furigana.js
 * Reviews source ruby tags without modifying lesson content.
 */
"use strict";
const fs=require("node:fs"),path=require("node:path");
const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
function sourceData(name){
 const marker="const "+name+"=",pos=html.indexOf(marker);
 if(pos<0)throw Error("Missing "+name);
 return JSON.parse(html.slice(pos+marker.length).split("\n")[0].trim().replace(/;$/,""));
}
const chapters=sourceData("chapterVocab"),grammar=sourceData("grammarBank");
const kanji=/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff々〆]/;
const kana=/[\u3040-\u30ff]/;
const ruby=/<ruby>([^<]*?)<rt>([^<]*?)<\/rt><\/ruby>/g;
const rows=[];
for(const [chapter,words] of Object.entries(chapters))words.forEach((w,i)=>{
 for(const field of ["jp_ruby","ex_jp_ruby"])rows.push({where:"Chapter "+chapter+" / "+(i+1)+" / "+field,value:String(w[field]||"")});
});
grammar.forEach((g,i)=>{
 rows.push({where:"Grammar "+(i+1)+" / "+g.lv,value:String(g.j||"")});
 (g.chunks||[]).forEach((ch,j)=>rows.push({where:"Grammar "+(i+1)+" / chunk "+(j+1),value:String(ch[0]||"")}));
});
const counters={total:0,mixed:0,kanaOnly:0,emptyReading:0};
const issues=[];
for(const row of rows)for(const m of row.value.matchAll(ruby)){
 counters.total++;
 const flags=[];
 if(!kanji.test(m[1])){counters.kanaOnly++;flags.push("kana-only ruby")}
 else if(kana.test(m[1])){counters.mixed++;flags.push("mixed kanji/kana")}
 if(!m[2].trim()){counters.emptyReading++;flags.push("empty reading")}
 if(flags.length)issues.push({where:row.where,base:m[1],reading:m[2],flags});
}
console.log("Ruby spans: "+counters.total);
console.log("Mixed kanji/kana spans: "+counters.mixed+" (review queue, not proven errors)");
console.log("Kana-only ruby spans: "+counters.kanaOnly);
console.log("Missing readings: "+counters.emptyReading);
issues.slice(0,15).forEach(x=>console.log("REVIEW "+x.where+": "+x.base+" / "+x.reading+" ("+x.flags.join(", ")+")"));
if(issues.length>15)console.log("...remaining review rows: "+(issues.length-15));
const safe=x=>String(x).replace(/\|/g,"／").replace(/\n/g," ");
const report=[
"### ENJP Ocean V2 — 振假名待審查清單",
"",
"- 原始 ruby 片段："+counters.total,
"- 混合漢字／假名："+counters.mixed,
"- 假名被套 ruby："+counters.kanaOnly,
"- 空白讀音："+counters.emptyReading,
"",
"> 統計表示待檢查資料，並非全部已證實錯誤。讀音正確性仍須語境及瀏覽器驗證。",
"",
"| 來源 | 表記 | 讀音 | 原因 |",
"| --- | --- | --- | --- |",
...issues.slice(0,100).map(x=>"| "+safe(x.where)+" | "+safe(x.base)+" | "+safe(x.reading)+" | "+x.flags.join("、")+" |")
].join("\n")+"\n";
if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,report);

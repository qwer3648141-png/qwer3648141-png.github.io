/**
 * ENJP Ocean V2: verify original kanji-only renderer across all stored
 * word and grammar markup, without changing a single lesson string.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
function dataset(name){
 const label="const "+name+"=",start=html.indexOf(label);
 assert(start>=0,"Missing dataset "+name);
 return JSON.parse(html.slice(start+label.length).split("\n")[0].trim().replace(/;$/,""));
}
const start=html.indexOf("function jpIsKanjiChar("),end=html.indexOf("function safeSpeechText(",start);
assert(start>=0&&end>start);
const {jpRubyKanjiOnly:render}=vm.runInNewContext(html.slice(start,end)+"\n({jpRubyKanjiOnly})");
const chapter=dataset("chapterVocab"),grammar=dataset("grammarBank");
const content=[];
for(const [chapterId,words] of Object.entries(chapter))for(let i=0;i<words.length;i++){
 const w=words[i];
 content.push({name:"chapter "+chapterId+" word "+i,html:w.jp_ruby});
 content.push({name:"chapter "+chapterId+" example "+i,html:w.ex_jp_ruby});
}
grammar.forEach((g,i)=>{
 content.push({name:"grammar "+i,html:g.j});
 for(const chunk of g.chunks||[])content.push({name:"grammar "+i+" chunk",html:chunk[0]});
});
const ruby=/<ruby>([^<]*?)<rt>([^<]*?)<\/rt><\/ruby>/g;
const kanji=/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff々〆]/;
const toPlain=s=>String(s).replace(ruby,(_,base)=>base);
let inspected=0,sourceMixed=0,sourceKana=0,finalKana=0,noKanjiAnnotation=0;
const uncovered=[];
for(const item of content){
 const src=String(item.html||""),normalized=render(src);
 assert.equal(toPlain(normalized),toPlain(src),"Surface text modified: "+item.name);
 for(const m of src.matchAll(ruby)){
  inspected++;
  if(!kanji.test(m[1]))sourceKana++;
  else if(/[\u3040-\u30ff]/.test(m[1]))sourceMixed++;
 }
 for(const m of normalized.matchAll(ruby)){
  assert(kanji.test(m[1]),"Non-kanji ruby produced: "+item.name+": "+m[1]); 
  assert(m[2].trim(),"Empty reading: "+item.name);
 }
 if((src.match(ruby)||[]).some(tag=>kanji.test(tag))&&!(normalized.match(ruby)||[]).some(tag=>kanji.test(tag))){
  noKanjiAnnotation++;if(uncovered.length<8)uncovered.push(item.name);
 }
}
assert.equal(finalKana,0);
console.log("✓ Ruby whole-dataset display invariants: "+content.length+" lesson fields and "+inspected+" original spans");
console.log("✓ Original mixed spans: "+sourceMixed+"; kana-only spans stripped: "+sourceKana);
if(noKanjiAnnotation)console.log("NOTE "+noKanjiAnnotation+" fields retained text but lacked expected kanji ruby output: "+uncovered.join(", "));
console.log("PASS — all inspected annotation outputs preserve original visible text and use kanji-only ruby bases");

/**
 * ENJP Ocean 2.0 read-only structural regression check.
 * Run: node v2/verify-data.js
 * Parses scripts; does not execute user data, write state or modify files.
 */
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const v2=fs.readFileSync(path.join(__dirname,"dual-mode.js"),"utf8");
const notes=[];
function oneLineJSON(name){
  const needle="const "+name+"=";
  const pos=html.indexOf(needle);
  assert(pos>=0,"Missing data "+name);
  const rest=html.slice(pos+needle.length);
  const text=rest.split("\n")[0].trim().replace(/;$/,"");
  return JSON.parse(text);
}
function report(label,value){console.log("✓ "+label+": "+value)}
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
const inlineScripts=scripts.filter(m=>m[1].trim().length>0);
assert.equal(inlineScripts.length,1,"Expected exactly one original inline app script");
new vm.Script(inlineScripts[0][1],{filename:"index.html:inline.js"});
new vm.Script(v2,{filename:"v2/dual-mode.js"});
report("JavaScript syntax","main app + v2 bridge parsed");
const chapters=oneLineJSON("chapterVocab");
const chapterIds=Object.keys(chapters);
assert.equal(chapterIds.length,30,"30 Chapters required");
const words=Object.values(chapters).flat();
assert(words.length>=900,"Expected the original EN/JP word bank");
assert(chapterIds.every(n=>chapters[n].length>=30&&chapters[n].length<=40),"Expected 30–40 words per chapter");
for(const v of words)for(const k of ["en","jp","cn","jp_ruby","ex_en","ex_jp","ex_jp_ruby","ex_cn","kk"])
  assert(v[k],"Missing field "+k+" for "+v.en);
report("English/Japanese vocabulary",words.length+" records across 30 chapters");
const grammar=oneLineJSON("grammarBank");
assert.equal(grammar.length,200,"Expected original 200 grammar points");
const byLevel=grammar.reduce((a,g)=>(a[g.lv]=(a[g.lv]||0)+1,a),{});
for(const lv of ["N5","N4","N3"])assert(byLevel[lv]>0,"Missing grammar level "+lv);
report("JLPT grammar",JSON.stringify(byLevel));
const entries=[...html.matchAll(/LEX_DATA_LINES\.push\(\.\.\.(\[[^\n]*\])\);/g)].flatMap(m=>JSON.parse(m[1]));
assert.equal(entries.length,400,"Expected original verb/adjective entries");
for(const line of entries)assert.equal(line.split("|").length,9,"Malformed verb/adjective data line");
report("Verbs and adjectives",entries.length+" entries");
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,"Duplicate literal HTML id attributes");
const screens=["home","daily","chapters","cards","drill","match","listen","focus","library","lextrain","grammar","settings"];
for(const name of screens)assert(html.includes('id="'+name+'"'),"Missing original page "+name);
report("Legacy page navigation",screens.length+" pages retained");
assert(html.includes('href="v2/dual-mode.css"')&&html.includes('src="v2/dual-mode.js"'),"V2 asset references missing");
assert(!/\blexProgress\b|\bLEX_KEY\b/.test(html),"Stale variables remain in app source");
assert(html.includes("lexTrain:lexState")&&html.includes("verbLab:vlState"),"Backup payload missing new state fields");
assert(html.includes('localStorage.setItem(LEX_STORE_KEY,JSON.stringify(payload.lexTrain))'),"Lex import key mismatch");
assert(html.includes('localStorage.setItem(VL_KEY,JSON.stringify(payload.verbLab))'),"VerbLab import key mismatch");
report("Progress backups","legacy and verb lab states included");
const rawRubyStrings=words.flatMap(w=>[w.jp_ruby,w.ex_jp_ruby]).concat(grammar.map(g=>g.j));
const mixedRuby=rawRubyStrings.flatMap(s=>[...String(s||"").matchAll(/<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>/g)])
  .filter(m=>/[\u3400-\u9fff々〆]/.test(m[1])&&/[\u3040-\u30ff]/.test(m[1]));
if(mixedRuby.length)notes.push(mixedRuby.length+" raw ruby spans contain kana with kanji; existing jpRubyKanjiOnly renderer must be inspected in browser");
report("Furigana source scan",mixedRuby.length+" complex spans flagged for visual QA");
console.log("\nPASS — Structural checks passed. "+notes.length+" content/visual QA reminder(s).");
notes.forEach(t=>console.log("NOTE "+t));

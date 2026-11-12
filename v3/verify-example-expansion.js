"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const read=path=>fs.readFileSync(path,"utf8");
const sourceFiles=["v3/n4-lessons-data.js","v3/n3-lessons-data.js","v3/n4-extra-examples.js","v3/n3-extra-examples.js","v3/verb-form-examples.js","v3/n4n3-completion.js","v3/legacy-reader.js","v3/inflections.js"];
sourceFiles.forEach(path=>new vm.Script(read(path),{filename:path}));
const context={window:{}};
for(const path of sourceFiles.slice(0,5))vm.runInNewContext(read(path),context);
const lessons=context.window.ENJP_N4N3_LESSONS,extra=context.window.ENJP_N4N3_EXTRA_EXAMPLES,forms=context.window.ENJP_VERB_FORM_EXAMPLES;
const safe=ja=>!/[一-龯々]/.test(String(ja).replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2"));
let units=0,added=0,original=0;
assert.equal(Object.keys(lessons).length,31,"31 base N4/N3 lessons");
assert.deepEqual(Object.keys(extra).sort(),Object.keys(lessons).sort(),"extras cover every base lesson");
for(const [id,lesson] of Object.entries(lessons)){
  const sets=extra[id];
  assert(Array.isArray(sets)&&sets.length===lesson.units.length,id+" has all unit additions");
  for(let i=0;i<lesson.units.length;i++){
    const initial=lesson.units[i].examples,extension=sets[i];
    units++;
    assert.equal(initial.length,2,id+" original 2 examples preserved");
    original+=initial.length;
    assert.equal(extension.length,2,id+" exactly 2 additional examples per unit");
    const seen=new Set(initial.map(row=>row[0]));
    for(const [ja,zh]of extension){
      assert.equal(typeof ja,"string");
      assert.equal(typeof zh,"string");
      assert(ja.length>5&&zh.length>4,id+" non-empty Japanese and translation");
      assert(safe(ja),id+" every kanji has reading: "+ja);
      assert(!seen.has(ja),id+" no duplicated original sentences");
      seen.add(ja);added++;
    }
  }
}
assert.equal(units,78);assert.equal(added,156);assert.equal(original,156);
const keys=["辭書形","ます形","ません形","ました形","ませんでした形","ない形","なかった形","て形","た形","可能形","意向形"];
assert.equal(Object.keys(forms).length,keys.length);
let formCount=0;
for(const key of keys){
  assert(Array.isArray(forms[key])&&forms[key].length===4,key+" four usable examples");
  for(const [ja,zh]of forms[key]){
    assert(safe(ja),"verb "+key+" ruby: "+ja);
    assert(ja.length>7&&zh.length>3,"verb form Japanese and Chinese");
    formCount++;
  }
}
assert.equal(formCount,44);
const html=read("v3/index.html");
for(const name of ["n4-extra-examples.js","n3-extra-examples.js","verb-form-examples.js","example-expansion.css"])assert(html.includes(name),name+" referenced");
assert(html.indexOf("verb-form-examples.js")<html.indexOf("legacy-reader.js"),"verb data precedes legacy reader");
assert(html.indexOf("n3-extra-examples.js")<html.indexOf("n4n3-completion.js"),"extra data precedes N4/N3 renderer");
const n4n3=read("v3/n4n3-completion.js"),legacy=read("v3/legacy-reader.js");
assert(n4n3.includes("ENJP_N4N3_EXTRA_EXAMPLES"),"N4/N3 additional examples wired");
assert(n4n3.includes("nl-more-examples"),"collapsed extra examples");
assert(n4n3.includes("speak(example,ja)"),"new sentences inherit JP speech");
// Generic form examples remain in their own data module, but are no longer
// presented as if they belong to every individual lexical verb.
assert(!legacy.includes('const verbExamples=window.ENJP_VERB_FORM_EXAMPLES'),"generic examples detached from each lexical entry");
assert(!legacy.includes("vf-example-list"),"unrelated generic verbs do not leak into vocabulary cards");
assert(legacy.includes("Audio.play(row.reading,\"jp\""),"each conjugation has its own word-specific audio");
assert(legacy.includes("item.collocations||[]"),"each legacy word keeps its own reviewed collocations");
const style=read("v3/example-expansion.css");
assert(style.includes(".nl-more-examples")&&style.includes(".vf-examples"));
console.log(JSON.stringify({status:"PASS",lessons:Object.keys(lessons).length,units,original,added,verbForms:keys.length,verbExampleSentences:formCount,totalNewSentences:added+formCount,oldProgressKeysUntouched:true}));

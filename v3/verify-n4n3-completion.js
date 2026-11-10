"use strict";
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const files=["v3/course-map.js","v3/n4-lessons-data.js","v3/n3-lessons-data.js","v3/n4n3-completion.js","v3/app.js"];
files.forEach(path=>new vm.Script(read(path),{filename:path}));
const mock={
 window:{ENJP_Audio:{makeRuby:ja=>ja,spokenJapanese:ja=>{
   const spoken=String(ja).replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2");
   return /[一-龯々]/.test(spoken)?null:spoken;
 },play:()=>{},stop:()=>{}}},
 localStorage:{getItem:()=>null,setItem:()=>{}},
 document:{createElement:tag=>({tag,append(){},replaceChildren(){},setAttribute(){}})}
};
vm.runInNewContext(read("v3/course-map.js"),mock);
const C=mock.window.ENJP_COURSES;
vm.runInNewContext(read("v3/n4-lessons-data.js"),mock);
vm.runInNewContext(read("v3/n3-lessons-data.js"),mock);
vm.runInNewContext(read("v3/n4n3-completion.js"),mock);
const D=mock.window.ENJP_N4N3_LESSONS;
const engine=mock.window.ENJP_N4N3_Complete;
assert(engine&&typeof engine.render==="function","renderer registered");
assert.equal(Object.keys(D).length,31,"exactly 31 newly completed lessons");
const missing=[];
const existing=[];
for(const level of ["N4","N3"]){
 const ids=C.jp[level].flatMap(ch=>ch.sections.map(s=>s.id));
 for(const id of ids){
   if(C.lesson[id])existing.push(id);
   else if(!D[id])missing.push(id);
   else assert(engine.has(id),id+" lesson registered");
 }
}
assert.deepEqual(missing,[],"no planned N4/N3 sections");
assert.equal(existing.length,2,"two previously available course-map lessons untouched");
const safe=ja=>String(ja).replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2");
let units=0,examples=0,questions=0,audio=0;
for(const [id,lesson] of Object.entries(D)){
 assert(/^jp-n[34]-/.test(id),"only N4 or N3 lessons");
 assert(lesson.goal?.length>12,id+" goal");
 assert(lesson.units.length>=1,id+" units");
 assert(lesson.quiz.length>=3,id+" exercises");
 for(const unit of lesson.units){
   units++;
   assert(unit.title&&unit.form&&unit.explain, id+" unit explanation");
   assert(unit.examples.length>=2,id+" two examples per unit");
   for(const pair of unit.examples){
     assert(Array.isArray(pair)&&pair.length===2&&pair[1],id+" Chinese translation");
     assert(!/[一-龯々]/.test(safe(pair[0])),id+" missing ruby in "+pair[0]);
     examples++;audio++;
   }
 }
 if(lesson.scene){
   assert(lesson.scene.lines.length>=4,id+" contextual lines");
   if(lesson.scene.listening)assert(lesson.scene.lines.length>=4,"listening content");
   if(lesson.scene.reading)assert(lesson.scene.lines.length>=4,"reading content");
   for(const line of lesson.scene.lines){
     assert(line.speaker&&line.ja&&line.zh,id+" bilingual dialogue");
     assert(!/[一-龯々]/.test(safe(line.ja)),id+" missing ruby in "+line.ja);
     examples++;audio++;
   }
 }
 for(const q of lesson.quiz){
   assert(q.choices.length>=3,new Error(id+" too few choices"));
   assert(q.choices.includes(q.answer),id+" missing correct answer");
   assert(new Set(q.choices).size===q.choices.length,id+" duplicated choice");
   assert(q.why?.length>=5,id+" explanation");
   questions++;
 }
}
const html=read("v3/index.html"),app=read("v3/app.js");
for(const path of ["n4-lessons-data.js","n3-lessons-data.js","n4n3-completion.js","n4n3-completion.css"])
 assert(html.includes(path),path+" included");
assert(html.indexOf("n4-lessons-data.js")<html.indexOf("n4n3-completion.js"));
assert(html.indexOf("n3-lessons-data.js")<html.indexOf("n4n3-completion.js"));
assert(html.indexOf("n4n3-completion.js")<html.indexOf("app.js"));
assert(app.includes("ENJP_N4N3_Complete?.has(section.id)"),"menu ready-state");
assert(app.includes("ENJP_N4N3_Complete?.render(root,section.id)"),"lesson renderer");
assert(app.includes('lessonId.startsWith("jp-n3-")?"N3":"N4"'),"direct N3 links routed correctly");
assert(read("v3/n4n3-completion.js").includes('enjpN4N3LessonProgressV1'),"isolated saving");
assert(!read("v3/n4n3-completion.js").includes("enjpQuestState"),"no legacy save mutation");
console.log(JSON.stringify({result:"PASS",lessons:Object.keys(D).length,existingPreserved:existing.length,units,examples,questions,annotatedAudioLines:audio,unavailable:missing.length}));

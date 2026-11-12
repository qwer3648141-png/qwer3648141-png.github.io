"use strict";
/* N5 complete syllabus and remaining N4/N3 previews: structure, coverage, pronunciations, quizzes, UI. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const read=path=>fs.readFileSync(path,"utf8");
const paths=["v3/course-map.js","v3/n5-foundation-1.js","v3/n5-foundation-2.js","v3/n5-foundation-3.js","v3/n4n3-trial-upgrades.js","v3/n5-foundation.js","v3/app.js"];
for(const p of paths)new vm.Script(read(p),{filename:p});
const mock={
 window:{ENJP_Audio:{makeRuby:ja=>ja,spokenJapanese:ja=>Boolean(ja),play:()=>{}}},
 localStorage:{getItem:()=>null,setItem:()=>{}}
};
vm.runInNewContext(read("v3/course-map.js"),mock);
for(const p of paths.slice(1,6))vm.runInNewContext(read(p),mock);
const course=mock.window.ENJP_COURSES;
const D=mock.window.ENJP_FOUNDATION_LESSONS;
const K=mock.window.ENJP_FOUNDATION_KANA;
const tool=mock.window.ENJP_Foundation;
assert(tool&&typeof tool.render==="function");
assert.equal(tool.storageKey,"enjpFoundationLessonsV1");
const allN5=course.jp.N5.flatMap(c=>c.sections.map(s=>s.id));
assert.equal(allN5.length,17,"17 N5 syllabus sections");
assert.equal(new Set(allN5).size,17,"unique syllabus IDs");
assert.equal(Object.keys(D).length,19,"17 N5 and two upgraded preview lessons");
for(const id of allN5)assert(tool.has(id),id+" missing full lesson");
for(const [level,oldId]of [["N4","jp-n4-potential"],["N3","jp-n3-purpose"]]){
  assert(course.jp[level].flatMap(c=>c.sections.map(s=>s.id)).includes(oldId),oldId+" still in the correct syllabus");
  assert(tool.has(oldId),oldId+" upgraded from preview to complete");
  assert(course.lesson[oldId],"Original trial fallback data preserved");
}
for(const style of ["hira","kata"]){
 const c=K[style];
 for(const [name,count]of [["basic",46],["voiced",20],["semiVoiced",5],["combined",33]]){
   assert.equal(c[name].length,count,style+" "+name);
   for(const row of c[name])assert(row.kana&&row.romaji,style+" voice data");
 }
 assert.equal(new Set(Object.values(c).flat().map(row=>row.kana)).size,104,"Distinct 104 kana entries");
}
const safe=ja=>!/[一-龯々]/.test(String(ja).replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2"));
let units=0,sentences=0,quiz=0,sceneLines=0;
for(const [id,lesson]of Object.entries(D)){
 assert(lesson.goal&&lesson.units.length>=2,id+" complete explanation units");
 assert(lesson.quiz.length>=4,id+" comprehension quizzes");
 for(const u of lesson.units){
  assert(u.form&&u.title&&u.note,id+" metadata");
  assert.equal(u.examples.length,4,id+" each unit needs 4 bilingual examples");
  units++;
  for(const [ja,zh]of u.examples){
   assert(ja&&zh&&ja.length>=7&&zh.length>=3,id+" bilingual content");
   assert(safe(ja),id+" unannotated kanji in "+ja);
   sentences++;
  }
 }
 for(const row of lesson.scene?.lines||[]){
  assert(row.who&&row.ja&&row.zh,id+" bilingual dialogue");
  assert(safe(row.ja),id+" dialogue kanji missing ruby: "+row.ja);
  sceneLines++;
 }
 for(const q of lesson.quiz){
  assert(q.question&&q.why,id+" quiz explanation");
  assert(q.options.length>=3&&q.options.includes(q.answer),id+" correct answer available");
  assert.equal(new Set(q.options).size,q.options.length,id+" no duplicate options");
  quiz++;
 }
}
const html=read("v3/index.html"),app=read("v3/app.js");
for(const f of ["n5-foundation-1.js","n5-foundation-2.js","n5-foundation-3.js","n4n3-trial-upgrades.js","n5-foundation.js","n5-foundation.css"])
 assert(html.includes(f),f+" included in page");
assert(html.indexOf("n4n3-trial-upgrades.js")<html.indexOf("n5-foundation.js"),"load all data before renderer");
assert(html.indexOf("n5-foundation.js")<html.indexOf("app.js"),"load renderer before navigation");
assert(app.includes("ENJP_Foundation?.has(section.id)"),"ready tags reflect N5 lessons");
assert(app.includes("ENJP_Foundation?.render(root,section.id)"),"N5 full renderer wired in");
assert(app.includes("specialFoundation||specialCompletion||specialConnection?\"完整教材\""),"N5, N4/N3 trials and new connection lessons labeled complete");
assert(app.includes("state.level=lessonId.startsWith(\"jp-n3-\")"),"deep links route to N3");
const implementation=read("v3/n5-foundation.js");
assert(implementation.includes("A.play(record.kana"),"kana have clickable Japanese pronunciation");
assert(implementation.includes('transcript.hidden=true'),"listening transcript hidden until revealed");
assert(implementation.includes("store.wrong[key(indices[position])]"),"separate wrong-answer persistence");
assert(!implementation.includes("enjpN4N3LessonProgressV1"),"existing N4/N3 study records untouched");
console.log(JSON.stringify({status:"PASS",n5Sections:allN5.length,upgradedN4N3:2,completeModules:Object.keys(D).length,units,bilingualExamples:sentences,sceneLines,quiz,kanaPerScript:104}));

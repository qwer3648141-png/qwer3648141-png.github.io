"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const read=path=>fs.readFileSync(path,"utf8");
const paths=["v3/contrast-grammar-data.js","v3/contrast-grammar.js","v3/app.js","v3/index.html"];
for(const path of paths.filter(path=>path.endsWith(".js")))new vm.Script(read(path),{filename:path});
const context={window:{},console};vm.createContext(context);
vm.runInContext(read("v3/contrast-grammar-data.js"),context);
const topics=context.window.ENJP_CONTRAST_GRAMMAR;
const ids=["so-two-uses","rashii-mitai-youda","possibility-tone"];
assert(Array.isArray(topics),"Contrast-grammar data missing");
assert.equal(new Set(topics.map(t=>t.id)).size,topics.length,"Duplicate lesson ids");
for(const id of ids){
 const t=topics.find(t=>t.id===id);
 assert(t,"Missing new topic: "+id);
 assert(t.patterns.length>=4&&t.quiz.length>=9&&t.comparison.rows.length>=5,"Lesson too thin: "+id);
 for(const p of t.patterns){
  assert(p.rule&&p.note&&p.meaning&&p.examples.length>=3,"Missing teaching detail: "+p.form);
  for(const [ja,zh] of p.examples)assert(ja&&zh,"Incomplete Japanese/Chinese example");
 }
 for(const question of t.quiz){
  assert(question.ask&&question.why&&question.choices.length===3,"Malformed question");
  assert.equal(new Set(question.choices).size,3,"Duplicate choices");
  assert(question.choices.includes(question.correct),"Correct answer missing from choices");
 }
}
const allExamples=topics.reduce((n,t)=>n+t.patterns.reduce((m,p)=>m+p.examples.length,0),0);
const allQuizzes=topics.reduce((n,t)=>n+t.quiz.length,0);
assert(allExamples>=100&&allQuizzes>=50,"Existing content may have been lost");
assert(read("v3/contrast-grammar.js").includes("enjpContrastGrammarWrongV1"),"Old wrong-answer history key changed");
assert(read("v3/contrast-grammar.js").includes("重新開始 \"+topic.quiz.length+\" 題"),"Dynamic quiz count missing");
assert(read("v3/app.js").includes("jp-contrast-so-two-uses"),"Quick-entry lesson missing");
for(const id of ids)assert(read("v3/contrast-grammar-data.js").includes('"id":"'+id+'"'),"Data export missing id");
assert(read("v3/index.html").includes("contrast-grammar-data.js?v=5.2.0"),"Asset version not updated");
console.log("✅ Inference grammar: "+ids.length+" new lessons, "+allExamples+" total examples, "+allQuizzes+" total quiz questions. Legacy data/history and script references verified.");

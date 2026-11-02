/**
 * ENJP Ocean 2.0 — test the ACTUAL inline ruby rendering helper.
 * Read-only: do not change lesson data or browser storage.
 */
"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const html=fs.readFileSync(path.resolve(__dirname,"..","index.html"),"utf8");
const begin=html.indexOf("function jpIsKanjiChar(");
const end=html.indexOf("function safeSpeechText(",begin);
assert(begin>=0&&end>begin,"Expected Japanese ruby helpers in original app");
const code=html.slice(begin,end);
const helpers=vm.runInNewContext(code+"\n({jpRubySurface,jpRubyKanjiOnly});",{});
const render=helpers.jpRubyKanjiOnly;
const samples=[
 {name:"hiragana only",src:"<ruby>あそぶ<rt>あそぶ</rt></ruby>",expected:"あそぶ"},
 {name:"katakana only",src:"<ruby>ファイル<rt>ふぁいる</rt></ruby>",expected:"ファイル"},
 {name:"verb with okurigana",src:"<ruby>書く<rt>かく</rt></ruby>",expected:"<ruby>書<rt>か</rt></ruby>く"},
 {name:"past tense verb",src:"<ruby>行った<rt>いった</rt></ruby>",expected:"<ruby>行<rt>い</rt></ruby>った"},
 {name:"two kanji expressions",src:"<ruby>承認・認可<rt>しょうにん・にんか</rt></ruby>",expected:"<ruby>承認<rt>しょうにん</rt></ruby>・<ruby>認可<rt>にんか</rt></ruby>"},
 {name:"kanji compound",src:"<ruby>東京<rt>とうきょう</rt></ruby>",expected:"<ruby>東京<rt>とうきょう</rt></ruby>"},
 {name:"plain kana untouched",src:"食べる、りんご、コンビニ",expected:"食べる、りんご、コンビニ"}
];
for(const test of samples){
 const actual=render(test.src);
 assert.equal(actual,test.expected,test.name);
 console.log("✓ ruby renderer: "+test.name);
}
console.log("PASS — "+samples.length+" original renderer regression cases");

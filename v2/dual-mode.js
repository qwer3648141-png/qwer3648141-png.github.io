/* ENJP Ocean 2.0 Phase 1: dual-mode navigation over existing courses.
 * Intentional: does not replace legacy state, scores, voices, or lessons.
 */
(function(){
  "use strict";
  var KEY="enjpV2InterfacePrefs";
  var pref={mode:"learn",font:"normal",ruby:"show"};
  try{
    var data=JSON.parse(localStorage.getItem(KEY)||"{}");
    if(data&&typeof data==="object")pref=Object.assign(pref,data);
  }catch(_){}
  if(!["learn","quick"].includes(pref.mode))pref.mode="learn";
  if(!["normal","large","xlarge"].includes(pref.font))pref.font="normal";
  if(!["show","hide"].includes(pref.ruby))pref.ruby="show";
  var actions={
    learn:[
      {id:"daily",title:"🌅 完整每日作業",sub:"30 組英日配對、5 文法、聽力與短文"},
      {id:"verb-learn",title:"📘 動詞變化教室",sub:"三類動詞、五段換段與實戰"},
      {id:"adj-learn",title:"🌷 形容詞完整學習",sub:"い形、な形與例句活用"},
      {id:"grammar-learn",title:"📚 N5～N3 文法",sub:"依程度理解接續規則與例句"},
      {id:"v2-review",title:"🧠 智慧複習中心",sub:"依到期日期補複習，或探索新題"},
      {id:"chapters",title:"🌊 30 章英日單字",sub:"挑主題完整學習"},
      {id:"library",title:"🔎 英日單字資料庫",sub:"查找單字、例句和發音"},
      {id:"review",title:"🧠 智慧複習中心",sub:"跨日到期題目與批次練習"},
      {id:"settings",title:"⚙️ 設定與備份",sub:"音色、語速與學習進度"}
    ],
    quick:[
      {id:"drill",title:"⚡ 英日智慧闖關",sub:"立即開始主動回想"},
      {id:"verb-quick",title:"✍️ 動詞變化特訓",sub:"三類動詞輸入變化"},
      {id:"adj-quick",title:"✍️ 形容詞變化特訓",sub:"い形、な形獨立練習"},
      {id:"grammar-N5",title:"🎯 N5 文法 10 題",sub:"基礎文法雙向測驗"},
      {id:"grammar-N4",title:"🎯 N4 文法 10 題",sub:"中階文法雙向測驗"},
      {id:"grammar-N3",title:"🎯 N3 文法 10 題",sub:"進階文法雙向測驗"},
      {id:"v2-review",title:"🧠 到期與批次複習",sub:"選 10、20、30 或 50 題複習"},
      {id:"review",title:"🧠 智慧批次複習",sub:"10／20／30 題或最多 100 題"},
      {id:"focus",title:"💪 弱項衝刺",sub:"優先練習低熟練項目"},
      {id:"listen",title:"🎧 英日聽力挑戰",sub:"先聽再回答"},
      {id:"match",title:"🔄 配對競速",sub:"英日詞彙配對反應練習"}
    ]
  };
  function save(){try{localStorage.setItem(KEY,JSON.stringify(pref))}catch(_){}}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
  function stats(){
    try{
      var lex=typeof LEX_WORDS==="function"?LEX_WORDS().length:"—";
      var grammar=typeof grammarBank!=="undefined"?grammarBank.length:"—";
      return "沿用正式版教材："+lex+" 個動詞／形容詞、"+grammar+" 個文法點。2.0 導覽測試中，原本選單仍完整保留。";
    }catch(_){return "2.0 導覽測試中；原本選單仍完整保留。"}
  }
  function applyPrefs(){
    document.body.classList.toggle("enjp-v2-font-large",pref.font==="large");
    document.body.classList.toggle("enjp-v2-font-xlarge",pref.font==="xlarge");
    document.body.classList.toggle("enjp-v2-hide-ruby",pref.ruby==="hide");
  }
  function render(){
    var box=document.getElementById("v2ModeShelf");if(!box)return;
    box.querySelectorAll("[data-v2-mode]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.v2Mode===pref.mode))});
    var list=box.querySelector(".v2-actions");list.innerHTML=actions[pref.mode].map(function(a){
      return '<button type="button" class="v2-action" data-v2-go="'+escapeHtml(a.id)+'"><b>'+escapeHtml(a.title)+'</b><span>'+escapeHtml(a.sub)+'</span></button>';
    }).join("");
    box.querySelector("[data-v2-description]").textContent=pref.mode==="learn"?
      "先理解與閱讀，再練習；所有既有功能照常運作。":"直接開始答題；學不懂時可立即切回完整學習。";
    box.querySelector("[data-v2-font]").value=pref.font;
    box.querySelector("[data-v2-ruby]").value=pref.ruby;
    box.querySelector("[data-v2-status]").textContent=stats();
    applyPrefs();
  }
  function navigate(id){
    if(id==="v2-review"){if(window.ENJP_V2_REVIEW_UI)window.ENJP_V2_REVIEW_UI.open();return;}
    if(typeof setScreen!=="function")return;
    if(id==="review"){
      setScreen("home");
      if(window.ENJP_V2_REVIEW_HUB)window.ENJP_V2_REVIEW_HUB.open();
      return;
    }
    if(id==="verb-learn"||id==="verb-quick"){
      if(typeof lexState!=="undefined"){
        lexState.filterKind="verb";
        lexState.topic="all";
        lexState.mode=id==="verb-learn"?"verblab":"conjugation";
        if(typeof lexSave==="function")lexSave();
      }
      setScreen("lextrain");
      return;
    }
    if(id==="adj-learn"||id==="adj-quick"){
      if(typeof lexState!=="undefined"){
        lexState.filterKind="adj";
        lexState.topic="all";
        lexState.mode=id==="adj-learn"?"browse":"conjugation";
        if(typeof lexSave==="function")lexSave();
      }
      setScreen("lextrain");
      return;
    }
    if(id==="grammar-learn"){
      setScreen("grammar");
      if(typeof grammarFilter!=="undefined"){grammarFilter="all";renderGrammar();
        document.querySelectorAll(".grammar-filter").forEach(function(b){b.classList.toggle("active",b.dataset.gfilter==="all")});
      }
      return;
    }
    if(/^grammar-N[345]$/.test(id)){
      setScreen("grammar");
      if(typeof startGrammarQuiz==="function")startGrammarQuiz(false,10,"normal",id.slice(-2));
      return;
    }
    setScreen(id);
  }
  function init(){
    var track=document.getElementById("trackSwitcher"),nav=document.getElementById("nav");
    if(!track||!nav||document.getElementById("v2ModeShelf"))return;
    var box=document.createElement("section");
    box.id="v2ModeShelf";
    box.setAttribute("aria-label","ENJP Ocean 2.0 雙模式學習導航");
    box.innerHTML='<div class="v2-head"><div><div class="v2-kicker">ENJP OCEAN 2.0 · PHASE 1</div>'+
      '<h2>今晚想怎麼學？</h2><p class="v2-caption" data-v2-description></p></div>'+
      '<div class="v2-toggle" role="group" aria-label="選擇學習模式">'+
      '<button type="button" class="v2-switch" data-v2-mode="learn" aria-pressed="true">📚 完整學習</button>'+
      '<button type="button" class="v2-switch" data-v2-mode="quick" aria-pressed="false">⚡ 快速特訓</button></div></div>'+
      '<div class="v2-actions" aria-label="學習捷徑"></div>'+
      '<div class="v2-settings"><label>文字大小 <select data-v2-font aria-label="文字大小"><option value="normal">標準</option><option value="large">放大</option><option value="xlarge">特大</option></select></label>'+
      '<label>漢字注音 <select data-v2-ruby aria-label="漢字注音"><option value="show">顯示</option><option value="hide">練習隱藏</option></select></label></div>'+
      '<p class="v2-status" data-v2-status role="status"></p>';
    track.insertAdjacentElement("afterend",box);
    box.addEventListener("click",function(e){
      var m=e.target.closest("[data-v2-mode]");if(m){pref.mode=m.dataset.v2Mode;save();render();return}
      var a=e.target.closest("[data-v2-go]");if(a)navigate(a.dataset.v2Go);
    });
    box.addEventListener("change",function(e){
      if(e.target.matches("[data-v2-font]"))pref.font=e.target.value;
      if(e.target.matches("[data-v2-ruby]"))pref.ruby=e.target.value;
      save();render();
    });
    render();
    window.ENJP_V2_INTERFACE={version:"2.0-phase2",readPreferences:function(){return Object.assign({},pref)},open:navigate};
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();

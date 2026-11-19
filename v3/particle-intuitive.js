"use strict";
/* ENJP Ocean · 3.8.2 intuitive particle teaching bridge.
 * TUFS Japanese grammar pedagogy: https://www.coelang.tufs.ac.jp/modules/ja/gmod/courses/c02/lesson28/step1/explanation/095.html
 * No storage or learner identity.  All examples below are newly written.
 */
(function(){
 const A=window.ENJP_Audio;if(!A)return;
 const scenes=[
 {id:"ni",base:"に",title:"目的地／存在／對象",short:"去日本、在某處有東西、向某人說",
   detail:"在「行く」裡，に標示目的地。加 は 突出某個目的地，加 も 表示另外也去。",
   lines:[
    ["東京（とうきょう）に行（い）きます。","我要去東京。","只說去哪裡，沒有額外比較。"],
    ["東京（とうきょう）には行（い）きますが、大阪（おおさか）には行（い）きません。","東京我會去，但大阪不會去。","東京 ✓／大阪 ✕：用 は 明確對比目的地。"],
    ["京都（きょうと）にも行（い）きます。","京都我也會去。","前面已經提過其他目的地，現在把京都再加進去。"]
   ]},
 {id:"de",base:"で",title:"動作發生地點／使用手段",short:"在圖書館讀書、搭車、用手機",
   detail:"で 表示讀書這個動作發生在哪裡。加 は 把這個場合提出來說，加 も 就是『也在這裡做』。",
   lines:[
    ["図書館（としょかん）で勉強（べんきょう）します。","我在圖書館讀書。","只是交代讀書的地點。"],
    ["図書館（としょかん）では勉強（べんきょう）しますが、家（いえ）ではゲームをします。","在圖書館我會讀書，但在家則玩遊戲。","図書館和家做比較：一個讀書、一個玩遊戲。"],
    ["図書館（としょかん）でも勉強（べんきょう）します。","我也會在圖書館讀書。","除了其他地方，圖書館也是學習地點。"]
   ]},
 {id:"e",base:"へ",title:"移動方向／前往的地方",short:"去東京、往車站方向",
   detail:"へ 表示移動方向或目的地。へは 把該方向提出來；移動動詞中『東京には行く』和『東京へは行く』都自然，語感差異往往很小。",
   lines:[
    ["京都（きょうと）へ行（い）きます。","我要去京都。","中性表示前往京都。"],
    ["京都（きょうと）へは行（い）きますが、大阪（おおさか）へは行（い）きません。","京都我會去，但大阪不去。","把兩個前往的方向作對比。"],
    ["京都（きょうと）へも行（い）きます。","京都我也會去。","另一個目的地也包括京都。"]
   ]},
 {id:"to",base:"と",title:"和誰一起／說話對象",short:"跟老師談話、和朋友出門",
   detail:"這裡的 と 表示『和誰』一起做事。とは 把這個人提出來做比較；とも 表示『也和這個人』。另外『幸せとは？』屬於定義用法，另有規則。",
   lines:[
    ["先生（せんせい）と話（はな）しました。","我和老師說話了。","單純交代對話對象。"],
    ["先生（せんせい）とは話（はな）しましたが、部長（ぶちょう）とは話（はな）していません。","我跟老師談過，但還沒跟部長談。","老師 ✓／部長 ✕：對比談話對象。"],
    ["先生（せんせい）とも話（はな）しました。","我也和老師談過。","不只別人，老師也是談話對象。"]
   ]}
 ];
 const pitfalls=[
   {title:"陷阱①：には vs では，不是隨便交換",desc:"『有／在』通常找 に；『做什麼動作』通常找 で。後面的 は 沒有改變這個基本搭配。",examples:[
    ["家（いえ）には猫（ねこ）がいます。","我家有貓。（貓在哪裡存在 → に）"],
    ["家（いえ）では猫（ねこ）と遊（あそ）びます。","我在家跟貓玩。（在哪裡做動作 → で）"]]},
   {title:"陷阱②：には vs にも，聽的是『對比』還是『也』",desc:"用 は 是把這個人／地方特別提出來；用 も 是說『也包含這個人／地方』。有沒有上下文會影響整句語氣。",examples:[
    ["先生（せんせい）には話（はな）しましたが、友達（ともだち）にはまだ話（はな）していません。","我已告訴老師，但還沒告訴朋友。（對比）"],
    ["友達（ともだち）にも話（はな）しました。","我也告訴朋友了。（追加）"]]},
   {title:"陷阱③：では／とは還有其他意思",desc:"『では、始めましょう』的では表示『那麼』；『幸せとは何ですか』是在問定義。不能每句都翻成『在……的話』。",examples:[
    ["では、始（はじ）めましょう。","那麼，我們開始吧。"],
    ["幸（しあわ）せとは何（なん）ですか。","所謂幸福是什麼？"]]}
 ];
 const tests=[
 {q:"已經告訴媽媽了，現在要說『我也告訴老師了』，哪一句最符合？",
  opts:["先生（せんせい）には話（はな）しました。","先生（せんせい）にも話（はな）しました。","先生（せんせい）では話（はな）しました。"],right:1,
  why:"『老師也包括在告知對象』→ に（對象）＋も（也）。"},
 {q:"要說『圖書館讀書，但家裡玩遊戲』，哪個最自然？",
  opts:["図書館（としょかん）に勉強（べんきょう）しますが、家（いえ）にゲームをします。",
        "図書館（としょかん）では勉強（べんきょう）しますが、家（いえ）ではゲームをします。",
        "図書館（としょかん）へは勉強（べんきょう）します。"],right:1,
  why:"讀書、玩遊戲是動作，發生地點用 で；拿兩個地方對比再加 は。"},
 {q:"『我家有貓』，該選哪個？",
  opts:["家（いえ）では猫（ねこ）がいます。","家（いえ）へは猫（ねこ）がいます。","家（いえ）には猫（ねこ）がいます。"],right:2,
  why:"います 表示生物存在的場所，應用 に；此處 には 很自然，主題是『我家』。"},
 {q:"『京都會去，但大阪不去』，下列哪個符合對比？",
  opts:["京都（きょうと）へは行（い）きますが、大阪（おおさか）へは行（い）きません。",
        "京都（きょうと）へも行（い）きます。",
        "京都（きょうと）で行（い）きます。"],right:0,
  why:"前往目的地是 へ／に；比較京都與大阪時可以加 は。京都には行きます也自然。"},
 {q:"『我跟老師也談過了』，想突出『也包括老師』怎麼說？",
  opts:["先生（せんせい）とは話（はな）しました。","先生（せんせい）とも話（はな）しました。","先生（せんせい）では話（はな）しました。"],right:1,
  why:"和誰說話用 と；老師『也』在談話對象中，所以用 とも。"}
 ];
 const e=(tag,cls,value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n};
 const button=(value,cls="pbi-button")=>{const n=e("button",cls,value);n.type="button";return n};
 const jp=(host,text,cls="pbi-japanese")=>{const x=e("p",cls);x.append(A.makeRuby(text));host.append(x);return x};
 const voice=(host,text)=>{
   const row=e("div","pbi-voice"),b=button("🔊 聽日文","pbi-speak"),status=e("span","pbi-status","");
   status.setAttribute("role","status");
   if(!A.spokenJapanese(text)){b.disabled=true;b.title="此句讀音需要校對"}
   else b.addEventListener("click",()=>A.play(text,"jp",b,status));
   row.append(b,status);host.append(row);
 };
 const sentence=(host,arr)=>{
   const n=e("div","pbi-sentence");
   jp(n,arr[0]);n.append(e("p","pbi-cn",arr[1]));
   if(arr[2])n.append(e("p","pbi-note",arr[2]));
   voice(n,arr[0]);host.append(n);
 };
 function comparison(host,scene){
   const shell=e("section","pbi-comparison");
   shell.append(e("h3","pbi-subtitle",scene.base+"｜"+scene.title),
     e("p","pbi-tips",scene.detail));
   const cols=e("div","pbi-cards");
   for(const [i,arr]of scene.lines.entries()){
     const card=e("article","pbi-case");
     card.append(e("span","pbi-chip",["① 原本助詞｜單純交代","② ＋は｜提出話題／對比","③ ＋も｜另外也包括"][i]));
     sentence(card,arr);cols.append(card);
   }
   shell.append(cols);host.append(shell);
 }
 function trapCards(host){
   host.append(e("h3","pbi-subtitle","⚠️ 最容易混淆的三件事"));
   for(const x of pitfalls){
     const d=e("details","pbi-trap");
     d.append(e("summary","",x.title),e("p","pbi-tips",x.desc));
     for(const arr of x.examples)sentence(d,arr);
     host.append(d);
   }
 }
 function practice(host){
   const root=e("section","pbi-practice");
   root.append(e("h3","pbi-subtitle","🎯 先練 5 題，確認真的分得出來"),
     e("p","pbi-tips","題目會給你說話情境，選擇意思最貼近的句子。本次結果只會顯示在畫面上。"));
   let current=0,correct=0,answered=false;
   const area=e("div","pbi-qa"),status=e("p","pbi-status");
   const restart=button("重新練 5 題");restart.hidden=true;
   restart.addEventListener("click",()=>{current=0;correct=0;answered=false;restart.hidden=true;draw()});
   function draw(){
     area.replaceChildren();answered=false;
     if(current===tests.length){
       status.textContent="完成！本次答對 "+correct+" / "+tests.length+" 題。";
       restart.hidden=false;return;
     }
     const test=tests[current];
     status.textContent="第 "+(current+1)+" / "+tests.length+" 題｜本次已答對 "+correct+" 題";
     area.append(e("h4","pbi-question",test.q));
     const options=e("div","pbi-answers"),feedback=e("div","pbi-feedback"),next=button("下一題 →");
     next.disabled=true;next.textContent=current===tests.length-1?"查看本次結果":"下一題 →";
     test.opts.forEach((txt,i)=>{
       const b=button("","pbi-answer");jp(b,txt,"pbi-option-jp");
       b.addEventListener("click",()=>{
         if(answered)return;answered=true;
         const ok=i===test.right;if(ok)correct++;
         for(const [j,child]of [...options.children].entries()){
           child.disabled=true;if(j===test.right)child.classList.add("correct");
           else if(j===i)child.classList.add("incorrect");
         }
         feedback.append(e("strong","",ok?"✅ 你選對了":"❌ 正確是第 "+(test.right+1)+" 句"),
           e("p","",test.why));
         next.disabled=false;
       });options.append(b);
     });
     next.addEventListener("click",()=>{if(!answered)return;current++;draw()});
     area.append(options,feedback,next);
   }
   draw();root.append(status,area,restart);host.append(root);
 }
 function references(host){
   const block=e("p","pbi-references","學習參考：");
   for(const [label,url]of [
     ["東京外國語大學｜は・も 的功能","https://www.coelang.tufs.ac.jp/ja/zt/gmod/courses/c02/lesson28/step1/explanation/095.html"],
     ["東京外國語大學｜格助詞 に・で・へ・と","https://www.coelang.tufs.ac.jp/modules/ja/gmod/contents/explanation/053.html"]
   ]){
     const link=e("a","",label);link.href=url;link.target="_blank";link.rel="noopener noreferrer";block.append(link);
   }
   host.append(block);
 }
 function render(host){
   host.append(e("h3","pbi-heading","不背抽象公式！先看『同一句話，換助詞會發生什麼事』"),
     e("p","pbi-tips","先抓住一件事：に／で／へ／と 表示目的地、動作場所、方向或對象；後面加『は』是把它提出來談（常帶對比），加『も』是把它也算進去。"));
   const key=e("div","pbi-keys");
   for(const [a,b,c]of [
     ["① 只有 に／で／へ／と","中性描述","只交代『在哪、去哪、跟誰』"],
     ["② ＋は","提起／對比","說『這個地方／對象的話……』，不一定排除別處"],
     ["③ ＋も","追加／也","說『除此之外，這個也算』"]
   ]){
     const card=e("div","pbi-key");card.append(e("strong","",a),e("b","",b),e("small","",c));key.append(card);
   }
   host.append(key);
   host.append(e("h3","pbi-subtitle","👇 點選你想比較的助詞"));
   const tabs=e("div","pbi-tabs");tabs.setAttribute("role","group");tabs.setAttribute("aria-label","基本助詞情境對照");
   const area=e("div","pbi-live");
   function show(id){
     area.replaceChildren();comparison(area,scenes.find(x=>x.id===id));
     for(const child of tabs.children)child.setAttribute("aria-pressed",String(child.dataset.kind===id));
   }
   for(const x of scenes){
     const b=button(x.base+"｜"+x.title,"pbi-tab");b.dataset.kind=x.id;
     b.addEventListener("click",()=>show(x.id));tabs.append(b);
   }
   host.append(tabs,area);show("de");
   const important=e("section","pbi-important");
   important.append(e("h3","pbi-subtitle","⭐ 『には』與『では』，為什麼不能隨便換？"),
     e("p","pbi-tips","這兩句都提到『家』，但不是同一種意思。動詞決定了基本助詞。"));
   sentence(important,["家（いえ）には猫（ねこ）がいます。","家裡有貓。","有沒有東西／人存在 → に。"]);
   sentence(important,["家（いえ）では猫（ねこ）と遊（あそ）びます。","在家會跟貓玩。","動作在什麼地方發生 → で。"]);
   host.append(important);
   trapCards(host);practice(host);references(host);return true;
 }
 function renderGroup(host,g){
   const scene=scenes.find(x=>x.base===g.base);
   if(!scene)return false;
   const block=e("section","pbi-group");
   block.append(e("h3","pbi-subtitle","先看整句才懂："+g.base+"／"+g.base+"は／"+g.base+"も"),
     e("p","pbi-tips","如果只看『"+g.form+"＝某某意思』容易誤會。請先比較同一情境的三句。"));
   comparison(block,scene);host.append(block);return true;
 }
 window.ENJP_ParticleIntuitive={render,renderGroup,scenes,pitfalls,tests};
})();

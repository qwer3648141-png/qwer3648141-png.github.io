"use strict";
/* ENJP Ocean 3.0 course map. Navigation is separate from lesson content and legacy saves. */
(function(){
  const section=(id,title)=>({id,title});
  const chapter=(id,title,summary,items)=>({id,title,summary,sections:items.map(([id,name])=>section(id,name))});
  const jp={
    N5:[
      chapter("n5-sounds","01｜日文發音與文字","先掌握假名，建立正確的發音基礎",[["jp-hira","平假名與基本發音"],["jp-kata","片假名與外來語"],["jp-sound","長音、促音與拗音"]]),
      chapter("n5-sentence","02｜基礎句型與助詞","先懂句子結構，再進入文法",[["jp-basic","です／ます 基礎句型"],["jp-particles","は・が・を・に・で"],["jp-question","疑問句、否定與過去"]]),
      chapter("n5-verbs","03｜第一、二、三類動詞","用例句理解動詞分類與變化",[["jp-verbs","動詞分類與常用動詞"],["jp-masu","ます形與辭書形"],["jp-te","て形與基本應用"]]),
      chapter("n5-adj","04｜形容詞與描述","分清 い、な形容詞",[["jp-adj-i","い形容詞"],["jp-adj-na","な形容詞"],["jp-adj-change","形容詞否定與過去"]]),
      chapter("n5-life","05｜日常生活單字","讓單字走進情境",[["jp-numbers","數字、時間、日期"],["jp-shopping","購物與價格"],["jp-meals","餐廳與飲食"]]),
      chapter("n5-apply","06｜N5 綜合練習","聽、讀、理解一起練習",[["jp-n5-listen","慢速對話聽力"],["jp-n5-read","短文閱讀"]])
    ],
    N4:[
      chapter("n4-verbs","01｜動詞變化進階","否定、過去、可能與意向",[["jp-n4-nai","ない形"],["jp-n4-ta","た形"],["jp-n4-potential","可能形"],["jp-n4-volition","意向形"]]),
      chapter("n4-requests","02｜請求、許可與禁止","常見的日常對話句型",[["jp-n4-request","てください"],["jp-n4-permission","てもいい／てはいけない"],["jp-n4-duty","なければならない"]]),
      chapter("n4-experience","03｜經驗、比較與計畫","更自然地描述自己的生活",[["jp-n4-experience","たことがある"],["jp-n4-compare","より／ほど"],["jp-n4-plan","つもり／予定"]]),
      chapter("n4-condition","04｜條件與原因","掌握常見的邏輯連接",[["jp-n4-if","と／たら／ば"],["jp-n4-reason","ので／のに"],["jp-n4-while","ながら／間に"]]),
      chapter("n4-dialogue","05｜實用情境對話","旅行、工作與交際",[["jp-n4-travel","交通與問路"],["jp-n4-work","職場與請託"]]),
      chapter("n4-review","06｜N4 綜合練習","聽讀與錯題復盤",[["jp-n4-listen","情境聽力"],["jp-n4-read","短文理解"]])
    ],
    N3:[
      chapter("n3-purpose","01｜目的、原因與結果","釐清相似句型的語意差別",[["jp-n3-purpose","ように／ために"],["jp-n3-cause","おかげで／せいで"],["jp-n3-result","ことになる／ことにする"]]),
      chapter("n3-infer","02｜推測與傳聞","從訊息來源推敲語氣",[["jp-n3-seems","ようだ／みたいだ"],["jp-n3-hearsay","そうだ／らしい"],["jp-n3-uncertain","かもしれない／はずだ"]]),
      chapter("n3-contrast","03｜轉折與比較","連接較長的句子",[["jp-n3-contrast","一方で／反面"],["jp-n3-although","にもかかわらず"],["jp-n3-compare","に比べて／ほど"]]),
      chapter("n3-conj","04｜進階動詞與授受","能理解更細緻的行為關係",[["jp-n3-passive","被動與使役"],["jp-n3-give","あげる／くれる／もらう"],["jp-n3-honorific","敬語入門"]]),
      chapter("n3-words","05｜N3 情境單字","職場、社會與抽象詞彙",[["jp-n3-office","職場溝通"],["jp-n3-social","社會與日常議題"]]),
      chapter("n3-apply","06｜N3 閱讀與聽力","整理長篇文章中的重點",[["jp-n3-listen","長篇情境聽力"],["jp-n3-read","文章閱讀與重點摘要"]])
    ]
  };
  const en=[
    chapter("en-start","01｜英文發音與高頻詞","用常見單字與例句打底",[["en-life","生活高頻單字"],["en-work","職場高頻單字"],["en-phrases","常見片語"]]),
    chapter("en-grammar","02｜句型與核心文法","從 be 動詞與時態開始",[["en-basic","基本句型與 be 動詞"],["en-tense","現在式與過去式"],["en-questions","疑問句與否定句"]]),
    chapter("en-life","03｜生活與旅遊情境","把英文帶進實際對話",[["en-restaurant","餐廳點餐"],["en-trip","交通與住宿"],["en-office","職場表達"]]),
    chapter("en-listening","04｜英文聽力與閱讀","短句、對話與資訊理解",[["en-sentences","短句跟讀"],["en-conversations","情境聽力"],["en-reading","短文理解"]])
  ];
  const dual=[
    chapter("dual-words","01｜英日對照入門","一個概念，兩種語言",[["dual-daily","生活英日配對"],["dual-verbs","英日動詞配對"],["dual-phrases","常用片語對照"]]),
    chapter("dual-sentence","02｜雙語例句","比較語序與表達習慣",[["dual-simple","英日基本句"],["dual-office","英日職場句"]]),
    chapter("dual-games","03｜雙語挑戰","以練習鞏固記憶",[["dual-match","配對競速"],["dual-challenge","智慧挑戰"],["dual-weak","弱點衝刺"]]),
    chapter("dual-review","04｜雙語複習","整理弱點並回顧",[["dual-recap","高頻字複習"],["dual-listen","情境聽力"]])
  ];
  const lesson={
    "jp-hira":{type:"jp",title:"平假名與基本發音",items:[
      {term:"あ",reading:"あ",zh:"平假名 a",example:"あさご飯（はん）を食（た）べます。",translation:"早上吃早餐。"},
      {term:"い",reading:"い",zh:"平假名 i",example:"家（いえ）に帰（かえ）ります。",translation:"我回家。"},
      {term:"う",reading:"う",zh:"平假名 u",example:"海（うみ）がきれいです。",translation:"海很漂亮。"}
    ]},
    "jp-kata":{type:"jp",title:"片假名與外來語",items:[
      {term:"アイス",reading:"アイス",zh:"冰淇淋",example:"アイスを食（た）べます。",translation:"我吃冰淇淋。"},
      {term:"コーヒー",reading:"コーヒー",zh:"咖啡",example:"コーヒーを飲（の）みます。",translation:"我喝咖啡。"},
      {term:"ネコ",reading:"ネコ",zh:"貓",example:"ネコが好（す）きです。",translation:"我喜歡貓。"}
    ]},
    "jp-basic":{type:"jp",title:"です／ます 基礎句型",items:[
      {term:"学生",reading:"がくせい",zh:"學生",example:"私（わたし）は学生（がくせい）です。",translation:"我是學生。"},
      {term:"先生",reading:"せんせい",zh:"老師",example:"田中（たなか）さんは先生（せんせい）です。",translation:"田中先生是老師。"},
      {term:"日本語",reading:"にほんご",zh:"日文",example:"日本語（にほんご）を勉強（べんきょう）します。",translation:"我學習日文。"}
    ]},
    "jp-verbs":{type:"jp",title:"動詞分類與常用動詞",items:[
      {term:"食べる",ruby:"食（た）べる",reading:"たべる",zh:"吃｜第二類動詞",example:"朝（あさ）ご飯（はん）を食（た）べます。",translation:"我吃早餐。"},
      {term:"書く",ruby:"書（か）く",reading:"かく",zh:"寫｜第一類動詞",example:"手紙（てがみ）を書（か）きます。",translation:"我寫信。"},
      {term:"する",reading:"する",zh:"做｜第三類動詞",example:"毎日（まいにち）勉強（べんきょう）します。",translation:"我每天學習。"}
    ]},
    "jp-adj-i":{type:"jp",title:"い形容詞",items:[
      {term:"高い",ruby:"高（たか）い",reading:"たかい",zh:"高、昂貴",example:"この本（ほん）は高（たか）いです。",translation:"這本書很貴。"},
      {term:"寒い",ruby:"寒（さむ）い",reading:"さむい",zh:"寒冷",example:"今日（きょう）は寒（さむ）いです。",translation:"今天很冷。"}
    ]},
    "jp-n4-potential":{type:"jp",title:"可能形",items:[
      {term:"話せる",ruby:"話（はな）せる",reading:"はなせる",zh:"會說、能說",example:"日本語（にほんご）が少（すこ）し話（はな）せます。",translation:"我會說一點日文。"},
      {term:"行ける",ruby:"行（い）ける",reading:"いける",zh:"能去",example:"明日（あした）は行（い）けます。",translation:"明天可以去。"}
    ]},
    "jp-n3-purpose":{type:"jp",title:"ように／ために",kind:"grammar",comparison:{
      title:"技能比較｜狀態 vs. 目的",
      intro:"兩者都有「為了」的意思，但表達的焦點不同。",
      parts:[
        {name:"ように",label:"目標狀態",detail:"希望達成某個狀態；常見於可能形、否定形或非意志性變化。"},
        {name:"ために",label:"明確目的",detail:"以明確的目標為目的採取行動；常接意志動詞辭書形。"}
      ]
    },items:[
      {term:"ように",reading:"ように",zh:"為了達到某狀態",usage:"Vない形／可能形 + ように",tip:"重點在想達到或避免的狀態，不只是在說一個計畫。",breakdown:[["忘（わす）れない","不忘記"],["ように","為了避免這個狀態"],["メモします","記下來"]],example:"忘（わす）れないようにメモします。",translation:"為了避免忘記，我會記下來。"},
      {term:"ために",reading:"ために",zh:"為了某個明確目的",usage:"意志動詞辭書形 + ために",tip:"重點是有意識地為特定目的採取行動。",breakdown:[["合格（ごうかく）する","考試合格"],["ために","為了這個目的"],["勉強（べんきょう）します","用功學習"]],example:"合格（ごうかく）するために勉強（べんきょう）します。",translation:"為了考試合格而讀書。"}
    ]},
    "en-life":{type:"en",title:"生活高頻單字",items:[
      {term:"apple",ipa:"/ˈæp.əl/",zh:"蘋果",example:"I eat an apple.",translation:"我吃一顆蘋果。"},
      {term:"water",ipa:"/ˈwɔː.tɚ/",zh:"水",example:"I drink water every day.",translation:"我每天喝水。"},
      {term:"learn",ipa:"/lɝːn/",zh:"學習",example:"I learn English.",translation:"我學英文。"}
    ]},
    "en-basic":{type:"en",title:"基本句型與 be 動詞",items:[
      {term:"am",ipa:"/æm/",zh:"是（搭配 I）",example:"I am a student.",translation:"我是學生。"},
      {term:"is",ipa:"/ɪz/",zh:"是（單數第三人稱）",example:"She is a teacher.",translation:"她是老師。"},
      {term:"are",ipa:"/ɑːr/",zh:"是（搭配 you、複數）",example:"You are welcome.",translation:"不客氣。"}
    ]},
    "dual-daily":{type:"dual",title:"生活英日配對",items:[
      {en:"apple",jp:"りんご",reading:"りんご",zh:"蘋果",enExample:"I eat an apple.",jpExample:"りんごを食（た）べます。",translation:"我吃一顆蘋果。"},
      {en:"water",jp:"水",reading:"みず",zh:"水",enExample:"I drink water.",jpExample:"水（みず）を飲（の）みます。",translation:"我喝水。"},
      {en:"study",jp:"勉強する",ruby:"勉強（べんきょう）する",reading:"べんきょうする",zh:"學習",enExample:"I study every day.",jpExample:"毎日（まいにち）勉強（べんきょう）します。",translation:"我每天學習。"}
    ]}
  };
  window.ENJP_COURSES={jp,en,dual,lesson};
  // Verified Wikimedia Commons image assets; cards without a relevant image remain text-only.
  const exampleImages={
    apple:{src:"https://upload.wikimedia.org/wikipedia/commons/1/1f/Red_apple_on_white_background.jpg",source:"https://commons.wikimedia.org/wiki/File:Red_apple_on_white_background.jpg",alt:"白色背景上的紅蘋果",credit:"Sprinno · Wikimedia Commons",license:"CC0 1.0"},
    water:{src:"https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Glass-of-water.jpg/330px-Glass-of-water.jpg",source:"https://commons.wikimedia.org/wiki/File:Glass-of-water.jpg",alt:"玻璃杯裡裝著半杯清水",credit:"Derek Jensen · Wikimedia Commons",license:"公有領域"},
    coffee:{src:"https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d8/CupofCoffee.jpg/330px-CupofCoffee.jpg",source:"https://commons.wikimedia.org/wiki/File:CupofCoffee.jpg",alt:"碟子上的白色咖啡杯，杯中裝著黑咖啡",credit:"Tijuana Brass · Wikimedia Commons",license:"公有領域"},
    cat:{src:"https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3d/Tabby-cat.jpg/330px-Tabby-cat.jpg",source:"https://commons.wikimedia.org/wiki/File:Tabby-cat.jpg",alt:"一隻灰褐色虎斑貓的近照",credit:"Ubuntuist · Wikimedia Commons",license:"公有領域"}
  };
  window.ENJP_IMAGE_EXAMPLES=Object.freeze({
    "en-life:0":exampleImages.apple,
    "en-life:1":exampleImages.water,
    "jp-kata:1":exampleImages.coffee,
    "jp-kata:2":exampleImages.cat,
    "dual-daily:0":exampleImages.apple,
    "dual-daily:1":exampleImages.water
  });

})();

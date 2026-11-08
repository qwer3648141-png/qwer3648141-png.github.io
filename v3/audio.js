"use strict";
/* Japanese speech uses explicit per-sentence readings; English stays in its own voice. */
(function(){
  const VOICE_LANG={jp:"ja-JP",en:"en-US"};
  const state={active:null,selection:{jp:"",en:""},lastVoiceList:[],status:null};
  const canon=lang=>String(lang||"").replace(/_/g,"-").toLowerCase();
  const matches=(voice,type)=>canon(voice.lang).split("-")[0]===(type==="jp"?"ja":"en");
  function spokenJapanese(annotated){
    const spoken=String(annotated||"").replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2");
    if(/[一-龯々]/.test(spoken))return null; // Never guess an unannotated kanji pronunciation.
    return spoken.replace(/\s+/g," ").trim();
  }
  function makeRuby(annotated){
    const out=document.createElement("span");
    const re=/([一-龯々]+)（([ぁ-ゖー]+)）/g;
    let last=0,m;
    while((m=re.exec(String(annotated||"")))){
      out.append(document.createTextNode(annotated.slice(last,m.index)));
      const ruby=document.createElement("ruby"),rt=document.createElement("rt");
      ruby.append(document.createTextNode(m[1]));rt.textContent=m[2];ruby.append(rt);
      out.append(ruby);last=re.lastIndex;
    }
    out.append(document.createTextNode(annotated.slice(last)));
    return out;
  }
  function voices(type){
    if(!window.speechSynthesis||typeof speechSynthesis.getVoices!=="function")return [];
    try{return speechSynthesis.getVoices().filter(v=>matches(v,type))}catch{return []}
  }
  function setGlobalMessage(message){
    const out=document.getElementById("audio-help");
    if(out)out.textContent=message;
  }
  function refreshVoices(){
    for(const type of ["jp","en"]){
      const select=document.getElementById("voice-"+type);
      if(!select)continue;
      const previous=state.selection[type];
      select.replaceChildren();
      const opt=document.createElement("option");opt.value="";opt.textContent=type==="jp"?"自動選擇日文語音":"Auto English voice";select.append(opt);
      const list=voices(type);
      list.forEach(v=>{const o=document.createElement("option");o.value=v.voiceURI;o.textContent=v.name+" · "+v.lang+(v.localService?" · 裝置":"");select.append(o)});
      if(previous && list.some(v=>v.voiceURI===previous)){select.value=previous}
      else{select.value="";state.selection[type]=""}
    }
  }
  function init(){
    for(const type of ["jp","en"]){
      const select=document.getElementById("voice-"+type);
      if(select)select.addEventListener("change",()=>{state.selection[type]=select.value;setGlobalMessage("語音選擇已更新，請播放單字試聽。")});
    }
    const testJP=document.getElementById("test-jp");
    const testEN=document.getElementById("test-en");
    if(testJP)testJP.addEventListener("click",()=>play("にほんごのはつおんをかくにんします。","jp",testJP,document.getElementById("audio-help")));
    if(testEN)testEN.addEventListener("click",()=>play("This is an English pronunciation test.","en",testEN,document.getElementById("audio-help")));
    if(window.speechSynthesis){
      if(typeof speechSynthesis.addEventListener==="function")speechSynthesis.addEventListener("voiceschanged",refreshVoices);
      else speechSynthesis.onvoiceschanged=refreshVoices;
    }
    refreshVoices();
  }
  function stop(){
    const active=state.active;
    state.active=null;
    if(active && active.button)active.button.textContent=active.label;
    if(window.speechSynthesis)try{speechSynthesis.cancel()}catch{}
  }
  function play(source,type,button,status){
    if(!status)return;
    if(state.active&&state.active.button===button){stop();status.textContent="已停止朗讀";return}
    stop();
    const isJP=type==="jp",text=isJP?spokenJapanese(source):String(source||"").trim();
    if(!text){status.textContent=isJP?"缺少漢字的正確讀音，暫不播放以避免念錯。":"沒有可朗讀的英文內容。";return}
    if(isJP && /[A-Za-z]/.test(text)){status.textContent="日文教材含有未整理的英文內容，請分開播放。";return}
    if(!isJP && /[一-龯々ぁ-ゖァ-ヺ]/.test(text)){status.textContent="英文教材混入日文，已停止混讀。";return}
    if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=="function"){
      status.textContent="這個瀏覽器沒有提供文字朗讀功能。";return
    }
    const all=voices(type);
    const selected=state.selection[type];
    const exact=all.filter(v=>canon(v.lang)===canon(VOICE_LANG[type]));
    const natural=v=>/premium|enhanced|natural|neural|siri|kyoko|otoya|haruka|nanami|jenny|aria|samantha/i.test(v.name);
    const choice=all.find(v=>v.voiceURI===selected) || exact.find(natural) || all.find(natural) || exact.find(v=>v.localService) || exact[0] || all.find(v=>v.localService)||all[0]||null;
    const availableCount=(()=>{try{return speechSynthesis.getVoices().length}catch{return 0}})();
    if(availableCount>0&&!choice){
      status.textContent=isJP?"這台裝置未提供日文朗讀語音。請先安裝日文語音。":"這台裝置未提供英文朗讀語音。請先安裝英文語音。";return
    }
    const u=new SpeechSynthesisUtterance(text);
    u.lang=VOICE_LANG[type];u.rate=isJP?.92:.96;u.pitch=1;
    if(choice)u.voice=choice;
    const label=button?button.textContent:"";
    const current={u,button,label};state.active=current;
    if(button)button.textContent="■ 停止";
    status.textContent=(isJP?"日文":"英文")+"語音："+(choice?choice.name+" · "+choice.lang:"系統選擇中")+"（準備播放）";
    u.onstart=()=>{if(state.active===current)status.textContent="播放中｜"+(choice?choice.name:VOICE_LANG[type])};
    u.onend=()=>{if(state.active!==current)return;if(button)button.textContent=label;state.active=null;status.textContent="朗讀完成"};
    u.onerror=e=>{if(state.active!==current)return;if(button)button.textContent=label;state.active=null;status.textContent="語音失敗："+(e.error||"未知錯誤")+"。可改選另一種語音再試。"};
    try{speechSynthesis.speak(u)}catch(e){if(button)button.textContent=label;state.active=null;status.textContent="無法啟動語音，請檢查裝置朗讀功能。"}
  }
  window.ENJP_Audio={init,play,stop,makeRuby,spokenJapanese,voices,refreshVoices};
})();

"use strict";
/* ENJP Ocean 3.6 voice guard: quality-aware selection, natural-prosody option,
   a reading-safe kana mode, user-controlled speed, and isolated preferences. */
(function(){
  const VOICE_LANG={jp:"ja-JP",en:"en-US"},PREF_KEY="enjpOceanV3VoicePreferencesV1";
  const defaults={jpVoice:"",enVoice:"",jpRate:1,enRate:1,jpMode:"natural"};
  const clamp=(v,min,max,def)=>{const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):def};
  function loadPreferences(){
    try{
      const obj=JSON.parse(window.localStorage?.getItem(PREF_KEY)||"null");
      if(!obj||typeof obj!=="object"||Array.isArray(obj))return {...defaults};
      return {
        jpVoice:typeof obj.jpVoice==="string"?obj.jpVoice:"",
        enVoice:typeof obj.enVoice==="string"?obj.enVoice:"",
        jpRate:clamp(obj.jpRate,.75,1.15,1),
        enRate:clamp(obj.enRate,.75,1.15,1),
        jpMode:obj.jpMode==="reading"?"reading":"natural"
      };
    }catch{return {...defaults}}
  }
  const pref=loadPreferences(),state={active:null};
  const canon=lang=>String(lang||"").replace(/_/g,"-").toLowerCase();
  const matches=(v,type)=>canon(v.lang).split("-")[0]===(type==="jp"?"ja":"en");
  const voiceId=v=>v.voiceURI||v.name+"|"+v.lang;
  function rankVoice(v,type){
    const n=String(v.name||"").toLowerCase(),lang=canon(v.lang);
    let score=lang===canon(VOICE_LANG[type])?30:10;
    if(/(premium|enhanced|natural|neural|高品質|拡張)/i.test(n))score+=90;
    if(type==="jp"&&/(kyoko|otoya|nanami|haruka|mayu|yui|sakura|akari)/i.test(n))score+=26;
    if(type==="en"&&/(samantha|ava|allison|alex|daniel|jenny|aria|zoe|serena|google us english)/i.test(n))score+=25;
    if(v.localService)score+=10;
    if(/(compact|espeak|festival|robot|zarvox|bad news|bells)/i.test(n))score-=90;
    if(v.default)score+=2;
    return score;
  }
  function voices(type){
    if(!window.speechSynthesis||typeof window.speechSynthesis.getVoices!=="function")return [];
    try{return [...window.speechSynthesis.getVoices()].filter(v=>matches(v,type))
      .sort((a,b)=>rankVoice(b,type)-rankVoice(a,type)||String(a.name).localeCompare(String(b.name)))}
    catch{return []}
  }
  function chosenVoice(type){
    const list=voices(type),preferred=pref[type+"Voice"];
    return list.find(v=>voiceId(v)===preferred)||list[0]||null;
  }
  function safeJapanese(annotated){
    const spoken=String(annotated||"").replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2");
    if(/[一-龯々]/.test(spoken))return null; // Do not pronounce unverified kanji.
    return spoken.replace(/\s+/g," ").trim();
  }
  function originalJapanese(annotated){
    // Allow natural prosody only after confirming every kanji has a supplied reading.
    if(!safeJapanese(annotated))return null;
    return String(annotated||"").replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$1")
      .replace(/\s+/g," ").trim();
  }
  function spokenJapanese(annotated){return safeJapanese(annotated)}
  function makeRuby(annotated){
    const text=String(annotated||""),out=document.createElement("span");
    const re=/([一-龯々]+)（([ぁ-ゖー]+)）/g;
    let last=0,m;
    while((m=re.exec(text))){
      out.append(document.createTextNode(text.slice(last,m.index)));
      const ruby=document.createElement("ruby"),rt=document.createElement("rt");
      ruby.append(document.createTextNode(m[1]));rt.textContent=m[2];ruby.append(rt);
      out.append(ruby);last=re.lastIndex;
    }
    out.append(document.createTextNode(text.slice(last)));
    return out;
  }
  function save(){
    try{window.localStorage?.setItem(PREF_KEY,JSON.stringify(pref))}catch{} // Private browsing still usable.
  }
  const $=id=>document.getElementById(id);
  function setGlobalMessage(s){const p=$("audio-help");if(p)p.textContent=s}
  function displayCurrentVoice(){
    const out=$("voice-current");
    if(!out)return;
    const jp=chosenVoice("jp"),en=chosenVoice("en");
    out.textContent="日文："+(jp?jp.name+" ("+jp.lang+")":"未偵測到日文聲線")+"；英文："+(en?en.name+" ("+en.lang+")":"未偵測到英文聲線")+
      "。較自然的音色取決於裝置已安裝的語音，無法由網頁強制產生真人聲音。";
  }
  function refreshVoices(){
    for(const type of ["jp","en"]){
      const select=$("voice-"+type);if(!select)continue;
      const list=voices(type),old=select.value||pref[type+"Voice"];
      select.replaceChildren();
      const o=document.createElement("option");o.value="";o.textContent=type==="jp"?"自動選擇較適合的日文聲線":"Auto choose recommended English voice";
      select.append(o);
      list.forEach((v,i)=>{
        const opt=document.createElement("option");opt.value=voiceId(v);
        opt.textContent=(i===0?"✦ 優先推薦 · ":"")+v.name+" · "+v.lang+
          (/(premium|enhanced|natural|neural)/i.test(v.name)?" · 高品質標示":"")+(v.localService?" · 已安裝":"");
        select.append(opt);
      });
      const prefStillExists=list.some(v=>voiceId(v)===old);
      select.value=prefStillExists?old:""; // Keep saved preference so delayed voices can resolve.
    }
    displayCurrentVoice();
    return {jp:voices("jp").length,en:voices("en").length};
  }
  function stop(){
    const active=state.active;state.active=null;
    if(active?.button)active.button.textContent=active.label;
    if(window.speechSynthesis)try{window.speechSynthesis.cancel()}catch{}
  }
  function play(source,type,button,status,overrideMode){
    if(!status)return;
    if(state.active?.button===button){stop();status.textContent="已停止朗讀";return}
    stop();
    if(type!=="jp"&&type!=="en")return;
    const raw=String(source||""),isJP=type==="jp";
    const useReading=(overrideMode||pref.jpMode)==="reading";
    const spoken=isJP?(useReading?safeJapanese(raw):originalJapanese(raw)):raw.trim();
    if(!spoken){
      status.textContent=isJP?"缺少完整、可核對的漢字讀音，暫停朗讀以避免念錯。":"沒有可播放的英文內容。";
      return;
    }
    if(isJP&&/[A-Za-z]/.test(spoken)){status.textContent="日文內容混入英文，已停止混讀。";return}
    if(!isJP&&/[一-龯々ぁ-ゖァ-ヺ]/.test(spoken)){status.textContent="英文內容混入日文，已停止混讀。";return}
    if(!window.speechSynthesis||typeof window.SpeechSynthesisUtterance!=="function"){
      status.textContent="瀏覽器沒有提供文字朗讀功能。";return;
    }
    const voice=chosenVoice(type);
    if(!voice){
      status.textContent=(isJP?"日文":"英文")+"聲線尚未載入或尚未安裝。請按「重新掃描聲線」，必要時到裝置設定下載相應語音。";
      return;
    }
    const utterance=new window.SpeechSynthesisUtterance(spoken);
    utterance.lang=VOICE_LANG[type];utterance.voice=voice;
    utterance.rate=pref[type+"Rate"];utterance.pitch=1;utterance.volume=1;
    const label=button?.textContent||"";
    const current={utterance,button,label};state.active=current;
    if(button)button.textContent="■ 停止";
    const modeLabel=isJP?(useReading?"讀音優先":"自然語調"):"原聲線";
    status.textContent="準備播放｜"+voice.name+" · "+modeLabel+" · "+utterance.rate.toFixed(2)+"×";
    utterance.onstart=()=>{if(state.active===current)status.textContent="播放中｜"+voice.name+" · "+modeLabel};
    utterance.onend=()=>{if(state.active!==current)return;state.active=null;if(button)button.textContent=label;status.textContent="朗讀完成"};
    utterance.onerror=e=>{
      if(state.active!==current)return;
      state.active=null;if(button)button.textContent=label;
      status.textContent="語音失敗："+(e.error||"未知錯誤")+"。可改選其他聲線，並使用重新掃描。";
    };
    try{window.speechSynthesis.speak(utterance)}
    catch(e){state.active=null;if(button)button.textContent=label;status.textContent="無法啟動語音，請檢查裝置語音設定。"}
  }
  function init(){
    for(const type of ["jp","en"]){
      const select=$("voice-"+type);
      if(select)select.addEventListener("change",()=>{
        pref[type+"Voice"]=select.value;save();stop();refreshVoices();
        setGlobalMessage("已切換"+(type==="jp"?"日文":"英文")+"聲線。請按試聽比較。");
      });
      const rate=$("voice-rate-"+type);
      if(rate){
        rate.value=String(pref[type+"Rate"]);
        rate.addEventListener("change",()=>{
          pref[type+"Rate"]=clamp(rate.value,.75,1.15,1);
          save();stop();setGlobalMessage("語速已調整。請試聽確認。");
        });
      }
    }
    const mode=$("voice-jp-mode");
    if(mode){
      mode.value=pref.jpMode;
      mode.addEventListener("change",()=>{
        pref.jpMode=mode.value==="reading"?"reading":"natural";
        save();stop();
        setGlobalMessage(pref.jpMode==="natural"?
          "自然語調使用原文漢字改善語感，但系統仍有可能讀錯多音字；有疑慮請切成讀音優先。":
          "讀音優先依照教材振假名朗讀，準確性較可控，但語調可能比較平板。");
      });
    }
    const j=$("test-jp"),e=$("test-en"),status=$("audio-help");
    if(j)j.addEventListener("click",()=>play("今日（きょう）はいい天気（てんき）ですね。明日（あした）も一緒（いっしょ）に日本語（にほんご）を勉強（べんきょう）しましょう。","jp",j,status));
    if(e)e.addEventListener("click",()=>play("Good morning! It's a lovely day to practice English together.","en",e,status));
    const scan=$("voice-refresh");
    if(scan)scan.addEventListener("click",()=>{
      const count=refreshVoices();
      setGlobalMessage("聲線重新掃描：日文 "+count.jp+" 種、英文 "+count.en+
        " 種。可在上方選擇並試聽。");
    });
    const old=window.speechSynthesis;
    if(old){
      if(typeof old.addEventListener==="function")old.addEventListener("voiceschanged",refreshVoices);
      else old.onvoiceschanged=refreshVoices;
    }
    refreshVoices();
  }
  window.ENJP_Audio={init,play,stop,makeRuby,spokenJapanese,originalJapanese,voices,refreshVoices,rankVoice};
})();
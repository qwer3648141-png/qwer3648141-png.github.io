# ENJP Ocean 5.1｜形容詞副詞化、〜やすい／にくい、状態変化

## 目的
使用者提出兩組經常混淆的日文句型：「静かに食べます」與「緊張しやすい」，以及「安く緊張」是否自然的疑問。新版提供三堂完整 N5／N4 日語文法教材；沿用既有句子連接教室、振假名、原生語音設定、題目及組句 UI，不重新發明另一套學習紀錄。

## 課程與入口

| 等級 | 課程 ID | 核心規則 | 例句 | 比較句 | 測驗 |
|---|---|---|---:|---:|---:|
| N5 | `jp-link-n5-adverb-action` | な形容詞＋に＋動詞；い形容詞去い＋く＋動詞 | 18 | 4 | 8 |
| N4 | `jp-link-n4-easy-hard` | 動詞ます形去ます＋やすい／にくい | 18 | 4 | 8 |
| N4 | `jp-link-n4-adjective-change` | 〜くなる／〜になる；〜くする／〜にする | 18 | 4 | 8 |

三課共 **54 句原創中日雙語例句、12 個專屬語感對照、24 題選擇練習、3 組互動句子組裝**。資料位於 `v3/adjective-adverb-lessons-data.js`；用 `v3/connection-lessons.js` 登記到原本的 N5／N4「🔗 句子連接教室」。也能從日本語模式首頁 N5／N4 快捷入口與 URL hash 進入：
- `v3/index.html#jp-link-n5-adverb-action`
- `v3/index.html#jp-link-n4-easy-hard`
- `v3/index.html#jp-link-n4-adjective-change`

## 需要準確維持的教學區別

- **静かに話す**：な形容詞 `静か`＋`に` 修飾動詞；**静かで、快適です**：`で` 連接描述，不是修飾動作。
- **早く起きる**：い形容詞 `早い` 去掉末尾 `い`＋`く`；**速くて便利です**：`くて` 連接敘述。例外 `いい→よく`；雖然寫作「綺麗」以 `い` 結尾讀 `きれい`，仍是 な形容詞。
- **緊張しやすい**：`緊張する→緊張します→緊張し＋やすい`；同理 `話す→話します→話しにくい`。形成後整體視作い形容詞：`緊張しやすくない`、`緊張しやすかった`、`緊張しやすくなった`，與 `緊張しにくくなった` 反向比較。
- **安く緊張する** 不等於容易緊張。「安い→安く」表示與便宜／價格相關的方式，錯誤地拿來代替「やすい」。區分 `話しにくい` 泛指難以說話與 `話しづらい` 常帶心理等主觀難處。
- **静かになる／静かにする** 分別指狀態變安靜／使其安靜；**安くなる／安くする** 是價格變低／主動調低。和動詞組成的形容詞 `〜やすい` 也依 `い→くなる` 規則變化。
- 使用者希望所有漢字上方標正確假名、原本就是平假名的部分不重複標；所有例句用原有 `ENJP_Audio` 功能朗讀，不能換成其他音色或寫入舊學習歷史。

## 品質與來源
- 參考 Tae Kim Guide 的副詞形規則 <https://guidetojapanese.org/learn/grammar/adverbs>、容易／難以做的規則 <https://guidetojapanese.org/learn/category/complete-guide/other-useful-expressions/>、JLPT Sensei 的 N4 ～やすい／～にくい 教學 <https://jlptsensei.com/learn-japanese-grammar/やすい-yasui-meaning/>、<https://jlptsensei.com/learn-japanese-grammar/にくい-nikui-meaning/>。
- 上述資料只用於核對文法規則，**54 句雙語例句均為本專案自行寫成，不照抄第三方網站**；標示 N5/N4 是課程編排難度，不聲稱官方固定考題。
- `node v3/verify-connection-lessons.js` 檢查：原本 13 課全部保留、新增 3 課、各 18 句／8 題／4 對照、共 132 句（78 舊＋54 新）／76 題（52 舊＋24 新）、所有漢字讀音、朗讀按鈕、互動答題、組句、URL 入口、手機響應式 CSS 和**只寫入舊句子連接課原本獨立儲存 key `enjpSentenceConnectorQuizV1`**。學習記錄損毀時不覆寫。
- GitHub 僅更新 `feature/enjp-ocean-v2`；不得修改 `main`、舊版教材、複習進度或語音偏好。實際手機 Safari 的音色／版面仍需使用者開網頁驗證。

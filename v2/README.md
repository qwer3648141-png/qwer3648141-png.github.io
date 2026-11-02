# ENJP Ocean 2.0 — 開發規格與盤點

## 狀態與安全界線
- Branch: `feature/enjp-ocean-v2`
- Base main commit: `bc5d1eccb2623aa36ce7a9a0329bf6cb3ebc47ed`
- 此分支隔離開發，不直接部署或合併到正式 `main`。
- 正式版 HTML、30 章英文主題、原有測驗與全部資料均由原分支繼承。Phase 1 在原始檔案只增量加入兩個 v2 靜態資源並修復備份引用。

## 實際程式盤點（2026-11-02）
- `index.html` 1,542,894 bytes / 3,579 lines / 約 254 個具名函式，含 22 個 style 區塊及一個大型內嵌 script。
- `data/chunk0.js` 20,075 bytes。`semiconductor/` 為其他子網站，本輪不修改。
- 已有 screen: home, daily, chapters, cards, drill, match, listen, focus, library, lextrain, grammar, settings。
- 已有功能：30 章主題英日單字與每日作業（30 詞／5 文法／聽力／閱讀／測驗）、語法分級、動詞形容詞學習館、三類動詞變化、英日 TTS、間隔複習、能力熟練度、匯入匯出、自我檢查。
- 現行儲存：`enjpQuestState`、`enjpLexTrainerV1`、`enjpVerbConjugationV1`、`enjpMatchBest*`、`enjpSafetyBackup`。新增 V2 設定在 `enjpV2InterfacePrefs`，不覆寫既有學習進度。
- 原版備份程式引用未定義的 `lexProgress`、`LEX_KEY`，Phase 1 修正為現有進度物件及 key，增加動詞變化進度匯出匯入。
- 仍待專項驗證：單字與文法內容正確率、音檔在 iOS Safari / macOS / Windows 實機播放、不同漢字讀音及原版本機儲存遷移。

## Phase 1 已完成（開發分支）
1. 顯示「完整學習／快速特訓」兩種入口，使用現有頁面與題庫，不重建資料。
2. 保留全部舊導航。導入動詞變化課、動詞輸入測驗、N4 文法十題、既有聽力與弱點練習。
3. 新增字體／注音顯示偏好（僅新增命名空間，原有紀錄不動）。
4. 修正備份匯出、匯入與重置流程未定義變數的程式錯誤。
5. 保留安全備份後才允許重置；避免備份失敗仍清除資料。

## 分階段後續（未完成，不能視為通過驗收）
- Phase 2: 動詞／形容詞變化細項熟練度、文法連結及閱讀內容品質盤查。
- Phase 3: 統一錯題結構、跨日期掌握度規則、批次複習及舊資料遷移測試。
- Phase 4: 情境對話與日英聽力題庫、播放錯誤診斷、逐句 TTS。
- Phase 5: 漢字-only ruby 全量校對、手機可讀性修正與跨瀏覽器回歸。
- Phase 6: 專用預覽環境、完整自動與實機測試，通過後才提 PR；不得自動 merge main。

## 手動驗收（尚未完成）
- 新增按鈕點擊後前往正確課程；切換模式不影響既有頁面。
- 答題後儲存的 `enjpQuestState`、`enjpLexTrainerV1`、`enjpVerbConjugationV1` 不遺失。
- 匯出 JSON → 匯入備份 → 三套學習進度仍完整。
- iPhone Safari、Mac Safari、Windows Chrome 逐項測試日英語音及 ruby。
- 原本網站自我檢查通過；開發分支與 main diff 只包含預期變更。

## Phase 2 實際新增（2026-11-03，尚未完成整體改版）
- 雙模式捷徑延伸：形容詞完整學習連到既有瀏覽學習、形容詞快速特訓連到既有活用輸入題。
- 文法快速特訓：N5、N4、N3 各自連到原本 `startGrammarQuiz` 的指定等級、十題測驗。這是新入口，不是新增整套文法教材。
- 修正既有訓練：`lexAnswer` 同一題只允許計分一次；`lexMark` 每日最多升一星，保留舊資料與既有星數，不回溯更改既有紀錄。
- 新增 `v2/verify-navigation.js`、`v2/verify-legacy-scoring.js` 與 `v2/verify-ruby-dataset.js`。最新七項 GitHub Actions 檢查均通過：[CI #41487578585](https://github.com/qwer3648141-png/qwer3648141-png.github.io/actions/runs/41487578585)。
- 全資料庫 ruby 自動檢查會保證「表層文字不因轉換被改寫」「不輸出純假名 ruby」。這**不等於每個讀音都有人工校對**。
- `v2/review-core.js` 的細項五星與批次抽題仍處於獨立測試階段，**還沒有改接正式的歷史學習進度**，不得宣稱完整智慧複習已上線。
- 目前沒有手機實機語音、版面測試，也沒有把開發分支合併至 `main`。

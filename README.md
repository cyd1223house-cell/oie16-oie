# 團購文案產生器

這是一個提供團購主使用的 AI 團購內容產生工具。使用者填寫商品、客群、價格、活動期間及平台等資料後，可以透過 Gemini API 直接產生團購素材，或先產生完整 Prompt，再自行貼到 Gemini 使用。

## 目前功能

- 產生 Facebook、Instagram、LINE 團購文案
- 依照不同平台調整文案長度與格式
- 產生商品圖片 Prompt
- 產生短影音 Prompt、分鏡與旁白
- 上傳商品參考圖片，提醒 Gemini 保留商品外觀
- 沒有參考圖片時，避免臆測商品包裝與 Logo
- 產生可直接貼到 Gemini 的完整 Prompt，不消耗 API 額度
- 社群貼文預覽與一鍵複製
- 共用帳號密碼登入保護

## 使用流程

1. 填寫商品介紹、主要賣點與規格。
2. 設定目標客群、團購價格、活動期間及購買網址。
3. 選擇發布平台、文案風格，以及是否需要圖片或影片 Prompt。
4. 選擇以下其中一種產生方式：
   - **AI 直接產生（使用 API）**：網站呼叫 Gemini API 並顯示結果。
   - **產生完整 Prompt（不使用 API）**：複製 Prompt 後自行貼到 Gemini。
5. 如果有選擇商品參考圖，在 Gemini 網頁版使用 Prompt 時，需要另外上傳相同圖片。

## 專案結構

```text
app/          網站頁面與樣式
public/       瀏覽器端互動功能
worker/       登入保護與 Gemini API 串接
prompt/       System Prompt 與輸出格式
.openai/      網站部署設定
```

## 本機執行

需要安裝 Node.js 22.13.0 或更新版本。

```bash
npm install
npm run dev
```

完成後，依照畫面顯示的本機網址開啟網站。

## 環境設定

請在專案根目錄建立 `.env`，並設定：

```plaintext
GEMINI_API_KEY=你的_Gemini_API_Key
AUTH_USERNAME=測試帳號
AUTH_PASSWORD=測試密碼
AUTH_SECRET=自行產生的隨機字串
```

`.env` 已經列入 `.gitignore`，請勿將真正的 API Key、登入密碼或其他機密資料上傳到 GitHub。

## 建置檢查

```bash
npm run build
```

## Prompt 設計概念

Prompt 以使用者輸入的商品與活動資料作為唯一事實來源，禁止自行捏造價格、功效、評價、銷量、認證或個人使用經驗。系統會根據商品與活動類型選擇文案方向，並分別產生適合 Facebook、Instagram 與 LINE 的內容。

API 模式使用固定 JSON 格式，方便程式讀取及顯示；手動 Prompt 模式則要求 Gemini 輸出可直接複製發布的繁體中文成品。

## 小組協作建議

- 使用 GitHub Private Repository 保存程式碼。
- 每個功能建立獨立分支，完成後再合併至 `main`。
- 修改 Prompt 時記錄版本與測試結果。
- 不要在 Issue、Commit 或程式碼中貼上 API Key。
- 正式發布前，確認價格、日期、規格、購買網址及合規提醒。

## 專案狀態

目前為小組討論及 Prompt 測試使用的初期雛形，後續可加入商品資料庫、歷史紀錄、Prompt 版本比較、團主個人語氣設定及開團行事曆等功能。

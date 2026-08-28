"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/app.js";
    script.async = true;
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: `
<header><div><span class="kicker">GROUPBUY STUDIO</span><h1>把商品資料，變成可發布的團購素材</h1><p>一次產出 Facebook、Instagram、LINE 文案，以及一致風格的圖片與短影音 Prompt。</p></div><div id="mode" class="mode">連線確認中</div></header>
<main><form id="form">
<section><h2>1. 商品資料</h2><div class="grid">
<label>商品名稱<input name="name" value="手工檸檬塔禮盒" required></label><label>品牌名稱<input name="brand" value="日光甜點"></label><label>商品類別<input name="category" value="甜點／伴手禮" required></label>
<label class="wide">商品介紹<textarea name="description" required>使用新鮮檸檬製作，搭配酥脆塔皮，冷藏後即可享用。</textarea></label>
<label class="wide">主要賣點（每行一項）<textarea name="points" required>使用新鮮檸檬製作&#10;酸甜清爽&#10;酥脆塔皮&#10;適合下午茶與送禮</textarea></label>
<label class="wide">規格（每行一項）<textarea name="specs">每盒6入&#10;冷藏保存</textarea></label>
<label class="wide">商品參考圖片（最多 3 張）<input id="referenceImages" name="referenceImages" type="file" accept="image/jpeg,image/png,image/webp" multiple><span class="field-help">選填。圖片只用來協助 Gemini 觀察商品外觀並撰寫更精準的 Prompt；貼到外部生成工具時仍需再次附上相同圖片。</span></label>
<div id="referencePreview" class="wide upload-preview" aria-live="polite"><span>尚未選擇圖片</span></div>
</div></section>
<section><h2>2. 客群與活動</h2><div class="grid">
<label>目標客群<input name="audience" value="辦公室團購、甜點愛好者" required></label><label>使用情境<input name="scenario" value="下午茶、節慶送禮" required></label>
<label>原價<input name="originalPrice" type="number" value="520"></label><label>團購價<input name="groupPrice" type="number" value="450" required></label>
<label>開團時間<input name="startAt" type="datetime-local" value="2026-08-20T10:00" required></label><label>結團時間<input name="endAt" type="datetime-local" value="2026-08-25T23:59" required></label>
<label class="wide">優惠規則<input name="promotion" value="滿 1,500 元免運"></label><label class="wide">出貨資訊<input name="shipping" value="結團後 7～10 個工作天依序出貨" required></label><label class="wide">下單連結／方式<input name="url" value="https://example.com/groupbuy" required></label>
</div></section>
<section><h2>3. 產出設定</h2><div class="grid">
<label>活動階段<select name="stage"><option value="OPEN">正式開團</option><option value="PREVIEW">開團預告</option><option value="COUNTDOWN">倒數提醒</option><option value="ARRIVAL">到貨通知</option></select></label>
<label>文案版型<select name="template"><option value="AUTO">自動選擇</option><option value="A_TRUST_REVIEW">信任實測型</option><option value="B_SCENARIO_SOLUTION">情境解決型</option><option value="C_PROMOTION">強促銷型</option><option value="D_STORY_UNBOXING">故事開箱型</option><option value="E_COUNTDOWN">倒數提醒型</option></select></label>
<label>品牌語氣<input name="tone" value="親切、清楚、像熟悉的朋友分享"></label><label>視覺風格<input name="visual" value="明亮自然、精緻甜點攝影、暖色日光"></label>
<fieldset class="wide"><legend>發布平台</legend><label><input type="checkbox" name="platform" value="FACEBOOK" checked> Facebook</label><label><input type="checkbox" name="platform" value="INSTAGRAM" checked> Instagram</label><label><input type="checkbox" name="platform" value="LINE" checked> LINE</label></fieldset>
<fieldset class="wide media-options"><legend>媒體 Prompt 產出</legend>
<label><input type="checkbox" name="generateImage" checked> 產出商品圖片 Prompt</label><label><input type="checkbox" name="generateVideo"> 產出短影音 Prompt</label>
<div class="media-settings"><label>圖片／影片比例<select name="ratio"><option value="4:5">4:5 社群貼文</option><option value="1:1">1:1 方形</option><option value="9:16">9:16 直式短影音</option></select></label><label>提示詞品質<select name="imageQuality"><option value="medium">標準</option><option value="high">細節完整</option><option value="low">精簡草稿</option></select></label><label>影片長度<select name="videoDuration"><option value="4">4 秒</option><option value="6">6 秒</option><option value="8" selected>8 秒</option></select></label></div>
<p class="cost-note">系統只產出可複製的圖片／影片提示詞，不會呼叫付費媒體 API。</p></fieldset>
</div><button id="submit" type="submit">產生團購素材</button><div id="error" role="alert"></div></section>
</form><aside id="result"><div class="placeholder"><strong>等待產生</strong><span>完成左側資料後，結果會出現在這裡。</span></div></aside></main>
<dialog id="postPreview" class="preview-dialog"><div class="preview-dialog-head"><strong id="previewTitle">貼文預覽</strong><button id="closePreview" type="button" aria-label="關閉預覽">關閉</button></div><div id="previewContent"></div></dialog>
` }} />;
}

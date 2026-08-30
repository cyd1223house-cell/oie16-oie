const $=(q)=>document.querySelector(q),form=$("#form"),result=$("#result"),error=$("#error"),submit=$("#submit");
const lines=(v)=>v.split(/\n|、/).map(x=>x.trim()).filter(Boolean);
const iso=(v)=>new Date(v).toISOString();
let referenceImages=[];
fetch("/api/status").then(async r=>{
  const contentType=r.headers.get("content-type");
  if(contentType&&contentType.includes("application/json")){
    return r.json();
  }
  return {mode:"demo",provider:"gemini",model:"gemini-2.5-flash"};
}).then(s=>{$("#mode").textContent=s.mode==="live"?`${s.provider==="gemini"?"Gemini":"OpenAI"} 已連線｜${s.model}`:"示範模式｜尚未設定 API Key"}).catch(()=>{
  $("#mode").textContent="示範模式｜尚未設定 API Key";
});

const actionRow=document.createElement("div");
actionRow.className="generation-actions";
submit.parentNode.insertBefore(actionRow,submit);
actionRow.appendChild(submit);
const promptButton=document.createElement("button");
promptButton.type="button";
promptButton.id="promptOnly";
promptButton.className="secondary-action";
promptButton.textContent="產生完整 Prompt（不使用 API）";
actionRow.appendChild(promptButton);

function loadImage(file){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(new Error(`無法讀取 ${file.name}`));reader.onload=()=>{const image=new Image();image.onerror=()=>reject(new Error(`${file.name} 不是有效圖片`));image.onload=()=>resolve(image);image.src=reader.result};reader.readAsDataURL(file)})}
async function prepareReference(file){
  const image=await loadImage(file),maxSide=1600,scale=Math.min(1,maxSide/Math.max(image.naturalWidth,image.naturalHeight));
  const canvas=document.createElement("canvas");canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale);
  canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height);
  const mimeType=file.type==="image/png"&&file.size<2500000?"image/png":"image/jpeg";
  const dataUrl=canvas.toDataURL(mimeType,mimeType==="image/jpeg"?.88:undefined);
  return {name:file.name,mime_type:mimeType,data:dataUrl.split(",")[1],preview:dataUrl};
}
$("#referenceImages").addEventListener("change",async(event)=>{
  error.textContent="";const files=[...event.target.files].slice(0,3);const preview=$("#referencePreview");preview.innerHTML="<span>圖片處理中…</span>";
  try{referenceImages=await Promise.all(files.map(prepareReference));preview.innerHTML=referenceImages.length?referenceImages.map(item=>`<img src="${item.preview}" alt="${escapeHtml(item.name)}">`).join(""):"<span>尚未選擇圖片</span>"}
  catch(err){referenceImages=[];preview.innerHTML="<span>圖片讀取失敗</span>";error.textContent=err.message}
});

function buildInput(){
  const d=new FormData(form);
  return {prompt_version:"2.0",product:{name:d.get("name"),brand:d.get("brand"),category:d.get("category"),description:d.get("description"),selling_points:lines(d.get("points")),specifications:lines(d.get("specs")),origin_story:"",personal_experience:"",social_proof:[],reference_image_urls:[]},audience:{target_audience:lines(d.get("audience")),usage_scenarios:lines(d.get("scenario")),pain_points:[]},campaign:{stage:d.get("stage"),original_price:d.get("originalPrice")?Number(d.get("originalPrice")):null,group_price:Number(d.get("groupPrice")),currency:"TWD",promotion_rule:d.get("promotion"),stock_message:"",start_at:iso(d.get("startAt")),end_at:iso(d.get("endAt")),shipping_info:d.get("shipping"),purchase_url:d.get("url")},content:{copy_template:d.get("template"),platforms:d.getAll("platform"),brand_tone:d.get("tone"),emoji_level:"LOW",language:"zh-TW"},compliance:{forbidden_claims:["全台最好","保證有效","百分之百有效"],required_phrases:[]},media:{generate_image:d.get("generateImage")==="on",image_ratio:d.get("ratio"),image_quality:d.get("imageQuality"),generate_video:d.get("generateVideo")==="on",video_duration_seconds:Number(d.get("videoDuration")),visual_style:d.get("visual")},reference_images:referenceImages.map(({mime_type,data})=>({mime_type,data}))};
}

function buildPortablePrompt(input){
  const {reference_images:references,...promptInput}=input;
  const count=references.length;
  promptInput.media.reference_images_provided=count>0;
  promptInput.media.reference_image_count=count;
  const referenceInstruction=count
    ? `【參考圖片操作】本次共有 ${count} 張商品參考圖。請先在 Gemini 上傳相同圖片，再貼上本提示詞。必須以附圖商品為唯一主體，維持包裝、Logo、標籤、圖案、比例、材質、顏色與產品形狀一致，不得重新設計商品；只能調整背景、光線、陰影、擺設與構圖。`
    : "【參考圖片操作】本次沒有附商品圖片。請只根據商品資料描述可確認的商品主體，不得臆測 Logo、包裝、顏色、外型或配件。";
  const writingRules=`你是台灣社群團購文案專家。請把下方資料整理成可直接使用的繁體中文成品，不要輸出 JSON、程式碼、欄位名稱、分析過程或技術說明。\n\n事實與語氣規則：\n1. 輸入資料是唯一事實來源，不得捏造價格、折扣、庫存、銷量、評價、產地、認證、功效、使用心得或名人推薦。\n2. 數字、日期、規格、優惠、出貨方式與購買網址必須忠實保留。\n3. 使用台灣自然口語，親切但不油膩，不使用簡體字或中國大陸電商用語。\n4. Facebook 可完整敘事；Instagram 首段簡短並將 hashtags 放最後；LINE 要最精簡，價格、期限和下單方式優先。\n5. 每一篇平台文案都必須是完整成品，可以直接整篇複製發布，不要留下需要人工補寫的括號或占位符。\n6. 如果有圖片或影片需求，請另外產生可直接貼到生成工具的完整提示詞；價格、日期、網址等文字建議以後製疊加，不要求模型在圖中生成大量中文字。`;
  const outputFormat=`請嚴格依照以下人類可閱讀格式輸出，沒有勾選的圖片或影片項目就不要顯示：\n\n【活動標題】\n（完整標題）\n\n【短句主打】\n（短句）\n\n【主要賣點】\n• 每行一項，共 3～6 項\n\n【Facebook 貼文】\n（可直接發布的完整文案；只有使用者有選 Facebook 才輸出）\n\n【Instagram 貼文】\n（可直接發布的完整文案與 hashtags；只有使用者有選 Instagram 才輸出）\n\n【LINE 貼文】\n（可直接發布的完整短版文案；只有使用者有選 LINE 才輸出）\n\n【商品圖片 Prompt】\n（完整提示詞；只有 generate_image=true 才輸出）\n\n【短影音 Prompt】\n（完整提示詞、分鏡與旁白；只有 generate_video=true 才輸出）\n\n【發布前提醒】\n（只有資料缺漏或宣稱風險時才輸出；若沒有問題則省略整段）`;
  return `${writingRules}\n\n===== 商品與活動資料 =====\n${JSON.stringify(promptInput,null,2)}\n\n===== 參考圖片說明 =====\n${referenceInstruction}\n\n===== 輸出格式 =====\n${outputFormat}\n\n最終只交付可直接使用的繁體中文成品，不要輸出 JSON 或解釋。`;
}

const escapeHtml=(s)=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function card(title,body,copyText=""){
  return `<section class="card"><div class="copy-row"><h3>${escapeHtml(title)}</h3>${copyText?`<button class="copy" data-copy="${encodeURIComponent(copyText)}">複製</button>`:""}</div>${body}</section>`;
}
const platformName={FACEBOOK:"Facebook",INSTAGRAM:"Instagram",LINE:"LINE"};
function postCard(post){return `<section class="card"><div class="copy-row"><h3>${escapeHtml(platformName[post.platform]||post.platform)} 文案</h3><div class="card-actions"><button class="preview-post" type="button" data-platform="${escapeHtml(post.platform)}" data-post="${encodeURIComponent(post.full_post)}">預覽</button><button class="copy" type="button" data-copy="${encodeURIComponent(post.full_post)}">複製</button></div></div><div class="post">${escapeHtml(post.full_post)}</div></section>`}
function showPreview(button){
  const platform=button.dataset.platform,text=decodeURIComponent(button.dataset.post),name=platformName[platform]||platform;
  const source=referenceImages[0]?.preview||"";
  const media=source?`<img class="social-media" src="${source}" alt="商品圖片預覽">`:`<div class="social-media-empty">商品圖片預覽區</div>`;
  $("#previewTitle").textContent=`${name} 貼文預覽`;
  $("#previewContent").innerHTML=`<article class="social-preview social-${platform.toLowerCase()}"><header><div class="social-avatar">${escapeHtml(name.slice(0,1))}</div><div><strong>${escapeHtml(form.elements.brand.value||"品牌名稱")}</strong><span>剛剛 · 公開</span></div></header>${media}<div class="social-copy">${escapeHtml(text)}</div><footer><span>♡ 喜歡</span><span>留言</span><span>分享</span></footer></article>`;
  $("#postPreview").showModal();
}
$("#closePreview").addEventListener("click",()=>$("#postPreview").close());
$("#postPreview").addEventListener("click",event=>{if(event.target===$("#postPreview"))$("#postPreview").close()});
function render(data,mode,input){
  const posts=data.platform_versions.map(postCard).join("");
  const warnings=data.compliance_warnings.length?card("發布前提醒",`<ul>${data.compliance_warnings.map(x=>`<li>${escapeHtml(x)}</li>`).join("")}</ul>`):"";
  const referenceMode=referenceImages.length?`有參考圖｜${referenceImages.length} 張商品圖`:`無參考圖｜依商品資料描述主體`;
  const referenceDirective=referenceImages.length?`參考圖模式：使用者會另外附上 ${referenceImages.length} 張商品圖。以附圖商品為唯一主體，保持包裝、Logo、標籤、圖案、比例、材質與顏色一致，不得重新設計商品。`:`無參考圖模式：未附商品圖片，請只依下列商品資料描述可確認的主體，不得臆測Logo、包裝、顏色或配件。`;
  const styleAnchor=`共用視覺風格錨點：${input.media.visual_style}。圖片與影片必須保持相同主要色調、光線方向、背景材質、攝影質感與商品呈現方式。`;
  const imagePrompt=input.media.generate_image?`${referenceDirective}\n${styleAnchor}\n\n${data.image_plan.prompt}\n\n避免事項：${data.image_plan.negative_requirements.join("；")}\n建議比例：${data.image_plan.ratio}\n文字安全區：${data.image_plan.text_safe_area}`:"";
  const videoPrompt=input.media.generate_video?`${referenceDirective}\n${styleAnchor}\n\n${data.video_plan.generation_prompt}\n\n影片長度：${data.video_plan.duration_seconds} 秒\n旁白：${data.video_plan.voiceover}`:"";
  const imageCard=input.media.generate_image?card("商品圖片 Prompt",`<div class="prompt-meta"><span>${escapeHtml(referenceMode)}</span><span>${escapeHtml(input.media.visual_style)}</span></div><p class="prompt-guide">${referenceImages.length?"使用時請把相同商品圖上傳到圖片生成工具，再貼上以下 Prompt。":"可直接貼到圖片生成工具；Prompt 不會假設已有商品圖片。"}</p><div class="media-prompt">${escapeHtml(imagePrompt)}</div>`,imagePrompt):"";
  const videoCard=input.media.generate_video?card("短影音 Prompt",`<div class="prompt-meta"><span>${escapeHtml(referenceMode)}</span><span>與圖片共用視覺風格</span></div><p class="prompt-guide">${referenceImages.length?"使用時請把相同商品圖交給影片工具作為外觀或第一幀參考。":"可直接使用文字生成影片；不會假設已有參考圖。"}</p><div class="media-prompt">${escapeHtml(videoPrompt)}</div>`,videoPrompt):"";
  result.innerHTML=card(data.campaign_title,`<div class="result-head"><p>${escapeHtml(data.short_hook)}</p><span class="template">${escapeHtml(data.selected_template)}｜${mode==="live"?"AI":"DEMO"}</span></div>`)+posts+imageCard+videoCard+(warnings?`<div class="warning">${warnings}</div>`:"");
  document.querySelectorAll(".copy").forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(decodeURIComponent(b.dataset.copy));b.textContent="已複製";setTimeout(()=>b.textContent="複製",900)});
  document.querySelectorAll(".preview-post").forEach(button=>button.onclick=()=>showPreview(button));
}

promptButton.addEventListener("click",async()=>{
  error.textContent="";
  if(!form.reportValidity())return;
  promptButton.disabled=true;promptButton.textContent="整理 Prompt 中…";
  try{
    const input=buildInput();
    const fullPrompt=buildPortablePrompt(input);
    const imageNote=referenceImages.length
      ? `<p class="prompt-guide prompt-alert">你選了 ${referenceImages.length} 張商品圖。複製文字後，請在 Gemini 另外上傳相同圖片，再貼上 Prompt。</p>`
      : `<p class="prompt-guide">這次沒有商品參考圖，可直接將以下文字貼到 Gemini。</p>`;
    result.innerHTML=card("給 Gemini 使用的完整 Prompt",`${imageNote}<div class="prompt-meta"><span>不會呼叫 Gemini API</span><span>Prompt v2.0</span></div><div class="media-prompt full-prompt">${escapeHtml(fullPrompt)}</div>`,fullPrompt);
    document.querySelectorAll(".copy").forEach(b=>b.onclick=async()=>{await navigator.clipboard.writeText(decodeURIComponent(b.dataset.copy));b.textContent="已複製";setTimeout(()=>b.textContent="複製",900)});
    result.scrollIntoView({behavior:"smooth",block:"start"});
  }catch(err){error.textContent=err.message}
  finally{promptButton.disabled=false;promptButton.textContent="產生完整 Prompt（不使用 API）"}
});

form.addEventListener("submit",async(e)=>{
  e.preventDefault();error.textContent="";submit.disabled=true;submit.textContent="產生中…";
  try{
    const request=buildInput();
    const response=await fetch("/api/generate",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(request)});
    const contentType=response.headers.get("content-type");
    if(!contentType||!contentType.includes("application/json")){
      const errorText=await response.text();
      throw new Error(`伺服器回傳非 JSON 格式 (HTTP ${response.status}): ${errorText.slice(0, 150)}`);
    }
    const data=await response.json();
    if(!response.ok)throw new Error([data.error,...(data.details||[])].join("｜"));
    render(data.result,data.mode,request);
  }
  catch(err){error.textContent=err.message}
  finally{submit.disabled=false;submit.textContent="產生團購素材"}
});

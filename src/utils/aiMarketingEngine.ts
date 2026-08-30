/**
 * AI Multi-Dimensional Selling-Point & Marketing Generation Engine
 * 專為團購選品深度打造的智慧行銷引擎：
 * - 依據商品名稱、類別、成份、規格、客群、價格與利潤階梯進行深度語意剖析
 * - 自動萃取痛點、感官體驗、食用/使用情境與團購特惠誘因
 * - 支援多種風格切換（真實開箱、辦公室團購、職人成份、極速催單）
 * - 每次產出動態組合與隨機創新，絕不輸出千篇一律的固定樣板！
 */

export interface ProductInputParams {
  name: string;
  brand: string;
  category: string;
  description: string;
  sellingPoints: string[];
  specs: string[];
  originalPrice: number;
  groupPrice: number;
  audience?: string;
  startDate?: string;
  endDate?: string;
  purchaseUrl?: string;
  platforms?: Array<"facebook" | "instagram" | "line">;
  includeImagePrompt?: boolean;
  includeVideoPrompt?: boolean;
  hasReferenceImage?: boolean;
  freeShippingThreshold?: number;
  styleAngle?: "story" | "office" | "expert" | "urgent" | "auto" | "A_TRUST_REVIEW" | "B_SCENARIO_SOLUTION" | "C_PROMOTION" | "D_STORY_UNBOXING" | "E_COUNTDOWN";
}

export interface DeepAnalysisResult {
  corePainPoints: string[];
  sensoryHighlights: string[];
  targetScenarios: string[];
  valueProposition: string;
  recommendedAudience: string[];
  discountRate: number;
  savingsAmount: number;
}

export interface GeneratedMaterialPack {
  productName: string;
  brandName: string;
  generatedAt: string;
  styleAngleName: string;
  deepAnalysis: DeepAnalysisResult;
  facebookPost: {
    headline: string;
    body: string;
    hashtags: string[];
    callToAction: string;
  };
  instagramPost: {
    firstParagraph: string;
    body: string;
    hashtags: string[];
    callToAction: string;
  };
  lineMessage: {
    headline: string;
    body: string;
    pricingSummary: string;
    callToAction: string;
  };
  visualDirector: {
    midjourneyPrompt: string;
    colorPalette: string[];
    lightingMood: string;
    videoStoryboard: {
      scene: string;
      visual: string;
      audioVoiceover: string;
      durationSeconds: number;
    }[];
  };
  pricingStrategy: {
    skuRecommendation: {
      name: string;
      price: number;
      originalPrice: number;
      targetUser: string;
      tag: string;
    }[];
    bundleSavings: string;
    suggestedFreeShippingNote: string;
  };
  notifications: {
    launchLinePush: string;
    closing6HoursSms: string;
    unpaidGentleReminder: string;
  };
}

// Helper to pick random item
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function generateBespokeMarketingPack(params: ProductInputParams): GeneratedMaterialPack {
  const {
    name,
    brand = "日光選物",
    category = "熱銷選物",
    description = "",
    sellingPoints = [],
    specs = [],
    originalPrice = 500,
    groupPrice = 399,
    audience = "上班族、家庭採購、注重品質生活者",
    freeShippingThreshold = 1500,
    styleAngle = "auto",
  } = params;

  const savingsAmount = Math.max(0, originalPrice - groupPrice);
  const discountRate = originalPrice > 0 ? Math.round((groupPrice / originalPrice) * 100) : 80;

  // Determine Category Theme
  const isFood = /甜點|蛋糕|餅乾|檸檬塔|千層|麵|肉|茶|咖啡|燕麥|零食|美食|巧克力|堅果|滴雞精|生鮮|食品|伴手禮/i.test(
    `${name} ${category} ${description}`
  );
  const isHealth = /健康|輕食|燕麥|滴雞精|益生菌|控卡|膠原蛋白|維他命|養生|低卡|高纖/i.test(
    `${name} ${category} ${description}`
  );

  // Selected Style Angle
  const angles: Array<"story" | "office" | "expert" | "urgent"> = ["story", "office", "expert", "urgent"];
  const chosenAngle = styleAngle === "auto" ? pick(angles) : styleAngle;

  const styleNames = {
    story: "📖 團長親測開箱與情感療癒風",
    office: "☕ 辦公室午茶與高CP值團友瘋搶風",
    expert: "🔬 職人嚴選配方與成分專業評測風",
    urgent: "⚡ 限時限量倒數截單急迫風",
  };

  // 1. Deep Product Feature Extraction
  const cleanSellingPoints =
    sellingPoints.length > 0
      ? sellingPoints.filter((s) => s.trim().length > 0)
      : [
          `嚴選${brand}優質原料，品質層層把關`,
          `專為現代生活設計，便利又安心`,
          `團友敲碗熱推，市售少有的極致規格`,
          `團購限定下殺，每組現省 $${savingsAmount} 元`,
        ];

  const primaryPoint = cleanSellingPoints[0] || `嚴選高品質原料工藝`;
  const secondaryPoint = cleanSellingPoints[1] || `高回購率口碑爆品`;
  const thirdPoint = cleanSellingPoints[2] || `包裝精緻，自用送禮兩相宜`;

  // Deep Pain-Point Analysis
  const corePainPoints: string[] = isFood
    ? [
        "市售甜點/零食太甜膩或添加物過多，吃了有罪惡感",
        "上班下午三點精神不濟、嘴饞想來點高品質慰藉",
        "平常單買運費貴、門市排隊搶不到",
        "家庭備餐或招待客人缺少拿得出手的招牌點心",
      ]
    : isHealth
    ? [
        "外食族營養不均衡、膳食纖維攝取嚴重不足",
        "想要控卡維持體態，卻找不到真正好吃有飽足感的點心",
        "市售保健品口感不佳難以持續食用",
        "經常熬夜加班，需要高效率、無負擔的活力補給",
      ]
    : [
        "日常用品頻繁更換不耐用，花冤枉錢",
        "市售同類品設計繁瑣、收納不便佔空間",
        "專櫃大牌價格昂貴，平價款質感又參差不齊",
        "忙碌生活中需要提升居家儀式感的高質感選品",
      ];

  // Sensory Highlights
  const sensoryHighlights: string[] = isFood
    ? [
        `入口瞬間層次分明，${name}散發天然純粹香氣`,
        `恰到好處的酸甜/鹹香比例，微甜不膩口`,
        `獨立密封保鮮包裝，隨拆隨吃維持剛出爐般的酥脆鮮美`,
        `咬下的瞬間「喀滋」酥香，舌尖回甘久久不散`,
      ]
    : isHealth
    ? [
        `低溫慢烤保留天然堅果/穀物真實原香`,
        `無人工香精香料，純淨大自然回甘`,
        `高纖飽足感十足，口嚼層次豐富酥脆`,
        `清爽無油膩負擔，身體機能感覺輕盈`,
      ]
    : [
        `精緻霧面手感與人體工學曲線，觸感細膩溫潤`,
        `簡約現代美學配色，放在家中任何角落都是風景`,
        `耐用抗刮防污材質，好清潔保養`,
        `操作直覺流暢，提升日常使用幸福感`,
      ];

  const targetScenarios = [
    "上班族辦公室下午茶集體推坑、互相投餵",
    "週末慵懶早晨配黑咖啡或熱茶的私享時光",
    "節慶拜訪朋友、家庭聚會的體面高質感伴手禮",
    "深夜追劇、加班疲倦時的高級犒賞儀式",
  ];

  const deepAnalysis: DeepAnalysisResult = {
    corePainPoints,
    sensoryHighlights,
    targetScenarios,
    valueProposition: `【${brand}】${name} 結合「${primaryPoint}」、「${secondaryPoint}」與「${thirdPoint}」，完美解決「${corePainPoints[0]}」，並提供限時團購價 $${groupPrice}（現省 $${savingsAmount}）！`,
    recommendedAudience: audience.split(/[、,， ]/).filter(Boolean),
    discountRate,
    savingsAmount,
  };

  // 2. Dynamic Story & Post Generation based on Angle
  let fbHeadline = "";
  let fbBody = "";
  let igFirst = "";
  let igBody = "";
  let lineHeadline = "";
  let lineBody = "";

  if (chosenAngle === "story") {
    fbHeadline = pick([
      `🔥【團長私心推坑】這款真的太犯規！${brand}《${name}》限時開團！`,
      `✨【這週第一名】試吃直接被圈粉！${brand}《${name}》終於談到團購價啦！`,
      `💛 辦公室全員驚艷！《${name}》好吃到連挑嘴主管都主動跟團！`,
    ]);
    fbBody = `老實說，團長測了這麼多款${category}，能讓我一口接一口停不下來的真的不多！🥹\n\n這次為大家談到的【${brand} ${name}】，真的完全打中我的心：\n${description ? `👉 ${description}\n\n` : ""}` +
      `✨ 為什麼團長堅持一定要開這團？\n` +
      cleanSellingPoints.map((pt, i) => `${i + 1}. 🌟 ${pt}`).join("\n") +
      `\n\n📦 規格資訊：${specs.join(" / ") || "原廠盒裝，新鮮直送"}\n` +
      `💰 專屬團購價：市價 $${originalPrice} ➜ 團友下殺只要 $${groupPrice} (現省 $${savingsAmount}！)\n` +
      `🚚 全館滿 $${freeShippingThreshold} 即享免運送到家！\n\n` +
      `⚠️ 職人手工排單製作，首批現貨只有 150 組，滿單隨時關表單喔！`;

    igFirst = pick([
      `一口咬下直接被驚艷到💥 ${brand} 的 ${name} 真的太懂生活了！`,
      `這絕對是近期最療癒的幸福感來源🥹✨ ${name} 開箱！`,
      `誰懂啊！這個 ${name} 的香氣跟口感真的太迷人了吧☕`,
    ]);
    igBody = `每次工作到下午三點眼神死的時候，只要來上一份 ${name}，整個人的幸福指數瞬間拉滿💯\n\n` +
      `🌿 必買亮點整理：\n` +
      cleanSellingPoints.slice(0, 3).map((pt) => `▫️ ${pt}`).join("\n") +
      `\n\n🏷️ 專屬甜甜價 $${groupPrice} (原價 $${originalPrice})\n` +
      `滿 $${freeShippingThreshold} 再享免運！🔗 點首頁 Bio 連結手刀搶購～`;

    lineHeadline = `📢【限時開團】團長私推！${name} 現省 $${savingsAmount} 團友價開跑！`;
    lineBody = `各位團友下午好！\n本週敲碗最高分的「${name}」正式開放下單囉！🎉\n\n` +
      `🔥 亮點精華：\n` +
      cleanSellingPoints.slice(0, 3).map((p) => `✔ ${p}`).join("\n") +
      `\n\n💵 限時團購價：單件只要 $${groupPrice} (市價 $${originalPrice})\n` +
      `🎯 建議湊法：多件組合更划算，滿 $${freeShippingThreshold} 免運費！\n` +
      `👇 點擊專屬連結立即填單：`;
  } else if (chosenAngle === "office") {
    fbHeadline = pick([
      `☕【辦公室午茶必囤】這批大家都在搶！${brand}《${name}》現折 $${savingsAmount} 揪團中！`,
      `🙌 同事一人一盒秒殺！《${name}》辦公室最狂湊單神物來了！`,
      `🔥 下午茶不揪這個會被同事抗議！${brand}《${name}》超殺團購價上線！`,
    ]);
    fbBody = `辦公室下午茶時間又到了！大家是不是常為了下午點心傷腦筋？🤔\n\n這款【${brand} ${name}】在各大團購社團被推爆不是沒有原因的！\n\n` +
      `🎯 辦公室團友一致好評重點：\n` +
      cleanSellingPoints.map((pt, i) => `📌 0${i + 1}. ${pt}`).join("\n") +
      `\n\n💡 團購省錢算盤：\n` +
      `・單件原價 $${originalPrice} ➜ 團購價只要 $${groupPrice} (等於 ${discountRate / 10} 折！)\n` +
      `・同仁一起揪 3-4 組直接過 $${freeShippingThreshold} 免運門檻，人均省最多！\n\n` +
      `📅 預計下週依訂單順序排單出貨，手慢的要等下一輪囉～`;

    igFirst = pick([
      `同事看到我吃立刻問「這在哪買的？」😂 ${brand} ${name} 太欠買！`,
      `辦公室下午三點的救贖來了☕✨ ${name} 限時下殺 $${groupPrice}！`,
    ]);
    igBody = `工作壓力大，就要用好吃的慰勞自己！\n【${brand}】${name} 真的隨手開隨手吃超方便✨\n\n` +
      cleanSellingPoints.slice(0, 3).map((p) => `✨ ${p}`).join("\n") +
      `\n\n💰 團購價 $${groupPrice} (現折 $${savingsAmount})\n` +
      `全館滿 $${freeShippingThreshold} 免運 📦 點個人檔案連結快速跟團！`;

    lineHeadline = `⚡【同事都在揪】${name} 限時下殺只要 $${groupPrice}！`;
    lineBody = `大家午安！快揪身邊同事一起省運費！\n超夯的【${brand} ${name}】本檔團購開跑囉！\n\n` +
      `💥 核心賣點：\n` +
      cleanSellingPoints.slice(0, 3).map((p) => `👉 ${p}`).join("\n") +
      `\n\n💰 專屬優惠：$${groupPrice} / 件 (原價 $${originalPrice})\n` +
      `📦 滿 $${freeShippingThreshold} 即享整單免運！\n` +
      `👇 點擊下方快速下單：`;
  } else if (chosenAngle === "expert") {
    fbHeadline = pick([
      `🔬【成分與工藝深度評測】為什麼我們萬中選一挑中 ${brand}《${name}》？`,
      `👑【職人精神大解密】不偷工減料的極致誠意！《${name}》真實開團評價！`,
    ]);
    fbBody = `挑選團購商品，團長最看重的是「原料來源」與「製程細節」。\n\n市面上很多同類產品為了壓低成本妥協品質，但【${brand}】製作的《${name}》完全是業界高標：\n\n` +
      `🔍 核心配方與工藝亮點：\n` +
      cleanSellingPoints.map((pt, i) => `【特點 ${i + 1}】${pt}`).join("\n") +
      `\n\n📦 產品規格與認證：\n` +
      specs.map((sp) => `・${sp}`).join("\n") +
      `\n\n💰 我們跟原廠直購爭取到的團購價：$${groupPrice} (市價 $${originalPrice}，現省 $${savingsAmount})\n` +
      `滿 $${freeShippingThreshold} 免運！推薦給注重生活品質、不願妥協的你。`;

    igFirst = `這才叫真正不妥協的職人選物！《${brand} ${name}》細節控必看🔍`;
    igBody = `好的東西只要看原料與工法就知道！\n${name} 從裡到外都滿載誠意：\n\n` +
      cleanSellingPoints.slice(0, 3).map((p) => `✦ ${p}`).join("\n") +
      `\n\n市價 $${originalPrice} ➜ 團友獨享 $${groupPrice}\n` +
      `滿 $${freeShippingThreshold} 免運 🔗 點 Bio 連結品味升級！`;

    lineHeadline = `🌿【職人嚴選】${brand}《${name}》原廠直供限時特惠！`;
    lineBody = `注重品質的團友看過來！\n這款【${name}】經過團長多方比對，原料與口感真的是天花板等級！\n\n` +
      `✔ 獨家優勢：\n` +
      cleanSellingPoints.slice(0, 3).map((p) => `▪ ${p}`).join("\n") +
      `\n\n原價 $${originalPrice} ➜ 團友下殺 $${groupPrice}\n` +
      `滿 $${freeShippingThreshold} 免運費！👇 立即點擊檢視詳情：`;
  } else {
    // urgent
    fbHeadline = pick([
      `🚨【結團倒數】首批配額告急！${brand}《${name}》現省 $${savingsAmount} 倒數搶購！`,
      `⏰【限量 100 組】這批賣完廠商要等一個月！《${name}》最後加開搶單！`,
    ]);
    fbBody = `大家注意！【${brand} ${name}】開團不到 24 小時訂單已經破百張！🔥\n廠商告知因為製程繁複，本檔追加配額只剩最後少量現貨，隨時可能提早結單！\n\n` +
      `🎯 還沒跟上的快看這三點：\n` +
      cleanSellingPoints.slice(0, 3).map((pt, i) => `⚡ ${i + 1}. ${pt}`).join("\n") +
      `\n\n💰 團友限定價：$${groupPrice} (原價 $${originalPrice}，現省 $${savingsAmount})\n` +
      `🚚 滿 $${freeShippingThreshold} 即享免運！\n\n` +
      `👇 趕快點擊連結結帳，以系統填單先後順序保留庫存！`;

    igFirst = `最後倒數！💥 ${name} 限量現貨快被搶光啦，還沒跟到的快上車！`;
    igBody = `私訊被問爆的 ${brand}《${name}》現貨真的所剩無幾了！\n\n` +
      cleanSellingPoints.slice(0, 3).map((p) => `🔥 ${p}`).join("\n") +
      `\n\n團友專屬下殺 $${groupPrice} (現折 $${savingsAmount})\n` +
      `滿 $${freeShippingThreshold} 免運！🔗 點 Bio 連結手刀搶現貨！`;

    lineHeadline = `🚨【最後庫存告急】${name} 團購優惠即將結單！`;
    lineBody = `團友們注意！\n【${name}】本檔優惠即將截止，庫存只剩最後幾十組！\n\n` +
      `💰 限時下殺：$${groupPrice} / 件 (原價 $${originalPrice})\n` +
      `🚚 滿 $${freeShippingThreshold} 免運直送！\n\n` +
      `錯過這檔就要恢復原價了！👇 點擊立刻保留名額：`;
  }

  // Dynamic Hashtags based on category & name
  const dynamicHashtags = [
    `#${name.replace(/[\s禮盒組包裝]/g, "")}`,
    `#${brand.replace(/\s/g, "")}`,
    `#${category.split("／")[0]}`,
    "#團購美食",
    "#限時團購",
    "#辦公室團購",
    "#好物推薦",
    `#現省${savingsAmount}元`,
  ];

  // Visual Director & Midjourney Prompt Customization
  const midjourneyPrompt = isFood
    ? `Commercial food photography of ${name}, ${primaryPoint}, placed on minimalist ceramic plate, natural morning studio lighting, 45-degree angle, macro texture detail, warm aesthetic, shot on Sony A7R IV 85mm f/1.8, editorial gourmet magazine style --ar 4:5 --v 6.0 --q 2`
    : isHealth
    ? `Product commercial photography of healthy ${name} in modern minimalist kitchen setting, natural sunlight, organic ingredients surrounding the package, fresh aesthetic, high dynamic range, crisp depth of field --ar 4:5 --v 6.0`
    : `Sleek aesthetic product shot of ${name}, modern Scandinavian interior setting, soft cinematic lighting, premium materials, high-end lifestyle catalog aesthetic, shot on 50mm f/1.4 --ar 4:5 --v 6.0`;

  const videoStoryboard = [
    {
      scene: "Scene 1 (0-2s) 痛點與視覺吸睛勾子",
      visual: `特寫鏡頭：展示 ${name} 外包裝撕開/開箱瞬間，配合明亮暖調光線與自然環境音。`,
      audioVoiceover: `「上班又累又嘴饞？這款團購被問翻的 ${name} 終於開團了！」`,
      durationSeconds: 2,
    },
    {
      scene: "Scene 2 (2-5s) 核心賣點斷面秀與質感細節",
      visual: `微距特寫慢動作：展示商品細部質感（${primaryPoint}），呈現「${sensoryHighlights[0] || "極致細節"}」。`,
      audioVoiceover: `「你看這個細節！${cleanSellingPoints[0] || "嚴選原料"}，完全是專櫃等級享受！」`,
      durationSeconds: 3,
    },
    {
      scene: "Scene 3 (5-8s) 限時團購價與呼籲下單",
      visual: `畫面切換至多件組合排開，右下角彈出「原價 $${originalPrice} ➔ 團購價 $${groupPrice}」，字幕顯示滿 $${freeShippingThreshold} 免運。`,
      audioVoiceover: `「市價現省 $${savingsAmount}！滿額再享免運，限量開搶點連結跟團！」`,
      durationSeconds: 3,
    },
  ];

  // Multi-SKU Dynamic Strategy
  const skuRecommendation = [
    {
      name: `單入經典嚐鮮組`,
      price: groupPrice,
      originalPrice: originalPrice,
      targetUser: "新手首次跟團 / 單人私享",
      tag: "入門推薦",
    },
    {
      name: `雙入人氣分享特惠組`,
      price: Math.round(groupPrice * 1.9),
      originalPrice: originalPrice * 2,
      targetUser: "小家庭 / 辦公室兩兩合購",
      tag: "熱銷 No.1",
    },
    {
      name: `4 入超值免運囤貨霸王組`,
      price: Math.round(groupPrice * 3.6),
      originalPrice: originalPrice * 4,
      targetUser: "團友集體湊單 / 送禮大戶",
      tag: "直接免運",
    },
  ];

  return {
    productName: name,
    brandName: brand,
    generatedAt: new Date().toLocaleString("zh-TW", { hour12: false }),
    styleAngleName: styleNames[chosenAngle],
    deepAnalysis,
    facebookPost: {
      headline: fbHeadline,
      body: fbBody,
      hashtags: dynamicHashtags,
      callToAction: `立即點擊前台專屬開團連結下單，單件現折 $${savingsAmount}！`,
    },
    instagramPost: {
      firstParagraph: igFirst,
      body: igBody,
      hashtags: dynamicHashtags,
      callToAction: `點擊個人檔案 Bio 專屬連結搶先下單`,
    },
    lineMessage: {
      headline: lineHeadline,
      body: lineBody,
      pricingSummary: `單件 $${groupPrice} (市價 $${originalPrice}) ｜ 滿 $${freeShippingThreshold} 免運`,
      callToAction: `點擊專屬連結立即搶購`,
    },
    visualDirector: {
      midjourneyPrompt,
      colorPalette: isFood
        ? ["#D97706 (暖琥珀金)", "#78350F (可可棕)", "#F59E0B (焦糖橙)", "#FFFBEB (乳酪白)"]
        : isHealth
        ? ["#059669 (自然綠)", "#10B981 (晨曦青)", "#ECFDF5 (薄荷白)", "#065F46 (墨深綠)"]
        : ["#4F46E5 (極光靛藍)", "#6366F1 (科技藍)", "#1E1B4B (星空深藍)", "#F8FAFC (純淨白)"],
      lightingMood: isFood ? "暖金色午後自然散射光 (Warm Golden Sunlight)" : "高對比簡約明亮棚拍光 (Crisp Studio Softbox)",
      videoStoryboard,
    },
    pricingStrategy: {
      skuRecommendation,
      bundleSavings: `購買 4 入組現賺 $${originalPrice * 4 - Math.round(groupPrice * 3.6)} 元，並立省運費 $80！`,
      suggestedFreeShippingNote: `滿 $${freeShippingThreshold} 免運門檻，建議引導顧客一次帶 2~4 組最划算。`,
    },
    notifications: {
      launchLinePush: `🔥【${name}】正式開團啦！團購限定價只要 $${groupPrice} (市價 $${originalPrice})，滿 $${freeShippingThreshold} 免運直送！首批現貨數量有限，點擊立即搶購 👉 [商店連結]`,
      closing6HoursSms: `⏰【結團最後 6 小時倒數】您關注的《${name}》即將於今晚 23:59 截止優惠，逾時將恢復原價 $${originalPrice}！把握免運手刀結帳 👉 [商店連結]`,
      unpaidGentleReminder: `💳【溫馨匯款提醒】您訂購的《${name}》訂單已保留中，請於 24 小時內完成 ATM 轉帳並回傳帳號末五碼，以便為您優先安排新鮮出貨！感謝您的支持 🌸`,
    },
  };
}

/**
 * 產生完整 Prompt（不使用 API / 手動貼到 Gemini 網頁版）
 * 包含完整商品與活動資料（唯一事實來源）、嚴格防捏造規則、平台需求與格式規範。
 */
export function buildManualGeminiPrompt(params: ProductInputParams): string {
  const {
    name,
    brand,
    category,
    description,
    sellingPoints,
    specs,
    originalPrice,
    groupPrice,
    audience,
    startDate,
    endDate,
    purchaseUrl,
    platforms = ["facebook", "instagram", "line"],
    includeImagePrompt = true,
    includeVideoPrompt = true,
    hasReferenceImage = false,
    freeShippingThreshold = 1500,
    styleAngle = "auto",
  } = params;

  const styleDescriptions: Record<string, string> = {
    auto: "AUTO（依商品特性與階段自動判斷最佳版型）",
    A_TRUST_REVIEW: "A_TRUST_REVIEW（信任實測型：深度解析品質、實測細節與高說服力說明）",
    B_SCENARIO_SOLUTION: "B_SCENARIO_SOLUTION（情境解決型：從生活痛點與日常使用情境切入）",
    C_PROMOTION: "C_PROMOTION（強促銷型：強調限時破盤價、滿額免運與囤貨誘因）",
    D_STORY_UNBOXING: "D_STORY_UNBOXING（故事開箱型：著重產地職人工藝、用料故事與品味開箱）",
    E_COUNTDOWN: "E_COUNTDOWN（倒數提醒型：結團倒數急迫感、最後現貨搶購）",
    story: "故事開箱風（團長親測、職人故事）",
    office: "辦公室午茶推坑風（日常放鬆、同事湊單情境）",
    expert: "職人成份專業評測風（成份深度解析、品質數據）",
    urgent: "限時倒數截單風（即將結團、倒數催單）",
  };

  const selectedStyleText = styleDescriptions[styleAngle] || "AUTO 智慧動態選取";

  const requestedPlatforms = [];
  if (platforms.includes("facebook")) requestedPlatforms.push("Facebook 團購長文（包含活動鉤子、目標受眾情境、推薦理由、3~5個核心賣點、價格折扣、行動呼籲）");
  if (platforms.includes("instagram")) requestedPlatforms.push("Instagram 視覺短文（節奏明快、段落分明、吸睛第一段、文末附精選 Hashtags）");
  if (platforms.includes("line")) requestedPlatforms.push("LINE 社群短訊（資訊密集、價格下單連結優先、高轉化催單訊息）");

  const imageSection = includeImagePrompt
    ? `
### 4. 商業攝影圖片提示詞 (Image Prompt)
- 請輸出可直接貼到 Midjourney / Imagen / Stable Diffusion 的英文 Prompt 與中文視覺規劃。
${
  hasReferenceImage
    ? "- ⚠️ **重要（有附參考圖）**：請在提示詞開頭寫明「使用已附上的商品參考圖作為唯一商品主體」，維持包裝、Logo、標籤、比例、材質、顏色與外觀形狀一致，只變更環境光影與拍攝構圖。"
    : "- ⚠️ **重要（無參考圖）**：僅根據商品描述構建商品外觀，不得聲稱已附圖。"
}
- 需包含明確光線氛圍、材質質感與文字留白安全區 (Text Safe Area)。`
    : "";

  const videoSection = includeVideoPrompt
    ? `
### 5. 8 秒短影音分鏡腳本 (Video Storyboard)
- 概念規劃、總秒數 (8秒) 分鏡表（含秒數分配、畫面描述、鏡頭運鏡、旁白音效、後製文字 Overlay）。
- 請輸出可直接貼到外部影片生成工具的英文 Generation Prompt。`
    : "";

  return `# 台灣社群團購爆款文案生成指令 (Gemini Prompt)

你是專業的「台灣社群團購內容引擎與爆款行銷總監」。請依據以下提供的【唯一事實來源】資料，量身產出繁體中文團購開團文案與行銷素材。

---

## 🛑 核心原則與防捏造守則（嚴格遵守）
1. **唯一事實來源**：以下提供的商品與活動資料為唯一的真實依據。**嚴格禁止自行捏造**未提供的價格、折扣、功效、臨床認證、銷量數字、名人背書或虛假個人使用經驗。
2. **忠實呈現**：所有數字、規格、品牌名稱、活動日期、優惠門檻與購買連結必須完全精確保留。
3. **語氣規範**：使用親切自然、道地的台灣繁體中文口語，避免過量 Emoji、連續驚嘆號或空泛的中國大陸電商用語（如「親」、「爆款秒殺包郵」等）。
4. **格式規範**：產出需結構清晰，排版優美，方便團購主直接複製貼上至社群發布。

---

## 📦 商品與活動輸入資料（唯一真實依據）
\`\`\`json
{
  "product": {
    "name": "${name}",
    "brand": "${brand}",
    "category": "${category}",
    "description": "${description.replace(/\n/g, " ")}",
    "selling_points": ${JSON.stringify(sellingPoints)},
    "specs": ${JSON.stringify(specs)}
  },
  "audience": {
    "target_audience": "${audience || "上班族、家庭團購、追求生活品質者"}"
  },
  "campaign": {
    "original_price": ${originalPrice},
    "group_price": ${groupPrice},
    "savings_amount": ${Math.max(0, originalPrice - groupPrice)},
    "free_shipping_threshold": ${freeShippingThreshold},
    "start_at": "${startDate || new Date().toISOString().split("T")[0]}",
    "end_at": "${endDate || "活動截止日"}",
    "purchase_url": "${purchaseUrl || "https://store.example.com"}"
  },
  "style_angle": "${selectedStyleText}",
  "has_reference_image": ${hasReferenceImage}
}
\`\`\`

---

## 🎯 產出需求任務清單

### 1. 深度賣點與受眾痛點分析
- **目標客群核心痛點**（2~3 點）
- **感官體驗與產品亮點**（2~3 點）
- **核心價值主張與推薦話術**

### 2. 多平台社群量身訂製文案
${requestedPlatforms.map((p, i) => `#### (${i + 1}) ${p}`).join("\n")}

### 3. 多規格階梯定價與促銷配置建議
- 建議 3 組階梯方案（單入嚐鮮組 / 多入分享組 / 免運囤貨組）
- 滿 $${freeShippingThreshold} 免運誘因說明與結單通知腳本
${imageSection}
${videoSection}

---

${
  hasReferenceImage
    ? "💡 **【商品圖片提醒】**：本商品已選定商品參考圖，若您在 Gemini 網頁版執行此 Prompt，請記得在對話框中一併上傳商品圖片，以獲得最精準的視覺生成效果！"
    : ""
}

請直接開始輸出完整、繁體中文且排版完美的團購素材包！`;
}


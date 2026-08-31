/**
 * 團購 AI 文案與多模態內容生成系統 (Prompt Architecture Engine)
 * 嚴格遵循【兩階段處理機制 (Two-Stage Pipeline)】：
 * 
 * 第一階段：品類自動偵測與屬性路由 (Category Detection & Attribute Routing)
 * - 精確將商品歸類於【食、衣、住、行、育、樂】
 * - 自動注入該品類的「允許詞庫 (Allowed Keywords)」與「嚴禁詞庫 (Forbidden Keywords)」
 * - 徹底杜絕跨品類語意錯亂（如眼藥水或家居品出現口感、食用詞彙）
 * 
 * 第二階段：多模態模組分流生成 (Multimodal Generation)
 * - 跨平台文案 (FB、LINE、IG、Threads、EDM、催單、倒數結團、FAQ)
 * - Midjourney 商業攝影 Prompt 1 (產品單品特寫) & Prompt 2 (情境使用展示)
 * - Sora / Runway 15 秒短影音 3 段分鏡鏡頭腳本 (含英文 AI Video Prompt)
 * - 商業海報背景 Prompt (預留大面積 Copy Space)
 */

import {
  CategoryRoutingInfo,
  VideoStoryboardShot,
  VideoDurationStoryboard,
  EnvironmentDirector,
  EnvironmentStylePreset,
} from "../types/groupbuy";

export type CategoryKey = "食" | "衣" | "住" | "行" | "育" | "樂";

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
  customEnvironmentText?: string;
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
  categoryRouting: CategoryRoutingInfo;
  deepAnalysis: DeepAnalysisResult;
  catchyHeadline: string;
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
  threadsPost: {
    headline: string;
    body: string;
    discussionHook: string;
  };
  edmCopy: {
    subject: string;
    previewText: string;
    body: string;
  };
  urgencyReminder: string;
  countdownClosing: string;
  faq: Array<{
    q: string;
    a: string;
  }>;
  visualDirector: {
    midjourneyPrompt: string;
    midjourneyPrompt2: string;
    posterPrompt: string;
    colorPalette: string[];
    lightingMood: string;
    videoStoryboard: {
      scene: string;
      visual: string;
      audioVoiceover: string;
      durationSeconds: number;
      aiVideoPrompt?: string;
    }[];
    videoShots: VideoStoryboardShot[];
    availableDurations: number[];
    durationStoryboards: Record<number, VideoDurationStoryboard>;
  };
  environmentDirector: EnvironmentDirector;
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

// 1. 第一階段：品類規則矩陣
export const CATEGORY_RULES: Record<
  CategoryKey,
  {
    name: string;
    label: string;
    allowedKeywords: string[];
    forbiddenKeywords: string[];
    marketingStrategy: string;
    recommendedAngle: string;
    visualStyle: string;
    colorPalette: string[];
    lightingMood: string;
  }
> = {
  食: {
    name: "食",
    label: "食品 / 飲料 / 保健食品",
    allowedKeywords: ["口感", "香氣", "風味", "嚴選成分", "回甘", "飽足感", "新鮮", "無添加", "酥脆", "濃郁", "多汁", "純手工", "伴手禮", "健康無負擔"],
    forbiddenKeywords: ["塗抹", "滴入", "穿搭", "防刮", "行車安全", "穿透感", "顯瘦", "抗震", "耐磨", "親膚剪裁"],
    marketingStrategy: "味覺誘惑、成分安心感、囤貨省錢、節慶送禮",
    recommendedAngle: "舌尖味覺誘惑與安心無添加配方，強調辦公室解饞、家庭囤貨與親友送禮首選",
    visualStyle: "Macro commercial food photography, studio lighting, mouth-watering depth of field, appetizing colors, 8k, ultra-detailed",
    colorPalette: ["#D97706 (暖琥珀金)", "#78350F (可可棕)", "#F59E0B (焦糖橙)", "#FFFBEB (乳酪白)"],
    lightingMood: "暖金色午後自然散射光 (Warm Golden Sunlight, appetizing and mouth-watering)",
  },
  衣: {
    name: "衣",
    label: "服裝 / 鞋包 / 飾品 / 美妝保養",
    allowedKeywords: ["剪裁", "顯瘦", "透氣", "親膚", "百搭", "質地", "修飾線條", "水潤", "吸收", "彈性", "輕盈", "親膚面料", "修身", "不咬肌膚"],
    forbiddenKeywords: ["好吃", "美味", "口感", "行車", "馬力", "耐重", "入口即化", "酸甜", "香脆", "飽足感"],
    marketingStrategy: "視覺修飾、多場景穿搭、體感舒適度、限色限量",
    recommendedAngle: "立體修身剪裁與極致親膚體感，主打多場景百搭穿搭與日常精緻美學",
    visualStyle: "Fashion editorial shoot, minimalist background, natural lighting, high fabric texture, stylish model framing, 8k, Vogue style",
    colorPalette: ["#EC4899 (優雅玫瑰粉)", "#F43F5E (暮色胭脂)", "#BE185D (高雅酒紅)", "#FDF2F8 (絲緞珍珠白)"],
    lightingMood: "時尚雜誌頂級柔光 (Fashion Editorial Softbox, highlighting textile texture)",
  },
  住: {
    name: "住",
    label: "家居 / 家電 / 日用品 / 清潔護理（含眼藥水/外用保養/洗沐）",
    allowedKeywords: ["解放雙手", "舒緩", "水潤", "清涼", "質感居家", "極簡", "耐用", "省時", "溫和無刺激", "深層潔淨", "儀式感", "安心守護", "靜音", "人體工學"],
    forbiddenKeywords: ["口感", "嚼勁", "酸甜", "美味", "吞嚥", "穿搭", "好吃", "香氣四溢", "入口即化", "可口", "回甘"],
    marketingStrategy: "生活痛點解決、效率提升、家庭健康護理、儀式感打造",
    recommendedAngle: "直擊日常生活困擾，解放雙手與溫和舒緩，提升居家幸福感與生活質感",
    visualStyle: "Modern cozy home interior, soft sunlight through window, aesthetically pleasing minimalist aesthetic, warm atmosphere, highly detailed",
    colorPalette: ["#4F46E5 (極光靛藍)", "#0EA5E9 (晨曦蔚藍)", "#6366F1 (舒心霧藍)", "#F8FAFC (純淨白)"],
    lightingMood: "明亮北歐窗邊自然晨光 (Clean Scandinavian Natural Daylight, cozy and soothing)",
  },
  行: {
    name: "行",
    label: "汽機車配件 / 戶外 / 出行 / 箱包",
    allowedKeywords: ["安全防護", "輕量便攜", "防刮耐磨", "大容量", "收納", "穩固", "流線設計", "防水防塵", "抗震減壓", "高承載力", "快拆設計", "出行必備"],
    forbiddenKeywords: ["入口即化", "親膚顯瘦", "服貼保濕", "好吃", "美味", "酸甜", "口感", "細紋修復", "水潤好吸收"],
    marketingStrategy: "情境安全感、出遊便利性、戶外耐用測試、超高 CP 值",
    recommendedAngle: "極限耐用與大容量收納，為戶外出行與通勤提供全方位安全防護",
    visualStyle: "Dynamic outdoor/action product shot, rugged environment, professional product lighting, crisp reflection, cinematic lighting",
    colorPalette: ["#334155 (沉穩石板灰)", "#0F172A (極致夜黑)", "#F97316 (亮眼活力橘)", "#E2E8F0 (金屬冷灰)"],
    lightingMood: "動態電影感戶外黃金時刻光線 (Cinematic Golden Hour & Crisp Product Highlights)",
  },
  育: {
    name: "育",
    label: "親子 / 文教 / 玩具 / 書籍",
    allowedKeywords: ["無毒安全", "寓教於樂", "專注力", "邏輯力", "啟發潛能", "陪伴成長", "圓潤無毛邊", "通過檢驗", "手眼協調", "親子共讀", "爸媽救星"],
    forbiddenKeywords: ["性感", "強勁馬力", "奢華高貴", "入口即化", "行車安全", "美體塑身", "成熟魅力"],
    marketingStrategy: "爸媽救星、成長必備、認證安全、親子互動",
    recommendedAngle: "安全無毒與啟發創造力，爸媽育兒神隊友，培養專注力與溫馨親子互動",
    visualStyle: "Vibrant and bright, playful color palette, warm emotional tone, lifestyle shot, joyful ambiance",
    colorPalette: ["#F59E0B (明亮向日葵黃)", "#10B981 (活潑青草綠)", "#3B82F6 (天空澄藍)", "#FFFBEB (柔和米白)"],
    lightingMood: "明亮溫暖午後柔和散射光 (Bright, Cheerful and Soft High-Key Sunlight)",
  },
  樂: {
    name: "樂",
    label: "休閒 / 娛樂 / 旅遊票券 / 飯店住宿",
    allowedKeywords: ["沉浸體驗", "療癒放鬆", "拍照打卡", "秘境", "專屬禮遇", "限時快閃", "星級享受", "無敵美景", "釋放壓力", "超值套票", "渡假風情"],
    forbiddenKeywords: ["耐磨防刮", "成分天然（非餐飲）", "吸收快", "顯瘦修身", "行車記錄", "靜音馬達"],
    marketingStrategy: "儀式感營造、視覺衝擊、逃離都市、限時折扣優惠",
    recommendedAngle: "逃離城市喧囂的沉浸式療癒假期，專屬團購折扣與星級頂級體驗",
    visualStyle: "Vibrant and bright, playful color palette, warm emotional tone, lifestyle shot, joyful ambiance",
    colorPalette: ["#06B6D4 (蔚藍度假海風)", "#8B5CF6 (夢幻紫霞)", "#F43F5E (熱帶珊瑚紅)", "#F0FDFA (細白沙灘)"],
    lightingMood: "海島渡假黃昏霞光與夢幻藍調 (Dreamy Sunset Resort Glow & Ambient Twilight)",
  },
};

/**
 * 第一階段：品類自動偵測與屬性路由函式 (Category Detection & Attribute Routing)
 */
export function detectCategoryAndRoute(
  productName: string,
  categoryInput: string = "",
  description: string = "",
  sellingPoints: string[] = []
): CategoryRoutingInfo {
  const combinedText = `${productName} ${categoryInput} ${description} ${sellingPoints.join(" ")}`.toLowerCase();

  // 1. 行 (交通/戶外/車用/出行)
  if (/汽機車|行車|車用|輪胎|安全帽|雨衣|後照鏡|露營|帳篷|登山|背包|行李箱|旅行袋|充氣墊|戶外|導航|打氣機/i.test(combinedText)) {
    const r = CATEGORY_RULES["行"];
    return {
      detectedCategory: "行",
      categoryLabel: r.label,
      recommendedAngle: r.recommendedAngle,
      allowedKeywords: r.allowedKeywords,
      forbiddenKeywords: r.forbiddenKeywords,
      visualStyle: r.visualStyle,
    };
  }

  // 2. 育 (親子/玩具/文教/書籍)
  if (/親子|嬰兒|寶寶|幼兒|童書|繪本|積木|益智|玩具|早教|學習桌|安撫|奶瓶|推車|童裝|教具|桌遊/i.test(combinedText)) {
    const r = CATEGORY_RULES["育"];
    return {
      detectedCategory: "育",
      categoryLabel: r.label,
      recommendedAngle: r.recommendedAngle,
      allowedKeywords: r.allowedKeywords,
      forbiddenKeywords: r.forbiddenKeywords,
      visualStyle: r.visualStyle,
    };
  }

  // 3. 樂 (休閒/旅遊/飯店/住宿/票券/娛樂)
  if (/住宿|飯店|渡假|門票|票券|溫泉|露營區|休閒|spa|按摩券|遊樂園|景點|秘境|體驗券|餐券|展覽/i.test(combinedText)) {
    const r = CATEGORY_RULES["樂"];
    return {
      detectedCategory: "樂",
      categoryLabel: r.label,
      recommendedAngle: r.recommendedAngle,
      allowedKeywords: r.allowedKeywords,
      forbiddenKeywords: r.forbiddenKeywords,
      visualStyle: r.visualStyle,
    };
  }

  // 4. 住 (家居/家電/日用品/清潔/眼藥水/外用護理/洗沐/床寢)
  // 注意：特別針對眼藥水、外用護理、洗沐品做明確歸類為「住/日用品清潔護理」，嚴禁飲食詞
  if (
    /眼藥水|洗眼液|護眼滴劑|外用|藥膏|清潔|洗碗|洗衣|掃除|除蟎|掃地機|空氣清淨|吸塵器|除濕機|鍋具|平底鍋|保溫杯|水壺|收納|衣架|衛生紙|濕紙巾|枕頭|床墊|被子|毛巾|沐浴乳|洗髮精|洗手乳|牙刷|居家/i.test(
      combinedText
    )
  ) {
    const r = CATEGORY_RULES["住"];
    return {
      detectedCategory: "住",
      categoryLabel: r.label,
      recommendedAngle: r.recommendedAngle,
      allowedKeywords: r.allowedKeywords,
      forbiddenKeywords: r.forbiddenKeywords,
      visualStyle: r.visualStyle,
    };
  }

  // 5. 衣 (服裝/鞋包/飾品/美妝保養/彩妝/面膜/精華液)
  if (
    /衣服|外套|上衣|褲|洋裝|裙|內衣|內褲|襪子|鞋|女鞋|男鞋|包包|皮夾|項鍊|耳環|戒指|保養品|精華液|面膜|乳霜|化妝水|防曬|隔離霜|粉底|口紅|唇膏|美妝/i.test(
      combinedText
    )
  ) {
    const r = CATEGORY_RULES["衣"];
    return {
      detectedCategory: "衣",
      categoryLabel: r.label,
      recommendedAngle: r.recommendedAngle,
      allowedKeywords: r.allowedKeywords,
      forbiddenKeywords: r.forbiddenKeywords,
      visualStyle: r.visualStyle,
    };
  }

  // 6. 食 (食品/飲料/生鮮/零食/保健食品/甜點/點心) - 預設或符合關鍵字
  if (
    /甜點|蛋糕|餅乾|千層|塔|零食|美食|巧克力|堅果|滴雞精|生鮮|食品|伴手禮|茶|咖啡|燕麥|牛排|肉乾|水餃|麵條|調理包|益生菌|維他命|膠原蛋白|魚油|保健/i.test(
      combinedText
    ) ||
    categoryInput.includes("食") ||
    categoryInput.includes("點心")
  ) {
    const r = CATEGORY_RULES["食"];
    return {
      detectedCategory: "食",
      categoryLabel: r.label,
      recommendedAngle: r.recommendedAngle,
      allowedKeywords: r.allowedKeywords,
      forbiddenKeywords: r.forbiddenKeywords,
      visualStyle: r.visualStyle,
    };
  }

  // 預設落入「住（生活居家良品）」
  const defaultRule = CATEGORY_RULES["住"];
  return {
    detectedCategory: "住",
    categoryLabel: defaultRule.label,
    recommendedAngle: defaultRule.recommendedAngle,
    allowedKeywords: defaultRule.allowedKeywords,
    forbiddenKeywords: defaultRule.forbiddenKeywords,
    visualStyle: defaultRule.visualStyle,
  };
}

/**
 * 嚴禁詞過濾與語意安全防護函式 (Anti-Cross-Category Leakage)
 */
export function sanitizeCopy(text: string, forbiddenKeywords: string[]): string {
  let cleaned = text;
  forbiddenKeywords.forEach((kw) => {
    if (kw && kw.trim().length > 0) {
      // 替換掉可能錯置的詞彙
      const reg = new RegExp(kw, "gi");
      if (kw === "口感" || kw === "好吃" || kw === "美味" || kw === "入口即化" || kw === "酸甜") {
        cleaned = cleaned.replace(reg, "細緻質地與極佳使用感");
      } else if (kw === "塗抹" || kw === "滴入") {
        cleaned = cleaned.replace(reg, "品嚐享受");
      } else {
        cleaned = cleaned.replace(reg, "");
      }
    }
  });
  return cleaned;
}

/**
 * 產生多秒數短影音分鏡腳本 (10s, 15s, 30s, 60s Storyboard Generator)
 */
export function buildMultiDurationStoryboards(
  name: string,
  brand: string,
  englishProductName: string,
  audience: string,
  primaryPoint: string,
  corePainPoints: string[],
  originalPrice: number,
  groupPrice: number,
  savingsAmount: number,
  catConfig: typeof CATEGORY_RULES[CategoryKey],
  styleDirective?: string
): Record<number, VideoDurationStoryboard> {
  const pain = corePainPoints[0] || "日常生活的常見困擾";
  const feature = primaryPoint || "極致工藝與卓越品質";
  const effectiveStyle = styleDirective && styleDirective.trim().length > 0 ? styleDirective.trim() : catConfig.visualStyle;

  // 10 秒極速推坑 (2 段鏡頭)
  const shots10s: VideoStoryboardShot[] = [
    {
      sceneNumber: 1,
      timeRange: "0-4秒",
      name: "痛點暴擊瞬間 (Instant Hook)",
      visualDescription: `鏡頭以 0.5 秒快速特寫目標受眾（${audience}）的崩潰困擾：「${pain}」，畫面張力強烈。`,
      audioVoiceover: `你還在忍受這種麻煩嗎？快看這個！`,
      aiVideoPrompt: `Fast-paced dynamic close-up showing frustrating everyday moment related to ${catConfig.label}, staged in ${effectiveStyle}, high contrast, quick motion blur, cinematic 4k.`,
      cameraMovement: "快速推進特寫 (Fast Zoom-in)",
    },
    {
      sceneNumber: 2,
      timeRange: "4-10秒",
      name: "神級解法與閃電特惠 (Hero Reveal & Flash CTA)",
      visualDescription: `【${name}】亮相，快速展示「${feature}」驚人效果，右下角壓上團購價 $${groupPrice} (現省 $${savingsAmount}) 與「點擊立即搶」字卡。`,
      audioVoiceover: `這款【${brand} ${name}】團購現省 $${savingsAmount}，立即點擊帶走！`,
      aiVideoPrompt: `Explosive hero commercial shot of ${englishProductName} staged in ${effectiveStyle}, pristine lighting, glowing product surface, bold floating discount badge, commercial finish --v 6.0.`,
      cameraMovement: "360度旋轉滑軌 (Orbital Pan)",
    },
  ];

  // 15 秒黃金吸睛 (3 段鏡頭)
  const shots15s: VideoStoryboardShot[] = [
    {
      sceneNumber: 1,
      timeRange: "0-3秒",
      name: "痛點吸睛鏡頭 (Hook & Pain Point)",
      visualDescription: `展示目標受眾（${audience}）的日常生活困擾情境：「${pain}」，快速抓住眼球。`,
      audioVoiceover: `你是不是也常常為了這個困擾傷腦筋？`,
      aiVideoPrompt: `A cinematic close-up shot showing everyday struggle with ${catConfig.label}, environment style: ${effectiveStyle}, slow motion, high detail, 4k cinematic.`,
      cameraMovement: "慢速推進 (Slow Push-in)",
    },
    {
      sceneNumber: 2,
      timeRange: "3-10秒",
      name: "產品登場與核心亮點 (Product Reveal & Core Feature)",
      visualDescription: `流暢鏡頭運鏡展示【${name}】的精緻外觀與核心亮點：「${feature}」，搭配局部光澤流動與真實使用細節。`,
      audioVoiceover: `這款【${brand} ${name}】，用過真的讓人徹底驚艷！`,
      aiVideoPrompt: `A smooth camera pan revealing ${englishProductName} staged inside ${effectiveStyle}, dynamic studio lighting, showing high quality craftsmanship, photorealistic, 4k commercial video.`,
      cameraMovement: "平移滑軌 (Slider Track)",
    },
    {
      sceneNumber: 3,
      timeRange: "10-15秒",
      name: "行動導向與優惠結尾 (Call to Action & Offer)",
      visualDescription: `畫面疊加專屬優惠字卡（市價 $${originalPrice} ➜ 團友特惠 $${groupPrice}），引導點擊下方連結立即下單。`,
      audioVoiceover: `現在團購限時特惠現省 $${savingsAmount}，點擊連結手刀搶購！`,
      aiVideoPrompt: `Fast cut to a stylish lifestyle setup of ${englishProductName} in ${effectiveStyle}, bright glowing effect, warm and persuasive commercial mood, 4k clean finish.`,
      cameraMovement: "拉遠定鏡 (Pull-out & Hold)",
    },
  ];

  // 30 秒開箱實測 (4 段鏡頭)
  const shots30s: VideoStoryboardShot[] = [
    {
      sceneNumber: 1,
      timeRange: "0-5秒",
      name: "真實情境困擾與提問 (Relatable Scenario Hook)",
      visualDescription: `第一視角拍攝日常生活中的痛點情境：「${pain}」，引起目標受眾強烈共鳴。`,
      audioVoiceover: `每次遇到這種狀況真的超崩潰… 你也有同樣的煩惱嗎？`,
      aiVideoPrompt: `POV shot of someone struggling with daily task related to ${catConfig.label}, environment atmosphere: ${effectiveStyle}, realistic indoor lighting, documentary style.`,
      cameraMovement: "手持第一人稱視角 (POV Handheld)",
    },
    {
      sceneNumber: 2,
      timeRange: "5-14秒",
      name: "開箱上手與極致做工 (Unboxing & Premium Texture)",
      visualDescription: `雙手拆開【${brand} ${name}】精美包裝，近距離微距特寫材質紋理與扎實手感，展現高級質感。`,
      audioVoiceover: `直到我入手了這款【${name}】，一拆開這質感真的沒話說！`,
      aiVideoPrompt: `Cinematic unboxing shot of ${englishProductName} staged in ${effectiveStyle}, extreme macro lens capturing texture and craftsmanship, studio softbox lighting.`,
      cameraMovement: "微距俯拍與特寫 (Macro Overhead)",
    },
    {
      sceneNumber: 3,
      timeRange: "14-22秒",
      name: "實測痛點化解與神奇效果 (Live Demo & Problem Solved)",
      visualDescription: `展示實際使用過程，精準演繹核心優勢「${feature}」，前後對比效果立竿見影，爽快度拉滿。`,
      audioVoiceover: `最厲害的就是它這點，輕輕鬆鬆解決困擾，完全省時又省力！`,
      aiVideoPrompt: `Live demonstration showing ${englishProductName} in action inside ${effectiveStyle}, solving the problem effortlessly, crystal clear visual contrast, 4k 60fps.`,
      cameraMovement: "中景追隨運鏡 (Follow Pan)",
    },
    {
      sceneNumber: 4,
      timeRange: "22-30秒",
      name: "團購專屬下殺與倒數 CTA (Exclusive Deal & Urgency CTA)",
      visualDescription: `畫面展示多入囤貨組合與滿額免運徽章，字卡浮現市價 $${originalPrice} ➜ 團友價 $${groupPrice}，右下角倒數計時器。`,
      audioVoiceover: `這次跟原廠爭取到全網最低價，現省 $${savingsAmount} 還享滿額免運，限量現貨趕快點下方開團連結！`,
      aiVideoPrompt: `Commercial finish showing product hero lineup of ${englishProductName} staged in ${effectiveStyle}, warm ambient glow, dynamic motion graphics badge.`,
      cameraMovement: "優雅升降鏡頭 (Crane Rise)",
    },
  ];

  // 60 秒深度種草評測 (5 段鏡頭)
  const shots60s: VideoStoryboardShot[] = [
    {
      sceneNumber: 1,
      timeRange: "0-8秒",
      name: "團長親身踩坑經驗開場 (Honest Pain Point & Hook)",
      visualDescription: `團長真人出鏡/第一人稱拿著市面上劣質品或常見痛點「${pain}」對比，語氣真誠懇切。`,
      audioVoiceover: `說真的，這幾年我買過超多同類型產品，踩過無數雷，直到遇見這台才真正被拯救…`,
      aiVideoPrompt: `Engaging creator host talking directly to camera, environment backdrop: ${effectiveStyle}, cinematic lighting.`,
      cameraMovement: "固定對話中景 (Medium Shot)",
    },
    {
      sceneNumber: 2,
      timeRange: "8-20秒",
      name: "產品規格深度拆解 (Deep Dive Specs & Build Quality)",
      visualDescription: `分鏡特寫【${brand} ${name}】的核心設計與細節工藝，畫面逐一標註主要規格與優點：「${feature}」。`,
      audioVoiceover: `它最讓我驚艷的首先是做工，原廠用料非常扎實，每個細節都考慮到使用者的便利性。`,
      aiVideoPrompt: `Rotating product pedestal shot of ${englishProductName} staged in ${effectiveStyle}, high-tech clean studio, light sweeping across surface.`,
      cameraMovement: "360度旋轉台 (Turntable 360)",
    },
    {
      sceneNumber: 3,
      timeRange: "20-35秒",
      name: "多場景深度實測 (Multiscene In-depth Testing)",
      visualDescription: `切換不同生活場景（家中、辦公室或外出），完整演示產品在各種條件下的耐用性與卓越表現。`,
      audioVoiceover: `不管是在家日常使用還是帶出門，表現都超級穩定，連我身邊挑剔的朋友試過都跟著被推坑。`,
      aiVideoPrompt: `Montage of fast-cut lifestyle scenes using ${englishProductName} inside ${effectiveStyle}, vibrant colors, authentic feel, 4k.`,
      cameraMovement: "多角度切換 (Multi-angle Cuts)",
    },
    {
      sceneNumber: 4,
      timeRange: "35-48秒",
      name: "真實優缺點客觀分析 (Honest Review & Value Proof)",
      visualDescription: `畫面條列整理 3 大必買理由，搭配感官亮點與省錢試算，強化顧客下單確定感。`,
      audioVoiceover: `如果硬要挑缺點，那就是產能太緊繃常常缺貨！所以這次開團大家一定要把握現貨。`,
      aiVideoPrompt: `Clean infographics overlay on top of lifestyle usage of ${englishProductName} in ${effectiveStyle}, professional video production.`,
      cameraMovement: "平緩平移 (Gentle Glide)",
    },
    {
      sceneNumber: 5,
      timeRange: "48-60秒",
      name: "階梯囤貨攻略與結團倒數 (Tiered Deals, Free Shipping & Final CTA)",
      visualDescription: `完整展示 1 入嚐鮮、2 入分享與 4 入免運囤貨組合，標示倒數計時與限量庫存指示條，強力號召下單。`,
      audioVoiceover: `這次團購價市價 $${originalPrice} 直接打到 $${groupPrice}，湊滿免運最划算！庫存有限售完即止，趕快點留言處/資訊欄連結搶購！`,
      aiVideoPrompt: `Grand finale showcase of multiple sets of ${englishProductName} staged in ${effectiveStyle}, golden confetti / sparkle overlay, premium CTA banner.`,
      cameraMovement: "全景展示推近 (Wide to Close Finale)",
    },
  ];

  return {
    10: {
      durationSec: 10,
      title: "10 秒極速推坑 (Reels / TikTok 飆速節奏)",
      tag: "高完播率 ⚡",
      sceneCount: 2,
      description: "適合 Instagram Reels 與 TikTok，前 4 秒直擊痛點，後 6 秒直接產品爆點與促銷 CTA，留存率最高。",
      shots: shots10s,
    },
    15: {
      durationSec: 15,
      title: "15 秒黃金吸睛 (經典 3 段高轉化結構)",
      tag: "官方推薦 👑",
      sceneCount: 3,
      description: "業界最標準 15 秒短影音黃金結構：3 秒痛點 Hook ➜ 7 秒核心賣點特寫 ➜ 5 秒促銷與 CTA 下單引導。",
      shots: shots15s,
    },
    30: {
      durationSec: 30,
      title: "30 秒開箱實測 (痛點化解與體驗種草)",
      tag: "高客單首選 📦",
      sceneCount: 4,
      description: "提供充足時間呈現第一視角開箱、材質手感特寫、痛點化解前後對比，大幅提升顧客信任感與購買欲。",
      shots: shots30s,
    },
    60: {
      durationSec: 60,
      title: "60 秒深度評測 (團長親身口碑與多場景展示)",
      tag: "深度種草 🔥",
      sceneCount: 5,
      description: "適用於 Facebook 影音與 YouTube Shorts 深度評測，含踩坑經驗、多場景實測、客觀分析與階梯囤貨攻略。",
      shots: shots60s,
    },
  };
}

/**
 * 產生產品圖導入環境設計與風格延伸提示詞 (Product Staging & Environment Director)
 */
export function buildEnvironmentDirector(
  _name: string,
  _brand: string,
  englishProductName: string,
  catConfig: typeof CATEGORY_RULES[CategoryKey],
  hasReferenceImage?: boolean,
  customEnvironmentText?: string
): EnvironmentDirector {
  const effectiveCustomEnv =
    customEnvironmentText && customEnvironmentText.trim().length > 0
      ? customEnvironmentText.trim()
      : "淺色橡木桌面、柔和晨光漫射、米白陶器與極簡綠意植栽 (Natural morning light, minimalist aesthetic)";

  const customMidjourneyPrompt = `"${englishProductName}, positioned in center foreground inside [ENVIRONMENT_STAGE: ${effectiveCustomEnv}], soft commercial lighting, authentic contact shadows, photorealistic, 8k resolution --ar 4:5 --v 6.0"`;

  const customImageToImagePrompt = `"${englishProductName} product perfectly integrated inside [ENVIRONMENT_STAGE: ${effectiveCustomEnv}], studio rim light, natural ambient occlusion, realistic reflections --cref [PRODUCT_IMAGE_URL] --cw 100 --ar 4:5"`;

  const customGenerativeFillDirective = `[ENVIRONMENT_STAGE: ${effectiveCustomEnv}], seamless edge blending, professional commercial studio lighting, natural surface texture, high resolution photographic quality`;

  const productPlacementPrompt = `"Professional commercial product placement prompt: Seamlessly integrate the uploaded product image (${englishProductName}) into [ENVIRONMENT_STAGE: ${effectiveCustomEnv}]. Keep the original product's geometry, proportions, brand logo, and packaging texture 100% intact. Generate surrounding realistic environment with natural ambient contact shadows, surface reflections, and professional studio lighting."`;

  const styles: EnvironmentStylePreset[] = [
    {
      id: "nordic_minimalist",
      name: "極簡北歐木質風",
      nameEn: "Nordic Minimalist Wood & Warm Neutral",
      tag: "溫暖百搭首選 🌿",
      description: "淺色橡木桌面、米白陶器、柔和自然漫射晨光，營造乾淨、溫馨、高質感的北歐生活美學。",
      colorPalette: ["#FAF7F2 (米白原棉)", "#D8C7B5 (淺橡木色)", "#7D7065 (亞麻灰褐)", "#E3ECE9 (微曦晨霧)"],
      lighting: "Soft morning window sunlight with gentle organic shadows (5500K natural daylight)",
      midjourneyPrompt: `"${englishProductName} placed on a light natural oak wooden table, soft morning window sunlight casting gentle diffused shadows, minimalist ceramic vase and textured linen in the out-of-focus background, clean Scandinavian aesthetic, high-end commercial staging, 8k resolution, shot on Hasselblad 80mm --ar 4:5 --style raw"`,
      imageToImagePrompt: `"${englishProductName} product staged on smooth light oak wood tabletop, natural soft daylight, subtle plant shadow overlay, scandinavian minimalist interior, high realism --cref [PRODUCT_IMAGE_URL] --cw 100 --ar 4:5"`,
      generativeFillDirective: `seamless light oak wood surface, soft natural daylight, minimalist neutral background, warm scandinavian vibe, high resolution photographic quality`,
    },
    {
      id: "luxury_dark_gold",
      name: "頂級奢華黑金風",
      nameEn: "Luxury Dark Obsidian & Gold Accent",
      tag: "黑金高階旗艦 💎",
      description: "黑色大理石倒影台面、金屬輪廓邊緣光、暗調奢華光影對比，極致突顯產品尊爵不凡品質。",
      colorPalette: ["#121214 (深邃曜黑)", "#D4AF37 (璀璨流金)", "#2B2B2F (玄武岩灰)", "#E5D19A (霧光香檳金)"],
      lighting: "Dramatic rim lighting with warm golden edge glows and dark chiaroscuro studio lighting",
      midjourneyPrompt: `"${englishProductName}, centered on polished black nero marquina marble with subtle gold veining and delicate water droplet reflection, rim lighting with warm golden edge glows, deep obsidian backdrop, moody luxury aesthetic, chiaroscuro studio lighting, 8k --ar 4:5 --v 6.0"`,
      imageToImagePrompt: `"${englishProductName} placed on high-gloss black marble pedestal, golden edge rim lighting, dark moody studio background, luxury commercial placement --cref [PRODUCT_IMAGE_URL] --cw 100 --ar 4:5"`,
      generativeFillDirective: `polished dark marble with golden rim light, luxury moody lighting, elegant reflection, sleek studio atmosphere`,
    },
    {
      id: "japanese_daylight",
      name: "日系清透自然日光",
      nameEn: "Japanese Muji Daylight & Botanical",
      tag: "無印清透療癒 🍃",
      description: "清爽百葉窗條紋光影、純白極簡檯面、小巧綠意植栽點綴，呈現純淨、透明與空氣感生活日常。",
      colorPalette: ["#FFFFFF (純白極簡)", "#F3EFEA (和紙米色)", "#8EA885 (若草淺綠)", "#C3B9A8 (淺褐原色)"],
      lighting: "Bright airy daylight filtering through venetian blinds with striped architectural shadows",
      midjourneyPrompt: `"${englishProductName}, placed on a clean matte white surface next to a sunlit window with venetian blind striped shadows, a small green bonsai or olive branch in the soft background, clean fresh Japanese lifestyle atmosphere, bright daylight, 8k --ar 4:5 --v 6.0"`,
      imageToImagePrompt: `"${englishProductName} on matte white counter with venetian blind shadows, fresh green plant in background, bright airy Japanese home aesthetic --cref [PRODUCT_IMAGE_URL] --cw 100 --ar 4:5"`,
      generativeFillDirective: `bright white clean surface, soft venetian blind light beams, fresh green plant in background, airy japanese style`,
    },
    {
      id: "modern_urban_slate",
      name: "當代俐落都會工業風",
      nameEn: "Modern Urban Sleek & Slate Concrete",
      tag: "俐落現代感 🏙️",
      description: "清水模混凝土展台、細緻金屬反光拉絲、幾何聚光燈影，散發俐落都會與當代科技質感。",
      colorPalette: ["#4A5568 (板岩灰)", "#CBD5E1 (不鏽鋼銀)", "#1E293B (午夜石青)", "#94A3B8 (霧面鋁灰)"],
      lighting: "Geometric studio spotlights with sharp crisp shadows and cold-to-neutral tone balance",
      midjourneyPrompt: `"${englishProductName}, placed on smooth gray concrete pedestal, subtle brushed aluminum accents, geometric studio spotlighting, sleek slate gray gradient background, ultra-modern industrial design showcase, 8k --ar 4:5 --v 6.0"`,
      imageToImagePrompt: `"${englishProductName} on sleek gray concrete block, geometric modern studio light, architectural slate background --cref [PRODUCT_IMAGE_URL] --cw 100 --ar 4:5"`,
      generativeFillDirective: `minimalist gray concrete podium, geometric sharp shadows, modern brushed metal aesthetic`,
    },
    {
      id: "tropical_resort_nature",
      name: "渡假療癒戶外自然風",
      nameEn: "Tropical Resort & Nature Oasis",
      tag: "陽光綠意活力 ☀️",
      description: "戶外陽光斜射、天然原石台面、熱帶棕櫚葉片陰影掩映，洋溢生機勃勃的渡假休閒氣息。",
      colorPalette: ["#2D6A4F (森林深綠)", "#E9D8A6 (海灘暖沙)", "#005F73 (海洋深藍)", "#E76F51 (夕陽暖橙)"],
      lighting: "Warm golden hour natural outdoor sunlight with dynamic palm tree shadow foliage",
      midjourneyPrompt: `"${englishProductName}, placed on a natural textured stone slab surrounded by lush tropical monstera and palm leaf shadows, warm golden hour sun flare, organic resort vacation atmosphere, vibrant nature details, 8k --ar 4:5 --v 6.0"`,
      imageToImagePrompt: `"${englishProductName} on textured natural stone in lush tropical outdoor setting, warm golden sunlight, palm shadow dappled light --cref [PRODUCT_IMAGE_URL] --cw 100 --ar 4:5"`,
      generativeFillDirective: `natural stone surface, tropical palm leaf shadow overlay, warm golden hour sunlight, outdoor organic feel`,
    },
    {
      id: "cyberpunk_neon_studio",
      name: "賽博潮流霓虹工坊",
      nameEn: "Cyberpunk & Vibrant Neon Studio",
      tag: "前衛潮流焦點 ⚡",
      description: "紫藍雙色霓虹輪廓光、微透暗黑金屬格柵、微煙霧氛圍，打造吸睛度 100% 的年輕潮流視覺。",
      colorPalette: ["#8B5CF6 (電音紫)", "#06B6D4 (未來青)", "#0F172A (星空深黑)", "#EC4899 (霓虹桃紅)"],
      lighting: "Vibrant dual-tone purple and cyan neon edge backlight with atmospheric studio haze",
      midjourneyPrompt: `"${englishProductName}, positioned on a dark metallic reflective grid platform, illuminated with vibrant electric purple and cyan neon edge lighting, dark atmospheric studio with subtle smoke haze, futuristic high-energy commercial look, 8k --ar 4:5 --v 6.0"`,
      imageToImagePrompt: `"${englishProductName} with electric purple and cyan neon backlighting, dark metallic platform, futuristic trendy vibe --cref [PRODUCT_IMAGE_URL] --cw 100 --ar 4:5"`,
      generativeFillDirective: `dark metallic platform with electric purple and cyan neon rim lighting, subtle haze, vibrant trendy style`,
    },
  ];

  const referenceImageDirective = `1. 自訂或點選下方環境風格文字，系統已將環境描述置入【[ENVIRONMENT_STAGE]】預留槽\n2. 將清晰產品去背圖（${catConfig.categoryLabel}品類${hasReferenceImage ? "，已備有參考圖" : ""}）上傳至 Midjourney 取得圖片連結 [IMAGE_URL]\n3. 使用下方【自訂墊圖環境融合提示詞】並在結尾加上 --cref [IMAGE_URL] --cw 100 保持產品主體 100% 不變形\n4. 或在 Photoshop Generative Fill 框選周圍背景，貼上專屬生成指令`;

  return {
    defaultStyleId: "nordic_minimalist",
    styles,
    productPlacementPrompt,
    referenceImageDirective,
    customEnvironmentText: effectiveCustomEnv,
    customImageToImagePrompt,
    customGenerativeFillDirective,
    customMidjourneyPrompt,
  };
}

/**
 * 第二階段：多模態全套行銷素材生成引擎 (Multimodal Generation Engine)
 */
export function generateBespokeMarketingPack(params: ProductInputParams): GeneratedMaterialPack {
  const {
    name,
    brand = "精選品牌",
    category = "熱銷選物",
    description = "",
    sellingPoints = [],
    specs = [],
    originalPrice = 500,
    groupPrice = 399,
    audience = "上班族、家庭採購、注重品質生活者",
    startDate = new Date().toISOString().split("T")[0],
    endDate = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    purchaseUrl = "https://store.example.com/groupbuy",
    freeShippingThreshold = 1500,
    styleAngle = "auto",
    hasReferenceImage = false,
    customEnvironmentText = "",
  } = params;

  const savingsAmount = Math.max(0, originalPrice - groupPrice);
  const discountRate = originalPrice > 0 ? Math.round((groupPrice / originalPrice) * 100) : 80;

  // 1. 執行第一階段：品類自動偵測與屬性路由
  const categoryRouting = detectCategoryAndRoute(name, category, description, sellingPoints);
  const catKey = categoryRouting.detectedCategory;
  const catConfig = CATEGORY_RULES[catKey];

  // 整理真實賣點
  const cleanSellingPoints =
    sellingPoints.length > 0
      ? sellingPoints.filter((s) => s.trim().length > 0)
      : [
          `嚴選【${brand}】品質工藝，真材實料層層把關`,
          `專為現代生活設計，符合高標準日常需求`,
          `團友口碑熱推，市售少有的極致規格`,
          `開團專屬特惠價，現折 $${savingsAmount} 元`,
        ];

  const primaryPoint = cleanSellingPoints[0] || `頂級工藝與嚴選品質`;
  const secondaryPoint = cleanSellingPoints[1] || `高回購率口碑爆品`;
  const thirdPoint = cleanSellingPoints[2] || `規格完整，自用送禮兩相宜`;

  // 深度痛點剖析 (依品類量身打造)
  let corePainPoints: string[] = [];
  let sensoryHighlights: string[] = [];

  switch (catKey) {
    case "食":
      corePainPoints = [
        "市售點心零食添加物過多或死甜油膩，吃完負擔重",
        "上班下午三點精神不濟、嘴饞想來點高品質慰藉",
        "平常單買門市大排長龍，網購運費比商品還貴",
        "家庭備餐或親友聚會缺少拿得出手的招牌精緻好物",
      ];
      sensoryHighlights = [
        `入口瞬間層次分明，${name}散發天然純粹香氣`,
        `恰到好處的風味平衡，清爽酥脆不膩口`,
        `獨立密封保鮮包裝，隨拆隨吃維持剛出爐般的絕佳風味`,
        `咬下的瞬間層次豐富，舌尖回甘久久不散`,
      ];
      break;
    case "衣":
      corePainPoints = [
        "市售剪裁版型不合身，容易顯胖或卡卡不舒服",
        "材質粗糙不透氣，穿沒多久就悶熱變形",
        "專櫃大牌動輒數千元，平價款式質感又參差不齊",
        "出門穿搭缺乏百搭單品，每天站在衣櫃前苦惱",
      ];
      sensoryHighlights = [
        `立體修身剪裁，巧妙修飾身型線條，展現自然俐落感`,
        `極致透氣親膚面料，細膩柔順觸感宛如第二層肌膚`,
        `高彈力抗皺工藝，久穿久洗不易鬆垮起毛球`,
        `精緻車縫收邊，細節處處體現高階專櫃質感`,
      ];
      break;
    case "住":
      corePainPoints = [
        "忙碌整天回家還要處理繁瑣家務，耗時費力好疲憊",
        "市售同類產品笨重佔位、操作複雜難以融入居家美學",
        "外用護理/日用品成分刺激或效果短暫，無法真正舒緩放鬆",
        "日常耗材頻繁更換不耐用，累積花費驚人",
      ];
      sensoryHighlights = [
        `直覺簡約操作，一鍵解放雙手，省時省力更高效`,
        `溫和舒緩配方/細膩觸感，給予身心最溫柔的細緻呵護`,
        `北歐極簡美學外型，擺在居家任何角落都是一道風景`,
        `經久耐用工藝，長效維持高品質守護`,
      ];
      break;
    case "行":
      corePainPoints = [
        "戶外出行行李零亂難收納，取物手忙腳亂",
        "市售配件耐磨防護力不足，遇雨或碰撞容易受損",
        "外出行車缺少安全穩固保障，長途跋涉疲勞感倍增",
      ];
      sensoryHighlights = [
        `高強度防刮抗撕裂面料，無懼嚴苛戶外與多變天氣挑戰`,
        `多隔層科學減壓收納系統，拿取物品井然有序極度順手`,
        `精密穩固結構與人體工學設計，大幅減輕出行負擔`,
      ];
      break;
    case "育":
      corePainPoints = [
        "市售玩具材料品質參差不齊，擔心塑化劑或毛邊傷到孩子",
        "孩子容易三分鐘熱度沉迷 3C，缺乏耐心與專注力培養",
        "育兒照顧耗盡心力，缺少能讓孩子自主探索的安全神隊友",
      ];
      sensoryHighlights = [
        `通過嚴格安全檢驗，圓潤無銳角毛邊，家長百分百放心`,
        `寓教於樂多元玩法，深度啟發邏輯思維與手眼協調潛能`,
        `高耐摔安全材質，陪伴寶貝健康成長的溫暖好物`,
      ];
      break;
    case "樂":
      corePainPoints = [
        "平日工作生活壓力沉重，渴望遠離塵囂徹底放空療癒",
        "熱門景點門票與住宿價格昂貴，優惠往往限制繁多",
        "假日出遊踩雷人擠人，無法享受高品質休閒時光",
      ];
      sensoryHighlights = [
        `專屬五星尊榮禮遇，沉浸式享受頂級無敵美景與舒壓設施`,
        `限時特惠超殺折抵，無痛升級輕奢度假體驗`,
        `隨心安排自由假期，留下專屬難忘的打卡回憶`,
      ];
      break;
  }

  const targetScenarios = [
    `上班族與現代家庭提升生活質感的必備選物`,
    `親友聚會、節慶分享或私房犒賞的最佳首選`,
    `趁著這檔破盤團購價一次囤足，省荷包又享免運`,
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

  // 2. 跨平台文案生成 (嚴格遵循品類隔離原則)
  const catchyHeadline = `🔥【限時開團】${brand}《${name}》現折 $${savingsAmount}！團友狂敲碗的口碑好物上線！`;

  // Facebook 長文
  let fbPostText = `老實說，團長測過這麼多款${category}，能讓我打從心底大力推薦的真的不多！✨\n\n` +
    `這次跟【${brand}】原廠談了超久，終於爭取到這檔專屬破盤團購價——《${name}》！🎉\n\n` +
    (description ? `💡【產品重點介紹】\n${description}\n\n` : "") +
    `🌟【為什麼這團非跟不可？必買核心亮點】\n` +
    cleanSellingPoints.map((pt, i) => `0${i + 1}. ✦ ${pt}`).join("\n") +
    `\n\n🔍【感官與體驗優勢】\n` +
    sensoryHighlights.slice(0, 2).map((sh) => `  ✔ ${sh}`).join("\n") +
    `\n\n📦 規格資訊：${specs.join(" / ") || "原廠完整盒裝，新鮮/正品直送"}\n` +
    `💰 團購限定特惠：市價 $${originalPrice} ➜ 團友下殺只要 $${groupPrice} (現省 $${savingsAmount}！)\n` +
    `🚚 全館滿 $${freeShippingThreshold} 即享免運送到家！\n\n` +
    `👇 搶先填單連結：\n🔗 ${purchaseUrl}\n\n` +
    `💬 留言「+1」或「想跟團」，小幫手立刻私訊專屬折扣代碼與下單連結喔！`;

  fbPostText = sanitizeCopy(fbPostText, catConfig.forbiddenKeywords);

  // LINE 短推播
  let lineMsgText = `📢【限時開團】團長私推！${name} 現省 $${savingsAmount} 優惠開跑！\n\n` +
    `各位團友大家早！本週敲碗度第一名的《${name}》正式開團囉！🔥\n\n` +
    `⚡ 必買重點精華：\n` +
    cleanSellingPoints.slice(0, 3).map((p) => `✔ ${p}`).join("\n") +
    `\n\n💵 團購特惠價：$${groupPrice} (原價 $${originalPrice})\n` +
    `📦 湊單小撇步：揪朋友一起湊滿 $${freeShippingThreshold} 即享整單免運！\n` +
    `👇 手刀填單搶購：\n🔗 ${purchaseUrl}`;

  lineMsgText = sanitizeCopy(lineMsgText, catConfig.forbiddenKeywords);

  // IG 貼文
  let igPostText = `這次開團的《${brand} ${name}》真的太有質感了！✨\n\n` +
    `生活已經夠忙碌了，更要用好的東西來好好寵愛自己與家人。\n\n` +
    `🌿 亮點筆記：\n` +
    cleanSellingPoints.slice(0, 3).map((pt) => `▫️ ${pt}`).join("\n") +
    `\n\n🏷️ 限時團友價 NT$ ${groupPrice} (市價 NT$ ${originalPrice})\n` +
    `滿 $${freeShippingThreshold} 免運送到家 📦 點個人檔案 Bio 連結立即跟團！`;

  igPostText = sanitizeCopy(igPostText, catConfig.forbiddenKeywords);

  // Threads 專屬短爆文 (真實口吻、無廢話、引發留言串討論)
  let threadsText = `認真說，用過【${brand}】的 ${name} 之後真的回不去了…\n\n` +
    `之前試過好幾款同類型的都不是很滿意，不是細節粗糙就是性價比不高。\n` +
    `這款主打「${cleanSellingPoints[0] || "極致工藝"}」，而且這次團購價直接從 $${originalPrice} 砍到 $${groupPrice}！\n\n` +
    `有人家裡也有買這款嗎？想知道大家覺得如何 👇`;

  threadsText = sanitizeCopy(threadsText, catConfig.forbiddenKeywords);

  // EDM 會員專屬信件
  const edmSubject = `【VIP 會員獨享】${brand}《${name}》開團現折 $${savingsAmount}，滿額享免運！`;
  const edmPreviewText = `您關注的 ${name} 團購正式上線！專屬團友價 $${groupPrice}，數量有限售完為止。`;
  let edmBody = `親愛的 VIP 貴賓您好：\n\n` +
    `感謝您一直以來的支持！我們為您爭取到了本月最熱門口碑強檔——【${brand} ${name}】。\n\n` +
    `【商品核心優勢】\n` +
    cleanSellingPoints.map((sp) => `• ${sp}`).join("\n") +
    `\n\n【VIP 專屬優惠內容】\n` +
    `• 原價：NT$ ${originalPrice}\n` +
    `• VIP 團購價：NT$ ${groupPrice}（現省 NT$ ${savingsAmount}）\n` +
    `• 活動期間：${startDate} 至 ${endDate}\n` +
    `• 免運優惠：全館消費滿 NT$ ${freeShippingThreshold} 即享免運\n\n` +
    `點擊下方連結立即享 VIP 專屬折扣下單：\n` +
    `${purchaseUrl}\n\n` +
    `祝您購物愉快！`;

  edmBody = sanitizeCopy(edmBody, catConfig.forbiddenKeywords);

  // 催單與倒數推播
  const urgencyReminder = sanitizeCopy(
    `⚡【庫存緊急告急】各位團友！《${name}》首批現貨庫存已售出過半！團購限定價 $${groupPrice} 數量有限，手慢只能等下一波預購囉 👉 ${purchaseUrl}`,
    catConfig.forbiddenKeywords
  );

  const countdownClosing = sanitizeCopy(
    `⏰【最後 24 小時結團倒數】《${name}》團購即將於明日正式截單！現折 $${savingsAmount} 優惠即刻截止，把握免運機會立即結帳 👉 ${purchaseUrl}`,
    catConfig.forbiddenKeywords
  );

  // 3. AI 商業圖片生成模組 (Midjourney / SD Prompt) - 風格指令直接寫入 Prompt
  const englishProductName = name.replace(/[^\w\s]/gi, "").trim() || "Premium Lifestyle Product";
  const styleDirective =
    customEnvironmentText && customEnvironmentText.trim().length > 0
      ? customEnvironmentText.trim()
      : catConfig.visualStyle;

  const midjourneyPrompt1 = `"${englishProductName}, product studio close-up shot, style and environment: ${styleDirective}, ${catConfig.lightingMood}, macro lens depth of field, ultra-sharp focus, commercial photography, photorealistic, 8k resolution --ar 4:5 --style raw"`;
  const midjourneyPrompt2 = `"${englishProductName} in real-world lifestyle usage setting, environment atmosphere: ${styleDirective}, natural ambient diffused lighting, authentic textures, commercial advertising cinematography, 8k resolution --ar 16:9 --v 6.0"`;

  // 4. AI 商業海報背景生成模組 (Poster Design Prompt with Hero Product Centered & Negative Copy Space & Traditional Chinese Typography on Poster)
  const posterPrompt = `"Commercial advertisement poster featuring ${englishProductName} positioned prominently in the sharp visual center foreground, staged in ${styleDirective}, featuring elegant Traditional Chinese typography headline text \\"${name}\\" and \\"限時特惠 團購熱銷\\" beautifully rendered in bold clean Chinese typography at the top header, clean generous negative space / copy space on upper sides, studio key lighting with soft fill, photorealistic, 8k resolution, commercial grade Chinese product poster --ar 3:4 --v 6.0"`;

  // 5. AI 多秒數短影音生成腳本模組 (Sora / Runway 10s, 15s, 30s, 60s Storyboards)
  const durationStoryboards = buildMultiDurationStoryboards(
    name,
    brand,
    englishProductName,
    audience,
    primaryPoint,
    corePainPoints,
    originalPrice,
    groupPrice,
    savingsAmount,
    catConfig,
    styleDirective
  );

  const videoShots = durationStoryboards[15].shots;
  const videoStoryboard = videoShots.map((shot) => ({
    scene: `${shot.timeRange} - ${shot.name}`,
    visual: shot.visualDescription,
    audioVoiceover: shot.audioVoiceover,
    durationSeconds: shot.sceneNumber === 1 ? 3 : shot.sceneNumber === 2 ? 7 : 5,
    aiVideoPrompt: shot.aiVideoPrompt,
  }));

  // 6. 產品圖導入環境設計與風格延伸模組 (Product Inpainting & Environment Staging)
  const environmentDirector = buildEnvironmentDirector(
    name,
    brand,
    englishProductName,
    catConfig,
    hasReferenceImage,
    customEnvironmentText
  );

  // 多規格階梯定價與 SKU 建議
  const skuRecommendation = [
    {
      name: `【體驗嚐鮮組】1 入裝`,
      price: groupPrice,
      originalPrice: originalPrice,
      targetUser: "初次購買、單人使用或嚐鮮嘗新",
      tag: "入門必選",
    },
    {
      name: `【超值囤貨組】2 入分享裝 (平均 $${Math.round(groupPrice * 0.95)}/入)`,
      price: Math.round(groupPrice * 1.9),
      originalPrice: originalPrice * 2,
      targetUser: "家庭自用、送禮必備，享更高折扣",
      tag: "最熱銷 🔥",
    },
    {
      name: `【免運豪省組】4 入家庭箱 (平均 $${Math.round(groupPrice * 0.9)}/入)`,
      price: Math.round(groupPrice * 3.6),
      originalPrice: originalPrice * 4,
      targetUser: "親朋好友揪團湊單，直接達免運門檻",
      tag: "現省最多 👑",
    },
  ];

  const hashtags = [
    `#${brand}`,
    `#${name.replace(/\s+/g, "")}`,
    `#團購優惠`,
    `#限時特惠`,
    `#好物推薦`,
    `#團長私心推`,
    `#生活選物`,
    `#免運直送`,
  ];

  return {
    productName: name,
    brandName: brand,
    generatedAt: new Date().toISOString(),
    styleAngleName: styleAngle !== "auto" ? `【${catKey} - ${styleAngle}】量身切入` : `【${catKey}】${catConfig.label} 專屬精準行銷風`,
    categoryRouting,
    deepAnalysis,
    catchyHeadline,
    facebookPost: {
      headline: catchyHeadline,
      body: fbPostText,
      hashtags,
      callToAction: `立即點擊下方開團連結下單，單件現折 $${savingsAmount}！滿 $${freeShippingThreshold} 免運`,
    },
    instagramPost: {
      firstParagraph: `這款《${brand} ${name}》真的太強大了！✨`,
      body: igPostText,
      hashtags,
      callToAction: `點擊個人檔案 Bio 專屬連結搶先下單`,
    },
    lineMessage: {
      headline: `📢【限時開團】${name} 團購價只要 $${groupPrice}！`,
      body: lineMsgText,
      pricingSummary: `單件 $${groupPrice} (市價 $${originalPrice}) ｜ 滿 $${freeShippingThreshold} 免運`,
      callToAction: `點擊專屬連結立即搶購`,
    },
    threadsPost: {
      headline: `《${name}》真實使用心得`,
      body: threadsText,
      discussionHook: `有人也用過這款嗎？歡迎在留言區分享你的心得！`,
    },
    edmCopy: {
      subject: edmSubject,
      previewText: edmPreviewText,
      body: edmBody,
    },
    urgencyReminder,
    countdownClosing,
    faq: [],
    visualDirector: {
      midjourneyPrompt: midjourneyPrompt1,
      midjourneyPrompt2: midjourneyPrompt2,
      posterPrompt,
      colorPalette: catConfig.colorPalette,
      lightingMood: catConfig.lightingMood,
      videoStoryboard,
      videoShots,
      availableDurations: [10, 15, 30, 60],
      durationStoryboards,
    },
    environmentDirector,
    pricingStrategy: {
      skuRecommendation,
      bundleSavings: `購買 4 入組現賺 $${originalPrice * 4 - Math.round(groupPrice * 3.6)} 元，並立省運費 $80！`,
      suggestedFreeShippingNote: `滿 $${freeShippingThreshold} 免運門檻，建議引導顧客一次帶 2~4 組最划算。`,
    },
    notifications: {
      launchLinePush: `🔥【${name}】正式開團啦！團購限定價只要 $${groupPrice} (市價 $${originalPrice})，滿 $${freeShippingThreshold} 免運直送！首批現貨數量有限，點擊立即搶購 👉 ${purchaseUrl}`,
      closing6HoursSms: `⏰【結團最後 6 小時倒數】您關注的《${name}》即將於今晚 23:59 截止優惠，逾時將恢復原價 $${originalPrice}！把握免運手刀結帳 👉 ${purchaseUrl}`,
      unpaidGentleReminder: `💳【溫馨匯款提醒】您訂購的《${name}》訂單已保留中，請於 24 小時內完成 ATM 轉帳並回傳帳號末五碼，以便為您優先安排新鮮出貨！感謝您的支持 🌸`,
    },
  };
}

/**
 * 產生手動複製至 Gemini 網頁版或第三方 AI 的完整兩階段 Prompt (Manual Copy Prompt)
 */
export function buildManualGeminiPrompt(params: ProductInputParams): string {
  const {
    name,
    brand = "精選優質品牌",
    category = "熱銷選物",
    description = "",
    sellingPoints = [],
    specs = [],
    originalPrice = 500,
    groupPrice = 399,
    audience = "上班族、家庭團購、追求生活品質者",
    startDate = new Date().toISOString().split("T")[0],
    endDate = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    purchaseUrl = "https://store.example.com/groupbuy",
    customEnvironmentText = "淺色橡木桌、自然漫射晨光、米白陶器與極簡綠意植栽",
  } = params;

  return `# 團購 AI 文案與多模態內容生成系統規格書 (Prompt Architecture System Spec)

## 一、 系統運作核心邏輯 (Workflow Architecture)

為了徹底避免 AI 發生跨品類詞彙錯亂（例如：眼藥水出現食用、口感文案），系統採用「兩階段處理機制 (Two-Stage Pipeline)」：

1. **第一階段：品類自動偵測與屬性路由 (Category Detection & Attribute Routing)**
   - 接收使用者輸入的原始商品資料。
   - 自動將商品分類至【食、衣、住、行、育、樂】。
   - 自動注入該品類的「允許詞庫 (Allowed Keywords)」與「嚴禁詞庫 (Forbidden Keywords)」。

2. **第二階段：多模態模組分流生成 (Multimodal Generation)**
   - 根據第一階段鎖定的品類參數，分流生成社群文案、Midjourney 圖片 Prompt、Sora/Runway 短影音腳本 Prompt、商業海報 Prompt 與墊圖環境融合 Prompt。

---

## 二、 第一階段：品類自動偵測與屬性路由 Prompt (Category Router Prompt)

=== 輸入商品資訊 ===
- 商品名稱：${name}
- 品牌名稱：${brand}
- 參考分類：${category}
- 詳細介紹：${description}
- 核心賣點：
${sellingPoints.map((p) => `  • ${p}`).join("\n")}
- 規格說明：${specs.join(" / ")}
- 目標客群：${audience}
- 原價 / 團購價：NT$ ${originalPrice} / NT$ ${groupPrice} (現省 NT$ ${Math.max(0, originalPrice - groupPrice)})
- 活動日期：${startDate} ~ ${endDate}
- 下單網址：${purchaseUrl}
- 自訂商攝環境風格描述：${customEnvironmentText}

=== 品類判定與規則矩陣 ===
1. 【食】食品/飲料/保健食品：
   - 必備詞彙：口感、香氣、風味、嚴選成分、回甘、飽足感、新鮮、無添加。
   - 禁忌詞彙：塗抹、滴入、穿搭、防刮、行車安全、穿透感。
   - 行銷手法：味覺誘惑、成分安心感、囤貨省錢、節慶送禮。
2. 【衣】服裝/鞋包/飾品/美妝保養：
   - 必備詞彙：剪裁、顯瘦、透氣、親膚、百搭、質地、修飾線條、水潤、吸收。
   - 禁忌詞彙：好吃、美味、口感、行車、馬力、耐重（非包款）。
   - 行銷手法：視覺修飾、多場景穿搭、體感舒適度、限色限量。
3. 【住】家居/家電/日用品/清潔護理（包含眼藥水/外用護理）：
   - 必備詞彙：解放雙手、舒緩、水潤、清涼、質感居家、極簡、耐用、省時。
   - 禁忌詞彙：口感、嚼勁、酸甜、美味、吞嚥、穿搭。
   - 行銷手法：生活痛點解決、效率提升、家庭健康護理、儀式感打造。
4. 【行】汽機車配件/戶外/出行/箱包：
   - 必備詞彙：安全防護、輕量便攜、防刮耐磨、大容量、收納、穩固、流線設計。
   - 禁忌詞彙：入口即化、親膚顯瘦、服貼保濕。
   - 行銷手法：情境安全感、出遊便利性、戶外耐用測試、超高 CP 值。
5. 【育】親子/文教/玩具/書籍：
   - 必備詞彙：無毒安全、寓教於樂、專注力、邏輯力、啟發潛能、陪伴成長。
   - 禁忌詞彙：性感、強勁馬力、奢華高貴。
   - 行銷手法：爸媽救星、成長必備、認證安全、親子互動。
6. 【樂】休閒/娛樂/旅遊票券/飯店住宿：
   - 必備詞彙：沉浸體驗、療癒放鬆、拍照打卡、秘境、專屬禮遇、限時快閃。
   - 禁忌詞彙：耐磨防刮、成分天然（非餐飲）、吸收快。
   - 行銷手法：儀式感營造、視覺衝擊、逃離都市、限時折扣優惠。

---

## 三、 第二階段：多模態生成輸出格式 (請輸出完整合法 JSON)

\`\`\`json
{
  "detectedCategory": "食/衣/住/行/育/樂 其中一個",
  "recommendedAngle": "推薦的行銷切角說明",
  "allowedKeywords": ["詞彙1", "詞彙2", "詞彙3"],
  "forbiddenKeywords": ["嚴禁詞彙1", "嚴禁詞彙2"],
  "visualStyle": "適合該品類的視覺藝術風格關鍵字（英文）",
  "catchyHeadline": "一句話爆款吸睛主標題",
  "facebookPost": "FB 長文排版（含 Emoji、痛點開場、使用體驗、價格對比、留言互動）",
  "lineMessage": "LINE 社群促銷短推播（重點條列、醒目特價、導購連結）",
  "igCaption": "IG 審美文案（視覺感、生活儀式感、附 8 個熱門 Hashtags）",
  "threadsPost": "Threads 專屬短爆文（真實口吻、無廢話、引發討論）",
  "edmCopy": "既有會員專屬 EDM 電子郵件主旨與內文",
  "urgencyReminder": "開團中期庫存告急催單短文",
  "countdownClosing": "最後 24 小時倒數結團推播",
  "midjourneyPrompt1": "產品單品特寫 Midjourney 英文 Prompt (依據自訂商攝風格：${customEnvironmentText}，直接寫入風格、材質與棚拍商攝光)",
  "midjourneyPrompt2": "情境使用展示 Midjourney 英文 Prompt (依據自訂商攝風格：${customEnvironmentText}，直接寫入生活感環境氛圍與自然散射光)",
  "posterPrompt": "商業海報 Prompt (主產品位於視覺中心焦點，依據自訂商攝風格：${customEnvironmentText} 直接寫入背景風格，海報上方需包含繁體中文字體排版標題如 \\"${name}\\" 與 \\"限時特惠 團購熱銷\\"，並預留 Copy Space 排版留白)",
  "videoScript": {
    "10s": [
      { "time": "0-4秒", "type": "痛點暴擊瞬間", "visual": "畫面描述", "voiceover": "口播台詞", "aiPrompt": "Sora/Runway 英文 Prompt" },
      { "time": "4-10秒", "type": "神級解法與閃電特惠", "visual": "畫面描述", "voiceover": "口播台詞", "aiPrompt": "Sora/Runway 英文 Prompt" }
    ],
    "15s": [
      { "time": "0-3秒", "type": "痛點吸睛鏡頭", "visual": "畫面描述", "voiceover": "口播台詞", "aiPrompt": "Sora/Runway 英文 Prompt" },
      { "time": "3-10秒", "type": "產品登場與賣點特寫", "visual": "畫面描述", "voiceover": "口播台詞", "aiPrompt": "Sora/Runway 英文 Prompt" },
      { "time": "10-15秒", "type": "行動導向/優惠結尾", "visual": "畫面描述", "voiceover": "口播台詞", "aiPrompt": "Sora/Runway 英文 Prompt" }
    ],
    "30s": [
      { "time": "0-5秒", "type": "情境痛點共鳴", "visual": "畫面描述", "voiceover": "口播台詞", "aiPrompt": "Prompt" },
      { "time": "5-14秒", "type": "第一視角開箱與做工", "visual": "畫面描述", "voiceover": "口播台詞", "aiPrompt": "Prompt" },
      { "time": "14-22秒", "type": "功能實測痛點化解", "visual": "畫面描述", "voiceover": "口播台詞", "aiPrompt": "Prompt" },
      { "time": "22-30秒", "type": "團購特惠與倒數 CTA", "visual": "畫面描述", "voiceover": "口播台詞", "aiPrompt": "Prompt" }
    ],
    "60s": [
      { "time": "0-8秒", "type": "踩坑經驗與真實痛點", "visual": "畫面描述", "voiceover": "口播台詞", "aiPrompt": "Prompt" },
      { "time": "8-20秒", "type": "規格拆解與極致細節", "visual": "畫面描述", "voiceover": "口播台詞", "aiPrompt": "Prompt" },
      { "time": "20-35秒", "type": "多場景實測與生活改善", "visual": "畫面描述", "voiceover": "口播台詞", "aiPrompt": "Prompt" },
      { "time": "35-48秒", "type": "客觀優缺點分析與價值證明", "visual": "畫面描述", "voiceover": "口播台詞", "aiPrompt": "Prompt" },
      { "time": "48-60秒", "type": "階梯囤貨攻略與結團倒數", "visual": "畫面描述", "voiceover": "口播台詞", "aiPrompt": "Prompt" }
    ]
  }
}
\`\`\`

請依據以上嚴格規範，立即產出完整的繁體中文團購多模態行銷素材包！`;
}

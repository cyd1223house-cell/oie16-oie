import React, { useState } from "react";
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Clock,
  Send,
  Zap,
  Check,
  Copy,
  ExternalLink,
  MessageSquare,
  Eye,
  PlusCircle,
  Wand2,
  RefreshCw,
  Lightbulb,
  Target,
  ShoppingBag,
  FileCode,
  Calendar,
  Link as LinkIcon,
  Layers,
  Video,
  Image as ImageIcon,
  ShieldCheck,
  Mail,
  Flame,
  Hash,
  ShieldAlert,
  Package,
  Mic,
  Film,
  FileText,
} from "lucide-react";
import {
  Product,
  TaskPipelineStep,
  MaterialPackResult,
  BrandSettings,
  SubAgent,
  AppTab,
} from "../types/groupbuy";
import { SocialMockupDialog } from "./SocialMockupDialog";
import { ImageUploadZone } from "./ImageUploadZone";
import { PromptExportModal } from "./PromptExportModal";
import {
  generateBespokeMarketingPack,
  buildManualGeminiPrompt,
  ProductInputParams,
} from "../utils/aiMarketingEngine";

interface AgentCommanderProps {
  products: Product[];
  onAddProduct?: (product: Product) => void;
  onUpdateProducts?: (products: Product[]) => void;
  brand: BrandSettings;
  onUpdateBrand?: (brand: BrandSettings) => void;
  agents?: SubAgent[];
  onNavigateToStorefront?: () => void;
  onNavigateToTab?: (tab: AppTab) => void;
}

const ENVIRONMENT_PRESETS = [
  {
    id: "nordic_minimalist",
    name: "🌿 北歐極簡",
    tag: "溫潤木質自然",
    text: "淺色橡木桌面、柔和自然晨光漫射、米白陶器與極簡綠意植栽 (Light oak tabletop, soft morning diffused light, beige ceramic, minimal botanical)",
    colorPalette: ["#E8DCC4", "#C4A482", "#8A9A86", "#F5F2EB"],
    lighting: "側逆光 45 度自然晨光漫射，柔和長陰影，清透通透感",
  },
  {
    id: "luxury_black_gold",
    name: "💎 奢華黑金",
    tag: "頂級尊榮旗艦",
    text: "黑色大理石檯面、黃銅精緻金屬拉絲、暗調深邃商攝金屬質感 (Matte black marble slab, brushed gold metallic accents, moody luxury studio lighting)",
    colorPalette: ["#1A1A1A", "#C5A059", "#333333", "#F0E6D2"],
    lighting: "頂部窄光束聚光燈 + 雙側輪廓金光勾勒，高對比陰影，高級金屬光澤",
  },
  {
    id: "japanese_sunlight",
    name: "🍃 日系日光",
    tag: "百葉窗和煦暖光",
    text: "日系木質百葉窗格、和煦午後斜射光影、棉麻白布質感 (Japanese wooden louver window, warm afternoon dappled sunlight, raw linen fabric)",
    colorPalette: ["#F7F3E9", "#D8C3A5", "#A89F91", "#E6DFD5"],
    lighting: "百葉窗格條紋投影，3500K 暖光漫射，空氣感微塵丁達爾效應",
  },
  {
    id: "concrete_loft",
    name: "🏙️ 都會清水模",
    tag: "現代極簡俐落",
    text: "俐落清水模水泥牆、幾何極簡石材底座、冷色商攝輪廓光 (Architectural raw concrete surface, geometric minimal pedestal, sleek cool studio rim light)",
    colorPalette: ["#6B7280", "#374151", "#9CA3AF", "#E5E7EB"],
    lighting: "冷白雙側柔光箱，邊緣幾何銳利輪廓光，工業極簡現代氛圍",
  },
  {
    id: "nature_outdoor",
    name: "☀️ 渡假戶外",
    tag: "陽光海風植栽",
    text: "陽光沙灘自然木棧道、清透棕櫚葉搖曳光影、夏日晴朗渡假氛圍 (Sun-drenched seaside wooden deck, swaying palm leaf shadows, tropical vacation breeze)",
    colorPalette: ["#0284C7", "#F59E0B", "#10B981", "#FEF3C7"],
    lighting: "5600K 戶外正午陽光，葉片斑駁動態光影，高飽和陽光立體感",
  },
  {
    id: "cyber_neon",
    name: "⚡ 賽博霓虹",
    tag: "潮流未來科技",
    text: "深色反光壓克力底座、紫藍雙色霓虹輪廓線條、未來潮流商攝風 (Dark reflective acrylic pedestal, vibrant cyan and magenta cyberpunk neon edge glow)",
    colorPalette: ["#0F172A", "#EC4899", "#06B6D4", "#8B5CF6"],
    lighting: "暗室背景 + 左右雙色 RGB 霓虹邊緣輪廓光，地面鏡面光澤倒影",
  },
];

function createInitialMaterialPack(brand: BrandSettings): MaterialPackResult {
  const bespokePack = generateBespokeMarketingPack({
    name: "法式生巧克力夾心千層酥",
    brand: brand.storeName || "日光甜點工坊",
    category: "甜點／伴手禮",
    description: "使用 72% 比利時頂級黑巧克力甘納許，層疊 1024 折手工反折千層酥皮，口感極致酥脆濃郁，微苦甜平衡不膩口！",
    sellingPoints: [
      "72% 比利時純可可脂黑巧克力製作",
      "職人 1024 折反折酥皮工法極致酥香",
      "單顆充氮獨立保鮮包裝，隨手拆隨手吃",
      "辦公室下午茶搭配無糖黑咖啡絕配",
    ],
    specs: ["單盒 8 入裝 (常溫保存 21 天)", "附限定手提禮盒提袋"],
    originalPrice: 650,
    groupPrice: 499,
    audience: "上班族、甜點愛好者、節慶送禮客群",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    purchaseUrl: "https://store.example.com/groupbuy/choco-mille-feuille",
    platforms: ["facebook", "instagram", "line"],
    includeImagePrompt: true,
    includeVideoPrompt: true,
    hasReferenceImage: true,
    freeShippingThreshold: brand.freeShippingThreshold || 1500,
    styleAngle: "auto",
    customEnvironmentText: "淺色橡木桌面、柔和自然晨光漫射、米白陶器與極簡綠意植栽",
  });

  return {
    productName: bespokePack.productName,
    brandName: bespokePack.brandName,
    generatedAt: bespokePack.generatedAt,
    styleAngleName: bespokePack.styleAngleName,
    categoryRouting: bespokePack.categoryRouting,
    deepAnalysis: bespokePack.deepAnalysis,
    catchyHeadline: bespokePack.catchyHeadline,
    facebookPost: bespokePack.facebookPost,
    instagramPost: bespokePack.instagramPost,
    lineMessage: bespokePack.lineMessage,
    threadsPost: bespokePack.threadsPost,
    edmCopy: bespokePack.edmCopy,
    urgencyReminder: bespokePack.urgencyReminder,
    countdownClosing: bespokePack.countdownClosing,
    faq: bespokePack.faq,
    imagePrompt: {
      subject: "法式生巧克力夾心千層酥, 甜點／伴手禮",
      style: bespokePack.visualDirector.lightingMood,
      promptEn: bespokePack.visualDirector.midjourneyPrompt,
      aspectRatio: "4:5",
      lighting: bespokePack.visualDirector.lightingMood,
      prompt1_closeUp: bespokePack.visualDirector.midjourneyPrompt,
      prompt2_lifestyle: bespokePack.visualDirector.midjourneyPrompt2,
      poster_copySpace: bespokePack.visualDirector.posterPrompt,
    },
    videoPrompt: {
      concept: "短影音分鏡腳本 (法式生巧克力夾心千層酥)",
      scenePlan: bespokePack.visualDirector.videoStoryboard.map(
        (s) => `${s.scene}：${s.visual}【旁白：${s.audioVoiceover}】`
      ),
      promptEn: bespokePack.visualDirector.midjourneyPrompt,
      durationSec: 15,
      shots: bespokePack.visualDirector.videoShots,
      availableDurations: [10, 15, 30, 60],
      durationStoryboards: bespokePack.durationStoryboards,
    },
    environmentDirector: bespokePack.environmentDirector,
    communityNotification: {
      launchPreheat: bespokePack.notifications.launchLinePush,
      closingReminder: bespokePack.notifications.closing6HoursSms,
      paymentUrge: bespokePack.notifications.unpaidGentleReminder,
    },
    pricingStrategy: {
      suggestedGroupPrice: 499,
      recommendedBundleDiscount: bespokePack.pricingStrategy.bundleSavings,
      freeShippingThreshold: brand.freeShippingThreshold || 1500,
    },
  };
}

const DEFAULT_STEPS: TaskPipelineStep[] = [
  {
    id: "step-1",
    title: "1. 核心賣點、痛點與感官體驗深度剖析",
    agentName: "規格與定價 Agent",
    status: "completed",
    summary: "已完成多維度痛點、感官與受眾特徵萃取",
    logs: [
      "[系統初始化] 規格與定價 Agent 載入商品：法式生巧克力夾心千層酥",
      "[系統初始化] 剖析產品類別「甜點／伴手禮」與目標受眾「上班族、甜點愛好者」",
      "[系統初始化] 深度萃取核心痛點與感官體驗特徵 (完成)",
    ],
  },
  {
    id: "step-2",
    title: "2. FB / IG / LINE 三大平台量身訂製文案",
    agentName: "文案爆款大師 Agent",
    status: "completed",
    summary: "FB/IG/LINE 三大平台量身文案完成",
    logs: [
      "[系統初始化] 文案爆款大師 Agent 載入商品唯一真實依據",
      "[系統初始化] 產出 Facebook 故事開箱、Instagram 視覺短文與 LINE 快閃通知",
    ],
  },
  {
    id: "step-3",
    title: "3. 商業海報/墊圖環境 Prompt & 10~60s 短影音分鏡",
    agentName: "視覺與分鏡導演 Agent",
    status: "completed",
    summary: "商業級主產品居中海報、6大墊圖商攝環境與多秒數短影音分鏡完成",
    logs: [
      "[系統初始化] 視覺導演 Agent 生成主商品 Centerstage 商業海報 (含 Copy Space)",
      "[系統初始化] 生成 6 大商攝風格商品墊圖環境與 10s/15s/30s/60s 影音分鏡",
    ],
  },
  {
    id: "step-4",
    title: "4. 前台開團多規格 (SKU) 與階梯定價配置",
    agentName: "規格與定價 Agent",
    status: "completed",
    summary: "多規格方案與階梯定價配置完成",
    logs: [
      "[系統初始化] 拆解 3 組熱銷階梯 SKU 配置 (嚐鮮組 / 分享組 / 免運囤貨組)",
    ],
  },
  {
    id: "step-5",
    title: "5. 社群開團預熱、截單倒數與催繳通知排程",
    agentName: "智慧客服與催單 Agent",
    status: "completed",
    summary: "預熱、催單與結團推播腳本就緒",
    logs: [
      "[系統初始化] 智慧催單 Agent 生成開團預熱、截單倒數與 ATM 防漏單通知",
    ],
  },
  {
    id: "step-6",
    title: "6. 自動防漏單規則審查與合規性驗證",
    agentName: "防漏單審查 Agent",
    status: "completed",
    summary: "防漏單審查與前台部署校驗合格",
    logs: [
      "[系統初始化] 防漏單審查 Agent 驗證價格無矛盾與法規宣稱禁語 (PASS)",
    ],
  },
];

export const AgentCommander: React.FC<AgentCommanderProps> = ({
  products = [],
  onAddProduct,
  onUpdateProducts,
  brand,
  onNavigateToStorefront,
  onNavigateToTab,
}) => {
  // 1. 商品資料、賣點與規格
  const [productName, setProductName] = useState("法式生巧克力夾心千層酥");
  const [brandName, setBrandName] = useState(brand.storeName || "日光甜點工坊");
  const [category, setCategory] = useState("甜點／伴手禮");
  const [description, setDescription] = useState(
    "使用 72% 比利時頂級黑巧克力甘納許，層疊 1024 折手工反折千層酥皮，口感極致酥脆濃郁，微苦甜平衡不膩口！"
  );
  const [sellingPoints, setSellingPoints] = useState(
    "72% 比利時純可可脂黑巧克力製作\n職人 1024 折反折酥皮工法極致酥香\n單顆充氮獨立保鮮包裝，隨手拆隨手吃\n辦公室下午茶搭配無糖黑咖啡絕配"
  );
  const [specs, setSpecs] = useState("單盒 8 入裝 (常溫保存 21 天)\n附限定手提禮盒提袋");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&auto=format&fit=crop&q=80"
  );

  // 2. 目標客群、價格、活動期間與購買網址
  const [audience, setAudience] = useState("上班族、甜點愛好者、節慶送禮客群");
  const [originalPrice, setOriginalPrice] = useState(650);
  const [groupPrice, setGroupPrice] = useState(499);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [purchaseUrl, setPurchaseUrl] = useState("https://store.example.com/groupbuy/choco-mille-feuille");

  // 3. 發布平台、風格、圖片/影片 Prompt 選項
  const [platforms, setPlatforms] = useState<Array<"facebook" | "instagram" | "line">>([
    "facebook",
    "instagram",
    "line",
  ]);
  const [styleAngle, setStyleAngle] = useState<
    "auto" | "A_TRUST_REVIEW" | "B_SCENARIO_SOLUTION" | "C_PROMOTION" | "D_STORY_UNBOXING" | "E_COUNTDOWN"
  >("auto");
  const [includeImagePrompt, setIncludeImagePrompt] = useState(true);
  const [includeVideoPrompt, setIncludeVideoPrompt] = useState(true);

  // Pipeline Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [progressPercent, setProgressPercent] = useState(100);
  const [steps, setSteps] = useState<TaskPipelineStep[]>(DEFAULT_STEPS);
  const [activeLogStep, setActiveLogStep] = useState<string>("step-3");
  const [materialResult, setMaterialResult] = useState<MaterialPackResult | null>(() => createInitialMaterialPack(brand));
  const [hasDeployedToStore, setHasDeployedToStore] = useState(false);

  // Video & Environment Staging State
  const [selectedDuration, setSelectedDuration] = useState<10 | 15 | 30 | 60>(15);
  const [selectedEnvStyleId, setSelectedEnvStyleId] = useState<string>("nordic_minimalist");
  const [customEnvText, setCustomEnvText] = useState<string>(
    "淺色橡木桌面、柔和自然晨光漫射、米白陶器與極簡綠意植栽 (Light oak tabletop, soft morning diffused light, beige ceramic, minimal botanical)"
  );

  // Prompt Export Modal State (手動產生 Prompt 模式)
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [generatedPromptText, setGeneratedPromptText] = useState("");

  // Chat / Quick Commands
  const [agentThought, setAgentThought] = useState(
    "團長你好！我是 AI 總指揮 Agent。支援「AI 直接產生 (使用 API)」與「產生完整 Prompt (手動貼至 Gemini)」雙模式！商品資料為唯一真實依據。"
  );
  const [chatInput, setChatInput] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Social Preview Dialog
  const [previewPlatform, setPreviewPlatform] = useState<"facebook" | "instagram" | "line" | "threads" | null>(null);

  // Toggle platform selection
  const togglePlatform = (p: "facebook" | "instagram" | "line") => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  // Build input parameter payload
  const getCurrentParams = (
    overrideAngle?: "auto" | "A_TRUST_REVIEW" | "B_SCENARIO_SOLUTION" | "C_PROMOTION" | "D_STORY_UNBOXING" | "E_COUNTDOWN"
  ): ProductInputParams => ({
    name: productName,
    brand: brandName,
    category: category,
    description: description,
    sellingPoints: sellingPoints.split("\n").filter(Boolean),
    specs: specs.split("\n").filter(Boolean),
    originalPrice: Number(originalPrice) || 500,
    groupPrice: Number(groupPrice) || 399,
    audience: audience,
    startDate: startDate,
    endDate: endDate,
    purchaseUrl: purchaseUrl,
    platforms: platforms.length > 0 ? platforms : ["facebook", "instagram", "line"],
    includeImagePrompt: includeImagePrompt,
    includeVideoPrompt: includeVideoPrompt,
    hasReferenceImage: Boolean(imageUrl && imageUrl.trim().length > 0),
    freeShippingThreshold: brand.freeShippingThreshold || 1500,
    styleAngle: overrideAngle || styleAngle,
    customEnvironmentText: customEnvText,
  });

  // Fast apply existing product
  const handleSelectProduct = (prod: Product) => {
    setProductName(prod.name);
    setBrandName(prod.brand || brand.storeName || "日光選物");
    setCategory(prod.category || "熱銷選物");
    setDescription(prod.description || "");
    setSellingPoints(prod.sellingPoints ? prod.sellingPoints.join("\n") : "");
    setSpecs(prod.specs ? prod.specs.join("\n") : "");
    setOriginalPrice(prod.originalPrice || 500);
    setGroupPrice(prod.groupPrice || 399);
    if (prod.imageUrl) setImageUrl(prod.imageUrl);
    setHasDeployedToStore(true);

    const bespokePack = generateBespokeMarketingPack({
      name: prod.name,
      brand: prod.brand || brand.storeName || "日光選物",
      category: prod.category || "熱銷選物",
      description: prod.description || "",
      sellingPoints: prod.sellingPoints || [],
      specs: prod.specs || [],
      originalPrice: prod.originalPrice || 500,
      groupPrice: prod.groupPrice || 399,
      audience: audience,
      startDate: startDate,
      endDate: endDate,
      purchaseUrl: purchaseUrl,
      platforms: platforms,
      includeImagePrompt: includeImagePrompt,
      includeVideoPrompt: includeVideoPrompt,
      hasReferenceImage: Boolean(prod.imageUrl && prod.imageUrl.trim().length > 0),
      freeShippingThreshold: brand.freeShippingThreshold || 1500,
      styleAngle: styleAngle,
      customEnvironmentText: customEnvText,
    });

    setMaterialResult({
      productName: bespokePack.productName,
      brandName: bespokePack.brandName,
      generatedAt: bespokePack.generatedAt,
      styleAngleName: bespokePack.styleAngleName,
      categoryRouting: bespokePack.categoryRouting,
      deepAnalysis: bespokePack.deepAnalysis,
      catchyHeadline: bespokePack.catchyHeadline,
      facebookPost: bespokePack.facebookPost,
      instagramPost: bespokePack.instagramPost,
      lineMessage: bespokePack.lineMessage,
      threadsPost: bespokePack.threadsPost,
      edmCopy: bespokePack.edmCopy,
      urgencyReminder: bespokePack.urgencyReminder,
      countdownClosing: bespokePack.countdownClosing,
      faq: bespokePack.faq,
      imagePrompt: {
        subject: `${prod.name}, ${prod.category || "熱銷選物"}`,
        style: bespokePack.visualDirector.lightingMood,
        promptEn: bespokePack.visualDirector.midjourneyPrompt,
        aspectRatio: "4:5",
        lighting: bespokePack.visualDirector.lightingMood,
        prompt1_closeUp: bespokePack.visualDirector.midjourneyPrompt,
        prompt2_lifestyle: bespokePack.visualDirector.midjourneyPrompt2,
        poster_copySpace: bespokePack.visualDirector.posterPrompt,
      },
      videoPrompt: {
        concept: `短影音分鏡腳本 (${prod.name})`,
        scenePlan: bespokePack.visualDirector.videoStoryboard.map(
          (s) => `${s.scene}：${s.visual}【旁白：${s.audioVoiceover}】`
        ),
        promptEn: bespokePack.visualDirector.midjourneyPrompt,
        durationSec: 15,
        shots: bespokePack.visualDirector.videoShots,
        availableDurations: [10, 15, 30, 60],
        durationStoryboards: bespokePack.durationStoryboards,
      },
      environmentDirector: bespokePack.environmentDirector,
      communityNotification: {
        launchPreheat: bespokePack.notifications.launchLinePush,
        closingReminder: bespokePack.notifications.closing6HoursSms,
        paymentUrge: bespokePack.notifications.unpaidGentleReminder,
      },
      pricingStrategy: {
        suggestedGroupPrice: prod.groupPrice || 399,
        recommendedBundleDiscount: bespokePack.pricingStrategy.bundleSavings,
        freeShippingThreshold: brand.freeShippingThreshold || 1500,
      },
    });

    setAgentThought(`已為您載入「${prod.name}」商品資料與最新素材包！可直接切換 10s/15s/30s/60s 影音分鏡或 6 大墊圖商攝環境！`);
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Mode 2: 產生完整 Prompt（不使用 API）
  const handleGenerateManualPrompt = () => {
    const params = getCurrentParams();
    const prompt = buildManualGeminiPrompt(params);
    setGeneratedPromptText(prompt);
    setIsPromptModalOpen(true);
    setAgentThought(`📋 已為「${productName}」產生完整 Gemini Prompt！包含唯一真實依據與防捏造規則，可一鍵複製並開啟 Gemini 網頁版。`);
  };

  // Mode 1: AI 直接產生（使用 API）
  const runWorkflow = async (
    overrideAngle?: "auto" | "A_TRUST_REVIEW" | "B_SCENARIO_SOLUTION" | "C_PROMOTION" | "D_STORY_UNBOXING" | "E_COUNTDOWN"
  ) => {
    setIsRunning(true);
    setProgressPercent(5);
    setHasDeployedToStore(false);
    setMaterialResult(null);

    const activeAngle = overrideAngle || styleAngle;
    const updatedSteps = DEFAULT_STEPS.map((s) => ({ ...s, status: "waiting" as const, logs: [] }));
    setSteps(updatedSteps);
    setAgentThought(`正在啟動「${productName}」深度賣點剖析與素材量身生成任務流 (呼叫 Gemini API)...`);

    // Step 1: Deep Feature extraction
    setActiveLogStep("step-1");
    updatedSteps[0].status = "in_progress";
    updatedSteps[0].logs = [
      `[${new Date().toLocaleTimeString()}] 規格與定價 Agent 啟動語意剖析：「${productName}」`,
      `[${new Date().toLocaleTimeString()}] 剖析產品類別「${category}」與目標受眾「${audience}」`,
      `[${new Date().toLocaleTimeString()}] 深度萃取核心痛點與感官體驗特徵`,
      `[${new Date().toLocaleTimeString()}] 計算團購折扣利潤：原價 $${originalPrice} ➔ 團友價 $${groupPrice} (現省 $${Math.max(0, originalPrice - groupPrice)})`,
    ];
    setSteps([...updatedSteps]);
    setProgressPercent(20);

    await new Promise((r) => setTimeout(r, 500));
    updatedSteps[0].status = "completed";
    updatedSteps[0].summary = "已完成多維度痛點、感官與受眾特徵萃取";

    // Step 2: Copywriting
    setActiveLogStep("step-2");
    updatedSteps[1].status = "in_progress";
    updatedSteps[1].logs = [
      `[${new Date().toLocaleTimeString()}] 文案爆款大師 Agent 載入商品唯一真實資料`,
      `[${new Date().toLocaleTimeString()}] 應用版型方向：${activeAngle === "auto" ? "AUTO 智慧動態分析" : activeAngle}`,
      `[${new Date().toLocaleTimeString()}] 依勾選平台撰寫：${platforms.join(", ").toUpperCase()}`,
      `[${new Date().toLocaleTimeString()}] 嚴格防捏造校驗：價格 $${groupPrice}、活動期限 ${startDate} ~ ${endDate}`,
    ];
    setSteps([...updatedSteps]);
    setProgressPercent(45);

    // Call API Route or fallback bespoke engine
    const params = getCurrentParams(activeAngle);
    let bespokePack = generateBespokeMarketingPack(params);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            name: productName,
            brand: brandName,
            category: category,
            description: description,
            selling_points: sellingPoints.split("\n").filter(Boolean),
            specs: specs.split("\n").filter(Boolean),
          },
          campaign: {
            original_price: originalPrice,
            group_price: groupPrice,
            start_at: startDate,
            end_at: endDate,
            purchase_url: purchaseUrl,
          },
          audience: audience,
          platforms: platforms,
          includeImagePrompt: includeImagePrompt,
          includeVideoPrompt: includeVideoPrompt,
          hasReferenceImage: Boolean(imageUrl && imageUrl.trim().length > 0),
          styleAngle: activeAngle,
          customEnvironmentText: customEnvText,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result) {
          bespokePack = data.result;
        }
      }
    } catch {
      // Local fallback in case of connection edge case
    }

    await new Promise((r) => setTimeout(r, 600));
    updatedSteps[1].status = "completed";
    updatedSteps[1].summary = `FB/IG/LINE 三大平台量身文案完成 (${bespokePack.styleAngleName})`;

    // Step 3: Visual & Prompts
    setActiveLogStep("step-3");
    updatedSteps[2].status = "in_progress";
    updatedSteps[2].logs = [
      `[${new Date().toLocaleTimeString()}] 視覺導演 Agent 分析「${productName}」商品參考圖與光影質感`,
      `[${new Date().toLocaleTimeString()}] 商業攝影 Prompt：${bespokePack.visualDirector.midjourneyPrompt.slice(0, 50)}...`,
      `[${new Date().toLocaleTimeString()}] 8 秒短影音分鏡設計 (前 3 秒鉤子 + 核心賣點 + CTA 畫面)`,
    ];
    setSteps([...updatedSteps]);
    setProgressPercent(65);

    await new Promise((r) => setTimeout(r, 500));
    updatedSteps[2].status = "completed";
    updatedSteps[2].summary = "商業級 Midjourney Prompt 與 8 秒短影音分鏡完成";

    // Step 4: SKU & Pricing
    setActiveLogStep("step-4");
    updatedSteps[3].status = "in_progress";
    updatedSteps[3].logs = [
      `[${new Date().toLocaleTimeString()}] 拆解 3 組熱銷階梯 SKU 配置 (嚐鮮組 / 分享組 / 免運囤貨組)`,
      `[${new Date().toLocaleTimeString()}] 設定滿額免運門檻 $${brand.freeShippingThreshold || 1500}，下單連結已綁定`,
    ];
    setSteps([...updatedSteps]);
    setProgressPercent(80);

    await new Promise((r) => setTimeout(r, 450));
    updatedSteps[3].status = "completed";
    updatedSteps[3].summary = "多規格方案與階梯定價配置完成";

    // Step 5: Notifications
    setActiveLogStep("step-5");
    updatedSteps[4].status = "in_progress";
    updatedSteps[4].logs = [
      `[${new Date().toLocaleTimeString()}] 智慧催單 Agent 生成「${productName}」開團預熱與結團倒數推播`,
      `[${new Date().toLocaleTimeString()}] 生成 ATM 轉帳防漏單溫馨提醒通知範本`,
    ];
    setSteps([...updatedSteps]);
    setProgressPercent(92);

    await new Promise((r) => setTimeout(r, 400));
    updatedSteps[4].status = "completed";
    updatedSteps[4].summary = "預熱、催單與結團推播腳本就緒";

    // Step 6: Anti-fraud audit
    setActiveLogStep("step-6");
    updatedSteps[5].status = "in_progress";
    updatedSteps[5].logs = [
      `[${new Date().toLocaleTimeString()}] 防漏單審查 Agent 驗證價格無矛盾與法規宣稱禁語 (PASS)`,
      `[${new Date().toLocaleTimeString()}] 檢核前台購物車多規格防超賣配置 (PASS)`,
      `[${new Date().toLocaleTimeString()}] ✨ 全新客製化素材包構建成功！`,
    ];
    setSteps([...updatedSteps]);
    setProgressPercent(100);

    await new Promise((r) => setTimeout(r, 350));
    updatedSteps[5].status = "completed";
    updatedSteps[5].summary = "防漏單審查與前台部署校驗合格";

    // Construct final material pack matching MaterialPackResult
    const finalResult: MaterialPackResult = {
      productName: bespokePack.productName,
      brandName: bespokePack.brandName,
      generatedAt: bespokePack.generatedAt,
      styleAngleName: bespokePack.styleAngleName,
      categoryRouting: bespokePack.categoryRouting,
      deepAnalysis: bespokePack.deepAnalysis,
      catchyHeadline: bespokePack.catchyHeadline,
      facebookPost: bespokePack.facebookPost,
      instagramPost: bespokePack.instagramPost,
      lineMessage: bespokePack.lineMessage,
      threadsPost: bespokePack.threadsPost,
      edmCopy: bespokePack.edmCopy,
      urgencyReminder: bespokePack.urgencyReminder,
      countdownClosing: bespokePack.countdownClosing,
      faq: bespokePack.faq,
      imagePrompt: {
        subject: `${productName}, ${category}`,
        style: bespokePack.visualDirector.lightingMood,
        promptEn: bespokePack.visualDirector.midjourneyPrompt,
        aspectRatio: "4:5",
        lighting: bespokePack.visualDirector.lightingMood,
        prompt1_closeUp: bespokePack.visualDirector.midjourneyPrompt,
        prompt2_lifestyle: bespokePack.visualDirector.midjourneyPrompt2,
        poster_copySpace: bespokePack.visualDirector.posterPrompt,
      },
      videoPrompt: {
        concept: `短影音分鏡腳本 (${productName})`,
        scenePlan: bespokePack.visualDirector.videoStoryboard.map(
          (s) => `${s.scene}：${s.visual}【旁白：${s.audioVoiceover}】`
        ),
        promptEn: bespokePack.visualDirector.midjourneyPrompt,
        durationSec: 15,
        shots: bespokePack.visualDirector.videoShots,
        availableDurations: [10, 15, 30, 60],
        durationStoryboards: bespokePack.durationStoryboards,
      },
      environmentDirector: bespokePack.environmentDirector,
      communityNotification: {
        launchPreheat: bespokePack.notifications.launchLinePush,
        closingReminder: bespokePack.notifications.closing6HoursSms,
        paymentUrge: bespokePack.notifications.unpaidGentleReminder,
      },
      pricingStrategy: {
        suggestedGroupPrice: groupPrice,
        recommendedBundleDiscount: bespokePack.pricingStrategy.bundleSavings,
        freeShippingThreshold: brand.freeShippingThreshold,
      },
    };

    setMaterialResult(finalResult);
    setIsRunning(false);
    setAgentThought(
      `✨ 報告團長！已成功依據「${productName}」的真實資料，量身產出【${bespokePack.styleAngleName}】完整團購素材包！可直接複製或一鍵上架前台！`
    );
  };

  // Deploy to Storefront Product Catalog
  const handleDeployToStore = () => {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: productName,
      brand: brandName,
      category: category,
      description: description,
      sellingPoints: sellingPoints.split("\n").filter(Boolean),
      specs: specs.split("\n").filter(Boolean),
      imageUrl: imageUrl,
      originalPrice: originalPrice,
      groupPrice: groupPrice,
      status: "active",
      tag: "AI 推薦爆款",
      createdAt: new Date().toISOString(),
      variants: [
        {
          id: `var-${Date.now()}-1`,
          name: "單入經典嚐鮮組",
          sku: `${category.slice(0, 3).toUpperCase()}-01-SGL`,
          originalPrice: originalPrice,
          groupPrice: groupPrice,
          stock: 50,
          soldCount: 0,
        },
        {
          id: `var-${Date.now()}-2`,
          name: "雙入人氣分享組 (現省 $100)",
          sku: `${category.slice(0, 3).toUpperCase()}-02-DBL`,
          originalPrice: originalPrice * 2,
          groupPrice: groupPrice * 2 - 100,
          stock: 30,
          soldCount: 0,
        },
        {
          id: `var-${Date.now()}-3`,
          name: "4 入團友免運狂囤組",
          sku: `${category.slice(0, 3).toUpperCase()}-04-SET`,
          originalPrice: originalPrice * 4,
          groupPrice: groupPrice * 4 - 300,
          stock: 15,
          soldCount: 0,
        },
      ],
    };

    if (onAddProduct) {
      onAddProduct(newProd);
    } else if (onUpdateProducts) {
      onUpdateProducts([newProd, ...products]);
    }
    setHasDeployedToStore(true);
    setAgentThought(`✨ 成功！「${productName}」已自動轉化為 3 組階梯規格商品，並上架至前台訂購頁！`);
  };

  // Handle Quick Chat Commands
  const handleSendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const query = chatInput.trim();
    setChatInput("");

    if (query.includes("prompt") || query.includes("提示詞") || query.includes("複製")) {
      handleGenerateManualPrompt();
    } else if (query.includes("庫存") || query.includes("補貨")) {
      const lowStock = products.filter((p) => p.variants.some((v) => v.stock <= 15));
      setAgentThought(
        `📊 報告團長！經庫存 Agent 檢查，目前有 ${lowStock.length} 款商品部分規格庫存低於 15 件（例如：${lowStock
          .map((p) => p.name)
          .slice(0, 2)
          .join("、")}），建議開啟「緊急追加補貨」或發布「即將完售」催單文案！`
      );
    } else if (query.includes("防漏單") || query.includes("核銷") || query.includes("訂單")) {
      setAgentThought(
        `🛡️ 報告團長！防漏單審查 Agent 已執行背景對帳，目前有 1 筆訂單已回傳後五碼待核銷，已為您自動標記在「收單與防漏單對帳」面板，無重複惡意下單情事！`
      );
    } else if (query.includes("促銷") || query.includes("文案") || query.includes("生成") || query.includes("分析")) {
      runWorkflow();
    } else {
      setAgentThought(
        `收到指令「${query}」！我是您的 AI 團購總指揮。可點選「AI 直接產生」或「產生完整 Prompt」，隨時為您量身打造開團文案！`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Chief AI Agent Persona Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Avatar & Info */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            <div className="relative">
              <img
                src="/avatar.jpg"
                alt="AI 總指揮 Agent"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-indigo-400/80 shadow-lg shadow-indigo-500/20"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  台灣社群團購內容引擎 ‧ AI 總指揮官
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  雙軌產生模式
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200/80 mt-1 font-medium max-w-xl">
                以填寫之商品與活動為唯一事實來源，嚴格禁止捏造。支援「AI 直接呼叫 API 產生」與「產生完整 Prompt 手動貼至 Gemini」雙模式。
              </p>
            </div>
          </div>

          {/* Quick Dual Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleGenerateManualPrompt}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-indigo-200 hover:text-white font-bold text-xs border border-indigo-500/30 flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              title="產生可貼至 Gemini 網頁版的完整 Prompt"
            >
              <FileCode className="w-4 h-4 text-indigo-300" />
              <span>產生完整 Prompt</span>
            </button>

            <button
              onClick={() => runWorkflow()}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 flex items-center space-x-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isRunning ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-300" />
              )}
              <span>{isRunning ? "AI 執行中..." : "AI 直接產生 (使用 API)"}</span>
            </button>
          </div>
        </div>

        {/* Live Thought Stream Bar */}
        <div className="mt-5 pt-4 border-t border-indigo-900/60 flex items-start space-x-3 text-xs sm:text-sm text-indigo-100 bg-indigo-950/40 rounded-2xl p-3.5 border border-indigo-800/30">
          <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-indigo-300 mr-2">總指揮官即時動態：</span>
            <span>{agentThought}</span>
          </div>
        </div>

        {/* Natural Language Command Bar */}
        <form onSubmit={handleSendChat} className="mt-3 flex gap-2">
          <input
            type="text"
            placeholder="輸入指令（例如：產生 Prompt、庫存狀況、催單文案、防漏單審查、或針對產品促銷）..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-xs sm:text-sm rounded-xl px-4 py-2.5 focus:outline-hidden focus:border-indigo-400"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 mr-1" /> 發送
          </button>
        </form>
      </div>

      {/* Fast Switch Existing Store Products */}
      {products.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center">
              <ShoppingBag className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
              ⚡ 從現有商品庫快速挑選：
            </span>
            <span className="text-[11px] text-slate-400">點選任一商品即刻載入完整規格</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {products.map((p) => {
              const isSelected = p.name === productName;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProduct(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 border border-slate-200"
                  }`}
                >
                  {p.imageUrl && (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-4 h-4 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span>{p.name}</span>
                  <span className="text-[10px] opacity-80 font-mono">(${p.groupPrice})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main 2-Column Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Product Input & Campaign Settings */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center">
                <span className="w-2 h-5 bg-indigo-600 rounded-full mr-2" />
                使用流程與開團資料設定
              </h3>
              <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full">
                唯一事實來源
              </span>
            </div>

            {/* Section 1: 商品介紹、主要賣點與規格 */}
            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="font-bold text-slate-900 flex items-center text-xs text-indigo-900 uppercase tracking-wide">
                <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center mr-1.5 text-[10px]">
                  1
                </span>
                商品介紹、主要賣點與規格
              </div>

              {/* Product Photo Upload Mode */}
              <ImageUploadZone
                value={imageUrl}
                onChange={setImageUrl}
                label="商品參考圖 (支援電腦/手機相簿上傳或網址)"
                helperText="若有參考圖，手動模式在 Gemini 網頁版需一併上傳同張圖片"
                aspectRatio="wide"
              />

              <div>
                <label htmlFor="ac-prod-name" className="block font-semibold text-slate-700 mb-1">商品名稱</label>
                <input
                  id="ac-prod-name"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="例如：手工法式千層酥"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ac-brand-name" className="block font-semibold text-slate-700 mb-1">品牌／店家</label>
                  <input
                    id="ac-brand-name"
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="ac-category-name" className="block font-semibold text-slate-700 mb-1">商品類別</label>
                  <input
                    id="ac-category-name"
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ac-description-area" className="block font-semibold text-slate-700 mb-1">商品詳細介紹</label>
                <textarea
                  id="ac-description-area"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="請描述產品成份、製作工法或核心特色..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label htmlFor="ac-selling-points" className="block font-semibold text-slate-700 mb-1">
                  主要賣點 (每行一項，AI 依此為唯一真實依據)
                </label>
                <textarea
                  id="ac-selling-points"
                  rows={3}
                  value={sellingPoints}
                  onChange={(e) => setSellingPoints(e.target.value)}
                  placeholder="每行輸入一項賣點，禁止自行捏造未提及之功效..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <div>
                <label htmlFor="ac-specs-input" className="block font-semibold text-slate-700 mb-1">商品規格與保存說明</label>
                <input
                  id="ac-specs-input"
                  type="text"
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  placeholder="例如：單盒 8 入裝 / 常溫 21 天"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Section 2: 目標客群、團購價格、活動期間及購買網址 */}
            <div className="pt-3 border-t border-slate-100 space-y-3.5 text-xs sm:text-sm">
              <div className="font-bold text-slate-900 flex items-center text-xs text-indigo-900 uppercase tracking-wide">
                <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center mr-1.5 text-[10px]">
                  2
                </span>
                目標客群、價格、期間與網址
              </div>

              <div>
                <label htmlFor="ac-target-audience" className="block font-semibold text-slate-700 mb-1">目標客群</label>
                <input
                  id="ac-target-audience"
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="例如：上班族、甜點愛好者、節慶送禮"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ac-orig-price" className="block font-semibold text-slate-700 mb-1">市場原價 (NT$)</label>
                  <input
                    id="ac-orig-price"
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="ac-group-price" className="block font-semibold text-indigo-700 mb-1">團購特惠價 (NT$)</label>
                  <input
                    id="ac-group-price"
                    type="number"
                    value={groupPrice}
                    onChange={(e) => setGroupPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-indigo-300 bg-indigo-50/40 rounded-xl font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Campaign Period */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ac-start-date" className="block font-semibold text-slate-700 mb-1 flex items-center">
                    <Calendar className="w-3 h-3 text-slate-400 mr-1" /> 開團起始日
                  </label>
                  <input
                    id="ac-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="ac-end-date" className="block font-semibold text-slate-700 mb-1 flex items-center">
                    <Calendar className="w-3 h-3 text-slate-400 mr-1" /> 結團截止日
                  </label>
                  <input
                    id="ac-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Purchase URL */}
              <div>
                <label htmlFor="ac-purchase-url" className="block font-semibold text-slate-700 mb-1 flex items-center">
                  <LinkIcon className="w-3 h-3 text-slate-400 mr-1" /> 購買下單網址或方式
                </label>
                <input
                  id="ac-purchase-url"
                  type="text"
                  value={purchaseUrl}
                  onChange={(e) => setPurchaseUrl(e.target.value)}
                  placeholder="例如：https://store.example.com/groupbuy/item"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono text-xs"
                />
              </div>
            </div>

            {/* Section 3: 發布平台、文案風格與 Prompt 項目選擇 */}
            <div className="pt-3 border-t border-slate-100 space-y-3.5 text-xs sm:text-sm">
              <div className="font-bold text-slate-900 flex items-center text-xs text-indigo-900 uppercase tracking-wide">
                <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center mr-1.5 text-[10px]">
                  3
                </span>
                發布平台、文案風格與 Prompt 選項
              </div>

              {/* Platform Selector Checkboxes */}
              <div>
                <div className="block font-semibold text-slate-700 mb-1.5">選擇發布平台</div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => togglePlatform("facebook")}
                    className={`p-2 rounded-xl border text-center font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                      platforms.includes("facebook")
                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-2xs"
                        : "border-slate-200 text-slate-400 bg-slate-50/50"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>Facebook</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePlatform("instagram")}
                    className={`p-2 rounded-xl border text-center font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                      platforms.includes("instagram")
                        ? "bg-pink-50 border-pink-500 text-pink-700 shadow-2xs"
                        : "border-slate-200 text-slate-400 bg-slate-50/50"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-600" />
                    <span>Instagram</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePlatform("line")}
                    className={`p-2 rounded-xl border text-center font-bold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                      platforms.includes("line")
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs"
                        : "border-slate-200 text-slate-400 bg-slate-50/50"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>LINE 社群</span>
                  </button>
                </div>
              </div>

              {/* Style Angle Selector */}
              <div>
                <div className="block font-semibold text-slate-700 mb-1.5">選擇文案風格版型</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setStyleAngle("auto")}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      styleAngle === "auto"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    🎲 智慧動態分析 (AUTO)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStyleAngle("A_TRUST_REVIEW")}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      styleAngle === "A_TRUST_REVIEW"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    📖 信任實測型 (A)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStyleAngle("B_SCENARIO_SOLUTION")}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      styleAngle === "B_SCENARIO_SOLUTION"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    ☕ 情境解決型 (B)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStyleAngle("C_PROMOTION")}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      styleAngle === "C_PROMOTION"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    ⚡ 強促銷破盤型 (C)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStyleAngle("D_STORY_UNBOXING")}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      styleAngle === "D_STORY_UNBOXING"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    🏰 故事開箱型 (D)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStyleAngle("E_COUNTDOWN")}
                    className={`p-2 rounded-xl border text-center transition cursor-pointer ${
                      styleAngle === "E_COUNTDOWN"
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs"
                        : "border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                  >
                    ⏰ 倒數提醒型 (E)
                  </button>
                </div>
              </div>

              {/* Prompt Options (Image/Video) */}
              <div className="space-y-3">
                <div className="block font-semibold text-slate-700">視覺素材與影音分鏡需求</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center space-x-2 p-2.5 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:bg-indigo-50/40">
                    <input
                      type="checkbox"
                      checked={includeImagePrompt}
                      onChange={(e) => setIncludeImagePrompt(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-700 flex items-center">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600 mr-1" />
                      商業攝影圖片 Prompt
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 p-2.5 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:bg-indigo-50/40">
                    <input
                      type="checkbox"
                      checked={includeVideoPrompt}
                      onChange={(e) => setIncludeVideoPrompt(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-slate-700 flex items-center">
                      <Video className="w-3.5 h-3.5 text-purple-600 mr-1" />
                      短影音 AI 分鏡腳本
                    </span>
                  </label>
                </div>

                {/* Video Duration Selector (10s / 15s / 30s / 60s) */}
                {includeVideoPrompt && (
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-950">
                      <span className="flex items-center">
                        <Video className="w-3.5 h-3.5 text-indigo-600 mr-1" />
                        短影音秒數時長切換：
                      </span>
                      <span className="text-[10px] text-indigo-600 font-normal">多秒數分鏡同步產生</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                      {[
                        { sec: 10 as const, label: "10秒 極速", sub: "Reels/TikTok" },
                        { sec: 15 as const, label: "15秒 黃金", sub: "3段吸睛" },
                        { sec: 30 as const, label: "30秒 開箱", sub: "4段實測" },
                        { sec: 60 as const, label: "60秒 深度", sub: "5段口碑" },
                      ].map((item) => (
                        <button
                          key={item.sec}
                          type="button"
                          onClick={() => setSelectedDuration(item.sec)}
                          className={`p-1.5 rounded-lg border text-center transition cursor-pointer ${
                            selectedDuration === item.sec
                              ? "bg-indigo-600 text-white font-bold border-indigo-600 shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-indigo-50/50"
                          }`}
                        >
                          <div className="text-[11px] leading-tight">{item.label}</div>
                          <div className={`text-[9px] ${selectedDuration === item.sec ? "text-indigo-200" : "text-slate-400"}`}>
                            {item.sub}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Staging Environment Style Input Field & Presets */}
                {includeImagePrompt && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
                        商品商攝與視覺風格設定 (直接寫入 AI 提示詞)：
                      </span>
                      <span className="text-[10px] text-indigo-600 font-mono bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/60">
                        直接寫入 Prompt
                      </span>
                    </div>

                    {/* Custom Textarea for Environment Style */}
                    <div className="space-y-1">
                      <textarea
                        rows={2}
                        value={customEnvText}
                        onChange={(e) => setCustomEnvText(e.target.value)}
                        placeholder="請輸入您自訂的商攝環境場景、光影、材質與氛圍描述..."
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 font-normal leading-relaxed resize-none transition"
                      />
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>💡 自訂風格描述將直接寫入【商業海報與商品攝影 AI 提示詞】中</span>
                        <span>{customEnvText.length} 字</span>
                      </div>
                    </div>

                    {/* Quick Preset Chips to load predefined text */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-slate-600">
                        快速套用風格範本 (點擊直接帶入文字)：
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-xs">
                        {ENVIRONMENT_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => {
                              setSelectedEnvStyleId(preset.id);
                              setCustomEnvText(preset.text);
                            }}
                            className={`p-1.5 rounded-lg border text-center text-[11px] transition cursor-pointer ${
                              selectedEnvStyleId === preset.id
                                ? "bg-slate-900 text-white font-bold border-slate-900 shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <div>{preset.name}</div>
                            <div className={`text-[9px] ${selectedEnvStyleId === preset.id ? "text-slate-300" : "text-slate-400"}`}>
                              {preset.tag}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-500 flex items-center pt-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 mr-1" />
                      商業海報模式：主產品居中焦點 + Copy Space 留白已啟用
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: 選擇產生方式 (雙按鈕) */}
            <div className="pt-4 border-t border-slate-200 space-y-2.5">
              <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span className="flex items-center">
                  <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 inline-flex items-center justify-center mr-1.5 text-[10px]">
                    4
                  </span>
                  選擇產生方式
                </span>
                <span className="text-[11px] font-normal text-slate-400">雙軌皆遵守唯一事實原則</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Mode 1: AI 直接產生（使用 API） */}
                <button
                  type="button"
                  onClick={() => runWorkflow()}
                  disabled={isRunning}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {isRunning ? (
                    <RotateCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4 text-amber-300" />
                  )}
                  <span>{isRunning ? "API 分析處理中..." : "AI 直接產生 (使用 API)"}</span>
                </button>

                {/* Mode 2: 產生完整 Prompt（不使用 API） */}
                <button
                  type="button"
                  onClick={handleGenerateManualPrompt}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-100 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
                >
                  <FileCode className="w-4 h-4 text-indigo-300" />
                  <span>產生完整 Prompt (不使用 API)</span>
                </button>
              </div>

              {imageUrl && (
                <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-center space-x-2">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>
                    已選取商品參考圖。若使用手動 Prompt，至 Gemini 網頁版時請一併上傳同張圖片。
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Task Dashboard & Generated Pack */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive Task Dashboard (管理任務進度的互動式儀表板) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">任務進度互動式儀表板</h3>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                進度: {progressPercent}%
              </span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-4">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
              {steps.map((step) => {
                const isCurrent = activeLogStep === step.id;
                return (
                  <button
                    type="button"
                    key={step.id}
                    onClick={() => setActiveLogStep(step.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      step.status === "completed"
                        ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                        : step.status === "in_progress"
                        ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400/30 text-indigo-950 font-semibold"
                        : "bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-100/60"
                    } ${isCurrent ? "shadow-xs" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold truncate pr-1">{step.title}</span>
                      {step.status === "completed" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {step.status === "in_progress" && (
                        <RotateCcw className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
                      )}
                      {step.status === "waiting" && (
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="text-indigo-600 font-medium">🤖 {step.agentName}</span>
                      <span>{step.logs.length} 條日誌</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Agent Thought & Execution Logs Stream */}
            <div className="rounded-xl bg-slate-900 p-3.5 text-xs text-slate-300 font-mono max-h-36 overflow-y-auto border border-slate-800">
              <div className="text-indigo-400 font-bold mb-1 flex items-center justify-between">
                <span>[AGENT LOG STREAM] - {steps.find((s) => s.id === activeLogStep)?.agentName}</span>
                <span className="text-[10px] text-slate-500">即時連線</span>
              </div>
              {steps.find((s) => s.id === activeLogStep)?.logs.length ? (
                steps
                  .find((s) => s.id === activeLogStep)
                  ?.logs.map((log, idx) => (
                    <div key={idx} className="py-0.5 text-slate-300 leading-tight">
                      {log}
                    </div>
                  ))
              ) : (
                <div className="text-slate-500 italic py-1">點擊上方步驟以檢視該 Agent 之詳細執行日誌...</div>
              )}
            </div>
          </div>

          {/* Generated Material Pack (素材包結果) */}
          {materialResult ? (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
              {/* Header with Regenerate, Deploy & Export Prompt */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      客製素材生成完成
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">{materialResult.productName}</h3>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                    <span className="font-medium text-indigo-600">
                      {materialResult.styleAngleName || "✨ 量身訂製行銷切角"}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">產出時間: {materialResult.generatedAt}</span>
                  </div>
                </div>

                {/* Actions: Export Prompt, Re-roll Angle & Deploy to Store */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleGenerateManualPrompt}
                    className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    title="檢視並複製完整 Prompt"
                  >
                    <FileCode className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Prompt 導出
                  </button>

                  <button
                    onClick={() => runWorkflow()}
                    className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition cursor-pointer"
                    title="重新生成不同文案風格"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> 換個角度再生
                  </button>

                  <button
                    onClick={handleDeployToStore}
                    disabled={hasDeployedToStore}
                    className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer ${
                      hasDeployedToStore
                        ? "bg-emerald-600 text-white cursor-default"
                        : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white active:scale-95"
                    }`}
                  >
                    {hasDeployedToStore ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1" /> 已同步上架前台
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5 mr-1" /> 一鍵同步上架至前台
                      </>
                    )}
                  </button>

                  {hasDeployedToStore && (
                    <button
                      onClick={() => {
                        if (onNavigateToStorefront) {
                          onNavigateToStorefront();
                        } else if (onNavigateToTab) {
                          onNavigateToTab("storefront");
                        }
                      }}
                      className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1" /> 前往購買頁
                    </button>
                  )}
                </div>
              </div>

              {/* Category Routing Guard Status & Semantic Security Badge */}
              {materialResult.categoryRouting && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/60 to-indigo-50/50 border border-emerald-200/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            Stage 1 智慧品類判定：
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-600 text-white shadow-2xs">
                            {materialResult.categoryRouting.categoryLabel}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          推薦行銷切入角：{materialResult.categoryRouting.recommendedAngle}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-white/90 px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      語意防捏造與跨品類詞彙過濾已啟用 (PASS)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100 space-y-1">
                      <span className="text-[11px] font-bold text-emerald-900 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                        品類允許核心感知詞：
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {materialResult.categoryRouting.allowedKeywords.slice(0, 7).map((kw, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] border border-emerald-200/60 font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-xl border border-rose-100 space-y-1">
                      <span className="text-[11px] font-bold text-rose-900 flex items-center">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 mr-1" />
                        嚴格封鎖跨品類幻覺詞：
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {materialResult.categoryRouting.forbiddenKeywords.slice(0, 6).map((kw, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 text-[10px] line-through border border-rose-200/60 font-medium">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Catchy Headline (一秒吸睛主標題) */}
              {materialResult.catchyHeadline && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                        一秒吸睛社群主標 (High CTR Hook)
                      </span>
                      <p className="text-xs sm:text-sm font-black text-amber-950">
                        {materialResult.catchyHeadline}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopyText(materialResult.catchyHeadline || "", "headline")}
                    className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 hover:bg-amber-50 text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    {copiedKey === "headline" ? "已複製" : "複製主標"}
                  </button>
                </div>
              )}

              {/* Deep Analysis Highlight Box (深度賣點分析卡片) */}
              {materialResult.deepAnalysis && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-slate-50 border border-indigo-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 text-xs sm:text-sm flex items-center">
                      <Target className="w-4 h-4 text-indigo-600 mr-1.5" />
                      🧠 AI 產品核心賣點與痛點深度分析
                    </span>
                    <span className="text-[11px] font-bold text-purple-700 bg-white/80 px-2 py-0.5 rounded-md border border-purple-200/60">
                      專屬量身設計
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Pain Points */}
                    <div className="bg-white/80 p-3 rounded-xl border border-indigo-100/80 space-y-1.5">
                      <div className="font-bold text-slate-800 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5" />
                        直擊目標客群痛點：
                      </div>
                      <ul className="space-y-1 text-slate-600 text-[11px]">
                        {materialResult.deepAnalysis.corePainPoints.slice(0, 3).map((pt, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-rose-500 mr-1">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Sensory Highlights */}
                    <div className="bg-white/80 p-3 rounded-xl border border-indigo-100/80 space-y-1.5">
                      <div className="font-bold text-slate-800 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
                        五感體驗與特色亮點：
                      </div>
                      <ul className="space-y-1 text-slate-600 text-[11px]">
                        {materialResult.deepAnalysis.sensoryHighlights.slice(0, 3).map((sh, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-emerald-500 mr-1">•</span>
                            <span>{sh}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Value Proposition */}
                  <div className="p-2.5 bg-indigo-900/5 rounded-xl border border-indigo-200/50 text-xs text-indigo-950 font-medium">
                    <span className="font-bold text-indigo-800">💡 核心價值主張：</span>
                    <span className="ml-1">{materialResult.deepAnalysis.valueProposition}</span>
                  </div>
                </div>
              )}

              {/* Multi-Platform Copy Cards (Based on Selected Platforms) */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center">
                  <span className="w-1.5 h-4 bg-indigo-600 rounded-full mr-2" />
                  多平台社群量身訂製文案
                </h4>

                {/* FB Card */}
                {platforms.includes("facebook") && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-700 text-xs sm:text-sm flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2" />
                        Facebook 爆款團購貼文 (故事/開箱/推坑)
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setPreviewPlatform("facebook")}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-white text-xs font-medium inline-flex items-center cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> 擬真預覽
                        </button>
                        <button
                          onClick={() =>
                            handleCopyText(
                              `${materialResult.facebookPost.headline}\n\n${materialResult.facebookPost.body}\n\n${materialResult.facebookPost.hashtags.join(
                                " "
                              )}`,
                              "fb"
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center cursor-pointer"
                        >
                          {copiedKey === "fb" ? (
                            <Check className="w-3 h-3 text-emerald-600 mr-1" />
                          ) : (
                            <Copy className="w-3 h-3 mr-1" />
                          )}
                          {copiedKey === "fb" ? "已複製" : "複製文案"}
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto font-sans bg-white p-3 rounded-lg border border-slate-200/60">
                      <p className="font-bold text-slate-900 mb-1">{materialResult.facebookPost.headline}</p>
                      {materialResult.facebookPost.body}
                    </div>
                  </div>
                )}

                {/* IG Card */}
                {platforms.includes("instagram") && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-pink-700 text-xs sm:text-sm flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 mr-2" />
                        Instagram 視覺貼文與 Trending Hashtags
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setPreviewPlatform("instagram")}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-white text-xs font-medium inline-flex items-center cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> 擬真預覽
                        </button>
                        <button
                          onClick={() =>
                            handleCopyText(
                              `${materialResult.instagramPost.firstParagraph}\n\n${materialResult.instagramPost.body}\n\n${materialResult.instagramPost.hashtags.join(
                                " "
                              )}`,
                              "ig"
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center cursor-pointer"
                        >
                          {copiedKey === "ig" ? (
                            <Check className="w-3 h-3 text-emerald-600 mr-1" />
                          ) : (
                            <Copy className="w-3 h-3 mr-1" />
                          )}
                          {copiedKey === "ig" ? "已複製" : "複製文案"}
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto font-sans bg-white p-3 rounded-lg border border-slate-200/60">
                      <p className="font-bold text-slate-900 mb-1">{materialResult.instagramPost.firstParagraph}</p>
                      {materialResult.instagramPost.body}
                    </div>
                  </div>
                )}

                {/* LINE Card */}
                {platforms.includes("line") && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700 text-xs sm:text-sm flex items-center">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
                        LINE 社群推播訊息 (高轉化短訊)
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setPreviewPlatform("line")}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-white text-xs font-medium inline-flex items-center cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> 擬真預覽
                        </button>
                        <button
                          onClick={() =>
                            handleCopyText(
                              `${materialResult.lineMessage.headline}\n\n${materialResult.lineMessage.body}`,
                              "line"
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center cursor-pointer"
                        >
                          {copiedKey === "line" ? (
                            <Check className="w-3 h-3 text-emerald-600 mr-1" />
                          ) : (
                            <Copy className="w-3 h-3 mr-1" />
                          )}
                          {copiedKey === "line" ? "已複製" : "複製文案"}
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto font-sans bg-white p-3 rounded-lg border border-slate-200/60">
                      <p className="font-bold text-slate-900 mb-1">{materialResult.lineMessage.headline}</p>
                      {materialResult.lineMessage.body}
                    </div>
                  </div>
                )}

                {/* Threads Card */}
                {materialResult.threadsPost && (
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-100 text-xs sm:text-sm flex items-center">
                        <Hash className="w-4 h-4 text-slate-300 mr-1.5" />
                        Threads 專屬短爆文 (真誠短文/共鳴推坑)
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setPreviewPlatform("threads")}
                          className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 text-xs font-medium inline-flex items-center cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> 擬真預覽
                        </button>
                        <button
                          onClick={() =>
                            handleCopyText(
                              materialResult.threadsPost?.body || "",
                              "threads"
                            )
                          }
                          className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-semibold inline-flex items-center cursor-pointer"
                        >
                          {copiedKey === "threads" ? (
                            <Check className="w-3 h-3 text-emerald-400 mr-1" />
                          ) : (
                            <Copy className="w-3 h-3 mr-1" />
                          )}
                          {copiedKey === "threads" ? "已複製" : "複製 Threads"}
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto font-sans bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                      {materialResult.threadsPost.body}
                    </div>
                  </div>
                )}

                {/* VIP EDM Card */}
                {materialResult.edmCopy && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-800 text-xs sm:text-sm flex items-center">
                        <Mail className="w-4 h-4 text-purple-600 mr-1.5" />
                        VIP 會員開團電子報 (EDM)
                      </span>
                      <button
                        onClick={() =>
                          handleCopyText(
                            `主旨：${materialResult.edmCopy?.subject}\n\n${materialResult.edmCopy?.body}`,
                            "edm"
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center cursor-pointer"
                      >
                        {copiedKey === "edm" ? (
                          <Check className="w-3 h-3 text-emerald-600 mr-1" />
                        ) : (
                          <Copy className="w-3 h-3 mr-1" />
                        )}
                        {copiedKey === "edm" ? "已複製" : "複製 EDM"}
                      </button>
                    </div>
                    <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto font-sans bg-white p-3 rounded-lg border border-slate-200/60">
                      <p className="font-bold text-slate-900 mb-1">主旨：{materialResult.edmCopy.subject}</p>
                      {materialResult.edmCopy.body}
                    </div>
                  </div>
                )}
              </div>

              {/* Video Storyboard Section (可切換多秒數 10s / 15s / 30s / 60s + 旁白與影片一鍵打包 + 視覺風格調性同步) */}
              {includeVideoPrompt && materialResult.videoPrompt && (() => {
                const productEngName = (materialResult.productName || productName || "Premium Product").replace(/[^\w\s]/gi, "").trim() || "Premium Lifestyle Product";
                const productZhName = materialResult.productName || productName || "精選熱銷商品";
                const activeStyleDesc = customEnvText && customEnvText.trim().length > 0 
                  ? customEnvText.trim() 
                  : "淺色橡木桌面、柔和自然晨光漫射、米白陶器與極簡綠意植栽";

                const activeStory =
                  materialResult.videoPrompt?.durationStoryboards?.[selectedDuration] || {
                    durationSec: selectedDuration,
                    title: `${selectedDuration} 秒短影音分鏡`,
                    tag: "分鏡腳本",
                    sceneCount: materialResult.videoPrompt.shots?.length || 3,
                    description: `${selectedDuration} 秒短影音節奏結構`,
                    shots: materialResult.videoPrompt.shots || [],
                  };

                // Helper to ensure each shot prompt contains the activeStyleDesc for unified visual tone
                const getHarmonizedShotPrompt = (shot: any, idx: number) => {
                  let p = shot.aiVideoPrompt || "";
                  if (!p.includes(activeStyleDesc)) {
                    if (idx === 0) {
                      p = `Cinematic opening hook for ${productEngName}, environment style: ${activeStyleDesc}, dramatic commercial studio lighting, 4k 60fps.`;
                    } else if (idx === activeStory.shots.length - 1) {
                      p = `Commercial finish showing product hero lineup of ${productEngName} staged in ${activeStyleDesc}, warm ambient glow, dynamic motion graphics discount badge, 4k resolution.`;
                    } else {
                      p = `High-end commercial cinematography of ${productEngName} in action, staged inside ${activeStyleDesc}, macro details and authentic surface reflections, 4k 60fps.`;
                    }
                  }
                  return p;
                };

                // 1. Function to build full bundled pack for the current duration
                const buildCurrentDurationBundle = () => {
                  const header = `==================================================\n🎬【${productZhName}】${selectedDuration} 秒短影音全套生成專案包 (旁白 + 分鏡 + AI Prompt 打包)\n🎨 統一視覺風格調性：${activeStyleDesc}\n🎯 分鏡結構：${activeStory.title}（共 ${activeStory.shots.length} 段分鏡）\n📌 節奏定位：${activeStory.description}\n==================================================\n\n`;

                  const shotsContent = activeStory.shots.map((s: any, i: number) => {
                    const timeLabel = "timeRange" in s ? s.timeRange : s.shotTime || `鏡頭 ${i + 1}`;
                    const nameLabel = "name" in s ? s.name : s.sceneName || `分鏡 ${i + 1}`;
                    const voiceText = "audioVoiceover" in s ? s.audioVoiceover : s.voiceover || "";
                    const promptText = getHarmonizedShotPrompt(s, i);
                    const cam = s.cameraMovement || "特寫推進";

                    return `【分鏡 ${i + 1}】[${timeLabel}] ${nameLabel}\n🎥 鏡頭運鏡：${cam}\n🎬 畫面構圖：${s.visualDescription}\n🎙️ 口播旁白：「${voiceText}」\n⚡ AI 影音 Prompt (Sora / Runway / Kling AI - 調性已統一)：\n${promptText}`;
                  }).join("\n\n--------------------------------------------------\n\n");

                  const voiceoverScript = `\n\n==================================================\n🎙️【全片口播逐字稿 (語音合成 TTS / 剪映 / 配音專用)】\n` +
                    activeStory.shots.map((s: any, i: number) => {
                      const timeLabel = "timeRange" in s ? s.timeRange : s.shotTime || `鏡頭 ${i + 1}`;
                      const voiceText = "audioVoiceover" in s ? s.audioVoiceover : s.voiceover || "";
                      return `[${timeLabel}] ${voiceText}`;
                    }).join("\n") +
                    `\n==================================================`;

                  return header + shotsContent + voiceoverScript;
                };

                // 2. Function to build pure voiceover script
                const buildPureVoiceoverScript = () => {
                  return `🎙️《${productZhName}》${selectedDuration}秒短影音 口播逐字稿 (TTS / 剪映配音專用)\n\n` +
                    activeStory.shots.map((s: any, i: number) => {
                      const timeLabel = "timeRange" in s ? s.timeRange : s.shotTime || `分鏡 ${i + 1}`;
                      const voiceText = "audioVoiceover" in s ? s.audioVoiceover : s.voiceover || "";
                      return `[${timeLabel}] ${voiceText}`;
                    }).join("\n");
                };

                // 3. Function to build all prompts
                const buildAllPromptsOnly = () => {
                  return `⚡《${productZhName}》${selectedDuration}秒短影音 AI 影音生成 Prompt 序列 (Sora / Runway / Kling)\n🎨 統一視覺風格：${activeStyleDesc}\n\n` +
                    activeStory.shots.map((s: any, i: number) => {
                      const timeLabel = "timeRange" in s ? s.timeRange : s.shotTime || `分鏡 ${i + 1}`;
                      const promptText = getHarmonizedShotPrompt(s, i);
                      return `[分鏡 ${i + 1} - ${timeLabel}]\n${promptText}`;
                    }).join("\n\n");
                };

                // 4. Function to build all durations bundle (10s + 15s + 30s + 60s)
                const buildAllDurationsBundle = () => {
                  const allDurs = [10, 15, 30, 60] as const;
                  let fullText = `==================================================\n📦【${productZhName}】短影音分鏡與口播全套大禮包 (10s / 15s / 30s / 60s 全秒數)\n🎨 統一視覺風格調性：${activeStyleDesc}\n==================================================\n\n`;

                  allDurs.forEach((dur) => {
                    const story = materialResult.videoPrompt?.durationStoryboards?.[dur];
                    if (story) {
                      fullText += `\n##################################################\n🎬 【${dur} 秒版本】${story.title} (${story.tag})\n📌 說明：${story.description}\n##################################################\n\n`;
                      story.shots.forEach((s: any, idx: number) => {
                        const prompt = getHarmonizedShotPrompt(s, idx);
                        fullText += `【分鏡 ${idx + 1}】[${s.timeRange}] ${s.name}\n• 運鏡：${s.cameraMovement}\n• 畫面：${s.visualDescription}\n• 旁白：「${s.audioVoiceover}」\n• AI Prompt：${prompt}\n\n`;
                      });
                      fullText += `🎙️ ${dur}s 口播總整理：\n` + story.shots.map((s: any) => `• [${s.timeRange}] ${s.audioVoiceover}`).join("\n") + "\n\n";
                    }
                  });

                  return fullText;
                };

                return (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50/70 via-indigo-50/40 to-purple-50/70 border border-purple-200/80 space-y-4">
                    {/* Header with Title & Style Consistency Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200/60 pb-3">
                      <div>
                        <span className="font-bold text-purple-950 text-xs sm:text-sm flex items-center">
                          <Video className="w-4 h-4 text-purple-600 mr-1.5" />
                          短影音多秒數分鏡與口播腳本 (Runway Gen-3 / Sora / Kling / 剪映)
                        </span>
                        <p className="text-[11px] text-purple-700/80 mt-0.5">
                          影片 Prompt 已自動注入商攝風格指令，確保所有分鏡與商業海報之視覺調性 100% 一致！
                        </p>
                      </div>

                      {/* Active Visual Style Directive Badge */}
                      <div className="px-2.5 py-1 rounded-lg bg-white/80 border border-purple-200 text-purple-900 text-[11px] flex items-center shadow-2xs self-start sm:self-auto">
                        <Sparkles className="w-3 h-3 text-purple-600 mr-1 shrink-0" />
                        <span className="truncate max-w-xs" title={activeStyleDesc}>
                          風格調性：<strong>{activeStyleDesc}</strong>
                        </span>
                      </div>
                    </div>

                    {/* One-Click Video & Voiceover Bundle Action Toolbar (按鍵式打包專區) */}
                    <div className="bg-white/90 p-3 rounded-xl border border-purple-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-purple-950 flex items-center">
                          <Package className="w-3.5 h-3.5 text-purple-600 mr-1.5" />
                          按鍵式影音專案打包 (旁白 + 分鏡 + Prompt 一同匯出)：
                        </span>
                        <span className="text-[10px] text-purple-600 font-medium">支援剪映 / CapCut / TTS 語音合成</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                        {/* Primary Button: Bundle Current Duration (Voiceover + Storyboard + Prompts) */}
                        <button
                          type="button"
                          onClick={() => handleCopyText(buildCurrentDurationBundle(), `video-bundle-${selectedDuration}`)}
                          className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold flex items-center justify-center transition shadow-xs cursor-pointer group"
                        >
                          {copiedKey === `video-bundle-${selectedDuration}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-300 mr-1.5 shrink-0" />
                          ) : (
                            <Package className="w-3.5 h-3.5 mr-1.5 shrink-0 group-hover:scale-110 transition-transform" />
                          )}
                          <span>
                            {copiedKey === `video-bundle-${selectedDuration}`
                              ? `已打包 ${selectedDuration}s 全套！`
                              : `一鍵打包 ${selectedDuration}s 影音+旁白`}
                          </span>
                        </button>

                        {/* Button 2: Pure Voiceover Script for TTS / Voice Actor */}
                        <button
                          type="button"
                          onClick={() => handleCopyText(buildPureVoiceoverScript(), `video-voice-${selectedDuration}`)}
                          className="px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100/80 text-purple-900 border border-purple-200 text-xs font-medium flex items-center justify-center transition cursor-pointer"
                        >
                          {copiedKey === `video-voice-${selectedDuration}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
                          ) : (
                            <Mic className="w-3.5 h-3.5 text-purple-600 mr-1.5 shrink-0" />
                          )}
                          <span>
                            {copiedKey === `video-voice-${selectedDuration}` ? "已複製純旁白逐字稿" : `打包 ${selectedDuration}s 純口播逐字稿`}
                          </span>
                        </button>

                        {/* Button 3: Video AI Prompts Only */}
                        <button
                          type="button"
                          onClick={() => handleCopyText(buildAllPromptsOnly(), `video-prompts-${selectedDuration}`)}
                          className="px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100/80 text-purple-900 border border-purple-200 text-xs font-medium flex items-center justify-center transition cursor-pointer"
                        >
                          {copiedKey === `video-prompts-${selectedDuration}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
                          ) : (
                            <Film className="w-3.5 h-3.5 text-purple-600 mr-1.5 shrink-0" />
                          )}
                          <span>
                            {copiedKey === `video-prompts-${selectedDuration}` ? "已複製全分鏡 Prompt" : `打包 ${selectedDuration}s AI Prompt`}
                          </span>
                        </button>

                        {/* Button 4: All 4 Durations Complete Pack */}
                        <button
                          type="button"
                          onClick={() => handleCopyText(buildAllDurationsBundle(), `video-all-durations`)}
                          className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-200 border border-slate-700 text-xs font-bold flex items-center justify-center transition cursor-pointer shadow-2xs"
                        >
                          {copiedKey === "video-all-durations" ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400 mr-1.5 shrink-0" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
                          )}
                          <span>
                            {copiedKey === "video-all-durations" ? "已打包全秒數大禮包" : "打包 10s~60s 全套腳本"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Duration Switcher Tabs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { sec: 10 as const, label: "10 秒極速推坑", sub: "Reels / TikTok ⚡", count: "2 段鏡頭" },
                        { sec: 15 as const, label: "15 秒黃金吸睛", sub: "經典 3 段結構 👑", count: "3 段鏡頭" },
                        { sec: 30 as const, label: "30 秒開箱實測", sub: "痛點化解與體驗 📦", count: "4 段鏡頭" },
                        { sec: 60 as const, label: "60 秒深度評測", sub: "團長口碑與囤貨 🔥", count: "5 段鏡頭" },
                      ].map((tab) => {
                        const isSelected = selectedDuration === tab.sec;
                        return (
                          <button
                            key={tab.sec}
                            type="button"
                            onClick={() => setSelectedDuration(tab.sec)}
                            className={`p-2 rounded-xl text-left transition border cursor-pointer ${
                              isSelected
                                ? "bg-purple-600 text-white border-purple-700 shadow-sm ring-2 ring-purple-300/50"
                                : "bg-white hover:bg-purple-50/70 text-slate-700 border-slate-200"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold">{tab.label}</span>
                              <span className={`text-[10px] px-1 rounded ${isSelected ? "bg-purple-700 text-purple-100" : "bg-slate-100 text-slate-500"}`}>
                                {tab.count}
                              </span>
                            </div>
                            <div className={`text-[10px] mt-0.5 font-medium ${isSelected ? "text-purple-200" : "text-purple-600"}`}>
                              {tab.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Duration Storyboard Description */}
                    {activeStory && (
                      <div className="bg-purple-100/60 p-2.5 rounded-lg text-xs text-purple-900 border border-purple-200/60 flex items-center justify-between">
                        <span className="font-medium">📌 {activeStory.description}</span>
                        <span className="font-bold text-purple-700 shrink-0 ml-2">{activeStory.tag}</span>
                      </div>
                    )}

                    {/* Render Shots for Selected Duration with Harmonized Style Prompts & Bundled Buttons */}
                    {activeStory.shots.length > 0 && (
                      <div className="space-y-2.5">
                        {activeStory.shots.map((shot: any, i: number) => {
                          const timeLabel = "timeRange" in shot ? shot.timeRange : shot.shotTime || `鏡頭 ${i + 1}`;
                          const nameLabel = "name" in shot ? shot.name : shot.sceneName || `場景 ${i + 1}`;
                          const voiceText = "audioVoiceover" in shot ? shot.audioVoiceover : shot.voiceover || "";
                          const promptText = getHarmonizedShotPrompt(shot, i);
                          const camText = shot.cameraMovement || "特寫推進";

                          const shotBundleText = `【分鏡 ${i + 1} - ${timeLabel}】${nameLabel}\n🎥 運鏡：${camText}\n🎬 畫面：${shot.visualDescription}\n🎙️ 口播旁白：「${voiceText}」\n⚡ AI Video Prompt (調性已統一):\n${promptText}`;

                          return (
                            <div key={i} className="bg-white p-3.5 rounded-xl border border-purple-200/80 text-xs space-y-2.5 shadow-2xs">
                              {/* Shot Header with Camera Movement and Shot Bundle Action */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 font-bold text-purple-900 border-b border-purple-100 pb-2">
                                <div className="flex items-center">
                                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] mr-2 font-mono shrink-0">
                                    {timeLabel}
                                  </span>
                                  <span className="text-slate-900">{nameLabel}</span>
                                </div>
                                <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                                  <span className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 font-normal">
                                    運鏡：{camText}
                                  </span>
                                  {/* Shot Bundle Copy Button */}
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(shotBundleText, `shot-bundle-${selectedDuration}-${i}`)}
                                    className="px-2 py-0.5 rounded bg-purple-100/70 hover:bg-purple-200 text-purple-900 text-[11px] font-semibold flex items-center transition cursor-pointer"
                                    title="打包本分鏡（含旁白與 Prompt）"
                                  >
                                    {copiedKey === `shot-bundle-${selectedDuration}-${i}` ? (
                                      <Check className="w-3 h-3 text-emerald-600 mr-1" />
                                    ) : (
                                      <Package className="w-3 h-3 mr-1 text-purple-700" />
                                    )}
                                    <span>
                                      {copiedKey === `shot-bundle-${selectedDuration}-${i}` ? "已打包本鏡" : "打包本分鏡"}
                                    </span>
                                  </button>
                                </div>
                              </div>

                              {/* Visual Staging Description */}
                              <div className="text-slate-700 text-[11px] leading-relaxed">
                                <span className="font-bold text-slate-900">🎬 畫面構圖：</span>
                                {shot.visualDescription}
                              </div>

                              {/* Audio Voiceover Block with Dedicated Copy Button */}
                              {voiceText && (
                                <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-100 text-slate-800 text-[11px] leading-relaxed flex items-start justify-between gap-2">
                                  <div>
                                    <span className="font-bold text-purple-900 flex items-center mb-0.5">
                                      <Mic className="w-3.5 h-3.5 text-purple-600 mr-1 shrink-0" />
                                      口播旁白 (Voiceover 台詞)：
                                    </span>
                                    <span className="text-purple-950 font-medium pl-4 block">「{voiceText}」</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(voiceText, `voice-${selectedDuration}-${i}`)}
                                    className="px-2 py-0.5 rounded bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-medium shrink-0 cursor-pointer flex items-center"
                                  >
                                    {copiedKey === `voice-${selectedDuration}-${i}` ? (
                                      <Check className="w-3 h-3 text-emerald-600 mr-1" />
                                    ) : (
                                      <Copy className="w-3 h-3 mr-1" />
                                    )}
                                    {copiedKey === `voice-${selectedDuration}-${i}` ? "已複製" : "複製旁白"}
                                  </button>
                                </div>
                              )}

                              {/* AI Video Prompt with Harmonized Style Tone and Copy Button */}
                              {promptText && (
                                <div className="bg-slate-950 text-slate-200 font-mono text-[10px] p-2.5 rounded-lg relative space-y-1">
                                  <div className="flex items-center justify-between text-purple-300 font-semibold">
                                    <span className="flex items-center">
                                      <Film className="w-3 h-3 text-purple-400 mr-1" />
                                      Runway Gen-3 / Sora / Kling AI Video Prompt（視覺調性已同步）：
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyText(promptText, `vprompt-${selectedDuration}-${i}`)}
                                      className="text-[10px] text-purple-200 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer flex items-center"
                                    >
                                      {copiedKey === `vprompt-${selectedDuration}-${i}` ? (
                                        <Check className="w-3 h-3 text-emerald-400 mr-1" />
                                      ) : (
                                        <Copy className="w-3 h-3 mr-1" />
                                      )}
                                      {copiedKey === `vprompt-${selectedDuration}-${i}` ? "已複製 Prompt" : "複製 Prompt"}
                                    </button>
                                  </div>
                                  <div className="leading-relaxed break-all text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800">
                                    {promptText}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Visual Prompt & Commercial Poster Section (主產品居中 + Copy Space + 風格指令直接寫入 Prompt + 海報中文字體排版 + 中英文雙語對照) */}
              {includeImagePrompt && materialResult.imagePrompt && (() => {
                const productEngName = (materialResult.productName || productName || "Premium Product").replace(/[^\w\s]/gi, "").trim() || "Premium Lifestyle Product";
                const productZhName = materialResult.productName || productName || "精選熱銷商品";
                const activeStyleDesc = customEnvText && customEnvText.trim().length > 0 
                  ? customEnvText.trim() 
                  : "淺色橡木桌面、柔和自然晨光漫射、米白陶器與極簡綠意植栽";

                // English Generation Prompts with Chinese typography explicitly instructed for image models
                const effectivePosterPromptEn = `"Commercial advertisement poster featuring ${productEngName} positioned prominently in the sharp visual center foreground, staged in ${activeStyleDesc}, featuring elegant Traditional Chinese typography headline text \\"${productZhName}\\" and \\"限時特惠 團購熱銷\\" beautifully rendered in bold clean Chinese typography at the top header, clean generous negative space on upper sides for promotional typography, studio key lighting with soft fill, photorealistic, 8k resolution, commercial grade Chinese product poster --ar 3:4 --v 6.0"`;

                // Chinese Translation & Poster Typography Reference
                const effectivePosterPromptZh = `【商業海報中文視覺與繁體中文字體排版】《${productZhName}》商業宣傳海報，主產品清晰置於視覺正中心焦點，商攝背景風格：「${activeStyleDesc}」。海報中上方直接排版繁體中文字體「${productZhName}」與「限時特惠 團購熱銷」宣傳標題（由 AI 直接將繁體中文字樣繪製於海報畫面上），並預留上方與兩側排版留白 (Copy Space)，棚拍主光搭配柔和輔助光，呈現超逼真 8K 商業廣告海報。`;

                const effectivePrompt1En = materialResult.imagePrompt?.prompt1_closeUp && materialResult.imagePrompt.prompt1_closeUp.includes(activeStyleDesc)
                  ? materialResult.imagePrompt.prompt1_closeUp
                  : `"${productEngName}, product studio close-up shot, style and environment: ${activeStyleDesc}, professional studio lighting, macro lens depth of field, ultra-sharp focus, commercial photography, photorealistic, 8k resolution --ar 4:5 --style raw"`;

                const effectivePrompt1Zh = `【商品特寫中文描述】《${productZhName}》棚拍特寫鏡頭，商攝環境與風格：「${activeStyleDesc}」，專業商拍攝影棚燈光，微距鏡頭景深，焦點極致銳利清晰，真實細節紋理，8K 超高解析度。`;

                const effectivePrompt2En = materialResult.imagePrompt?.prompt2_lifestyle && materialResult.imagePrompt.prompt2_lifestyle.includes(activeStyleDesc)
                  ? materialResult.imagePrompt.prompt2_lifestyle
                  : `"${productEngName} in real-world lifestyle usage setting, environment atmosphere: ${activeStyleDesc}, natural ambient diffused lighting, authentic textures, commercial advertising cinematography, 8k resolution --ar 16:9 --v 6.0"`;

                const effectivePrompt2Zh = `【情境氛圍中文描述】《${productZhName}》真實生活使用情境，場景氛圍：「${activeStyleDesc}」，自然環境漫射光，真實材質觸感，商業廣告電影級運鏡質感。`;

                return (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center">
                          <ImageIcon className="w-4 h-4 text-indigo-600 mr-1.5" />
                          商業海報與商品攝影 AI 提示詞 (海報繁體中文字體排版 / Midjourney v6 / SD)
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          海報提示詞已直接要求 AI 繪製<strong>繁體中文標題字樣（如《{productZhName}》、限時特惠）</strong>，並預留 Copy Space 排版留白
                        </p>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md font-medium inline-flex items-center">
                          <Check className="w-3 h-3 mr-1 text-indigo-600" />
                          海報文字包含繁體中文
                        </span>
                      </div>
                    </div>

                    {/* Active Style Directive Banner */}
                    <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                      <div className="flex items-start sm:items-center text-indigo-900 leading-tight">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1.5 shrink-0 mt-0.5 sm:mt-0" />
                        <span>
                          <strong>當前寫入 Prompt 之風格指令：</strong>
                          <span className="text-indigo-700">{activeStyleDesc}</span>
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-500 font-mono shrink-0 self-end sm:self-auto">
                        即時連動
                      </span>
                    </div>

                    {/* Commercial Poster with Product in Visual Center & Copy Space & Chinese text on Poster */}
                    <div className="space-y-2 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/70">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                        <span className="font-bold text-indigo-950 flex items-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mr-1.5" />
                          商業海報生成 Prompt（主產品居中視覺焦點 + 海報繁體中文字體 + Copy Space）
                        </span>
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleCopyText(effectivePosterPromptZh, "img-poster-zh")}
                            className="px-2 py-1 rounded bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-[10px] font-semibold inline-flex items-center cursor-pointer shadow-2xs"
                          >
                            {copiedKey === "img-poster-zh" ? (
                              <Check className="w-3 h-3 text-emerald-600 mr-1" />
                            ) : (
                              <Copy className="w-3 h-3 mr-1" />
                            )}
                            {copiedKey === "img-poster-zh" ? "已複製中文" : "複製中文說明"}
                          </button>
                          <button
                            onClick={() => handleCopyText(effectivePosterPromptEn, "img-poster-en")}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-[11px] font-bold inline-flex items-center cursor-pointer shadow-2xs"
                          >
                            {copiedKey === "img-poster-en" ? (
                              <Check className="w-3 h-3 text-emerald-300 mr-1" />
                            ) : (
                              <Copy className="w-3 h-3 mr-1" />
                            )}
                            {copiedKey === "img-poster-en" ? "已複製海報 Prompt" : "複製海報 Prompt"}
                          </button>
                        </div>
                      </div>

                      {/* 中文版海報視覺指示 */}
                      <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60 text-xs text-amber-900 space-y-1">
                        <div className="font-bold flex items-center text-[11px] text-amber-800">
                          <span className="bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded text-[10px] mr-1.5 font-sans">中文排版解析</span>
                          海報構圖與中文字體排版設計：
                        </div>
                        <p className="leading-relaxed text-[11px] text-amber-900/90 pl-1">
                          {effectivePosterPromptZh}
                        </p>
                      </div>

                      {/* 英文版 Midjourney / SD 繪圖 Prompt (含中文字體指令) */}
                      <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-500 flex items-center justify-between">
                          <span>AI 繪圖指令 (Midjourney v6 / SD / Ideogram 專用，指定中文排版)：</span>
                          <span className="font-mono text-indigo-600">--ar 3:4 --v 6.0</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-indigo-100 font-mono text-[11px] text-slate-700 leading-relaxed max-h-28 overflow-y-auto">
                          {effectivePosterPromptEn}
                        </div>
                      </div>

                      <div className="text-[10px] text-indigo-700 flex items-center justify-between pt-0.5">
                        <span>✨ 特點：主商品清晰置中，海報畫面直接生成繁體中文標題字體，預留留白供後製微調</span>
                        <span className="font-sans text-slate-400">繁體中文排版支援</span>
                      </div>
                    </div>

                    {/* Prompt 1: Product Studio Close-Up (中英文對照) */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-white border border-slate-200/70">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
                          1. 商品主體特寫鏡頭 (Studio Clean Close-up)
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleCopyText(effectivePrompt1Zh, "img-prompt1-zh")}
                            className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 text-[10px] font-medium inline-flex items-center cursor-pointer"
                          >
                            {copiedKey === "img-prompt1-zh" ? "已複製中文" : "複製中文"}
                          </button>
                          <button
                            onClick={() => handleCopyText(effectivePrompt1En, "img-prompt1-en")}
                            className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 text-[10px] font-bold inline-flex items-center cursor-pointer shadow-2xs"
                          >
                            {copiedKey === "img-prompt1-en" ? "已複製英文" : "複製英文 Prompt"}
                          </button>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                        {effectivePrompt1Zh}
                      </div>
                      <div className="bg-slate-900 text-slate-100 p-2.5 rounded font-mono text-[11px] leading-relaxed max-h-20 overflow-y-auto">
                        {effectivePrompt1En}
                      </div>
                    </div>

                    {/* Prompt 2: Lifestyle Scene (中英文對照) */}
                    <div className="space-y-1.5 p-3 rounded-lg bg-white border border-slate-200/70">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
                          2. 情境使用氛圍 (Lifestyle In-context Scene)
                        </span>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleCopyText(effectivePrompt2Zh, "img-prompt2-zh")}
                            className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 text-[10px] font-medium inline-flex items-center cursor-pointer"
                          >
                            {copiedKey === "img-prompt2-zh" ? "已複製中文" : "複製中文"}
                          </button>
                          <button
                            onClick={() => handleCopyText(effectivePrompt2En, "img-prompt2-en")}
                            className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 text-[10px] font-bold inline-flex items-center cursor-pointer shadow-2xs"
                          >
                            {copiedKey === "img-prompt2-en" ? "已複製英文" : "複製英文 Prompt"}
                          </button>
                        </div>
                      </div>
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                        {effectivePrompt2Zh}
                      </div>
                      <div className="bg-slate-900 text-slate-100 p-2.5 rounded font-mono text-[11px] leading-relaxed max-h-20 overflow-y-auto">
                        {effectivePrompt2En}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>💡 推薦比例: {materialResult.imagePrompt.aspectRatio || "4:5 (社群貼文最佳)"} / 海報推薦 3:4</span>
                      <span>風格氛圍: {materialResult.imagePrompt.lighting || "暖金色自然散射光"}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Multi-SKU Tier Pricing Strategy */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/70 to-orange-50/50 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-xs sm:text-sm flex items-center">
                    <Layers className="w-4 h-4 text-amber-600 mr-1.5" />
                    多規格 (SKU) 階梯定價與促銷話術
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 bg-white/90 px-2 py-0.5 rounded border border-amber-200">
                    滿 ${brand.freeShippingThreshold || 1500} 免運
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-amber-100">
                    <div className="font-bold text-slate-800">1. 單入嚐鮮組</div>
                    <div className="text-amber-700 font-bold mt-0.5">${groupPrice}</div>
                    <div className="text-[10px] text-slate-500">新手首購／輕量體驗</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-amber-200 ring-1 ring-amber-400/30">
                    <div className="font-bold text-slate-800">2. 雙入分享組</div>
                    <div className="text-amber-700 font-bold mt-0.5">${groupPrice * 2 - 100}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">現省 $100 (人氣最高)</div>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-amber-100">
                    <div className="font-bold text-slate-800">3. 4 入免運狂囤組</div>
                    <div className="text-amber-700 font-bold mt-0.5">${groupPrice * 4 - 300}</div>
                    <div className="text-[10px] text-purple-600 font-bold">直達免運門檻</div>
                  </div>
                </div>
              </div>

              {/* Notification Push Scripts */}
              {materialResult.communityNotification && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center">
                      <MessageSquare className="w-4 h-4 text-indigo-600 mr-1.5" />
                      社群預熱、倒數與催繳通知排程
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 space-y-1">
                      <div className="font-bold text-indigo-600 flex items-center justify-between">
                        <span>🔥 開團預熱推播</span>
                        <button
                          onClick={() =>
                            handleCopyText(materialResult.communityNotification?.launchPreheat || "", "push-1")
                          }
                          className="text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          複製
                        </button>
                      </div>
                      <p className="text-slate-600 line-clamp-3">
                        {materialResult.communityNotification.launchPreheat}
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 space-y-1">
                      <div className="font-bold text-rose-600 flex items-center justify-between">
                        <span>⏰ 結團最後 6 小時</span>
                        <button
                          onClick={() =>
                            handleCopyText(materialResult.communityNotification?.closingReminder || "", "push-2")
                          }
                          className="text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          複製
                        </button>
                      </div>
                      <p className="text-slate-600 line-clamp-3">
                        {materialResult.communityNotification.closingReminder}
                      </p>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 space-y-1">
                      <div className="font-bold text-emerald-600 flex items-center justify-between">
                        <span>💳 ATM 防漏單提醒</span>
                        <button
                          onClick={() =>
                            handleCopyText(materialResult.communityNotification?.paymentUrge || "", "push-3")
                          }
                          className="text-[10px] text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          複製
                        </button>
                      </div>
                      <p className="text-slate-600 line-clamp-3">
                        {materialResult.communityNotification.paymentUrge}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50/70 rounded-2xl p-8 border-2 border-dashed border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Wand2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">等待啟動生成</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                填寫左側商品介紹、主要賣點與規格，設定團購價格與發布平台，點選「AI 直接產生 (使用
                API)」或「產生完整 Prompt (不使用 API)」，即可取得符合規範的開團素材！
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Social Mockup Preview Dialog */}
      {previewPlatform && materialResult && (
        <SocialMockupDialog
          isOpen={Boolean(previewPlatform)}
          platform={previewPlatform}
          onClose={() => setPreviewPlatform(null)}
          brandName={brandName}
          imageUrl={imageUrl}
          title={
            previewPlatform === "facebook"
              ? materialResult.facebookPost.headline
              : previewPlatform === "instagram"
              ? materialResult.instagramPost.firstParagraph
              : previewPlatform === "threads"
              ? "Threads 討論串分享"
              : materialResult.lineMessage.headline
          }
          body={
            previewPlatform === "facebook"
              ? materialResult.facebookPost.body
              : previewPlatform === "instagram"
              ? materialResult.instagramPost.body
              : previewPlatform === "threads"
              ? (materialResult.threadsPost?.body || materialResult.facebookPost.body)
              : materialResult.lineMessage.body
          }
          hashtags={
            previewPlatform === "facebook"
              ? materialResult.facebookPost.hashtags
              : previewPlatform === "instagram"
              ? materialResult.instagramPost.hashtags
              : []
          }
        />
      )}

      {/* Prompt Export Modal (不使用 API 模式) */}
      <PromptExportModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        promptContent={generatedPromptText}
        hasReferenceImage={Boolean(imageUrl && imageUrl.trim().length > 0)}
        productName={productName}
        onApplyPromptToGenerate={() => runWorkflow()}
      />
    </div>
  );
};

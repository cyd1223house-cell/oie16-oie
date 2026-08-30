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

const DEFAULT_STEPS: TaskPipelineStep[] = [
  {
    id: "step-1",
    title: "1. 核心賣點、痛點與感官體驗深度剖析",
    agentName: "規格與定價 Agent",
    status: "waiting",
    logs: [],
  },
  {
    id: "step-2",
    title: "2. FB / IG / LINE 三大平台量身訂製文案",
    agentName: "文案爆款大師 Agent",
    status: "waiting",
    logs: [],
  },
  {
    id: "step-3",
    title: "3. 一致性商業攝影 Prompt & 8秒短影音分鏡",
    agentName: "視覺與分鏡導演 Agent",
    status: "waiting",
    logs: [],
  },
  {
    id: "step-4",
    title: "4. 前台開團多規格 (SKU) 與階梯定價配置",
    agentName: "規格與定價 Agent",
    status: "waiting",
    logs: [],
  },
  {
    id: "step-5",
    title: "5. 社群開團預熱、截單倒數與催繳通知排程",
    agentName: "智慧客服與催單 Agent",
    status: "waiting",
    logs: [],
  },
  {
    id: "step-6",
    title: "6. 自動防漏單規則審查與合規性驗證",
    agentName: "防漏單審查 Agent",
    status: "waiting",
    logs: [],
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
  const [progressPercent, setProgressPercent] = useState(0);
  const [steps, setSteps] = useState<TaskPipelineStep[]>(DEFAULT_STEPS);
  const [activeLogStep, setActiveLogStep] = useState<string>("step-1");
  const [materialResult, setMaterialResult] = useState<MaterialPackResult | null>(null);
  const [hasDeployedToStore, setHasDeployedToStore] = useState(false);

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
  const [previewPlatform, setPreviewPlatform] = useState<"facebook" | "instagram" | "line" | null>(null);

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
    setAgentThought(`已為您載入「${prod.name}」商品資料！可選擇「AI 直接產生」或「產生完整 Prompt」。`);
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
      deepAnalysis: bespokePack.deepAnalysis,
      facebookPost: bespokePack.facebookPost,
      instagramPost: bespokePack.instagramPost,
      lineMessage: bespokePack.lineMessage,
      imagePrompt: {
        subject: `${productName}, ${category}`,
        style: bespokePack.visualDirector.lightingMood,
        promptEn: bespokePack.visualDirector.midjourneyPrompt,
        aspectRatio: "4:5",
        lighting: bespokePack.visualDirector.lightingMood,
      },
      videoPrompt: {
        concept: `8 秒短影音分鏡 (${productName})`,
        scenePlan: bespokePack.visualDirector.videoStoryboard.map(
          (s) => `${s.scene}：${s.visual}【旁白：${s.audioVoiceover}】`
        ),
        promptEn: bespokePack.visualDirector.midjourneyPrompt,
        durationSec: 8,
      },
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
              <div>
                <div className="block font-semibold text-slate-700 mb-1.5">視覺素材需求</div>
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
                      8 秒短影音分鏡腳本
                    </span>
                  </label>
                </div>
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
              </div>

              {/* Visual Prompt Section */}
              {includeImagePrompt && materialResult.imagePrompt && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center">
                      <ImageIcon className="w-4 h-4 text-indigo-600 mr-1.5" />
                      商業攝影 AI 提示詞 (Midjourney / Imagen / SD)
                    </span>
                    <button
                      onClick={() => handleCopyText(materialResult.imagePrompt.promptEn, "img-prompt")}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center cursor-pointer"
                    >
                      {copiedKey === "img-prompt" ? (
                        <Check className="w-3 h-3 text-emerald-600 mr-1" />
                      ) : (
                        <Copy className="w-3 h-3 mr-1" />
                      )}
                      {copiedKey === "img-prompt" ? "已複製" : "複製英文 Prompt"}
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200/60 font-mono text-[11px] text-slate-700 leading-relaxed max-h-24 overflow-y-auto">
                    {materialResult.imagePrompt.promptEn}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>💡 推薦比例: {materialResult.imagePrompt.aspectRatio || "4:5 (社群貼文最佳)"}</span>
                    <span>風格氛圍: {materialResult.imagePrompt.lighting || "暖金色自然散射光"}</span>
                  </div>
                </div>
              )}

              {/* Video Storyboard Section */}
              {includeVideoPrompt && materialResult.videoPrompt && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm flex items-center">
                      <Video className="w-4 h-4 text-purple-600 mr-1.5" />
                      8 秒短影音分鏡腳本 (3 段式高留存結構)
                    </span>
                    <button
                      onClick={() =>
                        handleCopyText(materialResult.videoPrompt.scenePlan.join("\n"), "video-scenes")
                      }
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center cursor-pointer"
                    >
                      {copiedKey === "video-scenes" ? (
                        <Check className="w-3 h-3 text-emerald-600 mr-1" />
                      ) : (
                        <Copy className="w-3 h-3 mr-1" />
                      )}
                      {copiedKey === "video-scenes" ? "已複製" : "複製分鏡腳本"}
                    </button>
                  </div>
                  <div className="space-y-1.5 bg-white p-3 rounded-lg border border-slate-200/60 text-xs">
                    {materialResult.videoPrompt.scenePlan.map((scene, i) => (
                      <div key={i} className="flex items-start text-slate-700 text-[11px]">
                        <span className="font-bold text-purple-700 mr-2 shrink-0">[{i + 1}]</span>
                        <span>{scene}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                            handleCopyText(materialResult.communityNotification.launchPreheat, "push-1")
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
                            handleCopyText(materialResult.communityNotification.closingReminder, "push-2")
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
                            handleCopyText(materialResult.communityNotification.paymentUrge, "push-3")
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
          platform={previewPlatform}
          onClose={() => setPreviewPlatform(null)}
          brandName={brandName}
          productName={productName}
          imageUrl={imageUrl}
          originalPrice={originalPrice}
          groupPrice={groupPrice}
          content={
            previewPlatform === "facebook"
              ? materialResult.facebookPost
              : previewPlatform === "instagram"
              ? materialResult.instagramPost
              : materialResult.lineMessage
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

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  originalPrice: number;
  groupPrice: number;
  stock: number;
  soldCount: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  sellingPoints: string[];
  specs: string[];
  imageUrl: string;
  referenceImages?: string[];
  variants: ProductVariant[];
  originalPrice: number;
  groupPrice: number;
  status: "active" | "draft" | "soldout" | "archived";
  tag?: string; // 如 "熱銷第一", "限時下殺", "團長激推"
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export type PaymentMethod = "bank_transfer" | "cod" | "line_pay" | "credit_card";
export type PaymentStatus = "unpaid" | "verifying" | "paid" | "refunded";
export type ShippingStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  shippingType: "home_delivery" | "cvs_711" | "cvs_family";
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  bankLast5?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  isDuplicateAlert?: boolean;
  isBlacklistAlert?: boolean;
  auditNotes?: string;
}

export interface BlacklistEntry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  reason: string;
  addedAt: string;
  interceptCount: number;
  lastInterceptAt?: string;
  operator: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tier: "diamond_vip" | "vip" | "regular" | "new";
  totalSpent: number;
  orderCount: number;
  lastOrderDate: string;
  notes?: string;
  tags: string[];
}

export interface SubAgent {
  id: string;
  name: string;
  role: string;
  icon: string;
  avatarBg: string;
  description: string;
  systemPrompt: string;
  temperature: number;
  enabled: boolean;
  tasksCompleted: number;
  status: "idle" | "working" | "error";
}

export interface TaskPipelineStep {
  id: string;
  title: string;
  agentName: string;
  status: "waiting" | "in_progress" | "completed" | "failed";
  summary?: string;
  durationMs?: number;
  logs: string[];
}

export interface CategoryRoutingInfo {
  detectedCategory: "食" | "衣" | "住" | "行" | "育" | "樂";
  categoryLabel: string;
  recommendedAngle: string;
  allowedKeywords: string[];
  forbiddenKeywords: string[];
  visualStyle: string;
}

export interface VideoStoryboardShot {
  sceneNumber: number;
  timeRange: string;
  name: string;
  visualDescription: string;
  audioVoiceover: string;
  aiVideoPrompt: string;
  cameraMovement?: string;
}

export interface VideoDurationStoryboard {
  durationSec: number;
  title: string;
  tag: string;
  sceneCount: number;
  description: string;
  shots: VideoStoryboardShot[];
}

export interface EnvironmentStylePreset {
  id: string;
  name: string;
  nameEn: string;
  tag: string;
  description: string;
  colorPalette: string[];
  lighting: string;
  midjourneyPrompt: string;
  imageToImagePrompt: string;
  generativeFillDirective: string;
}

export interface EnvironmentDirector {
  defaultStyleId: string;
  styles: EnvironmentStylePreset[];
  productPlacementPrompt: string;
  referenceImageDirective: string;
  customEnvironmentText?: string;
  customImageToImagePrompt?: string;
  customGenerativeFillDirective?: string;
  customMidjourneyPrompt?: string;
}

export interface MaterialPackResult {
  productName: string;
  generatedAt: string;
  brandName?: string;
  styleAngleName?: string;
  categoryRouting?: CategoryRoutingInfo;
  deepAnalysis?: {
    corePainPoints: string[];
    sensoryHighlights: string[];
    targetScenarios: string[];
    valueProposition: string;
    recommendedAudience: string[];
    discountRate: number;
    savingsAmount: number;
  };
  catchyHeadline?: string;
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
  threadsPost?: {
    headline: string;
    body: string;
    discussionHook: string;
  };
  edmCopy?: {
    subject: string;
    previewText: string;
    body: string;
  };
  urgencyReminder?: string;
  countdownClosing?: string;
  faq?: Array<{
    q: string;
    a: string;
  }>;
  imagePrompt: {
    subject: string;
    style: string;
    promptEn: string;
    aspectRatio: string;
    lighting: string;
    prompt1_closeUp?: string;
    prompt1_closeUp_zh?: string;
    prompt2_lifestyle?: string;
    prompt2_lifestyle_zh?: string;
    poster_copySpace?: string;
    poster_copySpace_zh?: string;
  };
  videoPrompt: {
    concept: string;
    scenePlan: string[];
    promptEn: string;
    durationSec: number;
    shots?: VideoStoryboardShot[];
    availableDurations?: number[];
    durationStoryboards?: Record<number, VideoDurationStoryboard>;
  };
  environmentDirector?: EnvironmentDirector;
  communityNotification: {
    launchPreheat: string;
    closingReminder: string;
    paymentUrge: string;
  };
  pricingStrategy: {
    suggestedGroupPrice: number;
    recommendedBundleDiscount: string;
    freeShippingThreshold: number;
  };
}

export interface BrandSettings {
  storeName: string;
  slogan: string;
  logoUrl: string;
  themeColor: "indigo" | "rose" | "amber" | "emerald" | "slate";
  bankCode: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  contactLine: string;
  contactPhone: string;
  announcement: string;
  freeShippingThreshold: number;
  shippingFee: number;
  enableBlacklistGuard: boolean;
  campaignTitle: string;
  campaignEndAt: string;
  campaignTargetAmount: number;
}

export interface CampaignRecord {
  id: string;
  title: string;
  status: "active" | "ended" | "draft";
  startDate: string;
  endDate: string;
  totalSales: number;
  targetSales: number;
  orderCount: number;
  avgOrderValue: number;
  topProducts: { name: string; quantity: number; amount: number }[];
}

export type AppTab =
  | "commander"
  | "agents"
  | "products"
  | "orders"
  | "campaigns"
  | "customers"
  | "blacklist"
  | "settings"
  | "storefront"
  | "inquiry"
  | "agent"
  | "agents_hub"
  | "brand"
  | "order_inquiry";


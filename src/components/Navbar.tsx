import React from "react";
import {
  Bot,
  Layers,
  Package,
  ShoppingBag,
  BarChart3,
  Users,
  ShieldBan,
  Settings,
  Store,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  LogOut,
  KeyRound,
} from "lucide-react";
import { BrandSettings, AppTab } from "../types/groupbuy";

export type ActiveTab = AppTab;

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab?: (tab: AppTab) => void;
  onSelectTab?: (tab: AppTab) => void;
  brand: BrandSettings;
  orderCount?: number;
  unpaidCount?: number;
  pendingOrdersCount?: number;
  blacklistCount?: number;
  isAdmin?: boolean;
  adminUsername?: string;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onSelectTab,
  brand,
  unpaidCount = 0,
  pendingOrdersCount,
  blacklistCount = 0,
  isAdmin = true,
  adminUsername = "admin",
  onOpenLoginModal,
  onLogout,
}) => {
  const handleTabChange = (tab: AppTab) => {
    if (setActiveTab) setActiveTab(tab);
    if (onSelectTab) onSelectTab(tab);
  };

  const isStorefront = activeTab === "storefront";
  const isInquiry = activeTab === "inquiry" || activeTab === "order_inquiry";
  const isFrontOffice = isStorefront || isInquiry;

  const displayPending = pendingOrdersCount ?? unpaidCount;

  // If in Front-Office (Storefront or Customer Order Inquiry), render pure customer storefront navbar
  if (isFrontOffice) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Store Brand Info */}
            <button
              type="button"
              className="flex items-center space-x-3 cursor-pointer select-none text-left bg-transparent border-0 p-0"
              onClick={() => handleTabChange("storefront")}
            >
              {brand.logoUrl ? (
                <img
                  src={brand.logoUrl}
                  alt={brand.storeName}
                  className="w-10 h-10 rounded-xl object-cover shadow-xs border border-slate-200"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-xs">
                  日
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                    {brand.storeName}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                    🔥 限時開團中
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                  {brand.slogan}
                </p>
              </div>
            </button>

            {/* Customer Navigation Menu */}
            <div className="flex items-center space-x-1.5 sm:space-x-3">
              <button
                onClick={() => handleTabChange("storefront")}
                className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${
                  isStorefront
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-400/50 shadow-indigo-100"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Store className="w-4 h-4 mr-1.5" />
                <span>選購開團商品</span>
              </button>

              <button
                onClick={() => handleTabChange("inquiry")}
                className={`inline-flex items-center px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer ${
                  isInquiry
                    ? "bg-indigo-600 text-white ring-2 ring-indigo-400/50 shadow-indigo-100"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Search className="w-4 h-4 mr-1.5" />
                <span>訂單查詢 / 末五碼</span>
              </button>

              {/* Admin Portal Entrance (for group leader/owner) */}
              <div className="pl-1 sm:pl-2 border-l border-slate-200">
                {isAdmin ? (
                  <button
                    onClick={() => handleTabChange("commander")}
                    className="inline-flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                    title="進入團長管理後台"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    <span className="hidden sm:inline">團長管理後台</span>
                    <span className="sm:hidden">後台</span>
                    <ArrowRight className="w-3 h-3 ml-1 text-slate-400" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenLoginModal}
                    className="inline-flex items-center px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                    title="登入團長管理後台 (密碼: 1234)"
                  >
                    <KeyRound className="w-3.5 h-3.5 mr-1 text-amber-400" />
                    <span className="hidden sm:inline">團長後台登入</span>
                    <span className="sm:hidden">登入</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Back-Office (Admin View): Show Full Command Navigation
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Brand Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Info */}
          <button
            type="button"
            className="flex items-center space-x-3 cursor-pointer select-none text-left bg-transparent border-0 p-0"
            onClick={() => handleTabChange("commander")}
          >
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.storeName}
                className="w-10 h-10 rounded-xl object-cover shadow-xs border border-slate-200"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xl shadow-xs">
                日
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  {brand.storeName}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Sparkles className="w-3 h-3 mr-1 text-indigo-500" />
                  AI Agent 團購中樞
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                {brand.slogan}
              </p>
            </div>
          </button>

          {/* Right Action Area: Preview Storefront + Inquiry + Admin Login State */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleTabChange("storefront")}
              className="inline-flex items-center px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 cursor-pointer"
            >
              <Store className="w-4 h-4 mr-1.5" />
              <span>預覽顧客前台</span>
            </button>
            <button
              onClick={() => handleTabChange("inquiry")}
              className="inline-flex items-center px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
            >
              <Search className="w-4 h-4 mr-1.5" />
              <span>訂單查詢頁</span>
            </button>

            {/* Admin Status Pill */}
            {isAdmin ? (
              <div className="hidden sm:flex items-center space-x-1 pl-2 border-l border-slate-200">
                <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>管理員: {adminUsername}</span>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="登出管理員"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="pl-2 border-l border-slate-200">
                <button
                  onClick={onOpenLoginModal}
                  className="inline-flex items-center px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  後台登入
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Exclusively for Admin Back-Office) */}
      <div className="bg-slate-50/80 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex space-x-1 overflow-x-auto py-1.5 scrollbar-none text-xs sm:text-sm">
          {/* Admin Command Center */}
          <button
            onClick={() => handleTabChange("commander")}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "commander" || activeTab === "agent"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Bot className="w-4 h-4 mr-1.5 text-indigo-500" />
            AI 總指揮儀表板
          </button>

          <button
            onClick={() => handleTabChange("agents")}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "agents" || activeTab === "agents_hub"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Layers className="w-4 h-4 mr-1.5 text-purple-500" />
            AI Agent 管理中心
          </button>

          <button
            onClick={() => handleTabChange("products")}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "products"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Package className="w-4 h-4 mr-1.5 text-blue-500" />
            商品庫與規格
          </button>

          <button
            onClick={() => handleTabChange("orders")}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "orders"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <ShoppingBag className="w-4 h-4 mr-1.5 text-emerald-500" />
            收單與防漏單對帳
            {displayPending > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {displayPending}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("campaigns")}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "campaigns"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <BarChart3 className="w-4 h-4 mr-1.5 text-amber-500" />
            開團紀錄與成效
          </button>

          <button
            onClick={() => handleTabChange("customers")}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "customers"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Users className="w-4 h-4 mr-1.5 text-teal-500" />
            團友會員管理
          </button>

          <button
            onClick={() => handleTabChange("blacklist")}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "blacklist"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <ShieldBan className="w-4 h-4 mr-1.5 text-rose-500" />
            黑名單防護
            {blacklistCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                {blacklistCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("settings")}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === "settings" || activeTab === "brand"
                ? "bg-white text-indigo-600 shadow-xs border border-slate-200 font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Settings className="w-4 h-4 mr-1.5 text-slate-500" />
            品牌與外觀
          </button>
        </div>
      </div>
    </header>
  );
};



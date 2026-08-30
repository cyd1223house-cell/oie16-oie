"use client";

import { useState, useSyncExternalStore } from "react";
import { Navbar } from "../src/components/Navbar";
import { AgentCommander } from "../src/components/AgentCommander";
import { MultiAgentHub } from "../src/components/MultiAgentHub";
import { ProductManager } from "../src/components/ProductManager";
import { OrderManager } from "../src/components/OrderManager";
import { CampaignHistory } from "../src/components/CampaignHistory";
import { CustomerCRM } from "../src/components/CustomerCRM";
import { BlacklistManager } from "../src/components/BlacklistManager";
import { BrandSettingsComponent } from "../src/components/BrandSettings";
import { CustomerStorefront } from "../src/components/CustomerStorefront";
import { CustomerOrderInquiry } from "../src/components/CustomerOrderInquiry";
import { AdminLoginModal } from "../src/components/AdminLoginModal";

import {
  loadBrandSettings,
  saveBrandSettings,
  loadProducts,
  saveProducts,
  loadOrders,
  saveOrders,
  loadBlacklist,
  saveBlacklist,
  loadSubAgents,
  saveSubAgents,
  loadCampaigns,
  saveCampaigns,
  loadCustomers,
  saveCustomers,
  resetToInitialData,
} from "../src/utils/storage";

import {
  BrandSettings,
  Product,
  Order,
  BlacklistEntry,
  SubAgent,
  CampaignRecord,
  Customer,
  AppTab,
} from "../src/types/groupbuy";

const emptySubscribe = () => () => {};

export default function Home() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [activeTab, setActiveTab] = useState<AppTab>("commander");
  const [inquirySearchParam, setInquirySearchParam] = useState<string>("");

  // Admin Authentication State (default true for easy access, with 1234 credentials and quick-login modal)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const savedAuth = localStorage.getItem("groupbuy_admin_auth");
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed && typeof parsed.isAuth === "boolean") {
          return parsed.isAuth;
        }
      }
    } catch {
      // ignore
    }
    return true;
  });

  const [adminUsername, setAdminUsername] = useState<string>(() => {
    if (typeof window === "undefined") return "admin";
    try {
      const savedAuth = localStorage.getItem("groupbuy_admin_auth");
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed && parsed.user) {
          return parsed.user;
        }
      }
    } catch {
      // ignore
    }
    return "admin";
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<AppTab | null>(null);

  // Domain State
  const [brand, setBrand] = useState<BrandSettings>(loadBrandSettings);
  const [products, setProducts] = useState<Product[]>(loadProducts);
  const [orders, setOrders] = useState<Order[]>(loadOrders);
  const [blacklist, setBlacklist] = useState<BlacklistEntry[]>(loadBlacklist);
  const [agents, setAgents] = useState<SubAgent[]>(loadSubAgents);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(loadCampaigns);
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers);

  const handleSelectTab = (tab: AppTab) => {
    // If selecting front-office (storefront or inquiry), allow freely without login
    if (tab === "storefront" || tab === "inquiry" || tab === "order_inquiry") {
      setActiveTab(tab);
      setInquirySearchParam("");
      return;
    }

    // If selecting back-office tab and not authenticated, show login modal
    if (!isAdmin) {
      setPendingTab(tab);
      setIsLoginModalOpen(true);
      return;
    }

    setActiveTab(tab);
    setInquirySearchParam("");
  };

  const handleLoginSuccess = (user: string) => {
    setIsAdmin(true);
    setAdminUsername(user || "admin");
    setIsLoginModalOpen(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem("groupbuy_admin_auth");
    } catch {
      // ignore
    }
    setActiveTab("storefront");
  };

  // Handlers with persistence
  const handleUpdateBrand = (newBrand: BrandSettings) => {
    setBrand(newBrand);
    saveBrandSettings(newBrand);
  };

  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    saveProducts(newProducts);
  };

  const handleAddProduct = (newProduct: Product) => {
    const updated = [newProduct, ...products];
    handleUpdateProducts(updated);
  };


  const handleUpdateOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    saveOrders(newOrders);
  };

  const handleUpdateBlacklist = (newBlacklist: BlacklistEntry[]) => {
    setBlacklist(newBlacklist);
    saveBlacklist(newBlacklist);
  };

  const handleUpdateAgents = (newAgents: SubAgent[]) => {
    setAgents(newAgents);
    saveSubAgents(newAgents);
  };

  const handleUpdateCampaigns = (newCampaigns: CampaignRecord[]) => {
    setCampaigns(newCampaigns);
    saveCampaigns(newCampaigns);
  };

  const handleUpdateCustomers = (newCustomers: Customer[]) => {
    setCustomers(newCustomers);
    saveCustomers(newCustomers);
  };

  // Helper: Add customer or order to blacklist
  const handleAddToBlacklist = (name: string, phone: string, reason: string) => {
    const newEntry: BlacklistEntry = {
      id: `bl-${Date.now()}`,
      name: name || "惡意跑單用戶",
      phone: phone.trim(),
      reason,
      addedAt: new Date().toISOString(),
      interceptCount: 0,
      operator: "團長由後台標記",
    };

    const updated = [newEntry, ...blacklist];
    handleUpdateBlacklist(updated);
    alert(`已成功將 ${name} (${phone}) 加入黑名單封鎖庫！前台將自動攔截該手機號碼。`);
  };

  // Helper: Customer places order from Storefront
  const handlePlaceOrder = (newOrder: Order) => {
    // 1. Add order to list
    const updatedOrders = [newOrder, ...orders];
    handleUpdateOrders(updatedOrders);

    // 2. Deduct product variant stocks
    const updatedProducts = products.map((prod) => {
      const orderItemsForProd = newOrder.items.filter((item) => item.productId === prod.id);
      if (orderItemsForProd.length === 0) return prod;

      return {
        ...prod,
        variants: prod.variants.map((v) => {
          const matchItem = orderItemsForProd.find((item) => item.variantId === v.id);
          if (matchItem) {
            return {
              ...v,
              stock: Math.max(0, v.stock - matchItem.quantity),
              soldCount: v.soldCount + matchItem.quantity,
            };
          }
          return v;
        }),
      };
    });
    handleUpdateProducts(updatedProducts);

    // 3. Update or create Customer CRM profile
    const existingCust = customers.find(
      (c) => c.phone.replace(/[-\s]/g, "") === newOrder.customerPhone.replace(/[-\s]/g, "")
    );
    if (existingCust) {
      const updatedCustList = customers.map((c) =>
        c.id === existingCust.id
          ? {
              ...c,
              totalSpent: c.totalSpent + newOrder.totalAmount,
              orderCount: c.orderCount + 1,
              tier:
                c.totalSpent + newOrder.totalAmount >= 5000
                  ? ("diamond_vip" as const)
                  : c.totalSpent + newOrder.totalAmount >= 2500
                  ? ("vip" as const)
                  : ("regular" as const),
            }
          : c
      );
      handleUpdateCustomers(updatedCustList);
    } else {
      const newCust: Customer = {
        id: `cust-${Date.now()}`,
        name: newOrder.customerName,
        phone: newOrder.customerPhone,
        email: newOrder.customerEmail,
        tier: newOrder.totalAmount >= 2500 ? "vip" : "regular",
        totalSpent: newOrder.totalAmount,
        orderCount: 1,
        joinedAt: new Date().toISOString(),
        tags: ["本期新客"],
        notes: `由前台訂單 ${newOrder.orderNumber} 自動建檔`,
      };
      handleUpdateCustomers([newCust, ...customers]);
    }
  };

  // Helper: Customer updates bank last 5 from Inquiry page
  const handleCustomerReportLast5 = (orderId: string, bankLast5: string) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            bankLast5,
            paymentStatus: "verifying" as const,
            updatedAt: new Date().toISOString(),
            auditNotes: `消費者於前台完成末五碼登記 (${bankLast5})，等待對帳核銷`,
          }
        : o
    );
    handleUpdateOrders(updated);
  };

  // Helper: Reset demo data
  const handleResetDefaults = () => {
    resetToInitialData();
    setBrand(loadBrandSettings());
    setProducts(loadProducts());
    setOrders(loadOrders());
    setBlacklist(loadBlacklist());
    setAgents(loadSubAgents());
    setCampaigns(loadCampaigns());
    setCustomers(loadCustomers());
  };

  // Calculate badge counters
  const pendingOrdersCount = orders.filter(
    (o) => o.paymentStatus === "verifying" || o.paymentStatus === "unpaid"
  ).length;
  const blacklistCount = blacklist.length;

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-mono text-sm">
        <div className="flex items-center space-x-3">
          <span className="w-3 h-3 bg-indigo-500 rounded-full animate-ping" />
          <span>正在載入 AI Agent 團購指揮中心...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col">
      {/* Top Main Navigation */}
      <Navbar
        brand={brand}
        activeTab={activeTab}
        setActiveTab={handleSelectTab}
        onSelectTab={handleSelectTab}
        pendingOrdersCount={pendingOrdersCount}
        unpaidCount={pendingOrdersCount}
        blacklistCount={blacklistCount}
        orderCount={orders.length}
        isAdmin={isAdmin}
        adminUsername={adminUsername}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Admin Login Modal (Default credentials: admin / 1234) */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setPendingTab(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        targetTabName={
          pendingTab === "commander"
            ? "AI 總指揮儀表板"
            : pendingTab === "orders"
            ? "收單與對帳中樞"
            : pendingTab === "products"
            ? "商品庫與規格"
            : pendingTab === "agents"
            ? "AI Agent 管理中心"
            : pendingTab === "campaigns"
            ? "開團紀錄與成效"
            : pendingTab === "customers"
            ? "團友會員管理"
            : pendingTab === "blacklist"
            ? "黑名單防護"
            : pendingTab === "settings"
            ? "品牌與外觀設定"
            : "團長管理後台"
        }
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
        {/* TAB 1: AI Agent Mission Commander Dashboard */}
        {(activeTab === "commander" || activeTab === "agent") && (
          <AgentCommander
            products={products}
            brand={brand}
            agents={agents}
            onAddProduct={handleAddProduct}
            onUpdateProducts={handleUpdateProducts}
            onUpdateBrand={handleUpdateBrand}
            onNavigateToStorefront={() => setActiveTab("storefront")}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {/* TAB 2: Multi-Agent Sub-Agents Matrix Hub */}
        {(activeTab === "agents" || activeTab === "agents_hub") && (
          <MultiAgentHub agents={agents} onUpdateAgents={handleUpdateAgents} />
        )}

        {/* TAB 3: Product & Multi-SKU Manager */}
        {activeTab === "products" && (
          <ProductManager products={products} onUpdateProducts={handleUpdateProducts} />
        )}

        {/* TAB 4: Order Intake & Anti-Leak Reconciliation Workstation */}
        {activeTab === "orders" && (
          <OrderManager
            orders={orders}
            onUpdateOrders={handleUpdateOrders}
            onAddToBlacklist={handleAddToBlacklist}
          />
        )}

        {/* TAB 5: Campaign History & Analytics */}
        {activeTab === "campaigns" && (
          <CampaignHistory
            campaigns={campaigns}
            brand={brand}
            onCloneCampaign={(camp) => {
              const newCamp: CampaignRecord = {
                ...camp,
                id: `camp-${Date.now()}`,
                title: `${camp.title} (新開團)`,
                status: "active",
                totalSales: 0,
                orderCount: 0,
                startDate: new Date().toISOString().split("T")[0],
                endDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
              };
              handleUpdateCampaigns([newCamp, ...campaigns]);
              setActiveTab("commander");
            }}
          />
        )}

        {/* TAB 6: Customer CRM & Member Database */}
        {activeTab === "customers" && (
          <CustomerCRM
            customers={customers}
            onUpdateCustomers={handleUpdateCustomers}
            onAddToBlacklist={handleAddToBlacklist}
          />
        )}

        {/* TAB 7: Blacklist Anti-Abandonment Guard */}
        {activeTab === "blacklist" && (
          <BlacklistManager
            blacklist={blacklist}
            onUpdateBlacklist={handleUpdateBlacklist}
            brand={brand}
            onUpdateBrand={handleUpdateBrand}
          />
        )}

        {/* TAB 8: Brand & Store Settings (Custom Logo, Theme, Bank Info) */}
        {(activeTab === "settings" || activeTab === "brand") && (
          <BrandSettingsComponent
            brand={brand}
            onUpdateBrand={handleUpdateBrand}
            onResetDefaults={handleResetDefaults}
          />
        )}

        {/* TAB 9: Consumer-Facing Groupbuy Storefront */}
        {activeTab === "storefront" && (
          <CustomerStorefront
            products={products}
            brand={brand}
            blacklist={blacklist}
            onPlaceOrder={handlePlaceOrder}
            onNavigateToInquiry={(orderNum) => {
              if (orderNum) setInquirySearchParam(orderNum);
              setActiveTab("inquiry");
            }}
          />
        )}

        {/* TAB 10: Consumer Order Query & Bank Last 5 Reconciliation */}
        {(activeTab === "inquiry" || activeTab === "order_inquiry") && (
          <CustomerOrderInquiry
            orders={orders}
            brand={brand}
            initialQuery={inquirySearchParam}
            onUpdateOrderBankLast5={handleCustomerReportLast5}
            onBackToStore={() => setActiveTab("storefront")}
          />
        )}
      </main>

      {/* Global Compact Footer */}
      <footer className="py-4 border-t border-slate-200 bg-white text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-600">{brand.storeName}</span>
            <span>‧ AI Agent 團購指揮全自動營運系統</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-400">
            <span>正品保證 ‧ 智慧風控 ‧ 自動對帳</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

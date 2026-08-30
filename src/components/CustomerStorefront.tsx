import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Clock,
  Truck,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  ShieldAlert,
  Building2,
  Copy,
  ArrowRight,
  Tag,
} from "lucide-react";
import {
  Product,
  ProductVariant,
  Order,
  OrderItem,
  BrandSettings,
  BlacklistEntry,
  PaymentMethod,
} from "../types/groupbuy";

interface CustomerStorefrontProps {
  products: Product[];
  brand: BrandSettings;
  blacklist: BlacklistEntry[];
  onPlaceOrder: (order: Order) => void;
  onNavigateToInquiry: (orderNum?: string) => void;
}

interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = ({
  products,
  brand,
  blacklist,
  onPlaceOrder,
  onNavigateToInquiry,
}) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Selected variant state per product
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // Checkout Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [shippingType, setShippingType] = useState<"home_delivery" | "cvs_711" | "cvs_family">("home_delivery");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [notes, setNotes] = useState("");

  // Blacklist Intercept & Order Success state
  const [blacklistBlocked, setBlacklistBlocked] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 3,
    hours: 14,
    minutes: 45,
    seconds: 20,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(brand.campaignEndAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [brand.campaignEndAt]);

  const activeProducts = products.filter((p) => p.status === "active");

  const getSelectedVariant = (prod: Product): ProductVariant => {
    const varId = selectedVariants[prod.id];
    return prod.variants.find((v) => v.id === varId) || prod.variants[0];
  };

  const handleSelectVariant = (prodId: string, varId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [prodId]: varId }));
  };

  const handleAddToCart = (prod: Product) => {
    const variant = getSelectedVariant(prod);
    if (variant.stock <= 0) {
      alert("此規格目前已售完！");
      return;
    }

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === prod.id && item.variant.id === variant.id
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }
      return [...prev, { product: prod, variant, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (idx: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      const newQty = next[idx].quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== idx);
      }
      next[idx].quantity = newQty;
      return next;
    });
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, it) => acc + it.variant.groupPrice * it.quantity, 0);
  const isFreeShipping = cartSubtotal >= brand.freeShippingThreshold;
  const shippingFee = cartSubtotal > 0 ? (isFreeShipping ? 0 : brand.shippingFee) : 0;
  const cartTotal = cartSubtotal + shippingFee;
  const freeShippingNeeded = Math.max(0, brand.freeShippingThreshold - cartSubtotal);

  // Submit Order with Blacklist Guard Check
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setBlacklistBlocked(null);

    const cleanPhone = phone.trim().replace(/[-\s]/g, "");

    // Check Blacklist Guard
    if (brand.enableBlacklistGuard) {
      const isBlacklisted = blacklist.find(
        (b) => b.phone.replace(/[-\s]/g, "") === cleanPhone
      );
      if (isBlacklisted) {
        setBlacklistBlocked(
          `很抱歉，此手機號碼目前無法進行線上團購下單（原因：${isBlacklisted.reason}）。如有任何疑問，請透過 LINE 官方客服 (${brand.contactLine}) 與團長聯繫。`
        );
        isBlacklisted.interceptCount += 1;
        isBlacklisted.lastInterceptAt = new Date().toISOString();
        return;
      }
    }

    const orderNum = `GB-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const orderItems: OrderItem[] = cart.map((it) => ({
      productId: it.product.id,
      productName: it.product.name,
      variantId: it.variant.id,
      variantName: it.variant.name,
      price: it.variant.groupPrice,
      quantity: it.quantity,
      imageUrl: it.product.imageUrl,
    }));

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim() || undefined,
      shippingAddress: shippingAddress.trim(),
      shippingType,
      paymentMethod,
      paymentStatus: "unpaid",
      shippingStatus: "pending",
      items: orderItems,
      subtotal: cartSubtotal,
      shippingFee,
      discount: 0,
      totalAmount: cartTotal,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onPlaceOrder(newOrder);
    setCreatedOrder(newOrder);
    setCart([]);
    setIsCheckoutModalOpen(false);

    // Confetti effect
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCopyBankInfo = () => {
    const text = `【${brand.storeName} 匯款資訊】\n銀行代碼：${brand.bankCode} (${brand.bankName})\n帳號：${brand.bankAccount}\n戶名：${brand.bankAccountName}\n應付金額：NT$ ${createdOrder?.totalAmount}\n訂單編號：${createdOrder?.orderNumber}`;
    navigator.clipboard.writeText(text);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/50 p-6 sm:p-10">
        <div className="max-w-3xl relative z-10 space-y-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3.5">
            {brand.logoUrl ? (
              <img
                src={brand.logoUrl}
                alt={brand.storeName}
                className="w-14 h-14 rounded-2xl object-cover shadow-lg border-2 border-indigo-400/60"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-2xl shadow-lg">
                日
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-900">
                  🔥 限時團購開團中
                </span>
                <span className="text-xs text-indigo-200">正品保證 ‧ 產地直送</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1">
                {brand.storeName}
              </h1>
            </div>
          </div>

          <p className="text-sm sm:text-base text-indigo-100 font-medium leading-relaxed">
            {brand.slogan}
          </p>

          {/* Countdown Clock */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 inline-flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center space-x-1.5 font-bold text-amber-300">
              <Clock className="w-4 h-4" />
              <span>本期結團倒數：</span>
            </div>
            <div className="flex items-center space-x-2 font-mono font-bold text-sm sm:text-base">
              <div className="bg-slate-900/80 px-2.5 py-1 rounded-lg">
                {timeLeft.days} <span className="text-[10px] font-sans font-normal text-slate-400">天</span>
              </div>
              <span>:</span>
              <div className="bg-slate-900/80 px-2.5 py-1 rounded-lg">
                {String(timeLeft.hours).padStart(2, "0")}{" "}
                <span className="text-[10px] font-sans font-normal text-slate-400">時</span>
              </div>
              <span>:</span>
              <div className="bg-slate-900/80 px-2.5 py-1 rounded-lg">
                {String(timeLeft.minutes).padStart(2, "0")}{" "}
                <span className="text-[10px] font-sans font-normal text-slate-400">分</span>
              </div>
              <span>:</span>
              <div className="bg-slate-900/80 px-2.5 py-1 rounded-lg text-amber-400">
                {String(timeLeft.seconds).padStart(2, "0")}{" "}
                <span className="text-[10px] font-sans font-normal text-slate-400">秒</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement & Free Shipping Progress Banner */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-amber-950 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start space-x-3">
          <Truck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-amber-900">【團購優惠規則】：{brand.announcement}</div>
            <div className="text-amber-800/80 text-xs">
              全館累積滿 <strong>NT$ {brand.freeShippingThreshold}</strong> 即享免運費（未達收運費 ${brand.shippingFee}）
            </div>
          </div>
        </div>

        {/* Query Order Button */}
        <button
          onClick={() => onNavigateToInquiry()}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs shadow-2xs shrink-0 self-start md:self-auto"
        >
          🔍 查詢已有訂單 / 回報末五碼
        </button>
      </div>

      {/* Product Catalog Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center">
            <span className="w-2.5 h-6 bg-indigo-600 rounded-full mr-2" />
            本期團購嚴選商品 ({activeProducts.length} 款)
          </h2>
          <span className="text-xs text-slate-500">保證現貨 ‧ 結團後快速出貨</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeProducts.map((product) => {
            const currentVar = getSelectedVariant(product);
            const isSoldOut = currentVar.stock <= 0;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div>
                  {/* Image & Tags */}
                  <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-600 text-white shadow-md">
                        {product.category}
                      </span>
                      {product.tag && (
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-900 shadow-md flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          {product.tag}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-indigo-600">{product.brand}</div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    {/* Selling Points */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700">
                      {product.sellingPoints.map((sp, idx) => (
                        <div key={idx} className="flex items-start">
                          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{sp}</span>
                        </div>
                      ))}
                    </div>

                    {/* Variant Selector */}
                    <div className="space-y-2 pt-1">
                      <div className="block text-xs font-bold text-slate-800">
                        選擇團購方案／規格：
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {product.variants.map((v) => {
                          const isSelected = v.id === currentVar.id;
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => handleSelectVariant(product.id, v.id)}
                              className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                                isSelected
                                  ? "border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 font-bold"
                                  : "border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <div>
                                <span className="text-slate-900 block">{v.name}</span>
                                <span className="text-[11px] text-slate-400 font-normal">
                                  庫存剩餘: {v.stock} 件
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-black text-rose-600">
                                  NT$ {v.groupPrice}
                                </span>
                                {v.originalPrice > v.groupPrice && (
                                  <span className="text-[10px] text-slate-400 line-through block">
                                    NT$ {v.originalPrice}
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Add to Cart Bar */}
                <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 block">團購優惠價</span>
                    <span className="text-xl sm:text-2xl font-black text-rose-600">
                      NT$ {currentVar.groupPrice}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isSoldOut}
                    className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center space-x-1.5 ${
                      isSoldOut
                        ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-600/20"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isSoldOut ? "已售完" : "加入購物車 (+1)"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl flex items-center space-x-3 border-2 border-white/20 animate-bounce active:scale-95"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {cart.reduce((acc, it) => acc + it.quantity, 0)}
              </span>
            </div>
            <div className="text-left text-xs">
              <div className="text-slate-400">團購購物車</div>
              <div className="font-black text-sm text-amber-400">NT$ {cartTotal}</div>
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl p-6 overflow-hidden animate-in slide-in-from-right">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">您的團購清單</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                關閉
              </button>
            </div>

            {/* Free Shipping Progress Indicator */}
            <div className="my-4 p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
              <div className="flex justify-between font-bold">
                <span>
                  {isFreeShipping ? "🎉 已享滿額免運費！" : `再湊 NT$ ${freeShippingNeeded} 享免運`}
                </span>
                <span>門檻: NT$ {brand.freeShippingThreshold}</span>
              </div>
              <div className="w-full bg-indigo-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, (cartSubtotal / brand.freeShippingThreshold) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {cart.length > 0 ? (
                cart.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${item.variant.id}`}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-3">
                      <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        規格: <span className="text-indigo-600 font-semibold">{item.variant.name}</span>
                      </div>
                      <div className="font-black text-rose-600 mt-1">
                        NT$ {item.variant.groupPrice * item.quantity}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 bg-white rounded-xl border border-slate-200 p-1">
                      <button
                        onClick={() => handleUpdateCartQty(idx, -1)}
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold px-1.5">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateCartQty(idx, 1)}
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 text-center text-slate-400">購物車是空的</div>
              )}
            </div>

            {/* Cart Summary & Checkout Trigger */}
            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>商品小計</span>
                <span>NT$ {cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>運費</span>
                <span>{isFreeShipping ? <strong className="text-emerald-600">免運費</strong> : `NT$ ${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-100">
                <span>結帳總額</span>
                <span className="text-rose-600">NT$ {cartTotal}</span>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutModalOpen(true);
                }}
                disabled={cart.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                前往快速結帳填單
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Form Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
              <Sparkles className="w-5 h-5 text-indigo-600 mr-2" />
              填寫團購收件與付款資訊
            </h3>

            {/* Blacklist Block Alert */}
            {blacklistBlocked && (
              <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs space-y-1">
                <div className="font-bold flex items-center">
                  <ShieldAlert className="w-4 h-4 mr-1 text-rose-600" /> 下單攔截提醒
                </div>
                <div>{blacklistBlocked}</div>
              </div>
            )}

            <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label htmlFor="cs-recipient-name" className="block font-semibold text-slate-700 mb-1">收件人姓名 *</label>
                <input
                  id="cs-recipient-name"
                  type="text"
                  required
                  placeholder="例如: 陳雅婷"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label htmlFor="cs-recipient-phone" className="block font-semibold text-slate-700 mb-1">手機號碼 (聯絡出貨與查單) *</label>
                <input
                  id="cs-recipient-phone"
                  type="tel"
                  required
                  placeholder="例如: 0912-345-678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label htmlFor="cs-recipient-email" className="block font-semibold text-slate-700 mb-1">電子信箱 Email (選填)</label>
                <input
                  id="cs-recipient-email"
                  type="email"
                  placeholder="例如: example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Shipping Method */}
              <div>
                <div className="block font-semibold text-slate-700 mb-1">取件配送方式 *</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "home_delivery" as const, label: "黑貓/常溫宅配" },
                    { key: "cvs_711" as const, label: "7-11 超商門市" },
                    { key: "cvs_family" as const, label: "全家 超商門市" },
                  ].map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setShippingType(s.key)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        shippingType === s.key
                          ? "bg-indigo-50 border-indigo-600 text-indigo-900"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="cs-shipping-address" className="block font-semibold text-slate-700 mb-1">
                  {shippingType === "home_delivery" ? "完整收件地址 *" : "超商門市名稱與店號 *"}
                </label>
                <input
                  id="cs-shipping-address"
                  type="text"
                  required
                  placeholder={
                    shippingType === "home_delivery"
                      ? "例如: 台北市大安區信義路四段100號5樓"
                      : "例如: 7-11 敦南門市 (店號: 991245)"
                  }
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Payment Method */}
              <div>
                <div className="block font-semibold text-slate-700 mb-1">付款方式 *</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "bank_transfer" as const, label: "ATM 銀行轉帳" },
                    { key: "cod" as const, label: "貨到付款" },
                    { key: "line_pay" as const, label: "LINE Pay" },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPaymentMethod(p.key)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                        paymentMethod === p.key
                          ? "bg-indigo-50 border-indigo-600 text-indigo-900"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="cs-order-notes" className="block font-semibold text-slate-700 mb-1">訂單備註 (選填)</label>
                <input
                  id="cs-order-notes"
                  type="text"
                  placeholder="例如: 希望下午配送、管理室代收..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Price Summary */}
              <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>商品小計</span>
                  <span>NT$ {cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>運費</span>
                  <span>{isFreeShipping ? "免運" : `NT$ ${shippingFee}`}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-rose-600 pt-1 border-t border-slate-200">
                  <span>應付總額</span>
                  <span>NT$ {cartTotal}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckoutModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  返回購物車
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md"
                >
                  確認送出訂單
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Placed Success Modal */}
      {createdOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                下單成功 ‧ 感謝跟團
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-2">
                您的訂單編號：{createdOrder.orderNumber}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                我們已收到您的訂單資料！請保留訂單編號以供查詢進度。
              </p>
            </div>

            {/* ATM Transfer Details Card */}
            {createdOrder.paymentMethod === "bank_transfer" && (
              <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 text-left text-xs text-indigo-950 space-y-2">
                <div className="font-bold flex items-center justify-between text-indigo-900">
                  <span className="flex items-center">
                    <Building2 className="w-4 h-4 mr-1 text-indigo-600" />
                    ATM 銀行轉帳資訊
                  </span>
                  <button
                    onClick={handleCopyBankInfo}
                    className="text-[11px] font-semibold text-indigo-700 hover:underline flex items-center"
                  >
                    {copiedBank ? <Check className="w-3 h-3 mr-0.5 text-emerald-600" /> : <Copy className="w-3 h-3 mr-0.5" />}
                    {copiedBank ? "已複製" : "一鍵複製帳號"}
                  </button>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-indigo-100">
                  <div>銀行代碼：<strong>{brand.bankCode}</strong> ({brand.bankName})</div>
                  <div>匯款帳號：<strong>{brand.bankAccount}</strong></div>
                  <div>戶名：<strong>{brand.bankAccountName}</strong></div>
                  <div>應付金額：<strong className="text-rose-600 text-sm">NT$ {createdOrder.totalAmount}</strong></div>
                </div>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  💡 請於 24 小時內完成轉帳，並前往「訂單查詢」回報您的「匯款帳號末五碼」，AI 對帳機器人將自動為您核銷並排單出貨！
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  const num = createdOrder.orderNumber;
                  setCreatedOrder(null);
                  onNavigateToInquiry(num);
                }}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center space-x-1"
              >
                <span>前往回報末五碼 / 查詢訂單</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCreatedOrder(null)}
                className="py-3 px-5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
              >
                繼續瀏覽商品
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import {
  Search,
  Building2,
  Check,
  ArrowLeft,
} from "lucide-react";
import { Order, BrandSettings } from "../types/groupbuy";

interface CustomerOrderInquiryProps {
  orders: Order[];
  brand: BrandSettings;
  initialQuery?: string;
  onUpdateOrderBankLast5: (orderId: string, bankLast5: string) => void;
  onBackToStore: () => void;
}

export const CustomerOrderInquiry: React.FC<CustomerOrderInquiryProps> = ({
  orders,
  brand,
  initialQuery = "",
  onUpdateOrderBankLast5,
  onBackToStore,
}) => {
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [searchedOrders, setSearchedOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [inputLast5Map, setInputLast5Map] = useState<Record<string, string>>({});
  const [reportSuccessId, setReportSuccessId] = useState<string | null>(null);
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery);

  const performSearch = (keyword: string) => {
    if (!keyword.trim()) return;
    const clean = keyword.trim().toLowerCase().replace(/[-\s]/g, "");

    const results = orders.filter((o) => {
      const matchNum = o.orderNumber.toLowerCase().replace(/[-\s]/g, "").includes(clean);
      const matchPhone = o.customerPhone.replace(/[-\s]/g, "").includes(clean);
      return matchNum || matchPhone;
    });

    setSearchedOrders(results);
    setHasSearched(true);
  };

  if (initialQuery && initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery);
    setQueryInput(initialQuery);
    const clean = initialQuery.trim().toLowerCase().replace(/[-\s]/g, "");
    const results = orders.filter((o) => {
      const matchNum = o.orderNumber.toLowerCase().replace(/[-\s]/g, "").includes(clean);
      const matchPhone = o.customerPhone.replace(/[-\s]/g, "").includes(clean);
      return matchNum || matchPhone;
    });
    setSearchedOrders(results);
    setHasSearched(true);
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(queryInput);
  };

  const handleReportLast5 = (orderId: string) => {
    const code = (inputLast5Map[orderId] || "").trim();
    if (code.length !== 5) {
      alert("請輸入正確的 5 碼銀行帳號末五碼");
      return;
    }

    onUpdateOrderBankLast5(orderId, code);
    setReportSuccessId(orderId);
    setTimeout(() => setReportSuccessId(null), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Header & Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToStore}
          className="inline-flex items-center text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回團購商品列表
        </button>

        <span className="text-xs text-slate-400">
          客服 LINE: <strong>{brand.contactLine}</strong>
        </span>
      </div>

      {/* Inquiry Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">消費者訂單進度查詢與末五碼回報</h2>
          <p className="text-xs text-slate-500">
            請輸入您下單時填寫的<strong>「手機號碼」</strong>或<strong>「訂單編號」</strong>
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="例如：0912345678 或 GB-2026..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0"
          >
            查詢訂單
          </button>
        </form>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4 animate-in fade-in">
          {searchedOrders.length > 0 ? (
            searchedOrders.map((order) => {
              const currentInput = inputLast5Map[order.id] ?? (order.bankLast5 || "");

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-black text-slate-900 text-base">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        訂購人：{order.customerName} ({order.customerPhone})
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block">應付總額</span>
                      <span className="text-xl font-black text-rose-600">
                        NT$ {order.totalAmount}
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-3">
                    <div className="text-xs font-bold text-slate-700">📦 物流與付款即時進度：</div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                      {/* Step 1: Placed */}
                      <div className="space-y-1">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-bold shadow-xs">
                          ✓
                        </div>
                        <div className="font-bold text-slate-800">1. 下單成立</div>
                      </div>

                      {/* Step 2: Payment */}
                      <div className="space-y-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                            order.paymentStatus === "paid"
                              ? "bg-emerald-600 text-white"
                              : order.paymentStatus === "verifying"
                              ? "bg-amber-500 text-white animate-pulse"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {order.paymentStatus === "paid" ? "✓" : "2"}
                        </div>
                        <div
                          className={`font-bold ${
                            order.paymentStatus === "paid"
                              ? "text-emerald-700"
                              : order.paymentStatus === "verifying"
                              ? "text-amber-700"
                              : "text-slate-400"
                          }`}
                        >
                          {order.paymentStatus === "paid"
                            ? "對帳完成"
                            : order.paymentStatus === "verifying"
                            ? "核銷對帳中"
                            : "待填末五碼"}
                        </div>
                      </div>

                      {/* Step 3: Packing */}
                      <div className="space-y-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                            order.shippingStatus === "shipped" || order.shippingStatus === "delivered"
                              ? "bg-emerald-600 text-white"
                              : order.paymentStatus === "paid"
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {order.shippingStatus === "shipped" || order.shippingStatus === "delivered"
                            ? "✓"
                            : "3"}
                        </div>
                        <div
                          className={`font-bold ${
                            order.shippingStatus === "shipped" || order.shippingStatus === "delivered"
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          包裝備貨
                        </div>
                      </div>

                      {/* Step 4: Shipped */}
                      <div className="space-y-1">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                            order.shippingStatus === "shipped" || order.shippingStatus === "delivered"
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {order.shippingStatus === "delivered" ? "✓" : "4"}
                        </div>
                        <div
                          className={`font-bold ${
                            order.shippingStatus === "shipped"
                              ? "text-blue-700"
                              : order.shippingStatus === "delivered"
                              ? "text-emerald-700"
                              : "text-slate-400"
                          }`}
                        >
                          {order.shippingStatus === "shipped"
                            ? "已出貨配送"
                            : order.shippingStatus === "delivered"
                            ? "已配達取件"
                            : "出貨配送"}
                        </div>
                      </div>
                    </div>

                    {order.trackingNumber && (
                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-500">🚚 物流追蹤號碼：</span>
                        <span className="font-mono font-bold text-indigo-600">
                          {order.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bank Last 5 Report Box */}
                  {order.paymentMethod === "bank_transfer" && (
                    <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-indigo-950 flex items-center">
                          <Building2 className="w-4 h-4 mr-1 text-indigo-600" />
                          匯款末五碼回報與核銷
                        </div>
                        {order.paymentStatus === "paid" && (
                          <span className="text-emerald-700 text-xs font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                            ✓ 款項已對帳完成
                          </span>
                        )}
                      </div>

                      {order.paymentStatus !== "paid" ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={5}
                              placeholder="輸入您匯款帳號後 5 碼"
                              value={currentInput}
                              onChange={(e) =>
                                setInputLast5Map({ ...inputLast5Map, [order.id]: e.target.value })
                              }
                              className="flex-1 px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <button
                              type="button"
                              onClick={() => handleReportLast5(order.id)}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shrink-0"
                            >
                              送出末五碼
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            匯款帳戶：{brand.bankCode} {brand.bankName} 帳號: {brand.bankAccount} (戶名: {brand.bankAccountName})
                          </p>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-600 font-mono">
                          登記末五碼：<strong>{order.bankLast5}</strong>
                        </div>
                      )}

                      {reportSuccessId === order.id && (
                        <div className="text-xs font-bold text-emerald-700 flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1" /> 已成功回報末五碼，後台已進入自動對帳隊列！
                        </div>
                      )}
                    </div>
                  )}

                  {/* Order Items Table */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">訂購明細：</div>
                    <div className="space-y-1 text-xs">
                      {order.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between"
                        >
                          <div>
                            <span className="font-semibold text-slate-900">{it.productName}</span>
                            <span className="text-slate-500 ml-1">({it.variantName})</span>
                          </div>
                          <div className="font-mono">
                            x {it.quantity} ={" "}
                            <strong className="text-slate-900">NT$ {it.price * it.quantity}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
              找不到與「{queryInput}」相關的訂單紀錄，請確認電話號碼或訂單編號是否正確。
            </div>
          )}
        </div>
      )}
    </div>
  );
};

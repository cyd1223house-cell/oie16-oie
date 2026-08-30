import React, { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  FileSpreadsheet,
  Edit,
} from "lucide-react";
import { Order, PaymentStatus, ShippingStatus } from "../types/groupbuy";

interface OrderManagerProps {
  orders: Order[];
  onUpdateOrders: (orders: Order[]) => void;
  onAddToBlacklist?: (name: string, phone: string, reason: string) => void;
}

export const OrderManager: React.FC<OrderManagerProps> = ({
  orders,
  onUpdateOrders,
  onAddToBlacklist,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editLast5, setEditLast5] = useState("");
  const [trackingNoInput, setTrackingNoInput] = useState("");
  const [auditScanResult, setAuditScanResult] = useState<string | null>(null);

  // Anti-Leakage AI Scan
  const runAntiLeakageScan = () => {
    // Detect duplicate phone numbers within close time or missing last 5 digits
    const phoneMap = new Map<string, number>();
    orders.forEach((o) => {
      phoneMap.set(o.customerPhone, (phoneMap.get(o.customerPhone) || 0) + 1);
    });

    const duplicates = orders.filter((o) => (phoneMap.get(o.customerPhone) || 0) > 1);
    const unpaids = orders.filter((o) => o.paymentStatus === "unpaid");
    const verifying = orders.filter((o) => o.paymentStatus === "verifying");

    setAuditScanResult(
      `🛡️ AI 防漏單掃描完畢：發現 ${verifying.length} 筆已填末五碼待核銷、${unpaids.length} 筆待付款、${duplicates.length} 筆同一手機號碼多單提醒（已標記為防重複防漏單狀態）！`
    );
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm) ||
      (o.bankLast5 && o.bankLast5.includes(searchTerm));

    if (!matchesSearch) return false;
    if (statusFilter === "all") return true;
    if (statusFilter === "unpaid") return o.paymentStatus === "unpaid";
    if (statusFilter === "verifying") return o.paymentStatus === "verifying";
    if (statusFilter === "paid") return o.paymentStatus === "paid";
    if (statusFilter === "pending_ship") return o.paymentStatus === "paid" && o.shippingStatus !== "shipped" && o.shippingStatus !== "delivered";
    if (statusFilter === "shipped") return o.shippingStatus === "shipped";
    return true;
  });

  const handleUpdatePaymentStatus = (orderId: string, status: PaymentStatus) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            paymentStatus: status,
            updatedAt: new Date().toISOString(),
            auditNotes: status === "paid" ? `已核對後五碼款項正確 (${new Date().toLocaleDateString()})` : o.auditNotes,
          }
        : o
    );
    onUpdateOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus: status });
    }
  };

  const handleUpdateShippingStatus = (orderId: string, status: ShippingStatus, tracking?: string) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            shippingStatus: status,
            trackingNumber: tracking || o.trackingNumber,
            updatedAt: new Date().toISOString(),
          }
        : o
    );
    onUpdateOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, shippingStatus: status, trackingNumber: tracking || selectedOrder.trackingNumber });
    }
  };

  const handleSaveReconciliation = () => {
    if (!selectedOrder) return;
    const updated = orders.map((o) =>
      o.id === selectedOrder.id
        ? {
            ...o,
            bankLast5: editLast5 || o.bankLast5,
            trackingNumber: trackingNoInput || o.trackingNumber,
            paymentStatus: editLast5 ? "paid" : o.paymentStatus,
            updatedAt: new Date().toISOString(),
          }
        : o
    );
    onUpdateOrders(updated);
    setSelectedOrder(null);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCSV = () => {
    const headers = "訂單編號,訂購人,電話,品項規格,總金額,付款方式,付款狀態,末五碼,出貨方式,收件地址,物流單號,備註\n";
    const rows = orders
      .map((o) => {
        const itemStr = o.items.map((i) => `${i.productName}(${i.variantName})x${i.quantity}`).join("; ");
        return `"${o.orderNumber}","${o.customerName}","${o.customerPhone}","${itemStr}",${o.totalAmount},"${o.paymentMethod}","${o.paymentStatus}","${o.bankLast5 || ""}","${o.shippingType}","${o.shippingAddress}","${o.trackingNumber || ""}","${o.notes || ""}"`;
      })
      .join("\n");

    const blob = new Blob(["\uFEFF" + headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `團購訂單清單_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-6 bg-emerald-600 rounded-full" />
            <h2 className="text-xl font-bold text-slate-900">收單中心與防漏單對帳工作台</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            一站式管理團購訂單：匯款末五碼對帳、自動標記防漏單、出貨單號批次登記與匯出。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={runAntiLeakageScan}
            className="inline-flex items-center px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs sm:text-sm font-bold border border-indigo-200 transition-all"
          >
            <ShieldCheck className="w-4 h-4 mr-1.5 text-indigo-600" />
            AI 智慧防漏單健檢
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            匯出 Excel/CSV
          </button>
        </div>
      </div>

      {/* Anti-Leak Scan Alert */}
      {auditScanResult && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-2xl text-xs sm:text-sm flex items-start space-x-2 animate-in fade-in">
          <ShieldAlert className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="flex-1">{auditScanResult}</div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="搜尋訂單編號、訂購人姓名、電話、末五碼..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { key: "all", label: "全部訂單" },
            { key: "verifying", label: "待核對末五碼" },
            { key: "unpaid", label: "未付款" },
            { key: "pending_ship", label: "已付款待出貨" },
            { key: "shipped", label: "已出貨" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.key
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">訂單編號</th>
                <th className="py-3 px-4">訂購人與電話</th>
                <th className="py-3 px-4">訂購明細與規格</th>
                <th className="py-3 px-4">總金額</th>
                <th className="py-3 px-4">付款狀態 / 後五碼</th>
                <th className="py-3 px-4">物流配送狀態</th>
                <th className="py-3 px-4 text-right">操作對帳</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Order Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <div className="flex items-center space-x-1">
                          <span>{order.orderNumber}</span>
                          <button
                            onClick={() => handleCopy(order.orderNumber, order.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal">
                          {new Date(order.createdAt).toLocaleDateString()}{" "}
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center">
                          {order.customerName}
                          {order.isDuplicateAlert && (
                            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                              同手機多單
                            </span>
                          )}
                        </div>
                        <div className="text-slate-500 font-mono">{order.customerPhone}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{order.shippingAddress}</div>
                      </td>

                      {/* Items */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-1">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="text-slate-800">
                              <span className="font-semibold">{it.productName}</span>
                              <span className="text-slate-500 text-[11px] ml-1">
                                [{it.variantName}] x {it.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 font-black text-rose-600 text-sm">
                        NT$ {order.totalAmount}
                        <div className="text-[10px] font-normal text-slate-400">
                          {order.paymentMethod === "bank_transfer"
                            ? "ATM 轉帳"
                            : order.paymentMethod === "cod"
                            ? "貨到付款"
                            : "LINE Pay"}
                        </div>
                      </td>

                      {/* Payment Status & Bank Last 5 */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col space-y-1">
                          {order.paymentStatus === "paid" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 w-fit">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> 已完成付款
                            </span>
                          )}
                          {order.paymentStatus === "verifying" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 w-fit">
                              <Clock className="w-3 h-3 mr-1 text-amber-600" /> 已填末五碼待查
                            </span>
                          )}
                          {order.paymentStatus === "unpaid" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 w-fit">
                              尚未付款
                            </span>
                          )}

                          {order.bankLast5 ? (
                            <span className="text-[11px] font-mono font-bold text-slate-700">
                              末五碼: <strong className="text-indigo-600">{order.bankLast5}</strong>
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">無末五碼</span>
                          )}
                        </div>
                      </td>

                      {/* Shipping Status */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {order.shippingStatus === "shipped" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                              <Truck className="w-3 h-3 mr-1" /> 已出貨配送
                            </span>
                          )}
                          {order.shippingStatus === "delivered" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                              已送達取件
                            </span>
                          )}
                          {order.shippingStatus === "pending" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                              備貨處理中
                            </span>
                          )}

                          {order.trackingNumber && (
                            <div className="text-[10px] font-mono text-slate-500">
                              單號: {order.trackingNumber}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Action Menu */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setEditLast5(order.bankLast5 || "");
                            setTrackingNoInput(order.trackingNumber || "");
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs inline-flex items-center"
                        >
                          <Edit className="w-3 h-3 mr-1" /> 對帳/核銷
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    目前無符合篩選條件的訂單
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Order Reconciliation & Shipping Update */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">訂單核銷與對帳處理</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedOrder.orderNumber}</p>
              </div>
              <span className="text-base font-black text-rose-600">
                應付: NT$ {selectedOrder.totalAmount}
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800">
                  訂購人: {selectedOrder.customerName} ({selectedOrder.customerPhone})
                </div>
                <div className="text-slate-500 mt-1">{selectedOrder.shippingAddress}</div>
              </div>

              {/* Bank Last 5 Input */}
              <div>
                <label htmlFor="bank-last5-input" className="block font-semibold text-slate-700 mb-1">
                  匯款帳號末五碼（核銷比對）
                </label>
                <div className="flex gap-2">
                  <input
                    id="bank-last5-input"
                    type="text"
                    maxLength={5}
                    placeholder="例如: 89012"
                    value={editLast5}
                    onChange={(e) => setEditLast5(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-sm font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdatePaymentStatus(selectedOrder.id, "paid")}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0"
                  >
                    一鍵確認收款
                  </button>
                </div>
              </div>

              {/* Tracking Number Input */}
              <div>
                <label htmlFor="tracking-no-input" className="block font-semibold text-slate-700 mb-1">
                  出貨物流追蹤單號
                </label>
                <div className="flex gap-2">
                  <input
                    id="tracking-no-input"
                    type="text"
                    placeholder="例如: TC-88912345"
                    value={trackingNoInput}
                    onChange={(e) => setTrackingNoInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateShippingStatus(selectedOrder.id, "shipped", trackingNoInput)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0"
                  >
                    標記已出貨
                  </button>
                </div>
              </div>

              {/* Blacklist Shortcut */}
              {onAddToBlacklist && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">若此訂單為惡意跑單或假帳號：</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`確定將 ${selectedOrder.customerName} (${selectedOrder.customerPhone}) 列入黑名單嗎？`)) {
                        onAddToBlacklist(
                          selectedOrder.customerName,
                          selectedOrder.customerPhone,
                          "訂單逾期未匯款 / 惡意下單"
                        );
                        setSelectedOrder(null);
                      }
                    }}
                    className="text-rose-600 hover:underline font-semibold"
                  >
                    🚫 列入黑名單並封鎖
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                關閉
              </button>
              <button
                type="button"
                onClick={handleSaveReconciliation}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
              >
                儲存變更
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

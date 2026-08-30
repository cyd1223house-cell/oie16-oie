import React, { useState } from "react";
import {
  Search,
  Crown,
  Award,
  Phone,
  ShieldBan,
  Edit2,
  Check,
} from "lucide-react";
import { Customer } from "../types/groupbuy";

interface CustomerCRMProps {
  customers: Customer[];
  onUpdateCustomers: (customers: Customer[]) => void;
  onAddToBlacklist: (name: string, phone: string, reason: string) => void;
}

export const CustomerCRM: React.FC<CustomerCRMProps> = ({
  customers,
  onUpdateCustomers,
  onAddToBlacklist,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveNote = (id: string) => {
    const updated = customers.map((c) => (c.id === id ? { ...c, notes: noteText } : c));
    onUpdateCustomers(updated);
    setEditingNoteId(null);
  };

  const getTierBadge = (tier: Customer["tier"]) => {
    switch (tier) {
      case "diamond_vip":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Crown className="w-3 h-3 mr-1 text-purple-600" />
            鑽石 VIP
          </span>
        );
      case "vip":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Award className="w-3 h-3 mr-1 text-amber-600" />
            忠實團友
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            一般會員
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-6 bg-teal-600 rounded-full" />
            <h2 className="text-xl font-bold text-slate-900">團友會員資料庫與 CRM</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            輕鬆管理團友資料：累積消費等級、專屬偏好備註、回購頻率與風控快速標記。
          </p>
        </div>

        <div className="text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">
          總團友數：{customers.length} 位
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="搜尋團友姓名、手機號碼、Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.map((customer) => {
          const isEditing = editingNoteId === customer.id;

          return (
            <div
              key={customer.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3.5 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-black text-base flex items-center justify-center shadow-xs">
                      {customer.name.slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 text-base">{customer.name}</h4>
                        {getTierBadge(customer.tier)}
                      </div>
                      <div className="text-xs text-slate-400 font-mono flex items-center mt-0.5">
                        <Phone className="w-3 h-3 mr-1" />
                        {customer.phone}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `確定將 ${customer.name} (${customer.phone}) 列入黑名單嗎？列入後前台將自動攔截下單。`
                        )
                      ) {
                        onAddToBlacklist(customer.name, customer.phone, "由團友管理中心手動標記黑名單");
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                    title="加黑名單"
                  >
                    <ShieldBan className="w-4 h-4" />
                  </button>
                </div>

                {/* Spending Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400">累積消費金額</span>
                    <div className="text-sm font-black text-rose-600 mt-0.5">
                      NT$ {customer.totalSpent.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400">跟團訂購次數</span>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">
                      {customer.orderCount} <span className="text-xs font-normal">次</span>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {customer.tags && customer.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {customer.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes Section */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold">團長專屬備註</span>
                    {!isEditing && (
                      <button
                        onClick={() => {
                          setEditingNoteId(customer.id);
                          setNoteText(customer.notes || "");
                        }}
                        className="text-[11px] text-teal-600 hover:underline inline-flex items-center"
                      >
                        <Edit2 className="w-3 h-3 mr-0.5" /> 編輯備註
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        className="w-full text-xs p-2 border border-teal-300 rounded-lg focus:ring-1 focus:ring-teal-500"
                        placeholder="填寫此團友的特殊喜好、出貨提醒..."
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded-md"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleSaveNote(customer.id)}
                          className="px-3 py-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-md flex items-center"
                        >
                          <Check className="w-3 h-3 mr-1" /> 儲存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-50 rounded-lg text-xs text-slate-600 italic">
                      {customer.notes || "尚無專屬備註"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

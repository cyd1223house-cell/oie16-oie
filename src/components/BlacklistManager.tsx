import React, { useState } from "react";
import {
  ShieldBan,
  Plus,
  Trash2,
  AlertOctagon,
  Search,
  ShieldCheck,
} from "lucide-react";
import { BlacklistEntry, BrandSettings } from "../types/groupbuy";

interface BlacklistManagerProps {
  blacklist: BlacklistEntry[];
  onUpdateBlacklist: (blacklist: BlacklistEntry[]) => void;
  brand: BrandSettings;
  onUpdateBrand: (brand: BrandSettings) => void;
}

export const BlacklistManager: React.FC<BlacklistManagerProps> = ({
  blacklist,
  onUpdateBlacklist,
  brand,
  onUpdateBrand,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("惡意棄單未取件");

  const filtered = blacklist.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      (b.email && b.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    const newEntry: BlacklistEntry = {
      id: `bl-${Date.now()}`,
      name: name || "惡意下單者",
      phone: phone.trim(),
      email: email.trim() || undefined,
      reason,
      addedAt: new Date().toISOString(),
      interceptCount: 0,
      operator: "團長手動建立",
    };

    onUpdateBlacklist([newEntry, ...blacklist]);
    setName("");
    setPhone("");
    setEmail("");
    setReason("惡意棄單未取件");
    setIsModalOpen(false);
  };

  const handleRemove = (id: string) => {
    if (window.confirm("確定要將此號碼移出黑名單嗎？")) {
      onUpdateBlacklist(blacklist.filter((b) => b.id !== id));
    }
  };

  const toggleGuard = () => {
    onUpdateBrand({
      ...brand,
      enableBlacklistGuard: !brand.enableBlacklistGuard,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-6 bg-rose-600 rounded-full" />
            <h2 className="text-xl font-bold text-slate-900">黑名單防護與惡意跑單攔截系統</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            針對超商未取、惡意刷單、造假末五碼之買家手機號碼進行前台即時攔截，守護團購利潤。
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Toggle Auto Guard */}
          <button
            onClick={toggleGuard}
            className={`inline-flex items-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
              brand.enableBlacklistGuard
                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                : "bg-slate-100 text-slate-500 border-slate-200"
            }`}
          >
            {brand.enableBlacklistGuard ? (
              <>
                <ShieldCheck className="w-4 h-4 mr-1.5 text-emerald-600" />
                前台自動攔截：已啟動
              </>
            ) : (
              <>
                <ShieldBan className="w-4 h-4 mr-1.5 text-slate-400" />
                前台自動攔截：已暫停
              </>
            )}
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            新增黑名單
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="搜尋黑名單姓名、電話..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
        />
      </div>

      {/* Blacklist Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-rose-50/50 border-b border-rose-100 text-rose-950 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">黑名單對象</th>
                <th className="py-3 px-4">封鎖電話</th>
                <th className="py-3 px-4">加入原因 / 惡意紀錄</th>
                <th className="py-3 px-4">累計攔截次數</th>
                <th className="py-3 px-4">建立時間 / 來源</th>
                <th className="py-3 px-4 text-right">解鎖移除</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center">
                      <AlertOctagon className="w-3.5 h-3.5 mr-1.5 text-rose-600 shrink-0" />
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-700">{item.phone}</td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-sm">{item.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                        {item.interceptCount} 次成功擋單
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      <div>{new Date(item.addedAt).toLocaleDateString()}</div>
                      <div className="text-slate-500">{item.operator}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg text-xs inline-flex items-center"
                        title="解除黑名單"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> 解除
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    目前無黑名單記錄
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Blacklist */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center">
              <ShieldBan className="w-5 h-5 text-rose-600 mr-2" />
              新增封鎖黑名單
            </h3>

            <form onSubmit={handleAdd} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label htmlFor="bl-phone-input" className="block font-semibold text-slate-700 mb-1">封鎖手機號碼 *</label>
                <input
                  id="bl-phone-input"
                  type="tel"
                  required
                  placeholder="例如: 0987-654-321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label htmlFor="bl-name-input" className="block font-semibold text-slate-700 mb-1">對象姓名 / 暱稱</label>
                <input
                  id="bl-name-input"
                  type="text"
                  placeholder="例如: 王志豪"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label htmlFor="bl-reason-select" className="block font-semibold text-slate-700 mb-1">封鎖原因</label>
                <select
                  id="bl-reason-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                >
                  <option value="超商貨到付款惡意棄單未取件 2 次以上">超商貨到付款惡意棄單未取件</option>
                  <option value="下單後逾期未匯款且多次催繳不回應">下單後逾期未匯款且多次催繳不回應</option>
                  <option value="偽造不實末五碼或造假匯款明細">偽造不實末五碼或造假匯款明細</option>
                  <option value="惡意大量下單佔用團購庫存">惡意大量下單佔用團購庫存</option>
                  <option value="其他客訴爭議 / 奧客封鎖">其他客訴爭議 / 奧客封鎖</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
                >
                  確認加入黑名單
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

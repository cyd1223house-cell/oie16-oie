import React, { useState } from "react";
import {
  Image as ImageIcon,
  Palette,
  CreditCard,
  Check,
  RotateCcw,
} from "lucide-react";
import { BrandSettings } from "../types/groupbuy";

interface BrandSettingsProps {
  brand: BrandSettings;
  onUpdateBrand: (brand: BrandSettings) => void;
  onResetDefaults?: () => void;
}

export const BrandSettingsComponent: React.FC<BrandSettingsProps> = ({
  brand,
  onUpdateBrand,
  onResetDefaults,
}) => {
  const [storeName, setStoreName] = useState(brand.storeName);
  const [slogan, setSlogan] = useState(brand.slogan);
  const [logoUrl, setLogoUrl] = useState(brand.logoUrl);
  const [themeColor, setThemeColor] = useState<BrandSettings["themeColor"]>(brand.themeColor);
  const [bankCode, setBankCode] = useState(brand.bankCode);
  const [bankName, setBankName] = useState(brand.bankName);
  const [bankAccount, setBankAccount] = useState(brand.bankAccount);
  const [bankAccountName, setBankAccountName] = useState(brand.bankAccountName);
  const [announcement, setAnnouncement] = useState(brand.announcement);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(brand.freeShippingThreshold);
  const [shippingFee, setShippingFee] = useState(brand.shippingFee);
  const [campaignTitle, setCampaignTitle] = useState(brand.campaignTitle);
  const [campaignEndAt, setCampaignEndAt] = useState(brand.campaignEndAt);
  const [campaignTargetAmount, setCampaignTargetAmount] = useState(brand.campaignTargetAmount);
  const [isSaved, setIsSaved] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result) {
          setLogoUrl(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBrand({
      ...brand,
      storeName,
      slogan,
      logoUrl,
      themeColor,
      bankCode,
      bankName,
      bankAccount,
      bankAccountName,
      announcement,
      freeShippingThreshold,
      shippingFee,
      campaignTitle,
      campaignEndAt,
      campaignTargetAmount,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-6 bg-indigo-600 rounded-full" />
            <h2 className="text-xl font-bold text-slate-900">品牌外觀與團購商店設定</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            自行更換品牌 LOGO、自訂主題色彩、開團檔期公告與 ATM 匯款對帳帳戶資訊。
          </p>
        </div>

        {isSaved && (
          <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold animate-in fade-in">
            <Check className="w-4 h-4 mr-1 text-emerald-600" />
            已成功儲存設定！
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. LOGO & Brand Visuals */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center">
            <ImageIcon className="w-4 h-4 mr-2 text-indigo-600" />
            1. 品牌識別與 LOGO 更換
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Logo Preview */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Store Logo"
                  className="w-24 h-24 rounded-2xl object-cover shadow-md border-2 border-indigo-500/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-3xl flex items-center justify-center shadow-md">
                  日
                </div>
              )}
              <span className="text-xs text-slate-400 mt-2">前台即時 LOGO 預覽</span>
            </div>

            {/* Logo Upload & URL Options */}
            <div className="sm:col-span-8 space-y-3 text-xs sm:text-sm">
              <div>
                <label htmlFor="bs-logo-file" className="block font-semibold text-slate-700 mb-1">
                  上傳自訂 LOGO 圖檔 (支援 PNG/JPG/WebP/SVG)
                </label>
                <input
                  id="bs-logo-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="bs-logo-url" className="block font-semibold text-slate-700 mb-1">或輸入 LOGO 圖片網址</label>
                <input
                  id="bs-logo-url"
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="text-xs text-slate-400 hover:text-rose-600"
                >
                  清除自訂 LOGO (使用預設品牌向量圖)
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label htmlFor="bs-store-name" className="block font-semibold text-slate-700 mb-1 text-xs sm:text-sm">
                團購商店名稱
              </label>
              <input
                id="bs-store-name"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="bs-slogan" className="block font-semibold text-slate-700 mb-1 text-xs sm:text-sm">
                副標 Slogan 口號
              </label>
              <input
                id="bs-slogan"
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* 2. Theme Colors & Campaign Rules */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center">
            <Palette className="w-4 h-4 mr-2 text-purple-600" />
            2. 主題色系與檔期活動設定
          </h3>

          <div>
            <div className="block font-semibold text-slate-700 mb-2 text-xs sm:text-sm">
              商店品牌主色調
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { key: "indigo", label: "星空靛藍", bg: "bg-indigo-600" },
                { key: "rose", label: "熱銷赤紅", bg: "bg-rose-600" },
                { key: "amber", label: "溫暖琥珀", bg: "bg-amber-600" },
                { key: "emerald", label: "翡翠森林", bg: "bg-emerald-600" },
                { key: "purple", label: "極致紫羅蘭", bg: "bg-purple-600" },
              ].map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setThemeColor(c.key as BrandSettings["themeColor"])}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center space-x-2 transition cursor-pointer ${
                    themeColor === c.key
                      ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${c.bg}`} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label htmlFor="bs-campaign-title" className="block font-semibold text-slate-700 mb-1">當前開團檔期標題</label>
              <input
                id="bs-campaign-title"
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label htmlFor="bs-campaign-end" className="block font-semibold text-slate-700 mb-1">結團倒數截止時間</label>
              <input
                id="bs-campaign-end"
                type="datetime-local"
                value={campaignEndAt}
                onChange={(e) => setCampaignEndAt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div>
              <label htmlFor="bs-free-shipping" className="block font-semibold text-slate-700 mb-1">滿額免運門檻 (NT$)</label>
              <input
                id="bs-free-shipping"
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label htmlFor="bs-shipping-fee" className="block font-semibold text-slate-700 mb-1">基本常溫/低溫運費 (NT$)</label>
              <input
                id="bs-shipping-fee"
                type="number"
                value={shippingFee}
                onChange={(e) => setShippingFee(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label htmlFor="bs-target-amount" className="block font-semibold text-slate-700 mb-1">本期成團目標金額 (NT$)</label>
              <input
                id="bs-target-amount"
                type="number"
                value={campaignTargetAmount}
                onChange={(e) => setCampaignTargetAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="bs-announcement" className="block font-semibold text-slate-700 mb-1 text-xs sm:text-sm">
              前台置頂公告 (團友須知)
            </label>
            <textarea
              id="bs-announcement"
              rows={2}
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm"
            />
          </div>
        </div>

        {/* 3. Bank Account for ATM Transfers */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base flex items-center">
            <CreditCard className="w-4 h-4 mr-2 text-emerald-600" />
            3. ATM 銀行匯款資訊 (供前台消費者核銷)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <label htmlFor="bs-bank-code" className="block font-semibold text-slate-700 mb-1">銀行代碼 (3碼)</label>
              <input
                id="bs-bank-code"
                type="text"
                placeholder="例如: 822"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label htmlFor="bs-bank-name" className="block font-semibold text-slate-700 mb-1">銀行與分行名稱</label>
              <input
                id="bs-bank-name"
                type="text"
                placeholder="例如: 中國信託商業銀行 (敦南分行)"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label htmlFor="bs-bank-acc" className="block font-semibold text-slate-700 mb-1">銀行帳號</label>
              <input
                id="bs-bank-acc"
                type="text"
                placeholder="例如: 9015-4029-8812"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>
            <div>
              <label htmlFor="bs-bank-owner" className="block font-semibold text-slate-700 mb-1">戶名</label>
              <input
                id="bs-bank-owner"
                type="text"
                placeholder="例如: 日光嚴選工作室"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* 4. Admin Security & Operator Credentials */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center">
              <span className="w-2 h-5 bg-slate-900 rounded-full mr-2" />
              後台管理員登入身分與安全帳密
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              已啟用快速授權
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs sm:text-sm">
            <p className="text-slate-600">
              團長或營運團隊可使用以下預設管理員帳號密碼登入後台指揮中樞、管理訂單及商品：
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-medium">預設管理員帳號：</span>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  admin
                </span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-slate-500 font-medium">預設管理員密碼：</span>
                <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  1234
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              💡 提示：在頂部導航列點擊「後台登入」時，亦可點擊「一鍵帶入登入」立即解鎖管理權限。
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          {onResetDefaults && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm("確定恢復初始展示資料嗎？")) {
                  onResetDefaults();
                }
              }}
              className="inline-flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> 恢復預設示範資料
            </button>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all ml-auto"
          >
            儲存所有品牌與商店設定
          </button>
        </div>
      </form>
    </div>
  );
};

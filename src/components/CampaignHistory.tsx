import React from "react";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Calendar,
  Sparkles,
} from "lucide-react";
import { CampaignRecord, BrandSettings } from "../types/groupbuy";

interface CampaignHistoryProps {
  campaigns: CampaignRecord[];
  brand: BrandSettings;
  onCloneCampaign?: (camp: CampaignRecord) => void;
}

export const CampaignHistory: React.FC<CampaignHistoryProps> = ({
  campaigns,
  brand,
  onCloneCampaign,
}) => {
  const totalAllSales = campaigns.reduce((acc, c) => acc + c.totalSales, 0);
  const totalAllOrders = campaigns.reduce((acc, c) => acc + c.orderCount, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-6 bg-amber-500 rounded-full" />
            <h2 className="text-xl font-bold text-slate-900">開團紀錄與成效分析</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            歷史開團紀錄存檔、團購業績達成率、客單價分析與一鍵再開團。
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl">
          <Sparkles className="w-4 h-4 text-amber-600 mr-1" />
          <span>累計開團營業額：NT$ {totalAllSales.toLocaleString()}</span>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>本期累計銷售額</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            NT$ {campaigns[0]?.totalSales.toLocaleString() || "0"}
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full"
              style={{
                width: `${Math.min(
                  100,
                  ((campaigns[0]?.totalSales || 0) / (brand.campaignTargetAmount || 150000)) * 100
                )}%`,
              }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            目標達成率:{" "}
            <strong className="text-slate-700">
              {Math.round(
                ((campaigns[0]?.totalSales || 0) / (brand.campaignTargetAmount || 150000)) * 100
              )}
              %
            </strong>{" "}
            (目標 $ {brand.campaignTargetAmount.toLocaleString()})
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>累計成團訂單數</span>
            <ShoppingBag className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalAllOrders} <span className="text-sm font-normal text-slate-500">筆訂單</span>
          </div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            平均每檔成團率 98.4%
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>平均團購客單價 (AOV)</span>
            <BarChart3 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            NT$ {campaigns[0]?.avgOrderValue.toLocaleString() || "1,740"}
          </div>
          <div className="text-xs text-slate-400">滿額免運門檻 $ {brand.freeShippingThreshold}</div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-900 text-base">歷史開團檔期清單</h3>

        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((camp) => (
            <div
              key={camp.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        camp.status === "active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {camp.status === "active" ? "進行中" : "已結團"}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">{camp.title}</h4>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {camp.startDate} ~ {camp.endDate}
                    </span>
                  </div>
                </div>

                <div className="text-right flex items-center space-x-3">
                  <div>
                    <div className="text-lg font-black text-slate-900">
                      NT$ {camp.totalSales.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400">總訂單: {camp.orderCount} 筆</div>
                  </div>
                  {onCloneCampaign && (
                    <button
                      type="button"
                      onClick={() => onCloneCampaign(camp)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition cursor-pointer"
                    >
                      複製開團
                    </button>
                  )}
                </div>
              </div>

              {/* Top Products Leaderboard */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2">熱銷排行商品 TOP</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {camp.topProducts.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-amber-600 mr-1">#{idx + 1}</span>
                        <span className="text-slate-800 font-semibold truncate">{p.name}</span>
                      </div>
                      <span className="text-slate-500 font-mono shrink-0">{p.quantity} 件</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

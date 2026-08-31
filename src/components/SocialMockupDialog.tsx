import React from "react";
import { X, Copy, Check, ThumbsUp, MessageCircle, Share2, Heart, Bookmark, Send, Repeat2 } from "lucide-react";

interface SocialMockupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  platform: "facebook" | "instagram" | "line" | "threads";
  title: string;
  body: string;
  hashtags?: string[];
  imageUrl?: string;
  brandName?: string;
}

export const SocialMockupDialog: React.FC<SocialMockupDialogProps> = ({
  isOpen,
  onClose,
  platform,
  title,
  body,
  hashtags = [],
  imageUrl,
  brandName = "日光選物 ‧ 團購主",
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const fullText = `${body}${hashtags.length > 0 ? `\n\n${hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")}` : ""}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center space-x-2">
            <span
              className={`w-3 h-3 rounded-full ${
                platform === "facebook"
                  ? "bg-blue-600"
                  : platform === "instagram"
                  ? "bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600"
                  : platform === "threads"
                  ? "bg-black"
                  : "bg-emerald-500"
              }`}
            />
            <h3 className="font-bold text-slate-800 text-base">
              {title ||
                (platform === "facebook"
                  ? "Facebook 貼文擬真預覽"
                  : platform === "instagram"
                  ? "Instagram 視覺貼文預覽"
                  : platform === "threads"
                  ? "Threads 討論串擬真預覽"
                  : "LINE 社群推播訊息預覽")}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              {copied ? "已複製完整文案" : "一鍵複製"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content / Mobile Frame Simulation */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-100/70 flex justify-center">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            {/* Facebook Style */}
            {platform === "facebook" && (
              <div className="text-sm">
                <div className="p-3.5 flex items-center space-x-2.5 border-b border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    日
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 leading-tight">{brandName}</div>
                    <div className="text-[11px] text-slate-400">剛剛 ‧ 🌐 公開 ‧ 團購限時優惠</div>
                  </div>
                </div>
                <div className="p-3.5 whitespace-pre-wrap text-slate-800 leading-relaxed font-sans text-xs sm:text-sm">
                  {body}
                  {hashtags.length > 0 && (
                    <div className="mt-3 text-blue-600 font-medium">
                      {hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}
                    </div>
                  )}
                </div>
                {imageUrl && (
                  <div className="relative aspect-4/3 bg-slate-100 border-t border-slate-100 overflow-hidden">
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="p-2.5 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs px-4 bg-slate-50/50">
                  <span className="flex items-center space-x-1">
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] flex items-center justify-center">👍</span>
                    <span className="font-semibold text-slate-700">128 人搶購中</span>
                  </span>
                  <span>46 則留言 ‧ 32 次分享</span>
                </div>
                <div className="p-2 border-t border-slate-100 flex justify-around text-slate-600 text-xs font-semibold">
                  <button className="flex items-center space-x-1 hover:text-blue-600">
                    <ThumbsUp className="w-4 h-4" /> <span>讚</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-blue-600">
                    <MessageCircle className="w-4 h-4" /> <span>+1 留言</span>
                  </button>
                  <button className="flex items-center space-x-1 hover:text-blue-600">
                    <Share2 className="w-4 h-4" /> <span>分享</span>
                  </button>
                </div>
              </div>
            )}

            {/* Instagram Style */}
            {platform === "instagram" && (
              <div className="text-xs sm:text-sm">
                <div className="p-3 flex items-center justify-between border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-[10px] text-slate-900">
                        日
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs leading-none">{brandName}</div>
                      <div className="text-[10px] text-slate-400">團購主限定 ‧ 原聲</div>
                    </div>
                  </div>
                </div>
                {imageUrl && (
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="p-3 border-b border-slate-100 flex justify-between items-center text-slate-700">
                  <div className="flex items-center space-x-3">
                    <Heart className="w-5 h-5 hover:text-rose-500 cursor-pointer" />
                    <MessageCircle className="w-5 h-5 cursor-pointer" />
                    <Send className="w-5 h-5 cursor-pointer" />
                  </div>
                  <Bookmark className="w-5 h-5 cursor-pointer" />
                </div>
                <div className="p-3 whitespace-pre-wrap text-slate-800 leading-relaxed text-xs">
                  <span className="font-bold mr-1 text-slate-900">{brandName}</span>
                  {body}
                  {hashtags.length > 0 && (
                    <div className="mt-2 text-indigo-600 font-medium">
                      {hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Threads Style */}
            {platform === "threads" && (
              <div className="text-xs sm:text-sm p-4 text-slate-900 font-sans">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded-full bg-black text-white font-bold flex items-center justify-center text-sm shrink-0">
                    @
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{brandName.replace(/\s+/g, "_").toLowerCase()}</span>
                      <span className="text-[10px] text-slate-400">12分鐘</span>
                    </div>
                    <div className="mt-2 text-slate-800 whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                      {body}
                    </div>
                    {imageUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 aspect-4/3">
                        <img src={imageUrl} alt="preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    <div className="mt-3 flex items-center space-x-4 text-slate-700 text-xs">
                      <span className="flex items-center space-x-1 cursor-pointer hover:text-rose-500">
                        <Heart className="w-4 h-4" /> <span>84</span>
                      </span>
                      <span className="flex items-center space-x-1 cursor-pointer hover:text-indigo-600">
                        <MessageCircle className="w-4 h-4" /> <span>29</span>
                      </span>
                      <span className="flex items-center space-x-1 cursor-pointer hover:text-emerald-600">
                        <Repeat2 className="w-4 h-4" /> <span>14</span>
                      </span>
                      <span className="flex items-center space-x-1 cursor-pointer hover:text-blue-600">
                        <Send className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LINE Style */}
            {platform === "line" && (
              <div className="bg-[#8c9cad] p-3 text-xs">
                <div className="text-center text-[10px] text-white/80 mb-2">今天 下午 2:30</div>
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                    L
                  </div>
                  <div className="max-w-[85%]">
                    <div className="text-[11px] text-slate-100 font-semibold mb-0.5">{brandName} (官方社群)</div>
                    <div className="bg-white rounded-2xl rounded-tl-xs p-3 text-slate-900 shadow-sm leading-relaxed whitespace-pre-wrap">
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt="preview"
                          className="w-full h-36 object-cover rounded-lg mb-2"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      {body}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

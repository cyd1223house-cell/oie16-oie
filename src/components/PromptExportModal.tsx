import React, { useState } from "react";
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  FileCode,
  ShieldAlert,
  Send,
} from "lucide-react";

interface PromptExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptContent: string;
  hasReferenceImage: boolean;
  productName: string;
  onApplyPromptToGenerate?: (editedPrompt: string) => void;
}

export const PromptExportModal: React.FC<PromptExportModalProps> = ({
  isOpen,
  onClose,
  promptContent,
  hasReferenceImage,
  productName,
  onApplyPromptToGenerate,
}) => {
  const [copied, setCopied] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState("");
  const [prevPrompt, setPrevPrompt] = useState("");

  if (!isOpen) return null;

  if (promptContent !== prevPrompt) {
    setPrevPrompt(promptContent);
    setEditablePrompt(promptContent);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editablePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenGemini = () => {
    handleCopy();
    window.open("https://gemini.google.com/", "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prompt-modal-title"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h3 id="prompt-modal-title" className="text-base font-bold text-white flex items-center">
                完整 Gemini Prompt 產生結果
                <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/40 text-indigo-200 font-normal">
                  不使用 API 模式
                </span>
              </h3>
              <p className="text-xs text-indigo-200/80">
                以「{productName}」之真實資料為唯一事實來源，防捏造規則已內建。
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
            aria-label="關閉視窗"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image upload notice */}
        {hasReferenceImage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-amber-950">💡 重要圖片提示：</span>
              <span>
                您在此商品設定了商品參考圖。複製此 Prompt 至{" "}
                <strong className="underline decoration-amber-500">Gemini 網頁版 (gemini.google.com)</strong>{" "}
                使用時，<strong>請記得在對話框中另外上傳相同圖片</strong>，Gemini
                將會以該圖作為唯一外觀依據產出商業攝影與影片分鏡！
              </span>
            </div>
          </div>
        )}

        {/* Content Box */}
        <div className="p-6 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 mr-1" />
              Prompt 預覽（可自由編輯微調）：
            </span>
            <span className="font-mono text-[11px]">{editablePrompt.length} 字元</span>
          </div>

          <div className="relative">
            <textarea
              value={editablePrompt}
              onChange={(e) => setEditablePrompt(e.target.value)}
              className="w-full h-80 p-4 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed resize-none shadow-inner"
              placeholder="Prompt 內容載入中..."
            />
          </div>

          <div className="p-3 bg-slate-100/80 rounded-xl text-[11px] text-slate-600 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              已自動注入<strong>「唯一事實來源原則」</strong>與<strong>「嚴格防捏造禁止事項」</strong>，確保文案完全符合團購主設定之真實價格與規格。
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            複製後即可直接貼入任何 AI 聊天室（如 Gemini、Claude、ChatGPT）使用
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "已複製到剪貼簿！" : "複製完整 Prompt"}</span>
            </button>

            <button
              onClick={handleOpenGemini}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>複製並開啟 Gemini 網頁版</span>
            </button>

            {onApplyPromptToGenerate && (
              <button
                onClick={() => {
                  onClose();
                  onApplyPromptToGenerate(editablePrompt);
                }}
                className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white flex items-center space-x-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>改用 API 直接執行</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

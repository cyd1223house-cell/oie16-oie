import React, { useState, useRef } from "react";
import { Upload, X, Link, Check, RefreshCw } from "lucide-react";

interface ImageUploadZoneProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
  className?: string;
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  value,
  onChange,
  label = "商品照片上傳",
  helperText = "支援 JPG, PNG, WebP, GIF (支援拖曳或點擊上傳)",
  aspectRatio = "wide",
  className = "",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState(value && !value.startsWith("data:") ? value : "");
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("請選擇圖片檔案 (JPG, PNG, WebP, GIF 等)");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    }
  };

  const handleClear = () => {
    onChange("");
    setFileName("");
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const ratioClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "video"
      ? "aspect-video"
      : aspectRatio === "wide"
      ? "h-40 sm:h-48"
      : "h-auto min-h-[140px]";

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header with Mode Switch */}
      <div className="flex items-center justify-between">
        <label className="block font-semibold text-slate-700 text-xs sm:text-sm">
          {label}
        </label>
        <div className="flex items-center space-x-1 text-[11px]">
          <button
            type="button"
            onClick={() => setUploadMode("file")}
            className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
              uploadMode === "file"
                ? "bg-indigo-100 text-indigo-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            📁 本地上傳
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => setUploadMode("url")}
            className={`px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
              uploadMode === "url"
                ? "bg-indigo-100 text-indigo-700 font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            🔗 圖片網址
          </button>
        </div>
      </div>

      {/* Upload Zone / Preview Area */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-indigo-200 bg-slate-50 shadow-xs">
          <div className={`w-full ${ratioClass} relative flex items-center justify-center bg-slate-900/5`}>
            <img
              src={value}
              alt="上傳圖片預覽"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Status Overlay Badge */}
            <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-xs">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{value.startsWith("data:") ? "本地圖片已就緒" : "圖片連結已載入"}</span>
            </div>

            {/* Quick Action Overlay on Hover */}
            <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-slate-800 rounded-xl text-xs font-bold shadow-md hover:bg-slate-100 flex items-center space-x-1 cursor-pointer transition active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>更換圖片</span>
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 flex items-center space-x-1 cursor-pointer transition active:scale-95"
              >
                <X className="w-3.5 h-3.5" />
                <span>移除圖片</span>
              </button>
            </div>
          </div>

          {fileName && (
            <div className="px-3 py-1.5 bg-indigo-50/70 border-t border-indigo-100 flex items-center justify-between text-[11px] text-indigo-900">
              <span className="truncate max-w-[200px] font-medium">📄 {fileName}</span>
              <span className="text-emerald-700 font-bold">已就緒</span>
            </div>
          )}
        </div>
      ) : uploadMode === "file" ? (
        <button
          type="button"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/60 scale-[1.01]"
              : "border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/20"
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2.5 shadow-xs">
            <Upload className="w-6 h-6 animate-pulse" />
          </div>
          <p className="font-bold text-slate-800 text-xs sm:text-sm">
            點擊選擇照片 或 拖曳圖檔至此
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>
          <span className="inline-block mt-2.5 px-3 py-1 bg-white border border-slate-200 text-indigo-600 rounded-lg text-xs font-bold shadow-2xs hover:bg-slate-50">
            瀏覽電腦／手機相簿
          </span>
        </button>
      ) : (
        <div className="space-y-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="貼上外部圖片網址 (https://...)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUrlSubmit();
                  }
                }}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer shadow-xs"
            >
              載入
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            可輸入 Unsplash、imgur、電商主圖或雲端圖片直連網址。
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};

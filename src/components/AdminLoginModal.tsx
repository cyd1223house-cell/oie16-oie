import React, { useState } from "react";
import { Lock, ShieldCheck, KeyRound, Sparkles, ArrowRight, UserCheck, AlertCircle } from "lucide-react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (username: string) => void;
  targetTabName?: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  targetTabName = "後台管理中心",
}) => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  if (!isOpen) return null;

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    // Verification check: password is 1234
    if (password === "1234") {
      if (rememberMe) {
        localStorage.setItem("groupbuy_admin_auth", JSON.stringify({
          isAuth: true,
          user: username || "admin",
          timestamp: Date.now(),
        }));
      }
      onLoginSuccess(username || "admin");
    } else {
      setErrorMsg("密碼不正確！預設管理員密碼為：1234");
    }
  };

  const handleQuickFillAndLogin = () => {
    setUsername("admin");
    setPassword("1234");
    setErrorMsg("");
    if (rememberMe) {
      localStorage.setItem("groupbuy_admin_auth", JSON.stringify({
        isAuth: true,
        user: "admin",
        timestamp: Date.now(),
      }));
    }
    onLoginSuccess("admin");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Header Header Gradient */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 p-6 text-white text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-8 h-8 text-indigo-300" />
          </div>
          <h3 className="text-xl font-black tracking-tight">管理員身分驗證</h3>
          <p className="text-xs text-indigo-200 mt-1">
            進入「{targetTabName}」前請先驗證團長管理員權限
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Quick 1-click Preset Fill */}
          <div className="p-3.5 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="font-bold text-indigo-900">預設管理員帳密：</span>
                <span className="font-mono font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded ml-1 border border-indigo-100">
                  admin / 1234
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickFillAndLogin}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center cursor-pointer"
            >
              <span>一鍵帶入登入</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="alm-username" className="block text-xs font-bold text-slate-700 mb-1.5">
                管理員帳號
              </label>
              <div className="relative">
                <input
                  id="alm-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="請輸入帳號 (預設: admin)"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  required
                />
                <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label htmlFor="alm-password" className="block text-xs font-bold text-slate-700 mb-1.5">
                管理員密碼
              </label>
              <div className="relative">
                <input
                  id="alm-password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  placeholder="請輸入密碼 (預設: 1234)"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  required
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>記住此瀏覽器的管理員登入狀態</span>
              </label>
            </div>

            <div className="pt-2 flex gap-3">
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition"
                >
                  取消
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center justify-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>確認登入後台</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  Image,
  MessageSquareText,
  ShieldAlert,
  TrendingUp,
  Settings2,
  Check,
  Play,
  RotateCcw,
  Sliders,
} from "lucide-react";
import { SubAgent } from "../types/groupbuy";

interface MultiAgentHubProps {
  agents: SubAgent[];
  onUpdateAgents: (agents: SubAgent[]) => void;
}

export const MultiAgentHub: React.FC<MultiAgentHubProps> = ({ agents, onUpdateAgents }) => {
  const [selectedAgent, setSelectedAgent] = useState<SubAgent | null>(agents[0] || null);
  const [testInput, setTestInput] = useState("");
  const [testOutput, setTestOutput] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState("");

  const handleToggleAgent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = agents.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    onUpdateAgents(updated);
    if (selectedAgent && selectedAgent.id === id) {
      setSelectedAgent({ ...selectedAgent, enabled: !selectedAgent.enabled });
    }
  };

  const handleUpdateTemperature = (id: string, temp: number) => {
    const updated = agents.map((a) => (a.id === id ? { ...a, temperature: temp } : a));
    onUpdateAgents(updated);
    if (selectedAgent && selectedAgent.id === id) {
      setSelectedAgent({ ...selectedAgent, temperature: temp });
    }
  };

  const handleSavePrompt = () => {
    if (!selectedAgent) return;
    const updated = agents.map((a) =>
      a.id === selectedAgent.id ? { ...a, systemPrompt: editedPrompt } : a
    );
    onUpdateAgents(updated);
    setSelectedAgent({ ...selectedAgent, systemPrompt: editedPrompt });
    setIsEditingPrompt(false);
  };

  const handleTestAgent = async () => {
    if (!selectedAgent || !testInput.trim()) return;
    setIsTesting(true);
    setTestOutput("");

    // Simulate specialized agent thought and generation
    await new Promise((r) => setTimeout(r, 1200));

    let response = "";
    if (selectedAgent.id === "agent-copywriter") {
      response = `【${selectedAgent.name} 回應】：\n針對您提供的「${testInput}」，為您構思了高轉化鉤子標題：\n\n🔥 辦公室下午三點最奢華救贖！濃郁生巧克力遇上 1024 折千層酥皮，喀滋一聲直接撫平一整天的疲憊～\n團購限定現折 $150，滿額享免運！`;
    } else if (selectedAgent.id === "agent-visual") {
      response = `【${selectedAgent.name} 提示詞生成】：\n/imagine prompt: Ultra-realistic commercial macro food photography of ${testInput}, mouthwatering crispy golden texture, cinematic soft daylight, 8k resolution --ar 4:5 --q 2`;
    } else if (selectedAgent.id === "agent-pricing") {
      response = `【${selectedAgent.name} SKU 建議】：\n針對「${testInput}」，建議規劃：\n1. 單盒嚐鮮價 $480\n2. 2盒閨蜜分享組 $899 (省$61)\n3. 4盒辦公室免運狂歡組 $1,680 (省$240，最受歡迎)`;
    } else if (selectedAgent.id === "agent-outreach") {
      response = `【${selectedAgent.name} 社群推播】：\n📢 各位團友～${testInput} 倒數最後 4 小時！已經累積訂購 280 盒，今晚 23:59 準時關單結帳，要補貨的把握最後免運門檻喔！`;
    } else if (selectedAgent.id === "agent-fraud") {
      response = `【${selectedAgent.name} 風控審查】：\n🛡️ 審查「${testInput}」：\n- 無重複手機號碼異常 (PASS)\n- 金額與後五碼格式合規 (PASS)\n- 黑名單攔截庫檢測無命中紀錄 (PASS)`;
    } else {
      response = `【${selectedAgent.name} 庫存回報】：\n目前針對「${testInput}」之成團進度已達標 128%，庫存剩餘 15 件，已觸發低庫存預警標籤！`;
    }

    setTestOutput(response);
    setIsTesting(false);

    // Increment tasks count
    const updated = agents.map((a) =>
      a.id === selectedAgent.id ? { ...a, tasksCompleted: a.tasksCompleted + 1 } : a
    );
    onUpdateAgents(updated);
  };

  const getAgentIcon = (iconName: string) => {
    switch (iconName) {
      case "Sparkles":
        return <Sparkles className="w-5 h-5" />;
      case "Image":
        return <Image className="w-5 h-5" />;
      case "Layers":
        return <Layers className="w-5 h-5" />;
      case "MessageSquareText":
        return <MessageSquareText className="w-5 h-5" />;
      case "ShieldAlert":
        return <ShieldAlert className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-6 bg-purple-600 rounded-full" />
            <h2 className="text-xl font-bold text-slate-900">AI Agent 子代理矩陣管理中心</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            配置、調優與監控各專屬領域的 AI 任務機器人，打造全自動化的團購營運團隊。
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
          <span>
            已啟動：{agents.filter((a) => a.enabled).length} / {agents.length} 位
          </span>
        </div>
      </div>

      {/* Agents Grid + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Agent Cards List */}
        <div className="lg:col-span-5 space-y-3">
          {agents.map((agent) => {
            const isSelected = selectedAgent?.id === agent.id;
            return (
              <div
                key={agent.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedAgent(agent);
                  setIsEditingPrompt(false);
                  setTestOutput("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedAgent(agent);
                    setIsEditingPrompt(false);
                    setTestOutput("");
                  }
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white border-purple-500 shadow-md ring-2 ring-purple-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-xl text-white flex items-center justify-center shadow-xs ${agent.avatarBg}`}
                    >
                      {getAgentIcon(agent.icon)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 text-sm">{agent.name}</h4>
                        {agent.enabled ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1">{agent.role}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleToggleAgent(agent.id, e)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      agent.enabled
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {agent.enabled ? "已啟用" : "已暫停"}
                  </button>
                </div>

                <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                  {agent.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>累計完成任務: {agent.tasksCompleted} 次</span>
                  <span>溫度: {agent.temperature}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Agent Inspector & Playground */}
        <div className="lg:col-span-7">
          {selectedAgent ? (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
              {/* Agent Title Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-xl text-white flex items-center justify-center shadow-md ${selectedAgent.avatarBg}`}
                  >
                    {getAgentIcon(selectedAgent.icon)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                      {selectedAgent.name}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedAgent.role}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setEditedPrompt(selectedAgent.systemPrompt);
                      setIsEditingPrompt(!isEditingPrompt);
                    }}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    <Settings2 className="w-3.5 h-3.5 mr-1" />
                    {isEditingPrompt ? "取消編輯" : "調校 Prompt"}
                  </button>
                </div>
              </div>

              {/* Temperature & Parameters */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center">
                    <Sliders className="w-3.5 h-3.5 mr-1 text-purple-600" />
                    創意發散度 (Temperature): {selectedAgent.temperature}
                  </span>
                  <span className="text-slate-400">
                    {selectedAgent.temperature < 0.4
                      ? "嚴格嚴謹"
                      : selectedAgent.temperature > 0.6
                      ? "極具創意"
                      : "均衡平衡"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={selectedAgent.temperature}
                  onChange={(e) =>
                    handleUpdateTemperature(selectedAgent.id, parseFloat(e.target.value))
                  }
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Prompt Editor or Viewer */}
              {isEditingPrompt ? (
                <div className="space-y-2">
                  <label htmlFor="agent-prompt-edit" className="block text-xs font-bold text-slate-700">
                    編輯 System Prompt 核心提示詞：
                  </label>
                  <textarea
                    id="agent-prompt-edit"
                    rows={4}
                    value={editedPrompt}
                    onChange={(e) => setEditedPrompt(e.target.value)}
                    className="w-full text-xs font-mono p-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 leading-relaxed"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setIsEditingPrompt(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSavePrompt}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> 儲存 Prompt
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 text-xs">
                  <div className="font-bold text-purple-900 mb-1">【系統提示詞 System Instruction】：</div>
                  <p className="text-slate-700 leading-relaxed font-sans">
                    {selectedAgent.systemPrompt}
                  </p>
                </div>
              )}

              {/* Instant Interactive Test Dialogue */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 text-purple-600" />
                  即時測試此 Agent
                </h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder={`輸入測試文字（例如：${
                      selectedAgent.id === "agent-copywriter"
                        ? "法式生巧克力夾心千層酥"
                        : selectedAgent.id === "agent-pricing"
                        ? "日本 A5 和牛雪花片"
                        : "這批檸檬塔訂購異常"
                    }）...`}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  />
                  <button
                    onClick={handleTestAgent}
                    disabled={isTesting || !testInput.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center shrink-0 disabled:opacity-50"
                  >
                    {isTesting ? (
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 mr-1 fill-white" />
                    )}
                    <span>{isTesting ? "思考中..." : "執行測試"}</span>
                  </button>
                </div>

                {testOutput && (
                  <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed whitespace-pre-wrap animate-in fade-in">
                    {testOutput}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
              請從左側點選一位 Sub-Agent 查看詳細設定
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

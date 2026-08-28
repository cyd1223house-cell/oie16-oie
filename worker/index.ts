/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";
import systemPrompt from "../prompt/SYSTEM_PROMPT.md?raw";
import outputDefinition from "../prompt/output_schema.json";

interface Env {
  ASSETS: Fetcher;
  GEMINI_API_KEY?: string;
  AUTH_USERNAME?: string;
  AUTH_PASSWORD?: string;
  AUTH_SECRET?: string;
  DB: D1Database;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

const encoder = new TextEncoder();

function parseCookies(request: Request) {
  return Object.fromEntries((request.headers.get("cookie") || "").split(";").map((part) => part.trim().split("=")).filter(([key]) => key));
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function isAuthenticated(request: Request, env: Env) {
  const authUsername = env.AUTH_USERNAME || process.env.AUTH_USERNAME;
  const authPassword = env.AUTH_PASSWORD || process.env.AUTH_PASSWORD;
  const authSecret = env.AUTH_SECRET || process.env.AUTH_SECRET;
  // If credentials are not configured, allow access in development preview
  if (!authUsername || !authPassword || !authSecret) return true;
  const token = parseCookies(request).groupbuy_session;
  if (!token) return false;
  const [username, expiresText, signature] = token.split(".");
  const expires = Number(expiresText);
  if (username !== authUsername || !Number.isFinite(expires) || expires < Date.now() || !signature) return false;
  const expected = await hmac(`${username}.${expiresText}`, authSecret);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

function loginPage(error = false) {
  return new Response(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>登入｜團購文案產生器</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#fff8ef,#f8eee2);font-family:system-ui,-apple-system,"Noto Sans TC",sans-serif;color:#35281f}.card{width:min(92vw,420px);background:#fff;padding:36px;border:1px solid #ead9c8;border-radius:24px;box-shadow:0 20px 60px #6e4e2d20}.tag{font-size:12px;letter-spacing:.14em;color:#9c6334;font-weight:800}h1{margin:10px 0 8px;font-size:28px}p{margin:0 0 26px;color:#76685c}label{display:block;font-weight:700;margin:16px 0 7px}input{width:100%;padding:13px 14px;border:1px solid #d9c9ba;border-radius:12px;font-size:16px}input:focus{outline:3px solid #d9894430;border-color:#bd6d2d}button{width:100%;margin-top:24px;padding:14px;border:0;border-radius:12px;background:#9d4d1f;color:#fff;font-size:16px;font-weight:800;cursor:pointer}.error{padding:10px 12px;border-radius:10px;background:#fff0ed;color:#ae3329;margin-bottom:14px}</style></head><body><main class="card"><div class="tag">GROUPBUY STUDIO</div><h1>團購文案產生器</h1><p>請先登入後繼續使用。</p>${error ? '<div class="error" role="alert">帳號或密碼錯誤，請再試一次。</div>' : ''}<form method="post" action="/auth/login"><label for="username">帳號</label><input id="username" name="username" autocomplete="username" required autofocus><label for="password">密碼</label><input id="password" name="password" type="password" autocomplete="current-password" required><button type="submit">登入</button></form></main></body></html>`, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

type ReferenceImage = { mime_type?: string; data?: string };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

interface CampaignInput {
  product?: {
    name?: string;
    description?: string;
    selling_points?: string[];
    [key: string]: unknown;
  };
  audience?: {
    target_audience?: string[];
    [key: string]: unknown;
  };
  campaign?: {
    group_price?: number;
    end_at?: string;
    purchase_url?: string;
    [key: string]: unknown;
  };
  content?: {
    platforms?: string[];
    [key: string]: unknown;
  };
  media?: {
    reference_images_provided?: boolean;
    reference_image_count?: number;
    [key: string]: unknown;
  };
  reference_images?: ReferenceImage[];
  [key: string]: unknown;
}

interface GeminiCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: {
    message?: string;
  };
}

function validateInput(input: CampaignInput | null | undefined) {
  const errors: string[] = [];
  if (!input?.product?.name?.trim()) errors.push("請填寫商品名稱");
  if (!input?.product?.description?.trim()) errors.push("請填寫商品介紹");
  if (!input?.product?.selling_points?.length) errors.push("請至少填寫一項主要賣點");
  if (!input?.audience?.target_audience?.length) errors.push("請填寫目標客群");
  if (!Number.isFinite(input?.campaign?.group_price)) errors.push("請填寫團購價");
  if (!input?.campaign?.end_at) errors.push("請填寫結團時間");
  if (!input?.campaign?.purchase_url) errors.push("請填寫下單連結或方式");
  if (!input?.content?.platforms?.length) errors.push("請至少選擇一個發布平台");
  return errors;
}

async function generateCampaign(request: Request, env: Env) {
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return json({ error: "公開網站尚未完成 Gemini 金鑰設定" }, 503);
  const input = (await request.json()) as CampaignInput;
  const errors = validateInput(input);
  if (errors.length) return json({ error: "資料尚未完整", details: errors }, 400);

  const { reference_images: references = [], ...promptInput } = input;
  const safeReferences = (references as ReferenceImage[]).slice(0, 3).map((image) => {
    if (!/^image\/(jpeg|png|webp)$/.test(image?.mime_type || "") || typeof image?.data !== "string") throw new Error("商品參考圖片格式不支援");
    if (image.data.length > 7_000_000) throw new Error("單張商品參考圖片不可超過 5MB");
    return { inlineData: { mimeType: image.mime_type, data: image.data } };
  });
  if (!promptInput.media) promptInput.media = {};
  promptInput.media.reference_images_provided = safeReferences.length > 0;
  promptInput.media.reference_image_count = safeReferences.length;
  const referenceInstruction = safeReferences.length
    ? `使用者提供了 ${safeReferences.length} 張商品參考圖。請實際觀察附圖，圖片與影片提示詞都採用有參考圖模式，並共享同一套視覺風格錨點。`
    : "使用者未提供商品參考圖。圖片與影片提示詞採用無參考圖模式，不得聲稱已附圖，並共享同一套視覺風格錨點。";

  const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: `${referenceInstruction}\n請依規則處理以下資料：\n<INPUT_JSON>${JSON.stringify(promptInput)}</INPUT_JSON>` }, ...safeReferences] }],
      generationConfig: { responseMimeType: "application/json", responseJsonSchema: outputDefinition.schema },
    }),
  });
  const payload = (await upstream.json()) as GeminiResponse;
  if (!upstream.ok) return json({ error: payload?.error?.message || "Gemini API 呼叫失敗" }, upstream.status);
  const outputText = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("");
  if (!outputText) return json({ error: "Gemini 沒有回傳文案內容" }, 502);
  return json({ mode: "live", result: JSON.parse(outputText) });
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/auth/login" && request.method === "POST") {
      const form = await request.formData();
      const username = String(form.get("username") || "");
      const password = String(form.get("password") || "");
      const authUsername = env.AUTH_USERNAME || process.env.AUTH_USERNAME;
      const authPassword = env.AUTH_PASSWORD || process.env.AUTH_PASSWORD;
      const authSecret = env.AUTH_SECRET || process.env.AUTH_SECRET || "default_dev_secret_key";
      if (!authUsername || !authPassword || username !== authUsername || password !== authPassword) {
        return loginPage(true);
      }
      const expires = Date.now() + 8 * 60 * 60 * 1000;
      const value = `${username}.${expires}`;
      const signature = await hmac(value, authSecret);
      return new Response(null, { status: 303, headers: { location: "/", "set-cookie": `groupbuy_session=${value}.${signature}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`, "cache-control": "no-store" } });
    }
    if (url.pathname === "/auth/logout") {
      return new Response(null, { status: 303, headers: { location: "/", "set-cookie": "groupbuy_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" } });
    }

    const authenticated = await isAuthenticated(request, env);
    if (!authenticated) {
      if (url.pathname.startsWith("/api/")) return json({ error: "請先登入" }, 401);
      return loginPage(false);
    }

    if (url.pathname === "/api/status" && request.method === "GET") {
      const hasKey = Boolean(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY);
      return json({ mode: hasKey ? "live" : "demo", provider: "gemini", model: "gemini-2.5-flash", media_mode: "prompt_only" });
    }
    if (url.pathname === "/api/generate" && request.method === "POST") {
      try { return await generateCampaign(request, env); }
      catch (error) { return json({ error: error instanceof Error ? error.message : "系統發生錯誤" }, 500); }
    }
    if ((url.pathname === "/api/media/image" || url.pathname === "/api/media/video") && request.method === "POST") {
      return json({ error: "此網站只產出媒體 Prompt，不會直接呼叫付費圖片或影片 API。" }, 410);
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;

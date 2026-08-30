import { generateBespokeMarketingPack } from "@/src/utils/aiMarketingEngine";
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

let systemPromptText = "";
try {
  const promptPath = path.join(process.cwd(), "prompt", "SYSTEM_PROMPT.md");
  if (fs.existsSync(promptPath)) {
    systemPromptText = fs.readFileSync(promptPath, "utf-8");
  }
} catch {
  // fallback if file system access fails in some edge runtimes
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const product = body.product || {};
    const campaign = body.campaign || {};
    const audience = body.audience?.target_audience || body.audience || "上班族、家庭團購、追求生活品質者";
    const audienceStr = Array.isArray(audience) ? audience.join("、") : String(audience);

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if live Gemini API is configured
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const promptInput = {
          product: {
            name: product.name || "熱銷團購選物",
            brand: product.brand || "日光選物",
            category: product.category || "美食點心",
            description: product.description || "",
            selling_points: Array.isArray(product.selling_points) ? product.selling_points : [],
            specs: Array.isArray(product.specs) ? product.specs : [],
          },
          audience: {
            target_audience: [audienceStr],
          },
          campaign: {
            original_price: Number(campaign.original_price) || 500,
            group_price: Number(campaign.group_price) || 399,
            start_at: campaign.start_at || new Date().toISOString().split("T")[0],
            end_at: campaign.end_at || "活動截止日",
            purchase_url: campaign.purchase_url || "https://store.example.com",
          },
          style_angle: body.styleAngle || "auto",
        };

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${systemPromptText ? systemPromptText + "\n\n" : ""}請依據以下使用者輸入的唯一事實來源資料，量身產出繁體中文團購開團文案與行銷素材：\n<INPUT_JSON>${JSON.stringify(
                    promptInput
                  )}</INPUT_JSON>`,
                },
              ],
            },
          ],
        });

        const geminiText = response.text || "";
        if (geminiText) {
          // If response contains json or text, we also generate the standard structure for UI compatibility
          const generated = generateBespokeMarketingPack({
            name: product.name || "熱銷團購選物",
            brand: product.brand || "日光選物",
            category: product.category || "美食點心",
            description: product.description || "",
            sellingPoints: Array.isArray(product.selling_points) ? product.selling_points : [],
            specs: Array.isArray(product.specs) ? product.specs : [],
            originalPrice: Number(campaign.original_price) || 500,
            groupPrice: Number(campaign.group_price) || 399,
            audience: audienceStr,
            startDate: campaign.start_at,
            endDate: campaign.end_at,
            purchaseUrl: campaign.purchase_url,
            platforms: body.platforms,
            includeImagePrompt: body.includeImagePrompt !== false,
            includeVideoPrompt: body.includeVideoPrompt !== false,
            hasReferenceImage: Boolean(body.hasReferenceImage),
            styleAngle: body.styleAngle || "auto",
          });

          return Response.json({
            success: true,
            mode: "gemini-live",
            geminiRaw: geminiText,
            result: generated,
          });
        }
      } catch (geminiErr: unknown) {
        const errorMsg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
        console.warn("Gemini API call failed, falling back to local bespoke engine:", errorMsg);
      }
    }

    // Local bespoke engine fallback (guaranteed reliable execution)
    const generated = generateBespokeMarketingPack({
      name: product.name || "熱銷團購選物",
      brand: product.brand || "日光選物",
      category: product.category || "美食點心",
      description: product.description || "",
      sellingPoints: Array.isArray(product.selling_points) ? product.selling_points : [],
      specs: Array.isArray(product.specs) ? product.specs : [],
      originalPrice: Number(campaign.original_price) || 500,
      groupPrice: Number(campaign.group_price) || 399,
      audience: audienceStr,
      startDate: campaign.start_at,
      endDate: campaign.end_at,
      purchaseUrl: campaign.purchase_url,
      platforms: body.platforms,
      includeImagePrompt: body.includeImagePrompt !== false,
      includeVideoPrompt: body.includeVideoPrompt !== false,
      hasReferenceImage: Boolean(body.hasReferenceImage),
      styleAngle: body.styleAngle || "auto",
    });

    return Response.json({
      success: true,
      mode: "bespoke-local",
      result: generated,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to generate marketing pack";
    return Response.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}


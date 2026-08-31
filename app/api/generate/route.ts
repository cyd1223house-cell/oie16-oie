import { generateBespokeMarketingPack, detectCategoryAndRoute, sanitizeCopy } from "@/src/utils/aiMarketingEngine";
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

    const productName = product.name || "熱銷團購選物";
    const brandName = product.brand || "日光選物";
    const categoryName = product.category || "熱銷選物";
    const description = product.description || "";
    const sellingPoints = Array.isArray(product.selling_points) ? product.selling_points : [];
    const specs = Array.isArray(product.specs) ? product.specs : [];
    const originalPrice = Number(campaign.original_price) || 500;
    const groupPrice = Number(campaign.group_price) || 399;
    const startDate = campaign.start_at || new Date().toISOString().split("T")[0];
    const endDate = campaign.end_at || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
    const purchaseUrl = campaign.purchase_url || "https://store.example.com/groupbuy";
    const freeShippingThreshold = Number(campaign.free_shipping_threshold) || 1500;

    // 第一階段：品類自動偵測與屬性路由
    const categoryRouting = detectCategoryAndRoute(productName, categoryName, description, sellingPoints);

    const apiKey = process.env.GEMINI_API_KEY;

    // Check if live Gemini API is configured
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const promptInput = {
          stage1_routing: categoryRouting,
          product: {
            name: productName,
            brand: brandName,
            category: categoryName,
            detected_category: categoryRouting.detectedCategory,
            allowed_keywords: categoryRouting.allowedKeywords,
            forbidden_keywords: categoryRouting.forbiddenKeywords,
            description,
            selling_points: sellingPoints,
            specs,
          },
          audience: {
            target_audience: [audienceStr],
          },
          campaign: {
            original_price: originalPrice,
            group_price: groupPrice,
            savings_amount: Math.max(0, originalPrice - groupPrice),
            free_shipping_threshold: freeShippingThreshold,
            start_at: startDate,
            end_at: endDate,
            purchase_url: purchaseUrl,
          },
          style_angle: body.styleAngle || "auto",
          custom_environment_style: body.customEnvironmentText || "",
        };

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `${systemPromptText ? systemPromptText + "\n\n" : ""}請嚴格依據規格書之【兩階段處理機制】，根據以下品類判定與事實資料產出繁體中文多模態團購行銷素材包：\n<INPUT_JSON>${JSON.stringify(
                    promptInput
                  )}</INPUT_JSON>`,
                },
              ],
            },
          ],
        });

        const geminiText = response.text || "";
        if (geminiText) {
          const generated = generateBespokeMarketingPack({
            name: productName,
            brand: brandName,
            category: categoryName,
            description,
            sellingPoints,
            specs,
            originalPrice,
            groupPrice,
            audience: audienceStr,
            startDate,
            endDate,
            purchaseUrl,
            platforms: body.platforms,
            includeImagePrompt: body.includeImagePrompt !== false,
            includeVideoPrompt: body.includeVideoPrompt !== false,
            hasReferenceImage: Boolean(body.hasReferenceImage),
            freeShippingThreshold,
            styleAngle: body.styleAngle || "auto",
            customEnvironmentText: body.customEnvironmentText,
          });

          // Try parsing custom JSON from Gemini if returned cleanly
          try {
            const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed.catchyHeadline) generated.catchyHeadline = parsed.catchyHeadline;
              if (parsed.facebookPost) {
                generated.facebookPost.body = sanitizeCopy(
                  typeof parsed.facebookPost === "string" ? parsed.facebookPost : parsed.facebookPost.body || generated.facebookPost.body,
                  categoryRouting.forbiddenKeywords
                );
              }
              if (parsed.lineMessage) {
                generated.lineMessage.body = sanitizeCopy(
                  typeof parsed.lineMessage === "string" ? parsed.lineMessage : parsed.lineMessage.body || generated.lineMessage.body,
                  categoryRouting.forbiddenKeywords
                );
              }
              if (parsed.igCaption) {
                generated.instagramPost.body = sanitizeCopy(
                  typeof parsed.igCaption === "string" ? parsed.igCaption : parsed.igCaption.body || generated.instagramPost.body,
                  categoryRouting.forbiddenKeywords
                );
              }
              if (parsed.threadsPost) {
                generated.threadsPost.body = sanitizeCopy(
                  typeof parsed.threadsPost === "string" ? parsed.threadsPost : parsed.threadsPost.body || generated.threadsPost.body,
                  categoryRouting.forbiddenKeywords
                );
              }
              if (parsed.edmCopy) {
                if (typeof parsed.edmCopy === "object" && parsed.edmCopy.body) {
                  generated.edmCopy.body = sanitizeCopy(parsed.edmCopy.body, categoryRouting.forbiddenKeywords);
                  if (parsed.edmCopy.subject) generated.edmCopy.subject = parsed.edmCopy.subject;
                }
              }
              if (parsed.urgencyReminder) {
                generated.urgencyReminder = sanitizeCopy(parsed.urgencyReminder, categoryRouting.forbiddenKeywords);
              }
              if (parsed.countdownClosing) {
                generated.countdownClosing = sanitizeCopy(parsed.countdownClosing, categoryRouting.forbiddenKeywords);
              }
              if (Array.isArray(parsed.faq)) {
                generated.faq = parsed.faq;
              }
              if (parsed.midjourneyPrompt1) {
                generated.visualDirector.midjourneyPrompt = parsed.midjourneyPrompt1;
              }
              if (parsed.midjourneyPrompt2) {
                generated.visualDirector.midjourneyPrompt2 = parsed.midjourneyPrompt2;
              }
              if (parsed.posterPrompt) {
                generated.visualDirector.posterPrompt = parsed.posterPrompt;
              }
            }
          } catch {
            // fallback to pure bespoke generation
          }

          return Response.json({
            success: true,
            mode: "gemini-live",
            categoryRouting,
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
      name: productName,
      brand: brandName,
      category: categoryName,
      description,
      sellingPoints,
      specs,
      originalPrice,
      groupPrice,
      audience: audienceStr,
      startDate,
      endDate,
      purchaseUrl,
      platforms: body.platforms,
      includeImagePrompt: body.includeImagePrompt !== false,
      includeVideoPrompt: body.includeVideoPrompt !== false,
      hasReferenceImage: Boolean(body.hasReferenceImage),
      freeShippingThreshold,
      styleAngle: body.styleAngle || "auto",
      customEnvironmentText: body.customEnvironmentText,
    });

    return Response.json({
      success: true,
      mode: "bespoke-local",
      categoryRouting,
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

import Anthropic from "@anthropic-ai/sdk";
import { FormField, Lead, LeadAnswer, Tenant } from "@prisma/client";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ScoreResult {
  score: number;
  tier: "HIGH" | "MEDIUM" | "LOW";
  rationale: string;
  emailPersonalizationNotes: string;
  rawResponse: string;
}

function buildPrompt(
  tenant: Tenant,
  fields: FormField[],
  answers: LeadAnswer[]
): string {
  const fieldMeta = fields
    .sort((a, b) => a.order - b.order)
    .map(
      (f) =>
        `- ${f.label} [weight: ${f.scoringWeight}]${f.scoringHint ? `: ${f.scoringHint}` : ""}`
    )
    .join("\n");

  const answerLines = answers
    .map((a) => {
      const field = fields.find((f) => f.key === a.fieldKey);
      const weight = field?.scoringWeight ?? 1;
      return `${a.fieldLabel} (weight: ${weight}): ${a.value}`;
    })
    .join("\n");

  return `TENANT SCORING CRITERIA:
${tenant.scoringCriteria || "Score leads based on business size, urgency, and specificity of their needs."}

FIELD WEIGHTS AND HINTS:
${fieldMeta}

LEAD SUBMISSION:
${answerLines}

SCORING RULES:
- Score 1–100. HIGH >= ${tenant.highTierThreshold}. MEDIUM >= ${tenant.mediumTierThreshold}. LOW = below ${tenant.mediumTierThreshold}.
- Weight fields with higher scoringWeight more heavily in your reasoning.
- Keep rationale under 200 characters.
- emailPersonalizationNotes should highlight 2–3 specific things from the lead's answers to use in a personalised email.

Return ONLY this JSON with no markdown fences, no explanation:
{"score":<int>,"tier":"<HIGH|MEDIUM|LOW>","rationale":"<string>","emailPersonalizationNotes":"<string>"}`;
}

export async function scoreLead(
  tenant: Tenant,
  lead: Lead,
  fields: FormField[],
  answers: LeadAnswer[]
): Promise<ScoreResult> {
  const prompt = buildPrompt(tenant, fields, answers);

  async function attempt(retryPrompt?: string): Promise<ScoreResult> {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: retryPrompt ?? prompt,
        },
      ],
      system:
        "You are a lead scoring assistant. You return only valid JSON, nothing else.",
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";

    try {
      const parsed = JSON.parse(raw.trim());
      return {
        score: Number(parsed.score),
        tier: parsed.tier as "HIGH" | "MEDIUM" | "LOW",
        rationale: String(parsed.rationale ?? ""),
        emailPersonalizationNotes: String(
          parsed.emailPersonalizationNotes ?? ""
        ),
        rawResponse: raw,
      };
    } catch {
      throw new Error(`JSON parse failed: ${raw}`);
    }
  }

  try {
    return await attempt();
  } catch {
    // Retry with a stricter prompt
    const strictPrompt = `${prompt}\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY the JSON object, starting with { and ending with }. Absolutely nothing else.`;
    return await attempt(strictPrompt);
  }
}

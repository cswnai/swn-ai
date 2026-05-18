import Anthropic from "@anthropic-ai/sdk";
import { LeadAnswer, Tenant } from "@prisma/client";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface EmailDraftResult {
  subject: string;
  bodyHtml: string;
  bodyText: string;
  rawResponse: string;
}

export async function draftFirstTouchEmail(
  tenant: Tenant,
  answers: LeadAnswer[],
  tier: string,
  scoreRationale: string,
  emailPersonalizationNotes: string
): Promise<EmailDraftResult> {
  const answerLines = answers
    .map((a) => `${a.fieldLabel}: ${a.value}`)
    .join("\n");

  const prompt = `You are writing a first-touch sales email on behalf of ${tenant.name}.

LEAD DETAILS:
${answerLines}

LEAD TIER: ${tier}
SCORING RATIONALE: ${scoreRationale}
PERSONALISATION NOTES: ${emailPersonalizationNotes}

INSTRUCTIONS:
- Write a warm, concise, non-pushy first-touch email (under 200 words for the body)
- Address the lead by their first name only (extract from the "Full Name" or "name" field)
- Reference something specific from their submission to show you read it
- For HIGH tier: be enthusiastic, offer immediate value, propose a specific next step (e.g. a call)
- For MEDIUM tier: be friendly, curious, invite them to learn more
- For LOW tier: be helpful and educational, no pressure
- Sign off as the team at ${tenant.name}
- The bodyHtml should be simple HTML: <p> tags only, no inline styles
- The bodyText should be plain text equivalent

Return ONLY this JSON with no markdown fences:
{"subject":"<string>","bodyHtml":"<string>","bodyText":"<string>"}`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
    system:
      "You are an expert sales email writer. You return only valid JSON, nothing else.",
  });

  const raw =
    message.content[0].type === "text" ? message.content[0].text : "";

  const parsed = JSON.parse(raw.trim());

  return {
    subject: String(parsed.subject),
    bodyHtml: String(parsed.bodyHtml),
    bodyText: String(parsed.bodyText),
    rawResponse: raw,
  };
}

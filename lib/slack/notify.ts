import { Lead, LeadAnswer, Tenant } from "@prisma/client";

export async function notifySlack(
  tenant: Tenant,
  lead: Lead & { answers: LeadAnswer[] }
): Promise<void> {
  if (!tenant.slackWebhookUrl) return;

  const getName = (key: string) =>
    lead.answers.find((a) => a.fieldKey === key)?.value ?? "—";

  const name = getName("name");
  const business = getName("business");
  const email = getName("email");

  const topAnswers = lead.answers
    .filter((a) => !["name", "email", "phone"].includes(a.fieldKey))
    .slice(0, 4)
    .map((a) => `*${a.fieldLabel}:* ${a.value}`)
    .join("\n");

  const tierEmoji =
    lead.tier === "HIGH" ? "🔥" : lead.tier === "MEDIUM" ? "⚡" : "💧";

  const baseUrl = process.env.NEXTAUTH_URL ?? "https://swn-ai.com";

  const body = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${tierEmoji} New ${lead.tier} Lead — Score: ${lead.score}/100`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Name:*\n${name}` },
          { type: "mrkdwn", text: `*Business:*\n${business}` },
          { type: "mrkdwn", text: `*Email:*\n${email}` },
          {
            type: "mrkdwn",
            text: `*Rationale:*\n${lead.scoreRationale ?? "—"}`,
          },
        ],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: topAnswers },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "View in Admin" },
            url: `${baseUrl}/admin/leads/${lead.id}`,
            style: "primary",
          },
        ],
      },
    ],
  };

  await fetch(tenant.slackWebhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

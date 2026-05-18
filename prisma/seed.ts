import { PrismaClient, FieldType, AutoSendConfig } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "swn-demo" },
    update: {},
    create: {
      name: "SWN AI Demo",
      slug: "swn-demo",
      fromEmail: "leads@swn-ai.com",
      highTierThreshold: 75,
      mediumTierThreshold: 40,
      highAutoSend: AutoSendConfig.APPROVAL_REQUIRED,
      mediumAutoSend: AutoSendConfig.APPROVAL_REQUIRED,
      lowAutoSend: AutoSendConfig.NEVER,
      scoringCriteria:
        "Prioritize B2B businesses over sole traders. Score higher for businesses with larger teams (10+ employees). " +
        "AI automation and web development needs are high value. Urgency signals (launching soon, current pain points) increase the score. " +
        "Vague or very short messages indicate lower intent. Service-based businesses and e-commerce are ideal.",
    },
  });

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@swn-ai.com" },
    update: {},
    create: {
      tenantId: tenant.id,
      email: "admin@swn-ai.com",
      name: "SWN Admin",
      hashedPassword,
      role: "admin",
    },
  });

  const existing = await prisma.formConfig.findUnique({
    where: { tenantId: tenant.id },
  });

  if (!existing) {
    const formConfig = await prisma.formConfig.create({
      data: {
        tenantId: tenant.id,
        title: "Get Your Free AI Audit",
        description:
          "Tell us about your business and we'll show you exactly where AI can save you time and win you more clients.",
        submitButtonLabel: "Get My Free Audit",
        thankYouMessage:
          "Thanks! We'll review your details and be in touch within 24 hours.",
      },
    });

    const fields = [
      {
        label: "Full Name",
        key: "name",
        type: FieldType.TEXT,
        placeholder: "John Smith",
        isRequired: true,
        order: 1,
        scoringWeight: 0.5,
        scoringHint: "Not scored; used for personalisation only.",
      },
      {
        label: "Business Name",
        key: "business",
        type: FieldType.TEXT,
        placeholder: "Acme Ltd",
        isRequired: true,
        order: 2,
        scoringWeight: 0.5,
        scoringHint: "Not scored directly.",
      },
      {
        label: "Email Address",
        key: "email",
        type: FieldType.EMAIL,
        placeholder: "john@acme.com",
        isRequired: true,
        order: 3,
        scoringWeight: 0.5,
        scoringHint: "Required for contact; not scored.",
      },
      {
        label: "Phone Number",
        key: "phone",
        type: FieldType.PHONE,
        placeholder: "+44 7700 900000",
        isRequired: false,
        order: 4,
        scoringWeight: 1.5,
        scoringHint: "Providing a phone number indicates higher intent.",
      },
      {
        label: "What industry are you in?",
        key: "industry",
        type: FieldType.SELECT,
        isRequired: true,
        order: 5,
        scoringWeight: 2.0,
        scoringHint:
          "E-commerce, SaaS, professional services, and healthcare score highest.",
        options: [
          { label: "E-commerce / Retail", value: "ecommerce" },
          { label: "Professional Services", value: "professional_services" },
          { label: "SaaS / Tech", value: "saas" },
          { label: "Healthcare", value: "healthcare" },
          { label: "Hospitality / Food & Drink", value: "hospitality" },
          { label: "Construction / Trades", value: "construction" },
          { label: "Other", value: "other" },
        ],
      },
      {
        label: "How many people are in your team?",
        key: "team_size",
        type: FieldType.SELECT,
        isRequired: true,
        order: 6,
        scoringWeight: 3.0,
        scoringHint:
          "Larger teams (10+) have higher budgets and more complex workflows. Score these highest.",
        options: [
          { label: "Just me", value: "solo" },
          { label: "2–5", value: "2_5" },
          { label: "6–15", value: "6_15" },
          { label: "16–50", value: "16_50" },
          { label: "50+", value: "50_plus" },
        ],
      },
      {
        label: "What's your biggest challenge right now?",
        key: "challenge",
        type: FieldType.TEXTAREA,
        placeholder:
          "e.g. We spend too much time on manual follow-ups and our website isn't converting...",
        isRequired: true,
        order: 7,
        scoringWeight: 4.0,
        scoringHint:
          "This is the most important field. Specific pain points, mentions of lost revenue, or clear urgency should score very high. Vague answers score low.",
      },
      {
        label: "What's your monthly revenue (approx)?",
        key: "monthly_revenue",
        type: FieldType.SELECT,
        isRequired: false,
        order: 8,
        scoringWeight: 3.5,
        scoringHint:
          "Higher revenue bands indicate larger budgets. £10k+ monthly is a strong signal.",
        options: [
          { label: "Pre-revenue / just starting", value: "pre_revenue" },
          { label: "Under £5k/month", value: "under_5k" },
          { label: "£5k–£10k/month", value: "5k_10k" },
          { label: "£10k–£50k/month", value: "10k_50k" },
          { label: "£50k+/month", value: "50k_plus" },
          { label: "Prefer not to say", value: "prefer_not" },
        ],
      },
      {
        label: "How soon are you looking to get started?",
        key: "timeline",
        type: FieldType.SELECT,
        isRequired: true,
        order: 9,
        scoringWeight: 2.5,
        scoringHint:
          "Immediate or within 1 month indicates urgency — score these highest.",
        options: [
          { label: "Immediately", value: "immediately" },
          { label: "Within 1 month", value: "1_month" },
          { label: "1–3 months", value: "1_3_months" },
          { label: "3–6 months", value: "3_6_months" },
          { label: "Just researching", value: "researching" },
        ],
      },
    ];

    for (const field of fields) {
      await prisma.formField.create({
        data: { ...field, formConfigId: formConfig.id },
      });
    }
  }

  const sequence = await prisma.nurtureSequence.findFirst({
    where: { tenantId: tenant.id },
  });

  if (!sequence) {
    const seq = await prisma.nurtureSequence.create({
      data: {
        tenantId: tenant.id,
        name: "Default Low-Tier Nurture",
        isActive: true,
      },
    });

    const steps = [
      {
        stepNumber: 1,
        delayDays: 3,
        subjectTemplate: "{{name}}, a quick thought on {{business}}",
        bodyHtmlTemplate: `<p>Hi {{name}},</p>
<p>I wanted to follow up on your enquiry from a few days ago. I've had a quick look at what you shared about {{business}} and I think there are some quick wins we could explore together.</p>
<p>Would you be open to a 15-minute call this week? No pitch — just a conversation about where AI could genuinely save you time.</p>
<p>You can book a slot here: [CALENDAR_LINK]</p>
<p>Best,<br>Conor<br>SWN AI</p>`,
        bodyTextTemplate: `Hi {{name}},

I wanted to follow up on your enquiry from a few days ago. I've had a quick look at what you shared about {{business}} and I think there are some quick wins we could explore together.

Would you be open to a 15-minute call this week? No pitch — just a conversation about where AI could genuinely save you time.

Best,
Conor
SWN AI`,
      },
      {
        stepNumber: 2,
        delayDays: 10,
        subjectTemplate: "A case study you might find useful, {{name}}",
        bodyHtmlTemplate: `<p>Hi {{name}},</p>
<p>I know you're probably busy, so I'll keep this short.</p>
<p>We recently helped a business similar to {{business}} save 12 hours a week by automating their lead follow-up. They went from manually chasing enquiries to having every new lead scored, emailed, and booked into a call — all automatically.</p>
<p>If that sounds relevant, I'd love to show you how it works. Just reply to this email or grab a slot: [CALENDAR_LINK]</p>
<p>Best,<br>Conor<br>SWN AI</p>`,
        bodyTextTemplate: `Hi {{name}},

I know you're probably busy, so I'll keep this short.

We recently helped a business similar to {{business}} save 12 hours a week by automating their lead follow-up.

If that sounds relevant, I'd love to show you how it works. Just reply or grab a slot: [CALENDAR_LINK]

Best,
Conor
SWN AI`,
      },
      {
        stepNumber: 3,
        delayDays: 21,
        subjectTemplate: "Last one from me, {{name}}",
        bodyHtmlTemplate: `<p>Hi {{name}},</p>
<p>I've reached out a couple of times now and I completely understand if the timing isn't right.</p>
<p>I'll leave the door open — whenever you're ready to explore what AI could do for {{business}}, just drop me a message and we'll pick it up from there.</p>
<p>All the best,<br>Conor<br>SWN AI</p>`,
        bodyTextTemplate: `Hi {{name}},

I've reached out a couple of times now and I completely understand if the timing isn't right.

Whenever you're ready, just drop me a message and we'll pick it up from there.

All the best,
Conor
SWN AI`,
      },
    ];

    for (const step of steps) {
      await prisma.nurtureStep.create({
        data: { ...step, sequenceId: seq.id },
      });
    }
  }

  console.log("Seed complete. Demo credentials: admin@swn-ai.com / admin123");
  console.log("Demo form URL: /form/swn-demo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ConfigEditor } from "@/components/admin/ConfigEditor";

export default async function ConfigPage() {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const [tenant, formConfig] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({
      where: { id: session.user.tenantId },
      select: {
        scoringCriteria: true,
        highTierThreshold: true,
        mediumTierThreshold: true,
        highAutoSend: true,
        mediumAutoSend: true,
        lowAutoSend: true,
        slackWebhookUrl: true,
        fromEmail: true,
        replyToEmail: true,
      },
    }),
    prisma.formConfig.findUnique({
      where: { tenantId: session.user.tenantId },
      include: { fields: { orderBy: { order: "asc" } } },
    }),
  ]);

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Configuration</h1>
        <p className="mt-1 text-sm text-white/50">
          Manage your form, scoring criteria, and automation settings.
        </p>
      </div>
      <ConfigEditor config={tenant} formConfig={formConfig} />
    </div>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DynamicForm } from "@/components/form/DynamicForm";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: { formConfig: true },
  });

  return {
    title: tenant?.formConfig?.title ?? "Get In Touch",
  };
}

export default async function FormPage({ params }: Props) {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      formConfig: {
        include: { fields: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!tenant || !tenant.formConfig || !tenant.formConfig.isActive) {
    notFound();
  }

  const { formConfig } = tenant;

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-4 py-16">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#00E5FF]">
            {tenant.name}
          </p>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            {formConfig.title}
          </h1>
        </div>
        <DynamicForm formConfig={formConfig} slug={slug} />
      </div>
    </main>
  );
}

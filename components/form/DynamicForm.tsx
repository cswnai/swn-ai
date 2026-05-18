"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormConfig, FormField } from "@prisma/client";
import { DynamicField } from "./DynamicField";

interface Props {
  formConfig: FormConfig & { fields: FormField[] };
  slug: string;
}

export function DynamicForm({ formConfig, slug }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fields = [...formConfig.fields].sort((a, b) => a.order - b.order);

  // Build Zod schema dynamically
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    if (field.isRequired) {
      shape[field.key] = z.string().min(1, `${field.label} is required`);
    } else {
      shape[field.key] = z.string().optional().default("");
    }
  }
  const schema = z.object(shape);

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setError(null);
    try {
      const res = await fetch(`/api/form/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[#00E5FF]/20 bg-white/5 p-8 text-center">
        <div className="mb-4 text-4xl">✓</div>
        <h3 className="mb-2 text-xl font-semibold text-white">
          You're all set!
        </h3>
        <p className="text-white/60">{formConfig.thankYouMessage}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8"
    >
      {formConfig.description && (
        <p className="text-sm text-white/60">{formConfig.description}</p>
      )}

      {fields.map((field) => (
        <DynamicField
          key={field.id}
          field={field as Parameters<typeof DynamicField>[0]["field"]}
          register={register as Parameters<typeof DynamicField>[0]["register"]}
          errors={errors as Parameters<typeof DynamicField>[0]["errors"]}
        />
      ))}

      {error && (
        <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400 border border-red-500/20">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-xl bg-[#00E5FF] px-6 py-3.5 font-semibold text-black transition-all hover:bg-[#00E5FF]/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Submitting…" : formConfig.submitButtonLabel}
      </button>
    </form>
  );
}

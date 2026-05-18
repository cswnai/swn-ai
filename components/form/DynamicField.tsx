"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FormField as PrismaFormField } from "@prisma/client";

interface FieldOption {
  label: string;
  value: string;
}

interface Props {
  field: PrismaFormField & { options?: FieldOption[] | null };
  register: UseFormRegister<Record<string, string>>;
  errors: FieldErrors<Record<string, string>>;
}

const baseInput =
  "w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF] transition-colors";

export function DynamicField({ field, register, errors }: Props) {
  const error = errors[field.key];
  const options = (field.options as FieldOption[] | null) ?? [];

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-white/80">
        {field.label}
        {field.isRequired && <span className="ml-1 text-[#00E5FF]">*</span>}
      </label>

      {(field.type === "TEXT" ||
        field.type === "EMAIL" ||
        field.type === "PHONE" ||
        field.type === "NUMBER" ||
        field.type === "DATE") && (
        <input
          type={
            field.type === "EMAIL"
              ? "email"
              : field.type === "PHONE"
                ? "tel"
                : field.type === "NUMBER"
                  ? "number"
                  : field.type === "DATE"
                    ? "date"
                    : "text"
          }
          placeholder={field.placeholder ?? undefined}
          className={baseInput}
          {...register(field.key)}
        />
      )}

      {field.type === "TEXTAREA" && (
        <textarea
          rows={4}
          placeholder={field.placeholder ?? undefined}
          className={`${baseInput} resize-none`}
          {...register(field.key)}
        />
      )}

      {field.type === "SELECT" && (
        <select className={`${baseInput} cursor-pointer`} {...register(field.key)}>
          <option value="">Select an option...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0a0f]">
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {(field.type === "MULTISELECT" || field.type === "CHECKBOX") && (
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                value={opt.value}
                className="rounded border-white/20 bg-white/5 text-[#00E5FF] focus:ring-[#00E5FF]"
                {...register(field.key)}
              />
              <span className="text-sm text-white/80">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {field.type === "RADIO" && (
        <div className="flex flex-col gap-2">
          {options.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={opt.value}
                className="border-white/20 bg-white/5 text-[#00E5FF] focus:ring-[#00E5FF]"
                {...register(field.key)}
              />
              <span className="text-sm text-white/80">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400">{String(error.message)}</p>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { FormConfig, FormField, Tenant, AutoSendConfig, FieldType } from "@prisma/client";

interface Props {
  config: Pick<
    Tenant,
    | "scoringCriteria"
    | "highTierThreshold"
    | "mediumTierThreshold"
    | "highAutoSend"
    | "mediumAutoSend"
    | "lowAutoSend"
    | "slackWebhookUrl"
    | "fromEmail"
    | "replyToEmail"
  >;
  formConfig: (FormConfig & { fields: FormField[] }) | null;
}

interface FieldDraft {
  id?: string;
  label: string;
  key: string;
  type: FieldType;
  placeholder: string;
  isRequired: boolean;
  order: number;
  options: { label: string; value: string }[];
  scoringWeight: number;
  scoringHint: string;
}

const FIELD_TYPES: FieldType[] = [
  "TEXT", "TEXTAREA", "EMAIL", "PHONE", "NUMBER",
  "SELECT", "MULTISELECT", "RADIO", "CHECKBOX", "DATE",
];

const AUTO_SEND_OPTIONS: { value: AutoSendConfig; label: string }[] = [
  { value: "NEVER", label: "Never (don't send)" },
  { value: "APPROVAL_REQUIRED", label: "Require approval" },
  { value: "ALWAYS", label: "Send automatically" },
];

export function ConfigEditor({ config, formConfig }: Props) {
  const [isPending, startTransition] = useTransition();
  const [savedConfig, setSavedConfig] = useState(false);
  const [savedForm, setSavedForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Scoring & automation config
  const [scoring, setScoring] = useState({
    scoringCriteria: config.scoringCriteria,
    highTierThreshold: config.highTierThreshold,
    mediumTierThreshold: config.mediumTierThreshold,
    highAutoSend: config.highAutoSend,
    mediumAutoSend: config.mediumAutoSend,
    lowAutoSend: config.lowAutoSend,
    slackWebhookUrl: config.slackWebhookUrl ?? "",
    fromEmail: config.fromEmail,
    replyToEmail: config.replyToEmail ?? "",
  });

  // Form config
  const [formTitle, setFormTitle] = useState(formConfig?.title ?? "");
  const [formDescription, setFormDescription] = useState(formConfig?.description ?? "");
  const [submitLabel, setSubmitLabel] = useState(formConfig?.submitButtonLabel ?? "Submit");
  const [thankYou, setThankYou] = useState(formConfig?.thankYouMessage ?? "We'll be in touch soon!");
  const [fields, setFields] = useState<FieldDraft[]>(
    (formConfig?.fields ?? [])
      .sort((a, b) => a.order - b.order)
      .map((f) => ({
        id: f.id,
        label: f.label,
        key: f.key,
        type: f.type,
        placeholder: f.placeholder ?? "",
        isRequired: f.isRequired,
        order: f.order,
        options: (f.options as { label: string; value: string }[] | null) ?? [],
        scoringWeight: f.scoringWeight,
        scoringHint: f.scoringHint ?? "",
      }))
  );

  const [expandedField, setExpandedField] = useState<number | null>(null);

  const saveConfig = () => {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...scoring,
          slackWebhookUrl: scoring.slackWebhookUrl || undefined,
          replyToEmail: scoring.replyToEmail || undefined,
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Failed to save.");
        return;
      }
      setSavedConfig(true);
      setTimeout(() => setSavedConfig(false), 2500);
    });
  };

  const saveForm = () => {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/config/form", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription,
          submitButtonLabel: submitLabel,
          thankYouMessage: thankYou,
          fields: fields.map((f, i) => ({ ...f, order: i + 1 })),
        }),
      });
      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Failed to save form.");
        return;
      }
      setSavedForm(true);
      setTimeout(() => setSavedForm(false), 2500);
    });
  };

  const addField = () => {
    const newField: FieldDraft = {
      label: "New Field",
      key: `field_${Date.now()}`,
      type: "TEXT",
      placeholder: "",
      isRequired: false,
      order: fields.length + 1,
      options: [],
      scoringWeight: 1.0,
      scoringHint: "",
    };
    setFields([...fields, newField]);
    setExpandedField(fields.length);
  };

  const removeField = (idx: number) => {
    setFields(fields.filter((_, i) => i !== idx));
    setExpandedField(null);
  };

  const updateField = (idx: number, updates: Partial<FieldDraft>) => {
    setFields(fields.map((f, i) => (i === idx ? { ...f, ...updates } : f)));
  };

  const moveField = (idx: number, dir: -1 | 1) => {
    const newFields = [...fields];
    const target = idx + dir;
    if (target < 0 || target >= newFields.length) return;
    [newFields[idx], newFields[target]] = [newFields[target], newFields[idx]];
    setFields(newFields);
  };

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF] transition-colors";
  const labelCls = "block text-xs text-white/50 mb-1";

  return (
    <div className="flex flex-col gap-8">
      {error && (
        <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* ── Scoring & Automation ── */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 text-base font-semibold text-white">
          Scoring & Automation
        </h2>

        <div className="flex flex-col gap-5">
          <div>
            <label className={labelCls}>
              Scoring Criteria (plain English — Claude uses this to score leads)
            </label>
            <textarea
              rows={5}
              value={scoring.scoringCriteria}
              onChange={(e) =>
                setScoring({ ...scoring, scoringCriteria: e.target.value })
              }
              className={`${inputCls} resize-none`}
              placeholder="e.g. Prioritize B2B businesses with 10+ employees. Score higher for specific pain points and urgency..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>
                HIGH tier threshold (score ≥ this)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={scoring.highTierThreshold}
                onChange={(e) =>
                  setScoring({
                    ...scoring,
                    highTierThreshold: Number(e.target.value),
                  })
                }
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                MEDIUM tier threshold (score ≥ this)
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={scoring.mediumTierThreshold}
                onChange={(e) =>
                  setScoring({
                    ...scoring,
                    mediumTierThreshold: Number(e.target.value),
                  })
                }
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                { key: "highAutoSend", label: "HIGH tier email" },
                { key: "mediumAutoSend", label: "MEDIUM tier email" },
                { key: "lowAutoSend", label: "LOW tier email" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                <select
                  value={scoring[key]}
                  onChange={(e) =>
                    setScoring({
                      ...scoring,
                      [key]: e.target.value as AutoSendConfig,
                    })
                  }
                  className={`${inputCls} cursor-pointer`}
                >
                  {AUTO_SEND_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-[#0a0a0f]">
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Slack Webhook URL (optional)</label>
              <input
                type="url"
                value={scoring.slackWebhookUrl}
                onChange={(e) =>
                  setScoring({ ...scoring, slackWebhookUrl: e.target.value })
                }
                className={inputCls}
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
            <div>
              <label className={labelCls}>From Email</label>
              <input
                type="email"
                value={scoring.fromEmail}
                onChange={(e) =>
                  setScoring({ ...scoring, fromEmail: e.target.value })
                }
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={saveConfig}
            disabled={isPending}
            className="rounded-xl bg-[#00E5FF] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#00E5FF]/90 disabled:opacity-50 transition-colors"
          >
            {savedConfig ? "Saved ✓" : "Save Config"}
          </button>
        </div>
      </section>

      {/* ── Form Builder ── */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-5 text-base font-semibold text-white">Form Builder</h2>

        <div className="mb-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Form Title</label>
            <input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Submit Button Label</label>
            <input
              value={submitLabel}
              onChange={(e) => setSubmitLabel(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Description (optional)</label>
            <input
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Thank You Message</label>
            <input
              value={thankYou}
              onChange={(e) => setThankYou(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-2">
          {fields.map((field, idx) => (
            <div
              key={`${field.key}-${idx}`}
              className="rounded-lg border border-white/10 bg-white/[0.03]"
            >
              {/* Field header */}
              <div
                className="flex cursor-pointer items-center gap-3 px-4 py-3"
                onClick={() =>
                  setExpandedField(expandedField === idx ? null : idx)
                }
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveField(idx, -1); }}
                    disabled={idx === 0}
                    className="text-white/30 hover:text-white disabled:opacity-20 text-xs leading-none"
                  >
                    ▲
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveField(idx, 1); }}
                    disabled={idx === fields.length - 1}
                    className="text-white/30 hover:text-white disabled:opacity-20 text-xs leading-none"
                  >
                    ▼
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-white/90">
                    {field.label}
                  </span>
                  <span className="ml-2 text-xs text-white/30">
                    [{field.type}] key: {field.key}
                    {field.isRequired ? " · required" : ""}
                  </span>
                </div>
                <span className="text-xs text-white/30">
                  weight: {field.scoringWeight}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); removeField(idx); }}
                  className="ml-2 text-xs text-red-400/60 hover:text-red-400"
                >
                  Remove
                </button>
                <span className="text-white/30 text-xs">
                  {expandedField === idx ? "▲" : "▼"}
                </span>
              </div>

              {/* Field editor */}
              {expandedField === idx && (
                <div className="border-t border-white/10 px-4 py-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Label</label>
                      <input
                        value={field.label}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Key (machine-readable)</label>
                      <input
                        value={field.key}
                        onChange={(e) =>
                          updateField(idx, {
                            key: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9_]/g, "_"),
                          })
                        }
                        className={`${inputCls} font-mono`}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Field Type</label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateField(idx, { type: e.target.value as FieldType })
                        }
                        className={`${inputCls} cursor-pointer`}
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t} value={t} className="bg-[#0a0a0f]">
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Placeholder</label>
                      <input
                        value={field.placeholder}
                        onChange={(e) =>
                          updateField(idx, { placeholder: e.target.value })
                        }
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Scoring Weight (0–10)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.5}
                        value={field.scoringWeight}
                        onChange={(e) =>
                          updateField(idx, {
                            scoringWeight: Number(e.target.value),
                          })
                        }
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <input
                        type="checkbox"
                        id={`required-${idx}`}
                        checked={field.isRequired}
                        onChange={(e) =>
                          updateField(idx, { isRequired: e.target.checked })
                        }
                        className="rounded border-white/20 bg-white/5 text-[#00E5FF] focus:ring-[#00E5FF]"
                      />
                      <label
                        htmlFor={`required-${idx}`}
                        className="text-sm text-white/70"
                      >
                        Required
                      </label>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>
                        Scoring Hint (tell Claude how to score this field)
                      </label>
                      <input
                        value={field.scoringHint}
                        onChange={(e) =>
                          updateField(idx, { scoringHint: e.target.value })
                        }
                        className={inputCls}
                        placeholder="e.g. Higher scores for larger team sizes..."
                      />
                    </div>

                    {["SELECT", "MULTISELECT", "RADIO", "CHECKBOX"].includes(
                      field.type
                    ) && (
                      <div className="sm:col-span-2">
                        <label className={labelCls}>
                          Options (one per line: Label|value)
                        </label>
                        <textarea
                          rows={4}
                          value={field.options
                            .map((o) => `${o.label}|${o.value}`)
                            .join("\n")}
                          onChange={(e) => {
                            const opts = e.target.value
                              .split("\n")
                              .map((line) => {
                                const [lbl, val] = line.split("|");
                                return {
                                  label: lbl?.trim() ?? "",
                                  value:
                                    val?.trim() ??
                                    lbl?.trim().toLowerCase().replace(/\s+/g, "_") ??
                                    "",
                                };
                              })
                              .filter((o) => o.label);
                            updateField(idx, { options: opts });
                          }}
                          className={`${inputCls} resize-none font-mono text-xs`}
                          placeholder={"Option One|option_one\nOption Two|option_two"}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={addField}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5 transition-colors"
          >
            + Add Field
          </button>
          <button
            onClick={saveForm}
            disabled={isPending}
            className="rounded-xl bg-[#00E5FF] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#00E5FF]/90 disabled:opacity-50 transition-colors"
          >
            {savedForm ? "Saved ✓" : "Save Form"}
          </button>
        </div>
      </section>
    </div>
  );
}

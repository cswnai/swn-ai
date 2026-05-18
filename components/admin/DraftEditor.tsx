"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EmailDraft, Lead, LeadAnswer } from "@prisma/client";

interface Props {
  draft: EmailDraft & {
    lead: Lead & { answers: LeadAnswer[] };
  };
}

export function DraftEditor({ draft }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [subject, setSubject] = useState(draft.editedSubject ?? draft.subject);
  const [body, setBody] = useState(draft.editedBodyText ?? draft.bodyText);
  const [saved, setSaved] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [view, setView] = useState<"text" | "html">("text");

  const save = useCallback(async () => {
    await fetch(`/api/admin/queue/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        editedSubject: subject,
        editedBodyText: body,
      }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [draft.id, subject, body]);

  const approve = () => {
    setActionError(null);
    startTransition(async () => {
      await save();
      const res = await fetch(`/api/admin/queue/${draft.id}/approve`, {
        method: "POST",
      });
      if (!res.ok) {
        const json = await res.json();
        setActionError(json.error ?? "Failed to approve.");
        return;
      }
      router.push("/admin/queue");
      router.refresh();
    });
  };

  const reject = () => {
    setActionError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/queue/${draft.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const json = await res.json();
        setActionError(json.error ?? "Failed to reject.");
        return;
      }
      router.push("/admin/queue");
      router.refresh();
    });
  };

  const getName = (key: string) =>
    draft.lead.answers.find((a) => a.fieldKey === key)?.value ?? "—";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left: lead context */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
          Lead Context
        </h2>
        <dl className="flex flex-col gap-3">
          {draft.lead.answers.map((answer) => (
            <div key={answer.id}>
              <dt className="text-xs text-white/40">{answer.fieldLabel}</dt>
              <dd className="mt-0.5 text-sm text-white/90">
                {answer.value || "—"}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-xs text-white/40">
            Sending to: <span className="text-white/70">{draft.toEmail}</span>
          </p>
          {draft.lead.scoreRationale && (
            <p className="mt-2 text-xs text-white/40">
              Rationale:{" "}
              <span className="text-white/60">{draft.lead.scoreRationale}</span>
            </p>
          )}
        </div>
      </section>

      {/* Right: email editor */}
      <section className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">
          Email Draft
        </h2>

        <div>
          <label className="mb-1.5 block text-xs text-white/50">Subject</label>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
          />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs text-white/50">Body</label>
            <div className="flex gap-1">
              <button
                onClick={() => setView("text")}
                className={`rounded px-2 py-0.5 text-xs transition-colors ${view === "text" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
              >
                Text
              </button>
              <button
                onClick={() => setView("html")}
                className={`rounded px-2 py-0.5 text-xs transition-colors ${view === "html" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"}`}
              >
                HTML preview
              </button>
            </div>
          </div>

          {view === "text" ? (
            <textarea
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white/80 focus:border-[#00E5FF] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
            />
          ) : (
            <div
              className="h-64 overflow-y-auto rounded-lg border border-white/10 bg-white p-4 text-sm text-black"
              dangerouslySetInnerHTML={{
                __html: draft.editedBodyHtml ?? draft.bodyHtml,
              }}
            />
          )}
        </div>

        <button
          onClick={save}
          disabled={isPending}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          {saved ? "Saved ✓" : "Save edits"}
        </button>

        {actionError && (
          <p className="text-sm text-red-400">{actionError}</p>
        )}

        <div className="flex gap-3 pt-2 border-t border-white/10">
          <button
            onClick={approve}
            disabled={isPending}
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-black hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {isPending ? "Sending…" : "Approve & Send"}
          </button>
          <button
            onClick={reject}
            disabled={isPending}
            className="rounded-xl border border-white/10 px-4 py-3 text-sm text-white/50 hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </section>
    </div>
  );
}

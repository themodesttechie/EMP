"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { generateFromTicketAction } from "@/lib/kb/actions";
import type { KbCategory } from "@/lib/kb/types";

type Props = {
  ticketId: string;
  ticketNumber: string;
  ticketTitle: string;
  categories: KbCategory[];
};

export default function KbFromTicket({
  ticketId,
  ticketNumber,
  ticketTitle,
  categories,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const ranRef = useRef(false);

  // Auto-trigger AI authoring on first mount; agent reviews the resulting draft.
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    startTransition(async () => {
      const r = await generateFromTicketAction({ ticket_id: ticketId });
      if (r.error) {
        setError(r.error);
        return;
      }
      const data = r.data as { id?: string; slug?: string } | undefined;
      if (data?.id) {
        router.push(`/kb/new?id=${data.id}`);
      }
    });
  }, [ticketId, router]);

  return (
    <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
        <Sparkles size={20} />
      </div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        Drafting an article from {ticketNumber}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Reading the ticket thread for &ldquo;{ticketTitle}&rdquo; and proposing a reusable knowledge article.
      </p>
      {pending && (
        <p className="text-sm text-gray-600 dark:text-gray-300 animate-pulse">
          Working on it…
        </p>
      )}
      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-700 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-4 py-3 text-sm">
          {error}
          <div className="mt-3">
            <a
              href={`/kb/new`}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
            >
              Compose by hand
            </a>
          </div>
        </div>
      )}
      <div className="text-xs text-gray-400">
        {categories.length} categories available
      </div>
    </div>
  );
}

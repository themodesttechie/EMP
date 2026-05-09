"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Subscribe to a Postgres changes feed. Caller controls re-fetch via onChange.
// Filter format follows Supabase Realtime: e.g. `tenant_id=eq.<uuid>`.
export function useRealtime(opts: {
  table: string;
  filter?: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  onChange: () => void;
}) {
  useEffect(() => {
    const supabase = createClient();
    const channelName = `realtime:${opts.table}:${opts.filter ?? "all"}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes" as Parameters<typeof supabase.channel>[0] extends never ? never : "postgres_changes",
        {
          event: opts.event ?? "*",
          schema: "public",
          table: opts.table,
          filter: opts.filter,
        } as never,
        () => opts.onChange(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [opts.table, opts.filter, opts.event, opts]);
}

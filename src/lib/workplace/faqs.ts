import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Faq = {
  id: string;
  tenant_id: string;
  slug: string;
  question: string;
  answer_md: string;
  category: string;
  sort_order: number;
  helpful_count: number;
  unhelpful_count: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

const COLS =
  "id, tenant_id, slug, question, answer_md, category, sort_order, helpful_count, unhelpful_count, published, created_at, updated_at";

export async function listPublished(): Promise<Faq[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select(COLS)
    .eq("published", true)
    .order("sort_order")
    .order("question");
  return (data ?? []) as Faq[];
}

export async function listAll(): Promise<Faq[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select(COLS)
    .order("sort_order")
    .order("question");
  return (data ?? []) as Faq[];
}

export async function byCategory(category: string): Promise<Faq[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select(COLS)
    .eq("published", true)
    .eq("category", category)
    .order("sort_order")
    .order("question");
  return (data ?? []) as Faq[];
}

export async function listFaqCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("faqs").select("category").eq("published", true);
  const set = new Set<string>();
  for (const r of (data ?? []) as Array<{ category: string }>) set.add(r.category);
  return Array.from(set).sort();
}

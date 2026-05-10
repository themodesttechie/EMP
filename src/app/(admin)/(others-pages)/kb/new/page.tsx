import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { listCategories, getArticleById } from "@/lib/kb/queries";
import KbEditor from "@/components/kb/KbEditor";

export const metadata: Metadata = { title: "New article | ifBash" };
export const dynamic = "force-dynamic";

export default async function KbNewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const profile = await requireProfile();
  if (!["agent", "admin", "owner"].includes(profile.role)) {
    redirect("/error-403");
  }
  const params = await searchParams;
  const editing = params.id ? await getArticleById(params.id) : null;
  const categories = await listCategories();

  return (
    <KbEditor
      categories={categories}
      existing={editing}
    />
  );
}

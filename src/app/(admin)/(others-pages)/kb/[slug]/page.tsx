import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import {
  getArticle,
  listRelatedByCategory,
  recordView,
} from "@/lib/kb/queries";
import KbArticleView from "@/components/kb/KbArticleView";

export const metadata: Metadata = { title: "Article | ifBash" };
export const dynamic = "force-dynamic";

export default async function KbArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await requireProfile();
  const article = await getArticle(slug);
  if (!article) notFound();

  const canEdit = ["agent", "admin", "owner"].includes(profile.role);
  const related = await listRelatedByCategory(article, { limit: 5 });

  await recordView({
    tenant_id: article.tenant_id,
    article_id: article.id,
    viewer_id: profile.id,
    source: "direct",
  });

  return (
    <KbArticleView
      article={article}
      related={related}
      canEdit={canEdit}
    />
  );
}

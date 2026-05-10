-- ifBash Sprint 6 — pgvector + analytics indexes
-- HNSW for fast cosine similarity over kb_articles.embedding.

-- HNSW index on the embedding (cosine ops). Built with sane defaults; tune later
-- once we have real corpus volume. Created concurrently is not used to keep this
-- migration runnable inside a transaction.
do $$
begin
  if not exists (
    select 1 from pg_indexes
     where schemaname = 'public'
       and tablename  = 'kb_articles'
       and indexname  = 'idx_kb_articles_embedding_hnsw'
  ) then
    execute 'create index idx_kb_articles_embedding_hnsw on public.kb_articles using hnsw (embedding vector_cosine_ops)';
  end if;
end $$;

-- Tenant + state filter (drives published-list reads + draft queues)
create index if not exists idx_kb_articles_tenant_state on public.kb_articles(tenant_id, state);

-- View analytics — group by source for deflection-rate KPI
create index if not exists idx_kb_article_views_article_source on public.kb_article_views(article_id, source);

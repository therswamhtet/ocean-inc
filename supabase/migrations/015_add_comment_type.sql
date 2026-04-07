-- Add is_revision boolean to comments table
-- Enables clients to request revisions via flagged comments in the portal

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS is_revision BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_comments_task_id_created_at ON public.comments(task_id, created_at);


-- =========================================================================
-- Task #28: Knowledge Base + Runbook Wiki + Training Academy - Data Model
-- =========================================================================

-- Helper: is_knowledge_manager
CREATE OR REPLACE FUNCTION public.is_knowledge_manager(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id
      AND user_id = _user_id
      AND role IN ('owner','admin')
  );
$$;

-- =========================================================================
-- 1. knowledge_spaces
-- =========================================================================
CREATE TABLE public.knowledge_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  partner_id uuid,
  space_key text NOT NULL,
  name text NOT NULL,
  description text,
  space_type text NOT NULL DEFAULT 'internal',
  visibility text NOT NULL DEFAULT 'team',
  status text NOT NULL DEFAULT 'active',
  owner_user_id uuid,
  default_language text NOT NULL DEFAULT 'en',
  brand_profile_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, space_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_spaces TO authenticated;
GRANT ALL ON public.knowledge_spaces TO service_role;
ALTER TABLE public.knowledge_spaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kspaces_team_read" ON public.knowledge_spaces FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "kspaces_admin_write" ON public.knowledge_spaces FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 2. knowledge_collections
-- =========================================================================
CREATE TABLE public.knowledge_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  space_id uuid NOT NULL REFERENCES public.knowledge_spaces(id) ON DELETE CASCADE,
  parent_collection_id uuid,
  collection_key text NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 100,
  visibility text NOT NULL DEFAULT 'inherit',
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (space_id, collection_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_collections TO authenticated;
GRANT ALL ON public.knowledge_collections TO service_role;
ALTER TABLE public.knowledge_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kcollections_team_read" ON public.knowledge_collections FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "kcollections_admin_write" ON public.knowledge_collections FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 3. knowledge_articles
-- =========================================================================
CREATE TABLE public.knowledge_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  space_id uuid NOT NULL REFERENCES public.knowledge_spaces(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES public.knowledge_collections(id) ON DELETE SET NULL,
  article_key text NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  summary text,
  content text,
  content_format text NOT NULL DEFAULT 'markdown',
  article_type text NOT NULL DEFAULT 'article',
  visibility text NOT NULL DEFAULT 'team',
  status text NOT NULL DEFAULT 'draft',
  sensitivity_level text NOT NULL DEFAULT 'internal',
  language text NOT NULL DEFAULT 'en',
  version_number integer NOT NULL DEFAULT 1,
  source_type text NOT NULL DEFAULT 'manual',
  source_resource_type text,
  source_resource_id uuid,
  owner_user_id uuid,
  reviewed_by uuid,
  approved_by uuid,
  published_by uuid,
  reviewed_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  next_review_due_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_articles TO authenticated;
GRANT ALL ON public.knowledge_articles TO service_role;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "karticles_team_read" ON public.knowledge_articles FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "karticles_admin_write" ON public.knowledge_articles FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));
-- Allow anon to read published public articles
GRANT SELECT ON public.knowledge_articles TO anon;
CREATE POLICY "karticles_public_read" ON public.knowledge_articles FOR SELECT TO anon
  USING (status = 'published' AND visibility = 'public');

-- =========================================================================
-- 4. knowledge_article_versions
-- =========================================================================
CREATE TABLE public.knowledge_article_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  article_id uuid NOT NULL REFERENCES public.knowledge_articles(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  title text NOT NULL,
  content text,
  summary text,
  change_summary text,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid,
  approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_article_versions TO authenticated;
GRANT ALL ON public.knowledge_article_versions TO service_role;
ALTER TABLE public.knowledge_article_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "karticle_versions_team_read" ON public.knowledge_article_versions FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "karticle_versions_admin_write" ON public.knowledge_article_versions FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 5. knowledge_article_reviews
-- =========================================================================
CREATE TABLE public.knowledge_article_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  article_id uuid NOT NULL REFERENCES public.knowledge_articles(id) ON DELETE CASCADE,
  reviewer_id uuid,
  review_type text NOT NULL DEFAULT 'content',
  status text NOT NULL DEFAULT 'pending',
  comments text,
  checklist jsonb NOT NULL DEFAULT '[]',
  reviewed_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_article_reviews TO authenticated;
GRANT ALL ON public.knowledge_article_reviews TO service_role;
ALTER TABLE public.knowledge_article_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "karticle_reviews_team_read" ON public.knowledge_article_reviews FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "karticle_reviews_admin_write" ON public.knowledge_article_reviews FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id) OR reviewer_id = auth.uid())
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id) OR reviewer_id = auth.uid());

-- =========================================================================
-- 6. knowledge_tags
-- =========================================================================
CREATE TABLE public.knowledge_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  name text NOT NULL,
  tag_key text NOT NULL,
  color text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, tag_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_tags TO authenticated;
GRANT ALL ON public.knowledge_tags TO service_role;
ALTER TABLE public.knowledge_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ktags_team_read" ON public.knowledge_tags FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "ktags_admin_write" ON public.knowledge_tags FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 7. knowledge_article_tags
-- =========================================================================
CREATE TABLE public.knowledge_article_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  article_id uuid NOT NULL REFERENCES public.knowledge_articles(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.knowledge_tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (article_id, tag_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_article_tags TO authenticated;
GRANT ALL ON public.knowledge_article_tags TO service_role;
ALTER TABLE public.knowledge_article_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "karticle_tags_team_read" ON public.knowledge_article_tags FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "karticle_tags_admin_write" ON public.knowledge_article_tags FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 8. knowledge_article_links
-- =========================================================================
CREATE TABLE public.knowledge_article_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  article_id uuid NOT NULL REFERENCES public.knowledge_articles(id) ON DELETE CASCADE,
  resource_type text NOT NULL,
  resource_id uuid,
  relationship_type text NOT NULL DEFAULT 'related',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_article_links TO authenticated;
GRANT ALL ON public.knowledge_article_links TO service_role;
ALTER TABLE public.knowledge_article_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "karticle_links_team_read" ON public.knowledge_article_links FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "karticle_links_admin_write" ON public.knowledge_article_links FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 9. knowledge_feedback
-- =========================================================================
CREATE TABLE public.knowledge_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  article_id uuid NOT NULL REFERENCES public.knowledge_articles(id) ON DELETE CASCADE,
  user_id uuid,
  customer_user_id uuid,
  partner_member_id uuid,
  rating text,
  feedback text,
  source text NOT NULL DEFAULT 'dashboard',
  status text NOT NULL DEFAULT 'open',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_feedback TO authenticated;
GRANT ALL ON public.knowledge_feedback TO service_role;
ALTER TABLE public.knowledge_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kfeedback_team_read" ON public.knowledge_feedback FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "kfeedback_team_insert" ON public.knowledge_feedback FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "kfeedback_admin_update" ON public.knowledge_feedback FOR UPDATE TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 10. knowledge_search_queries
-- =========================================================================
CREATE TABLE public.knowledge_search_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  user_id uuid,
  customer_user_id uuid,
  query text NOT NULL,
  source text NOT NULL DEFAULT 'dashboard',
  result_count integer NOT NULL DEFAULT 0,
  clicked_article_id uuid,
  created_ticket_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.knowledge_search_queries TO authenticated;
GRANT ALL ON public.knowledge_search_queries TO service_role;
ALTER TABLE public.knowledge_search_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ksearch_team_read" ON public.knowledge_search_queries FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "ksearch_team_insert" ON public.knowledge_search_queries FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(team_id, auth.uid()));

-- =========================================================================
-- 11. knowledge_index_jobs
-- =========================================================================
CREATE TABLE public.knowledge_index_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  article_id uuid,
  space_id uuid,
  job_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  input jsonb NOT NULL DEFAULT '{}',
  output jsonb NOT NULL DEFAULT '{}',
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_index_jobs TO authenticated;
GRANT ALL ON public.knowledge_index_jobs TO service_role;
ALTER TABLE public.knowledge_index_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kindex_team_read" ON public.knowledge_index_jobs FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "kindex_admin_write" ON public.knowledge_index_jobs FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 12. training_courses
-- =========================================================================
CREATE TABLE public.training_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  space_id uuid REFERENCES public.knowledge_spaces(id) ON DELETE SET NULL,
  course_key text NOT NULL,
  title text NOT NULL,
  description text,
  course_type text NOT NULL DEFAULT 'technician',
  difficulty text NOT NULL DEFAULT 'beginner',
  visibility text NOT NULL DEFAULT 'team',
  status text NOT NULL DEFAULT 'draft',
  estimated_minutes integer,
  passing_score integer NOT NULL DEFAULT 80,
  certificate_enabled boolean NOT NULL DEFAULT false,
  created_by uuid,
  published_by uuid,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, course_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_courses TO authenticated;
GRANT ALL ON public.training_courses TO service_role;
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tcourses_team_read" ON public.training_courses FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "tcourses_admin_write" ON public.training_courses FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 13. training_modules
-- =========================================================================
CREATE TABLE public.training_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  module_key text NOT NULL,
  title text NOT NULL,
  description text,
  module_type text NOT NULL DEFAULT 'lesson',
  article_id uuid REFERENCES public.knowledge_articles(id) ON DELETE SET NULL,
  content text,
  sort_order integer NOT NULL DEFAULT 100,
  estimated_minutes integer,
  required boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (course_id, module_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_modules TO authenticated;
GRANT ALL ON public.training_modules TO service_role;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tmodules_team_read" ON public.training_modules FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "tmodules_admin_write" ON public.training_modules FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 14. training_quizzes
-- =========================================================================
CREATE TABLE public.training_quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  course_id uuid REFERENCES public.training_courses(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.training_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL DEFAULT '[]',
  passing_score integer NOT NULL DEFAULT 80,
  max_attempts integer NOT NULL DEFAULT 3,
  shuffle_questions boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_quizzes TO authenticated;
GRANT ALL ON public.training_quizzes TO service_role;
ALTER TABLE public.training_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tquizzes_team_read" ON public.training_quizzes FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "tquizzes_admin_write" ON public.training_quizzes FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 15. training_enrollments
-- =========================================================================
CREATE TABLE public.training_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  user_id uuid,
  customer_user_id uuid,
  partner_member_id uuid,
  status text NOT NULL DEFAULT 'enrolled',
  progress_percent numeric NOT NULL DEFAULT 0,
  enrolled_by uuid,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  due_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_enrollments TO authenticated;
GRANT ALL ON public.training_enrollments TO service_role;
ALTER TABLE public.training_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenroll_self_or_admin_read" ON public.training_enrollments FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_knowledge_manager(auth.uid(), team_id));
CREATE POLICY "tenroll_self_update" ON public.training_enrollments FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (user_id = auth.uid() OR public.is_knowledge_manager(auth.uid(), team_id));
CREATE POLICY "tenroll_admin_write" ON public.training_enrollments FOR INSERT TO authenticated
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));
CREATE POLICY "tenroll_admin_delete" ON public.training_enrollments FOR DELETE TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 16. training_progress_events
-- =========================================================================
CREATE TABLE public.training_progress_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  enrollment_id uuid NOT NULL REFERENCES public.training_enrollments(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  module_id uuid REFERENCES public.training_modules(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  progress_percent numeric,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.training_progress_events TO authenticated;
GRANT ALL ON public.training_progress_events TO service_role;
ALTER TABLE public.training_progress_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tprogress_team_read" ON public.training_progress_events FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "tprogress_team_insert" ON public.training_progress_events FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(team_id, auth.uid()));

-- =========================================================================
-- 17. training_quiz_attempts
-- =========================================================================
CREATE TABLE public.training_quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  quiz_id uuid NOT NULL REFERENCES public.training_quizzes(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES public.training_enrollments(id) ON DELETE SET NULL,
  user_id uuid,
  customer_user_id uuid,
  partner_member_id uuid,
  status text NOT NULL DEFAULT 'submitted',
  score integer,
  answers jsonb NOT NULL DEFAULT '{}',
  feedback jsonb NOT NULL DEFAULT '{}',
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.training_quiz_attempts TO authenticated;
GRANT ALL ON public.training_quiz_attempts TO service_role;
ALTER TABLE public.training_quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tattempt_self_or_admin_read" ON public.training_quiz_attempts FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_knowledge_manager(auth.uid(), team_id));
CREATE POLICY "tattempt_self_insert" ON public.training_quiz_attempts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_knowledge_manager(auth.uid(), team_id));
CREATE POLICY "tattempt_self_update" ON public.training_quiz_attempts FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (user_id = auth.uid() OR public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 18. training_certificates
-- =========================================================================
CREATE TABLE public.training_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  enrollment_id uuid NOT NULL REFERENCES public.training_enrollments(id) ON DELETE CASCADE,
  user_id uuid,
  customer_user_id uuid,
  partner_member_id uuid,
  certificate_number text,
  status text NOT NULL DEFAULT 'issued',
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  verification_hash text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.training_certificates TO authenticated;
GRANT ALL ON public.training_certificates TO service_role;
ALTER TABLE public.training_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tcert_self_or_admin_read" ON public.training_certificates FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_knowledge_manager(auth.uid(), team_id));
CREATE POLICY "tcert_admin_write" ON public.training_certificates FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 19. knowledge_import_jobs
-- =========================================================================
CREATE TABLE public.knowledge_import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  space_id uuid REFERENCES public.knowledge_spaces(id) ON DELETE SET NULL,
  source_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  input jsonb NOT NULL DEFAULT '{}',
  output jsonb NOT NULL DEFAULT '{}',
  records_created integer NOT NULL DEFAULT 0,
  records_updated integer NOT NULL DEFAULT 0,
  error_message text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_import_jobs TO authenticated;
GRANT ALL ON public.knowledge_import_jobs TO service_role;
ALTER TABLE public.knowledge_import_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kimport_team_read" ON public.knowledge_import_jobs FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "kimport_admin_write" ON public.knowledge_import_jobs FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- 20. knowledge_audit_events
-- =========================================================================
CREATE TABLE public.knowledge_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  article_id uuid,
  course_id uuid,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  description text,
  actor_id uuid,
  resource_type text,
  resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.knowledge_audit_events TO authenticated;
GRANT ALL ON public.knowledge_audit_events TO service_role;
ALTER TABLE public.knowledge_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kaudit_team_read" ON public.knowledge_audit_events FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));

-- =========================================================================
-- 21. knowledge_reports
-- =========================================================================
CREATE TABLE public.knowledge_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  report_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  title text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}',
  output jsonb NOT NULL DEFAULT '{}',
  artifact_id uuid,
  requested_by uuid,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.knowledge_reports TO authenticated;
GRANT ALL ON public.knowledge_reports TO service_role;
ALTER TABLE public.knowledge_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kreports_team_read" ON public.knowledge_reports FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "kreports_admin_write" ON public.knowledge_reports FOR ALL TO authenticated
  USING (public.is_knowledge_manager(auth.uid(), team_id))
  WITH CHECK (public.is_knowledge_manager(auth.uid(), team_id));

-- =========================================================================
-- updated_at triggers
-- =========================================================================
CREATE TRIGGER update_knowledge_spaces_updated_at BEFORE UPDATE ON public.knowledge_spaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_collections_updated_at BEFORE UPDATE ON public.knowledge_collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_articles_updated_at BEFORE UPDATE ON public.knowledge_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_article_reviews_updated_at BEFORE UPDATE ON public.knowledge_article_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_index_jobs_updated_at BEFORE UPDATE ON public.knowledge_index_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_courses_updated_at BEFORE UPDATE ON public.training_courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_modules_updated_at BEFORE UPDATE ON public.training_modules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_quizzes_updated_at BEFORE UPDATE ON public.training_quizzes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_enrollments_updated_at BEFORE UPDATE ON public.training_enrollments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_certificates_updated_at BEFORE UPDATE ON public.training_certificates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_import_jobs_updated_at BEFORE UPDATE ON public.knowledge_import_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_knowledge_reports_updated_at BEFORE UPDATE ON public.knowledge_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- Indexes
-- =========================================================================
CREATE INDEX idx_kspaces_team_key ON public.knowledge_spaces(team_id, space_key, status);
CREATE INDEX idx_kcollections_space ON public.knowledge_collections(team_id, space_id, parent_collection_id, sort_order);
CREATE INDEX idx_karticles_space_status ON public.knowledge_articles(team_id, space_id, status, visibility);
CREATE INDEX idx_karticles_slug ON public.knowledge_articles(team_id, slug);
CREATE INDEX idx_karticles_type ON public.knowledge_articles(team_id, article_type, status);
CREATE INDEX idx_karticle_versions ON public.knowledge_article_versions(team_id, article_id, version_number);
CREATE INDEX idx_karticle_reviews ON public.knowledge_article_reviews(team_id, article_id, status);
CREATE INDEX idx_ktags_key ON public.knowledge_tags(team_id, tag_key);
CREATE INDEX idx_karticle_tags ON public.knowledge_article_tags(team_id, article_id);
CREATE INDEX idx_karticle_links ON public.knowledge_article_links(team_id, resource_type, resource_id);
CREATE INDEX idx_kfeedback_status ON public.knowledge_feedback(team_id, article_id, status);
CREATE INDEX idx_ksearch_created ON public.knowledge_search_queries(team_id, created_at DESC);
CREATE INDEX idx_kindex_status ON public.knowledge_index_jobs(team_id, status, created_at DESC);
CREATE INDEX idx_tcourses_key ON public.training_courses(team_id, course_key, status);
CREATE INDEX idx_tmodules_sort ON public.training_modules(team_id, course_id, sort_order);
CREATE INDEX idx_tquizzes_course ON public.training_quizzes(team_id, course_id, module_id);
CREATE INDEX idx_tenroll_course ON public.training_enrollments(team_id, course_id, status);
CREATE INDEX idx_tenroll_user ON public.training_enrollments(team_id, user_id, status);
CREATE INDEX idx_tprogress_created ON public.training_progress_events(team_id, enrollment_id, created_at DESC);
CREATE INDEX idx_tattempts_created ON public.training_quiz_attempts(team_id, quiz_id, created_at DESC);
CREATE INDEX idx_tcert_status ON public.training_certificates(team_id, enrollment_id, status);
CREATE INDEX idx_kimport_status ON public.knowledge_import_jobs(team_id, status, created_at DESC);
CREATE INDEX idx_kaudit_created ON public.knowledge_audit_events(team_id, created_at DESC);
CREATE INDEX idx_kreports_status ON public.knowledge_reports(team_id, status, created_at DESC);

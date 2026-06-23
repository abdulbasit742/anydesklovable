
-- ============ TABLES 13-19 ============

CREATE TABLE public.data_asset_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  asset_id uuid NOT NULL REFERENCES public.data_assets(id) ON DELETE CASCADE,
  certification_type text NOT NULL DEFAULT 'trusted'
    CHECK (certification_type IN ('trusted','verified','deprecated','restricted','ai_ready','bi_ready','compliance_ready','custom')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','expired','revoked','archived')),
  certified_by uuid,
  certified_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  notes text,
  evidence_resource_type text,
  evidence_resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_asset_certifications TO authenticated;
GRANT ALL ON public.data_asset_certifications TO service_role;
ALTER TABLE public.data_asset_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read certs" ON public.data_asset_certifications FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage certs" ON public.data_asset_certifications FOR ALL TO authenticated USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_dac_updated BEFORE UPDATE ON public.data_asset_certifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_dac_asset ON public.data_asset_certifications(asset_id);
CREATE INDEX idx_dac_team_status ON public.data_asset_certifications(team_id, status);

CREATE TABLE public.business_glossary_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  collection_key text NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  owner_user_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, collection_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_glossary_collections TO authenticated;
GRANT ALL ON public.business_glossary_collections TO service_role;
ALTER TABLE public.business_glossary_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read glossary cols" ON public.business_glossary_collections FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage glossary cols" ON public.business_glossary_collections FOR ALL TO authenticated USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_bgc_updated BEFORE UPDATE ON public.business_glossary_collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_bgc_team ON public.business_glossary_collections(team_id);

CREATE TABLE public.business_glossary_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  collection_id uuid REFERENCES public.business_glossary_collections(id) ON DELETE SET NULL,
  term_key text NOT NULL,
  name text NOT NULL,
  definition text NOT NULL,
  term_type text NOT NULL DEFAULT 'business_metric'
    CHECK (term_type IN ('business_metric','data_field','process','policy','role','status','financial','customer','security','compliance','custom')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','deprecated','archived')),
  synonyms text[] NOT NULL DEFAULT '{}',
  related_term_ids uuid[] NOT NULL DEFAULT '{}',
  owner_user_id uuid,
  approved_by uuid,
  approved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, term_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_glossary_terms TO authenticated;
GRANT ALL ON public.business_glossary_terms TO service_role;
ALTER TABLE public.business_glossary_terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read terms" ON public.business_glossary_terms FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage terms" ON public.business_glossary_terms FOR ALL TO authenticated USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_bgt_updated BEFORE UPDATE ON public.business_glossary_terms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_bgt_team_status ON public.business_glossary_terms(team_id, status);
CREATE INDEX idx_bgt_collection ON public.business_glossary_terms(collection_id);

CREATE TABLE public.schema_change_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  asset_id uuid REFERENCES public.data_assets(id) ON DELETE CASCADE,
  change_type text NOT NULL DEFAULT 'field_added'
    CHECK (change_type IN ('asset_added','asset_removed','field_added','field_removed','field_changed','type_changed','sensitivity_changed','owner_changed','lineage_changed','quality_rule_changed','custom')),
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  title text NOT NULL,
  description text,
  before_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  after_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  detected_by text NOT NULL DEFAULT 'manual' CHECK (detected_by IN ('manual','worker','system','api')),
  reviewed boolean NOT NULL DEFAULT false,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schema_change_events TO authenticated;
GRANT ALL ON public.schema_change_events TO service_role;
ALTER TABLE public.schema_change_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read schema changes" ON public.schema_change_events FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage schema changes" ON public.schema_change_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE INDEX idx_sce_team_reviewed ON public.schema_change_events(team_id, reviewed);
CREATE INDEX idx_sce_asset ON public.schema_change_events(asset_id);

CREATE TABLE public.data_governance_policy_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  asset_id uuid NOT NULL REFERENCES public.data_assets(id) ON DELETE CASCADE,
  policy_type text NOT NULL DEFAULT 'retention'
    CHECK (policy_type IN ('retention','legal_hold','access_policy','classification_policy','data_residency','ai_governance','compliance_control','custom')),
  policy_resource_type text,
  policy_resource_id uuid,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived')),
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_governance_policy_links TO authenticated;
GRANT ALL ON public.data_governance_policy_links TO service_role;
ALTER TABLE public.data_governance_policy_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read policy links" ON public.data_governance_policy_links FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage policy links" ON public.data_governance_policy_links FOR ALL TO authenticated USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_dgpl_updated BEFORE UPDATE ON public.data_governance_policy_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_dgpl_asset ON public.data_governance_policy_links(asset_id);
CREATE INDEX idx_dgpl_team_type ON public.data_governance_policy_links(team_id, policy_type);

CREATE TABLE public.data_catalog_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  workspace_id uuid REFERENCES public.data_catalog_workspaces(id) ON DELETE SET NULL,
  asset_id uuid REFERENCES public.data_assets(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  title text NOT NULL,
  description text,
  actor_id uuid,
  resource_type text,
  resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.data_catalog_activity_events TO authenticated;
GRANT ALL ON public.data_catalog_activity_events TO service_role;
ALTER TABLE public.data_catalog_activity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read activity" ON public.data_catalog_activity_events FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "members insert activity" ON public.data_catalog_activity_events FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id, auth.uid()));
CREATE INDEX idx_dcae_team_created ON public.data_catalog_activity_events(team_id, created_at DESC);
CREATE INDEX idx_dcae_asset ON public.data_catalog_activity_events(asset_id);

CREATE TABLE public.data_catalog_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  report_type text NOT NULL
    CHECK (report_type IN ('catalog_overview','asset_inventory','field_classification','pii_inventory','lineage_graph','data_quality','access_requests','ownership','glossary','schema_changes','retention_mapping','ai_data_readiness','bi_data_readiness')),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','success','failed','worker_required')),
  title text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  artifact_id uuid,
  requested_by uuid,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_catalog_reports TO authenticated;
GRANT ALL ON public.data_catalog_reports TO service_role;
ALTER TABLE public.data_catalog_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read reports" ON public.data_catalog_reports FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage reports" ON public.data_catalog_reports FOR ALL TO authenticated USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_dcr_updated BEFORE UPDATE ON public.data_catalog_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_dcr_team_status ON public.data_catalog_reports(team_id, status);

-- ============ HELPER: resolve current user's team ============
CREATE OR REPLACE FUNCTION public._dc_team()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT team_id FROM public.team_members WHERE user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public._dc_require_admin(_team uuid)
RETURNS void LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF _team IS NULL THEN RAISE EXCEPTION 'No team context'; END IF;
  IF NOT public.has_role(auth.uid(), _team, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;
END $$;

-- ============ RPCS ============

-- 1
CREATE OR REPLACE FUNCTION public.create_data_catalog_workspace(p_workspace_key text, p_name text, p_workspace_type text DEFAULT 'data_catalog', p_description text DEFAULT NULL, p_default_sensitivity text DEFAULT 'internal')
RETURNS public.data_catalog_workspaces LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid := public._dc_team(); _row public.data_catalog_workspaces;
BEGIN
  PERFORM public._dc_require_admin(_team);
  INSERT INTO public.data_catalog_workspaces(team_id, workspace_key, name, workspace_type, description, default_sensitivity, created_by)
  VALUES (_team, p_workspace_key, p_name, p_workspace_type, p_description, p_default_sensitivity, auth.uid()) RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, workspace_id, event_type, title, actor_id) VALUES (_team, _row.id, 'workspace_created', p_name, auth.uid());
  RETURN _row;
END $$;

-- 2
CREATE OR REPLACE FUNCTION public.create_data_domain(p_domain_key text, p_name text, p_domain_type text DEFAULT 'business', p_description text DEFAULT NULL, p_owner_user_id uuid DEFAULT NULL, p_steward_user_id uuid DEFAULT NULL, p_parent_domain_id uuid DEFAULT NULL)
RETURNS public.data_domains LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid := public._dc_team(); _row public.data_domains;
BEGIN
  PERFORM public._dc_require_admin(_team);
  INSERT INTO public.data_domains(team_id, domain_key, name, domain_type, description, owner_user_id, steward_user_id, parent_domain_id, created_by)
  VALUES (_team, p_domain_key, p_name, p_domain_type, p_description, p_owner_user_id, p_steward_user_id, p_parent_domain_id, auth.uid()) RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, event_type, title, actor_id) VALUES (_team, 'domain_created', p_name, auth.uid());
  RETURN _row;
END $$;

-- 3
CREATE OR REPLACE FUNCTION public.register_data_asset(p_asset_key text, p_name text, p_asset_type text DEFAULT 'table', p_source_system text DEFAULT 'remotedesk', p_source_module text DEFAULT NULL, p_source_resource_type text DEFAULT NULL, p_source_resource_id uuid DEFAULT NULL, p_domain_id uuid DEFAULT NULL, p_workspace_id uuid DEFAULT NULL, p_description text DEFAULT NULL, p_sensitivity_level text DEFAULT 'internal')
RETURNS public.data_assets LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid := public._dc_team(); _row public.data_assets;
BEGIN
  PERFORM public._dc_require_admin(_team);
  INSERT INTO public.data_assets(team_id, workspace_id, domain_id, asset_key, name, description, asset_type, source_system, source_module, source_resource_type, source_resource_id, sensitivity_level, created_by)
  VALUES (_team, p_workspace_id, p_domain_id, p_asset_key, p_name, p_description, p_asset_type, p_source_system, p_source_module, p_source_resource_type, p_source_resource_id, p_sensitivity_level, auth.uid()) RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, asset_id, event_type, title, actor_id) VALUES (_team, _row.id, 'asset_registered', p_name, auth.uid());
  RETURN _row;
END $$;

-- 4
CREATE OR REPLACE FUNCTION public.register_data_asset_field(p_asset_id uuid, p_field_key text, p_name text, p_data_type text DEFAULT 'text', p_description text DEFAULT NULL, p_sensitivity_level text DEFAULT 'internal', p_pii_type text DEFAULT 'none', p_nullable boolean DEFAULT true)
RETURNS public.data_asset_fields LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _row public.data_asset_fields;
BEGIN
  SELECT team_id INTO _team FROM public.data_assets WHERE id = p_asset_id;
  PERFORM public._dc_require_admin(_team);
  INSERT INTO public.data_asset_fields(team_id, asset_id, field_key, name, data_type, description, sensitivity_level, pii_type, nullable)
  VALUES (_team, p_asset_id, p_field_key, p_name, p_data_type, p_description, p_sensitivity_level, p_pii_type, p_nullable) RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, asset_id, event_type, title, actor_id) VALUES (_team, p_asset_id, 'field_registered', p_name, auth.uid());
  RETURN _row;
END $$;

-- 5
CREATE OR REPLACE FUNCTION public.create_data_classification_rule(p_rule_key text, p_name text, p_rule_type text DEFAULT 'field_name_pattern', p_sensitivity_level text DEFAULT 'internal', p_pii_type text DEFAULT 'none', p_pattern text DEFAULT NULL, p_conditions jsonb DEFAULT '{}'::jsonb, p_enforcement_mode text DEFAULT 'suggest')
RETURNS public.data_classification_rules LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid := public._dc_team(); _row public.data_classification_rules;
BEGIN
  PERFORM public._dc_require_admin(_team);
  INSERT INTO public.data_classification_rules(team_id, rule_key, name, rule_type, sensitivity_level, pii_type, pattern, conditions, enforcement_mode, created_by)
  VALUES (_team, p_rule_key, p_name, p_rule_type, p_sensitivity_level, p_pii_type, p_pattern, p_conditions, p_enforcement_mode, auth.uid()) RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, event_type, title, actor_id) VALUES (_team, 'classification_rule_created', p_name, auth.uid());
  RETURN _row;
END $$;

-- 6
CREATE OR REPLACE FUNCTION public.run_data_classification_rules(p_asset_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid := public._dc_team(); _r record; _f record; _matches integer := 0;
BEGIN
  PERFORM public._dc_require_admin(_team);
  FOR _r IN SELECT * FROM public.data_classification_rules WHERE team_id = _team AND status='active' AND rule_type='field_name_pattern' AND pattern IS NOT NULL LOOP
    FOR _f IN SELECT f.* FROM public.data_asset_fields f WHERE f.team_id=_team AND (p_asset_id IS NULL OR f.asset_id=p_asset_id) AND f.name ~* _r.pattern LOOP
      INSERT INTO public.data_classification_findings(team_id, asset_id, field_id, rule_id, finding_type, sensitivity_level, pii_type, confidence, reason)
      VALUES (_team, _f.asset_id, _f.id, _r.id, 'sensitive_field', _r.sensitivity_level, _r.pii_type, _r.confidence, 'Field name matched pattern '||_r.pattern);
      _matches := _matches + 1;
    END LOOP;
  END LOOP;
  INSERT INTO public.data_catalog_activity_events(team_id, asset_id, event_type, title, actor_id) VALUES (_team, p_asset_id, 'classification_finding_created', 'Classification run: '||_matches||' matches', auth.uid());
  RETURN jsonb_build_object('matches', _matches, 'worker_required', false);
END $$;

-- 7
CREATE OR REPLACE FUNCTION public.review_classification_finding(p_finding_id uuid, p_status text, p_decision_note text DEFAULT NULL)
RETURNS public.data_classification_findings LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _row public.data_classification_findings;
BEGIN
  SELECT team_id INTO _team FROM public.data_classification_findings WHERE id=p_finding_id;
  PERFORM public._dc_require_admin(_team);
  UPDATE public.data_classification_findings SET status=p_status, reviewed_by=auth.uid(), reviewed_at=now(),
    evidence = evidence || jsonb_build_object('decision_note', p_decision_note)
  WHERE id=p_finding_id RETURNING * INTO _row;
  RETURN _row;
END $$;

-- 8
CREATE OR REPLACE FUNCTION public.update_asset_classification(p_asset_id uuid, p_sensitivity_level text, p_classification_status text DEFAULT 'manually_classified', p_note text DEFAULT NULL)
RETURNS public.data_assets LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _row public.data_assets;
BEGIN
  SELECT team_id INTO _team FROM public.data_assets WHERE id=p_asset_id;
  PERFORM public._dc_require_admin(_team);
  UPDATE public.data_assets SET sensitivity_level=p_sensitivity_level, classification_status=p_classification_status WHERE id=p_asset_id RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, asset_id, event_type, title, description, actor_id) VALUES (_team, p_asset_id, 'asset_certified', 'Asset classification updated', p_note, auth.uid());
  RETURN _row;
END $$;

-- 9
CREATE OR REPLACE FUNCTION public.update_field_classification(p_field_id uuid, p_sensitivity_level text, p_pii_type text DEFAULT 'none', p_classification_status text DEFAULT 'manually_classified', p_note text DEFAULT NULL)
RETURNS public.data_asset_fields LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _row public.data_asset_fields;
BEGIN
  SELECT team_id INTO _team FROM public.data_asset_fields WHERE id=p_field_id;
  PERFORM public._dc_require_admin(_team);
  UPDATE public.data_asset_fields SET sensitivity_level=p_sensitivity_level, pii_type=p_pii_type, classification_status=p_classification_status WHERE id=p_field_id RETURNING * INTO _row;
  RETURN _row;
END $$;

-- 10
CREATE OR REPLACE FUNCTION public.create_data_lineage_edge(p_source_asset_id uuid, p_target_asset_id uuid, p_lineage_type text DEFAULT 'derived_from', p_source_field_id uuid DEFAULT NULL, p_target_field_id uuid DEFAULT NULL, p_transformation_summary text DEFAULT NULL, p_confidence text DEFAULT 'medium')
RETURNS public.data_lineage_edges LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _row public.data_lineage_edges;
BEGIN
  SELECT team_id INTO _team FROM public.data_assets WHERE id=p_source_asset_id;
  PERFORM public._dc_require_admin(_team);
  INSERT INTO public.data_lineage_edges(team_id, source_asset_id, target_asset_id, lineage_type, source_field_id, target_field_id, transformation_summary, confidence, created_by)
  VALUES (_team, p_source_asset_id, p_target_asset_id, p_lineage_type, p_source_field_id, p_target_field_id, p_transformation_summary, p_confidence, auth.uid()) RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, asset_id, event_type, title, actor_id) VALUES (_team, p_source_asset_id, 'lineage_edge_created', 'Lineage edge created', auth.uid());
  RETURN _row;
END $$;

-- 11
CREATE OR REPLACE FUNCTION public.get_data_lineage_graph(p_asset_id uuid, p_direction text DEFAULT 'both', p_depth integer DEFAULT 2, p_limit integer DEFAULT 100)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _nodes jsonb; _edges jsonb;
BEGIN
  SELECT team_id INTO _team FROM public.data_assets WHERE id=p_asset_id;
  IF _team IS NULL OR NOT public.is_team_member(_team, auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  WITH RECURSIVE walk AS (
    SELECT e.*, 1 AS d FROM public.data_lineage_edges e WHERE e.team_id=_team AND (e.source_asset_id=p_asset_id OR e.target_asset_id=p_asset_id)
    UNION ALL
    SELECT e.*, w.d+1 FROM public.data_lineage_edges e JOIN walk w ON ((p_direction IN ('both','downstream') AND e.source_asset_id=w.target_asset_id) OR (p_direction IN ('both','upstream') AND e.target_asset_id=w.source_asset_id))
    WHERE w.d < p_depth AND e.team_id=_team
  ),
  lim AS (SELECT DISTINCT * FROM walk LIMIT p_limit)
  SELECT jsonb_agg(to_jsonb(l) - 'd') INTO _edges FROM lim l;
  SELECT jsonb_agg(to_jsonb(a)) INTO _nodes FROM public.data_assets a
    WHERE a.team_id=_team AND a.id IN (
      SELECT source_asset_id FROM public.data_lineage_edges WHERE team_id=_team
      UNION SELECT target_asset_id FROM public.data_lineage_edges WHERE team_id=_team UNION SELECT p_asset_id
    );
  RETURN jsonb_build_object('nodes', COALESCE(_nodes,'[]'::jsonb), 'edges', COALESCE(_edges,'[]'::jsonb));
END $$;

-- 12
CREATE OR REPLACE FUNCTION public.create_data_quality_rule(p_rule_key text, p_name text, p_asset_id uuid DEFAULT NULL, p_field_id uuid DEFAULT NULL, p_rule_type text DEFAULT 'completeness', p_description text DEFAULT NULL, p_severity text DEFAULT 'medium', p_config jsonb DEFAULT '{}'::jsonb, p_schedule_label text DEFAULT NULL)
RETURNS public.data_quality_rule_registry LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid := public._dc_team(); _row public.data_quality_rule_registry;
BEGIN
  PERFORM public._dc_require_admin(_team);
  INSERT INTO public.data_quality_rule_registry(team_id, asset_id, field_id, rule_key, name, description, rule_type, severity, config, schedule_label, created_by)
  VALUES (_team, p_asset_id, p_field_id, p_rule_key, p_name, p_description, p_rule_type, p_severity, p_config, p_schedule_label, auth.uid()) RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, asset_id, event_type, title, actor_id) VALUES (_team, p_asset_id, 'quality_rule_created', p_name, auth.uid());
  RETURN _row;
END $$;

-- 13
CREATE OR REPLACE FUNCTION public.run_data_quality_check(p_rule_id uuid, p_result_status text DEFAULT 'worker_required', p_result_summary text DEFAULT NULL, p_checked_count integer DEFAULT NULL, p_failed_count integer DEFAULT NULL, p_quality_score integer DEFAULT NULL, p_findings jsonb DEFAULT '[]'::jsonb)
RETURNS public.data_quality_check_runs LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _asset uuid; _row public.data_quality_check_runs;
BEGIN
  SELECT team_id, asset_id INTO _team, _asset FROM public.data_quality_rule_registry WHERE id=p_rule_id;
  PERFORM public._dc_require_admin(_team);
  INSERT INTO public.data_quality_check_runs(team_id, rule_id, asset_id, status, result_summary, checked_count, failed_count, quality_score, findings, started_by, finished_at)
  VALUES (_team, p_rule_id, _asset, p_result_status, p_result_summary, p_checked_count, p_failed_count, p_quality_score, p_findings, auth.uid(), CASE WHEN p_result_status IN ('passed','failed','warning','skipped') THEN now() ELSE NULL END) RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, asset_id, event_type, title, severity, actor_id) VALUES (_team, _asset, 'quality_check_run', 'Quality check '||p_result_status, CASE WHEN p_result_status='failed' THEN 'warning' ELSE 'info' END, auth.uid());
  RETURN _row;
END $$;

-- 14
CREATE OR REPLACE FUNCTION public.create_metadata_scan_job(p_scan_type text DEFAULT 'schema_scan', p_asset_id uuid DEFAULT NULL, p_workspace_id uuid DEFAULT NULL, p_provider text DEFAULT 'remotedesk_metadata', p_input jsonb DEFAULT '{}'::jsonb)
RETURNS public.metadata_scan_jobs LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid := public._dc_team(); _row public.metadata_scan_jobs; _status text;
BEGIN
  PERFORM public._dc_require_admin(_team);
  _status := CASE WHEN p_provider='remotedesk_metadata' THEN 'queued' ELSE 'worker_required' END;
  INSERT INTO public.metadata_scan_jobs(team_id, workspace_id, asset_id, scan_type, status, provider, input, requested_by)
  VALUES (_team, p_workspace_id, p_asset_id, p_scan_type, _status, p_provider, p_input, auth.uid()) RETURNING * INTO _row;
  IF _status='worker_required' THEN
    INSERT INTO public.data_catalog_activity_events(team_id, asset_id, event_type, title, severity, actor_id) VALUES (_team, p_asset_id, 'metadata_scan_worker_required', 'Scan needs external worker', 'warning', auth.uid());
  END IF;
  RETURN _row;
END $$;

-- 15
CREATE OR REPLACE FUNCTION public.complete_metadata_scan_job(p_job_id uuid, p_output jsonb DEFAULT '{}'::jsonb)
RETURNS public.metadata_scan_jobs LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _row public.metadata_scan_jobs;
BEGIN
  SELECT team_id INTO _team FROM public.metadata_scan_jobs WHERE id=p_job_id;
  PERFORM public._dc_require_admin(_team);
  UPDATE public.metadata_scan_jobs SET status='success', output=p_output, finished_at=now() WHERE id=p_job_id RETURNING * INTO _row;
  RETURN _row;
END $$;

-- 16
CREATE OR REPLACE FUNCTION public.submit_data_access_request(p_asset_id uuid DEFAULT NULL, p_field_id uuid DEFAULT NULL, p_request_type text DEFAULT 'view_access', p_purpose text DEFAULT NULL, p_business_justification text DEFAULT NULL, p_expires_at timestamptz DEFAULT NULL)
RETURNS public.data_access_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _row public.data_access_requests; _sens text;
BEGIN
  IF p_asset_id IS NOT NULL THEN SELECT team_id, sensitivity_level INTO _team, _sens FROM public.data_assets WHERE id=p_asset_id;
  ELSIF p_field_id IS NOT NULL THEN SELECT team_id, sensitivity_level INTO _team, _sens FROM public.data_asset_fields WHERE id=p_field_id;
  ELSE _team := public._dc_team(); END IF;
  IF NOT public.is_team_member(_team, auth.uid()) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  INSERT INTO public.data_access_requests(team_id, asset_id, field_id, request_type, requester_user_id, purpose, business_justification, sensitivity_level, expires_at, status)
  VALUES (_team, p_asset_id, p_field_id, p_request_type, auth.uid(), p_purpose, p_business_justification, _sens, p_expires_at, 'submitted') RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, asset_id, event_type, title, actor_id) VALUES (_team, p_asset_id, 'access_request_submitted', 'Access request submitted', auth.uid());
  RETURN _row;
END $$;

-- 17
CREATE OR REPLACE FUNCTION public.decide_data_access_request(p_request_id uuid, p_status text, p_decision_note text DEFAULT NULL)
RETURNS public.data_access_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _asset uuid; _row public.data_access_requests;
BEGIN
  SELECT team_id, asset_id INTO _team, _asset FROM public.data_access_requests WHERE id=p_request_id;
  PERFORM public._dc_require_admin(_team);
  UPDATE public.data_access_requests SET status=p_status, reviewer_user_id=auth.uid(), decision_note=p_decision_note, decided_at=now() WHERE id=p_request_id RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, asset_id, event_type, title, actor_id) VALUES (_team, _asset, CASE WHEN p_status='approved' THEN 'access_request_approved' ELSE 'access_request_submitted' END, 'Access request '||p_status, auth.uid());
  RETURN _row;
END $$;

-- 18
CREATE OR REPLACE FUNCTION public.change_data_asset_owner(p_asset_id uuid, p_new_owner_user_id uuid DEFAULT NULL, p_new_steward_user_id uuid DEFAULT NULL, p_change_reason text DEFAULT NULL)
RETURNS public.data_assets LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _prev_owner uuid; _prev_steward uuid; _row public.data_assets;
BEGIN
  SELECT team_id, owner_user_id, steward_user_id INTO _team, _prev_owner, _prev_steward FROM public.data_assets WHERE id=p_asset_id;
  PERFORM public._dc_require_admin(_team);
  UPDATE public.data_assets SET owner_user_id=COALESCE(p_new_owner_user_id,owner_user_id), steward_user_id=COALESCE(p_new_steward_user_id,steward_user_id) WHERE id=p_asset_id RETURNING * INTO _row;
  INSERT INTO public.data_asset_ownership_history(team_id, asset_id, previous_owner_user_id, new_owner_user_id, previous_steward_user_id, new_steward_user_id, change_reason, changed_by)
  VALUES (_team, p_asset_id, _prev_owner, p_new_owner_user_id, _prev_steward, p_new_steward_user_id, p_change_reason, auth.uid());
  INSERT INTO public.data_catalog_activity_events(team_id, asset_id, event_type, title, actor_id) VALUES (_team, p_asset_id, 'ownership_changed', 'Ownership changed', auth.uid());
  RETURN _row;
END $$;

-- 19
CREATE OR REPLACE FUNCTION public.certify_data_asset(p_asset_id uuid, p_certification_type text DEFAULT 'trusted', p_expires_at timestamptz DEFAULT NULL, p_notes text DEFAULT NULL, p_evidence_resource_type text DEFAULT NULL, p_evidence_resource_id uuid DEFAULT NULL)
RETURNS public.data_asset_certifications LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _row public.data_asset_certifications;
BEGIN
  SELECT team_id INTO _team FROM public.data_assets WHERE id=p_asset_id;
  PERFORM public._dc_require_admin(_team);
  INSERT INTO public.data_asset_certifications(team_id, asset_id, certification_type, certified_by, expires_at, notes, evidence_resource_type, evidence_resource_id)
  VALUES (_team, p_asset_id, p_certification_type, auth.uid(), p_expires_at, p_notes, p_evidence_resource_type, p_evidence_resource_id) RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, asset_id, event_type, title, actor_id) VALUES (_team, p_asset_id, 'asset_certified', 'Asset certified: '||p_certification_type, auth.uid());
  RETURN _row;
END $$;

-- 20
CREATE OR REPLACE FUNCTION public.create_glossary_collection(p_collection_key text, p_name text, p_description text DEFAULT NULL)
RETURNS public.business_glossary_collections LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid := public._dc_team(); _row public.business_glossary_collections;
BEGIN
  PERFORM public._dc_require_admin(_team);
  INSERT INTO public.business_glossary_collections(team_id, collection_key, name, description, created_by) VALUES (_team, p_collection_key, p_name, p_description, auth.uid()) RETURNING * INTO _row;
  RETURN _row;
END $$;

-- 21
CREATE OR REPLACE FUNCTION public.create_business_glossary_term(p_term_key text, p_name text, p_definition text, p_term_type text DEFAULT 'business_metric', p_collection_id uuid DEFAULT NULL, p_synonyms text[] DEFAULT '{}')
RETURNS public.business_glossary_terms LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid := public._dc_team(); _row public.business_glossary_terms;
BEGIN
  PERFORM public._dc_require_admin(_team);
  INSERT INTO public.business_glossary_terms(team_id, collection_id, term_key, name, definition, term_type, synonyms, created_by) VALUES (_team, p_collection_id, p_term_key, p_name, p_definition, p_term_type, p_synonyms, auth.uid()) RETURNING * INTO _row;
  RETURN _row;
END $$;

-- 22
CREATE OR REPLACE FUNCTION public.approve_business_glossary_term(p_term_id uuid, p_decision_note text DEFAULT NULL)
RETURNS public.business_glossary_terms LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _row public.business_glossary_terms;
BEGIN
  SELECT team_id INTO _team FROM public.business_glossary_terms WHERE id=p_term_id;
  PERFORM public._dc_require_admin(_team);
  UPDATE public.business_glossary_terms SET status='approved', approved_by=auth.uid(), approved_at=now(), metadata = metadata || jsonb_build_object('decision_note', p_decision_note) WHERE id=p_term_id RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, event_type, title, actor_id) VALUES (_team, 'glossary_term_approved', _row.name, auth.uid());
  RETURN _row;
END $$;

-- 23
CREATE OR REPLACE FUNCTION public.link_field_to_glossary_term(p_field_id uuid, p_term_id uuid)
RETURNS public.data_asset_fields LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _row public.data_asset_fields;
BEGIN
  SELECT team_id INTO _team FROM public.data_asset_fields WHERE id=p_field_id;
  PERFORM public._dc_require_admin(_team);
  UPDATE public.data_asset_fields SET glossary_term_id=p_term_id WHERE id=p_field_id RETURNING * INTO _row;
  RETURN _row;
END $$;

-- 24
CREATE OR REPLACE FUNCTION public.record_schema_change_event(p_change_type text, p_title text, p_asset_id uuid DEFAULT NULL, p_description text DEFAULT NULL, p_before_snapshot jsonb DEFAULT '{}'::jsonb, p_after_snapshot jsonb DEFAULT '{}'::jsonb, p_severity text DEFAULT 'info')
RETURNS public.schema_change_events LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _row public.schema_change_events;
BEGIN
  IF p_asset_id IS NOT NULL THEN SELECT team_id INTO _team FROM public.data_assets WHERE id=p_asset_id;
  ELSE _team := public._dc_team(); END IF;
  PERFORM public._dc_require_admin(_team);
  INSERT INTO public.schema_change_events(team_id, asset_id, change_type, title, description, before_snapshot, after_snapshot, severity)
  VALUES (_team, p_asset_id, p_change_type, p_title, p_description, p_before_snapshot, p_after_snapshot, p_severity) RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, asset_id, event_type, title, severity, actor_id) VALUES (_team, p_asset_id, 'schema_change_detected', p_title, p_severity, auth.uid());
  RETURN _row;
END $$;

-- 25
CREATE OR REPLACE FUNCTION public.review_schema_change_event(p_schema_change_event_id uuid, p_note text DEFAULT NULL)
RETURNS public.schema_change_events LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _row public.schema_change_events;
BEGIN
  SELECT team_id INTO _team FROM public.schema_change_events WHERE id=p_schema_change_event_id;
  PERFORM public._dc_require_admin(_team);
  UPDATE public.schema_change_events SET reviewed=true, reviewed_by=auth.uid(), reviewed_at=now(), description=COALESCE(p_note, description) WHERE id=p_schema_change_event_id RETURNING * INTO _row;
  RETURN _row;
END $$;

-- 26
CREATE OR REPLACE FUNCTION public.link_data_asset_to_policy(p_asset_id uuid, p_policy_type text DEFAULT 'retention', p_policy_resource_type text DEFAULT NULL, p_policy_resource_id uuid DEFAULT NULL, p_notes text DEFAULT NULL)
RETURNS public.data_governance_policy_links LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _row public.data_governance_policy_links;
BEGIN
  SELECT team_id INTO _team FROM public.data_assets WHERE id=p_asset_id;
  PERFORM public._dc_require_admin(_team);
  INSERT INTO public.data_governance_policy_links(team_id, asset_id, policy_type, policy_resource_type, policy_resource_id, notes, created_by)
  VALUES (_team, p_asset_id, p_policy_type, p_policy_resource_type, p_policy_resource_id, p_notes, auth.uid()) RETURNING * INTO _row;
  INSERT INTO public.data_catalog_activity_events(team_id, asset_id, event_type, title, actor_id) VALUES (_team, p_asset_id, 'governance_policy_linked', 'Policy linked: '||p_policy_type, auth.uid());
  RETURN _row;
END $$;

-- 27
CREATE OR REPLACE FUNCTION public.get_data_catalog_summary()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid := public._dc_team(); _r jsonb;
BEGIN
  IF _team IS NULL THEN RETURN '{}'::jsonb; END IF;
  SELECT jsonb_build_object(
    'total_assets',           (SELECT count(*) FROM public.data_assets WHERE team_id=_team),
    'active_assets',          (SELECT count(*) FROM public.data_assets WHERE team_id=_team AND status='active'),
    'restricted_assets',      (SELECT count(*) FROM public.data_assets WHERE team_id=_team AND sensitivity_level='restricted'),
    'unclassified_assets',    (SELECT count(*) FROM public.data_assets WHERE team_id=_team AND classification_status='not_classified'),
    'total_fields',           (SELECT count(*) FROM public.data_asset_fields WHERE team_id=_team),
    'pii_fields',             (SELECT count(*) FROM public.data_asset_fields WHERE team_id=_team AND pii_type<>'none'),
    'lineage_edges',          (SELECT count(*) FROM public.data_lineage_edges WHERE team_id=_team AND status='active'),
    'quality_rules_active',   (SELECT count(*) FROM public.data_quality_rule_registry WHERE team_id=_team AND status='active'),
    'quality_checks_failed_7d',(SELECT count(*) FROM public.data_quality_check_runs WHERE team_id=_team AND status='failed' AND started_at > now() - interval '7 days'),
    'metadata_scan_worker_required',(SELECT count(*) FROM public.metadata_scan_jobs WHERE team_id=_team AND status='worker_required'),
    'access_requests_pending',(SELECT count(*) FROM public.data_access_requests WHERE team_id=_team AND status IN ('submitted','pending_approval')),
    'glossary_terms_approved',(SELECT count(*) FROM public.business_glossary_terms WHERE team_id=_team AND status='approved'),
    'schema_changes_unreviewed',(SELECT count(*) FROM public.schema_change_events WHERE team_id=_team AND reviewed=false),
    'latest_catalog_event_at',(SELECT max(created_at) FROM public.data_catalog_activity_events WHERE team_id=_team)
  ) INTO _r;
  RETURN _r;
END $$;

-- 28
CREATE OR REPLACE FUNCTION public.create_data_catalog_report(p_report_type text, p_title text, p_filters jsonb DEFAULT '{}'::jsonb)
RETURNS public.data_catalog_reports LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid := public._dc_team(); _row public.data_catalog_reports;
BEGIN
  PERFORM public._dc_require_admin(_team);
  INSERT INTO public.data_catalog_reports(team_id, report_type, title, filters, requested_by, status) VALUES (_team, p_report_type, p_title, p_filters, auth.uid(), 'queued') RETURNING * INTO _row;
  RETURN _row;
END $$;

-- 29
CREATE OR REPLACE FUNCTION public.process_data_catalog_report(p_report_id uuid)
RETURNS public.data_catalog_reports LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE _team uuid; _row public.data_catalog_reports; _output jsonb;
BEGIN
  SELECT team_id INTO _team FROM public.data_catalog_reports WHERE id=p_report_id;
  PERFORM public._dc_require_admin(_team);
  _output := public.get_data_catalog_summary();
  UPDATE public.data_catalog_reports SET status='success', output=_output WHERE id=p_report_id RETURNING * INTO _row;
  RETURN _row;
END $$;

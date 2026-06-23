-- Task #35 Phase 2: Marketplace RPCs
CREATE OR REPLACE FUNCTION public.create_marketplace_publisher(
  _team_id uuid, _name text, _publisher_type text DEFAULT 'internal',
  _description text DEFAULT NULL, _website_url text DEFAULT NULL,
  _support_email text DEFAULT NULL, _logo_url text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _key text;
BEGIN
  IF NOT public.is_marketplace_admin(auth.uid(), _team_id) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  _key := 'pub_' || encode(gen_random_bytes(8), 'hex');
  INSERT INTO public.marketplace_publishers
    (team_id, publisher_key, name, publisher_type, description, website_url,
     support_email, logo_url, created_by, status)
  VALUES (_team_id, _key, _name, _publisher_type, _description, _website_url,
          _support_email, _logo_url, auth.uid(), 'draft') RETURNING id INTO _id;
  INSERT INTO public.marketplace_audit_events(team_id, publisher_id, actor_user_id, event_type, payload)
    VALUES (_team_id, _id, auth.uid(), 'publisher.created', jsonb_build_object('name', _name));
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.submit_marketplace_publisher_for_review(_publisher_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _team uuid;
BEGIN
  SELECT team_id INTO _team FROM public.marketplace_publishers WHERE id = _publisher_id;
  IF _team IS NULL OR NOT public.is_marketplace_admin(auth.uid(), _team) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  UPDATE public.marketplace_publishers
    SET status = 'pending_review', verification_status = 'in_progress', updated_at = now()
    WHERE id = _publisher_id AND status IN ('draft','rejected');
  INSERT INTO public.marketplace_audit_events(team_id, publisher_id, actor_user_id, event_type)
    VALUES (_team, _publisher_id, auth.uid(), 'publisher.submitted');
END $$;

CREATE OR REPLACE FUNCTION public.approve_marketplace_publisher(_publisher_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _team uuid;
BEGIN
  SELECT team_id INTO _team FROM public.marketplace_publishers WHERE id = _publisher_id;
  IF _team IS NULL OR NOT public.is_marketplace_admin(auth.uid(), _team) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  UPDATE public.marketplace_publishers
    SET status = 'approved', verification_status = 'verified',
        approved_by = auth.uid(), approved_at = now(), updated_at = now()
    WHERE id = _publisher_id;
  INSERT INTO public.marketplace_audit_events(team_id, publisher_id, actor_user_id, event_type)
    VALUES (_team, _publisher_id, auth.uid(), 'publisher.approved');
END $$;

CREATE OR REPLACE FUNCTION public.create_marketplace_listing(
  _publisher_id uuid, _name text, _category text DEFAULT 'productivity',
  _listing_type text DEFAULT 'integration', _short_description text DEFAULT NULL,
  _pricing_model text DEFAULT 'free', _base_price_cents int DEFAULT 0
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _team uuid; _key text;
BEGIN
  SELECT team_id INTO _team FROM public.marketplace_publishers WHERE id = _publisher_id;
  IF _team IS NULL OR NOT public.is_marketplace_admin(auth.uid(), _team) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  _key := 'lst_' || encode(gen_random_bytes(8), 'hex');
  INSERT INTO public.marketplace_listings
    (publisher_id, team_id, listing_key, name, category, listing_type,
     short_description, pricing_model, base_price_cents, status, created_by)
  VALUES (_publisher_id, _team, _key, _name, _category, _listing_type,
          _short_description, _pricing_model, _base_price_cents, 'draft', auth.uid())
  RETURNING id INTO _id;
  INSERT INTO public.marketplace_audit_events(team_id, listing_id, actor_user_id, event_type, payload)
    VALUES (_team, _id, auth.uid(), 'listing.created', jsonb_build_object('name', _name));
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.submit_marketplace_listing_for_review(_listing_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _team uuid; _req uuid;
BEGIN
  SELECT team_id INTO _team FROM public.marketplace_listings WHERE id = _listing_id;
  IF _team IS NULL OR NOT public.is_marketplace_admin(auth.uid(), _team) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  UPDATE public.marketplace_listings SET status = 'pending_review', updated_at = now()
    WHERE id = _listing_id AND status IN ('draft','changes_requested','rejected');
  INSERT INTO public.marketplace_review_requests(listing_id, team_id, requested_by, status)
    VALUES (_listing_id, _team, auth.uid(), 'pending') RETURNING id INTO _req;
  INSERT INTO public.marketplace_audit_events(team_id, listing_id, actor_user_id, event_type)
    VALUES (_team, _listing_id, auth.uid(), 'listing.submitted');
  RETURN _req;
END $$;

CREATE OR REPLACE FUNCTION public.review_marketplace_listing(
  _listing_id uuid, _decision text, _notes text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _team uuid; _new_status text;
BEGIN
  SELECT team_id INTO _team FROM public.marketplace_listings WHERE id = _listing_id;
  IF _team IS NULL OR NOT public.is_marketplace_admin(auth.uid(), _team) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  IF _decision NOT IN ('approved','changes_requested','rejected') THEN
    RAISE EXCEPTION 'invalid decision'; END IF;
  _new_status := CASE _decision WHEN 'approved' THEN 'approved'
    WHEN 'changes_requested' THEN 'changes_requested' ELSE 'rejected' END;
  UPDATE public.marketplace_listings SET status = _new_status, updated_at = now()
    WHERE id = _listing_id;
  UPDATE public.marketplace_review_requests
    SET status = _decision, reviewer_user_id = auth.uid(),
        reviewer_notes = _notes, reviewed_at = now()
    WHERE listing_id = _listing_id AND status = 'pending';
  INSERT INTO public.marketplace_audit_events(team_id, listing_id, actor_user_id, event_type, payload)
    VALUES (_team, _listing_id, auth.uid(), 'listing.reviewed',
            jsonb_build_object('decision', _decision, 'notes', _notes));
END $$;

CREATE OR REPLACE FUNCTION public.publish_marketplace_listing(_listing_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _team uuid; _status text;
BEGIN
  SELECT team_id, status INTO _team, _status FROM public.marketplace_listings WHERE id = _listing_id;
  IF _team IS NULL OR NOT public.is_marketplace_admin(auth.uid(), _team) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  IF _status <> 'approved' THEN
    RAISE EXCEPTION 'listing must be approved before publishing'; END IF;
  UPDATE public.marketplace_listings
    SET status = 'published', published_at = now(), updated_at = now()
    WHERE id = _listing_id;
  INSERT INTO public.marketplace_audit_events(team_id, listing_id, actor_user_id, event_type)
    VALUES (_team, _listing_id, auth.uid(), 'listing.published');
END $$;

CREATE OR REPLACE FUNCTION public.unpublish_marketplace_listing(_listing_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _team uuid;
BEGIN
  SELECT team_id INTO _team FROM public.marketplace_listings WHERE id = _listing_id;
  IF _team IS NULL OR NOT public.is_marketplace_admin(auth.uid(), _team) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  UPDATE public.marketplace_listings SET status = 'unpublished', updated_at = now()
    WHERE id = _listing_id;
  INSERT INTO public.marketplace_audit_events(team_id, listing_id, actor_user_id, event_type)
    VALUES (_team, _listing_id, auth.uid(), 'listing.unpublished');
END $$;

CREATE OR REPLACE FUNCTION public.create_marketplace_purchase(
  _listing_id uuid, _buyer_team_id uuid, _plan_id uuid DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _listing record; _state text; _amount int;
BEGIN
  IF NOT public.is_team_member(_buyer_team_id, auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  SELECT * INTO _listing FROM public.marketplace_listings WHERE id = _listing_id;
  IF _listing IS NULL OR _listing.status <> 'published' THEN
    RAISE EXCEPTION 'listing not available'; END IF;
  _amount := COALESCE(
    (SELECT price_cents FROM public.marketplace_pricing_plans WHERE id = _plan_id),
    _listing.base_price_cents);
  _state := CASE WHEN _listing.pricing_model = 'free' OR _amount = 0
                 THEN 'completed' ELSE 'provider_required' END;
  INSERT INTO public.marketplace_purchases
    (listing_id, plan_id, buyer_team_id, buyer_user_id, amount_cents, currency, status, provider)
  VALUES (_listing_id, _plan_id, _buyer_team_id, auth.uid(), _amount, _listing.currency, _state, 'stripe')
  RETURNING id INTO _id;
  INSERT INTO public.marketplace_audit_events(team_id, listing_id, actor_user_id, event_type, payload)
    VALUES (_buyer_team_id, _listing_id, auth.uid(), 'purchase.created',
            jsonb_build_object('purchase_id', _id, 'state', _state));
  RETURN jsonb_build_object('purchase_id', _id, 'status', _state,
    'amount_cents', _amount, 'currency', _listing.currency,
    'requires_provider', _state = 'provider_required');
END $$;

CREATE OR REPLACE FUNCTION public.install_marketplace_listing(
  _listing_id uuid, _team_id uuid
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _listing record; _state text;
BEGIN
  IF NOT public.is_team_member(_team_id, auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  SELECT * INTO _listing FROM public.marketplace_listings WHERE id = _listing_id;
  IF _listing IS NULL OR _listing.status <> 'published' THEN
    RAISE EXCEPTION 'listing not available'; END IF;
  _state := CASE _listing.install_mode WHEN 'metadata_only' THEN 'installed'
    ELSE 'worker_required' END;
  INSERT INTO public.marketplace_installations
    (listing_id, team_id, installed_by, status, install_mode)
  VALUES (_listing_id, _team_id, auth.uid(), _state, _listing.install_mode)
  RETURNING id INTO _id;
  INSERT INTO public.marketplace_installation_events(installation_id, event_type, payload)
    VALUES (_id, 'install.requested', jsonb_build_object('state', _state));
  INSERT INTO public.marketplace_audit_events(team_id, listing_id, actor_user_id, event_type, payload)
    VALUES (_team_id, _listing_id, auth.uid(), 'installation.created',
            jsonb_build_object('installation_id', _id, 'state', _state));
  RETURN jsonb_build_object('installation_id', _id, 'status', _state,
    'requires_worker', _state = 'worker_required');
END $$;

CREATE OR REPLACE FUNCTION public.uninstall_marketplace_listing(_installation_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _team uuid;
BEGIN
  SELECT team_id INTO _team FROM public.marketplace_installations WHERE id = _installation_id;
  IF _team IS NULL OR NOT public.is_team_member(_team, auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  UPDATE public.marketplace_installations
    SET status = 'uninstalled', uninstalled_at = now(), updated_at = now()
    WHERE id = _installation_id;
  INSERT INTO public.marketplace_installation_events(installation_id, event_type)
    VALUES (_installation_id, 'install.removed');
END $$;

CREATE OR REPLACE FUNCTION public.record_marketplace_usage(
  _installation_id uuid, _metric text, _quantity numeric, _unit text DEFAULT 'count'
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _team uuid;
BEGIN
  SELECT team_id INTO _team FROM public.marketplace_installations WHERE id = _installation_id;
  IF _team IS NULL OR NOT public.is_team_member(_team, auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  INSERT INTO public.marketplace_usage_records(installation_id, team_id, metric, quantity, unit, recorded_by)
    VALUES (_installation_id, _team, _metric, _quantity, _unit, auth.uid())
    RETURNING id INTO _id;
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.estimate_marketplace_revenue_share(_purchase_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _p record; _platform int; _publisher int; _team uuid;
BEGIN
  SELECT p.*, l.team_id AS publisher_team FROM public.marketplace_purchases p
    JOIN public.marketplace_listings l ON l.id = p.listing_id
    WHERE p.id = _purchase_id INTO _p;
  IF _p IS NULL THEN RAISE EXCEPTION 'purchase not found'; END IF;
  _team := _p.publisher_team;
  IF NOT public.is_marketplace_admin(auth.uid(), _team)
     AND NOT public.is_team_member(_p.buyer_team_id, auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  _publisher := (_p.amount_cents * 70) / 100;
  _platform := _p.amount_cents - _publisher;
  INSERT INTO public.marketplace_revenue_ledger
    (purchase_id, publisher_team_id, gross_cents, platform_cents, publisher_cents, currency, status)
  VALUES (_purchase_id, _team, _p.amount_cents, _platform, _publisher, _p.currency, 'estimated')
  ON CONFLICT DO NOTHING;
  RETURN jsonb_build_object('gross_cents', _p.amount_cents,
    'platform_cents', _platform, 'publisher_cents', _publisher,
    'currency', _p.currency, 'split', '70/30');
END $$;

CREATE OR REPLACE FUNCTION public.create_marketplace_payout_batch(
  _team_id uuid, _period_start date, _period_end date
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; _total int;
BEGIN
  IF NOT public.is_marketplace_admin(auth.uid(), _team_id) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  SELECT COALESCE(SUM(publisher_cents), 0) INTO _total
    FROM public.marketplace_revenue_ledger
    WHERE publisher_team_id = _team_id AND status = 'estimated';
  INSERT INTO public.marketplace_payout_batches
    (publisher_team_id, period_start, period_end, total_cents, currency, status, provider)
  VALUES (_team_id, _period_start, _period_end, _total, 'usd', 'provider_required', 'stripe')
  RETURNING id INTO _id;
  INSERT INTO public.marketplace_audit_events(team_id, actor_user_id, event_type, payload)
    VALUES (_team_id, auth.uid(), 'payout.batch.created',
            jsonb_build_object('batch_id', _id, 'total_cents', _total));
  RETURN jsonb_build_object('batch_id', _id, 'total_cents', _total,
    'status', 'provider_required', 'requires_provider', true);
END $$;

CREATE OR REPLACE FUNCTION public.get_marketplace_summary(_team_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE _r jsonb;
BEGIN
  IF NOT public.is_team_member(_team_id, auth.uid()) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501'; END IF;
  SELECT jsonb_build_object(
    'publishers', (SELECT COUNT(*) FROM public.marketplace_publishers WHERE team_id = _team_id),
    'listings_total', (SELECT COUNT(*) FROM public.marketplace_listings WHERE team_id = _team_id),
    'listings_published', (SELECT COUNT(*) FROM public.marketplace_listings WHERE team_id = _team_id AND status = 'published'),
    'listings_pending', (SELECT COUNT(*) FROM public.marketplace_listings WHERE team_id = _team_id AND status = 'pending_review'),
    'installations_active', (SELECT COUNT(*) FROM public.marketplace_installations WHERE team_id = _team_id AND status IN ('installed','worker_required')),
    'purchases_30d', (SELECT COUNT(*) FROM public.marketplace_purchases WHERE buyer_team_id = _team_id AND created_at > now() - interval '30 days'),
    'gross_30d_cents', (SELECT COALESCE(SUM(gross_cents),0) FROM public.marketplace_revenue_ledger WHERE publisher_team_id = _team_id AND created_at > now() - interval '30 days'),
    'publisher_30d_cents', (SELECT COALESCE(SUM(publisher_cents),0) FROM public.marketplace_revenue_ledger WHERE publisher_team_id = _team_id AND created_at > now() - interval '30 days'),
    'pending_payout_cents', (SELECT COALESCE(SUM(publisher_cents),0) FROM public.marketplace_revenue_ledger WHERE publisher_team_id = _team_id AND status = 'estimated')
  ) INTO _r;
  RETURN _r;
END $$;
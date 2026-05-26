-- ================================================
-- [3/4] RLS 활성화 & 정책 (profiles, matches, applications)
-- 02_indexes.sql 실행 완료 후 이 파일 실행
-- ================================================

-- profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- matches RLS
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matches_select" ON matches;
DROP POLICY IF EXISTS "matches_insert" ON matches;
DROP POLICY IF EXISTS "matches_update" ON matches;
DROP POLICY IF EXISTS "matches_delete" ON matches;

CREATE POLICY "matches_select" ON matches
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "matches_insert" ON matches
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "matches_update" ON matches
  FOR UPDATE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "matches_delete" ON matches
  FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- match_applications RLS
ALTER TABLE match_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "applications_select" ON match_applications;
DROP POLICY IF EXISTS "applications_insert" ON match_applications;
DROP POLICY IF EXISTS "applications_update" ON match_applications;

CREATE POLICY "applications_select" ON match_applications
  FOR SELECT TO authenticated
  USING (
    applicant_id = auth.uid() OR
    match_id IN (SELECT id FROM matches WHERE author_id = auth.uid())
  );

CREATE POLICY "applications_insert" ON match_applications
  FOR INSERT TO authenticated
  WITH CHECK (applicant_id = auth.uid());

CREATE POLICY "applications_update" ON match_applications
  FOR UPDATE TO authenticated
  USING (
    match_id IN (SELECT id FROM matches WHERE author_id = auth.uid())
  );

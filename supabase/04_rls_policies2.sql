-- ================================================
-- [4/4] RLS 정책 (message_rooms, messages, reviews, notifications)
-- 03_rls_policies.sql 실행 완료 후 이 파일 실행
-- ================================================

-- message_rooms RLS
ALTER TABLE message_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rooms_select" ON message_rooms;
DROP POLICY IF EXISTS "rooms_insert" ON message_rooms;

CREATE POLICY "rooms_select" ON message_rooms
  FOR SELECT TO authenticated
  USING (participant_1 = auth.uid() OR participant_2 = auth.uid());

CREATE POLICY "rooms_insert" ON message_rooms
  FOR INSERT TO authenticated WITH CHECK (true);

-- messages RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select" ON messages;
DROP POLICY IF EXISTS "messages_insert" ON messages;
DROP POLICY IF EXISTS "messages_update" ON messages;

CREATE POLICY "messages_select" ON messages
  FOR SELECT TO authenticated
  USING (
    room_id IN (
      SELECT id FROM message_rooms
      WHERE participant_1 = auth.uid() OR participant_2 = auth.uid()
    )
  );

CREATE POLICY "messages_insert" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    room_id IN (
      SELECT id FROM message_rooms
      WHERE participant_1 = auth.uid() OR participant_2 = auth.uid()
    )
  );

CREATE POLICY "messages_update" ON messages
  FOR UPDATE TO authenticated
  USING (
    room_id IN (
      SELECT id FROM message_rooms
      WHERE participant_1 = auth.uid() OR participant_2 = auth.uid()
    )
  );

-- reviews RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_select" ON reviews;
DROP POLICY IF EXISTS "reviews_insert" ON reviews;

CREATE POLICY "reviews_select" ON reviews
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "reviews_insert" ON reviews
  FOR INSERT TO authenticated WITH CHECK (reviewer_id = auth.uid());

-- notifications RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select" ON notifications;
DROP POLICY IF EXISTS "notifications_update" ON notifications;
DROP POLICY IF EXISTS "notifications_insert" ON notifications;

CREATE POLICY "notifications_select" ON notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "notifications_insert" ON notifications
  FOR INSERT TO authenticated WITH CHECK (true);

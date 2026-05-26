-- matches 테이블에 location(장소) 컬럼 추가
-- Supabase SQL Editor에서 실행하세요

ALTER TABLE matches
ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT '';

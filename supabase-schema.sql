-- ==========================================
-- 止觀書架 예약 시스템 - Supabase SQL 스키마
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- ==========================================

-- 1. profiles 테이블 (사용자 프로필)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'creator', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. locations 테이블 (지관서가 위치)
CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT ''
);

-- 3. activities 테이블 (활동/행사)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  activity_type TEXT NOT NULL CHECK (activity_type IN ('lecture', 'reading_group', 'humanities')),
  location_id INTEGER NOT NULL REFERENCES locations(id),
  creator_id UUID NOT NULL REFERENCES profiles(id),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  max_participants INTEGER NOT NULL DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. reservations 테이블 (예약)
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, user_id, status)
);

-- ==========================================
-- 인덱스
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_activities_location ON activities(location_id);
CREATE INDEX IF NOT EXISTS idx_activities_creator ON activities(creator_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_start_date ON activities(start_date);
CREATE INDEX IF NOT EXISTS idx_reservations_activity ON reservations(activity_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

-- ==========================================
-- RLS (Row Level Security) 정책
-- ==========================================

-- profiles: 누구나 읽기 가능, 본인만 수정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (
    auth.uid() = id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- locations: 누구나 읽기 가능
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "locations_select" ON locations
  FOR SELECT USING (true);

CREATE POLICY "locations_insert" ON locations
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "locations_delete" ON locations
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- activities: 누구나 읽기, creator/admin만 생성, 본인/admin만 수정
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select" ON activities
  FOR SELECT USING (true);

CREATE POLICY "activities_insert" ON activities
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('creator', 'admin'))
  );

CREATE POLICY "activities_update" ON activities
  FOR UPDATE USING (
    creator_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 삭제는 관리자만 가능 (creator는 취소만 가능, 삭제는 불가)
CREATE POLICY "activities_delete" ON activities
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- reservations: 본인 것만 읽기/생성, 활동 주최자/admin도 읽기 가능
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reservations_select" ON reservations
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM activities a WHERE a.id = activity_id AND a.creator_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "reservations_insert" ON reservations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reservations_update" ON reservations
  FOR UPDATE USING (user_id = auth.uid());

-- ==========================================
-- 초기 위치 데이터 시드
-- ==========================================
INSERT INTO locations (id, name, city, address) VALUES
  (1, '울산대공원', '울산', '울산시 남구 대공원로 94'),
  (2, '장생포', '울산', '울산시 남구 장생포고래로 110'),
  (3, '선암호수공원', '울산', '울산시 남구 선암호수길 150'),
  (4, 'UNIST', '울산', '울산시 울주군 UNIST길 50'),
  (5, '울산시립미술관', '울산', '울산시 남구 두왕로 235'),
  (6, '괴테마을', '울산', '울산시 북구 괴테마을길'),
  (7, '박상진호수공원', '울산', '울산시 울주군 상북면'),
  (8, '부산', '부산', '부산시'),
  (9, '울진 금강송숲', '울진', '경북 울진군 금강송면'),
  (10, '경주', '경주', '경주시'),
  (11, '평택 달보드레센터', '평택', '경기도 평택시')
ON CONFLICT (id) DO NOTHING;

-- 시퀀스 업데이트
SELECT setval('locations_id_seq', 11, true);

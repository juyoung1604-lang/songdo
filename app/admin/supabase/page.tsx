// app/admin/supabase/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DB, supabase } from '@/lib/supabase';
import { useToast } from '@/components/admin/Toast';

const SupabasePage = () => {
  const [queue, setQueue] = useState<any[]>([]);
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [config, setConfig] = useState({
    url: '',
    key: ''
  });

  useEffect(() => {
    setQueue(DB.getQueue());
    setConfig({
      url: localStorage.getItem('supa_url') || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      key: localStorage.getItem('supa_anon_key') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    });
  }, []);

  const handleSaveConfig = () => {
    localStorage.setItem('supa_url', config.url);
    localStorage.setItem('supa_anon_key', config.key);
    toast('설정이 저장되었습니다. 페이지를 새로고침하여 반영하세요.', 'jade');
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleSync = async () => {
    if (!window.navigator.onLine) {
      toast('오프라인 상태입니다. 인터넷 연결을 확인하세요.', 'rose');
      return;
    }
    if (queue.length === 0) {
      toast('동기화할 항목이 없습니다.', 'sky');
      return;
    }

    setSyncing(true);
    let successCount = 0;
    const q = [...queue];

    for (const op of q) {
      try {
        let error;
        if (op.type === 'INSERT') {
          const res = await supabase.from(op.table).insert([op.payload]);
          error = res.error;
        } else if (op.type === 'UPDATE') {
          const res = await supabase.from(op.table).update(op.payload).eq('id', op.id);
          error = res.error;
        } else if (op.type === 'DELETE') {
          const res = await supabase.from(op.table).delete().eq('id', op.id);
          error = res.error;
        }

        if (!error) {
          successCount++;
        }
      } catch (e) {
        console.error('Sync error:', e);
      }
    }

    DB.clearQueue();
    setQueue([]);
    setSyncing(false);
    toast(`${successCount}건 동기화 완료`, 'jade');
  };

  const handleTestConnection = async () => {
    try {
      const { error } = await supabase.from('buskers').select('id').limit(1);
      if (error) throw error;
      toast('Supabase 연결 성공!', 'jade');
    } catch (e: any) {
      toast('연결 실패: ' + e.message, 'rose');
    }
  };

  const handleSeedData = async () => {
    if (!confirm('실제 데이터베이스에 샘플 데이터를 생성할까요? (중복 생성될 수 있습니다)')) return;
    try {
      await DB.seedData();
      toast('샘플 데이터 생성 완료! 페이지를 새로고침하세요.', 'jade');
    } catch (e: any) {
      toast('생성 실패: ' + e.message, 'rose');
    }
  };

  const schema = `-- =====================================================
-- 송도 버스킹 관리시스템 스키마 v4.0
-- 현재 프론트엔드 코드 기준 정합 스키마
-- Supabase SQL Editor에 그대로 붙여넣어 실행
-- =====================================================

create extension if not exists pgcrypto;

-- 0. 관리자 프로필
create table if not exists admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'operator' check (role in ('super_admin', 'admin', 'operator')),
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 1. 버스커 신청
create table if not exists buskers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  team text,
  genre text not null,
  phone text,
  email text,
  event_date date,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'refunded')),
  fee integer not null default 50000,
  payment_method text default '계좌이체',
  note text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table buskers add column if not exists team text;
alter table buskers add column if not exists genre text;
alter table buskers add column if not exists phone text;
alter table buskers add column if not exists email text;
alter table buskers add column if not exists event_date date;
alter table buskers add column if not exists status text default 'pending';
alter table buskers add column if not exists fee integer default 50000;
alter table buskers add column if not exists payment_method text default '계좌이체';
alter table buskers add column if not exists note text;
alter table buskers add column if not exists applied_at timestamptz default now();
alter table buskers add column if not exists updated_at timestamptz default now();

-- 2. 셀러 신청
create table if not exists sellers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  booths integer not null default 1,
  fee integer not null default 30000,
  phone text,
  email text,
  event_date date,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'paid', 'refunded')),
  payment_method text default '계좌이체',
  note text,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table sellers add column if not exists category text;
alter table sellers add column if not exists booths integer default 1;
alter table sellers add column if not exists fee integer default 30000;
alter table sellers add column if not exists phone text;
alter table sellers add column if not exists email text;
alter table sellers add column if not exists event_date date;
alter table sellers add column if not exists status text default 'pending';
alter table sellers add column if not exists payment_method text default '계좌이체';
alter table sellers add column if not exists note text;
alter table sellers add column if not exists applied_at timestamptz default now();
alter table sellers add column if not exists updated_at timestamptz default now();

-- 3. 통합 인력 풀
create table if not exists busker_pool (
  id text primary key,
  name text not null,
  team text,
  genre text,
  phone text,
  email text,
  app_count integer not null default 1,
  note text,
  created_at timestamptz not null default now(),
  last_applied_at timestamptz not null default now()
);

create table if not exists seller_pool (
  id text primary key,
  name text not null,
  category text,
  phone text,
  email text,
  app_count integer not null default 1,
  note text,
  created_at timestamptz not null default now(),
  last_applied_at timestamptz not null default now()
);

-- 4. 행사 캘린더
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  busker_count integer not null default 0,
  seller_count integer not null default 0,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table events add column if not exists updated_at timestamptz default now();

-- 5. 홈페이지 팝업
create table if not exists homepage_popups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  content text,
  link_url text,
  button_label text default '자세히 보기',
  start_date date,
  end_date date,
  popup_size text default 'md' check (popup_size in ('sm', 'md', 'lg')),
  popup_width_px integer,
  popup_height_px integer,
  is_active boolean not null default true,
  open_in_new_tab boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. 매출/정산 (선택 사용)
create table if not exists revenue (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  type text,
  name text,
  item text,
  amount integer not null default 0,
  method text,
  status text not null default 'unpaid' check (status in ('paid', 'unpaid', 'refunded')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table revenue add column if not exists created_at timestamptz default now();
alter table revenue add column if not exists updated_at timestamptz default now();

-- 7. 이미지 관리
create table if not exists images (
  id text primary key,
  section text not null,
  url text not null,
  alt text,
  caption text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table images add column if not exists caption text;
alter table images add column if not exists updated_at timestamptz default now();

-- 8. 관리자 로그
create table if not exists admin_logs (
  id text primary key,
  type text,
  color text,
  title text not null,
  "desc" text,
  created_at timestamptz not null default now()
);

-- 인덱스
create index if not exists idx_buskers_event_date on buskers(event_date);
create index if not exists idx_buskers_status on buskers(status);
create index if not exists idx_sellers_event_date on sellers(event_date);
create index if not exists idx_sellers_status on sellers(status);
create index if not exists idx_events_event_date on events(event_date);
create index if not exists idx_homepage_popups_active on homepage_popups(is_active);
create index if not exists idx_admin_logs_created_at on admin_logs(created_at desc);

-- updated_at 자동 갱신 함수
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_buskers_updated_at on buskers;
create trigger trg_buskers_updated_at
before update on buskers
for each row execute function set_updated_at();

drop trigger if exists trg_sellers_updated_at on sellers;
create trigger trg_sellers_updated_at
before update on sellers
for each row execute function set_updated_at();

drop trigger if exists trg_events_updated_at on events;
create trigger trg_events_updated_at
before update on events
for each row execute function set_updated_at();

drop trigger if exists trg_homepage_popups_updated_at on homepage_popups;
create trigger trg_homepage_popups_updated_at
before update on homepage_popups
for each row execute function set_updated_at();

drop trigger if exists trg_revenue_updated_at on revenue;
create trigger trg_revenue_updated_at
before update on revenue
for each row execute function set_updated_at();

drop trigger if exists trg_images_updated_at on images;
create trigger trg_images_updated_at
before update on images
for each row execute function set_updated_at();

-- RLS
alter table admin_profiles enable row level security;
alter table admin_logs enable row level security;
alter table buskers enable row level security;
alter table sellers enable row level security;
alter table busker_pool enable row level security;
alter table seller_pool enable row level security;
alter table events enable row level security;
alter table homepage_popups enable row level security;
alter table revenue enable row level security;
alter table images enable row level security;

-- 개발/운영 간단 정책
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'buskers' and policyname = 'buskers_public_all') then
    create policy buskers_public_all on buskers for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'sellers' and policyname = 'sellers_public_all') then
    create policy sellers_public_all on sellers for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'busker_pool' and policyname = 'busker_pool_public_all') then
    create policy busker_pool_public_all on busker_pool for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'seller_pool' and policyname = 'seller_pool_public_all') then
    create policy seller_pool_public_all on seller_pool for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'events' and policyname = 'events_public_all') then
    create policy events_public_all on events for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'homepage_popups' and policyname = 'homepage_popups_public_all') then
    create policy homepage_popups_public_all on homepage_popups for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'revenue' and policyname = 'revenue_public_all') then
    create policy revenue_public_all on revenue for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'images' and policyname = 'images_public_all') then
    create policy images_public_all on images for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'admin_logs' and policyname = 'admin_logs_public_all') then
    create policy admin_logs_public_all on admin_logs for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'admin_profiles' and policyname = 'admin_profiles_public_all') then
    create policy admin_profiles_public_all on admin_profiles for all using (true) with check (true);
  end if;
end
$$;
`;

  return (
    <div className="space-y-6">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <div className="space-y-4">
          <div className="card">
            <div className="card-h"><span className="card-title">연결 정보</span></div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '5px', textTransform: 'uppercase' }}>Supabase URL</label>
                  <input 
                    className="fi" 
                    type="text" 
                    value={config.url} 
                    onChange={(e) => setConfig({ ...config, url: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--ink3)', border: '1px solid var(--line2)', borderRadius: '6px', color: 'var(--head)' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '5px', textTransform: 'uppercase' }}>Anon Public Key</label>
                  <input 
                    className="fi" 
                    type="password" 
                    value={config.key} 
                    onChange={(e) => setConfig({ ...config, key: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--ink3)', border: '1px solid var(--line2)', borderRadius: '6px', color: 'var(--head)' }} 
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-jade" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSaveConfig}>
                    <i className="fa-solid fa-save"></i> 저장 및 재연결
                  </button>
                  <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={handleTestConnection}>
                    <i className="fa-solid fa-plug"></i> 연결 테스트
                  </button>
                </div>
                <button className="btn btn-sky" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} onClick={handleSeedData}>
                  <i className="fa-solid fa-database"></i> DB 샘플 데이터 채우기
                </button>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-h"><span className="card-title">오프라인 큐</span></div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '.82rem', color: 'var(--soft)' }}>대기 중인 변경사항: <b style={{ color: 'var(--gold)' }}>{queue.length}</b>건</span>
                <button className="btn btn-jade" style={{ fontSize: '.72rem' }} onClick={handleSync} disabled={syncing}>
                  {syncing ? <span className="spinner"></span> : <><i className="fa-solid fa-upload"></i> 동기화</>}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {queue.length === 0 ? (
                  <div style={{ fontSize: '.78rem', color: 'var(--muted)', textAlign: 'center', padding: '8px' }}>대기 중인 작업 없음</div>
                ) : (
                  queue.map((op, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '7px 10px', background: 'var(--ink3)', borderRadius: '6px', border: '1px solid var(--line)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', padding: '2px 5px', borderRadius: '3px', background: 'var(--sdim)', color: 'var(--sky)' }}>{op.type}</span>
                      <span style={{ flex: 1, fontSize: '.72rem', color: 'var(--soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{op.label || op.table}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.6rem', color: 'var(--dim)' }}>{new Date(op.ts).toLocaleTimeString('ko-KR')}</span>
                    </div>
                  ))
                )}
              </div>
              <button className="btn btn-rose" style={{ width: '100%', justifyContent: 'center', marginTop: '8px', fontSize: '.72rem' }} onClick={() => { DB.clearQueue(); setQueue([]); }}>
                <i className="fa-solid fa-trash"></i> 큐 비우기
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><span className="card-title">SQL 스키마 (Supabase Editor에 붙여넣기)</span></div>
          <div className="card-body" style={{ padding: '0', height: 'calc(100% - 46px)', overflow: 'hidden' }}>
            <div className="code-block" style={{ height: '100%', overflowY: 'auto', fontSize: '.68rem', lineHeight: '1.7', maxHeight: '500px', padding: '12px 14px', background: 'var(--ink3)' }}>
              <pre>{schema}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabasePage;

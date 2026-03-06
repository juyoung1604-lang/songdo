import { createClient } from '@supabase/supabase-js';

// Configuration helper
const getConfig = () => {
  if (typeof window === 'undefined') return { url: '', key: '' };
  return {
    url: localStorage.getItem('supa_url') || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    key: localStorage.getItem('supa_anon_key') || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  };
};

// Create client with current config
const { url, key } = getConfig();
export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder');

// Helper for DB operations with local caching
const CACHE_PREFIX = 'songdo_cache_';
const OFFLINE_Q_KEY = 'songdo_offline_queue';
const LOCAL_DATA_KEY = 'songdo_local_data';
const SYSTEM_SETTINGS_KEY = 'songdo_system_settings';

const DEFAULT_SETTINGS = {
  busker_deposit: 50000,
  seller_booth_fee: 30000,
  deposit_bank: '',
  deposit_account: ''
};

const MOCK_DATA = {
  images: [
    { id: 'img-hero', section: 'hero', url: 'https://readdy.ai/api/search-image?query=modern%20flat%20vector%20illustration%20of%20Songdo%20Incheon%20camping%20ground%2C%20bright%20and%20cheerful%20colors%2C%20people%20enjoying%20music%20and%20outdoor%20market%2C%20cozy%20tents%20and%20trees%2C%20clean%20minimalist%20style%2C%20warm%20daylight%2C%20high%20quality%20digital%20art&width=1920&height=1080&seq=hero-illust-v1&orientation=landscape', alt: '메인 히어로 일러스트', active: true },
    { id: 'img-about-1', section: 'about', url: 'https://readdy.ai/api/search-image?query=professional%20indie%20musician%20performing%20acoustic%20guitar%20on%20outdoor%20wooden%20stage%20at%20sunny%20park%2C%20natural%20daylight%2C%20vibrant%20colors%2C%20Korean%20lifestyle%20aesthetic%2C%20high%20quality%20photography&width=800&height=800&seq=about-1-v2&orientation=squarish', alt: '버스킹 공연 실사', active: true },
    { id: 'img-about-2', section: 'about', url: 'https://readdy.ai/api/search-image?query=outdoor%20flea%20market%20booth%20with%20colorful%20handmade%20lifestyle%20products%2C%20sunny%20daylight%2C%20natural%20outdoor%20setting%2C%20vibrant%20and%20clean%20composition%2C%20high%20quality%20photography&width=800&height=800&seq=about-2-v2&orientation=squarish', alt: '플리마켓 부스 실사', active: true },
    { id: 'img-detail-1', section: 'details', url: 'https://picsum.photos/seed/detail-schedule/600/400', alt: '행사 안내 카드 1', active: true },
    { id: 'img-detail-2', section: 'details', url: 'https://picsum.photos/seed/detail-location/600/400', alt: '행사 안내 카드 2', active: true },
    { id: 'img-detail-3', section: 'details', url: 'https://picsum.photos/seed/detail-support/600/400', alt: '행사 안내 카드 3', active: true },
    { id: 'img-detail-popup-1', section: 'details-popup', url: 'https://picsum.photos/seed/detail-schedule/1600/1200', alt: '행사 안내 팝업 1', active: true },
    { id: 'img-detail-popup-2', section: 'details-popup', url: 'https://picsum.photos/seed/detail-location/1600/1200', alt: '행사 안내 팝업 2', active: true },
    { id: 'img-detail-popup-3', section: 'details-popup', url: 'https://picsum.photos/seed/detail-support/1600/1200', alt: '행사 안내 팝업 3', active: true },
    { id: 'img-busker-bg', section: 'busker', url: 'https://readdy.ai/api/search-image?query=bright%20sunny%20day%20outdoor%20concert%20at%20camping%20site%2C%20musician%20performing%20with%20guitar%2C%20happy%20crowd%20background%2C%20clear%20blue%20sky%2C%20vibrant%20colors%2C%20wide%20angle%20photography&width=1920&height=800&seq=busker-bg-v2&orientation=landscape', alt: '버스커 섹션 배경', active: true },
    { id: 'img-seller-1', section: 'seller', url: 'https://readdy.ai/api/search-image?query=handmade%20jewelry%20on%20display%20at%20outdoor%20market%2C%20bright%20natural%20light&width=500&height=500&seq=seller-0-v2&orientation=squarish', alt: '셀러 이미지 1', active: true },
    { id: 'img-seller-2', section: 'seller', url: 'https://readdy.ai/api/search-image?query=colorful%20lifestyle%20goods%20at%20flea%20market%20stall%2C%20sunny%20outdoor%20setting&width=500&height=500&seq=seller-1-v2&orientation=squarish', alt: '셀러 이미지 2', active: true },
    { id: 'img-seller-3', section: 'seller', url: 'https://readdy.ai/api/search-image?query=delicious%20outdoor%20festival%20food%20and%20drinks%2C%20bright%20and%20vibrant&width=500&height=500&seq=seller-2-v2&orientation=squarish', alt: '셀러 이미지 3', active: true },
    { id: 'img-seller-4', section: 'seller', url: 'https://readdy.ai/api/search-image?query=camping%20lifestyle%20gear%20displayed%20at%20outdoor%20market%2C%20sunny%20day&width=500&height=500&seq=seller-3-v2&orientation=squarish', alt: '셀러 이미지 4', active: true },
    { id: 'img-gallery-1', section: 'gallery', url: 'https://picsum.photos/seed/gallery-family/800/600', alt: '갤러리 1', caption: '가족과 함께하는 주말', active: true },
    { id: 'img-gallery-2', section: 'gallery', url: 'https://picsum.photos/seed/gallery-concert/600/800', alt: '갤러리 2', caption: '라이브 공연의 열기', active: true },
    { id: 'img-gallery-3', section: 'gallery', url: 'https://picsum.photos/seed/gallery-craft/600/600', alt: '갤러리 3', caption: '특별한 수제 제품들', active: true },
    { id: 'img-gallery-4', section: 'gallery', url: 'https://picsum.photos/seed/gallery-market/800/600', alt: '갤러리 4', caption: '마켓에서의 만남', active: true },
    { id: 'img-gallery-5', section: 'gallery', url: 'https://picsum.photos/seed/gallery-busking/600/800', alt: '갤러리 5', caption: '감성적인 버스킹', active: true },
    { id: 'img-gallery-6', section: 'gallery', url: 'https://picsum.photos/seed/gallery-camping/800/600', alt: '갤러리 6', caption: '송도 캠핑장 전경', active: true }
  ],
  buskers: [
    { id: 'b1', name: '이지은', team: '솔로', genre: '어쿠스틱', phone: '010-1234-5678', email: 'jieun@example.com', event_date: '2026-03-07', status: 'approved', fee: 50000, applied_at: '2026-02-20T10:00:00Z', note: '[문의] 통기타 연주 및 보컬' },
    { id: 'b2', name: '김태양', team: '선셋밴드', genre: '인디 록', phone: '010-2345-6789', email: 'sun@example.com', event_date: '2026-03-07', status: 'approved', fee: 50000, applied_at: '2026-02-21T14:20:00Z', note: '[문의] 4인조 밴드, 앰프 필요' },
    { id: 'b3', name: '박소리', team: '솔로', genre: '재즈', phone: '010-3456-7890', email: 'sori@example.com', event_date: '2026-03-14', status: 'approved', fee: 50000, applied_at: '2026-02-25T09:15:00Z', note: '[문의] 전자피아노 지참' },
    { id: 'b4', name: '최준혁', team: '듀오 제이', genre: '팝', phone: '010-4567-8901', email: 'jun@example.com', event_date: '2026-03-14', status: 'rejected', fee: 0, applied_at: '2026-02-24T11:00:00Z', note: '[문의] 거절 사유: 장비 미비' },
    { id: 'b5', name: '윤아름', team: '아름밴드', genre: '포크', phone: '010-5678-9012', email: 'areum@example.com', event_date: '2026-03-21', status: 'approved', fee: 50000, applied_at: '2026-02-28T16:00:00Z', note: '[문의] 5인조 포크 밴드' },
    { id: 'b6', name: '정민수', team: '솔로', genre: '힙합', phone: '010-6789-0123', email: 'min@example.com', event_date: '2026-03-21', status: 'pending', fee: 0, applied_at: '2026-03-01T12:00:00Z', note: '[문의] 랩 & 비트박스' }
  ],
  sellers: [
    { id: 's1', name: '이꽃', category: '핸드메이드 공예', booths: 1, phone: '010-1111-2222', email: 'flower@example.com', event_date: '2026-03-07', fee: 30000, status: 'paid', applied_at: '2026-02-19T09:30:00Z', note: '[문의] 직접 만든 도자기' },
    { id: 's2', name: '박나무', category: '빈티지 소품', booths: 2, phone: '010-2222-3333', email: 'tree@example.com', event_date: '2026-03-07', fee: 60000, status: 'approved', applied_at: '2026-02-20T16:45:00Z', note: '[문의] 유럽 빈티지 인테리어' },
    { id: 's3', name: '최바다', category: '먹거리', booths: 1, phone: '010-3333-4444', email: 'sea@example.com', event_date: '2026-03-14', status: 'pending', fee: 30000, applied_at: '2026-02-26T13:10:00Z', note: '[문의] 수제 쿠키 및 타르트' },
    { id: 's4', name: '정여름', category: '패션/의류', booths: 1, phone: '010-4444-5555', email: 'summer@example.com', event_date: '2026-03-14', status: 'paid', fee: 30000, applied_at: '2026-02-27T10:00:00Z', note: '[문의] 천연 염색 의류' },
    { id: 's5', name: '한구름', category: '생활잡화', booths: 1, phone: '010-5555-6666', email: 'cloud@example.com', event_date: '2026-03-21', status: 'approved', fee: 30000, applied_at: '2026-03-01T14:00:00Z', note: '[문의] 친환경 세제 및 수세미' },
    { id: 's6', name: '김하늘', category: '액세서리', booths: 1, phone: '010-6666-7777', email: 'sky@example.com', event_date: '2026-03-21', status: 'pending', fee: 30000, applied_at: '2026-03-02T15:30:00Z', note: '[문의] 써지컬 스틸 귀걸이' }
  ],
  revenue: [],
  events: [
    { id: 'e1',  title: '봄맞이 버스킹 페스티벌', event_date: '2026-03-07', busker_count: 3,  seller_count: 8,  note: '봄 특집' },
    { id: 'e2',  title: '인디밴드 라이브 공연',    event_date: '2026-03-08', busker_count: 2,  seller_count: 6,  note: '' },
    { id: 'e3',  title: '봄 플리마켓 데이',        event_date: '2026-03-14', busker_count: 1,  seller_count: 12, note: '' },
    { id: 'e4',  title: '어쿠스틱 버스킹 나이트',  event_date: '2026-03-15', busker_count: 4,  seller_count: 5,  note: '' },
    { id: 'e5',  title: '벚꽃 버스킹 마켓',        event_date: '2026-03-21', busker_count: 5,  seller_count: 14, note: '봄 테마' },
    { id: 'e6',  title: '봄 야외 음악회',           event_date: '2026-03-22', busker_count: 3,  seller_count: 10, note: '' },
    { id: 'e7',  title: '감성 버스킹 타임',         event_date: '2026-03-28', busker_count: 2,  seller_count: 8,  note: '' },
    { id: 'e8',  title: '주말 마켓 & 공연',         event_date: '2026-03-29', busker_count: 4,  seller_count: 13, note: '' },
    { id: 'e9',  title: '봄 라이브 콘서트',         event_date: '2026-04-04', busker_count: 3,  seller_count: 9,  note: '' },
    { id: 'e10', title: '꽃 플리마켓 페어',         event_date: '2026-04-05', busker_count: 2,  seller_count: 15, note: '봄 테마' },
    { id: 'e11', title: '인디음악 페스티벌',        event_date: '2026-04-11', busker_count: 5,  seller_count: 10, note: '' },
    { id: 'e12', title: '봄 마켓 & 핸드메이드',    event_date: '2026-04-12', busker_count: 2,  seller_count: 14, note: '' },
    { id: 'e13', title: '어쿠스틱 오후',            event_date: '2026-04-18', busker_count: 3,  seller_count: 7,  note: '' },
    { id: 'e14', title: '봄 감성 버스킹',           event_date: '2026-04-19', busker_count: 4,  seller_count: 9,  note: '' },
  ],
  homepage_popups: [],
  busker_pool: [],
  seller_pool: []
};

const mergeRecordsById = (primary: any[] = [], secondary: any[] = []) =>
  [...primary, ...secondary].reduce((acc: any[], item: any) => {
    if (!item?.id) return acc;
    const existingIndex = acc.findIndex((entry) => entry.id === item.id);
    if (existingIndex >= 0) acc[existingIndex] = { ...acc[existingIndex], ...item };
    else acc.push(item);
    return acc;
  }, []);

export const DB = {
  // ... (existing methods)
  
  // POOL MANAGEMENT
  async getPool(table: 'busker_pool' | 'seller_pool') {
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        if (!error && data) {
          this.setLocalData(table, data);
          return data;
        }
      } catch (e) { console.error(e); }
    }
    return this.getLocalData(table) || [];
  },

  async addToPool(type: 'busker' | 'seller', applicantData: any) {
    const table = type === 'busker' ? 'busker_pool' : 'seller_pool';
    const pool = await this.getPool(table);
    
    // Check for existing by phone or email
    const exists = pool.find((p: any) => p.phone === applicantData.phone || p.email === applicantData.email);
    
    if (exists) {
      // Update existing record with latest info and increment application count
      const updatedData = {
        ...exists,
        ...applicantData,
        id: exists.id, // keep original id
        app_count: (exists.app_count || 1) + 1,
        last_applied_at: new Date().toISOString()
      };
      const updatedPool = pool.map((p: any) => p.id === exists.id ? updatedData : p);
      this.setLocalData(table, updatedPool);
      
      if (this.isConfigured()) {
        await supabase.from(table).update(updatedData).eq('id', exists.id);
      }
      return { success: true, is_new: false };
    } else {
      // Create new pool record
      const newData = {
        ...applicantData,
        id: 'pool_' + Date.now(),
        app_count: 1,
        created_at: new Date().toISOString(),
        last_applied_at: new Date().toISOString()
      };
      this.setLocalData(table, [newData, ...pool]);
      
      if (this.isConfigured()) {
        await supabase.from(table).insert([newData]);
      }
      return { success: true, is_new: true };
    }
  },

  async checkDuplicate(type: 'busker' | 'seller', phone: string, email: string) {
    const table = type === 'busker' ? 'busker_pool' : 'seller_pool';
    const pool = await this.getPool(table);
    const found = pool.find((p: any) => p.phone === phone || p.email === email);
    return found ? { is_duplicate: true, app_count: found.app_count, last_date: found.last_applied_at } : { is_duplicate: false };
  },

  async updatePool(table: 'busker_pool' | 'seller_pool', id: string, payload: any) {
    const local = this.getLocalData(table);
    const updated = local.map((item: any) => item.id === id ? { ...item, ...payload, updated_at: new Date().toISOString() } : item);
    this.setLocalData(table, updated);
    
    if (this.isConfigured()) {
      return await supabase.from(table).update(payload).eq('id', id);
    }
    return { error: null };
  },

  async deletePool(table: 'busker_pool' | 'seller_pool', id: string) {
    const local = this.getLocalData(table);
    const filtered = local.filter((item: any) => item.id !== id);
    this.setLocalData(table, filtered);
    
    if (this.isConfigured()) {
      return await supabase.from(table).delete().eq('id', id);
    }
    return { error: null };
  },
  // SYSTEM SETTINGS
  getSystemSettings() {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem(SYSTEM_SETTINGS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  },
  saveSystemSettings(settings: any) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SYSTEM_SETTINGS_KEY, JSON.stringify(settings));
    this.cacheClear();
  },

  // INTERNAL HELPERS
  isConfigured() {
    const c = getConfig();
    return c.url && c.url !== '' && !c.url.includes('placeholder');
  },

  cacheGet(key: string) {
    if (typeof window === 'undefined') return null;
    try {
      const v = JSON.parse(localStorage.getItem(CACHE_PREFIX + key) || '');
      if (v && Date.now() - v.ts < 30 * 60000) return v.data;
    } catch { /* ignore */ }
    return null;
  },
  cacheSet(key: string, data: any) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
    } catch { /* ignore */ }
  },
  cacheClear() {
    if (typeof window === 'undefined') return;
    Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX)).forEach(k => localStorage.removeItem(k));
  },

  getLocalData(table: string) {
    if (typeof window === 'undefined') return (MOCK_DATA as any)[table];
    try {
      const all = JSON.parse(localStorage.getItem(LOCAL_DATA_KEY) || '{}');
      return all[table] || (MOCK_DATA as any)[table];
    } catch { return (MOCK_DATA as any)[table]; }
  },
  setLocalData(table: string, data: any) {
    if (typeof window === 'undefined') return;
    try {
      const all = JSON.parse(localStorage.getItem(LOCAL_DATA_KEY) || '{}');
      all[table] = data;
      localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(all));
    } catch { /* ignore */ }
  },

  // OFFLINE QUEUE
  getQueue() {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(OFFLINE_Q_KEY) || '[]'); } catch { return []; }
  },
  enqueue(op: any) {
    if (typeof window === 'undefined') return;
    const q = this.getQueue();
    q.push({ ...op, ts: Date.now(), qid: Date.now() + Math.random() });
    localStorage.setItem(OFFLINE_Q_KEY, JSON.stringify(q));
  },
  clearQueue() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(OFFLINE_Q_KEY);
  },

  // BUSKERS
  async getBuskers() {
    const local = this.cacheGet('buskers') || this.getLocalData('buskers') || [];
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('buskers').select('*').order('applied_at', { ascending: false });
        if (!error && data) {
          const merged = mergeRecordsById(data, local).sort((a: any, b: any) =>
            (b.applied_at || '').localeCompare(a.applied_at || '')
          );
          this.cacheSet('buskers', merged);
          this.setLocalData('buskers', merged);
          return merged;
        }
      } catch (e) { console.error(e); }
    }
    return (local && local.length > 0) ? local : MOCK_DATA.buskers;
  },

  // SELLERS
  async getSellers() {
    const local = this.cacheGet('sellers') || this.getLocalData('sellers') || [];
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('sellers').select('*').order('applied_at', { ascending: false });
        if (!error && data) {
          const merged = mergeRecordsById(data, local).sort((a: any, b: any) =>
            (b.applied_at || '').localeCompare(a.applied_at || '')
          );
          this.cacheSet('sellers', merged);
          this.setLocalData('sellers', merged);
          return merged;
        }
      } catch (e) { console.error(e); }
    }
    return (local && local.length > 0) ? local : MOCK_DATA.sellers;
  },

  // EVENTS
  async getEvents() {
    const local = this.cacheGet('events') || this.getLocalData('events') || [];
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: true });
        if (!error && data) {
          const merged = mergeRecordsById(data, local).sort((a: any, b: any) => a.event_date.localeCompare(b.event_date));
          this.cacheSet('events', merged);
          this.setLocalData('events', merged);
          return merged;
        }
      } catch (e) { console.error(e); }
    }
    return local;
  },

  async getHomepagePopups() {
    const local = this.cacheGet('homepage_popups') || this.getLocalData('homepage_popups') || [];
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase
          .from('homepage_popups')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data) {
          const merged = mergeRecordsById(data, local).sort((a: any, b: any) =>
            (b.created_at || '').localeCompare(a.created_at || '')
          );
          this.cacheSet('homepage_popups', merged);
          this.setLocalData('homepage_popups', merged);
          return merged;
        }
      } catch (e) { console.error(e); }
    }
    return local;
  },

  // REVENUE
  async getRevenue() {
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('revenue').select('*').order('date', { ascending: false });
        if (!error && data) {
          this.cacheSet('revenue', data);
          this.setLocalData('revenue', data);
          return data;
        }
      } catch (e) { console.error(e); }
    }
    return this.cacheGet('revenue') || this.getLocalData('revenue');
  },

  // MUTATIONS
  async updateBusker(id: string, payload: any) {
    const local = this.getLocalData('buskers');
    const updated = local.map((item: any) => item.id === id ? { ...item, ...payload } : item);
    this.setLocalData('buskers', updated);
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('b') && !id.startsWith('temp_')) {
      return await supabase.from('buskers').update(payload).eq('id', id).select().single();
    }
    return { data: payload, error: null };
  },

  async updateSeller(id: string, payload: any) {
    const local = this.getLocalData('sellers');
    const updated = local.map((item: any) => item.id === id ? { ...item, ...payload } : item);
    this.setLocalData('sellers', updated);
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('s') && !id.startsWith('temp_')) {
      return await supabase.from('sellers').update(payload).eq('id', id).select().single();
    }
    return { data: payload, error: null };
  },

  async updateStatus(table: 'buskers' | 'sellers', id: string, status: string) {
    const local = this.getLocalData(table);
    const updated = local.map((item: any) => item.id === id ? { ...item, status, updated_at: new Date().toISOString() } : item);
    this.setLocalData(table, updated);
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('b') && !id.startsWith('s') && !id.startsWith('temp_')) {
      return await supabase.from(table).update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    }
    return { error: null };
  },

  async updateRevenueStatus(id: string, status: 'paid' | 'unpaid') {
    const local = this.getLocalData('revenue');
    const updated = local.map((item: any) => item.id === id ? { ...item, status } : item);
    this.setLocalData('revenue', updated);
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('r')) {
      return await supabase.from('revenue').update({ status }).eq('id', id);
    }
    return { error: null };
  },

  async createBusker(payload: any) {
    const newItem = { id: 'temp_' + Date.now(), ...payload };
    const local = this.getLocalData('buskers');
    this.setLocalData('buskers', [newItem, ...local]);
    this.cacheClear();

    if (this.isConfigured()) {
      try {
        const res = await supabase.from('buskers').insert([payload]).select().single();
        if (res.error) {
          this.enqueue({ type: 'create', table: 'buskers', payload: newItem });
          return { data: newItem, error: null, offline: true };
        }

        const merged = mergeRecordsById(
          this.getLocalData('buskers').filter((item: any) => item.id !== newItem.id),
          [res.data]
        ).sort((a: any, b: any) => (b.applied_at || '').localeCompare(a.applied_at || ''));
        this.setLocalData('buskers', merged);
        this.cacheClear();
        return res;
      } catch (e) {
        this.enqueue({ type: 'create', table: 'buskers', payload: newItem });
        return { data: newItem, error: null, offline: true };
      }
    }
    return { data: newItem, error: null };
  },

  async createSeller(payload: any) {
    const newItem = { id: 'temp_' + Date.now(), ...payload };
    const local = this.getLocalData('sellers');
    this.setLocalData('sellers', [newItem, ...local]);
    this.cacheClear();

    if (this.isConfigured()) {
      try {
        const res = await supabase.from('sellers').insert([payload]).select().single();
        if (res.error) {
          this.enqueue({ type: 'create', table: 'sellers', payload: newItem });
          return { data: newItem, error: null, offline: true };
        }

        const merged = mergeRecordsById(
          this.getLocalData('sellers').filter((item: any) => item.id !== newItem.id),
          [res.data]
        ).sort((a: any, b: any) => (b.applied_at || '').localeCompare(a.applied_at || ''));
        this.setLocalData('sellers', merged);
        this.cacheClear();
        return res;
      } catch (e) {
        this.enqueue({ type: 'create', table: 'sellers', payload: newItem });
        return { data: newItem, error: null, offline: true };
      }
    }
    return { data: newItem, error: null };
  },

  async createEvent(payload: any) {
    const newItem = { id: 'temp_e_' + Date.now(), ...payload };
    const local = this.getLocalData('events');
    this.setLocalData('events', [...local, newItem]);
    this.cacheClear();

    if (this.isConfigured()) {
      try {
        const res = await supabase.from('events').insert([payload]).select().single();
        if (res.error) {
          this.enqueue({ type: 'create', table: 'events', payload: newItem });
          return { data: newItem, error: null, offline: true };
        }

        const merged = mergeRecordsById(
          this.getLocalData('events').filter((item: any) => item.id !== newItem.id),
          [res.data]
        ).sort((a: any, b: any) => a.event_date.localeCompare(b.event_date));
        this.setLocalData('events', merged);
        this.cacheClear();
        return res;
      } catch (e) {
        this.enqueue({ type: 'create', table: 'events', payload: newItem });
        return { data: newItem, error: null, offline: true };
      }
    }
    return { data: newItem, error: null };
  },

  async updateEvent(id: string, payload: any) {
    const local = this.getLocalData('events');
    const updated = local.map((item: any) => item.id === id ? { ...item, ...payload } : item);
    this.setLocalData('events', updated);
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('e') && !id.startsWith('temp_')) {
      try {
        const res = await supabase.from('events').update(payload).eq('id', id).select().single();
        if (res.error) {
          this.enqueue({ type: 'update', table: 'events', id, payload });
          return { data: updated.find((item: any) => item.id === id), error: null, offline: true };
        }
        return res;
      } catch (e) {
        this.enqueue({ type: 'update', table: 'events', id, payload });
        return { data: updated.find((item: any) => item.id === id), error: null, offline: true };
      }
    }
    return { data: updated.find((item: any) => item.id === id), error: null };
  },

  async deleteEvent(id: string) {
    const local = this.getLocalData('events');
    this.setLocalData('events', local.filter((item: any) => item.id !== id));
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('e') && !id.startsWith('temp_')) {
      try {
        const res = await supabase.from('events').delete().eq('id', id);
        if (res.error) {
          this.enqueue({ type: 'delete', table: 'events', id });
          return { error: null, offline: true };
        }
        return res;
      } catch (e) {
        this.enqueue({ type: 'delete', table: 'events', id });
        return { error: null, offline: true };
      }
    }
    return { error: null };
  },

  async createHomepagePopup(payload: any) {
    const newItem = {
      id: 'temp_hp_' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...payload,
    };
    const local = this.getLocalData('homepage_popups') || [];
    this.setLocalData('homepage_popups', [newItem, ...local]);
    this.cacheClear();

    if (this.isConfigured()) {
      try {
        const res = await supabase.from('homepage_popups').insert([payload]).select().single();
        if (res.error) {
          this.enqueue({ type: 'create', table: 'homepage_popups', payload: newItem });
          return { data: newItem, error: null, offline: true };
        }

        const merged = mergeRecordsById(
          this.getLocalData('homepage_popups').filter((item: any) => item.id !== newItem.id),
          [res.data]
        ).sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
        this.setLocalData('homepage_popups', merged);
        this.cacheClear();
        return res;
      } catch (e) {
        this.enqueue({ type: 'create', table: 'homepage_popups', payload: newItem });
        return { data: newItem, error: null, offline: true };
      }
    }

    return { data: newItem, error: null };
  },

  async updateHomepagePopup(id: string, payload: any) {
    const local = this.getLocalData('homepage_popups') || [];
    const updated = local.map((item: any) =>
      item.id === id ? { ...item, ...payload, updated_at: new Date().toISOString() } : item
    );
    this.setLocalData('homepage_popups', updated);
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('temp_')) {
      try {
        const res = await supabase
          .from('homepage_popups')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (res.error) {
          this.enqueue({ type: 'update', table: 'homepage_popups', id, payload });
          return { data: updated.find((item: any) => item.id === id), error: null, offline: true };
        }
        return res;
      } catch (e) {
        this.enqueue({ type: 'update', table: 'homepage_popups', id, payload });
        return { data: updated.find((item: any) => item.id === id), error: null, offline: true };
      }
    }

    return { data: updated.find((item: any) => item.id === id), error: null };
  },

  async deleteHomepagePopup(id: string) {
    const local = this.getLocalData('homepage_popups') || [];
    this.setLocalData('homepage_popups', local.filter((item: any) => item.id !== id));
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('temp_')) {
      try {
        const res = await supabase.from('homepage_popups').delete().eq('id', id);
        if (res.error) {
          this.enqueue({ type: 'delete', table: 'homepage_popups', id });
          return { error: null, offline: true };
        }
        return res;
      } catch (e) {
        this.enqueue({ type: 'delete', table: 'homepage_popups', id });
        return { error: null, offline: true };
      }
    }

    return { error: null };
  },

  async deleteBusker(id: string) {
    const local = this.getLocalData('buskers');
    this.setLocalData('buskers', local.filter((item: any) => item.id !== id));
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('b') && !id.startsWith('temp_')) {
      return await supabase.from('buskers').delete().eq('id', id);
    }
    return { error: null };
  },

  async deleteSeller(id: string) {
    const local = this.getLocalData('sellers');
    this.setLocalData('sellers', local.filter((item: any) => item.id !== id));
    this.cacheClear();

    if (this.isConfigured() && !id.startsWith('s') && !id.startsWith('temp_')) {
      return await supabase.from('sellers').delete().eq('id', id);
    }
    return { error: null };
  },

  async deleteAdminProfile(id: string) {
    const local = this.getLocalData('admin_profiles') || [];
    const updated = local.filter((item: any) => item.id !== id);
    this.setLocalData('admin_profiles', updated);

    if (this.isConfigured() && !id.startsWith('u') && !id.startsWith('temp_')) {
      return await supabase.from('admin_profiles').delete().eq('id', id);
    }
    return { error: null };
  },

  async getAdminLogs() {
    const local = this.getLocalData('admin_logs') || [];
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(10);
        if (!error && data) {
          this.setLocalData('admin_logs', data);
          return data;
        }
      } catch (e) { console.error(e); }
    }
    return local.length > 0 ? local : [
      { id: 'l1', type: 'user-plus', color: 'var(--jade)', title: '시스템 초기화', desc: '시스템이 성공적으로 시작되었습니다.', created_at: new Date().toISOString() }
    ];
  },

  async createAdminLog(payload: any) {
    const newItem = { id: 'log_' + Date.now(), created_at: new Date().toISOString(), ...payload };
    const local = this.getLocalData('admin_logs') || [];
    this.setLocalData('admin_logs', [newItem, ...local].slice(0, 50)); // Keep last 50 logs

    if (this.isConfigured()) {
      await supabase.from('admin_logs').insert([payload]);
    }
    return { error: null };
  },

  async getAdminProfiles() {
    const local = this.getLocalData('admin_profiles') || [];
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('admin_profiles').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          const merged = mergeRecordsById(data, local);
          this.setLocalData('admin_profiles', merged);
          return merged;
        }
      } catch (e) { console.error(e); }
    }
    return (local && local.length > 0) ? local : [
      { id: 'u1', name: '김슈퍼', email: 'super@songdo.com', role: 'super_admin', status: 'active', last_login: '2025-03-04T09:12:00Z', created_at: '2024-01-01' },
      { id: 'u2', name: '이관리', email: 'admin@songdo.com', role: 'admin', status: 'active', last_login: '2025-03-03T18:44:00Z', created_at: '2024-03-15' },
      { id: 'u3', name: '박운영', email: 'ops1@songdo.com', role: 'operator', status: 'active', last_login: '2025-03-04T08:30:00Z', created_at: '2024-06-01' },
    ];
  },

  async updateAdminProfile(id: string, payload: any) {
    const local = this.getLocalData('admin_profiles') || [];
    const updated = local.map((item: any) => item.id === id ? { ...item, ...payload } : item);
    this.setLocalData('admin_profiles', updated);

    if (this.isConfigured() && !id.startsWith('u') && !id.startsWith('temp_')) {
      return await supabase.from('admin_profiles').update(payload).eq('id', id);
    }
    return { error: null };
  },

  async createAdminProfile(payload: any) {
    const local = this.getLocalData('admin_profiles') || [];
    const normalizedEmail = String(payload.email || '').trim().toLowerCase();
    const hasDuplicate = local.some((item: any) => String(item.email || '').trim().toLowerCase() === normalizedEmail);

    if (hasDuplicate) {
      return { error: { message: '이미 등록된 이메일입니다.' } };
    }

    const newItem = {
      id: payload.id || `temp_u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...payload,
      email: normalizedEmail || payload.email,
      status: payload.status || 'active',
      created_at: payload.created_at || new Date().toISOString()
    };
    this.setLocalData('admin_profiles', [newItem, ...local]);
    this.cacheClear();

    const hasRealAuthUserId =
      typeof newItem.id === 'string' &&
      !newItem.id.startsWith('temp_') &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(newItem.id);

    if (this.isConfigured() && hasRealAuthUserId) {
      return await supabase.from('admin_profiles').insert([newItem]);
    }
    return { error: null };
  },

  async signIn(email: string, password: string) {
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) return { data, error: null };
      } catch (e) { /* fallback */ }
    }

    const profiles = this.getLocalData('admin_profiles') || [];
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const localProfile = profiles.find((item: any) => String(item.email || '').trim().toLowerCase() === normalizedEmail);

    if (localProfile) {
      if (localProfile.status && localProfile.status !== 'active') {
        return { data: null, error: { message: '비활성화된 계정입니다.' } };
      }

      if (localProfile.password && localProfile.password === password) {
        return {
          data: {
            user: {
              id: localProfile.id,
              email: localProfile.email,
              user_metadata: {
                name: localProfile.name,
                role: localProfile.role || 'operator',
                source: 'local_admin_profile'
              }
            }
          },
          error: null
        };
      }
    }

    if (email === 'admin@example.com' && password === 'password123') {
      return { data: { user: { id: 'demo-user', email: 'admin@example.com', user_metadata: { name: '관리자', role: 'super_admin' } } }, error: null };
    }
    return { data: null, error: { message: '로그인 정보를 확인하세요.' } };
  },

  async signOut() { 
    if (this.isConfigured()) await supabase.auth.signOut();
  },

  // IMAGES
  async getImages() {
    if (this.isConfigured()) {
      try {
        const { data, error } = await supabase.from('images').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          this.setLocalData('images', data);
          return data;
        }
      } catch (e) { console.error(e); }
    }
    return this.getLocalData('images');
  },

  async updateImage(id: string, payload: any) {
    const local = this.getLocalData('images');
    const exists = local.some((item: any) => item.id === id);
    const updated = exists
      ? local.map((item: any) => item.id === id ? { ...item, ...payload } : item)
      : [...local, { id, active: true, ...payload }];
    this.setLocalData('images', updated);
    
    if (this.isConfigured()) {
      return await supabase.from('images').upsert([{ id, active: true, ...payload }]).select().single();
    }
    return { data: payload, error: null };
  },
  
  async getUser() {
    if (this.isConfigured()) {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
    return null;
  },

  async seedData() {
    if (!this.isConfigured()) throw new Error('Supabase가 연결되지 않았습니다.');
    
    try {
      // Clear existing data (images table included)
      await Promise.all([
        supabase.from('buskers').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('sellers').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('revenue').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('images').delete().neq('id', 'seed-lock-id'),
      ]);
    } catch (e) {
      console.warn('Existing data clear failed, continuing with insert...');
    }

    const bData = MOCK_DATA.buskers.map(({ id, ...rest }) => ({ ...rest, updated_at: new Date().toISOString() }));
    const sData = MOCK_DATA.sellers.map(({ id, ...rest }) => ({ ...rest, updated_at: new Date().toISOString() }));
    const rData = MOCK_DATA.revenue.map((item: any) => {
      const { id, ...rest } = item;
      return rest;
    });
    const eData = MOCK_DATA.events.map(({ id, ...rest }) => rest);
    const iData = MOCK_DATA.images.map(({ id, ...rest }) => ({ ...rest, id })); // Keep original string IDs for images

    const [resB, resS, resR, resE, resI] = await Promise.all([
      supabase.from('buskers').insert(bData),
      supabase.from('sellers').insert(sData),
      supabase.from('revenue').insert(rData),
      supabase.from('events').insert(eData),
      supabase.from('images').insert(iData),
    ]);

    if (resB.error) throw resB.error;
    if (resS.error) throw resS.error;
    if (resR.error) throw resR.error;
    if (resE.error) throw resE.error;
    if (resI.error) throw resI.error;

    this.cacheClear();
    localStorage.removeItem(LOCAL_DATA_KEY);
    return { success: true };
  }
};

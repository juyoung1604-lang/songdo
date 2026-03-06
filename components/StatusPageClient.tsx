'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DB } from '@/lib/supabase';

type ApplyType = 'busker' | 'seller';

const STATUS_LABEL: Record<string, string> = {
  pending: '접수 대기',
  approved: '승인',
  paid: '결제완료',
  rejected: '거절',
};

const STATUS_COLOR: Record<string, string> = {
  pending: '#A16207',
  approved: '#166534',
  paid: '#1D4ED8',
  rejected: '#B91C1C',
};

const normalizePhone = (value: string) => value.replace(/\D/g, '');
const normalizeName = (value: string) => value.trim().toLowerCase();

export default function StatusPageClient({ initialType }: { initialType: ApplyType }) {
  const [settings, setSettings] = useState({
    busker_deposit: 50000,
    seller_booth_fee: 30000,
    deposit_bank: '',
    deposit_account: '',
  });
  const [type, setType] = useState<ApplyType>(initialType);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);

  const title = useMemo(
    () => (type === 'busker' ? '버스커 신청 확인' : '셀러 신청 확인'),
    [type]
  );

  useEffect(() => {
    setSettings(DB.getSystemSettings());
  }, []);

  const handleTypeChange = (nextType: ApplyType) => {
    setType(nextType);
    setName('');
    setPhone('');
    setResult(null);
    setSearched(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);

    try {
      const data = type === 'busker' ? await DB.getBuskers() : await DB.getSellers();
      const matched = [...(data || [])]
        .filter((item: any) =>
          normalizeName(item.name || '') === normalizeName(name) &&
          normalizePhone(item.phone || '') === normalizePhone(phone)
        )
        .sort((a: any, b: any) => (b.applied_at || '').localeCompare(a.applied_at || ''))[0];

      setResult(matched || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAF9] px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-[#FF8B5A]">Application Status</p>
            <h1 className="text-3xl font-black text-[#2C2C2C]">{title}</h1>
            <p className="mt-2 text-sm text-[#6B6B6B]">신청자명과 휴대폰 번호를 입력하면 최근 신청 상태를 확인할 수 있습니다.</p>
          </div>
          <Link href="/" className="rounded-full border border-[#D6D3D1] px-4 py-2 text-sm font-bold text-[#2C2C2C] transition-colors hover:border-[#FF8B5A] hover:text-[#FF8B5A]">
            홈으로
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[28px] border border-[#E7E5E4] bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange('busker')}
              className={`rounded-2xl border-2 px-4 py-4 text-sm font-bold transition-all ${type === 'busker' ? 'border-[#FF8B5A] bg-[#FF8B5A] text-white' : 'border-[#E7E5E4] bg-[#FAFAF9] text-[#6B6B6B]'}`}
            >
              버스커 신청 확인
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('seller')}
              className={`rounded-2xl border-2 px-4 py-4 text-sm font-bold transition-all ${type === 'seller' ? 'border-[#FF8B5A] bg-[#FF8B5A] text-white' : 'border-[#E7E5E4] bg-[#FAFAF9] text-[#6B6B6B]'}`}
            >
              셀러 신청 확인
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-[#2C2C2C]">신청자명</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] px-5 py-4 outline-none transition-all focus:border-[#FF8B5A]"
                placeholder="이름을 입력하세요"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-bold text-[#2C2C2C]">휴대폰 번호</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full rounded-2xl border border-[#E7E5E4] bg-[#FAFAF9] px-5 py-4 outline-none transition-all focus:border-[#FF8B5A]"
                placeholder="010-0000-0000"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-[#2C2C2C] py-4 text-base font-black text-white transition-all hover:bg-[#FF8B5A] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '조회 중...' : '신청 상태 확인'}
          </button>
        </form>

        {searched && (
          <div className="mt-6 rounded-[28px] border border-[#E7E5E4] bg-white p-6 shadow-sm md:p-8">
            {result ? (
              <>
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#6B6B6B]">{type === 'busker' ? '버스커 신청자' : '셀러 신청자'}</p>
                    <h2 className="text-2xl font-black text-[#2C2C2C]">{result.name}</h2>
                  </div>
                  <span
                    className="rounded-full px-4 py-2 text-sm font-bold"
                    style={{
                      backgroundColor: `${STATUS_COLOR[result.status] || '#6B7280'}18`,
                      color: STATUS_COLOR[result.status] || '#6B7280',
                    }}
                  >
                    {STATUS_LABEL[result.status] || result.status}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-[#FAFAF9] p-4">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">희망 날짜</p>
                    <p className="text-sm font-bold text-[#2C2C2C]">{result.event_date || '-'}</p>
                  </div>
                  <div className="rounded-2xl bg-[#FAFAF9] p-4">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">연락처</p>
                    <p className="text-sm font-bold text-[#2C2C2C]">{result.phone || '-'}</p>
                  </div>
                  <div className="rounded-2xl bg-[#FAFAF9] p-4">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">{type === 'busker' ? '팀명 / 장르' : '카테고리 / 부스'}</p>
                    <p className="text-sm font-bold text-[#2C2C2C]">
                      {type === 'busker'
                        ? `${result.team || '솔로'} / ${result.genre || '-'}`
                        : `${result.category || '-'} / ${result.booths || 1}부스`}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#FAFAF9] p-4">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">비용</p>
                    <p className="text-sm font-bold text-[#2C2C2C]">₩{Number(result.fee || 0).toLocaleString()}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <p className="text-lg font-bold text-[#2C2C2C]">일치하는 신청 내역을 찾지 못했습니다.</p>
                <p className="mt-2 text-sm text-[#6B6B6B]">신청자명과 휴대폰 번호를 다시 확인해 주세요.</p>
              </div>
            )}
          </div>
        )}

        {(settings.deposit_bank || settings.deposit_account) && (
          <div className="mt-6 rounded-[28px] border border-[#FED7AA] bg-[#FFF7ED] p-6 shadow-sm md:p-8">
            <p className="mb-2 text-sm font-black text-[#C2410C]">입금 안내</p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-white/70 p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#9A3412]">입금 은행</p>
                <p className="text-lg font-black text-[#7C2D12]">{settings.deposit_bank || '-'}</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4">
                <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#9A3412]">계좌번호</p>
                <p className="text-lg font-black text-[#7C2D12]">{settings.deposit_account || '-'}</p>
              </div>
            </div>
            <p className="mt-3 text-sm font-medium text-[#9A3412]">
              입금 시 신청자명과 동일하게 보내주시면 확인이 빠릅니다.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

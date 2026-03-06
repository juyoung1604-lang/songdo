'use client';

import React, { useEffect, useState } from 'react';
import { DB } from '@/lib/supabase';
import { useToast } from '@/components/admin/Toast';

type RevRow = {
  id: string;
  date: string;
  modifiedAt?: string;
  type: '버스커' | '셀러';
  name: string;
  item: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'refunded';
  method: string;
  sourceId: string;
  sourceTable: 'buskers' | 'sellers';
};

const RevenuePage = () => {
  const [buskers, setBuskers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortField, setSortField] = useState<string>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    const [bk, sk] = await Promise.all([DB.getBuskers(), DB.getSellers()]);
    setBuskers(bk || []);
    setSellers(sk || []);
    setLoading(false);
  };

  const deriveRows = (): RevRow[] => {
    let rows: RevRow[] = [
      ...buskers
        .filter(b => b.status === 'approved' || b.status === 'refunded')
        .map(b => {
          const isPaid = b.status === 'approved';
          return {
            id: 'bk_' + b.id,
            date: ((isPaid ? b.updated_at : b.applied_at) || b.applied_at || b.event_date || '').split('T')[0],
            modifiedAt: b.updated_at ? b.updated_at.split('T')[0] : undefined,
            type: '버스커' as const,
            name: b.name,
            item: `보증금 (${b.event_date})`,
            amount: (b.fee !== undefined && b.fee !== null) ? b.fee : 50000,
            status: (isPaid ? 'paid' : b.status === 'refunded' ? 'refunded' : 'unpaid') as any,
            method: b.payment_method || '계좌이체',
            sourceId: b.id,
            sourceTable: 'buskers' as const,
          };
        }),
      ...sellers
        .filter(s => s.status === 'approved' || s.status === 'paid' || s.status === 'refunded')
        .map(s => {
          const isPaid = s.status === 'paid';
          return {
            id: 'sk_' + s.id,
            date: ((isPaid ? s.updated_at : s.applied_at) || s.applied_at || s.event_date || '').split('T')[0],
            modifiedAt: s.updated_at ? s.updated_at.split('T')[0] : undefined,
            type: '셀러' as const,
            name: s.name,
            item: `부스비 (${s.event_date})${s.booths > 1 ? ` ${s.booths}부스` : ''}`,
            amount: (s.fee !== undefined && s.fee !== null) ? s.fee : 30000,
            status: (isPaid ? 'paid' : s.status === 'refunded' ? 'refunded' : 'unpaid') as any,
            method: s.payment_method || '계좌이체',
            sourceId: s.id,
            sourceTable: 'sellers' as const,
          };
        }),
    ];

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(r => 
        r.date.includes(q) || 
        r.type.includes(q) || 
        r.name.toLowerCase().includes(q) || 
        r.method.includes(q) || 
        (r.status === 'paid' ? '입금완료' : r.status === 'refunded' ? '환불' : '미입금').includes(q)
      );
    }

    // Filter by date (calendar selection)
    if (dateFilter) {
      rows = rows.filter(r => r.date === dateFilter);
    }

    rows.sort((a, b) => {
      let valA = (a as any)[sortField];
      let valB = (b as any)[sortField];

      if (typeof valA === 'string') {
        return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });

    return rows;
  };

  const rows = deriveRows();
  
  // Calculate all stats from the DERIVED rows to ensure consistency
  const paidRows = rows.filter(r => r.status === 'paid');
  const unpaidRows = rows.filter(r => r.status === 'unpaid');
  const refundedRows = rows.filter(r => r.status === 'refunded');

  const paidBooth = paidRows.filter(r => r.sourceTable === 'sellers').reduce((sum, r) => sum + r.amount, 0);
  const paidDeposit = paidRows.filter(r => r.sourceTable === 'buskers').reduce((sum, r) => sum + r.amount, 0);
  
  const totalPaid = paidRows.reduce((sum, r) => sum + r.amount, 0);
  const totalUnpaid = unpaidRows.reduce((sum, r) => sum + r.amount, 0);
  const totalRefunded = refundedRows.reduce((sum, r) => sum + r.amount, 0);

  // New Calculations
  const now = new Date();
  // Using local month string for more accuracy in local env
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const curMonthStr = `${curYear}-${String(curMonth).padStart(2, '0')}`;
  
  // Weekly calculation (current week: Sun to Sat)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const monthlyPaidOnly = paidRows
    .filter(r => r.date.startsWith(curMonthStr))
    .reduce((sum, r) => sum + r.amount, 0);

  const monthlyRefundedOnly = refundedRows
    .filter(r => r.date.startsWith(curMonthStr))
    .reduce((sum, r) => sum + r.amount, 0);

  // 이번달 수입 = (보증금+부스비 총합) - 환불금
  // 이미 paidRows와 refundedRows로 나뉘어 있으므로, 
  // 순수하게 '입금완료' 상태인 금액이 '수입'의 결과값이 됩니다.
  const monthlyRev = monthlyPaidOnly; 

  const weeklyPaid = paidRows
    .filter(r => {
      const d = new Date(r.date);
      return d >= startOfWeek && d < endOfWeek;
    })
    .reduce((sum, r) => sum + r.amount, 0);

  const unpaidBuskers = unpaidRows.filter(r => r.type === '버스커').length;
  const unpaidSellers = unpaidRows.filter(r => r.type === '셀러').length;

  // Monthly chart data (paid rows)
  const monthlyData: { [m: number]: number } = {};
  paidRows.forEach(r => {
    const m = parseInt((r.date || '').split('-')[1] || '0');
    if (m) monthlyData[m] = (monthlyData[m] || 0) + r.amount;
  });
  const maxValChart = Math.max(...Object.values(monthlyData), 1);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleMethodCycle = async (row: RevRow) => {
    const methods = ['계좌이체', '카드', '현금'];
    const curIdx = methods.indexOf(row.method);
    const nextMethod = methods[(curIdx + 1) % methods.length];
    
    let error;
    if (row.sourceTable === 'buskers') {
      const res = await DB.updateBusker(row.sourceId, { payment_method: nextMethod });
      error = res.error;
    } else {
      const res = await DB.updateSeller(row.sourceId, { payment_method: nextMethod });
      error = res.error;
    }

    if (!error) {
      toast(`결제수단이 ${nextMethod}(으)로 변경되었습니다.`, 'jade');
      // Update local state without fetchAll()
      if (row.sourceTable === 'buskers') {
        setBuskers(prev => prev.map(b => b.id === row.sourceId ? { ...b, payment_method: nextMethod } : b));
      } else {
        setSellers(prev => prev.map(s => s.id === row.sourceId ? { ...s, payment_method: nextMethod } : s));
      }
    } else {
      toast('변경 실패: ' + (error as any).message, 'rose');
    }
  };

  const handleStatusToggle = async (row: RevRow) => {
    const statusCycle: Record<string, string> = {
      unpaid: 'paid',
      paid: 'refunded',
      refunded: 'unpaid'
    };
    const nextStatus = statusCycle[row.status] || 'unpaid';
    
    // Map to actual DB status
    let dbStatus = nextStatus;
    if (row.sourceTable === 'buskers') {
      if (nextStatus === 'paid') dbStatus = 'approved';
      else if (nextStatus === 'unpaid') dbStatus = 'pending';
      // 'refunded' remains 'refunded'
    } else {
      // Sellers: 'paid', 'approved' (means unpaid here), 'refunded'
      if (nextStatus === 'unpaid') dbStatus = 'approved';
      // 'paid', 'refunded' remain same
    }

    const { error } = await DB.updateStatus(row.sourceTable, row.sourceId, dbStatus);
    
    if (!error) { 
      toast('상태가 변경되었습니다.', 'jade'); 
      if (row.sourceTable === 'buskers') {
        setBuskers(prev => prev.map(b => b.id === row.sourceId ? { ...b, status: dbStatus } : b));
      } else {
        setSellers(prev => prev.map(s => s.id === row.sourceId ? { ...s, status: dbStatus } : s));
      }
    } else {
      toast('변경 실패: ' + (error as any).message, 'rose');
    }
  };

  return (
    <div className="space-y-6">
      <div className="kpi-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="kpi" style={{ '--kc': 'var(--sky)' } as React.CSSProperties}>
          <div className="kpi-l">이번 달 수입</div>
          <div className="kpi-v">{(monthlyRev / 10000).toFixed(1)}만</div>
          <div className="kpi-sub">{now.getMonth() + 1}월 합계</div>
        </div>
        <div className="kpi" style={{ '--kc': 'var(--gold)' } as React.CSSProperties}>
          <div className="kpi-l">주간 수납</div>
          <div className="kpi-v">{(weeklyPaid / 10000).toFixed(1)}만</div>
          <div className="kpi-sub">이번 주 합계</div>
        </div>
        <div className="kpi" style={{ '--kc': 'var(--jade)' } as React.CSSProperties}>
          <div className="kpi-l">부스비 수입</div>
          <div className="kpi-v">{(paidBooth / 10000).toFixed(1)}만</div>
          <div className="kpi-sub">셀러 누적</div>
        </div>
        <div className="kpi" style={{ '--kc': 'var(--rose)' } as React.CSSProperties}>
          <div className="kpi-l">미입금</div>
          <div className="kpi-v">{(totalUnpaid / 10000).toFixed(1)}만</div>
          <div className="kpi-sub">버스커 {unpaidBuskers} / 셀러 {unpaidSellers}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '14px' }}>
        <div className="card">
          <div className="card-h"><span className="card-title">매출 요약 (월별)</span></div>
          <div className="card-body">
            <div className="bar-chart" style={{ height: '150px' }}>
              {[1, 2, 3, 4, 5, 6].map(m => {
                const val = monthlyData[m] || 0;
                const h = val > 0 ? Math.max(20, Math.round((val / maxValChart) * 120)) : 8;
                return (
                  <div key={m} className="bc-col">
                    <div
                      className="bc-bar"
                      style={{ height: `${h}px`, background: m === curMonth ? 'var(--jade)' : 'var(--gold)', opacity: val === 0 ? 0.2 : 1 }}
                    />
                    <div className="bc-lbl">{m}월</div>
                    {val > 0 && <div style={{ fontSize: '.55rem', color: 'var(--muted)', marginTop: '2px' }}>{(val / 10000).toFixed(1)}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h"><span className="card-title">항목별 요약</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="rev-summary">
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--soft)' }}>셀러 부스비</span>
                <span style={{ color: 'var(--jade)', fontFamily: 'var(--font-mono)' }}>+{(paidBooth / 10000).toFixed(1)}만</span>
              </div>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--soft)' }}>버스커 보증금</span>
                <span style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{(paidDeposit / 10000).toFixed(1)}만</span>
              </div>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--soft)' }}>미입금</span>
                <span style={{ color: 'var(--rose)', fontFamily: 'var(--font-mono)' }}>{(totalUnpaid / 10000).toFixed(1)}만</span>
              </div>
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--soft)' }}>환불금</span>
                <span style={{ color: 'var(--lav)', fontFamily: 'var(--font-mono)' }}>{(totalRefunded / 10000).toFixed(1)}만</span>
              </div>
              <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', background: 'var(--ink3)' }}>
                <span style={{ fontWeight: 700 }}>입금액 합계</span>
                <span style={{ color: 'var(--jade)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  {(totalPaid / 10000).toFixed(1)}만
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="tbl-toolbar" style={{ marginTop: '20px', gap: '10px' }}>
        <div className="search-box" style={{ flex: 1 }}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input 
            type="text" 
            placeholder="이름, 구분, 결제수단 등으로 검색…" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <div className="search-box" style={{ width: '180px' }}>
          <i className="fa-solid fa-calendar-days" style={{ color: 'var(--jade)', fontSize: '.85rem' }}></i>
          <input 
            type="date" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--head)', 
              fontSize: '.85rem',
              width: '100%',
              paddingLeft: '32px',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-ghost" onClick={() => { setSearch(''); setDateFilter(''); fetchAll(); }}>
            <i className="fa-solid fa-rotate"></i> 초기화
          </button>
        </div>
      </div>

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>일자</th>
              <th style={{ whiteSpace: 'nowrap' }}>구분</th>
              <th>이름</th>
              <th style={{ whiteSpace: 'nowrap' }}>항목</th>
              <th style={{ whiteSpace: 'nowrap' }}>금액</th>
              <th style={{ whiteSpace: 'nowrap' }}>결제수단</th>
              <th style={{ whiteSpace: 'nowrap' }}>상태</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}><span className="spinner"></span></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--dim)' }}>신청 데이터가 없습니다.</td></tr>
            ) : rows.map((r) => (
              <tr key={r.id}>
                <td className="td-mono">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span>{r.date}</span>
                    {r.modifiedAt && r.modifiedAt !== r.date && (
                      <span style={{ fontSize: '.6rem', color: 'var(--dim)', whiteSpace: 'nowrap' }}>
                        (최종: {r.modifiedAt})
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`badge b-${r.type === '버스커' ? 'confirmed' : 'paid'}`}>{r.type}</span>
                </td>
                <td className="td-main">{r.name}</td>
                <td>{r.item}</td>
                <td className="td-mono">₩{r.amount.toLocaleString()}</td>
                <td>
                  <span 
                    style={{ 
                      cursor: 'pointer', 
                      padding: '3px 10px', 
                      borderRadius: '100px',
                      fontSize: '.68rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: r.method === '카드' ? 'var(--lav-bg)' : r.method === '계좌이체' ? 'var(--sky-bg)' : 'var(--jade-bg)',
                      color: r.method === '카드' ? 'var(--lav)' : r.method === '계좌이체' ? 'var(--sky)' : 'var(--jade)',
                      border: `1px solid ${r.method === '카드' ? 'var(--lav)' : r.method === '계좌이체' ? 'var(--sky)' : 'var(--jade)'}20`
                    }}
                    onClick={() => handleMethodCycle(r)}
                  >
                    <i className={`fa-solid ${r.method === '카드' ? 'fa-credit-card' : r.method === '계좌이체' ? 'fa-building-columns' : 'fa-money-bill-1'}`} style={{ fontSize: '.6rem' }}></i>
                    {r.method}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge b-${r.status === 'paid' ? 'approved' : r.status === 'refunded' ? 'rejected' : 'unpaid'}`}
                    style={{ 
                      cursor: 'pointer',
                      background: r.status === 'refunded' ? 'var(--lav-bg)' : undefined,
                      color: r.status === 'refunded' ? 'var(--lav)' : undefined,
                      borderColor: r.status === 'refunded' ? 'var(--lav)' : undefined
                    }}
                    onClick={() => handleStatusToggle(r)}
                    title="클릭하여 상태 변경"
                  >
                    {r.status === 'paid' ? '입금완료' : r.status === 'refunded' ? '환불' : '미입금'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenuePage;

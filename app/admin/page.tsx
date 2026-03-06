// app/admin/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import KpiRow from '@/components/admin/KpiRow';
import { DB } from '@/lib/supabase';

const Dashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    pendingBuskers: 0,
    pendingSellers: 0,
    buskers: 0,
    sellers: 0,
    revenue: 0,
    nextEventDays: '—',
    nextEventDate: '—'
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [weeklyTrend, setWeeklyTrend] = useState<any[]>([]);
  const [opStats, setOpStats] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const [buskers, sellers, events] = await Promise.all([
      DB.getBuskers(),
      DB.getSellers(),
      DB.getEvents()
    ]);

    // Basic Stats
    const pb = buskers.filter((x: any) => x.status === 'pending').length;
    const ps = sellers.filter((x: any) => x.status === 'pending').length;
    
    // Consistent revenue calculation: Sellers (paid) + Buskers (approved deposits)
    const paidSellersRev = sellers.filter((s: any) => s.status === 'paid').reduce((sum: number, s: any) => sum + (s.fee || 30000), 0);
    const approvedBuskersRev = buskers.filter((b: any) => b.status === 'approved').reduce((sum: number, b: any) => sum + (b.fee || 50000), 0);
    const paidRev = paidSellersRev + approvedBuskersRev;
    
    const today = new Date();
    const nextEvent = events.filter((e: any) => new Date(e.event_date) >= today)
      .sort((a: any, b: any) => a.event_date.localeCompare(b.event_date))[0];
    
    let daysDiff = '—';
    if (nextEvent) {
      const diffTime = new Date(nextEvent.event_date).getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysDiff = diffDays <= 0 ? '오늘' : `${diffDays}일`;
    }

    setStats({
      total: buskers.length + sellers.length,
      pending: pb + ps,
      pendingBuskers: pb,
      pendingSellers: ps,
      buskers: buskers.length,
      sellers: sellers.length,
      revenue: Math.floor(paidRev / 1000) / 10, // In 'Man-won' with 1 decimal place
      nextEventDays: daysDiff,
      nextEventDate: nextEvent?.event_date || '—'
    });

    // Calculate Weekly Trend (Last 5 weeks)
    const weeks: any[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - (i * 7));
      // Get the start of that week (Sunday)
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      const label = `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()}`;
      
      const buskerCount = buskers.filter((b: any) => {
        const date = new Date(b.applied_at || b.created_at);
        return date >= startOfWeek && date < endOfWeek;
      }).length;
      
      const sellerCount = sellers.filter((s: any) => {
        const date = new Date(s.applied_at || s.created_at);
        return date >= startOfWeek && date < endOfWeek;
      }).length;
      
      weeks.push({ label, busker: buskerCount, seller: sellerCount });
    }
    setWeeklyTrend(weeks);

    // Calculate Operational Stats
    const buskerApprovalRate = buskers.length > 0 
      ? Math.round((buskers.filter((b: any) => b.status === 'approved').length / buskers.length) * 100) 
      : 0;
    
    // For booth fulfillment, we check the latest/next event
    const sellerBoothFulfillment = nextEvent && nextEvent.seller_count > 0
      ? Math.min(100, Math.round((sellers.filter((s: any) => s.event_date === nextEvent.event_date && s.status !== 'rejected').length / nextEvent.seller_count) * 100))
      : 0;

    const paymentCompletionRate = sellers.filter((s: any) => s.status === 'approved' || s.status === 'paid').length > 0
      ? Math.round((sellers.filter((s: any) => s.status === 'paid').length / sellers.filter((s: any) => s.status === 'approved' || s.status === 'paid').length) * 100)
      : 0;

    setOpStats([
      { label: '버스커 승인율', value: buskerApprovalRate, color: 'var(--jade)' },
      { label: '셀러 부스 충족', value: sellerBoothFulfillment || 85, color: 'var(--gold)' },
      { label: '결제 완료율', value: paymentCompletionRate, color: 'var(--sky)' },
      { label: '예상 만족도', value: 91, color: 'var(--lav)' }
    ]);

    // Activities from real data
    const recentBuskers = [...buskers].sort((a: any, b: any) => (b.applied_at || '').localeCompare(a.applied_at || '')).slice(0, 2);
    const recentSellers = [...sellers].sort((a: any, b: any) => (a.applied_at || '').localeCompare(b.applied_at || '')).slice(0, 2);
    
    const newActivities = [];
    if (pb + ps > 0) {
      newActivities.push({ type: 'file-pen', color: 'var(--jade)', title: '신규 신청 확인', desc: `대기 중인 신청이 총 ${pb + ps}건 있습니다.`, time: '방금 전' });
    }
    
    recentBuskers.forEach((b: any) => {
      if (b.status === 'approved') {
        newActivities.push({ type: 'check', color: 'var(--jade)', title: '버스커 승인', desc: `${b.name} (${b.team}) 팀 승인됨`, time: '최근' });
      }
    });

    if (paidRev > 0) {
      newActivities.push({ type: 'credit-card', color: 'var(--sky)', title: '매출 합계', desc: `총 ₩${paidRev.toLocaleString()} 결제 완료`, time: '현재' });
    }

    setActivities(newActivities.length > 0 ? newActivities : [
      { type: 'info-circle', color: 'var(--muted)', title: '활동 없음', desc: '최근 활동 내역이 없습니다.', time: '-' }
    ]);
  };

  return (
    <div className="space-y-6">
      <KpiRow stats={stats} />

      {/* 퀵 링크 섹션 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        <div 
          className="card" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--rose-line)' }}
          onClick={() => router.push('/admin/settings')}
        >
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--rose)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              <i className="fa-solid fa-image"></i>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text)' }}>홈페이지 비주얼 설정</div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '2px' }}>히어로 및 섹션 이미지 관리</div>
            </div>
          </div>
        </div>
        <div 
          className="card" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          onClick={() => router.push('/admin/buskers')}
        >
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--jade)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              <i className="fa-solid fa-microphone"></i>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text)' }}>버스커 관리</div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '2px' }}>{stats.buskers}건의 신청 확인</div>
            </div>
          </div>
        </div>
        <div 
          className="card" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          onClick={() => router.push('/admin/sellers')}
        >
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              <i className="fa-solid fa-store"></i>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text)' }}>셀러 관리</div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '2px' }}>{stats.sellers}건의 신청 확인</div>
            </div>
          </div>
        </div>
        <div 
          className="card" 
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          onClick={() => router.push('/admin/calendar')}
        >
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--sky)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
              <i className="fa-solid fa-calendar-check"></i>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--text)' }}>행사 일정</div>
              <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '2px' }}>{stats.nextEventDate} 예정</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr', gap: '14px' }}>
        {/* 주간 신청 추이 */}
        <div className="card">
          <div className="card-h">
            <span className="card-title">주간 신청 추이</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '.65rem', color: 'var(--jade)' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--jade)', borderRadius: '50%' }}></span>버스커
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '.65rem', color: 'var(--gold)' }}>
                <span style={{ width: '8px', height: '8px', background: 'var(--gold)', borderRadius: '50%' }}></span>셀러
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="bar-chart" style={{ height: '160px' }}>
              {weeklyTrend.map((d, i) => {
                const maxVal = Math.max(...weeklyTrend.map(w => Math.max(w.busker, w.seller, 1)), 10);
                return (
                  <div key={i} className="bc-col">
                    <div style={{ width: '100%', display: 'flex', gap: '3px', alignItems: 'flex-end', flex: 1 }}>
                      <motion.div 
                        className="bc-bar" 
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.busker / maxVal) * 120}px` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        style={{ background: 'linear-gradient(to top, var(--jade), rgba(0,212,160,.2))' }}
                      />
                      <motion.div 
                        className="bc-bar" 
                        initial={{ height: 0 }}
                        animate={{ height: `${(d.seller / maxVal) * 120}px` }}
                        transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }}
                        style={{ background: 'linear-gradient(to top, var(--gold), rgba(240,165,0,.2))' }}
                      />
                    </div>
                    <div className="bc-lbl">{d.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 운영 현황 */}
        <div className="card">
          <div className="card-h">
            <span className="card-title">운영 현황</span>
          </div>
          <div className="card-body">
            <div className="stat-bar-wrap">
              {opStats.map((s, i) => (
                <div key={i} className="stat-bar">
                  <div className="stat-bar-top">
                    <span className="stat-bar-label">{s.label}</span>
                    <span className="stat-bar-val">{s.value}%</span>
                  </div>
                  <div className="stat-bar-track">
                    <motion.div 
                      className="stat-bar-fill" 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      style={{ background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 최근 활동 */}
        <div className="card">
          <div className="card-h">
            <span className="card-title">최근 활동</span>
            <button className="btn btn-ghost" style={{ fontSize: '.7rem' }} onClick={fetchDashboardData}>
              <i className="fa-solid fa-rotate"></i>
            </button>
          </div>
          <div className="card-body" style={{ padding: 0, height: '184px', overflowY: 'auto' }}>
            {activities.map((act, idx) => (
              <div 
                key={idx} 
                className="activity-item"
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '10px', 
                  padding: '10px 14px', 
                  borderBottom: '1px solid var(--line)',
                  transition: 'background 0.14s',
                  cursor: 'default'
                }}
              >
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  background: `${act.color}18`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: act.color, 
                  fontSize: '.75rem', 
                  flexShrink: 0 
                }}>
                  <i className={`fa-solid fa-${act.type}`}></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.8rem', color: 'var(--head)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.title}</div>
                  <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{act.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

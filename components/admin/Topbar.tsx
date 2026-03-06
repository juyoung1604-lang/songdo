// components/admin/Topbar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DB } from '@/lib/supabase';
import { usePathname } from 'next/navigation';

const Topbar = () => {
  const [time, setTime] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const timeStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]}) ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      setTime(timeStr);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleSync = () => {
    if (confirm('데이터를 새로고침 하시겠습니까? (캐시 초기화)')) {
      DB.cacheClear();
      window.location.reload();
    }
  };

  // Dynamic Navigation Title & Breadcrumb mapping
  const getPageInfo = () => {
    const segments = pathname.split('/').filter(Boolean);
    const isDashboard = segments.length === 1 && segments[0] === 'admin';
    const page = segments[1];

    if (isDashboard) {
      return { title: '대시보드', bc: '홈 / 대시보드' };
    }

    switch (page) {
      case 'buskers': return { title: '버스커 신청 관리', bc: '홈 / 신청 관리 / 버스커' };
      case 'sellers': return { title: '셀러 신청 관리', bc: '홈 / 신청 관리 / 셀러' };
      case 'calendar': return { title: '행사 캘린더', bc: '홈 / 운영 / 캘린더' };
      case 'popups': return { title: '홈페이지 팝업 관리', bc: '홈 / 운영 / 홈페이지 팝업' };
      case 'revenue': return { title: '매출 & 정산', bc: '홈 / 운영 / 매출' };
      case 'accounts': return { title: '계정 관리', bc: '홈 / 시스템 / 계정 관리' };
      case 'supabase': return { title: 'Supabase 연동', bc: '홈 / 시스템 / Supabase' };
      case 'settings': return { title: '설정', bc: '홈 / 시스템 / 설정' };
      default: return { title: '관리 시스템', bc: '홈' };
    }
  };

  const { title, bc } = getPageInfo();

  return (
    <header className="topbar">
      <div className="tb-left">
        <button className="hamburger" style={{ display: 'none' }}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <div>
          <div className="tb-page-name">{title}</div>
          <div className="tb-breadcrumb">{bc}</div>
        </div>
      </div>
      <div className="tb-right">
        <span className="tb-time">{time}</span>
        <button className="btn" onClick={handleSync} title="새로고침">
          <i className="fa-solid fa-rotate"></i>
        </button>
      </div>
    </header>
  );
};

export default Topbar;

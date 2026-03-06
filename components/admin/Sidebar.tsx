// components/admin/Sidebar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DB } from '@/lib/supabase';
import { useAdmin, ROLES } from '@/app/admin/layout';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, can } = useAdmin();
  const [userName, setUserName] = useState('관리자');

  useEffect(() => {
    if (user) {
      setUserName(user.user_metadata?.name || user.email?.split('@')[0] || '관리자');
    }
  }, [user]);

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await DB.signOut();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('demo_user');
        localStorage.removeItem('demo_user'); // Just in case
      }
      router.replace('/admin/login');
    }
  };

  const navItems = [
    { group: '메인', items: [
      { name: '대시보드', icon: 'fa-grid-2', path: '/admin', perm: 'view_all' }
    ]},
    { group: '신청 관리', items: [
      { name: '버스커 신청', icon: 'fa-microphone', path: '/admin/buskers', perm: 'view_all' },
      { name: '셀러 신청', icon: 'fa-store', path: '/admin/sellers', perm: 'view_all' },
      { name: '통합 인력 풀', icon: 'fa-address-book', path: '/admin/pool', perm: 'view_all' }
    ]},
    { group: '운영', items: [
      { name: '행사 캘린더', icon: 'fa-calendar-days', path: '/admin/calendar', perm: 'view_all' },
      { name: '홈페이지 팝업 관리', icon: 'fa-window-maximize', path: '/admin/popups', perm: 'view_all' },
      { name: '매출 & 정산', icon: 'fa-chart-bar', path: '/admin/revenue', perm: 'view_revenue' }
    ]},
    { group: '시스템', items: [
      { name: '계정 관리', icon: 'fa-users-gear', path: '/admin/accounts', perm: 'manage_accounts' },
      { name: 'Supabase 연동', icon: 'fa-database', path: '/admin/supabase', perm: 'system_settings' },
      { name: '설정', icon: 'fa-gear', path: '/admin/settings', perm: 'system_settings' }
    ]}
  ];

  const r = ROLES[role] || ROLES.operator;

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-gem">⛺</div>
        <div>
          <div className="sb-name">SONGDO ADMIN</div>
          <div className="sb-tag">Supabase Edition</div>
        </div>
      </div>
      <nav className="sb-nav">
        {navItems.map((group, idx) => (
          <React.Fragment key={idx}>
            <div className="sb-group">{group.group}</div>
            {group.items.map((item, i) => {
              const isLocked = !can(item.perm);
              return (
                <Link 
                  key={i} 
                  href={isLocked ? '#' : item.path} 
                  className={`sb-link ${pathname === item.path ? 'on' : ''} ${isLocked ? 'nav-locked' : ''}`}
                  onClick={(e) => { if (isLocked) e.preventDefault(); }}
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                  {item.name}
                  {isLocked && <i className="fa-solid fa-lock" style={{ marginLeft: 'auto', fontSize: '.6rem', color: 'var(--dim)' }}></i>}
                </Link>
              );
            })}
          </React.Fragment>
        ))}
      </nav>
      <div className="sb-foot">
        <div className="avatar" style={{ background: r.color }}>{userName[0]?.toUpperCase()}</div>
        <div className="av-info">
          <div className="av-name">{userName}</div>
          <div className="av-role">
            <span className={`role-badge-sb`} style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '2px 7px', borderRadius: '100px',
              fontSize: '.58rem', fontWeight: 700, letterSpacing: '.04em',
              background: `${r.color}18`, color: r.color, border: `1px solid ${r.color}30`
            }}>
              <i className={`fa-solid ${r.icon}`} style={{ fontSize: '.55rem' }}></i> {r.label}
            </span>
          </div>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: '.7rem', padding: '5px 9px' }} onClick={handleLogout}>로그아웃</button>
      </div>
    </aside>
  );
};

export default Sidebar;

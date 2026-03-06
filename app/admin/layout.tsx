// app/admin/layout.tsx
'use client';

import React, { useEffect, useState, createContext, useContext } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import { ToastProvider } from '@/components/admin/Toast';
import { useRouter, usePathname } from 'next/navigation';
import { supabase, DB } from '@/lib/supabase';
import './admin.css';

// ══════════════════════════════════════════════════
// RBAC — Roles & Permissions Configuration
// ══════════════════════════════════════════════════
export const ROLES: { [key: string]: any } = {
  super_admin: {
    key: 'super_admin', label: '슈퍼관리자', color: 'var(--jade)', icon: 'fa-crown',
    perms: { view_all: true, approve: true, reject: true, create: true, edit: true, delete: true, manage_accounts: true, view_revenue: true, system_settings: true }
  },
  admin: {
    key: 'admin', label: '관리자', color: 'var(--sky)', icon: 'fa-user-shield',
    perms: { view_all: true, approve: true, reject: true, create: true, edit: true, delete: true, manage_accounts: false, view_revenue: true, system_settings: true }
  },
  operator: {
    key: 'operator', label: '운영자', color: 'var(--lav)', icon: 'fa-user-check',
    perms: { view_all: true, approve: true, reject: true, create: false, edit: false, delete: false, manage_accounts: false, view_revenue: false, system_settings: false }
  },
};

export const PERM_LABELS: { [key: string]: string } = {
  view_all: '조회', approve: '승인', reject: '거절', create: '등록', edit: '수정', delete: '삭제',
  manage_accounts: '계정관리', view_revenue: '매출조회', system_settings: '설정'
};

const AdminContext = createContext<{
  user: any;
  role: string;
  can: (perm: string) => boolean;
  dynamicRoles: any;
  updateRolePerms: (roleKey: string, permKey: string, value: boolean) => void;
}>({
  user: null,
  role: 'operator',
  can: () => false,
  dynamicRoles: ROLES,
  updateRolePerms: () => {},
});

export const useAdmin = () => useContext(AdminContext);

const PermissionBanner = ({ role, roles }: { role: string, roles: any }) => {
  const r = roles[role] || roles.operator;
  return (
    <div className="perm-banner-bar" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '5px 22px', fontSize: '.68rem', background: 'var(--ink3)', borderBottom: '1px solid var(--line)' }}>
      <div className="perm-banner-dots" style={{ display: 'flex', gap: '3px' }}>
        {Object.keys(PERM_LABELS).map(k => (
          <div 
            key={k} 
            className="pb-dot" 
            style={{ width: '7px', height: '7px', borderRadius: '50%', background: r.perms[k] ? r.color : 'var(--line2)', boxShadow: r.perms[k] ? `0 0 5px ${r.color}` : 'none' }}
            title={PERM_LABELS[k]}
          />
        ))}
      </div>
      <span id="perm-banner-text" style={{ flex: 1 }}>
        <b style={{ color: r.color }}>{r.label}</b>로 접속 중 | 
        <span style={{ color: r.color, marginLeft: '5px' }}>✓ {Object.entries(r.perms).filter(([_, v]) => v).map(([k]) => PERM_LABELS[k]).join(' · ')}</span>
      </span>
    </div>
  );
};

const SupabaseStatusBar = () => {
  const [online, setOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    const checkStatus = () => {
      setOnline(typeof window !== 'undefined' ? window.navigator.onLine : true);
      setQueueCount(DB.getQueue().length);
    };
    checkStatus();
    window.addEventListener('online', checkStatus);
    window.addEventListener('offline', checkStatus);
    const interval = setInterval(checkStatus, 3000);
    return () => {
      window.removeEventListener('online', checkStatus);
      window.removeEventListener('offline', checkStatus);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="supa-bar" style={{ background: 'var(--ink3)', borderBottom: '1px solid var(--line)', padding: '5px 22px', display: 'flex', alignItems: 'center', gap: '14px', fontSize: '.67rem' }}>
      <div className="supa-logo" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--soft)' }}>
        <i className="fa-solid fa-database" style={{ color: '#3ECF8E' }}></i> Supabase
      </div>
      <div className={`dot-pulse ${online ? 'dot-jade' : 'dot-gold'}`} style={{ width: '7px', height: '7px', borderRadius: '50%', background: online ? 'var(--jade)' : 'var(--gold)', boxShadow: online ? '0 0 6px var(--jade)' : '0 0 6px var(--gold)' }}></div>
      <span className="supa-status-text" style={{ color: 'var(--soft)', fontFamily: 'var(--font-mono)' }}>{online ? '연결됨' : '미연결 (오프라인)'}</span>
      {queueCount > 0 && <span style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}>(미동기화 {queueCount}건)</span>}
      <div className="supa-right" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button className="supa-btn" style={{ padding: '3px 10px', borderRadius: '4px', border: '1px solid var(--line2)', background: 'none', color: 'var(--muted)', fontSize: '.65rem', cursor: 'pointer' }} onClick={() => window.location.reload()}><i className="fa-solid fa-rotate"></i> 동기화</button>
      </div>
    </div>
  );
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('operator');
  const [dynamicRoles, setDynamicRoles] = useState<any>(ROLES);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Load dynamic roles from local storage
    const savedRoles = localStorage.getItem('admin_dynamic_roles');
    if (savedRoles) {
      setDynamicRoles(JSON.parse(savedRoles));
    }
  }, []);

  const updateRolePerms = (roleKey: string, permKey: string, value: boolean) => {
    const updated = {
      ...dynamicRoles,
      [roleKey]: {
        ...dynamicRoles[roleKey],
        perms: {
          ...dynamicRoles[roleKey].perms,
          [permKey]: value
        }
      }
    };
    setDynamicRoles(updated);
    localStorage.setItem('admin_dynamic_roles', JSON.stringify(updated));
  };

  const can = (perm: string) => {
    const currentRole = dynamicRoles[role];
    return currentRole?.perms[perm] === true;
  };

  useEffect(() => {
    const checkAuth = async () => {
      let sessionData = null;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        sessionData = session;
      } catch (e) {
        console.warn('Supabase session check failed, checking fallback');
      }
      
      // Fallback for demo login
      if (!sessionData && typeof window !== 'undefined') {
        const savedUser = sessionStorage.getItem('demo_user');
        if (savedUser) {
          sessionData = { user: JSON.parse(savedUser) };
        }
      }

      if (!sessionData) {
        setUser(null);
        if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      } else {
        setUser(sessionData.user);
        // Load role from profile
        const profiles = await DB.getAdminProfiles();
        const myProfile = Array.isArray(profiles) ? profiles.find((p: any) => p.id === sessionData.user.id || p.email === sessionData.user.email) : null;
        setRole(myProfile?.role || sessionData.user.user_metadata?.role || 'super_admin');
        
        if (pathname === '/admin/login') {
          router.replace('/admin');
        }
      }
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        if (typeof window !== 'undefined' && !sessionStorage.getItem('demo_user')) {
          setUser(null);
          if (pathname !== '/admin/login') {
            router.replace('/admin/login');
          }
        }
      } else if (session) {
        setUser(session.user);
        if (pathname === '/admin/login') {
          router.replace('/admin');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="admin-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <span className="spinner spinner-lg"></span>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Permission guards
  const guards: { [key: string]: string } = {
    '/admin/revenue': 'view_revenue',
    '/admin/accounts': 'manage_accounts',
    '/admin/settings': 'system_settings'
  };

  if (guards[pathname] && !can(guards[pathname])) {
    return (
      <div className="admin-shell" style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <div style={{ fontSize: '3rem' }}>🚫</div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--head)' }}>접근 권한이 없습니다</h2>
          <p style={{ color: 'var(--muted)' }}>이 메뉴에 접근하려면 적절한 권한이 필요합니다.</p>
        </div>
        <button className="btn btn-jade" onClick={() => router.push('/admin')}>대시보드 돌아가기</button>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ user, role, can, dynamicRoles, updateRolePerms }}>
      <ToastProvider>
        <div className="admin-shell">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
          
          <Sidebar />
          <div className="admin-main">
            <SupabaseStatusBar />
            <PermissionBanner role={role} roles={dynamicRoles} />
            <Topbar />
            <main className="admin-content">
              {children}
            </main>
          </div>
        </div>
      </ToastProvider>
    </AdminContext.Provider>
  );
}

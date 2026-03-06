// app/admin/accounts/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DB } from '@/lib/supabase';
import InviteModal from '@/components/admin/InviteModal';
import AddAccountModal from '@/components/admin/AddAccountModal';
import EditAccountModal from '@/components/admin/EditAccountModal';
import { useAdmin, PERM_LABELS } from '../layout';

// ══════════════════════════════════════════════════
// Hierarchy Configuration
// ══════════════════════════════════════════════════
const ROLE_RANK: Record<string, number> = {
  super_admin: 3,
  admin: 2,
  operator: 1
};

const AccountsPage = () => {
  const { can, user: currentUser, role: currentUserRole, dynamicRoles, updateRolePerms } = useAdmin();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [pData, lData] = await Promise.all([
      DB.getAdminProfiles(),
      DB.getAdminLogs()
    ]);
    setProfiles(pData || []);
    setLogs(lData || []);
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, name: string, newStatus: string) => {
    if (!can('manage_accounts')) return;
    if (!confirm(`'${name}'님의 계정 상태를 '${newStatus === 'active' ? '활성' : '비활성'}'(으)로 변경하시겠습니까?`)) return;
    
    const { error } = await DB.updateAdminProfile(id, { status: newStatus });
    if (!error) {
      await DB.createAdminLog({
        type: newStatus === 'active' ? 'user-check' : 'ban',
        color: newStatus === 'active' ? 'var(--jade)' : 'var(--rose)',
        title: '계정 상태 변경',
        desc: `'${name}' 계정이 ${newStatus === 'active' ? '활성화' : '비활성화'}되었습니다.`,
        created_at: new Date().toISOString()
      });
      fetchData();
    }
    else alert('업데이트 실패: ' + error.message);
  };

  const handleRoleCycle = async (id: string, name: string, currentRole: string) => {
    if (!can('manage_accounts')) return;
    
    // Get roles that are LOWER than the current user's role
    const availableRoles = Object.keys(dynamicRoles).filter(r => ROLE_RANK[r] < ROLE_RANK[currentUserRole]);
    
    if (availableRoles.length === 0) {
      return alert('변경 가능한 하위 역할이 없습니다.');
    }

    const curIdx = availableRoles.indexOf(currentRole);
    const nextRole = availableRoles[(curIdx + 1) % availableRoles.length];

    if (!confirm(`'${name}'님의 역할을 '${dynamicRoles[nextRole].label}'(으)로 변경하시겠습니까?`)) return;

    const { error } = await DB.updateAdminProfile(id, { role: nextRole });
    if (!error) {
      await DB.createAdminLog({
        type: 'shield-halved',
        color: 'var(--sky)',
        title: '역할 변경',
        desc: `'${name}'님의 역할이 '${dynamicRoles[nextRole].label}'(으)로 변경되었습니다.`,
        created_at: new Date().toISOString()
      });
      fetchData();
    } else {
      alert('변경 실패: ' + error.message);
    }
  };

  const handleDeleteProfile = async (id: string, name: string) => {
    if (!can('manage_accounts')) return;
    if (!confirm(`'${name}' 계정을 영구적으로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;

    const { error } = await DB.deleteAdminProfile(id);
    if (!error) {
      await DB.createAdminLog({
        type: 'trash',
        color: 'var(--rose)',
        title: '계정 삭제',
        desc: `'${name}' 계정이 삭제되었습니다.`,
        created_at: new Date().toISOString()
      });
      alert('계정이 삭제되었습니다.');
      fetchData();
    } else {
      alert('삭제 실패: ' + (error as any).message);
    }
  };

  // Filter profiles: Only show accounts with rank LESS THAN OR EQUAL TO current user
  // Also filter by category tab
  const filteredData = profiles.filter(p => {
    const isVisibleByRank = ROLE_RANK[p.role] <= ROLE_RANK[currentUserRole];
    const isVisibleByFilter = filter === 'all' || p.role === filter;
    return isVisibleByRank && isVisibleByFilter;
  });

  const getRoleCounts = () => {
    const counts: any = { super_admin: 0, admin: 0, operator: 0 };
    profiles.forEach(p => { if (counts[p.role] !== undefined) counts[p.role]++; });
    return counts;
  };
  const counts = getRoleCounts();

  return (
    <div className="space-y-6">
      <div className="acc-level-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
        {Object.entries(dynamicRoles)
          .filter(([key]) => ROLE_RANK[key] <= ROLE_RANK[currentUserRole]) // Hide upper role stats
          .map(([key, r]: [string, any]) => (
          <div 
            key={key} 
            className="alc" 
            onClick={() => setFilter(key)}
            style={{ 
              border: filter === key ? `1px solid ${r.color}` : '1px solid var(--line)', 
              boxShadow: filter === key ? `0 0 15px ${r.color}10` : 'none',
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            <div className="alc-icon"><i className={`fa-solid ${r.icon}`} style={{ color: r.color }}></i></div>
            <div className="alc-name">{r.label}</div>
            <div className="alc-cnt">{counts[key] || 0}</div>
            <div className="alc-desc">{r.label} 권한을 가진 계정 수입니다.</div>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: r.color }}></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px' }}>
        <div>
          <div className="tbl-toolbar">
            <div className="search-box">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input type="text" placeholder="이름, 이메일 검색…" />
            </div>
            <div className="ftabs">
              <button className={`ftab ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>전체</button>
              {Object.entries(dynamicRoles)
                .filter(([key]) => ROLE_RANK[key] <= ROLE_RANK[currentUserRole])
                .map(([key, r]: [string, any]) => (
                  <button key={key} className={`ftab ${filter === key ? 'on' : ''}`} onClick={() => setFilter(key)}>{r.label}</button>
                ))
              }
            </div>
            <div className="tbl-actions">
              {can('manage_accounts') && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost" onClick={() => setIsAddOpen(true)}>
                    <i className="fa-solid fa-user-check"></i> 직접 회원 등록
                  </button>
                  <button className="btn btn-jade" onClick={() => setIsInviteOpen(true)}>
                    <i className="fa-solid fa-user-plus"></i> 신규 사용자 초대
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>사용자</th><th>역할</th><th>상태</th><th>마지막 로그인</th><th>관리</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px' }}><span className="spinner"></span></td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: 'var(--dim)' }}>사용자가 없습니다.</td></tr>
                ) : filteredData.map((u, i) => {
                  const isSelf = u.id === currentUser?.id || u.email === currentUser?.email;
                  const roleInfo = dynamicRoles[u.role] || dynamicRoles.operator;
                  const isPeerSuperAdmin = currentUserRole === 'super_admin' && u.role === 'super_admin';
                  const cannotManage = !isSelf && ROLE_RANK[u.role] >= ROLE_RANK[currentUserRole];
                  const cannotEditProfile = !isSelf && !isPeerSuperAdmin && ROLE_RANK[u.role] >= ROLE_RANK[currentUserRole];

                  return (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ 
                            width: '30px', height: '30px', borderRadius: '50%', 
                            background: roleInfo.color || 'var(--muted)', color: '#000', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.75rem'
                          }}>{u.name ? u.name[0] : '?'}</div>
                          <div>
                            <div className="td-main">{u.name} {isSelf && <span style={{ color: 'var(--jade)', fontSize: '.65rem' }}>(나)</span>}</div>
                            <div className="td-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span 
                          className="acc-role-pill" 
                          style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '100px',
                            fontSize: '.61rem', fontWeight: 700,
                            background: `${roleInfo.color}18`, color: roleInfo.color, border: `1px solid ${roleInfo.color}30`
                          }}
                        >
                          <i className={`fa-solid ${roleInfo.icon}`} style={{ fontSize: '.55rem' }}></i> {roleInfo.label}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.status === 'active' ? 'var(--jade)' : 'var(--muted)', boxShadow: u.status === 'active' ? '0 0 5px var(--jade)' : 'none' }}></span>
                          {u.status === 'active' ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="td-mono">{u.last_login ? u.last_login.replace('T', ' ').slice(0, 16) : '-'}</td>
                      <td>
                        <div className="td-acts">
                          <button 
                            className="ico-btn" 
                            title="정보 수정" 
                            onClick={() => setEditingUser(u)}
                            disabled={!can('manage_accounts') || cannotEditProfile}
                          >
                            <i className="fa-solid fa-user-pen"></i>
                          </button>
                          <button 
                            className="ico-btn" 
                            title="역할 변경" 
                            onClick={() => handleRoleCycle(u.id, u.name, u.role)}
                            disabled={!can('manage_accounts') || cannotManage || isSelf}
                          >
                            <i className="fa-solid fa-user-shield"></i>
                          </button>
                          <button 
                            className="ico-btn" 
                            title="비활성화/활성화" 
                            onClick={() => handleUpdateStatus(u.id, u.name, u.status === 'active' ? 'inactive' : 'active')}
                            disabled={!can('manage_accounts') || cannotManage || isSelf}
                          >
                            <i className={`fa-solid ${u.status === 'active' ? 'fa-ban' : 'fa-check'}`}></i>
                          </button>
                          <button 
                            className="ico-btn reject" 
                            title="삭제" 
                            onClick={() => handleDeleteProfile(u.id, u.name)}
                            disabled={!can('manage_accounts') || cannotManage || isSelf}
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="card-h">
              <span className="card-title">권한 매트릭스 수정</span>
              <span style={{ fontSize: '.6rem', color: 'var(--jade)' }}>실시간 반영</span>
            </div>
            <div className="card-body flush" style={{ padding: 0 }}>
              <div style={{ fontSize: '.72rem', padding: '12px' }}>
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr style={{ color: 'var(--muted)', fontSize: '.6rem' }}>
                      <th style={{ textAlign: 'left' }}>기능</th>
                      {Object.keys(dynamicRoles)
                        .filter(roleKey => ROLE_RANK[roleKey] <= ROLE_RANK[currentUserRole]) // Hide upper roles in matrix
                        .map(roleKey => (
                          <th key={roleKey} style={{ textAlign: 'center' }}>{dynamicRoles[roleKey].label.slice(0, 2)}</th>
                        ))
                      }
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(PERM_LABELS).map(([permKey, label]) => (
                      <tr key={permKey} style={{ borderTop: '1px solid var(--line)' }}>
                        <td style={{ padding: '8px 0', color: 'var(--soft)' }}>{label}</td>
                        {Object.keys(dynamicRoles)
                          .filter(roleKey => ROLE_RANK[roleKey] <= ROLE_RANK[currentUserRole])
                          .map(roleKey => (
                            <td key={roleKey} style={{ textAlign: 'center' }}>
                              <input 
                                type="checkbox" 
                                checked={dynamicRoles[roleKey].perms[permKey]} 
                                onChange={(e) => updateRolePerms(roleKey, permKey, e.target.checked)}
                                disabled={roleKey === 'super_admin' && permKey === 'manage_accounts'}
                              />
                            </td>
                          ))
                        }
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-h">
              <span className="card-title">계정 활동 로그</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', color: 'var(--dim)' }}>최근 {Math.min(logs.length, 5)}건</span>
            </div>
            <div className="card-body flush" style={{ padding: 0 }}>
              {logs.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--dim)', fontSize: '.75rem' }}>활동 로그가 없습니다.</div>
              ) : logs.slice(0, 5).map((act, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 14px', borderBottom: idx === Math.min(logs.length, 5) - 1 ? 'none' : '1px solid var(--line)', transition: 'background .14s' }}>
                  <div style={{ 
                    width: '24px', height: '24px', borderRadius: '50%', 
                    background: `${act.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    color: act.color, fontSize: '.7rem', flexShrink: 0, marginTop: '1px' 
                  }}>
                    <i className={`fa-solid fa-${act.type}`}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.78rem', color: 'var(--head)', fontWeight: 500 }}>{act.title}</div>
                    <div style={{ fontSize: '.65rem', color: 'var(--muted)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{act.desc}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '.61rem', color: 'var(--dim)', flexShrink: 0, marginLeft: 'auto' }}>
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} onSuccess={fetchData} />
      <AddAccountModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSuccess={fetchData} />
      <EditAccountModal isOpen={!!editingUser} user={editingUser} onClose={() => setEditingUser(null)} onSuccess={fetchData} />
    </div>
  );
};

export default AccountsPage;

// app/admin/pool/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DB } from '@/lib/supabase';
import { useToast } from '@/components/admin/Toast';
import DetailModal from '@/components/admin/DetailModal';
import AddModal from '@/components/admin/AddModal';

const parseNote = (note: string) => {
  if (!note) return { message: '', links: [] as string[] };
  const parts = note.split('[SNS/링크]');
  const message = parts[0].replace('[문의]', '').trim();
  const links = parts[1]
    ? parts[1].trim().split('\n').map(l => l.trim()).filter(Boolean)
    : [];
  return { message, links };
};

const PoolPage = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState<'busker' | 'seller'>('busker');
  const [pool, setPool] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchPool();
    setSelectedIds([]); // 탭 변경 시 선택 초기화
  }, [tab]);

  const fetchPool = async () => {
    setLoading(true);
    const data = await DB.getPool(tab === 'busker' ? 'busker_pool' : 'seller_pool');
    setPool(data || []);
    setLoading(false);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('인력 풀에서 영구히 삭제하시겠습니까? (이력 데이터가 사라집니다)')) return;
    const table = tab === 'busker' ? 'busker_pool' : 'seller_pool';
    const { error } = await DB.deletePool(table, id);
    if (!error) {
      toast('삭제되었습니다.', 'sky');
      fetchPool();
    } else {
      toast('삭제 실패: ' + error.message, 'rose');
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`선택한 ${selectedIds.length}명을 풀에서 삭제하시겠습니까?`)) return;
    const table = tab === 'busker' ? 'busker_pool' : 'seller_pool';
    setLoading(true);
    for (const id of selectedIds) {
      await DB.deletePool(table, id);
    }
    toast('일괄 삭제 완료', 'jade');
    setSelectedIds([]);
    fetchPool();
  };

  const downloadCSV = () => {
    if (pool.length === 0) return;
    const headers = tab === 'busker' ? ['이름','팀명','장르','연락처','이메일','신청횟수','최초등록'] : ['이름','카테고리','연락처','이메일','신청횟수','최초등록'];
    const rows = pool.map(p => tab === 'busker' ? 
      [p.name, p.team, p.genre, p.phone, p.email, p.app_count, p.created_at] :
      [p.name, p.category, p.phone, p.email, p.app_count, p.created_at]
    );
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `songdo_${tab}_pool.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = pool.filter(p => 
    (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.phone || '').includes(search) ||
    (p.team || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 일괄 관리 플로팅 바 */}
      {selectedIds.length > 0 && (
        <div style={{ position: 'sticky', top: '0', zIndex: 40, background: 'var(--ink2)', color: 'var(--head)', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: '1px solid var(--line)', marginBottom: '10px' }}>
          <span style={{ fontWeight: 800, fontSize: '.85rem', marginRight: 'auto' }}><i className="fa-solid fa-check-double"></i> {selectedIds.length}명 선택됨</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost" style={{ background: 'rgba(255,0,0,0.05)', color: '#d00', fontWeight: 700, fontSize: '.75rem' }} onClick={handleBulkDelete}>선택 삭제</button>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'var(--line)', margin: '0 4px' }}></div>
          <button className="btn btn-ghost" style={{ fontSize: '.75rem', fontWeight: 700 }} onClick={() => setSelectedIds([])}>취소</button>
        </div>
      )}

      <div className="tbl-toolbar">
        <div className="ftabs">
          <button className={`ftab ${tab === 'busker' ? 'on' : ''}`} onClick={() => setTab('busker')}>버스커 풀</button>
          <button className={`ftab ${tab === 'seller' ? 'on' : ''}`} onClick={() => setTab('seller')}>셀러 풀</button>
        </div>
        <div className="search-box" style={{ width: '250px' }}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="이름, 연락처, 팀명 검색…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="tbl-actions">
          <button className="btn btn-sky" onClick={downloadCSV}>
            <i className="fa-solid fa-file-csv"></i> CSV 내보내기
          </button>
        </div>
      </div>

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: '36px' }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.length > 0 && selectedIds.length === filteredData.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th>이름</th>
              <th>{tab === 'busker' ? '팀명/장르' : '카테고리'}</th>
              <th>연락처/이메일</th>
              <th style={{ textAlign: 'center' }}>누적 신청</th>
              <th>최근 활동일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}><span className="spinner"></span></td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>저장된 데이터가 없습니다.</td></tr>
            ) : filteredData.map(p => (
              <tr key={p.id} style={{ background: selectedIds.includes(p.id) ? 'var(--ink3)' : 'transparent' }}>
                <td>
                  <input 
                    type="checkbox" 
                    className="rc" 
                    checked={selectedIds.includes(p.id)}
                    onChange={() => handleSelectOne(p.id)}
                  />
                </td>
                <td className="td-main">{p.name}</td>
                <td>
                  {tab === 'busker' ? (
                    <div className="flex flex-col">
                      <span className="font-bold">{p.team || '솔로'}</span>
                      <span className="text-xs text-muted" style={{ color: 'var(--dim)' }}>{p.genre}</span>
                    </div>
                  ) : p.category}
                </td>
                <td>
                  <div className="flex flex-col text-xs font-mono">
                    <span>{p.phone}</span>
                    <span style={{ color: 'var(--muted)' }}>{p.email}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span className="badge b-approved" style={{ fontSize: '.75rem', padding: '4px 10px', background: 'var(--jade-bg)', color: 'var(--jade)' }}>{p.app_count || 1}회</span>
                </td>
                <td className="td-mono">{p.last_applied_at?.split('T')[0] || '-'}</td>
                <td>
                  <div className="td-acts">
                    <button className="ico-btn" title="상세보기" onClick={() => setSelectedItem(p)}><i className="fa-solid fa-eye"></i></button>
                    <button className="ico-btn" title="수정" onClick={() => setEditingItem(p)}><i className="fa-solid fa-pen-to-square"></i></button>
                    <button className="ico-btn reject" title="삭제" onClick={() => handleDelete(p.id)}><i className="fa-solid fa-trash"></i></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 상세 보기 모달 */}
      {selectedItem && (() => {
        const { message, links } = parseNote(selectedItem.note);
        return (
          <DetailModal
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            title={`${tab === 'busker' ? '버스커' : '셀러'} 풀 상세 — ${selectedItem.name}`}
            data={[
              { label: '이름', value: selectedItem.name },
              { label: tab === 'busker' ? '팀명' : '카테고리', value: tab === 'busker' ? (selectedItem.team || '솔로') : selectedItem.category },
              ...(tab === 'busker' ? [{ label: '장르', value: selectedItem.genre || '—' }] : []),
              { label: '연락처', value: selectedItem.phone },
              { label: '이메일', value: selectedItem.email },
              { label: '누적 신청 횟수', value: `${selectedItem.app_count}회` },
              { label: '최초 등록일', value: selectedItem.created_at?.replace('T', ' ').slice(0, 16) },
              { label: '최근 활동일', value: selectedItem.last_applied_at?.replace('T', ' ').slice(0, 16) },
              { label: '문의 내용', value: message || '—' },
              {
                label: 'SNS / 링크',
                value: links.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--jade)', wordBreak: 'break-all', fontSize: '.8rem' }}
                      >
                        <i className="ri-link" style={{ marginRight: '4px' }}></i>{link}
                      </a>
                    ))}
                  </div>
                ) : '—',
              },
            ]}
          />
        );
      })()}

      {/* 수정 모달 (기존 AddModal 재사용하거나 전용 모달 구성 가능) */}
      <AddModal 
        type={tab as any} 
        isOpen={!!editingItem} 
        onClose={() => setEditingItem(null)} 
        onSuccess={() => { setEditingItem(null); fetchPool(); }} 
        initialData={editingItem}
      />
    </div>
  );
};

export default PoolPage;

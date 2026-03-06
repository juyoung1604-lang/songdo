// app/admin/buskers/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DB } from '@/lib/supabase';
import AddModal from '@/components/admin/AddModal';
import DetailModal from '@/components/admin/DetailModal';
import { useToast } from '@/components/admin/Toast';
import { useAdmin } from '../layout';

const BuskersPage = () => {
  const { can } = useAdmin();
  const { toast } = useToast();
  const [buskers, setBuskers] = useState<any[]>([]);
  const [pool, setPool] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [data, poolData] = await Promise.all([
      DB.getBuskers(),
      DB.getPool('busker_pool')
    ]);
    setBuskers(data);
    setPool(poolData);
    setLoading(false);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map(b => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = async (status: string) => {
    if (!can('approve')) return;

    if (status === 'pool') {
      if (!confirm(`${selectedIds.length}건의 항목을 통합 데이터베이스로 이관하시겠습니까?`)) return;
      setLoading(true);
      for (const id of selectedIds) {
        const item = buskers.find(b => b.id === id);
        if (item) await DB.addToPool('busker', item);
      }
      toast(`${selectedIds.length}건의 항목이 DB에 저장되었습니다.`, 'jade');
      setSelectedIds([]);
      fetchData();
      return;
    }

    if (!confirm(`${selectedIds.length}건의 항목을 ${status === 'approved' ? '승인' : status === 'rejected' ? '거절' : '삭제'}하시겠습니까?`)) return;

    setLoading(true);
    let successCount = 0;
    for (const id of selectedIds) {
      try {
        if (status === 'delete') await DB.deleteBusker(id);
        else await DB.updateStatus('buskers', id, status);
        successCount++;
      } catch (e) { console.error(e); }
    }

    toast(`${successCount}건의 항목이 처리되었습니다.`, 'jade');
    setSelectedIds([]);
    fetchData();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await DB.updateStatus('buskers', id, status);
    if (!error) {
      setBuskers(prev => prev.map(b => b.id === id ? { ...b, status } : b));
      toast('처리되었습니다.', 'jade');
    }
  };

  const handleCycleStatus = async (id: string, currentStatus: string) => {
    if (!can('approve')) return;
    const statuses = ['pending', 'approved', 'rejected'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    handleStatusChange(id, nextStatus);
  };

  const filteredData = buskers.filter(b => {
    const searchStr = `${b.name || ''} ${b.team || ''} ${b.genre || ''} ${b.phone || ''}`.toLowerCase();
    const matchesSearch = searchStr.includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  const checkDuplicate = (phone: string, email: string) => {
    return pool.find(p => p.phone === phone || p.email === email);
  };

  return (
    <div className="space-y-6">
      {selectedIds.length > 0 && (
        <div style={{ position: 'sticky', top: '0', zIndex: 40, background: 'var(--jade)', color: '#000', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 30px rgba(0,212,160,0.3)', marginBottom: '10px' }}>
          <span style={{ fontWeight: 800, fontSize: '.85rem', marginRight: 'auto' }}><i className="fa-solid fa-check-double"></i> {selectedIds.length}개 선택됨</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-ghost" style={{ background: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '.75rem' }} onClick={() => handleBulkStatusChange('pool')}><i className="fa-solid fa-database"></i> DB 저장</button>
            <button className="btn btn-ghost" style={{ background: 'rgba(0,0,0,0.1)', fontWeight: 700, fontSize: '.75rem' }} onClick={() => handleBulkStatusChange('approved')}>선택 승인</button>
            <button className="btn btn-ghost" style={{ background: 'rgba(0,0,0,0.1)', fontWeight: 700, fontSize: '.75rem' }} onClick={() => handleBulkStatusChange('rejected')}>선택 거절</button>
            <button className="btn btn-ghost" style={{ background: 'rgba(255,0,0,0.1)', color: '#d00', fontWeight: 700, fontSize: '.75rem' }} onClick={() => handleBulkStatusChange('delete')}>선택 삭제</button>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'rgba(0,0,0,0.1)', margin: '0 4px' }}></div>
          <button className="btn btn-ghost" style={{ fontSize: '.75rem', fontWeight: 700 }} onClick={() => setSelectedIds([])}>취소</button>
        </div>
      )}

      <div className="tbl-toolbar">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="이름, 팀명 검색…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="ftabs">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} className={`ftab ${filter === s ? 'on' : ''}`} onClick={() => setFilter(s)}>
              {s === 'all' ? '전체' : s === 'pending' ? '대기' : s === 'approved' ? '승인' : '거절'}
            </button>
          ))}
        </div>
        <div className="tbl-actions">
          {can('create') && (
            <button className="btn btn-jade" onClick={() => setIsAddModalOpen(true)}>
              <i className="fa-solid fa-plus"></i> 신규 버스커 등록
            </button>
          )}
        </div>
      </div>

      <div className="tbl-wrap">
        <table>
          <thead>
            <tr>
              <th style={{ width: '36px' }}><input type="checkbox" checked={selectedIds.length > 0 && selectedIds.length === filteredData.length} onChange={handleSelectAll} /></th>
              <th>이름/팀</th><th>장르</th><th>연락처</th><th>보증금</th><th>희망 날짜</th><th>상태</th><th>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}><span className="spinner"></span></td></tr>
            ) : filteredData.length === 0 ? (
              <tr className="empty-row">
                <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fa-solid fa-inbox empty-ico" style={{ fontSize: '2rem', display: 'block', marginBottom: '8px', color: 'var(--dim)' }}></i>
                  <p className="empty-txt" style={{ color: 'var(--muted)' }}>데이터가 없습니다</p>
                </td>
              </tr>
            ) : filteredData.map(b => {
              const prevRecord = checkDuplicate(b.phone, b.email);
              return (
                <tr key={b.id} style={{ background: selectedIds.includes(b.id) ? 'var(--jade-bg)' : 'transparent' }}>
                  <td><input type="checkbox" className="rc" checked={selectedIds.includes(b.id)} onChange={() => handleSelectOne(b.id)} /></td>
                  <td className="td-main">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {b.name} <span style={{ color: 'var(--muted)', fontSize: '.72rem' }}>({b.team || '솔로'})</span>
                      {prevRecord && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'var(--sky-bg)', color: 'var(--sky)', padding: '2px 6px', borderRadius: '4px', fontSize: '.6rem', fontWeight: 700 }}>
                          <i className="fa-solid fa-clock-rotate-left"></i> 재신청 ({prevRecord.app_count}회)
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{b.genre}</td>
                  <td className="td-mono">{b.phone}</td>
                  <td className="td-mono" style={{ fontWeight: 700, color: 'var(--jade)' }}>₩{(b.fee || 0).toLocaleString()}</td>
                  <td className="td-mono">{b.event_date}</td>
                  <td>
                    <span 
                      className={`badge b-${b.status}`}
                      style={{ cursor: can('approve') ? 'pointer' : 'default' }}
                      onClick={() => handleCycleStatus(b.id, b.status)}
                      title="클릭하여 상태 변경"
                    >
                      {b.status === 'pending' ? '대기중' : b.status === 'approved' ? '승인' : '거절'}
                    </span>
                  </td>
                  <td>
                    <div className="td-acts">
                      <button className="ico-btn" onClick={() => setSelectedItem(b)}><i className="fa-solid fa-eye"></i></button>
                      <button className="ico-btn" onClick={async () => {
                        await DB.addToPool('busker', b);
                        toast('DB에 저장되었습니다.', 'jade');
                        fetchData();
                      }} title="DB에 보관"><i className="fa-solid fa-database"></i></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AddModal type="busker" isOpen={isAddModalOpen || !!editingItem} onClose={() => { setIsAddModalOpen(false); setEditingItem(null); }} onSuccess={fetchData} initialData={editingItem} />
      {selectedItem && (
        <DetailModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title={`버스커 상세 — ${selectedItem.name}`} data={[
          { label: '이름', value: selectedItem.name }, 
          { label: '팀명', value: selectedItem.team || '솔로' },
          { label: '장르', value: selectedItem.genre },
          { label: '보증금', value: `₩${(selectedItem.fee || 0).toLocaleString()}`, mono: true },
          { label: '연락처', value: selectedItem.phone }, 
          { label: '이메일', value: selectedItem.email },
          { label: '희망 날짜', value: selectedItem.event_date },
          { label: '상태', value: <span className={`badge b-${selectedItem.status}`}>{selectedItem.status === 'pending' ? '대기중' : selectedItem.status === 'approved' ? '승인' : '거절'}</span> },
          { label: '이력', value: checkDuplicate(selectedItem.phone, selectedItem.email) ? '기존 활동자' : '신규 신청자' },
          { label: '문의 내용', value: <div style={{ whiteSpace: 'pre-wrap', fontSize: '.85rem', color: 'var(--head)' }}>{selectedItem.note?.split('[SNS/링크]')[0].replace('[문의]', '').trim() || '내용 없음'}</div> },
          { label: 'SNS / 링크', value: (
            <div className="space-y-2">
              {selectedItem.note?.includes('[SNS/링크]') ? (
                <div className="flex flex-wrap gap-2">
                  {selectedItem.note.split('[SNS/링크]')[1].trim().split('\n').map((url: string, i: number) => (
                    <a key={i} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noreferrer" className="px-3 py-1 bg-gray-100 rounded-lg text-xs text-blue-600 hover:bg-gray-200 transition-all">
                      <i className="ri-link-m"></i> {url.replace('https://', '').replace('http://', '')}
                    </a>
                  ))}
                </div>
              ) : '등록된 링크 없음'}
            </div>
          )}
        ]} />
      )}
    </div>
  );
};

export default BuskersPage;

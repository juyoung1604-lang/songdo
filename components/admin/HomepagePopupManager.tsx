'use client';

import React, { useEffect, useState } from 'react';
import { DB } from '@/lib/supabase';
import { useToast } from '@/components/admin/Toast';

type HomepagePopup = {
  id: string;
  title: string;
  image_url: string;
  content?: string;
  link_url?: string;
  button_label?: string;
  start_date?: string;
  end_date?: string;
  popup_size?: 'sm' | 'md' | 'lg';
  popup_width_px?: number | null;
  popup_height_px?: number | null;
  is_active: boolean;
  open_in_new_tab?: boolean;
  created_at?: string;
  updated_at?: string;
};

const POPUP_SIZE_OPTIONS = [
  { value: 'sm', label: '작게' },
  { value: 'md', label: '보통' },
  { value: 'lg', label: '크게' },
] as const;

const HomepagePopupManager = () => {
  const { toast } = useToast();
  const [popups, setPopups] = useState<HomepagePopup[]>([]);
  const [editingPopupId, setEditingPopupId] = useState<string | null>(null);
  const [popupForm, setPopupForm] = useState<Partial<HomepagePopup>>({
    title: '',
    image_url: '',
    content: '',
    link_url: '',
    button_label: '자세히 보기',
    start_date: '',
    end_date: '',
    popup_size: 'md',
    popup_width_px: null,
    popup_height_px: null,
    is_active: true,
    open_in_new_tab: false,
  });

  const fetchPopups = async () => {
    const popupData = await DB.getHomepagePopups();
    setPopups((popupData as HomepagePopup[]) || []);
  };

  useEffect(() => {
    fetchPopups();
  }, []);

  const resetPopupForm = () => {
    setEditingPopupId(null);
    setPopupForm({
      title: '',
      image_url: '',
      content: '',
      link_url: '',
      button_label: '자세히 보기',
      start_date: '',
      end_date: '',
      popup_size: 'md',
      popup_width_px: null,
      popup_height_px: null,
      is_active: true,
      open_in_new_tab: false,
    });
  };

  const handleEditPopup = (popup: HomepagePopup) => {
    setEditingPopupId(popup.id);
    setPopupForm({
      title: popup.title || '',
      image_url: popup.image_url || '',
      content: popup.content || '',
      link_url: popup.link_url || '',
      button_label: popup.button_label || '자세히 보기',
      start_date: popup.start_date || '',
      end_date: popup.end_date || '',
      popup_size: popup.popup_size || 'md',
      popup_width_px: popup.popup_width_px ?? null,
      popup_height_px: popup.popup_height_px ?? null,
      is_active: popup.is_active,
      open_in_new_tab: !!popup.open_in_new_tab,
    });
  };

  const handleSavePopup = async () => {
    if (!popupForm.title?.trim()) {
      toast('팝업 제목을 입력하세요.', 'rose');
      return;
    }
    if (!popupForm.image_url?.trim()) {
      toast('팝업 이미지를 입력하세요.', 'rose');
      return;
    }

    const payload = {
      title: popupForm.title?.trim(),
      image_url: popupForm.image_url?.trim(),
      content: popupForm.content?.trim() || '',
      link_url: popupForm.link_url?.trim() || '',
      button_label: popupForm.button_label?.trim() || '자세히 보기',
      start_date: popupForm.start_date || null,
      end_date: popupForm.end_date || null,
      popup_size: popupForm.popup_size || 'md',
      popup_width_px:
        popupForm.popup_width_px && Number(popupForm.popup_width_px) > 0
          ? Math.min(1200, Math.max(240, Number(popupForm.popup_width_px)))
          : null,
      popup_height_px:
        popupForm.popup_height_px && Number(popupForm.popup_height_px) > 0
          ? Math.min(1400, Math.max(240, Number(popupForm.popup_height_px)))
          : null,
      is_active: !!popupForm.is_active,
      open_in_new_tab: !!popupForm.open_in_new_tab,
    };

    const res = editingPopupId
      ? await DB.updateHomepagePopup(editingPopupId, payload)
      : await DB.createHomepagePopup(payload);

    if ((res as any)?.error) {
      toast('팝업 저장 실패: ' + (res as any).error.message, 'rose');
      return;
    }

    toast(editingPopupId ? '홈페이지 팝업이 수정되었습니다.' : '홈페이지 팝업이 등록되었습니다.', 'jade');
    resetPopupForm();
    fetchPopups();
  };

  const handleDeletePopup = async (id: string) => {
    if (!confirm('이 팝업을 삭제하시겠습니까?')) return;
    const { error } = await DB.deleteHomepagePopup(id);
    if (error) {
      toast('팝업 삭제 실패: ' + (error as any).message, 'rose');
      return;
    }
    if (editingPopupId === id) {
      resetPopupForm();
    }
    toast('홈페이지 팝업이 삭제되었습니다.', 'jade');
    fetchPopups();
  };

  const togglePopupActive = async (popup: HomepagePopup) => {
    const { error } = await DB.updateHomepagePopup(popup.id, { is_active: !popup.is_active });
    if (error) {
      toast('상태 변경 실패: ' + (error as any).message, 'rose');
      return;
    }
    toast(popup.is_active ? '팝업 노출이 중지되었습니다.' : '팝업이 활성화되었습니다.', 'jade');
    fetchPopups();
  };

  return (
    <div className="card">
      <div className="card-h" style={{ background: 'var(--ink3)' }}>
        <span className="card-title">
          <i className="fa-solid fa-window-maximize" style={{ marginRight: '8px', color: 'var(--gold)' }} />
          홈페이지 팝업 관리
        </span>
        <button className="btn" style={{ fontSize: '.72rem' }} onClick={resetPopupForm}>
          <i className="fa-solid fa-rotate-left" /> 새 팝업
        </button>
      </div>

      <div className="card-body space-y-4">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
            gap: '16px',
            alignItems: 'start',
          }}
        >
          <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>팝업 제목</label>
                <input className="fi" value={popupForm.title || ''} onChange={(e) => setPopupForm((prev) => ({ ...prev, title: e.target.value }))} placeholder="예: 이번 주말 플리마켓 안내" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>팝업 이미지 URL</label>
                <input className="fi" value={popupForm.image_url || ''} onChange={(e) => setPopupForm((prev) => ({ ...prev, image_url: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>노출 시작일</label>
                <input className="fi" type="date" value={popupForm.start_date || ''} onChange={(e) => setPopupForm((prev) => ({ ...prev, start_date: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>노출 종료일</label>
                <input className="fi" type="date" value={popupForm.end_date || ''} onChange={(e) => setPopupForm((prev) => ({ ...prev, end_date: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>연결 링크</label>
                <input className="fi" value={popupForm.link_url || ''} onChange={(e) => setPopupForm((prev) => ({ ...prev, link_url: e.target.value }))} placeholder="https:// 또는 /status" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>버튼 문구</label>
                <input className="fi" value={popupForm.button_label || ''} onChange={(e) => setPopupForm((prev) => ({ ...prev, button_label: e.target.value }))} placeholder="자세히 보기" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>수동 가로(px)</label>
                <input
                  className="fi"
                  type="number"
                  min={240}
                  max={1200}
                  value={popupForm.popup_width_px ?? ''}
                  onChange={(e) =>
                    setPopupForm((prev) => ({
                      ...prev,
                      popup_width_px: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  placeholder="예: 640"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>수동 세로(px)</label>
                <input
                  className="fi"
                  type="number"
                  min={240}
                  max={1400}
                  value={popupForm.popup_height_px ?? ''}
                  onChange={(e) =>
                    setPopupForm((prev) => ({
                      ...prev,
                      popup_height_px: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  placeholder="예: 880"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>자동 크기</label>
                <select className="fi" value={popupForm.popup_size || 'md'} onChange={(e) => setPopupForm((prev) => ({ ...prev, popup_size: e.target.value as 'sm' | 'md' | 'lg' }))}>
                  {POPUP_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '6px' }}>팝업 설명</label>
                <textarea className="fi" rows={4} value={popupForm.content || ''} onChange={(e) => setPopupForm((prev) => ({ ...prev, content: e.target.value }))} placeholder="팝업에 함께 노출할 안내 문구" style={{ resize: 'vertical', minHeight: '100px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input id="popup-active" type="checkbox" checked={!!popupForm.is_active} onChange={(e) => setPopupForm((prev) => ({ ...prev, is_active: e.target.checked }))} />
                <label htmlFor="popup-active" style={{ fontSize: '.78rem', color: 'var(--soft)' }}>즉시 노출 가능 상태</label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input id="popup-new-tab" type="checkbox" checked={!!popupForm.open_in_new_tab} onChange={(e) => setPopupForm((prev) => ({ ...prev, open_in_new_tab: e.target.checked }))} />
                <label htmlFor="popup-new-tab" style={{ fontSize: '.78rem', color: 'var(--soft)' }}>링크 새 창 열기</label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
              <button className="btn btn-jade" onClick={handleSavePopup}>
                <i className="fa-solid fa-floppy-disk" /> {editingPopupId ? '팝업 수정' : '팝업 등록'}
              </button>
              <button className="btn" onClick={resetPopupForm}>
                <i className="fa-solid fa-xmark" /> 초기화
              </button>
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ fontSize: '.88rem', color: 'var(--head)' }}>등록된 팝업</strong>
              <span className="badge b-approved">{popups.length}건</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
              {popups.length > 0 ? (
                popups.map((popup) => (
                  <div key={popup.id} style={{ border: '1px solid var(--line)', borderRadius: '12px', padding: '10px', background: 'var(--ink3)' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ width: '84px', height: '84px', borderRadius: '10px', overflow: 'hidden', background: 'var(--ink2)', flexShrink: 0 }}>
                        <img src={popup.image_url} alt={popup.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: '.82rem', fontWeight: 800, color: 'var(--head)' }}>{popup.title}</div>
                            <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '2px' }}>
                              {popup.start_date || '즉시'} ~ {popup.end_date || '상시'}
                            </div>
                            <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '2px' }}>
                              크기: {POPUP_SIZE_OPTIONS.find((option) => option.value === (popup.popup_size || 'md'))?.label || '보통'}
                            </div>
                            {popup.popup_width_px ? (
                              <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '2px' }}>
                                수동 크기: {popup.popup_width_px}px x {popup.popup_height_px || '-'}px
                              </div>
                            ) : null}
                          </div>
                          <span className={`badge ${popup.is_active ? 'b-approved' : ''}`} style={!popup.is_active ? { background: 'var(--ink2)', color: 'var(--muted)' } : undefined}>
                            {popup.is_active ? '노출중' : '중지'}
                          </span>
                        </div>
                        {popup.content && (
                          <div style={{ fontSize: '.72rem', color: 'var(--soft)', marginTop: '8px', lineHeight: 1.5 }}>
                            {popup.content}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                          <button className="btn" style={{ fontSize: '.68rem' }} onClick={() => handleEditPopup(popup)}>
                            <i className="fa-solid fa-pen-to-square" /> 수정
                          </button>
                          <button className="btn" style={{ fontSize: '.68rem' }} onClick={() => togglePopupActive(popup)}>
                            <i className={`fa-solid ${popup.is_active ? 'fa-eye-slash' : 'fa-eye'}`} /> {popup.is_active ? '중지' : '활성'}
                          </button>
                          <button className="btn btn-rose" style={{ fontSize: '.68rem' }} onClick={() => handleDeletePopup(popup.id)}>
                            <i className="fa-solid fa-trash" /> 삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '.78rem', color: 'var(--muted)' }}>등록된 홈페이지 팝업이 없습니다.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepagePopupManager;

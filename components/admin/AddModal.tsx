// components/admin/AddModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { DB } from '@/lib/supabase';
import { useToast } from './Toast';

interface AddModalProps {
  type: 'busker' | 'seller' | 'event';
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result?: any) => void;
  initialData?: any;
}

const parseNote = (note: string) => {
  if (!note) return { message: '', links: [] as string[] };
  const parts = note.split('[SNS/링크]');
  const message = parts[0].replace('[문의]', '').trim();
  const links = parts[1] ? parts[1].trim().split('\n').map((l: string) => l.trim()).filter(Boolean) : [];
  return { message, links };
};

const AddModal = ({ type, isOpen, onClose, onSuccess, initialData }: AddModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ busker_deposit: 50000, seller_booth_fee: 30000 });
  const [formData, setFormData] = useState<any>({});
  const [links, setLinks] = useState<string[]>(['']);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const s = DB.getSystemSettings();
      setSettings(s);

      if (initialData) {
        const parsed = parseNote(initialData.note || '');
        setMessage(parsed.message);
        setLinks(parsed.links.length > 0 ? parsed.links : ['']);
        setFormData({
          ...initialData,
          'f-name': initialData.name || initialData.title,
          'f-team': initialData.team,
          'f-genre': initialData.genre || '어쿠스틱',
          'f-cat': initialData.category || '핸드메이드 공예',
          'f-booths': String(initialData.booths || '1'),
          'f-fee': initialData.fee,
          'f-phone': initialData.phone,
          'f-email': initialData.email,
          'f-date': initialData.event_date || initialData.date,
          'f-bcnt': initialData.busker_count ?? 0,
          'f-scnt': initialData.seller_count ?? 0,
          'f-note': initialData.note,
          'status': initialData.status
        });
      } else {
        setMessage('');
        setLinks(['']);
        setFormData({
          'f-booths': '1',
          'f-genre': '어쿠스틱',
          'f-cat': '핸드메이드 공예',
          'status': 'pending'
        });
      }
    }
  }, [isOpen, initialData, type]);

  if (!isOpen) return null;

  const calcFee = type === 'busker'
    ? settings.busker_deposit
    : parseInt(formData['f-booths'] || '1') * settings.seller_booth_fee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const addLinkField = () => {
    if (links.length < 5) setLinks([...links, '']);
  };

  const removeLinkField = (index: number) => {
    if (links.length > 1) setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    const now = new Date().toISOString();
    let res;

    try {
      if (type === 'event') {
        const sellerCount = Math.max(0, Math.min(20, parseInt(formData['f-scnt'] || '0')));
        const payload = {
          title: formData['f-name'],
          event_date: formData['f-date'],
          busker_count: parseInt(formData['f-bcnt'] || '0'),
          seller_count: sellerCount,
          note: formData['f-note']
        };
        res = initialData?.id ? await DB.updateEvent(initialData.id, payload) : await DB.createEvent(payload);
      } else {
        const validLinks = links.filter(l => l.trim() !== '');
        const linksNote = validLinks.length > 0 ? `\n[SNS/링크]\n${validLinks.join('\n')}` : '';
        const fullNote = `[문의] ${message}${linksNote}`;

        if (type === 'busker') {
          const payload = {
            name: formData['f-name'],
            team: formData['f-team'] || '솔로',
            genre: formData['f-genre'] || '어쿠스틱',
            phone: formData['f-phone'],
            email: formData['f-email'],
            event_date: formData['f-date'],
            status: formData.status || 'pending',
            fee: calcFee,
            applied_at: initialData?.applied_at || now,
            note: fullNote
          };
          res = initialData?.id ? await DB.updateBusker(initialData.id, payload) : await DB.createBusker(payload);
        } else {
          const payload = {
            name: formData['f-name'],
            category: formData['f-cat'] || '핸드메이드 공예',
            booths: parseInt(formData['f-booths'] || '1'),
            fee: calcFee,
            phone: formData['f-phone'],
            email: formData['f-email'],
            event_date: formData['f-date'],
            status: formData.status || 'pending',
            applied_at: initialData?.applied_at || now,
            note: fullNote
          };
          res = initialData?.id ? await DB.updateSeller(initialData.id, payload) : await DB.createSeller(payload);
        }
      }

      if (res && res.error) throw res.error;
      toast(initialData?.id ? '수정되었습니다.' : '등록되었습니다.', 'jade');
      onSuccess(res?.data);
      onClose();
    } catch (e: any) {
      toast('오류: ' + e.message, 'rose');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-wrap on" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-ttl">
            {initialData?.id ? '정보 수정' : (type === 'busker' ? '버스커 등록' : type === 'seller' ? '셀러 등록' : '행사 등록')}
          </span>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-times"></i></button>
        </div>
        <div className="modal-body space-y-4">
          {type === 'event' ? (
            /* ── Event form ── */
            <>
              <div className="fg">
                <label>행사명 *</label>
                <input className="fi" id="f-name" required placeholder="예: 봄맞이 버스킹 페스티벌" value={formData['f-name'] || ''} onChange={handleChange} />
              </div>
              <div className="fg">
                <label>행사 날짜 *</label>
                <input className="fi" id="f-date" type="date" required value={formData['f-date'] || ''} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="fg">
                  <label>버스커 수 (예정)</label>
                  <input className="fi" id="f-bcnt" type="number" min="0" value={formData['f-bcnt'] ?? 0} onChange={handleChange} />
                </div>
                <div className="fg">
                  <label>셀러 부스 수 (예정)</label>
                  <input className="fi" id="f-scnt" type="number" min="0" max="20" value={formData['f-scnt'] ?? 0} onChange={handleChange} />
                </div>
              </div>
              <div className="fg">
                <label>비고</label>
                <textarea className="fta" id="f-note" value={formData['f-note'] || ''} onChange={handleChange} style={{ height: '70px' }} placeholder="특이사항, 테마 등" />
              </div>
            </>
          ) : (
            /* ── Busker / Seller form (홈페이지 신청폼과 동일) ── */
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="fg">
                  <label>성함 / 담당자명 *</label>
                  <input className="fi" id="f-name" required value={formData['f-name'] || ''} onChange={handleChange} placeholder="이름을 입력하세요" />
                </div>
                <div className="fg">
                  <label>연락처 *</label>
                  <input className="fi" id="f-phone" required value={formData['f-phone'] || ''} onChange={handleChange} placeholder="010-0000-0000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {type === 'busker' ? (
                  <>
                    <div className="fg">
                      <label>팀명</label>
                      <input className="fi" id="f-team" value={formData['f-team'] || ''} onChange={handleChange} placeholder="솔로일 경우 비움" />
                    </div>
                    <div className="fg">
                      <label>활동 장르 *</label>
                      <select className="fs" id="f-genre" value={formData['f-genre'] || '어쿠스틱'} onChange={handleChange}>
                        <option>어쿠스틱</option><option>인디 록</option><option>재즈</option><option>팝</option><option>포크</option><option>힙합</option><option>기타</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="fg">
                      <label>판매 카테고리 *</label>
                      <select className="fs" id="f-cat" value={formData['f-cat'] || '핸드메이드 공예'} onChange={handleChange}>
                        <option>핸드메이드 공예</option><option>빈티지 소품</option><option>독립출판</option><option>패션/의류</option><option>먹거리</option><option>기타</option>
                      </select>
                    </div>
                    <div className="fg">
                      <label>필요 부스 개수 *</label>
                      <select className="fs" id="f-booths" value={formData['f-booths'] || '1'} onChange={handleChange}>
                        <option value="1">1개 (₩{settings.seller_booth_fee.toLocaleString()})</option>
                        <option value="2">2개 (₩{(settings.seller_booth_fee * 2).toLocaleString()})</option>
                        <option value="3">3개 (₩{(settings.seller_booth_fee * 3).toLocaleString()})</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="fg">
                  <label>이메일 *</label>
                  <input className="fi" id="f-email" type="email" required value={formData['f-email'] || ''} onChange={handleChange} placeholder="example@mail.com" />
                </div>
                <div className="fg">
                  <label>참가 희망 날짜 *</label>
                  <input className="fi" id="f-date" type="date" required value={formData['f-date'] || ''} onChange={handleChange} />
                </div>
              </div>

              <div className="fg">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ marginBottom: 0 }}>SNS / 포트폴리오 링크 (최대 5개)</label>
                  {links.length < 5 && (
                    <button type="button" onClick={addLinkField} style={{ fontSize: '11px', fontWeight: 700, color: 'var(--jade)', background: 'none', border: 'none', cursor: 'pointer' }}>+ 추가하기</button>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {links.map((link, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        className="fi"
                        type="url"
                        value={link}
                        onChange={(e) => handleLinkChange(idx, e.target.value)}
                        placeholder="https://instagram.com/yourid"
                        style={{ flex: 1 }}
                      />
                      {links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLinkField(idx)}
                          style={{ padding: '0 6px', color: '#ccc', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
                        >
                          <i className="fa-solid fa-circle-xmark"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="fg">
                <label>소개 및 기타 문의사항</label>
                <textarea
                  className="fta"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ height: '80px' }}
                  placeholder="내용을 입력하세요"
                />
              </div>

              {/* Total Amount bar */}
              <div style={{ padding: '12px 16px', background: 'var(--surface)', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Total Amount</span>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--jade)' }}>₩{calcFee.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'right', lineHeight: 1.4 }}>
                  {type === 'busker'
                    ? '참가 보증금\n(행사 종료 후 반환)'
                    : `부스비 (₩${settings.seller_booth_fee.toLocaleString()} × ${formData['f-booths'] || 1}개)`}
                </div>
              </div>

              {/* Admin-only: status */}
              <div className="fg">
                <label>상태</label>
                <select className="fs" id="status" value={formData.status || 'pending'} onChange={handleChange}>
                  <option value="pending">대기중</option>
                  <option value="approved">승인됨</option>
                  {type === 'seller' && <option value="paid">결제완료</option>}
                  <option value="rejected">거절됨</option>
                </select>
              </div>
            </>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn btn-jade" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: '14px', height: '14px' }}></span> : <><i className="fa-solid fa-save"></i> 저장</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModal;

// components/admin/InviteModal.tsx
'use client';

import React, { useState } from 'react';
import { DB } from '@/lib/supabase';
import { useToast } from './Toast';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const InviteModal = ({ isOpen, onClose, onSuccess }: InviteModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', role: 'operator' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const setRole = (role: string) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      toast('이름과 이메일을 입력하세요.', 'rose');
      return;
    }
    setLoading(true);
    
    // In a real Supabase Auth setup, we would call supabase.auth.signUp() or inviteUserByEmail() here.
    // For this admin panel demo, we will insert directly into admin_profiles to simulate the result.
    const payload = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'active', // Auto-activate for demo
      created_at: new Date().toISOString()
    };

    const { error } = await DB.createAdminProfile(payload);
    
    if (error) {
      toast('초대 실패: ' + error.message, 'rose');
    } else {
      await DB.createAdminLog({
        type: 'paper-plane',
        color: 'var(--sky)',
        title: '신규 사용자 초대',
        desc: `'${formData.email}'님에게 초대 메일이 발송되었습니다.`,
        created_at: new Date().toISOString()
      });
      toast('초대 메일이 발송되었습니다.', 'jade');
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="modal-wrap on" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-ttl">새 계정 초대</span>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-times"></i></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '13px' }}>
            <div className="fg"><label>이름 *</label><input className="fi" id="name" placeholder="홍길동" onChange={handleChange} /></div>
            <div className="fg"><label>이메일 *</label><input className="fi" id="email" type="email" placeholder="user@songdo.com" onChange={handleChange} /></div>
          </div>
          <div className="fg" style={{ marginBottom: '13px' }}>
            <label style={{ marginBottom: '8px', display: 'block' }}>역할 선택 *</label>
            <div className="role-sel-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '7px' }}>
              {[
                { k: 'super_admin', l: '슈퍼관리자', c: 'var(--jade)', d: '모든 권한 + 계정 관리' },
                { k: 'admin', l: '관리자', c: 'var(--sky)', d: '계정 관리 제외 운영' },
                { k: 'operator', l: '운영자', c: 'var(--lav)', d: '승인/거절만 가능' }
              ].map(r => (
                <div 
                  key={r.k} 
                  onClick={() => setRole(r.k)}
                  style={{ 
                    border: `1px solid ${formData.role === r.k ? r.c : 'var(--line2)'}`,
                    background: formData.role === r.k ? `${r.c}18` : 'var(--ink3)',
                    borderRadius: '8px', padding: '11px 12px', cursor: 'pointer', transition: 'all .15s'
                  }}
                >
                  <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--head)', marginBottom: '2px' }}>
                    <i className={`fa-solid ${r.k === 'super_admin' ? 'fa-crown' : r.k === 'admin' ? 'fa-user-shield' : 'fa-user-check'}`} style={{ color: r.c, marginRight: '5px' }}></i>
                    {r.l}
                  </div>
                  <div style={{ fontSize: '.65rem', color: 'var(--muted)', lineHeight: 1.4 }}>{r.d}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="fg">
            <label>임시 비밀번호</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input className="fi" type="text" placeholder="자동 생성" style={{ flex: 1 }} readOnly value={Math.random().toString(36).slice(-8)} />
              <button className="btn"><i className="fa-solid fa-dice"></i></button>
            </div>
            <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '4px' }}>Supabase 연결 시 초대 이메일이 발송됩니다.</div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn btn-jade" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner"></span> : <><i className="fa-solid fa-paper-plane"></i> 초대 발송</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;

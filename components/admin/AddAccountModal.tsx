// components/admin/AddAccountModal.tsx
'use client';

import React, { useState } from 'react';
import { DB } from '@/lib/supabase';
import { useToast } from './Toast';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddAccountModal = ({ isOpen, onClose, onSuccess }: AddAccountModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', role: 'operator', password: '' });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const setRole = (role: string) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast('이름, 이메일, 비밀번호를 모두 입력하세요.', 'rose');
      return;
    }
    
    setLoading(true);
    
    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      status: 'active',
      created_at: new Date().toISOString()
    };

    // Note: In real production, we would use supabase.auth.signUp()
    // For this demo context, we insert directly into the profiles table
    const { error } = await DB.createAdminProfile(payload);
    
    if (error) {
      toast('등록 실패: ' + error.message, 'rose');
    } else {
      // 1. Create Log
      await DB.createAdminLog({
        type: 'user-check',
        color: 'var(--jade)',
        title: '신규 계정 직접 등록',
        desc: `'${formData.name}'(${formData.role}) 계정이 직접 등록되었습니다.`,
        created_at: new Date().toISOString()
      });
      
      toast('등록되었습니다.', 'jade');
      
      // 2. Refresh parent data (profiles + logs)
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="modal-wrap on" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-ttl">신규 관리자 직접 등록</span>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-times"></i></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '13px' }}>
            <div className="fg"><label>이름 *</label><input className="fi" id="name" placeholder="홍길동" onChange={handleChange} /></div>
            <div className="fg"><label>이메일 *</label><input className="fi" id="email" type="email" placeholder="user@songdo.com" onChange={handleChange} /></div>
          </div>
          
          <div className="fg" style={{ marginBottom: '13px' }}>
            <label>비밀번호 *</label>
            <input className="fi" id="password" type="password" placeholder="로그인 시 사용할 비밀번호" onChange={handleChange} />
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
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn btn-jade" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner"></span> : <><i className="fa-solid fa-user-check"></i> 즉시 등록</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAccountModal;

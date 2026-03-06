// components/admin/EditAccountModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { DB } from '@/lib/supabase';
import { useToast } from './Toast';

interface EditAccountModalProps {
  isOpen: boolean;
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAccountModal = ({ isOpen, user, onClose, onSuccess }: EditAccountModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ email: user.email || '', password: '' });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.email) {
      toast('이메일을 입력하세요.', 'rose');
      return;
    }
    
    setLoading(true);
    
    const payload: any = {
      email: formData.email,
      updated_at: new Date().toISOString()
    };
    
    // 비밀번호가 입력된 경우에만 포함 (실제 환경에서는 별도 처리 필요할 수 있음)
    if (formData.password) {
      payload.password = formData.password;
    }

    const { error } = await DB.updateAdminProfile(user.id, payload);
    
    if (error) {
      toast('수정 실패: ' + error.message, 'rose');
    } else {
      await DB.createAdminLog({
        type: 'user-pen',
        color: 'var(--sky)',
        title: '사용자 정보 수정',
        desc: `'${user.name}'님의 정보(이메일/비밀번호)가 수정되었습니다.`,
        created_at: new Date().toISOString()
      });
      toast('수정되었습니다.', 'jade');
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  return (
    <div className="modal-wrap on" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-ttl">사용자 정보 수정 ({user.name})</span>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-times"></i></button>
        </div>
        <div className="modal-body">
          <div className="fg" style={{ marginBottom: '13px' }}>
            <label>이름 (수정 불가)</label>
            <input className="fi" value={user.name} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </div>
          
          <div className="fg" style={{ marginBottom: '13px' }}>
            <label>이메일 *</label>
            <input className="fi" id="email" type="email" value={formData.email} onChange={handleChange} placeholder="user@songdo.com" />
          </div>
          
          <div className="fg">
            <label>비밀번호 변경</label>
            <input className="fi" id="password" type="password" value={formData.password} onChange={handleChange} placeholder="변경할 경우에만 입력하세요" />
            <p style={{ fontSize: '.65rem', color: 'var(--dim)', marginTop: '5px' }}>비밀번호를 변경하지 않으려면 비워두세요.</p>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>취소</button>
          <button className="btn btn-sky" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="spinner"></span> : <><i className="fa-solid fa-save"></i> 정보 수정</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAccountModal;

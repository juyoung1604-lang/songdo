// components/admin/DetailModal.tsx
'use client';

import React from 'react';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: { label: string; value: React.ReactNode; mono?: boolean }[];
  footer?: React.ReactNode;
}

const DetailModal = ({ isOpen, onClose, title, data, footer }: DetailModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-wrap on" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-ttl">{title}</span>
          <button className="modal-close" onClick={onClose}><i className="fa-solid fa-times"></i></button>
        </div>
        <div className="modal-body">
          {data.map((item, idx) => (
            <div className="dr" key={idx}>
              <div className="dr-key">{item.label}</div>
              <div className="dr-val" style={item.mono ? { fontFamily: 'var(--font-mono)', fontSize: '.75rem' } : {}}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
        {footer && (
          <div className="modal-foot">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailModal;

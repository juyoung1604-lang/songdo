'use client';

import { useEffect, useMemo, useState } from 'react';
import { DB } from '@/lib/supabase';

type HomepagePopup = {
  id: string;
  title: string;
  image_url: string;
  content?: string;
  link_url?: string;
  button_label?: string;
  start_date?: string | null;
  end_date?: string | null;
  popup_size?: 'sm' | 'md' | 'lg';
  popup_width_px?: number | null;
  popup_height_px?: number | null;
  is_active: boolean;
  open_in_new_tab?: boolean;
  created_at?: string;
};

const DISMISS_PREFIX = 'songdo_popup_dismiss_';
const POPUP_WIDTHS = {
  sm: 'min(88vw, 420px)',
  md: 'min(92vw, 560px)',
  lg: 'min(94vw, 720px)',
} as const;

const HomepagePopupLayer = () => {
  const [popups, setPopups] = useState<HomepagePopup[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [hideForWeek, setHideForWeek] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    DB.getHomepagePopups().then((data) => {
      setPopups((data as HomepagePopup[]) || []);
    });
  }, []);

  const visiblePopups = useMemo(() => {
    if (!mounted) return [];

    return popups.filter((popup) => {
      if (!popup?.is_active || !popup?.image_url) return false;
      const today = new Date().toISOString().split('T')[0];
      if (popup.start_date && popup.start_date > today) return false;
      if (popup.end_date && popup.end_date < today) return false;
      if (typeof window !== 'undefined') {
        const storedUntil = localStorage.getItem(DISMISS_PREFIX + popup.id);
        if (storedUntil && Number(storedUntil) > Date.now()) return false;
      }
      return true;
    });
  }, [mounted, popups]);

  useEffect(() => {
    if (currentIndex > visiblePopups.length - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, visiblePopups.length]);

  if (!mounted || visiblePopups.length === 0) return null;

  const popup = visiblePopups[currentIndex];
  if (!popup) return null;
  const popupWidth =
    popup.popup_width_px && popup.popup_width_px > 0
      ? `min(96vw, ${Math.min(1200, Math.max(240, popup.popup_width_px))}px)`
      : POPUP_WIDTHS[popup.popup_size || 'md'];
  const popupHeight =
    popup.popup_height_px && popup.popup_height_px > 0
      ? `min(92vh, ${Math.min(1400, Math.max(240, popup.popup_height_px))}px)`
      : undefined;

  const closePopup = () => {
    if (visiblePopups.length <= 1) {
      setPopups([]);
      return;
    }
    setCurrentIndex((prev) => {
      if (prev >= visiblePopups.length - 1) return 0;
      return prev + 1;
    });
  };

  const handleClosePopup = () => {
    if (typeof window !== 'undefined' && hideForWeek[popup.id]) {
      const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem(DISMISS_PREFIX + popup.id, String(nextWeek));
    }
    closePopup();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: popupWidth,
          height: popupHeight,
          maxHeight: '92vh',
          borderRadius: '24px',
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.35)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            position: 'relative',
            aspectRatio: popupHeight ? undefined : '4 / 5',
            background: '#f8fafc',
            flex: popupHeight ? '1 1 auto' : undefined,
            minHeight: popupHeight ? '180px' : undefined,
          }}
        >
          <img src={popup.image_url} alt={popup.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button
            type="button"
            aria-label="팝업 닫기"
            onClick={closePopup}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '36px',
              height: '36px',
              borderRadius: '999px',
              border: 0,
              background: 'rgba(15, 23, 42, 0.72)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: popupHeight ? 'auto' : undefined }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{popup.title}</div>
          {popup.content && (
            <div style={{ fontSize: '.92rem', color: '#475569', lineHeight: 1.6, marginTop: '10px', whiteSpace: 'pre-line' }}>
              {popup.content}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
            {popup.link_url && (
              <a
                href={popup.link_url}
                target={popup.open_in_new_tab ? '_blank' : undefined}
                rel={popup.open_in_new_tab ? 'noreferrer' : undefined}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 16px',
                  borderRadius: '999px',
                  background: '#0f766e',
                  color: '#fff',
                  fontSize: '.85rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                {popup.button_label || '자세히 보기'}
              </a>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '18px' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '.84rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={!!hideForWeek[popup.id]}
                onChange={(e) =>
                  setHideForWeek((prev) => ({
                    ...prev,
                    [popup.id]: e.target.checked,
                  }))
                }
              />
              일주일간 보지 않기
            </label>
            <button
              type="button"
              onClick={handleClosePopup}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 16px',
                borderRadius: '999px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#334155',
                fontSize: '.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              닫기
            </button>
          </div>
          {visiblePopups.length > 1 && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '16px', justifyContent: 'center' }}>
              {visiblePopups.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`${index + 1}번 팝업 보기`}
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    width: currentIndex === index ? '22px' : '8px',
                    height: '8px',
                    borderRadius: '999px',
                    border: 0,
                    background: currentIndex === index ? '#0f766e' : '#cbd5e1',
                    cursor: 'pointer',
                    transition: 'all .2s ease',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomepagePopupLayer;

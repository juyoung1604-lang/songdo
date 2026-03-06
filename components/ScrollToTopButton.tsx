'use client';

import { useEffect, useState } from 'react';

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="최상단으로 이동"
      className={`fixed right-4 bottom-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-[#FF8B5A] text-white shadow-lg backdrop-blur-sm transition-all duration-200 sm:right-6 sm:bottom-6 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
      style={{ boxShadow: '0 16px 32px rgba(255, 139, 90, 0.28)' }}
    >
      <i className="ri-arrow-up-line text-xl" />
    </button>
  );
}

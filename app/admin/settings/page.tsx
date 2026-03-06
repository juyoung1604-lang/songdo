// app/admin/settings/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/components/admin/Toast';
import { DB } from '@/lib/supabase';
import { IMAGES, SELLER_IMAGES, GALLERY_ITEMS, DETAIL_CARDS } from '@/lib/constants';

const SettingsPage = () => {
  const { toast } = useToast();
  const imagePanelRef = useRef<HTMLDivElement | null>(null);
  const [sysSettings, setSysSettings] = useState({
    busker_deposit: 50000,
    seller_booth_fee: 30000,
    deposit_bank: '',
    deposit_account: ''
  });
  const [images, setImages] = useState<any[]>([]);
  const [activeImageGroup, setActiveImageGroup] = useState('배경 이미지');

  useEffect(() => {
    const s = DB.getSystemSettings();
    setSysSettings(s);
    loadImages();
  }, []);

  const loadImages = async () => {
    const data = await DB.getImages();
    setImages(data || []);
  };

  const handleSaveSettings = () => {
    DB.saveSystemSettings(sysSettings);
    toast('시스템 설정이 저장되었습니다.', 'jade');
  };

  const handleUpdateImage = async (id: string, url: string, section: string, alt: string) => {
    const { error } = await DB.updateImage(id, { url, section, alt, active: true });
    if (!error) {
      toast('이미지가 업데이트되었습니다. 홈페이지에 즉시 반영됩니다.', 'jade');
      loadImages();
    } else {
      toast('업데이트 실패: ' + error.message, 'rose');
    }
  };

  const handleUpdateCaption = async (id: string, caption: string, section: string, alt: string) => {
    const { error } = await DB.updateImage(id, { caption, section, alt });
    if (!error) {
      toast('캡션이 업데이트되었습니다.', 'jade');
      loadImages();
    } else {
      toast('업데이트 실패: ' + error.message, 'rose');
    }
  };

  const handleResetImage = async (id: string, defaultUrl: string, section: string, alt: string, defaultCaption?: string) => {
    const payload: any = { url: defaultUrl, section, alt, active: true };
    if (defaultCaption !== undefined) payload.caption = defaultCaption;
    const { error } = await DB.updateImage(id, payload);
    if (!error) {
      toast('기본값으로 복원되었습니다.', 'jade');
      loadImages();
    } else {
      toast('복원 실패: ' + error.message, 'rose');
    }
  };

  const downloadCSV = async (type: string) => {
    let data = [];
    if (type === 'busker') data = await DB.getBuskers();
    else if (type === 'seller') data = await DB.getSellers();
    
    if (!data || data.length === 0) {
      toast('내보낼 데이터가 없습니다.', 'sky');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(','), ...data.map((r: any) => headers.map(h => r[h]).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_list.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`${type} 목록을 다운로드합니다.`, 'jade');
  };

  const scrollToImageGroup = (title: string) => {
    setActiveImageGroup(title);
    const panel = imagePanelRef.current;
    const target = panel?.querySelector<HTMLElement>(`[data-image-group="${title}"]`);
    if (!panel || !target) return;

    panel.scrollTo({
      top: target.offsetTop - 72,
      behavior: 'smooth',
    });
  };

  const IMAGE_GROUPS = [
    {
      title: '배경 이미지',
      desc: '메인 비주얼과 섹션 배경처럼 화면 분위기를 만드는 이미지입니다.',
      items: [
        { id: 'img-hero', label: '메인 히어로 배경', section: 'hero', default: IMAGES.heroBg },
        { id: 'img-busker-bg', label: '버스커 섹션 배경', section: 'busker', default: IMAGES.buskerBg },
      ],
    },
    {
      title: '페이지 이미지',
      desc: '각 섹션 본문 카드나 썸네일에 직접 노출되는 이미지입니다.',
      items: [
        { id: 'img-about-1', label: '정보 섹션 1 (버스킹)', section: 'about', default: IMAGES.aboutImg1 },
        { id: 'img-about-2', label: '정보 섹션 2 (마켓)', section: 'about', default: IMAGES.aboutImg2 },
        { id: 'img-detail-1', label: '행사 안내 카드 1', section: 'details', default: DETAIL_CARDS[0].url },
        { id: 'img-detail-2', label: '행사 안내 카드 2', section: 'details', default: DETAIL_CARDS[1].url },
        { id: 'img-detail-3', label: '행사 안내 카드 3', section: 'details', default: DETAIL_CARDS[2].url },
        { id: 'img-seller-1', label: '셀러 갤러리 1', section: 'seller', default: SELLER_IMAGES[0].url },
        { id: 'img-seller-2', label: '셀러 갤러리 2', section: 'seller', default: SELLER_IMAGES[1].url },
        { id: 'img-seller-3', label: '셀러 갤러리 3', section: 'seller', default: SELLER_IMAGES[2].url },
        { id: 'img-seller-4', label: '셀러 갤러리 4', section: 'seller', default: SELLER_IMAGES[3].url },
        { id: 'img-gallery-1', label: 'Weekend Vibes 1', section: 'gallery', default: GALLERY_ITEMS[0].url, defaultCaption: GALLERY_ITEMS[0].caption },
        { id: 'img-gallery-2', label: 'Weekend Vibes 2', section: 'gallery', default: GALLERY_ITEMS[1].url, defaultCaption: GALLERY_ITEMS[1].caption },
        { id: 'img-gallery-3', label: 'Weekend Vibes 3', section: 'gallery', default: GALLERY_ITEMS[2].url, defaultCaption: GALLERY_ITEMS[2].caption },
        { id: 'img-gallery-4', label: 'Weekend Vibes 4', section: 'gallery', default: GALLERY_ITEMS[3].url, defaultCaption: GALLERY_ITEMS[3].caption },
        { id: 'img-gallery-5', label: 'Weekend Vibes 5', section: 'gallery', default: GALLERY_ITEMS[4].url, defaultCaption: GALLERY_ITEMS[4].caption },
        { id: 'img-gallery-6', label: 'Weekend Vibes 6', section: 'gallery', default: GALLERY_ITEMS[5].url, defaultCaption: GALLERY_ITEMS[5].caption },
      ],
    },
    {
      title: '팝업 이미지',
      desc: '이미지 클릭 시 팝업에서 크게 노출되는 전용 이미지입니다.',
      items: [
        { id: 'img-detail-popup-1', label: '행사 안내 팝업 1', section: 'details-popup', default: DETAIL_CARDS[0].url },
        { id: 'img-detail-popup-2', label: '행사 안내 팝업 2', section: 'details-popup', default: DETAIL_CARDS[1].url },
        { id: 'img-detail-popup-3', label: '행사 안내 팝업 3', section: 'details-popup', default: DETAIL_CARDS[2].url },
      ],
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>시스템 설정</h1>
          <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>홈페이지 구성 및 시스템 정책 관리</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        <div className="card">
          <div className="card-h"><span className="card-title">홈페이지 이미지 관리</span></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                padding: '14px',
                border: '1px solid var(--line)',
                borderRadius: '14px',
                background: 'var(--bg)',
              }}
            >
              {IMAGE_GROUPS.map((group) => (
                <button
                  key={group.title}
                  className="btn"
                  onClick={() => scrollToImageGroup(group.title)}
                  style={{
                    flexShrink: 0,
                    borderColor: activeImageGroup === group.title ? 'var(--accent)' : 'var(--line)',
                    background: activeImageGroup === group.title ? 'rgba(13, 148, 136, 0.12)' : 'var(--bg)',
                    color: activeImageGroup === group.title ? 'var(--text)' : 'var(--muted)',
                  }}
                >
                  <i className="ri-search-line"></i> {group.title}
                </button>
              ))}
            </div>
            <div
              ref={imagePanelRef}
              className="space-y-6"
              style={{ maxHeight: '620px', overflowY: 'auto', paddingRight: '10px' }}
            >
            {IMAGE_GROUPS.map((group) => (
              <div
                key={group.title}
                data-image-group={group.title}
                style={{ border: '1px solid var(--line)', borderRadius: '16px', padding: '16px', background: 'var(--bg)', scrollMarginTop: '12px' }}
              >
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '.85rem', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>{group.title}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{group.desc}</div>
                </div>
                <div className="space-y-4">
                  {group.items.map((item) => {
                    const current = images.find(img => img.id === item.id);
                    const isGallery = item.defaultCaption !== undefined;
                    return (
                      <div key={item.id} style={{ borderTop: '1px solid var(--line)', paddingTop: '14px' }}>
                        <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px' }}>{item.label}</label>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ width: '80px', height: isGallery ? '80px' : '60px', borderRadius: '8px', overflow: 'hidden', backgroundColor: 'var(--bg-muted)', flexShrink: 0 }}>
                            <img src={current?.url || item.default} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <input
                              className="fi"
                              placeholder="이미지 URL을 입력하세요"
                              defaultValue={current?.url || ''}
                              onBlur={(e) => {
                                if (e.target.value && e.target.value !== current?.url) {
                                  handleUpdateImage(item.id, e.target.value, item.section, item.label);
                                }
                              }}
                            />
                            {isGallery && (
                              <input
                                className="fi"
                                placeholder="이미지 위에 표시될 텍스트 (캡션)"
                                defaultValue={current?.caption || item.defaultCaption || ''}
                                onBlur={(e) => {
                                  if (e.target.value !== (current?.caption ?? item.defaultCaption)) {
                                    handleUpdateCaption(item.id, e.target.value, item.section, item.label);
                                  }
                                }}
                              />
                            )}
                          </div>
                          <button className="btn" onClick={() => handleResetImage(item.id, item.default, item.section, item.label, item.defaultCaption)} title="기본값으로 복원" style={{ flexShrink: 0 }}>
                            <i className="ri-restart-line"></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-h"><span className="card-title">행사 기본 설정</span></div>
            <div className="card-body space-y-4">
              <div>
                <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '5px' }}>버스킹 보증금 (원)</label>
                <input 
                  className="fi" 
                  type="number" 
                  value={sysSettings.busker_deposit} 
                  onChange={(e) => setSysSettings({...sysSettings, busker_deposit: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '5px' }}>기본 셀러 부스비 (원)</label>
                <input 
                  className="fi" 
                  type="number" 
                  value={sysSettings.seller_booth_fee} 
                  onChange={(e) => setSysSettings({...sysSettings, seller_booth_fee: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '5px' }}>입금 은행</label>
                <input
                  className="fi"
                  type="text"
                  value={sysSettings.deposit_bank || ''}
                  onChange={(e) => setSysSettings({ ...sysSettings, deposit_bank: e.target.value })}
                  placeholder="예: 신한은행"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, color: 'var(--muted)', marginBottom: '5px' }}>계좌번호</label>
                <input
                  className="fi"
                  type="text"
                  value={sysSettings.deposit_account || ''}
                  onChange={(e) => setSysSettings({ ...sysSettings, deposit_account: e.target.value })}
                  placeholder="예: 110-123-456789"
                />
              </div>
              <button className="btn btn-jade" onClick={handleSaveSettings} style={{ width: '100%' }}><i className="fa-solid fa-save"></i> 설정 저장</button>
            </div>
          </div>

          <div className="card">
            <div className="card-h"><span className="card-title">데이터 관리</span></div>
            <div className="card-body space-y-2">
              <button className="btn" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => downloadCSV('busker')}><i className="ri-file-download-line"></i> 버스커 목록 내보내기 (CSV)</button>
              <button className="btn" style={{ width: '100%', justifyContent: 'flex-start' }} onClick={() => downloadCSV('seller')}><i className="ri-file-download-line"></i> 셀러 목록 내보내기 (CSV)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

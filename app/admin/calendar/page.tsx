// app/admin/calendar/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DB } from '@/lib/supabase';
import AddModal from '@/components/admin/AddModal';
import { useToast } from '@/components/admin/Toast';
import { useAdmin } from '../layout';

const MONTHS_KR = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

type DBEvent = {
  id: string;
  title: string;
  event_date: string;
  busker_count: number;
  seller_count: number;
  note?: string;
};

type BuskerRecord = {
  id: string;
  name: string;
  team?: string;
  event_date: string;
  status: string;
};

type SellerRecord = {
  id: string;
  name: string;
  category?: string;
  event_date: string;
  status: string;
};

const APPROVED_SELLER_STATUSES = new Set(['approved', 'paid']);

const CalendarPage = () => {
  const { can } = useAdmin();
  const { toast } = useToast();

  const [events, setEvents]   = useState<DBEvent[]>([]);
  const [buskers, setBuskers] = useState<BuskerRecord[]>([]);
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [calY, setCalY]       = useState(new Date().getFullYear());
  const [calM, setCalM]       = useState(new Date().getMonth());
  const [isAddModalOpen, setIsAddModalOpen]   = useState(false);
  const [newEventDefaults, setNewEventDefaults] = useState<Partial<DBEvent> | null>(null);
  const [editingEvent, setEditingEvent]       = useState<DBEvent | null>(null);
  const [selectedDate, setSelectedDate]       = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [evData, bkData, skData] = await Promise.all([
      DB.getEvents(),
      DB.getBuskers(),
      DB.getSellers(),
    ]);
    setEvents(evData as DBEvent[]);
    setBuskers(bkData as BuskerRecord[]);
    setSellers(skData as SellerRecord[]);
  };

  const getApprovedBuskersByDate = (date: string) =>
    buskers.filter((b) => b.event_date === date && b.status === 'approved');

  const getApprovedSellersByDate = (date: string) =>
    sellers.filter((s) => s.event_date === date && APPROVED_SELLER_STATUSES.has(s.status));

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('이 행사를 삭제하시겠습니까?')) return;
    const { error } = await DB.deleteEvent(id);
    if (!error) {
      toast('행사가 삭제되었습니다.', 'jade');
      fetchAll();
    } else {
      toast('삭제 실패: ' + (error as any).message, 'rose');
    }
  };

  const nav = (dir: number) => {
    if (dir === 0) { setCalY(new Date().getFullYear()); setCalM(new Date().getMonth()); return; }
    let nm = calM + dir, ny = calY;
    if (nm < 0)  { nm = 11; ny--; }
    if (nm > 11) { nm = 0;  ny++; }
    setCalY(ny); setCalM(nm);
  };

  const openCreateEventModal = () => {
    setEditingEvent(null);
    setNewEventDefaults({
      title: '',
      event_date: selectedDate,
      busker_count: 0,
      seller_count: 0,
      note: '',
    });
    setIsAddModalOpen(true);
  };

  const closeCreateEventModal = () => {
    setIsAddModalOpen(false);
    setNewEventDefaults(null);
  };

  const upsertEvent = (eventItem: DBEvent) => {
    setEvents((prev) =>
      [...prev.filter((item) => item.id !== eventItem.id), eventItem]
        .sort((a, b) => a.event_date.localeCompare(b.event_date))
    );
  };

  const renderCalendar = () => {
    const fd   = new Date(calY, calM, 1).getDay();
    const ld   = new Date(calY, calM + 1, 0).getDate();
    const pl   = new Date(calY, calM, 0).getDate();
    const mStr = `${calY}-${String(calM + 1).padStart(2, '0')}`;

    const days: React.ReactNode[] = [];

    // Prev-month dim cells
    for (let i = 0; i < fd; i++) {
      days.push(
        <div key={`p-${i}`} className="cal-day dim">
          <div className="cal-dn">{pl - fd + i + 1}</div>
        </div>
      );
    }

    // Current-month cells
    for (let d = 1; d <= ld; d++) {
      const ds  = `${mStr}-${String(d).padStart(2, '0')}`;
      const evs = events.filter(e => (e.event_date) === ds);

      // Live counts from actual busker/seller tables
      const liveBk = getApprovedBuskersByDate(ds).length;
      const liveSk = getApprovedSellersByDate(ds).length;

      const isToday    = ds === today;
      const isSelected = selectedDate === ds;

      days.push(
        <div
          key={`d-${d}`}
          className={`cal-day${isToday ? ' today' : ''}${evs.length ? ' has-ev' : ''}${isSelected ? ' selected' : ''}`}
          onClick={() => setSelectedDate(ds)}
          style={{
            cursor: 'pointer',
            position: 'relative',
            minHeight: '80px',
            padding: '6px',
          }}
        >
          {/* Selected border */}
          {isSelected && (
            <div style={{ position: 'absolute', inset: '3px', border: '2px solid var(--jade)', borderRadius: '8px', pointerEvents: 'none', zIndex: 0 }} />
          )}

          <div className="cal-dn" style={{ position: 'relative', zIndex: 1 }}>{d}</div>

          {/* Event chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px', position: 'relative', zIndex: 1 }}>
            {evs.map((e) => (
              <div
                key={e.id}
                className="ev-chip ev-e"
                style={{ fontSize: '0.58rem', padding: '1px 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}
                title={e.title}
              >
                {e.title}
              </div>
            ))}
            {/* Count chips */}
            {(liveBk > 0 || liveSk > 0 || evs.some(e => e.busker_count > 0 || e.seller_count > 0)) && (
              <div style={{ display: 'flex', gap: '2px', flexWrap: 'wrap' }}>
                {(liveBk > 0 || evs[0]?.busker_count > 0) && (
                  <span
                    className="ev-chip ev-b"
                    style={{ fontSize: '0.58rem', padding: '1px 4px' }}
                  >
                    버 {liveBk || evs[0]?.busker_count || 0}
                  </span>
                )}
                {(liveSk > 0 || evs[0]?.seller_count > 0) && (
                  <span
                    className="ev-chip ev-s"
                    style={{ fontSize: '0.58rem', padding: '1px 4px' }}
                  >
                    셀 {liveSk || evs[0]?.seller_count || 0}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Next-month dim cells
    const rem = (7 - ((fd + ld) % 7)) % 7;
    for (let i = 1; i <= rem; i++) {
      days.push(<div key={`n-${i}`} className="cal-day dim"><div className="cal-dn">{i}</div></div>);
    }

    return days;
  };

  const selectedEvents = events.filter(e => e.event_date === selectedDate);
  const selectedBuskers = getApprovedBuskersByDate(selectedDate);
  const selectedSellers = getApprovedSellersByDate(selectedDate);
  const upcomingEvents = events
    .filter(e => e.event_date >= today)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>

        {/* ─── Left: Calendar + detail ─── */}
        <div className="space-y-5">
          <div className="card">
            <div className="card-h">
              <div className="cal-month" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {calY}년 {MONTHS_KR[calM]}
              </div>
              <div className="cal-nav-btns">
                <button className="cal-nav-btn" onClick={() => nav(-1)}>
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <button className="cal-nav-btn" onClick={() => nav(0)}>오늘</button>
                <button className="cal-nav-btn" onClick={() => nav(1)}>
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            </div>

            <div className="card-body" style={{ padding: '12px' }}>
              <div
                className="cal-grid"
                style={{ gridTemplateRows: 'auto repeat(6, 1fr)', minHeight: '480px' }}
              >
                {['일','월','화','수','목','금','토'].map(d => (
                  <div key={d} className="cal-dow" style={{ fontWeight: 700, paddingBottom: '8px' }}>{d}</div>
                ))}
                {renderCalendar()}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="ev-chip ev-e" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>이벤트</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>행사명</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="ev-chip ev-b" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>버 n</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>승인 버스커</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="ev-chip ev-s" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>셀 n</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>승인 셀러</span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected date detail */}
          <div className="card">
            <div className="card-h" style={{ background: 'var(--ink3)' }}>
              <span className="card-title">
                <i className="fa-solid fa-calendar-day" style={{ marginRight: '8px', color: 'var(--jade)' }} />
                {selectedDate} 행사 상세
              </span>
              {can('create') && (
                <button
                  className="btn btn-jade"
                  style={{ fontSize: '.72rem' }}
                  onClick={openCreateEventModal}
                >
                  <i className="fa-solid fa-plus" /> 행사 등록
                </button>
              )}
            </div>

            <div className="card-body">
              {selectedEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedEvents.map((e) => {
                    const liveBk = getApprovedBuskersByDate(e.event_date).length;
                    const liveSk = getApprovedSellersByDate(e.event_date).length;
                    return (
                      <div
                        key={e.id}
                        style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--head)' }}>{e.title}</h4>
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            {can('edit') && (
                              <button
                                className="ico-btn"
                                title="수정"
                                onClick={() => setEditingEvent(e)}
                              >
                                <i className="fa-solid fa-pen-to-square" />
                              </button>
                            )}
                            {can('delete') && (
                              <button
                                className="ico-btn reject"
                                title="삭제"
                                onClick={() => handleDeleteEvent(e.id)}
                              >
                                <i className="fa-solid fa-trash" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--ink3)' }}>
                            <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '3px' }}>버스커 (승인)</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--jade)', lineHeight: 1 }}>
                              {liveBk > 0 ? liveBk : e.busker_count}
                              <span style={{ fontSize: '0.7rem', fontWeight: 500, marginLeft: '3px' }}>팀</span>
                            </div>
                            {liveBk > 0 && liveBk !== e.busker_count && (
                              <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginTop: '2px' }}>예정: {e.busker_count}팀</div>
                            )}
                          </div>
                          <div style={{ padding: '10px', borderRadius: '8px', background: 'var(--ink3)' }}>
                            <div style={{ fontSize: '0.62rem', color: 'var(--muted)', fontWeight: 700, marginBottom: '3px' }}>셀러 부스</div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--gold)', lineHeight: 1 }}>
                              {liveSk > 0 ? liveSk : e.seller_count}
                              <span style={{ fontSize: '0.7rem', fontWeight: 500, marginLeft: '3px' }}>개</span>
                            </div>
                            {liveSk > 0 && liveSk !== e.seller_count && (
                              <div style={{ fontSize: '0.6rem', color: 'var(--muted)', marginTop: '2px' }}>예정: {e.seller_count}개</div>
                            )}
                          </div>
                        </div>

                        {e.note && (
                          <div style={{ padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid var(--jade)', background: 'var(--ink2)', fontSize: '0.78rem', color: 'var(--soft)' }}>
                            {e.note}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: '12px',
                    }}
                  >
                    <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--head)' }}>승인 버스커</strong>
                        <span className="badge b-approved">{selectedBuskers.length}명</span>
                      </div>
                      {selectedBuskers.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {selectedBuskers.map((busker) => (
                            <div key={busker.id} style={{ padding: '9px 10px', borderRadius: '8px', background: 'var(--ink3)', border: '1px solid var(--line)' }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--head)' }}>{busker.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>{busker.team || '솔로'}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>승인된 버스커가 없습니다.</div>
                      )}
                    </div>

                    <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '0.88rem', color: 'var(--head)' }}>승인 셀러</strong>
                        <span className="badge b-approved">{selectedSellers.length}명</span>
                      </div>
                      {selectedSellers.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {selectedSellers.map((seller) => (
                            <div key={seller.id} style={{ padding: '9px 10px', borderRadius: '8px', background: 'var(--ink3)', border: '1px solid var(--line)' }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--head)' }}>{seller.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>{seller.category || '카테고리 미입력'}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>승인된 셀러가 없습니다.</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--dim)' }}>
                    <i className="fa-solid fa-calendar-xmark" style={{ fontSize: '1.8rem', marginBottom: '10px', display: 'block' }} />
                    <p style={{ fontSize: '0.82rem' }}>예정된 행사가 없습니다.</p>
                  </div>

                  {(selectedBuskers.length > 0 || selectedSellers.length > 0) && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '12px',
                      }}
                    >
                      <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--head)' }}>승인 버스커</strong>
                          <span className="badge b-approved">{selectedBuskers.length}명</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {selectedBuskers.map((busker) => (
                            <div key={busker.id} style={{ padding: '9px 10px', borderRadius: '8px', background: 'var(--ink3)', border: '1px solid var(--line)' }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--head)' }}>{busker.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>{busker.team || '솔로'}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ padding: '14px', borderRadius: '12px', border: '1px solid var(--line)', background: 'var(--bg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--head)' }}>승인 셀러</strong>
                          <span className="badge b-approved">{selectedSellers.length}명</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {selectedSellers.map((seller) => (
                            <div key={seller.id} style={{ padding: '9px 10px', borderRadius: '8px', background: 'var(--ink3)', border: '1px solid var(--line)' }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--head)' }}>{seller.name}</div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>{seller.category || '카테고리 미입력'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ─── Right: Upcoming ─── */}
        <div className="space-y-4">
          <div className="card">
            <div className="card-h">
              <span className="card-title">
                <i className="fa-regular fa-clock" style={{ marginRight: '6px', color: 'var(--jade)' }} />
                다가오는 행사
              </span>
            </div>
            <div className="card-body flush">
              <div className="upcoming-list" style={{ padding: '10px' }}>
                {upcomingEvents.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--dim)', fontSize: '0.8rem' }}>
                    예정된 행사 없음
                  </div>
                ) : (
                  upcomingEvents.map((e) => (
                    <div
                      key={e.id}
                      className="uc-card"
                      style={{
                        background: e.event_date === selectedDate ? 'var(--jade-bg)' : 'var(--ink3)',
                        border: e.event_date === selectedDate ? '1px solid var(--jade)' : '1px solid var(--line)',
                        borderRadius: '8px',
                        padding: '11px 13px',
                        marginBottom: '7px',
                        cursor: 'pointer',
                        transition: 'all .15s',
                      }}
                      onClick={() => {
                        const d = new Date(e.event_date);
                        setCalY(d.getFullYear()); setCalM(d.getMonth());
                        setSelectedDate(e.event_date);
                      }}
                    >
                      <div className="uc-date">{e.event_date}</div>
                      <div className="uc-title">{e.title}</div>
                      <div className="uc-chips">
                        <span className="ev-chip ev-b">버스커 {e.busker_count}</span>
                        <span className="ev-chip ev-s">셀러 {e.seller_count}</span>
                        {e.note && (
                          <span className="ev-chip" style={{ background: 'var(--ink4)', color: 'var(--muted)' }}>{e.note}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Add modal */}
      <AddModal
        type="event"
        isOpen={isAddModalOpen}
        onClose={closeCreateEventModal}
        onSuccess={(savedEvent) => {
          const normalizedEvent = savedEvent
            ? {
                id: savedEvent.id || `temp_e_${Date.now()}`,
                title: savedEvent.title || newEventDefaults?.title || '',
                event_date: savedEvent.event_date || newEventDefaults?.event_date || selectedDate,
                busker_count: savedEvent.busker_count ?? newEventDefaults?.busker_count ?? 0,
                seller_count: savedEvent.seller_count ?? newEventDefaults?.seller_count ?? 0,
                note: savedEvent.note ?? newEventDefaults?.note ?? '',
              }
            : null;
          const nextDate = normalizedEvent?.event_date || newEventDefaults?.event_date || selectedDate;
          const d = new Date(nextDate);
          setCalY(d.getFullYear());
          setCalM(d.getMonth());
          setSelectedDate(nextDate);
          if (normalizedEvent) {
            upsertEvent(normalizedEvent);
          }
          closeCreateEventModal();
          fetchAll();
        }}
        initialData={newEventDefaults}
      />

      {/* Edit modal */}
      {editingEvent && (
        <AddModal
          type="event"
          isOpen={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={(savedEvent) => {
            if (savedEvent) {
              upsertEvent(savedEvent as DBEvent);
              setSelectedDate((savedEvent as DBEvent).event_date);
            }
            setEditingEvent(null);
            fetchAll();
          }}
          initialData={editingEvent}
        />
      )}
    </div>
  );
};

export default CalendarPage;

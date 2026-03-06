"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DB } from "@/lib/supabase";

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

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const TODAY = new Date().toISOString().split("T")[0];
const VISIBLE_SELLER_STATUSES = new Set(["paid"]);

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleModal({ isOpen, onClose }: Props) {
  const [events, setEvents] = useState<DBEvent[]>([]);
  const [buskers, setBuskers] = useState<BuskerRecord[]>([]);
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string>(TODAY);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([DB.getEvents(), DB.getBuskers(), DB.getSellers()]).then(([eventData, buskerData, sellerData]) => {
      setEvents((eventData as DBEvent[]) || []);
      setBuskers((buskerData as BuskerRecord[]) || []);
      setSellers((sellerData as SellerRecord[]) || []);
      setLoading(false);
    });
  }, [isOpen]);

  const getApprovedBuskersByDate = (date: string) =>
    buskers.filter((item) => item.event_date === date && item.status === "approved");

  const getApprovedSellersByDate = (date: string) =>
    sellers.filter((item) => item.event_date === date && VISIBLE_SELLER_STATUSES.has(item.status));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  // Build date → events map
  const eventMap: Record<string, DBEvent[]> = {};
  events.forEach((e) => {
    if (!eventMap[e.event_date]) eventMap[e.event_date] = [];
    eventMap[e.event_date].push(e);
  });

  // Upcoming events from today, sorted asc
  const upcoming = events
    .filter((e) => e.event_date >= TODAY)
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 6);

  const selectedEvents: DBEvent[] = eventMap[selectedDate] ?? [];
  const selectedBuskers = getApprovedBuskersByDate(selectedDate);
  const selectedSellers = getApprovedSellersByDate(selectedDate);

  const toDateStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const formatDateLabel = (dateStr: string) => {
    const [, m, d] = dateStr.split("-");
    return `${parseInt(m)}월 ${parseInt(d)}일`;
  };

  const handleUpcomingClick = (ev: DBEvent) => {
    const d = new Date(ev.event_date);
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    setSelectedDate(ev.event_date);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full md:w-[780px] lg:w-[880px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: "92vh" }}
            initial={{ y: 80, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle – mobile only */}
            <div className="flex justify-center pt-3 pb-0 md:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF8B5A] flex items-center justify-center flex-shrink-0">
                  <i className="ri-calendar-event-line text-white text-base" />
                </div>
                <div>
                  <p
                    className="font-bold text-[#2C2C2C] text-base leading-tight"
                    style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                  >
                    행사 일정
                  </p>
                  <p
                    className="text-xs text-[#6B6B6B] leading-tight"
                    style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                  >
                    송도 버스킹 &amp; 플리마켓 2026
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
                aria-label="닫기"
              >
                <i className="ri-close-line text-xl text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-col md:flex-row overflow-y-auto flex-1 min-h-0">
              {/* ─── Calendar ─── */}
              <div className="flex-1 p-4 sm:p-5 min-w-0">
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <i className="ri-arrow-left-s-line text-xl text-gray-600" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-bold text-[#2C2C2C] text-sm"
                      style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                    >
                      {year}년 {month + 1}월
                    </span>
                    <button
                      onClick={() => {
                        const d = new Date();
                        setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                        setSelectedDate(TODAY);
                      }}
                      className="text-xs px-2 py-0.5 rounded-full border border-gray-200 hover:border-[#FF8B5A] hover:text-[#FF8B5A] text-gray-500 transition-colors"
                      style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                    >
                      오늘
                    </button>
                  </div>
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <i className="ri-arrow-right-s-line text-xl text-gray-600" />
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-1">
                  {WEEKDAYS.map((d, i) => (
                    <div
                      key={d}
                      className="text-center text-xs font-bold py-1.5 uppercase tracking-widest"
                      style={{
                        color: i === 0 ? "#EF4444" : i === 6 ? "#3B82F6" : "#9CA3AF",
                      }}
                    >
                      {d}
                    </div>
                  ))}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <div className="w-6 h-6 border-2 border-[#FF8B5A] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                    {/* Empty offset */}
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <div key={`blank-${i}`} className="bg-white opacity-40 min-h-[72px] sm:min-h-[80px]" />
                    ))}

                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = toDateStr(year, month, day);
                      const dayEvents = eventMap[dateStr] ?? [];
                      const primaryEvent = dayEvents[0];
                      const approvedBuskers = getApprovedBuskersByDate(dateStr);
                      const approvedSellers = getApprovedSellersByDate(dateStr);
                      const hasEvent = dayEvents.length > 0;
                      const hasApprovedParticipants =
                        approvedBuskers.length > 0 || approvedSellers.length > 0;
                      const isSelected = selectedDate === dateStr;
                      const isToday = dateStr === TODAY;
                      const dow = (firstDay + i) % 7;

                      return (
                        <div
                          key={day}
                          onClick={() => setSelectedDate(dateStr)}
                          className={`
                            bg-white cursor-pointer transition-all min-h-[72px] sm:min-h-[80px]
                            p-1.5 flex flex-col
                            ${isSelected ? "ring-2 ring-inset ring-[#FF8B5A] bg-orange-50" : "hover:bg-gray-50"}
                            ${isToday && !isSelected ? "ring-1 ring-inset ring-[#4A5D3F]" : ""}
                          `}
                        >
                          {/* Day number */}
                          <span
                            className={`
                              text-xs font-bold leading-none mb-1 self-end
                              ${isSelected ? "text-[#FF8B5A]"
                                : isToday ? "text-[#4A5D3F] font-black"
                                : dow === 0 ? "text-red-400"
                                : dow === 6 ? "text-blue-500"
                                : "text-[#2C2C2C]"}
                            `}
                          >
                            {day}
                          </span>

                          {/* Event chips */}
                          <div className="flex flex-col gap-0.5 overflow-hidden">
                            {dayEvents.slice(0, 2).map((ev) => (
                              <span
                                key={ev.id}
                                className="block truncate text-[10px] font-bold px-1 py-0.5 rounded leading-tight"
                                style={{ background: "#E0F2FE", color: "#0369A1" }}
                                title={ev.title}
                              >
                                {ev.title.length > 6 ? ev.title.slice(0, 5) + "…" : ev.title}
                              </span>
                            ))}
                            {(hasEvent || hasApprovedParticipants) && (
                              <div className="flex gap-0.5 mt-0.5 flex-wrap">
                                {(approvedBuskers.length > 0 || (primaryEvent?.busker_count ?? 0) > 0) && (
                                  <span
                                    className="text-[9px] font-bold px-1 rounded leading-tight"
                                    style={{ background: "#D1FAE5", color: "#065F46" }}
                                  >
                                    버 {approvedBuskers.length || primaryEvent?.busker_count || 0}
                                  </span>
                                )}
                                {(approvedSellers.length > 0 || (primaryEvent?.seller_count ?? 0) > 0) && (
                                  <span
                                    className="text-[9px] font-bold px-1 rounded leading-tight"
                                    style={{ background: "#FEF3C7", color: "#92400E" }}
                                  >
                                    셀 {approvedSellers.length || primaryEvent?.seller_count || 0}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Fill remainder */}
                    {(() => {
                      const rem = (7 - ((firstDay + daysInMonth) % 7)) % 7;
                      return Array.from({ length: rem }).map((_, i) => (
                        <div key={`tail-${i}`} className="bg-white opacity-40 min-h-[72px] sm:min-h-[80px]" />
                      ));
                    })()}
                  </div>
                )}

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#E0F2FE", color: "#0369A1" }}>이벤트</span>
                    <span className="text-xs text-[#6B6B6B]" style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>행사명</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#D1FAE5", color: "#065F46" }}>버 n</span>
                    <span className="text-xs text-[#6B6B6B]" style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>버스커</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#FEF3C7", color: "#92400E" }}>셀 n</span>
                    <span className="text-xs text-[#6B6B6B]" style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>셀러</span>
                  </div>
                  <div className="flex items-center gap-1 ml-auto">
                    <span className="w-3 h-3 rounded-sm ring-2 ring-inset ring-[#4A5D3F] flex-shrink-0" />
                    <span className="text-xs text-[#6B6B6B]" style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>오늘</span>
                  </div>
                </div>
              </div>

              {/* ─── Right panel: Upcoming + Selected Detail ─── */}
              <div className="md:w-60 lg:w-68 border-t md:border-t-0 md:border-l border-gray-100 flex-shrink-0 flex flex-col bg-[#FAFAF9]">
                {/* Upcoming events */}
                <div className="p-4 border-b border-gray-100">
                  <p
                    className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest mb-3"
                    style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                  >
                    다가오는 행사
                  </p>
                  <div className="space-y-2">
                    {upcoming.length === 0 ? (
                      <p className="text-xs text-[#9CA3AF] py-3 text-center" style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                        예정된 행사 없음
                      </p>
                    ) : (
                      upcoming.map((ev) => {
                        const approvedBuskers = getApprovedBuskersByDate(ev.event_date);
                        const approvedSellers = getApprovedSellersByDate(ev.event_date);

                        return (
                          <motion.button
                            key={ev.id}
                            onClick={() => handleUpcomingClick(ev)}
                            className={`w-full text-left rounded-xl p-3 transition-all border ${
                              selectedDate === ev.event_date
                                ? "border-[#FF8B5A] bg-orange-50"
                                : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                            }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <p
                              className="text-[10px] text-[#9CA3AF] mb-0.5 font-mono"
                            >
                              {ev.event_date}
                            </p>
                            <p
                              className="text-xs font-bold text-[#2C2C2C] mb-1.5 leading-snug"
                              style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                            >
                              {ev.title}
                            </p>
                            <div className="flex gap-1 flex-wrap">
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                style={{ background: "#D1FAE5", color: "#065F46" }}
                              >
                                버스커 {approvedBuskers.length || ev.busker_count}
                              </span>
                              <span
                                className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                style={{ background: "#FEF3C7", color: "#92400E" }}
                              >
                                셀러 {approvedSellers.length || ev.seller_count}
                              </span>
                              {ev.note && (
                                <span
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                  style={{ background: "#F0F0F0", color: "#6B6B6B" }}
                                >
                                  {ev.note}
                                </span>
                              )}
                            </div>
                          </motion.button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Selected date detail */}
                <div className="p-4 flex-1 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedDate}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.16 }}
                    >
                      <p
                        className="text-xs font-bold text-[#6B6B6B] uppercase tracking-widest mb-3"
                        style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                      >
                        {formatDateLabel(selectedDate)} 일정
                      </p>
                      {selectedEvents.length === 0 ? (
                        <div className="flex flex-col items-center py-6 text-center">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-2">
                            <i className="ri-calendar-2-line text-xl text-gray-300" />
                          </div>
                          <p
                            className="text-xs text-[#9CA3AF]"
                            style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                          >
                            일정이 없습니다
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedEvents.map((ev, idx) => {
                            const approvedBuskers = getApprovedBuskersByDate(ev.event_date);
                            const approvedSellers = getApprovedSellersByDate(ev.event_date);

                            return (
                              <motion.div
                                key={ev.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.06 }}
                                className="bg-white rounded-xl p-3 shadow-sm border border-gray-100"
                              >
                                <p
                                  className="font-bold text-[#2C2C2C] text-xs mb-1.5 leading-snug"
                                  style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                                >
                                  {ev.title}
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  <span
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                    style={{ background: "#D1FAE5", color: "#065F46" }}
                                  >
                                    버스커 {approvedBuskers.length || ev.busker_count}팀
                                  </span>
                                  <span
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                    style={{ background: "#FEF3C7", color: "#92400E" }}
                                  >
                                    셀러 {approvedSellers.length || ev.seller_count}개
                                  </span>
                                  {ev.note && (
                                    <span
                                      className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                      style={{ background: "#F0F0F0", color: "#6B6B6B" }}
                                    >
                                      {ev.note}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                      {(selectedBuskers.length > 0 || selectedSellers.length > 0) && (
                        <div className="mt-3 space-y-2">
                          {selectedBuskers.length > 0 && (
                            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                              <p className="text-[10px] font-bold text-[#065F46] mb-1.5">버스커</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedBuskers.map((item) => (
                                  <span
                                    key={item.id}
                                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                                    style={{ background: "#ECFDF5", color: "#065F46" }}
                                  >
                                    {item.name}{item.team ? ` · ${item.team}` : ""}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedSellers.length > 0 && (
                            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                              <p className="text-[10px] font-bold text-[#92400E] mb-1.5">셀러</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedSellers.map((item) => (
                                  <span
                                    key={item.id}
                                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                                    style={{ background: "#FFFBEB", color: "#92400E" }}
                                  >
                                    {item.name}{item.category ? ` · ${item.category}` : ""}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

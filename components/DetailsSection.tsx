"use client";

import { useEffect, useState } from "react";
import AnimateOnScroll from "./AnimateOnScroll";
import { DETAIL_CARDS } from "@/lib/constants";
import { DB } from "@/lib/supabase";

export default function DetailsSection() {
  const [cardUrls, setCardUrls] = useState<string[]>(DETAIL_CARDS.map((card) => card.url));
  const [popupUrls, setPopupUrls] = useState<string[]>(DETAIL_CARDS.map((card) => card.url));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      const imgs = await DB.getImages();
      setCardUrls(
        DETAIL_CARDS.map((card, idx) => imgs?.find((item: any) => item.id === `img-detail-${idx + 1}` && item.active)?.url || card.url)
      );
      setPopupUrls(
        DETAIL_CARDS.map((card, idx) => imgs?.find((item: any) => item.id === `img-detail-popup-${idx + 1}` && item.active)?.url || card.url)
      );
    };
    loadImages();
  }, []);

  return (
    <section id="details" className="py-14 md:py-24 bg-[#FAFAF9]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16">
          <div>
            <p
              className="text-xs sm:text-lg md:text-2xl font-bold mb-2 uppercase tracking-widest opacity-30"
              style={{ color: "#2C2C2C", fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              Program Guide
            </p>
            <h3
              className="text-3xl sm:text-5xl md:text-6xl font-black"
              style={{
                color: "#2C2C2C",
                fontFamily: '"Noto Sans KR", sans-serif',
              }}
            >
              행사 안내
            </h3>
          </div>
          <p
            className="text-sm md:text-base lg:text-lg mt-3 md:mt-0 md:w-1/2 font-medium"
            style={{ color: "#6B6B6B", fontFamily: '"Noto Sans KR", sans-serif' }}
          >
            송도 캠핑장에서 매주 주말마다 진행되는 버스킹 공연과 플리마켓의
            상세 정보를 확인하세요.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
          {DETAIL_CARDS.map((card, index) => (
            <AnimateOnScroll key={card.badge} direction="up" delay={index * 0.1}>
              <button
                type="button"
                onClick={() => setSelectedIndex(index)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer h-full text-left w-full"
              >
                <div className="w-full h-64 overflow-hidden">
                  <img
                    alt={card.title}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                    src={cardUrls[index]}
                    loading="lazy"
                  />
                </div>
                <div className="p-8">
                  <div
                    className="inline-block px-3 py-1 rounded-full mb-4"
                    style={{ backgroundColor: "#A8D5BA" }}
                  >
                    <span className="text-xs font-bold tracking-wider text-white">
                      {card.badge}
                    </span>
                  </div>
                  <h4
                    className="text-2xl font-bold mb-3 leading-tight"
                    style={{
                      color: "#2C2C2C",
                      fontFamily: '"Noto Sans KR", sans-serif',
                    }}
                  >
                    {card.title}
                  </h4>
                  <p
                    className="text-sm"
                    style={{
                      color: "#6B6B6B",
                      fontFamily: '"Noto Sans KR", sans-serif',
                    }}
                  >
                    {card.desc}
                  </p>
                </div>
              </button>
            </AnimateOnScroll>
          ))}
        </div>
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-6"
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/75"
              aria-label="팝업 닫기"
            >
              <i className="ri-close-line text-xl" />
            </button>
            <img
              src={popupUrls[selectedIndex]}
              alt={DETAIL_CARDS[selectedIndex].title}
              className="max-h-[80vh] w-full object-contain bg-[#111]"
            />
            <div className="border-t border-gray-100 bg-white px-6 py-5">
              <h4
                className="text-2xl font-bold"
                style={{ color: "#2C2C2C", fontFamily: '"Noto Sans KR", sans-serif' }}
              >
                {DETAIL_CARDS[selectedIndex].title}
              </h4>
              <p
                className="mt-2 text-sm"
                style={{ color: "#6B6B6B", fontFamily: '"Noto Sans KR", sans-serif' }}
              >
                {DETAIL_CARDS[selectedIndex].desc}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

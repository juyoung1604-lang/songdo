"use client";

import AnimateOnScroll from "./AnimateOnScroll";
import { IMAGES } from "@/lib/constants";
import { useEffect, useState } from "react";
import { DB } from "@/lib/supabase";

const BUSKER_FEATURES = [
  { icon: "ri-music-2-line", label: "모든 장르 환영" },
  { icon: "ri-mic-line", label: "무료 음향 지원" },
  { icon: "ri-user-star-line", label: "방문객 노출" },
  { icon: "ri-money-dollar-circle-line", label: "유료 공연 기회" },
];

export default function BuskerSection() {
  const [bgImg, setBgImg] = useState(IMAGES.buskerBg);

  useEffect(() => {
    const loadImg = async () => {
      const imgs = await DB.getImages();
      const busker = imgs?.find((i: any) => i.id === "img-busker-bg" && i.active);
      if (busker?.url) setBgImg(busker.url);
    };
    loadImg();
  }, []);

  const handleApplyClick = () => {
    window.dispatchEvent(new CustomEvent("songdo:apply-type", { detail: "busker" }));
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="busker" className="relative w-full h-screen overflow-hidden">
      <div className="absolute inset-0">
        <img
          alt="버스커 모집"
          className="w-full h-full object-cover object-center"
          src={bgImg}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-white/50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/60"></div>
      </div>

      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center pb-32 md:pb-40">
        <AnimateOnScroll direction="up" className="relative mb-6 md:mb-8">
          <h3
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl md:text-9xl font-black text-[#2C2C2C] lowercase opacity-[0.03] select-none pointer-events-none whitespace-nowrap"
            style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
          >
            busker
          </h3>
          <h4
            className="relative z-10 text-3xl sm:text-5xl md:text-6xl font-black text-[#2C2C2C]"
            style={{ fontFamily: '"Noto Sans KR", sans-serif', letterSpacing: "-0.02em" }}
          >
            당신의 음악을 들려주세요
          </h4>
          <p className="text-sm sm:text-base md:text-xl text-[#4A5D3F] font-medium mt-3 md:mt-4">
            Songdo Busking Stage 2026
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll direction="up" delay={0.2} className="mb-6 md:mb-8">
          <button
            className="group flex items-center gap-3 sm:gap-4 px-8 py-4 sm:px-10 sm:py-5 bg-[#2C2C2C] rounded-full cursor-pointer whitespace-nowrap shadow-xl hover:scale-105 transition-all"
            onClick={handleApplyClick}
          >
            <span
              className="text-base sm:text-lg font-bold text-white"
              style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              버스커 신청하기
            </span>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#A8D5BA] flex items-center justify-center group-hover:rotate-45 transition-transform">
              <i className="ri-arrow-right-line text-[#2C2C2C] text-lg sm:text-xl"></i>
            </div>
          </button>
        </AnimateOnScroll>

        <AnimateOnScroll direction="up" delay={0.3}>
          <p
            className="text-[#2C2C2C] text-base sm:text-xl md:text-2xl font-bold mb-1 md:mb-2 drop-shadow-sm"
            style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
          >
            자연 속 야외 무대에서
          </p>
          <p
            className="text-[#4A5D3F] text-sm sm:text-base md:text-xl font-medium"
            style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
          >
            당신의 감성을 공유하세요
          </p>
        </AnimateOnScroll>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-white/80 to-transparent py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 text-[#2C2C2C]">
            {BUSKER_FEATURES.map((feature) => (
              <div key={feature.label} className="text-center bg-white/40 backdrop-blur-sm rounded-2xl py-4 md:py-6 border border-white/50">
                <i className={`${feature.icon} text-2xl md:text-4xl mb-2 md:mb-3 text-[#FF8B5A]`}></i>
                <p className="text-xs sm:text-sm md:text-base font-bold">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

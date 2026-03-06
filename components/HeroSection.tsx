"use client";

import { motion } from "framer-motion";
import { IMAGES } from "@/lib/constants";
import Navbar from "./Navbar";
import ScheduleModal from "./ScheduleModal";
import { useEffect, useState } from "react";
import { DB } from "@/lib/supabase";

export default function HeroSection() {
  const [heroImg, setHeroImg] = useState(IMAGES.heroBg);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const loadImg = async () => {
      const imgs = await DB.getImages();
      const hero = imgs?.find((i: any) => i.id === 'img-hero' && i.active);
      if (active && hero?.url && hero.url !== heroImg) {
        setHeroImg(hero.url);
      }
    };
    loadImg();
    return () => { active = false; };
  }, [heroImg]);

  const handleScrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleApplyClick = (type: "busker" | "seller") => {
    window.dispatchEvent(new CustomEvent("songdo:apply-type", { detail: type }));
    handleScrollTo("#contact");
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-white">
      <div className="absolute inset-0">
        <img
          alt="송도 캠핑장 버스킹 마켓"
          className={`w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          src={heroImg}
          onLoad={() => setImgLoaded(true)}
        />
        <div className={`absolute inset-0 bg-[#FAFAF9] transition-opacity duration-1000 ${imgLoaded ? 'opacity-0' : 'opacity-100'}`}></div>
        <div className="absolute inset-0 bg-black/45"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent"></div>
      </div>

      <Navbar />

      <div className="relative z-10 h-full flex items-center justify-center md:justify-start">
        <div className="max-w-7xl mx-auto px-6 w-full pt-24 sm:pt-20 md:pt-0">
          <motion.div
            className="max-w-3xl text-center md:text-left mx-auto md:mx-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p
              className="text-white/90 text-sm sm:text-xl md:text-2xl font-light mb-3 md:mb-4 drop-shadow tracking-wide"
              style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              매주 주말, 도심 속 힐링
            </p>
            <h2
              className="text-white text-[1.9rem] sm:text-5xl md:text-7xl font-black mb-1 sm:mb-2 leading-tight drop-shadow-lg tracking-tight"
              style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              송도국제캠핑장
            </h2>
            <h2
              className="text-[1.9rem] sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 leading-tight drop-shadow-lg tracking-tight"
              style={{
                fontFamily: '"Noto Sans KR", sans-serif',
                color: "#FF8B5A",
              }}
            >
              버스킹 &amp; 플리마켓
            </h2>
            <p
              className="text-white/80 text-sm sm:text-base md:text-lg font-medium mb-7 sm:mb-10 drop-shadow max-w-md sm:max-w-lg mx-auto md:mx-0"
              style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              음악이 흐르는 캠핑장, 감성 가득한 마켓에서<br className="hidden md:block" />
              특별한 주말을 만들어보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
              <button
                onClick={() => handleApplyClick("busker")}
                className="px-7 py-3 sm:px-10 sm:py-4 rounded-full font-bold text-base sm:text-lg cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-[#FF8B5A] text-white"
                style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
              >
                버스커 참가 신청
              </button>
              <button
                onClick={() => handleApplyClick("seller")}
                className="px-7 py-3 sm:px-10 sm:py-4 rounded-full border-2 border-white text-white font-bold text-base sm:text-lg cursor-pointer hover:bg-white hover:text-gray-900 transition-all bg-white/10 backdrop-blur-sm"
                style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
              >
                플리마켓 셀러 신청
              </button>
            </div>

            {/* Schedule button */}
            <motion.button
              onClick={() => setScheduleOpen(true)}
              className="mt-4 flex items-center gap-2 text-white/75 hover:text-white transition-colors mx-auto md:mx-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              <span className="flex items-center justify-center w-7 h-7 rounded-full border border-white/40 bg-white/10">
                <i className="ri-calendar-event-line text-sm" />
              </span>
              <span className="text-sm font-medium tracking-wide">행사 일정 보기</span>
              <i className="ri-arrow-right-s-line text-base opacity-60" />
            </motion.button>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          delay: 1,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        onClick={() => handleScrollTo("#about")}
      >
        <div className="flex flex-col items-center gap-2 text-white/80">
          <span className="text-xs font-medium tracking-widest uppercase">Scroll Down</span>
          <i className="ri-arrow-down-line text-2xl"></i>
        </div>
      </motion.div>

      <div className="absolute bottom-4 left-0 right-0 z-0 overflow-hidden pointer-events-none select-none">
        <div
          className="text-black font-black text-center tracking-tighter opacity-[0.03]"
          style={{
            fontSize: "clamp(36px, 10vw, 220px)",
            lineHeight: 0.8,
            fontFamily: '"Noto Sans KR", sans-serif',
          }}
        >
          EVERY WEEKEND
        </div>
      </div>

      <ScheduleModal isOpen={scheduleOpen} onClose={() => setScheduleOpen(false)} />
    </section>
  );
}

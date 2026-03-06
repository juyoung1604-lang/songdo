"use client";

import AnimateOnScroll from "./AnimateOnScroll";
import { IMAGES } from "@/lib/constants";
import { useEffect, useState } from "react";
import { DB } from "@/lib/supabase";

export default function AboutSection() {
  const [img1, setImg1] = useState(IMAGES.aboutImg1);
  const [img2, setImg2] = useState(IMAGES.aboutImg2);

  useEffect(() => {
    const loadImgs = async () => {
      const imgs = await DB.getImages();
      const a1 = imgs?.find((i: any) => i.id === "img-about-1" && i.active);
      const a2 = imgs?.find((i: any) => i.id === "img-about-2" && i.active);
      if (a1?.url) setImg1(a1.url);
      if (a2?.url) setImg2(a2.url);
    };
    loadImgs();
  }, []);

  return (
    <section id="about" className="py-14 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          <AnimateOnScroll direction="left">
            <div
              className="inline-block px-4 py-2 border rounded-full mb-5 md:mb-6"
              style={{ borderColor: "#4A5D3F", color: "#4A5D3F" }}
            >
              <span className="text-xs font-medium tracking-wider">ABOUT</span>
            </div>
            <h3
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-3"
              style={{
                color: "#2C2C2C",
                fontFamily: '"Noto Sans KR", sans-serif',
              }}
            >
              자유로운 무대와
            </h3>
            <h3
              className="text-3xl sm:text-4xl md:text-5xl font-medium mb-8 md:mb-12"
              style={{
                color: "#4A5D3F",
                fontFamily: '"Noto Sans KR", sans-serif',
              }}
            >
              열린 마켓 🎵🛍️
            </h3>
            <div
              className="space-y-4 md:space-y-6 text-sm sm:text-base md:text-lg leading-relaxed mb-6 md:mb-8"
              style={{
                color: "#6B6B6B",
                fontFamily: '"Noto Sans KR", sans-serif',
              }}
            >
              <p>
                매주 주말, 송도 캠핑장에서 버스커들의 라이브 공연과 다양한
                셀러들의 플리마켓이 열립니다.
              </p>
              <p>
                가족, 연인, 친구들과 함께 자연 속에서 음악을 즐기고, 특별한
                제품들을 만나보세요. 누구나 참여할 수 있는 열린 무대와 마켓이
                여러분을 기다립니다.
              </p>
              <p>
                <strong style={{ color: "#2C2C2C" }}>무료 공간 제공</strong>,{" "}
                <strong style={{ color: "#2C2C2C" }}>기본 음향 장비 지원</strong>
                ,{" "}
                <strong style={{ color: "#2C2C2C" }}>SNS 홍보</strong>까지 모든
                것이 준비되어 있습니다.
              </p>
            </div>
            <a
              href="#details"
              className="inline-flex items-center gap-2 font-medium underline cursor-pointer hover:opacity-70 transition-opacity"
              style={{ color: "#2C2C2C" }}
              onClick={(e) => {
                e.preventDefault();
                document
                  .querySelector("#details")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              자세히 보기 <i className="ri-arrow-right-line"></i>
            </a>
            <div className="flex gap-8 sm:gap-12 mt-8 md:mt-12">
              <div>
                <div
                  className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2"
                  style={{
                    color: "#FF8B5A",
                    fontFamily: '"Noto Sans KR", sans-serif',
                  }}
                >
                  50+
                </div>
                <div className="text-xs sm:text-sm" style={{ color: "#6B6B6B" }}>
                  참여 아티스트
                </div>
              </div>
              <div>
                <div
                  className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2"
                  style={{
                    color: "#FF8B5A",
                    fontFamily: '"Noto Sans KR", sans-serif',
                  }}
                >
                  1000+
                </div>
                <div className="text-xs sm:text-sm" style={{ color: "#6B6B6B" }}>
                  주말 방문객
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll direction="right">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-xl">
                  <img
                    alt="버스킹 공연"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    src={img1}
                    loading="lazy"
                  />
                </div>
                <div className="h-40 bg-[#A8D5BA] rounded-3xl flex items-center justify-center p-6 text-white text-center">
                  <p className="font-bold leading-tight">자연과 음악이 공존하는 특별한 무대</p>
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="h-40 bg-[#FF8B5A] rounded-3xl flex items-center justify-center p-6 text-white text-center">
                  <p className="font-bold leading-tight">나만의 취향을 찾는 감성 마켓</p>
                </div>
                <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-xl">
                  <img
                    alt="플리마켓 부스"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    src={img2}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}

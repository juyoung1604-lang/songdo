// components/SellerSection.tsx
"use client";

import { useEffect, useState } from "react";
import AnimateOnScroll from "./AnimateOnScroll";
import { SELLER_IMAGES } from "@/lib/constants";
import { DB } from "@/lib/supabase";

const SELLER_ITEMS = [
  "핸드메이드 제품",
  "라이프스타일 굿즈",
  "캠핑 관련 용품",
  "푸드 & 베버리지",
];

export default function SellerSection() {
  const [images, setImages] = useState<string[]>(SELLER_IMAGES.map(img => img.url));

  useEffect(() => {
    const loadImgs = async () => {
      const dbImgs = await DB.getImages();
      const s1 = dbImgs?.find((i: any) => i.id === 'img-seller-1' && i.active);
      const s2 = dbImgs?.find((i: any) => i.id === 'img-seller-2' && i.active);
      const s3 = dbImgs?.find((i: any) => i.id === 'img-seller-3' && i.active);
      const s4 = dbImgs?.find((i: any) => i.id === 'img-seller-4' && i.active);

      const newImgs = [...images];
      if (s1?.url) newImgs[0] = s1.url;
      if (s2?.url) newImgs[1] = s2.url;
      if (s3?.url) newImgs[2] = s3.url;
      if (s4?.url) newImgs[3] = s4.url;
      setImages(newImgs);
    };
    loadImgs();
  }, []);

  const handleApplyClick = () => {
    window.dispatchEvent(new CustomEvent("songdo:apply-type", { detail: "seller" }));
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="seller" className="grid md:grid-cols-2 md:h-screen">
      <AnimateOnScroll direction="left" className="flex items-center justify-center py-14 px-6 sm:px-8 md:py-24 md:px-12" style={{ backgroundColor: "#F0F4EF" }}>
        <div className="text-center max-w-md w-full">
          <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-8 flex items-center justify-center">
            <i className="ri-store-2-line text-[#4A5D3F] text-5xl sm:text-6xl md:text-7xl"></i>
          </div>
          <h3
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#2C2C2C] mb-3 md:mb-4"
            style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
          >
            플리마켓 셀러
          </h3>
          <p
            className="text-[#6B6B6B] text-sm sm:text-base md:text-lg mb-8 md:mb-12"
            style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
          >
            당신의 브랜드를 알릴 기회
          </p>

          <div className="space-y-3 mb-8 md:mb-12 text-left bg-white/50 p-5 sm:p-8 rounded-3xl backdrop-blur-sm border border-white">
            {SELLER_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: "#A8D5BA" }}
                >
                  <i className="ri-check-line text-white text-xs sm:text-sm"></i>
                </div>
                <span
                  className="text-[#2C2C2C] text-sm sm:text-base font-medium"
                  style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>

          <button
            className="px-8 sm:px-12 py-4 bg-[#FF8B5A] rounded-full font-bold text-base sm:text-lg text-white cursor-pointer whitespace-nowrap shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            onClick={handleApplyClick}
          >
            셀러 신청하기
          </button>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll direction="right" className="grid grid-cols-2 grid-rows-2 gap-3 p-3 bg-white md:h-full">
        {images.map((url, idx) => (
          <div
            key={idx}
            className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
          >
            <img
              alt={`플리마켓 이미지 ${idx + 1}`}
              className="absolute inset-0 w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
              src={url}
              loading="lazy"
            />
          </div>
        ))}
      </AnimateOnScroll>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import AnimateOnScroll from "./AnimateOnScroll";
import { GALLERY_ITEMS } from "@/lib/constants";
import { DB } from "@/lib/supabase";

export default function GallerySection() {
  const [urls, setUrls] = useState<string[]>(GALLERY_ITEMS.map(item => item.url));
  const [captions, setCaptions] = useState<string[]>(GALLERY_ITEMS.map(item => item.caption));

  useEffect(() => {
    const loadImgs = async () => {
      const dbImgs = await DB.getImages();
      const newUrls = GALLERY_ITEMS.map((item, idx) => {
        const found = dbImgs?.find((i: any) => i.id === `img-gallery-${idx + 1}` && i.active);
        return found?.url || item.url;
      });
      const newCaptions = GALLERY_ITEMS.map((item, idx) => {
        const found = dbImgs?.find((i: any) => i.id === `img-gallery-${idx + 1}` && i.active);
        return found?.caption || item.caption;
      });
      setUrls(newUrls);
      setCaptions(newCaptions);
    };
    loadImgs();
  }, []);

  return (
    <section className="py-14 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <AnimateOnScroll direction="up" className="text-center mb-8 md:mb-16">
          <h3
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4"
            style={{
              color: "#2C2C2C",
              fontFamily: '"Playfair Display", serif',
              fontStyle: "italic",
            }}
          >
            Weekend Vibes
          </h3>
          <p
            className="text-sm sm:text-base"
            style={{ color: "#6B6B6B", fontFamily: '"Noto Sans KR", sans-serif' }}
          >
            송도에서의 특별한 주말
          </p>
        </AnimateOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {GALLERY_ITEMS.map((item, idx) => (
            <AnimateOnScroll
              key={item.caption}
              direction="up"
              className={`relative group cursor-pointer rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 ${item.colSpan} ${item.rowSpan}`}
              style={{ minHeight: item.minHeight } as React.CSSProperties}
            >
              <img
                alt={item.caption}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                src={urls[idx]}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p
                  className="text-white text-lg font-medium p-6"
                  style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                >
                  {captions[idx]}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

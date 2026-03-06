"use client";

import { useState } from "react";
import AnimateOnScroll from "./AnimateOnScroll";
import { FAQ_ITEMS } from "@/lib/constants";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-14 md:py-24" style={{ backgroundColor: "#F5F1E8" }}>
      <div className="max-w-4xl mx-auto px-6">
        <AnimateOnScroll direction="up">
          <h3
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 md:mb-12"
            style={{ color: "#2C2C2C", fontFamily: '"Noto Sans KR", sans-serif' }}
          >
            자주 묻는 질문
          </h3>
        </AnimateOnScroll>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <AnimateOnScroll key={index} direction="up" delay={index * 0.05}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  className="w-full px-8 py-6 flex items-center justify-between cursor-pointer text-left"
                  onClick={() => toggle(index)}
                >
                  <h4
                    className="text-lg font-medium pr-4"
                    style={{
                      color: "#2C2C2C",
                      fontFamily: '"Noto Sans KR", sans-serif',
                    }}
                  >
                    {item.question}
                  </h4>
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <i
                      className="ri-add-line text-2xl transition-transform duration-300"
                      style={{
                        color: "#4A5D3F",
                        transform:
                          openIndex === index ? "rotate(45deg)" : "rotate(0deg)",
                      }}
                    ></i>
                  </div>
                </button>
                {openIndex === index && (
                  <div className="px-8 pb-6">
                    <p
                      className="text-base leading-relaxed"
                      style={{
                        color: "#6B6B6B",
                        fontFamily: '"Noto Sans KR", sans-serif',
                      }}
                    >
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

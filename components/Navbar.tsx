"use client";

import { useEffect, useState } from "react";
import { IMAGES } from "@/lib/constants";

const NAV_LINKS = [
  { label: "프로그램 소개", href: "#details" },
  { label: "버스커 모집", href: "#busker" },
  { label: "셀러 모집", href: "#seller" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      // 임계값을 20에서 50으로 높여 미세한 움직임에 따른 깜박임 방지
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 마운트 전에는 투명 배경으로 고정하여 Hydration Mismatch 방지
  const navBgClass = !mounted ? "bg-transparent py-5" : (
    scrolled || mobileMenuOpen
      ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
      : "bg-transparent py-5"
  );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out will-change-[padding,background-color] ${navBgClass}`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              alt="송도 버스킹 마켓 로고"
              className="h-10 w-auto transition-all"
              src={IMAGES.logo}
            />
            <h1
              className="font-bold text-lg text-[#2C2C2C] hidden sm:block"
              style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              송도 버스킹 마켓
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-[#2C2C2C] font-medium text-sm hover:text-[#FF8B5A] transition-colors relative group"
                style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FF8B5A] transition-all group-hover:w-full"></span>
              </button>
            ))}
            <button
              onClick={() => handleNavClick("#contact")}
              className="bg-[#2C2C2C] text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-[#FF8B5A] transition-colors shadow-lg"
              style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              참가신청
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#2C2C2C] text-2xl"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="메뉴 열기"
          >
            <i className={mobileMenuOpen ? "ri-close-line" : "ri-menu-line"}></i>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-white transition-transform duration-300 md:hidden pt-24 px-6 ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col gap-6 text-center">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-[#2C2C2C] text-xl font-medium py-2 border-b border-gray-100"
              style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => handleNavClick("#contact")}
            className="bg-[#FF8B5A] text-white py-4 rounded-xl text-lg font-bold mt-4 shadow-md"
            style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
          >
            참가 신청하기
          </button>
        </div>
      </div>
    </>
  );
}

import { IMAGES } from "@/lib/constants";

export default function Footer() {
  const quickLinks = [
    { label: "프로그램 소개", href: "/#details" },
    { label: "버스커 신청 확인", href: "/status?type=busker" },
    { label: "셀러 신청 확인", href: "/status?type=seller" },
  ];

  return (
    <footer className="relative overflow-hidden" style={{ backgroundColor: "#F0F4EF" }}>
      <div className="relative z-10 py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="col-span-2 md:col-span-1">
              <img
                alt="송도 버스킹 마켓"
                className="h-10 md:h-12 w-auto mb-3 md:mb-4"
                src={IMAGES.logo}
              />
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: "#6B6B6B",
                  fontFamily: '"Noto Sans KR", sans-serif',
                }}
              >
                매주 주말 송도 캠핑장에서
                <br />
                열리는 버스킹 공연과
                <br />
                플리마켓
              </p>
            </div>

            <div>
              <h4
                className="text-xs font-bold mb-4 tracking-wider"
                style={{ color: "#2C2C2C" }}
              >
                NEWSLETTER
              </h4>
              <div
                className="flex items-center border-b pb-2"
                style={{ borderColor: "#2C2C2C" }}
              >
                <input
                  placeholder="이메일 주소"
                  className="flex-1 bg-transparent text-[#2C2C2C] text-sm outline-none placeholder-gray-400"
                  type="email"
                  style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                />
                <button className="text-[#2C2C2C] hover:opacity-80 transition-opacity cursor-pointer">
                  <i className="ri-arrow-right-line text-xl"></i>
                </button>
              </div>
              <p
                className="text-xs mt-3"
                style={{ color: "#6B6B6B" }}
              >
                최신 소식을 받아보세요
              </p>
            </div>

            <div>
              <h4
                className="text-xs font-bold mb-4 tracking-wider"
                style={{ color: "#2C2C2C" }}
              >
                QUICK LINKS
              </h4>
              <div className="space-y-3">
                {quickLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block text-[#6B6B6B] hover:text-[#FF8B5A] transition-colors cursor-pointer"
                    style={{ fontFamily: '"Noto Sans KR", sans-serif' }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4
                className="text-xs font-bold mb-4 tracking-wider"
                style={{ color: "#2C2C2C" }}
              >
                FOLLOW US
              </h4>
              <div className="space-y-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#FF8B5A] transition-colors"
                >
                  <i className="ri-instagram-line text-xl"></i>
                  <span style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                    Instagram
                  </span>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#FF8B5A] transition-colors"
                >
                  <i className="ri-facebook-circle-line text-xl"></i>
                  <span style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                    Facebook
                  </span>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="flex items-center gap-2 text-[#6B6B6B] hover:text-[#FF8B5A] transition-colors"
                >
                  <i className="ri-youtube-line text-xl"></i>
                  <span style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
                    YouTube
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative py-8 md:py-12 overflow-hidden">
        <div
          className="text-center font-black tracking-tighter opacity-10"
          style={{
            fontSize: "clamp(40px, 10vw, 120px)",
            lineHeight: 1,
            color: "#2C2C2C",
            fontFamily: '"Noto Sans KR", sans-serif',
          }}
        >
          SONGDO MARKET
        </div>
      </div>

      <div
        className="border-t py-6"
        style={{ borderColor: "#E0E0E0" }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div
            className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
            style={{ color: "#6B6B6B" }}
          >
            <p style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
              © 2026 송도 버스킹 마켓. All rights reserved.
            </p>
            <span style={{ fontFamily: '"Noto Sans KR", sans-serif' }}>
              Powered by Readdy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

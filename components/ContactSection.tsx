// components/ContactSection.tsx
"use client";

import { useState, useEffect } from "react";
import AnimateOnScroll from "./AnimateOnScroll";
import { DB } from "@/lib/supabase";
import { useToast } from "@/components/admin/Toast";

export default function ContactSection() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    busker_deposit: 50000,
    seller_booth_fee: 30000
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "busker",
    team: "",
    genre: "어쿠스틱",
    category: "핸드메이드 공예",
    booths: "1",
    date: "",
    message: "",
  });
  const [links, setLinks] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = DB.getSystemSettings();
    setSettings(s);
  }, []);

  useEffect(() => {
    const handleApplyType = (event: Event) => {
      const nextType = (event as CustomEvent<"busker" | "seller">).detail;
      if (!nextType) return;
      setFormData((prev) => ({ ...prev, type: nextType }));
    };

    window.addEventListener("songdo:apply-type", handleApplyType as EventListener);
    return () => window.removeEventListener("songdo:apply-type", handleApplyType as EventListener);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const addLinkField = () => {
    if (links.length < 5) {
      setLinks([...links, ""]);
    }
  };

  const removeLinkField = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validLinks = links.filter(l => l.trim() !== "");
    const linksNote = validLinks.length > 0 ? `\n[SNS/링크]\n${validLinks.join('\n')}` : "";
    const fullNote = `[문의] ${formData.message}${linksNote}`;

    const calculatedFee = formData.type === 'busker' 
      ? settings.busker_deposit 
      : parseInt(formData.booths) * settings.seller_booth_fee;

    try {
      let res;
      if (formData.type === 'busker') {
        res = await DB.createBusker({
          name: formData.name,
          team: formData.team || '솔로',
          genre: formData.genre,
          phone: formData.phone,
          email: formData.email,
          event_date: formData.date,
          note: fullNote,
          status: 'pending',
          fee: calculatedFee
        });
      } else {
        res = await DB.createSeller({
          name: formData.name,
          category: formData.category,
          booths: parseInt(formData.booths),
          phone: formData.phone,
          email: formData.email,
          event_date: formData.date,
          note: fullNote,
          status: 'pending',
          fee: calculatedFee
        });
      }

      if (res.error) throw res.error;
      
      toast(`신청서가 제출되었습니다. ${formData.type === 'busker' ? '보증금' : '부스비'} ₩${calculatedFee.toLocaleString()} 입금 후 승인 처리됩니다.`, 'jade');
      
      setFormData({
        name: "", email: "", phone: "", type: "busker", team: "",
        genre: "어쿠스틱", category: "핸드메이드 공예", booths: "1",
        date: "", message: ""
      });
      setLinks([""]);
    } catch (err: any) {
      toast("제출 중 오류: " + err.message, 'rose');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    color: "#2C2C2C",
    fontFamily: '"Noto Sans KR", sans-serif',
    fontWeight: 700,
  };

  return (
    <section id="contact" className="py-14 md:py-24 bg-[#FAFAF9]">
      <div className="max-w-4xl mx-auto px-6">
        <AnimateOnScroll direction="up" className="text-center mb-10 md:mb-16">
          <div className="inline-block px-4 py-1 bg-[#FF8B5A]/10 text-[#FF8B5A] rounded-full text-sm font-bold mb-3 md:mb-4">APPLY NOW</div>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 md:mb-4 tracking-tight" style={{ color: "#2C2C2C" }}>함께 만들어가는 주말</h3>
          <p className="text-gray-500 text-sm sm:text-base md:text-lg font-medium">송도 버스킹 마켓의 주인공이 되어주세요.</p>
        </AnimateOnScroll>

        <AnimateOnScroll direction="up" delay={0.1}>
          <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-8 md:p-12 rounded-[32px] shadow-xl border border-gray-100 space-y-6 md:space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className="block text-sm mb-3" style={labelStyle}>참가 유형 *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setFormData({...formData, type: 'busker'})} className={`py-4 rounded-2xl font-bold transition-all border-2 ${formData.type === 'busker' ? 'border-[#FF8B5A] bg-[#FF8B5A] text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>🎸 버스커 신청</button>
                  <button type="button" onClick={() => setFormData({...formData, type: 'seller'})} className={`py-4 rounded-2xl font-bold transition-all border-2 ${formData.type === 'seller' ? 'border-[#FF8B5A] bg-[#FF8B5A] text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>🛍️ 셀러 신청</button>
                </div>
              </div>

              <div>
                <label style={labelStyle} className="block text-sm mb-2">성함 / 담당자명 *</label>
                <input name="name" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8B5A] transition-all" type="text" value={formData.name} onChange={handleChange} placeholder="이름을 입력하세요" />
              </div>

              <div>
                <label style={labelStyle} className="block text-sm mb-2">연락처 *</label>
                <input name="phone" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8B5A] transition-all" type="tel" value={formData.phone} onChange={handleChange} placeholder="010-0000-0000" />
              </div>

              {formData.type === 'busker' ? (
                <>
                  <div><label style={labelStyle} className="block text-sm mb-2">팀명</label><input name="team" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8B5A] transition-all" type="text" value={formData.team} onChange={handleChange} placeholder="팀명을 입력하세요" /></div>
                  <div>
                    <label style={labelStyle} className="block text-sm mb-2">활동 장르 *</label>
                    <select name="genre" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8B5A] transition-all cursor-pointer" value={formData.genre} onChange={handleChange}>
                      <option>어쿠스틱</option><option>인디 록</option><option>재즈</option><option>팝</option><option>포크</option><option>힙합</option><option>기타</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={labelStyle} className="block text-sm mb-2">판매 카테고리 *</label>
                    <select name="category" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8B5A] transition-all cursor-pointer" value={formData.category} onChange={handleChange}>
                      <option>핸드메이드 공예</option><option>빈티지 소품</option><option>독립출판</option><option>패션/의류</option><option>먹거리</option><option>기타</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle} className="block text-sm mb-2">필요 부스 개수 *</label>
                    <select name="booths" className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8B5A] transition-all cursor-pointer" value={formData.booths} onChange={handleChange}>
                      <option value="1">1개 (₩{settings.seller_booth_fee.toLocaleString()})</option>
                      <option value="2">2개 (₩{(settings.seller_booth_fee * 2).toLocaleString()})</option>
                      <option value="3">3개 (₩{(settings.seller_booth_fee * 3).toLocaleString()})</option>
                    </select>
                  </div>
                </>
              )}

              <div><label style={labelStyle} className="block text-sm mb-2">이메일 *</label><input name="email" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8B5A] transition-all" type="email" value={formData.email} onChange={handleChange} placeholder="example@mail.com" /></div>
              <div><label style={labelStyle} className="block text-sm mb-2">참가 희망 날짜 *</label><input name="date" required className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8B5A] transition-all" type="date" value={formData.date} onChange={handleChange} /></div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-3">
                  <label style={labelStyle} className="text-sm">SNS 또는 포트폴리오 링크 (최대 5개)</label>
                  {links.length < 5 && (
                    <button type="button" onClick={addLinkField} className="text-xs font-bold text-[#FF8B5A] hover:underline">+ 추가하기</button>
                  )}
                </div>
                <div className="space-y-3">
                  {links.map((link, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input className="flex-1 px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF8B5A] text-sm transition-all" type="url" value={link} onChange={(e) => handleLinkChange(idx, e.target.value)} placeholder="https://instagram.com/yourid" />
                      {links.length > 1 && (
                        <button type="button" onClick={() => removeLinkField(idx)} className="px-3 text-gray-300 hover:text-red-400 transition-colors"><i className="ri-close-circle-fill text-xl"></i></button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label style={labelStyle} className="block text-sm mb-2">소개 및 기타 문의사항</label>
                <textarea name="message" rows={4} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#FF8B5A] transition-all resize-none" value={formData.message} onChange={handleChange} placeholder="내용을 입력하세요"></textarea>
              </div>
            </div>

            {/* 예상 비용 안내 바 */}
            <div className="p-6 bg-[#FAFAF9] rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Total Amount</span>
                <span className="text-2xl font-black text-gray-900">
                  ₩{(formData.type === 'busker' ? settings.busker_deposit : parseInt(formData.booths) * settings.seller_booth_fee).toLocaleString()}
                </span>
              </div>
              <div className="text-right text-xs text-gray-400 font-medium">
                {formData.type === 'busker' ? '참가 보증금 (행사 종료 후 반환)' : `부스비 (₩${settings.seller_booth_fee.toLocaleString()} × ${formData.booths}개)`}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-5 rounded-2xl font-black text-xl cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 bg-[#FF8B5A] text-white">
              {loading ? <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <>참가 신청 완료 <i className="ri-send-plane-fill"></i></>}
            </button>
          </form>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

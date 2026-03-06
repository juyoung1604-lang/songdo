export const COLORS = {
  greenForest: "#4A5D3F",
  orangeWarm: "#FF8B5A",
  greenSoft: "#A8D5BA",
  beigeLight: "#F5F1E8",
  dark: "#2C2C2C",
  grayLight: "#6B6B6B",
  grayMuted: "#B8C5B3",
} as const;

export const IMAGES = {
  heroBg: "https://picsum.photos/seed/songdo-hero/1920/1080",
  logo: "https://public.readdy.ai/ai/img_res/45c168a6-36b7-4bad-818f-94278d7fbdd7.png",
  aboutImg1: "https://picsum.photos/seed/busker-stage/800/800",
  aboutImg2: "https://picsum.photos/seed/flea-market/800/800",
  buskerBg: "https://picsum.photos/seed/outdoor-concert/1920/1080",
} as const;

export const DETAIL_CARDS = [
  {
    badge: "SCHEDULE",
    title: "매주 토·일요일",
    desc: "14:00 - 18:00",
    url: "https://picsum.photos/seed/detail-schedule/600/400",
  },
  {
    badge: "LOCATION",
    title: "송도 국제캠핑장",
    desc: "야외 공연존 & 마켓 구역",
    url: "https://picsum.photos/seed/detail-location/600/400",
  },
  {
    badge: "SUPPORT",
    title: "무료 공간 제공",
    desc: "기본 음향장비 / SNS 홍보",
    url: "https://picsum.photos/seed/detail-support/600/400",
  },
];

export const SELLER_IMAGES = [
  {
    alt: "플리마켓 1",
    url: "https://picsum.photos/seed/seller-jewelry/500/500",
  },
  {
    alt: "플리마켓 2",
    url: "https://picsum.photos/seed/seller-goods/500/500",
  },
  {
    alt: "플리마켓 3",
    url: "https://picsum.photos/seed/seller-food/500/500",
  },
  {
    alt: "플리마켓 4",
    url: "https://picsum.photos/seed/seller-camping/500/500",
  },
];

export const GALLERY_ITEMS = [
  {
    caption: "가족과 함께하는 주말",
    url: "https://picsum.photos/seed/gallery-family/800/600",
    colSpan: "col-span-1 md:col-span-2",
    rowSpan: "row-span-1",
    minHeight: "220px",
  },
  {
    caption: "라이브 공연의 열기",
    url: "https://picsum.photos/seed/gallery-concert/600/800",
    colSpan: "col-span-1",
    rowSpan: "md:row-span-2",
    minHeight: "220px",
  },
  {
    caption: "특별한 수제 제품들",
    url: "https://picsum.photos/seed/gallery-craft/600/600",
    colSpan: "col-span-1",
    rowSpan: "row-span-1",
    minHeight: "220px",
  },
  {
    caption: "마켓에서의 만남",
    url: "https://picsum.photos/seed/gallery-market/800/600",
    colSpan: "col-span-1 md:col-span-2",
    rowSpan: "row-span-1",
    minHeight: "220px",
  },
  {
    caption: "감성적인 버스킹",
    url: "https://picsum.photos/seed/gallery-busking/600/800",
    colSpan: "col-span-1",
    rowSpan: "md:row-span-2",
    minHeight: "220px",
  },
  {
    caption: "송도 캠핑장 전경",
    url: "https://picsum.photos/seed/gallery-camping/800/600",
    colSpan: "col-span-1 md:col-span-2",
    rowSpan: "row-span-1",
    minHeight: "220px",
  },
];

export const SCHEDULE_EVENTS = [
  {
    id: 1,
    date: "2026-03-07",
    title: "봄맞이 버스킹 페스티벌",
    time: "14:00 - 18:00",
    tags: ["버스킹", "플리마켓"],
  },
  {
    id: 2,
    date: "2026-03-08",
    title: "인디밴드 라이브 공연",
    time: "15:00 - 18:00",
    tags: ["버스킹", "밴드"],
  },
  {
    id: 3,
    date: "2026-03-14",
    title: "봄 플리마켓 데이",
    time: "12:00 - 17:00",
    tags: ["플리마켓", "셀러"],
  },
  {
    id: 4,
    date: "2026-03-15",
    title: "어쿠스틱 버스킹 나이트",
    time: "15:00 - 18:00",
    tags: ["버스킹", "어쿠스틱"],
  },
  {
    id: 5,
    date: "2026-03-21",
    title: "벚꽃 버스킹 마켓",
    time: "13:00 - 18:00",
    tags: ["버스킹", "플리마켓", "봄"],
  },
  {
    id: 6,
    date: "2026-03-22",
    title: "봄 야외 음악회",
    time: "14:00 - 17:00",
    tags: ["버스킹", "클래식"],
  },
  {
    id: 7,
    date: "2026-03-28",
    title: "감성 버스킹 타임",
    time: "15:00 - 18:00",
    tags: ["버스킹"],
  },
  {
    id: 8,
    date: "2026-03-29",
    title: "주말 마켓 & 공연",
    time: "12:00 - 18:00",
    tags: ["플리마켓", "버스킹", "셀러"],
  },
  {
    id: 9,
    date: "2026-04-04",
    title: "봄 라이브 콘서트",
    time: "14:00 - 17:00",
    tags: ["버스킹", "밴드"],
  },
  {
    id: 10,
    date: "2026-04-05",
    title: "꽃 플리마켓 페어",
    time: "11:00 - 17:00",
    tags: ["플리마켓", "봄", "셀러"],
  },
  {
    id: 11,
    date: "2026-04-11",
    title: "인디음악 페스티벌",
    time: "14:00 - 18:00",
    tags: ["버스킹", "밴드"],
  },
  {
    id: 12,
    date: "2026-04-12",
    title: "봄 마켓 & 핸드메이드",
    time: "12:00 - 17:00",
    tags: ["플리마켓", "셀러"],
  },
  {
    id: 13,
    date: "2026-04-18",
    title: "어쿠스틱 오후",
    time: "14:00 - 17:00",
    tags: ["버스킹", "어쿠스틱"],
  },
  {
    id: 14,
    date: "2026-04-19",
    title: "봄 감성 버스킹",
    time: "15:00 - 18:00",
    tags: ["버스킹", "봄"],
  },
];

export const FAQ_ITEMS = [
  {
    question: "참가 비용이 있나요?",
    answer:
      "버스커와 플리마켓 셀러 모두 참가 비용이 없습니다. 무료로 공간을 제공하며, 기본 음향 장비도 지원됩니다. 다만 사전 신청 및 심사가 필요합니다.",
  },
  {
    question: "음향 장비는 제공되나요?",
    answer:
      "네, 기본적인 PA 시스템(스피커, 마이크, 믹서)을 무료로 제공합니다. 개인 악기나 앰프가 필요한 경우 직접 가져오셔야 합니다.",
  },
  {
    question: "날씨가 좋지 않으면 어떻게 되나요?",
    answer:
      "우천 시에는 행사가 취소되거나 일정이 변경될 수 있습니다. SNS 공식 채널을 통해 사전에 공지되므로 팔로우해 주세요. 일정 변경 시 개별 연락드립니다.",
  },
  {
    question: "신청 후 취소가 가능한가요?",
    answer:
      "네, 행사 3일 전까지는 취소가 가능합니다. 인스타그램 DM 또는 이메일로 연락해 주시면 됩니다. 당일 취소는 이후 참가 신청에 제한이 있을 수 있습니다.",
  },
  {
    question: "주차 공간이 있나요?",
    answer:
      "송도 국제캠핑장 내 주차장을 이용하실 수 있습니다. 주말에는 방문객이 많아 주차 공간이 부족할 수 있으므로, 대중교통 이용을 권장합니다.",
  },
  {
    question: "어떻게 신청하나요?",
    answer:
      "이 페이지 하단의 참가 신청 양식을 작성하거나, 인스타그램 DM으로 문의하시면 됩니다. 신청 후 검토를 거쳐 1~3일 내에 결과를 알려드립니다.",
  },
];

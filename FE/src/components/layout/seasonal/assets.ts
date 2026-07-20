import type { HeaderDecoration, Season, SeasonConfig } from '@/types/seasonal.type';

export const AUTUMN_ASSETS = ['/images/themes/la_thu.png'] as const;

export const HEADER_DECORATIONS: Record<Season, HeaderDecoration> = {
  spring: {
    left: '/images/themes/canhdao.png',
    right: '/images/themes/canhmai.png',
  },
  summer: {
    left: '/images/themes/summer_left.png',
    right: '/images/themes/summer.png',
  },
  autumn: {
    left: '/images/themes/cay_thu.png',
  },
  winter: {},
};

export const SLOGAN_CONFIG: Record<Season, SeasonConfig> = {
  spring: {
    text: 'Tết Đến Acc Về – Mua Là Có Lộc',
    subtext: 'Lì Xì Cực Khủng • Tài Lộc Quanh Năm',
    gradient: 'from-red-600 via-yellow-500 to-pink-500',
    dividerStart: 'to-yellow-500',
    dividerEnd: 'to-red-500',
  },
  summer: {
    text: 'Hè Cực Cháy - Quẩy Game Ngay',
    subtext: 'Ưu Đãi Nóng Bỏng • Săn Deal Cực Đã',
    gradient: 'from-orange-500 via-red-500 to-yellow-500',
    dividerStart: 'to-orange-500',
    dividerEnd: 'to-red-500',
  },
  autumn: {
    text: 'Thu Sang Mát Mẻ - Săn Sale Vui Vẻ',
    subtext: 'Acc Ngon Giá Rẻ • Chất Lượng Đỉnh Cao',
    gradient: 'from-orange-700 via-amber-500 to-yellow-600',
    dividerStart: 'to-amber-600',
    dividerEnd: 'to-orange-700',
  },
  winter: {
    text: 'Đông Ấm Áp - Tràn Ngập Quà Tặng',
    subtext: 'Sale Giáng Sinh • Deal Giảm Cực Sâu',
    gradient: 'from-blue-600 via-cyan-400 to-white',
    dividerStart: 'to-blue-400',
    dividerEnd: 'to-cyan-400',
  },
};

/**
 * Shop Information
 * Centralized shop contact and social media information
 */

export const SHOP_INFO = {
  name: 'SHOPACVN.COM',
  description: 'Dự án thương mại điện tử tài khoản game dùng cho mục đích demo',

  // Contact
  email: 'demo@example.com',
  phone: '',
  supportHours: 'Phiên bản demo',

  // Social Media
  social: {
    facebook: {
      url: '#',
      label: 'Facebook Demo',
    },
    tiktok: {
      url: '#',
      label: 'TikTok Demo',
    },
    zalo: {
      url: '#',
      qrImage: '/images/placeholder.svg',
      label: 'Zalo Demo',
    },
  },

  // Policies
  policies: [
    'Cam kết bảo hành 100% tài khoản',
    'Hỗ trợ đổi thông tin, bảo mật tài khoản',
    'Giao dịch tự động, nhanh chóng, an toàn',
    'Chính sách hoàn tiền minh bạch',
  ],
} as const;

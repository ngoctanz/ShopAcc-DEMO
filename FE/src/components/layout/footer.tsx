'use client';
import { ShieldCheck, Users } from 'lucide-react';
import { SHOP_INFO } from '@/constants/shop-info';

function Footer() {
  return (
    <footer className="z-10 bg-background text-muted-foreground text-xs md:text-sm border-t border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* --- Column 1: Logo & Description --- */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <img
            src="/images/logo.png"
            alt={SHOP_INFO.name}
            className="h-20 w-auto mx-auto mb-4 hover:scale-105 transition-transform duration-200 dark:invert drop-shadow-lg"
          />
          <p className="text-muted-foreground leading-relaxed text-[13px]">
            {SHOP_INFO.name} — {SHOP_INFO.description}
          </p>
        </div>

        {/* --- Column 2: Trust & Policy --- */}
        <div className="flex flex-col items-center mx-auto lg:mx-0 lg:items-start text-center lg:text-left">
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Uy tín & Chính sách
          </h3>
          <ul className="space-y-2 w-full">
            {SHOP_INFO.policies.map((policy, index) => (
              <li key={index} className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3f9ced]" />
                <span className="font-medium text-[13px]">{policy}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* --- Demo notice --- */}
        <div className="flex flex-col items-center justify-center text-center lg:col-span-2">
          <h3 className="text-lg md:text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Thông tin demo
          </h3>
          <p className="max-w-md leading-relaxed">
            Thông tin liên hệ và mạng xã hội đã được lược bỏ khỏi phiên bản công khai.
          </p>
          <p className="mt-2 font-bold text-primary">DEMO BY NGOCTANZ</p>
        </div>
      </div>

      {/* --- Copyright --- */}
      <div className="border-t border-border text-center text-muted-foreground/60 text-[12px] py-6">
        © 2025 {SHOP_INFO.name} — All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;

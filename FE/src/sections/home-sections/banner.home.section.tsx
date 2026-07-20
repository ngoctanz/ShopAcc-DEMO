'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import NoticeTicker from '@/components/layout/notice-ticker.marquee';
import { useSeason } from '@/contexts/season-context';
import { packageService } from '@/services/account-package.service';
import type { AccountPackage } from '@/types/index.type';
import { getMediaType } from '@/utils/media.util';
import TopRechargeDemo from './top-recharge-demo';

export default function BannerHomeSection() {
  const { season } = useSeason();
  const [packages, setPackages] = useState<AccountPackage[]>([]);
  const [bannerMedia, setBannerMedia] = useState<string>('/images/homebanner_wall.jpg');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [videoError, setVideoError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Only use video on desktop to save bandwidth and improve performance
    const videoPath = '/videos/homebanner_vd.mp4';
    const imageFallback = '/images/homebanner_wall.jpg';

    if (isMobile) {
      // Mobile: always use image
      setBannerMedia(imageFallback);
      setMediaType('image');
    } else {
      // Desktop: try video
      const type = getMediaType(videoPath);
      if (type === 'video') {
        setBannerMedia(videoPath);
        setMediaType('video');
      } else {
        setBannerMedia(imageFallback);
        setMediaType('image');
      }
    }
  }, [isMobile]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const data = await packageService.getAllPackages();
        setPackages(data.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch packages:', error);
      }
    };

    fetchPackages();
  }, []);

  const handleVideoError = () => {
    setVideoError(true);
    setBannerMedia('/images/homebanner_wall.jpg');
    setMediaType('image');
  };

  return (
    <div className="w-full flex flex-col items-center pt-8">
      <div className="w-full max-w-[1300px] px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Hero Section: Banner + Top Recharge */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Banner */}
          <div className="md:col-span-7 lg:col-span-8">
            <div
              className={`relative w-full aspect-[2/1] md:aspect-auto md:h-full rounded-lg overflow-hidden shadow-lg ${
                season === 'spring' ? 'border-2 border-[#FFD700]' : 'border border-border'
              }`}
            >
              {mediaType === 'video' && !videoError ? (
                <video
                  src={bannerMedia}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onError={handleVideoError}
                  className="w-full h-full object-cover"
                  style={{
                    willChange: 'auto',
                    transform: 'translateZ(0)',
                  }}
                  // Lazy load video on mobile to save bandwidth
                  {...(typeof window !== 'undefined' && window.innerWidth < 768
                    ? { poster: '/images/homebanner_wall.jpg' }
                    : {})}
                />
              ) : (
                <Image
                  src={bannerMedia}
                  alt="Main Banner"
                  fill
                  className="object-cover"
                  priority
                  quality={85}
                />
              )}
            </div>
          </div>

          {/* Right Top Recharge */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col">
            <TopRechargeDemo />
          </div>
        </div>

        {/* Notification/Info Area */}
     
        {/* Scrolling Banner */}
        <NoticeTicker />
      </div>
    </div>
  );
}

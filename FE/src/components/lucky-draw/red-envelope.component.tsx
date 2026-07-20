"use client";

import type { Account, AccountPackage } from "@/types/index.type";

interface RedEnvelopeProps {
  pkg: AccountPackage;
  isOpening: boolean;
  showResult: boolean;
  resultAccount: Account | null;
  onOpen: () => void;
  onCardClick: () => void;
  variant?: "spring" | "default";
}

export default function RedEnvelope({
  pkg,
  isOpening,
  showResult,
  resultAccount,
  onOpen,
  onCardClick,
  variant = "spring",
}: RedEnvelopeProps) {
  const isSpring = variant === "spring";

  // Theme configuration
  const theme = {
    backGradient: isSpring
      ? "from-[#D90429] via-[#EF233C] to-[#8D0801]"
      : "from-blue-600 via-indigo-600 to-slate-900",
    borderColor: isSpring ? "border-[#FFD700]" : "border-cyan-400",
    shadowColor: isSpring ? "rgba(220,38,38,0.8)" : "rgba(79, 70, 229, 0.6)",
    cardBorder: isSpring ? "border-[#FFD700]/30" : "border-cyan-400/30",
    frontGradient: isSpring
      ? "from-[#EF233C] to-[#D90429]"
      : "from-indigo-600 to-blue-700",
    accentColor: isSpring ? "#FFD700" : "#22d3ee", // Gold vs Cyan
    flapGradient: isSpring
      ? "linear-gradient(180deg, #EF233C 0%, #D90429 100%)"
      : "linear-gradient(180deg, #6366f1 0%, #3b82f6 100%)",
    buttonGradient: isSpring
      ? "from-[#FFD700] via-[#FDB913] to-[#FFD700]"
      : "from-cyan-400 via-cyan-300 to-cyan-400",
    buttonText: isSpring ? "text-[#8D0801]" : "text-slate-900",
  };

  return (
    <div className="relative w-[300px] h-[500px] sm:w-[340px] sm:h-[600px] perspective-1000 group">
      {/* ENVELOPE BODY */}
      <div
        className="relative w-full h-full transition-all duration-500 will-change-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* 1. LAYER: Back - Enhanced with pattern */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${theme.backGradient} rounded-3xl shadow-[0_20px_60px_-10px_${theme.shadowColor}] border-[4px] ${theme.borderColor} overflow-hidden`}
        >
          {/* Decorative Pattern Overlay */}
          <div className="absolute inset-0 opacity-20">
            <div
              className={`absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,${
                isSpring ? "rgba(255,215,0,0.1)" : "rgba(34,211,238,0.1)"
              }_10px,${
                isSpring ? "rgba(255,215,0,0.1)" : "rgba(34,211,238,0.1)"
              }_20px)]`}
            />
          </div>
          {/* Corner Decorations */}
          <div
            className={`absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 ${
              isSpring ? "border-[#FFD700]/60" : "border-cyan-400/60"
            } rounded-tl-lg`}
          />
          <div
            className={`absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 ${
              isSpring ? "border-[#FFD700]/60" : "border-cyan-400/60"
            } rounded-tr-lg`}
          />
          <div
            className={`absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 ${
              isSpring ? "border-[#FFD700]/60" : "border-cyan-400/60"
            } rounded-bl-lg`}
          />
          <div
            className={`absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 ${
              isSpring ? "border-[#FFD700]/60" : "border-cyan-400/60"
            } rounded-br-lg`}
          />
        </div>

        {/* 2. LAYER: The Card */}
        <div
          className={`absolute left-4 right-4 bottom-4 h-[60%] bg-gradient-to-b from-[#FFFBF0] to-[#FFF5E6] rounded-2xl shadow-2xl flex flex-col items-center justify-start p-4 pt-6 text-center transition-all ease-in-out z-10 box-border border-2 ${
            theme.cardBorder
          }
            ${
              isOpening
                ? "duration-[2000ms] delay-[600ms] -translate-y-[95%]"
                : "translate-y-0"
            }
            ${
              showResult && resultAccount
                ? "cursor-pointer hover:shadow-[0_10px_40px_rgba(255,215,0,0.5)] hover:scale-[1.02]"
                : ""
            }
          `}
          onClick={onCardClick}
        >
          <div className="w-full border-b-2 border-dashed border-red-300 pb-2 mb-2">
            <p className="text-red-600 font-extrabold text-lg uppercase tracking-wider drop-shadow-sm">
              {showResult ? "Chúc Mừng" : "Đang Mở..."}
            </p>
          </div>
          <div className="w-full rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 overflow-hidden p-3 mb-2 border border-orange-200/50">
            {showResult && resultAccount ? (
              <div className="w-full flex flex-col items-center animate-fade-in">
                <div className="relative w-full h-24 mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/system_notification/success.jpg"
                    className="w-full h-full object-contain rounded-lg drop-shadow-md"
                    alt="Success"
                  />
                </div>
                <p className="text-sm font-bold text-gray-800 line-clamp-1">
                  Mã: {resultAccount.code}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-2 relative">
                <div className="w-full h-20 mb-1 flex items-center justify-center">
                  {pkg.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={pkg.image}
                      className="max-h-full max-w-full object-contain opacity-70 blur-[2px]"
                      alt="Pkg"
                    />
                  ) : (
                    <span className="text-5xl animate-bounce-slow">💰</span>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="w-full mt-auto pt-2 flex items-center justify-center">
            {showResult && resultAccount ? (
              <span className="bg-gradient-to-b from-red-600 to-red-700 text-white text-xs font-bold py-2 px-4 rounded-full shadow-md border border-red-400/50">
                👆 XEM CHI TIẾT
              </span>
            ) : (
              <div className="h-6 w-6 rounded-full border-2 border-red-200 border-t-red-600 animate-spin" />
            )}
          </div>
        </div>

        {/* 3. LAYER: Front Pocket - Enhanced Design */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-[80%] z-20 rounded-b-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.4)] overflow-hidden pointer-events-none bg-gradient-to-b ${theme.frontGradient} border-[4px] ${theme.borderColor} border-t-0`}
        >
          {/* Pattern Texture */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]" />

          {/* Gold Decorative Lines */}
          <div
            className={`absolute top-0 left-0 right-0 h-12 border-b-2 ${
              isSpring ? "border-[#FFD700]/40" : "border-cyan-400/40"
            }`}
          />
          <div
            className={`absolute bottom-8 left-8 right-8 border-2 ${
              isSpring ? "border-[#FFD700]/40" : "border-cyan-400/40"
            } rounded-2xl h-[75%]`}
          />

          {/* Central Emblem - More Prominent */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            {/* Outer Glow Ring */}
            <div
              className={`absolute w-40 h-40 rounded-full ${
                isSpring ? "bg-[#FFD700]/20" : "bg-cyan-400/20"
              } blur-2xl animate-pulse`}
            />

            {/* Main Circle */}
            <div
              className={`relative w-32 h-32 rounded-full border-[5px] ${
                theme.borderColor
              } flex items-center justify-center ${
                isSpring
                  ? "bg-gradient-to-br from-[#D90429] to-[#8D0801]"
                  : "bg-gradient-to-br from-indigo-800 to-slate-900"
              } shadow-[0_0_30px_${
                isSpring ? "rgba(255,215,0,0.5)" : "rgba(34,211,238,0.5)"
              }] mb-3`}
            >
              <div
                className={`w-28 h-28 rounded-full border-[3px] ${
                  isSpring ? "border-[#FFD700]/60" : "border-cyan-400/60"
                } border-dashed flex items-center justify-center ${
                  isSpring
                    ? "bg-gradient-to-br from-[#EF233C] to-[#D90429]"
                    : "bg-gradient-to-br from-indigo-700 to-blue-800"
                }`}
              >
                {isSpring ? (
                  <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] via-[#FDB913] to-[#FFD700] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] font-serif">
                    LỘC
                  </span>
                ) : (
                  <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 via-white to-cyan-300 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    ?
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Badge */}
            <div
              className={`${
                isSpring
                  ? "bg-gradient-to-b from-[#FFD700] to-[#FDB913]"
                  : "bg-gradient-to-b from-cyan-400 to-cyan-600"
              } backdrop-blur-sm px-5 py-2 rounded-full border-2 border-white/40 shadow-lg`}
            >
              <p
                className={`${theme.buttonText} font-black tracking-[0.3em] text-sm whitespace-nowrap drop-shadow-sm`}
              >
                {isSpring ? "PHÁT TÀI" : "MYSTERY"}
              </p>
            </div>
          </div>
        </div>

        {/* 4. LAYER: Top Flap - Inspired by SpringTopRecharge */}
        <div
          className={`absolute top-0 left-0 right-0 h-[28%] z-30 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] origin-top cursor-pointer
            ${
              isOpening
                ? "rotate-x-180 z-0 opacity-0 pointer-events-none"
                : "rotate-x-0"
            } 
            hover:brightness-110
          `}
          style={{
            transformStyle: "preserve-3d",
            background: theme.flapGradient,
            borderRadius: "0 0 50% 50%",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          }}
          onClick={onOpen}
        >
          {/* Pattern on Flap */}
          <div
            className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] pointer-events-none"
            style={{ borderRadius: "0 0 50% 50%" }}
          />

          {/* Gold Border on Flap */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[${theme.accentColor}] to-transparent`}
          />

          {/* The "Seal" Button - Enhanced Golden Coin */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-40">
            <div className="relative group/seal">
              {/* Outer Glow */}
              <div
                className={`absolute inset-0 w-20 h-20 rounded-full ${
                  isSpring ? "bg-[#FFD700]/40" : "bg-cyan-400/40"
                } blur-xl animate-pulse`}
              />

              {/* Coin */}
              <div
                className={`relative w-20 h-20 rounded-full bg-gradient-to-b ${
                  theme.buttonGradient
                } shadow-[0_6px_20px_rgba(0,0,0,0.5)] border-[3px] border-white/60 flex items-center justify-center transform transition-all group-hover/seal:scale-110 group-hover/seal:rotate-12 group-hover/seal:shadow-[0_8px_30px_${
                  isSpring ? "rgba(255,215,0,0.8)" : "rgba(34,211,238,0.8)"
                }]`}
              >
                <div
                  className={`w-16 h-16 rounded-full border-2 ${
                    isSpring ? "border-[#8D0801]/30" : "border-slate-900/10"
                  } flex items-center justify-center bg-gradient-to-br ${
                    theme.buttonGradient
                  }`}
                >
                  <span
                    className={`${theme.buttonText} font-black text-2xl drop-shadow-sm`}
                  >
                    {isSpring ? "MỞ" : "OPEN"}
                  </span>
                </div>
              </div>

              {/* Pulse Ring */}
              <div
                className={`absolute inset-0 rounded-full border-4 ${theme.borderColor} animate-ping opacity-0 group-hover/seal:opacity-75`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Shadow underneath */}
      <div className="absolute -bottom-10 left-10 right-10 h-8 bg-gradient-to-r from-transparent via-black/50 to-transparent blur-2xl rounded-full" />

      <style jsx>{`
        .rotate-x-180 {
          transform: rotateX(180deg);
        }
        .rotate-x-0 {
          transform: rotateX(0deg);
        }
        .perspective-1000 {
          perspective: 1200px;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}

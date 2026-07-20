export default function TopRechargeDemo() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border-[3px] border-[#FFE66D] bg-gradient-to-br from-[#0077BE] via-[#00A8E8] to-[#00D9FF] shadow-[0_10px_40px_-10px_rgba(0,119,190,0.6)]">
      <div className="relative z-10 pb-2 pt-5 text-center">
        <h3 className="flex flex-col items-center text-xl font-black uppercase text-white drop-shadow">
          <span className="mb-1 rounded-full bg-white/20 px-3 py-0.5 text-xs tracking-[0.2em] text-[#FFE66D]">
            DỮ LIỆU DEMO
          </span>
          TOP NẠP THÁNG {new Date().getMonth() + 1}
        </h3>
      </div>

      <div className="relative z-10 flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-1 flex-col gap-3 rounded-xl border border-white/30 bg-white/10 p-3 backdrop-blur-md">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex animate-pulse items-center justify-between rounded-lg border border-white/30 bg-white/20 p-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full border-2 border-white/50 bg-[#FFE66D]/50 text-sm font-bold text-[#0077BE]">
                  {index + 1}
                </span>
                <span className="h-4 w-20 rounded bg-white/30" />
              </div>
              <span className="h-5 w-16 rounded bg-[#FFE66D]/30" />
            </div>
          ))}
        </div>

        <div className="w-full rounded-full border-2 border-white/40 bg-linear-to-r from-[#FFE66D] to-[#FFAB00] py-3 text-center font-black uppercase tracking-wider text-[#0077BE] shadow-[0_4px_0_#cc8800]">
          Bảng vinh danh tháng này
        </div>
      </div>
    </div>
  );
}

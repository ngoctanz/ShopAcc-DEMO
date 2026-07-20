import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden font-sans py-10 px-4">
      {/* Background Image - High Quality, No Blur */}
      <div className="absolute inset-0 z-0">
        <Image src="/images/bg_auth.jpg" alt="Background" fill className="object-cover" priority />
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Main Container - The "Box" Design */}
      <div className="relative z-10 w-full max-w-4xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* Left Side: Branding Panel */}
        <div className="hidden md:flex flex-col justify-between w-1/2 p-12 bg-gradient-to-br from-blue-900/40 to-black/20 relative overflow-hidden">
          {/* Abstract Shapes/Glows */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-1 bg-blue-500 rounded-full" />
              <span className="text-blue-400 font-bold tracking-widest text-xs uppercase">
                Welcome Back
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">
              ENTER THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                ARENA
              </span>
            </h1>
          </div>

          <div className="relative z-10 text-gray-300 space-y-6">
            <p className="font-medium text-lg leading-relaxed">
              "Kho tàng tài khoản game đỉnh cao đang chờ bạn khám phá."
            </p>

            {/* Mini features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-blue-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Bảo mật tuyệt đối</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-indigo-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <span className="text-sm font-medium">Giao dịch 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Area */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center bg-transparent">
          {children}
        </div>
      </div>
    </div>
  );
}

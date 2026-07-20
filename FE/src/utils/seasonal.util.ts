import type { Season } from "@/types/seasonal.type";

export function getSeason(): Season {
  const month = new Date().getMonth() + 1;

  // Xuân: Tháng 1-3 (Tết Nguyên Đán)
  if (month >= 1 && month <= 3) return "spring";
  // Hè: Tháng 4-7
  if (month >= 4 && month <= 7) return "summer";
  // Thu: Tháng 8-10
  if (month >= 8 && month <= 10) return "autumn";
  // Đông: Tháng 11-12
  return "winter";
}

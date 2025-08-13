export const OTP_TTL_SEC = 300;       // 5분
export const OTP_COOLDOWN_SEC = 60;   // 재발급 60초 제한
export const DAILY_TOKEN_MAX = 1;     // 1일 1회 발급
export const PREFILL_URL =
  "https://docs.google.com/forms/d/e/FORM_ID/viewform?usp=pp_url&entry.123456789="; // ← FORM_ID / entry.* 교체

export const endOfDay = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

export const gen6 = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const genToken = (kakaoId: string) => {
  // 간단 토큰 (프로덕션은 crypto.randomUUID + HMAC 권장)
  return (
    (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`)
      .toString()
      .replace(/-/g, "") + kakaoId.slice(0, 6)
  );
};


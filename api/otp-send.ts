import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../lib/db";
import { reply } from "../lib/reply";
import { OTP_TTL_SEC, OTP_COOLDOWN_SEC, gen6 } from "../lib/utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const kakaoId = req.body?.userRequest?.user?.id as string | undefined;
    if (!kakaoId) return res.json(reply("사용자 식별 실패. 다시 시도해 주세요."));

    // 동의 처리(동의 블록 뒤에서 호출된다고 가정)
    await supabase.from("users").upsert({
      kakao_user_id: kakaoId,
      consent_at: new Date().toISOString(),
    });

    // 쿨다운 확인
    const { data: last } = await supabase
      .from("otps")
      .select("issued_at")
      .eq("kakao_user_id", kakaoId)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (last) {
      const diff = (Date.now() - new Date(last.issued_at).getTime()) / 1000;
      if (diff < OTP_COOLDOWN_SEC) {
        return res.json(
          reply(`인증번호 재발급은 ${Math.ceil(OTP_COOLDOWN_SEC - diff)}초 후 가능합니다.`)
        );
      }
    }

    // OTP 발급 (채널 메시지로 바로 안내)
    const otp = gen6();
    const expiresAt = new Date(Date.now() + OTP_TTL_SEC * 1000).toISOString();

    await supabase.from("otps").insert({
      kakao_user_id: kakaoId,
      otp,
      expires_at: expiresAt,
    });

    return res.json(
      reply(`인증번호: ${otp}\n(유효시간: ${OTP_TTL_SEC / 60}분)\n채팅창에 6자리 코드를 입력하세요.`)
    );
  } catch (e) {
    return res.json(reply("일시적 오류입니다. 잠시 후 다시 시도해 주세요."));
  }
}


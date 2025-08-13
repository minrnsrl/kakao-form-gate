import type { VercelRequest, VercelResponse } from "@vercel/node";
import { supabase } from "../lib/db";
import { reply } from "../lib/reply";
import { DAILY_TOKEN_MAX, PREFILL_URL, endOfDay, genToken } from "../lib/utils";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const kakaoId = req.body?.userRequest?.user?.id as string | undefined;
    const utter = (req.body?.userRequest?.utterance || "").trim();
    if (!kakaoId) return res.json(reply("사용자 식별 실패."));
    if (!/^\d{6}$/.test(utter)) return res.json(reply("6자리 인증번호를 입력해 주세요. 예) 123456"));

    // 최신 OTP 조회
    const { data: row } = await supabase
      .from("otps")
      .select("*")
      .eq("kakao_user_id", kakaoId)
      .order("id", { ascending: false })
      .limit(1)
      .single();

    if (!row) return res.json(reply("발급된 인증번호가 없습니다. '인증 시작'으로 발급해 주세요."));
    if (new Date() > new Date(row.expires_at))
      return res.json(reply("인증번호가 만료되었습니다. '인증 시작'으로 재발급해 주세요."));
    if (row.otp !== utter) return res.json(reply("인증번호가 일치하지 않습니다. 다시 입력해 주세요."));

    // 오늘 발급 횟수 제한
    const today = new Date(); today.setHours(0,0,0,0);
    const { count } = await supabase
      .from("tokens")
      .select("*", { count: "exact", head: true })
      .eq("kakao_user_id", kakaoId)
      .gte("issued_at", today.toISOString());

    if ((count ?? 0) >= DAILY_TOKEN_MAX) {
      return res.json(reply("하루에 한 번만 발급됩니다. 내일 다시 시도해 주세요."));
    }

    // 토큰 발급
    const token = genToken(kakaoId);
    await supabase.from("tokens").insert({
      kakao_user_id: kakaoId,
      token,
      expires_at: endOfDay().toISOString(),
    });

    return res.json(reply(`인증 완료!\n설문 링크: ${PREFILL_URL}${token}\n(오늘 자정까지 유효)`));
  } catch {
    return res.json(reply("일시적 오류입니다. 잠시 후 다시 시도해 주세요."));
  }
}


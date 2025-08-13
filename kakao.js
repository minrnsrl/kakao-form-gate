export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = req.body || {};
    const userMsg = body?.userRequest?.utterance ?? "";

    const responseMsg = `당신이 말한 것은: ${userMsg}`;

    return res.status(200).json({
      version: "2.0",
      template: {
        outputs: [{ simpleText: { text: responseMsg } }],
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(200).json({
      version: "2.0",
      template: {
        outputs: [{ simpleText: { text: "서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요." } }],
      },
    });
  }
}

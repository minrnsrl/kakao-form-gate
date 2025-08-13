export function reply(text: string) {
  return {
    version: "2.0",
    template: {
      outputs: [{ simpleText: { text } }],
      quickReplies: [{ action: "message", label: "인증 시작", messageText: "인증 시작" }],
    },
  };
}


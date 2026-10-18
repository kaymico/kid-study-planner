/// <reference path="../pb_data/types.d.ts" />
// 小書包的 AI 整理：網站把指令（和照片）送到這裡，NAS 用自己的金鑰去問 Claude，再把文字回傳。
// 金鑰只放在 NAS 的環境變數 ANTHROPIC_API_KEY，不會出現在手機或網站裡。
routerAdd("POST", "/api/kp/ai", (c) => {
  const body = $apis.requestInfo(c).data || {};
  const key = $os.getenv("ANTHROPIC_API_KEY");
  if (!key) return c.json(503, { message: "NAS 還沒有設定 ANTHROPIC_API_KEY" });
  if (body.ping) return c.json(200, { ok: true });

  const content = [];
  const images = Array.isArray(body.images) ? body.images.slice(0, 3) : [];
  for (const img of images) {
    if (img && img.data && /^image\/(jpeg|png|webp|gif)$/.test(img.type || "")) {
      content.push({ type: "image", source: { type: "base64", media_type: img.type, data: img.data } });
    }
  }
  content.push({ type: "text", text: String(body.prompt || "").slice(0, 60000) });

  const res = $http.send({
    url: "https://api.anthropic.com/v1/messages",
    method: "POST",
    timeout: 180,
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "server-side-fallback-2026-07-01",
    },
    body: JSON.stringify({
      model: $os.getenv("KP_MODEL") || "claude-opus-5-5",
      max_tokens: 16000,
      fallbacks: "default",
      output_config: { effort: "medium" },
      messages: [{ role: "user", content: content }],
    }),
  });

  if (res.statusCode !== 200) {
    return c.json(502, { message: "AI 服務回覆錯誤（" + res.statusCode + "）", detail: String(res.raw || "").slice(0, 500) });
  }
  const msg = res.json || {};
  if (msg.stop_reason === "refusal") return c.json(422, { message: "AI 這次不願意回答，換個說法再試試" });
  const text = (msg.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
  return c.json(200, { text: text });
}, $apis.requireRecordAuth("users"));

module.exports = function handler(_request, response) {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) return response.status(503).json({ error: "Application configuration is incomplete" });

  response.setHeader("Cache-Control", "no-store");
  return response.status(200).json({
    supabaseUrl,
    pixCopyAndPaste: process.env.PIX_COPY_AND_PASTE ?? "",
    pixQrCodeUrl: process.env.PIX_QR_CODE_URL ?? "",
  });
};

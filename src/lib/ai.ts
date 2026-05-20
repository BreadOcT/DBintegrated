export async function parseReceiptWithAI(ocrRawText: string) {
  try {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error("API Key DeepSeek belum disetting di .env");

    const systemPrompt = `Kamu adalah ekstraktor data JSON.
    Tugas: Ubah teks OCR berantakan dari struk belanja ini menjadi format JSON.
    Wajib format ini persis:
    {
      "storeName": "Nama toko",
      "date": "YYYY-MM-DD",
      "totalAmount": 0,
      "items": [ { "name": "nama barang", "qty": 1, "price": 0 } ]
    }`;

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", // Gunakan deepseek-chat yang murah dan super cepat
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Ekstrak teks ini:\n\n${ocrRawText}` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });

    if (!response.ok) throw new Error("Gagal menghubungi DeepSeek API");

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content.trim());

  } catch (error) {
    console.error("AI Parsing Error:", error);
    throw error;
  }
}
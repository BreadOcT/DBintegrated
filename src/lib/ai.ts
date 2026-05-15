import { GoogleGenAI, Type } from "@google/genai";

export async function parseReceiptWithAI(base64Image: string, mimeType: string) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        "Ekstrak data dari nota/struk ini ke dalam format JSON. Jika ini bukan struk atau tidak jelas, hasilkan field yang kosong atau null.",
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            storeName: {
              type: Type.STRING,
              description: "Nama toko atau penjual jika ada.",
            },
            date: {
              type: Type.STRING,
              description: "Tanggal transaksi dalam format YYYY-MM-DD. Kosongkan jika tidak ada.",
            },
            totalAmount: {
              type: Type.NUMBER,
              description: "Total harga belanjaan secara keseluruhan (angka saja).",
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: "Nama barang atau jasa.",
                  },
                  qty: {
                    type: Type.NUMBER,
                    description: "Kuantitas atau jumlah barang. Jika tidak spesifik, beri 1.",
                  },
                  price: {
                    type: Type.NUMBER,
                    description: "Harga total per baris item (subtotal barang tersebut).",
                  }
                },
                required: ["name", "price"]
              },
              description: "Daftar barang belanja. Jika tidak terlihat rinci, cukup beri satu item mewakili nota.",
            }
          },
          required: ["totalAmount"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Respon kosong");
    }

    const parsed = JSON.parse(response.text.trim());
    return parsed;
  } catch (error) {
    console.error("Gagal parsing nota dengan AI:", error);
    throw error;
  }
}
